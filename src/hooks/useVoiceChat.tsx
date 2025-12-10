import { useState, useEffect, useRef } from "react";

import Peer from "peerjs";
import type { MediaConnection } from "peerjs";

import { voiceSocket } from "../services/voiceSocket";


export interface Participant {
  peerId: string;
  username: string;
  talking?: boolean;
}

export function useVoiceChat(roomId: string, username: string) {
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [isTalking, setIsTalking] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const peerRef = useRef<Peer | null>(null);
  const peers = useRef<Record<string, MediaConnection>>({});

  /* ============================================================
      INITIALIZE MICROPHONE + PEERJS + SOCKET.IO
  ============================================================ */
  useEffect(() => {
    let cancelled = false;

    if (!voiceSocket.connected) voiceSocket.connect();

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (cancelled) return;
      setMyStream(stream);

      /* ---- ANALYZER: detect my voice ---- */
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      const src = ctx.createMediaStreamSource(stream);
      analyser.fftSize = 512;
      src.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      const detectMyVoice = () => {
        analyser.getByteFrequencyData(data);
        const volume = data.reduce((a, b) => a + b, 0) / data.length;
        setIsTalking(volume > 25);
        requestAnimationFrame(detectMyVoice);
      };

      detectMyVoice();

      /* ============================================================
          INIT PEERJS CLIENT
      ============================================================ */
      if (!peerRef.current) {
        const peer = new Peer({
          host: import.meta.env.VITE_PEER_HOST,
          port: Number(import.meta.env.VITE_PEER_PORT),
          secure: import.meta.env.VITE_PEER_SECURE === "true",
          path: "/peerjs",
          config: {
            iceServers: [
              { urls: import.meta.env.VITE_STUN },
              { urls: import.meta.env.VITE_ICE },
            ],
          },
        });

        peerRef.current = peer;

        peer.on("open", (peerId: string) => {
          voiceSocket.emit("join-voice-room", {
            roomId,
            peerId,
            username,
          });
        });

        /* ---- Incoming Call ---- */
        peer.on("call", (call: MediaConnection) => {
          call.answer(stream);

          call.on("stream", (userStream: MediaStream) => {
            addAudio(userStream, call.peer);
          });

          peers.current[call.peer] = call;
        });
      }

      /* ============================================================
          SOCKET EVENTS
      ============================================================ */

      voiceSocket.on("voice-room-users", (users: Participant[]) => {
        setParticipants(users);
      });

      const handleUserConnected = (data: Participant) => {
        setParticipants((prev) => [...prev, data]);

        setTimeout(() => {
          connectToNewUser(data.peerId, stream);
        }, 400);
      };

      const handleUserDisconnected = (peerId: string) => {
        setParticipants((prev) => prev.filter((p) => p.peerId !== peerId));

        if (peers.current[peerId]) {
          peers.current[peerId].close();
          delete peers.current[peerId];
        }
      };

      voiceSocket.on("user-connected", handleUserConnected);
      voiceSocket.on("user-disconnected", handleUserDisconnected);

      /* ============================================================
          CLEANUP
      ============================================================ */
      return () => {
        cancelled = true;

        voiceSocket.off("user-connected", handleUserConnected);
        voiceSocket.off("user-disconnected", handleUserDisconnected);

        Object.values(peers.current).forEach((c) => c.close());
        peers.current = {};

        if (peerRef.current) {
          peerRef.current.destroy();
          peerRef.current = null;
        }

        stream.getTracks().forEach((t) => t.stop());
      };
    });
  }, []);

  /* ============================================================
      CONNECT TO NEW USER (Outgoing call)
  ============================================================ */
  const connectToNewUser = (peerId: string, streamOverride?: MediaStream) => {
    const stream = streamOverride || myStream;
    if (!stream || !peerRef.current) return;

    const call: MediaConnection = peerRef.current.call(peerId, stream);

    call.on("stream", (userStream: MediaStream) => {
      addAudio(userStream, call.peer);
    });

    peers.current[peerId] = call;
  };

  /* ============================================================
      ADD INCOMING AUDIO STREAM + DETECT VOICE
  ============================================================ */
  const addAudio = (stream: MediaStream, peerId?: string) => {
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.autoplay = true;

    if (!peerId) return;

    const ctx = new AudioContext();
    const analyser = ctx.createAnalyser();
    const src = ctx.createMediaStreamSource(stream);

    analyser.fftSize = 256;
    src.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);

    const detectVoice = () => {
      analyser.getByteFrequencyData(data);
      const volume = data.reduce((a, b) => a + b, 0) / data.length;

      setParticipants((prev) =>
        prev.map((p) =>
          p.peerId === peerId ? { ...p, talking: volume > 20 } : p
        )
      );

      requestAnimationFrame(detectVoice);
    };

    detectVoice();
  };

  /* ============================================================
      END CALL
  ============================================================ */
  const endCall = () => {
    if (myStream) myStream.getTracks().forEach((t) => t.stop());

    Object.values(peers.current).forEach((c) => c.close());
    peers.current = {};

    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (voiceSocket.connected) voiceSocket.disconnect();
  };

  return {
    myStream,
    isTalking,
    participants,
    connectToNewUser,
    endCall,
    peerRef,
  };
}

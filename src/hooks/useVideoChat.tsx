import { useEffect, useRef, useState } from "react";
import Peer from "peerjs";
import { videoSocket } from "../services/videoSocket";

// Custom hook that manages video chat logic using PeerJS and Socket.IO
export function useVideoChat(roomId: string) {
  // Local media stream (camera or fake stream)
  const [myStream, setMyStream] = useState<MediaStream | null>(null);

  // Remote users' media streams mapped by peerId
  const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({});

  // Reference to the PeerJS instance
  const peerRef = useRef<any>(null);

  // Active peer connections mapped by peerId
  const peers = useRef<{ [key: string]: any }>({});

  // ------------------------------------------------
  // CREATE A FAKE VIDEO STREAM (CANVAS VIDEO TRACK)
  // Used when no camera is available
  // ------------------------------------------------
  const createFakeVideoStream = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Capture canvas as a MediaStream at 10 FPS
    const fakeStream = canvas.captureStream(10);
    return fakeStream;
  };

  useEffect(() => {
    let cancelled = false;

    // Ensure socket connection
    if (!videoSocket.connected) videoSocket.connect();

    (async () => {
      let stream: MediaStream | null = null;

      // ------------------------------
      // TRY TO ACCESS USER CAMERA
      // ------------------------------
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      } catch (err) {
        // Fallback when no camera is available
        console.warn("⚠ No camera available. Using fake video stream.");
      }

      // If no real camera stream, create a fake one
      if (!stream) {
        stream = createFakeVideoStream();
      }

      if (cancelled) return;

      // Store local stream
      setMyStream(stream);

      // ------------------------------------------------
      // INITIALIZE PEERJS CONNECTION
      // ------------------------------------------------
      const peer = new Peer({
        host: import.meta.env.VITE_PEER_HOST,
        port: Number(import.meta.env.VITE_PEER_PORT),
        secure: import.meta.env.VITE_PEER_SECURE === "true",
        path: import.meta.env.VITE_PEER_PATH,
        config: {
          iceServers: [
            { urls: [import.meta.env.VITE_STUN] },
            { urls: [import.meta.env.VITE_ICE] },
          ],
        },
      });

      peerRef.current = peer;

      // When PeerJS connection opens, join the video room
      peer.on("open", (peerId) => {
        videoSocket.emit("join-video-room", { roomId, peerId });
      });

      // ------------------------------------------------
      // HANDLE INCOMING CALLS
      // ------------------------------------------------
      peer.on("call", (call) => {
        // Answer incoming call with local stream
        call.answer(stream);

        // Receive remote stream
        call.on("stream", (remoteStream: MediaStream) => {
          const id = call.peer;
          setRemoteStreams((prev) => ({
            ...prev,
            [id]: remoteStream,
          }));
        });

        // Store active call
        peers.current[call.peer] = call;
      });

      // ------------------------------------------------
      // HANDLE NEW USER CONNECTED
      // ------------------------------------------------
      videoSocket.off("user-connected");
      videoSocket.on("user-connected", ({ peerId }) => {
        connectToUser(peerId, stream!);
      });

      // ------------------------------------------------
      // HANDLE USER DISCONNECTED
      // ------------------------------------------------
      videoSocket.off("user-disconnected");
      videoSocket.on("user-disconnected", (peerId) => {
        // Close and remove peer connection
        if (peers.current[peerId]) peers.current[peerId].close();
        delete peers.current[peerId];

        // Remove remote stream
        setRemoteStreams((prev) => {
          const copy = { ...prev };
          delete copy[peerId];
          return copy;
        });
      });
    })();

    // Cleanup when component unmounts or roomId changes
    return () => {
      cancelled = true;

      // Close all peer calls
      Object.values(peers.current).forEach((call) => call.close());
      peers.current = {};

      // Destroy PeerJS instance
      peerRef.current?.destroy();
      peerRef.current = null;

      // Stop all local media tracks
      if (myStream) myStream.getTracks().forEach((t) => t.stop());

      // Disconnect socket
      videoSocket.disconnect();
    };
  }, [roomId]);

  // ------------------------------------------------
  // CONNECT TO A NEW USER
  // Initiates a PeerJS call to another peer
  // ------------------------------------------------
  const connectToUser = (peerId: string, stream: MediaStream) => {
    if (!peerRef.current) return;
    if (peers.current[peerId]) return;

    // Call the remote peer with local stream
    const call = peerRef.current.call(peerId, stream);

    // Receive remote stream
    call.on("stream", (remoteStream: MediaStream) => {
      const id = call.peer;

      setRemoteStreams((prev) => ({
        ...prev,
        [id]: remoteStream,
      }));
    });

    // Handle call close
    call.on("close", () => {
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[peerId];
        return copy;
      });
    });

    // Store active call
    peers.current[peerId] = call;
  };

  // Expose local stream, remote streams, and peer reference
  return { myStream, remoteStreams, peerRef };
}



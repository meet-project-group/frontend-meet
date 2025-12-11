import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import "../styles/room.sass";

// Chat socket
import { socket } from "../services/socket";

// Voice Hook
import { useVoiceChat } from "../hooks/useVoiceChat";

import { getAuth } from "firebase/auth";

import {
  Camera,
  CameraOut,
  Share,
  Sharex,
  Hand,
  Mic,
  MicOff,
} from "../icons";

interface ChatMessage {
  sender: string;
  message: string;
  time?: number;
}

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();

  /* ------------------- USERNAME ------------------- */
  const auth = getAuth();
  const user = auth.currentUser;

  const username =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User-" + Math.floor(Math.random() * 9999);

  /* ------------------- CHAT STATES ------------------- */
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

  /* ------------------- CHAT SOCKET ------------------- */
  useEffect(() => {
    socket.emit("join_room", id, username);

    const handler = (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [id, username]);

  const sendMessage = () => {
    if (!message.trim()) return;

    socket.emit("send_message", {
      roomId: id,
      sender: username,
      message,
      time: Date.now(),
    });

    setMessage("");
  };

  /* ------------------- AUTO SCROLL ------------------- */
  useEffect(() => {
    const chatBox = document.querySelector(".room__chat-messages");
    if (!chatBox) return;

    const bottom =
      chatBox.scrollHeight - chatBox.clientHeight - chatBox.scrollTop < 50;

    if (bottom) chatBox.scrollTop = chatBox.scrollHeight;
  }, [messages]);

  /* ------------------- CLOSE CHAT IF CLICKED OUTSIDE ------------------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatOpen &&
        chatRef.current &&
        !chatRef.current.contains(e.target as Node)
      ) {
        setChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [chatOpen]);

  /* ------------------- CONTROLS ------------------- */
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [hand, setHand] = useState(false);
  const [sharing, setSharing] = useState(false);

  /* ------------------- VOICE HOOK (AQUÍ SE CONECTA TODO) ------------------- */
  const {
    myStream,
    isTalking,
    participants,
    endCall,
    peerRef
  } = useVoiceChat(id!, username);

  /* ------------------- UI ------------------- */
  return (
    <main className="room" role="main">
      <section className="room__main">
        <h2 className="room__title">Meeting: {id}</h2>

        <div className="room__main-avatar">
          <img src="/images/chat.png" alt="avatar" />
        </div>

        <div className="room__controls">
          {/* MIC */}
          <button
            className="room__btn"
            onClick={() => {
              setMuted(!muted);
              myStream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
            }}
          >
            {muted ? <MicOff /> : <Mic />}
          </button>

          {/* CAMERA */}
          <button className="room__btn" onClick={() => setCamera(!camera)}>
            {camera ? <Camera /> : <CameraOut />}
          </button>

          {/* SHARE */}
          <button className="room__btn" onClick={() => setSharing(!sharing)}>
            {sharing ? <Sharex /> : <Share />}
          </button>

          {/* HAND */}
          <button className="room__btn" onClick={() => setHand(!hand)}>
            <span style={{ opacity: hand ? 1 : 0.4 }}>
              <Hand />
            </span>
          </button>

          {/* END CALL */}
          <button className="room__btn room__btn--hangup" onClick={() => {
            endCall();
            navigate("/home");
          }}>
            End
          </button>
        </div>
      </section>

      {/* ------------------- PARTICIPANTES ------------------- */}
      <aside className="room__grid">
        {/* YO */}
        <div className="room__grid-item">
          <div className="room__small-avatar">
            <div className={`initial-badge ${isTalking ? "talking" : ""}`}>
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="mic-status">
              {isTalking ? <Mic /> : <MicOff />}
            </div>
          </div>
        </div>

        {/* OTROS */}
        {participants
          .filter((u) => u.peerId !== peerRef.current?.id)
          .map((u) => (
            <div key={u.peerId} className="room__grid-item">
              <div className="room__small-avatar">
                <div className={`initial-badge ${u.talking ? "talking" : ""}`}>
                  {u.username.charAt(0).toUpperCase()}
                </div>

                <div className="mic-status">
                  {u.talking ? <Mic /> : <MicOff />}
                </div>
              </div>
            </div>
          ))}
      </aside>

      {/* ------------------- BOTÓN CHAT ------------------- */}
      <button
        className="room__chat-button"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <img src="/images/chat.png" alt="Chat icon" />
      </button>

      {/* ------------------- PANEL CHAT ------------------- */}
      {chatOpen && (
        <>
          <div
            className="chat-overlay"
            onClick={() => setChatOpen(false)}
          ></div>

          <div className="room__chat-panel" ref={chatRef}>
            <div className="room__chat-messages">
              {messages.map((m, i) => (
                <p key={i}>
                  <strong>{m.sender}: </strong> {m.message}
                </p>
              ))}
            </div>

            <div className="room__chat-input">
              <input
                type="text"
                placeholder="Write a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

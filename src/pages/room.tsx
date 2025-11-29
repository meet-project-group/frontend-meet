import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import "../styles/room.sass";
import { getAuth } from "firebase/auth";

import { 
  Camera, 
  CameraOut, 
  MutedIcon, 
  SpeakerIcon, 
  Share, 
  Sharex, 
  Hand 
} from "../icons";

interface ChatMessage {
  sender: string;
  message: string;
  time?: number;
}

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [hand, setHand] = useState(false);
  const [sharing, setSharing] = useState(false);

  // CHAT
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const chatRef = useRef<HTMLDivElement | null>(null);

  // 🚀 Obtener nombre real del usuario
  const auth = getAuth();
  const user = auth.currentUser;
  const username =
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "Anónimo";

  // JOIN ROOM + escuchar mensajes
  useEffect(() => {
    socket.emit("join_room", id, username);

    socket.on("receive_message", (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, [id, username]);

  // Cerrar chat si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (chatOpen && chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chatOpen]);

  // Enviar mensaje
  const sendMessage = () => {
    if (!message.trim()) return;

    const msg: ChatMessage = {
      sender: username,
      message,
      time: Date.now(),
    };

    socket.emit("send_message", {
      roomId: id,
      ...msg,
    });

    setMessage("");
  };

  /** Fake participants */
  const participants = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i + 1,
        name: "D",
      })),
    []
  );

  return (
    <main className="room" role="main">
      
      <section className="room__main">
        <h2 className="room__title">Meeting: {id}</h2>

        <div className="room__main-avatar">
          <img src="/images/chat.png" alt="Your avatar" />
        </div>

        <div className="room__controls">

          <button
            className="room__btn"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <MutedIcon /> : <SpeakerIcon />}
          </button>

          <button
            className="room__btn"
            onClick={() => setCamera(!camera)}
          >
            {camera ? <Camera /> : <CameraOut />}
          </button>

          <button
            className="room__btn"
            onClick={() => setSharing(!sharing)}
          >
            {sharing ? <Sharex /> : <Share />}
          </button>

          <button
            className="room__btn"
            onClick={() => setHand(!hand)}
          >
            <span style={{ opacity: hand ? 1 : 0.4 }}>
              <Hand />
            </span>
          </button>

          <button
            className="room__btn room__btn--hangup"
            onClick={() => navigate("/home")}
          >
            End
          </button>
        </div>
      </section>

      <aside className="room__grid">
        {participants.map((p) => (
          <div key={p.id} className="room__grid-item">
            <div className="room__small-avatar">{p.name}</div>
          </div>
        ))}
      </aside>

      <button 
        className="room__chat-button"
        onClick={() => setChatOpen(!chatOpen)}
      >
        <img src="/images/chat.png" alt="Chat icon" />
      </button>

      {chatOpen && (
        <div className="room__chat-panel" ref={chatRef}>
          
          <div className="room__chat-messages">
            {messages.map((m, i) => (
              <p key={i}>
                <strong>{m.sender}: </strong>
                {m.message}
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
      )}
    </main>
  );
}

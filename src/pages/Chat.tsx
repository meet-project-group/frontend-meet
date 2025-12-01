import { useEffect, useState } from "react";
import { socket } from "../services/socket";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);

  // Listen for incoming messages when the component mounts
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Append new message to the message list
      setMessages((prev) => [...prev, data]);
    });

    // Cleanup socket listener on component unmount
    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Sends a message to the server via socket.io
  const sendMessage = () => {
    socket.emit("send_message", {
      roomId: "general",
      sender: "Camilo",
      message,
      time: Date.now(),
    });

    // Clear message input after sending
    setMessage("");
  };

  return (
    <div>
      <h2>Chat</h2>

      {/* Render the list of received messages */}
      <div>
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.sender}:</b> {m.message}
          </p>
        ))}
      </div>

      {/* Message input */}
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Send button */}
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
}

import { io } from "socket.io-client";

export const voiceSocket = io(import.meta.env.VITE_VOICE_SERVER_URL, {
  autoConnect: false,
  transports: ["websocket"],  // ← OBLIGATORIO
  path: "/voice/socket.io"    // ← tu backend sí usa este path
});

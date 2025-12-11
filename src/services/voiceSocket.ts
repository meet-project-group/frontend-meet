import { io } from "socket.io-client";

export const voiceSocket = io("https://backend-voice-meet.onrender.com", {
  path: "/voice/socket.io",
  transports: ["websocket"],
  secure: true,
  reconnection: true,
});

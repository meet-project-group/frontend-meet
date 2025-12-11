import { io } from "socket.io-client";

export const voiceSocket = io(import.meta.env.VITE_VOICE_SERVER_URL, {
  transports: ["websocket"],
});

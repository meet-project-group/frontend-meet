import { io } from "socket.io-client";

export const videoSocket = io(import.meta.env.VITE_VIDEO_SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

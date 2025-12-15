import { io } from "socket.io-client";

// Socket.IO client instance used for video signaling
// Connection is configured to use WebSocket only and will not auto-connect
export const videoSocket = io(
  import.meta.env.VITE_CAM_SERVER_URL,
  {
    // Prevent automatic connection on initialization
    autoConnect: false,

    // Force WebSocket transport (no polling fallback)
    transports: ["websocket"],
  }
);


import { io } from "socket.io-client";

export const aiSocket = io("http://localhost:5000", {
  transports: ["websocket"],
});

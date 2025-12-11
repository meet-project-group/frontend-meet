import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  base: "./",
  optimizeDeps: {
    include: ["peerjs", "socket.io-client"], // ← AGREGA socket.io-client
  },
});

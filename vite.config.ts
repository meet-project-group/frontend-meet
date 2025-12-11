import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  base: "", // ✅ correcto para Vercel (NO "./")
  optimizeDeps: {
    include: ["peerjs"],
  },
});

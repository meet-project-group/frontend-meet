export default defineConfig({
  plugins: [react()],
  base: "/", // ← Importante PARA PRODUCCIÓN
  optimizeDeps: {
    include: ["peerjs"],
  },
  build: {
    outDir: "dist",
  },
});


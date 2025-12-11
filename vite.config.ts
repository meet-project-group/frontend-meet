export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  // ❌ NO uses base:"./"
  base: "",
  optimizeDeps: {
    include: ["peerjs"],
  },
});


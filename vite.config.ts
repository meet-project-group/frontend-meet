export default defineConfig({
  plugins: [react()],
  base: "/",        // ← IMPORTANTE (NO "./")
  build: {
    outDir: "dist",
  },
});


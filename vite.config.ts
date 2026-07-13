import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: false,
    },
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "sb-7084db1hbx0q.vercel.run",
      ".vercel.run",
    ],
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

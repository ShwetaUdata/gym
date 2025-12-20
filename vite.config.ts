import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // ✅ Backend MUST be on different port
  const apiTarget = env.VITE_API_URL || "http://localhost:8080";

  return {
    server: {
      host: "::",
      port: 5173, // ✅ Frontend port (Vite default)
      proxy: {
        "/api": {
          target: apiTarget, // ✅ Backend
          changeOrigin: true,
          secure: false, // ✅ HTTP backend
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

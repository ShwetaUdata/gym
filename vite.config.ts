import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:5000";

  return {
    // Use relative paths for Electron file:// protocol
    base: "./",
    server: {
      host: "::",
      port: 8080,
      // Dev-only proxy to avoid CORS: frontend calls /api/*, Vite forwards to your backend.
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: true,
        },
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "icons/*.png"],
        manifest: {
          name: "US Gymnasium",
          short_name: "US Gym",
          description: "Complete gym management system with member registration, payment tracking, and administrative tools.",
          start_url: "/",
          display: "standalone",
          background_color: "#0d1117",
          theme_color: "#00bfff",
          orientation: "portrait-primary",
          icons: [
            {
              src: "/icons/icon-72x72.png",
              sizes: "72x72",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-96x96.png",
              sizes: "96x96",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-128x128.png",
              sizes: "128x128",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-144x144.png",
              sizes: "144x144",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-152x152.png",
              sizes: "152x152",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-384x384.png",
              sizes: "384x384",
              type: "image/png",
              purpose: "maskable any",
            },
            {
              src: "/icons/icon-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable any",
            },
          ],
          categories: ["fitness", "health", "business"],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: "CacheFirst",
              options: {
                cacheName: "gstatic-fonts-cache",
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Ensure assets use relative paths
      assetsDir: "assets",
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});


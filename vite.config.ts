import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      external: [/^@tauri-apps\//],
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "zustand"],
          ui: ["@radix-ui/react-tooltip", "@radix-ui/react-dialog", "@radix-ui/react-select", "lucide-react"],
          query: ["@tanstack/react-query"],
          charts: ["recharts"],
        },
      },
    },
  },
}));

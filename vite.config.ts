import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";
  const tauriStub = path.resolve(__dirname, "./src/lib/tauri-event-stub.ts");

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react(), isDev && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        // Stub Tauri APIs in dev (web preview) — in production build they're externalized
        ...(isDev
          ? {
              "@tauri-apps/api/event": tauriStub,
              "@tauri-apps/api/core": tauriStub,
            }
          : {}),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    build: {
      rollupOptions: {
        external: [/^@tauri-apps\//],
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom", "zustand"],
            ui: [
              "@radix-ui/react-tooltip",
              "@radix-ui/react-dialog",
              "@radix-ui/react-select",
              "lucide-react",
            ],
            query: ["@tanstack/react-query"],
            charts: ["recharts"],
          },
        },
      },
    },
  };
});
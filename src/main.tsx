import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./i18n";
import "./index.css";

// Suppress known third-party forwardRef warnings (Radix Select, Recharts CartesianGrid)
if (import.meta.env.DEV) {
  const origWarn = console.error;
  console.error = (...args: unknown[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("Function components cannot be given refs")) return;
    origWarn.apply(console, args);
  };
}

createRoot(document.getElementById("root")!).render(<App />);

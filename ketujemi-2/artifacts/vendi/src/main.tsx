import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { runAppBootstrap } from "@/lib/bootstrap-app-stability";
import { setupPwaUpdates } from "@/lib/pwa-updates";
import "./index.css";

runAppBootstrap();

try {
  setupPwaUpdates();
} catch (err) {
  console.warn("[KetuJemi] PWA setup skipped", err);
}

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[KetuJemi] Unhandled promise rejection", event.reason);
  });
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);

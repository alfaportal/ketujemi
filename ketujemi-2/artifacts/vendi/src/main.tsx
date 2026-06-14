import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { runListingFlowBootstrap } from "@/lib/bootstrap-listing-flow";
import { setupPwaUpdates } from "@/lib/pwa-updates";
import "./index.css";

runListingFlowBootstrap();

try {
  setupPwaUpdates();
} catch (err) {
  console.warn("[KetuJemi] PWA setup skipped", err);
}

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>,
);

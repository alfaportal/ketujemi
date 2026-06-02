import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://909e0fc1a65151f056b461de0a7ab18b@o4511490601844736.ingest.de.sentry.io/4511490656108624",
  environment: process.env.NODE_ENV,
  sendDefaultPii: false,
});

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const err =
      event.error instanceof Error
        ? event.error
        : new Error(event.message || "Unhandled window error");
    Sentry.captureException(err, {
      tags: { boundary: "window-error" },
      extra: { filename: event.filename, lineno: event.lineno, colno: event.colno },
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason ?? "Unhandled rejection"));
    Sentry.captureException(err, {
      tags: { boundary: "unhandledrejection" },
    });
  });
}

import { createRoot } from "react-dom/client";
import App from "./App";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { setupPwaUpdates } from "@/lib/pwa-updates";
import "./index.css";

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

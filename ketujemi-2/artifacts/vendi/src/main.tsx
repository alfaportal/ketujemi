import { createRoot } from "react-dom/client";
import App from "./App";
import { setupPwaUpdates } from "@/lib/pwa-updates";
import "./index.css";

setupPwaUpdates();

createRoot(document.getElementById("root")!).render(<App />);

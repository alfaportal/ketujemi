import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
};

function readFirebaseConfig(): FirebasePublicConfig | null {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY?.trim();
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
  const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim();
  const appId = import.meta.env.VITE_FIREBASE_APP_ID?.trim();
  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY?.trim();
  if (!apiKey || !projectId || !messagingSenderId || !appId || !vapidKey) return null;
  return {
    apiKey,
    authDomain: authDomain ?? `${projectId}.firebaseapp.com`,
    projectId,
    messagingSenderId,
    appId,
    vapidKey,
  };
}

function serviceWorkerSource(cfg: FirebasePublicConfig): string {
  const firebaseConfig = JSON.stringify({
    apiKey: cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
    messagingSenderId: cfg.messagingSenderId,
    appId: cfg.appId,
  });
  return `
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");
firebase.initializeApp(${firebaseConfig});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "KetuJemi";
  const body = payload.notification?.body || "";
  self.registration.showNotification(title, {
    body,
    icon: "/icons/icon-192.png",
    data: payload.data || {},
  });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.link) || "/";
  event.waitUntil(clients.openWindow(url));
});
`;
}

let registerAttempted = false;

/** Register browser FCM token when Firebase env vars are configured. */
export async function registerFcmTokenIfConfigured(): Promise<void> {
  if (registerAttempted || typeof window === "undefined") return;
  registerAttempted = true;

  const cfg = readFirebaseConfig();
  if (!cfg) return;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const blob = new Blob([serviceWorkerSource(cfg)], { type: "application/javascript" });
    const swUrl = URL.createObjectURL(blob);
    const registration = await navigator.serviceWorker.register(swUrl, { scope: "/" });
    URL.revokeObjectURL(swUrl);

    const { initializeApp } = await import("firebase/app");
    const { getMessaging, getToken, isSupported } = await import("firebase/messaging");

    if (!(await isSupported())) return;

    const app = initializeApp({
      apiKey: cfg.apiKey,
      authDomain: cfg.authDomain,
      projectId: cfg.projectId,
      messagingSenderId: cfg.messagingSenderId,
      appId: cfg.appId,
    });

    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: cfg.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!token) return;

    await fetchWithTimeout("/api/fcm/register-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token, platform: "web" }),
    });
  } catch {
    /* optional — push not configured or blocked */
  }
}

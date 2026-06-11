import { registerSW } from "virtual:pwa-register";
import { isListingPostPath } from "@/lib/listing-form-draft";

let swRegistration: ServiceWorkerRegistration | undefined;
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | undefined;
let pendingPwaReload = false;

function isOnListingPostForm(): boolean {
  return typeof window !== "undefined" && isListingPostPath(window.location.pathname);
}

/** Check for new builds and reload so users never stay on an old app shell. */
export function setupPwaUpdates(): void {
  if (!import.meta.env.PROD) return;

  applyUpdate = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      swRegistration = registration ?? undefined;
      if (!registration) return;
      const check = () => void registration.update();
      check();
      window.setInterval(check, 5 * 60 * 1000);
    },
    onNeedRefresh() {
      if (isOnListingPostForm()) {
        pendingPwaReload = true;
        return;
      }
      void applyUpdate?.(true);
    },
  });
}

/** Thirr kur ndryshon rruga — nëse ka build të ri, ringarko faqen. */
export async function checkForAppUpdate(): Promise<void> {
  if (!import.meta.env.PROD) return;
  if (isOnListingPostForm()) return;

  try {
    if (pendingPwaReload) {
      pendingPwaReload = false;
      await applyUpdate?.(true);
      return;
    }
    if (swRegistration) {
      await swRegistration.update();
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
        return;
      }
    }
    await applyUpdate?.(false);
  } catch {
    /* offline / SW i padisponueshëm */
  }
}

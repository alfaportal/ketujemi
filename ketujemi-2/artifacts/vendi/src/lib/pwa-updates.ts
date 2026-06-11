import { registerSW } from "virtual:pwa-register";
import { isListingPostPath } from "@/lib/listing-form-draft";

let swRegistration: ServiceWorkerRegistration | undefined;
let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | undefined;

function isOnListingPostForm(): boolean {
  return typeof window !== "undefined" && isListingPostPath(window.location.pathname);
}

/**
 * Register SW without auto-reload — production deploys must never wipe an in-progress listing form.
 * User gets the new build on the next manual navigation or refresh.
 */
export function setupPwaUpdates(): void {
  if (!import.meta.env.PROD) return;

  applyUpdate = registerSW({
    immediate: false,
    onRegisteredSW(_swUrl, registration) {
      swRegistration = registration ?? undefined;
    },
    onNeedRefresh() {
      /* Never reload while user is posting; new shell applies on next visit. */
    },
  });
}

/** Optional update check on route change — never reloads the page automatically. */
export async function checkForAppUpdate(): Promise<void> {
  if (!import.meta.env.PROD) return;
  if (isOnListingPostForm()) return;

  try {
    if (swRegistration) {
      await swRegistration.update();
    }
    await applyUpdate?.(false);
  } catch {
    /* offline / SW unavailable */
  }
}

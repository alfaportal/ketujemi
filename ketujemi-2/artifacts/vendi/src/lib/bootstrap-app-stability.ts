/** One-time per deploy: unregister stale service workers before React mounts. */

const BOOT_VERSION = "v3";
const BOOT_KEY = `vendi_app_boot_${BOOT_VERSION}`;

declare global {
  interface Window {
    __kjBootstrapDone?: boolean;
  }
}

async function clearStaleServiceWorkers(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(regs.map((r) => r.unregister()));
}

/** Await this before createRoot — avoids chunk load races with SW/cache teardown. */
export async function bootstrapAppStability(): Promise<void> {
  if (!import.meta.env.PROD || typeof window === "undefined") {
    window.__kjBootstrapDone = true;
    return;
  }

  try {
    if (localStorage.getItem(BOOT_KEY) === "1") {
      window.__kjBootstrapDone = true;
      return;
    }
  } catch {
    /* private mode */
  }

  try {
    await clearStaleServiceWorkers();
    localStorage.setItem(BOOT_KEY, "1");
  } catch (err) {
    console.warn("[KetuJemi] app bootstrap cleanup failed", err);
  } finally {
    window.__kjBootstrapDone = true;
  }
}

export function isAppBootstrapComplete(): boolean {
  return typeof window !== "undefined" && window.__kjBootstrapDone === true;
}

/** @deprecated Use bootstrapAppStability — must be awaited before React mounts. */
export function runAppBootstrap(): void {
  void bootstrapAppStability();
}

/** @deprecated Use bootstrapAppStability */
export function runListingFlowBootstrap(): void {
  void bootstrapAppStability();
}

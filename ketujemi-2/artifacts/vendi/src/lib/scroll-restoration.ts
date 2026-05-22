/** Scroll positions keyed by pathname + search + hash (SPA back/forward). */

const positions = new Map<string, number>();

let popNavigation = false;
let listenerInstalled = false;

/** Set when scroll restoration handled a popstate navigation (same tick as route change). */
export let lastRouteChangeWasPop = false;

export function scrollLocationKey(pathname: string): string {
  if (typeof window === "undefined") return pathname;
  return `${pathname}${window.location.search}${window.location.hash}`;
}

function installPopListener() {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;
  window.history.scrollRestoration = "manual";
  window.addEventListener("popstate", () => {
    popNavigation = true;
  });
}

export function markScrollPosition(key: string, y: number) {
  if (!Number.isFinite(y) || y < 0) return;
  positions.set(key, y);
}

export function getScrollPosition(key: string): number | undefined {
  return positions.get(key);
}

/** True when the upcoming route change is from browser back/forward. */
export function peekPopNavigation(): boolean {
  return popNavigation;
}

export function consumePopNavigation(): boolean {
  const v = popNavigation;
  popNavigation = false;
  lastRouteChangeWasPop = v;
  return v;
}

export function restoreScrollY(y: number) {
  window.scrollTo({ top: Math.max(0, y), left: 0, behavior: "auto" });
}

/** Re-apply scroll after listings/images load (category pages, home, etj.). */
export function scheduleRestoreScrollY(y: number): () => void {
  const apply = () => restoreScrollY(y);
  apply();
  const timers: ReturnType<typeof setTimeout>[] = [];
  requestAnimationFrame(() => {
    apply();
    requestAnimationFrame(apply);
  });
  for (const ms of [50, 150, 350, 600]) {
    timers.push(setTimeout(apply, ms));
  }
  return () => timers.forEach(clearTimeout);
}

/** Track window scroll for the active route (call once at app shell). */
export function ensureScrollRestorationListeners(
  getActiveKey: () => string,
): () => void {
  installPopListener();

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      markScrollPosition(getActiveKey(), window.scrollY);
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

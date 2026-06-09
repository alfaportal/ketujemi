import { useLayoutEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  consumePopNavigation,
  ensureScrollRestorationListeners,
  getScrollPosition,
  markScrollPosition,
  scheduleRestoreScrollY,
  scrollLocationKey,
} from "@/lib/scroll-restoration";

/**
 * Browser back/forward → restore prior scrollY for that URL (kategori, home, njoftime…).
 * Forward navigation (links) → scroll to top.
 */
export function useScrollRestoration() {
  const [pathname] = useLocation();
  const activeKeyRef = useRef(scrollLocationKey(pathname));

  useLayoutEffect(() => {
    return ensureScrollRestorationListeners(() => activeKeyRef.current);
  }, []);

  useLayoutEffect(() => {
    const previousKey = activeKeyRef.current;
    const key = scrollLocationKey(pathname);

    if (previousKey !== key) {
      markScrollPosition(previousKey, window.scrollY);
    }

    activeKeyRef.current = key;

    const isPop = consumePopNavigation();
    if (isPop) {
      const saved = getScrollPosition(key);
      if (saved != null) {
        return scheduleRestoreScrollY(saved);
      }
      return;
    }

    if (shouldPreservePartnerFormScroll(pathname)) {
      return;
    }

    // Category scroll is handled by useCategoryScroll (focus anchor + drill-down restore).
    if (pathname.startsWith("/categories")) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    markScrollPosition(key, 0);
    return undefined;
  }, [pathname]);
}

/** Partner form step: page scrolls to #regjistrohu, not top. */
function shouldPreservePartnerFormScroll(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (!/^\/partner(itet|stvo)?$/.test(pathname)) return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("step") === "partner" ||
    params.get("regjistrohu") === "1" ||
    window.location.hash === "#regjistrohu"
  );
}

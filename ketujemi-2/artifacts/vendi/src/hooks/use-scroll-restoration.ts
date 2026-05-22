import { useLayoutEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  consumePopNavigation,
  ensureScrollRestorationListeners,
  getScrollPosition,
  markScrollPosition,
  restoreScrollY,
  scrollLocationKey,
} from "@/lib/scroll-restoration";

/**
 * Browser back/forward → restore prior scrollY for that URL.
 * Forward navigation (links) → scroll to top.
 */
export function useScrollRestoration() {
  const [pathname] = useLocation();
  const activeKeyRef = useRef(scrollLocationKey(pathname));

  useLayoutEffect(() => {
    return ensureScrollRestorationListeners(() => activeKeyRef.current);
  }, []);

  useLayoutEffect(() => {
    const key = scrollLocationKey(pathname);
    activeKeyRef.current = key;

    const isPop = consumePopNavigation();
    if (isPop) {
      const saved = getScrollPosition(key);
      if (saved != null) {
        restoreScrollY(saved);
        return;
      }
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    markScrollPosition(key, 0);
  }, [pathname]);
}

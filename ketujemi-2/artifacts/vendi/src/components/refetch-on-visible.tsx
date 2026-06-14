import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isListingFlowPath } from "@/lib/listing-post-path";
import { refreshBrowsingQueries } from "@/lib/query-refresh";

const MIN_INTERVAL_MS = 45_000;

/** Refetch list feeds when the user returns to the tab — debounced, never on listing post/detail/edit. */
export function RefetchOnVisible() {
  const queryClient = useQueryClient();
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (isListingFlowPath(window.location.pathname)) return;
      const now = Date.now();
      if (now - lastRefreshRef.current < MIN_INTERVAL_MS) return;
      lastRefreshRef.current = now;
      refreshBrowsingQueries(queryClient);
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (isListingFlowPath(window.location.pathname)) return;
      refresh();
    };

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [queryClient]);

  return null;
}

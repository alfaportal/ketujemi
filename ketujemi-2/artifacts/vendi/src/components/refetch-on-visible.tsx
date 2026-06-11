import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { isListingPostPath } from "@/lib/listing-form-draft";

/** Refetch API data whenever the user returns to the tab or reopens the app. */
export function RefetchOnVisible() {
  const queryClient = useQueryClient();
  const [pathname] = useLocation();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (isListingPostPath(pathname)) return;
      void queryClient.invalidateQueries();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (isListingPostPath(pathname)) return;
      refresh();
    };

    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", onPageShow);
    refresh();

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [queryClient, pathname]);

  return null;
}

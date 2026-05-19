import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

/** Refetch API data whenever the user returns to the tab or reopens the app. */
export function RefetchOnVisible() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void queryClient.invalidateQueries();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refresh();
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
  }, [queryClient]);

  return null;
}

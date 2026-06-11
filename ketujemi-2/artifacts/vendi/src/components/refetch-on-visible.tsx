import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { isListingPostPath } from "@/lib/listing-post-path";

/** Refetch API data when the user returns to the tab — never on the listing post form. */
export function RefetchOnVisible() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      if (isListingPostPath(window.location.pathname)) return;
      void queryClient.invalidateQueries();
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      if (isListingPostPath(window.location.pathname)) return;
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

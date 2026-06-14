import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { checkForAppUpdate } from "@/lib/pwa-updates";
import { isListingFlowPath } from "@/lib/listing-post-path";

import { lastRouteChangeWasPop } from "@/lib/scroll-restoration";

/**
 * Çdo ndryshim faqeje (përveç back/forward): rifreskim i të dhënave API,
 * kontroll për version të ri të app-it (PWA). Scroll → useScrollRestoration.
 */
export function useFreshPageOnRoute() {
  const [pathname] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!lastRouteChangeWasPop && !isListingFlowPath(pathname)) {
      void queryClient.invalidateQueries();
    }
    void checkForAppUpdate();
  }, [pathname, queryClient]);
}

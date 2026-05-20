import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { checkForAppUpdate } from "@/lib/pwa-updates";

/**
 * Çdo ndryshim faqeje: scroll në krye, rifreskim i të dhënave API,
 * kontroll për version të ri të app-it (PWA).
 */
export function useFreshPageOnRoute() {
  const [pathname] = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    void queryClient.invalidateQueries();
    void checkForAppUpdate();
  }, [pathname, queryClient]);
}

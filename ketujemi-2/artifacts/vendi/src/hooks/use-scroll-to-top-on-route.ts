import { useEffect } from "react";
import { useLocation } from "wouter";

/** Kur ndryshon faqja (p.sh. nga footer), shfaq përmbajtjen nga krye — jo nga pozicioni i vjetër i scroll-it. */
export function useScrollToTopOnRouteChange() {
  const [pathname] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
}

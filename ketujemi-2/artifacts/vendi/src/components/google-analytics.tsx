import { useEffect } from "react";
import { useLocation } from "wouter";
import { initGoogleAnalytics, trackPageView } from "@/lib/google-analytics";

/** Gjurmim GA4 për navigimin në aplikacion (Wouter SPA). */
export function GoogleAnalytics() {
  const [pathname] = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    trackPageView(`${pathname}${search}`);
  }, [pathname]);

  return null;
}

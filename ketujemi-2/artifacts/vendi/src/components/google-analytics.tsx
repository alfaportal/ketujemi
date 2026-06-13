import { useEffect } from "react";
import { useLocation } from "wouter";
import { initGoogleAnalytics, trackPageView } from "@/lib/google-analytics";

/** Gjurmim GA4 për navigimin në aplikacion (Wouter SPA). */
export function GoogleAnalytics() {
  const [pathname] = useLocation();

  useEffect(() => {
    const run = () => initGoogleAnalytics();
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(run, { timeout: 5000 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(run, 2500);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    trackPageView(`${pathname}${search}`);
  }, [pathname]);

  return null;
}

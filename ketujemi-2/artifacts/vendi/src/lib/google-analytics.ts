/** Google Analytics 4 — vizitorë, faqe, vendndodhje (vend / qytet në raportet GA). */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}


/** KetuJemi GA4 property — override with VITE_GA_MEASUREMENT_ID if needed. */
const DEFAULT_MEASUREMENT_ID = "G-A396094792";

const MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID?.trim() || DEFAULT_MEASUREMENT_ID;

let initialized = false;

function isValidMeasurementId(id: string): boolean {
  return /^G-[A-Z0-9]+$/i.test(id);
}

export function isGoogleAnalyticsEnabled(): boolean {
  return import.meta.env.PROD && isValidMeasurementId(MEASUREMENT_ID);
}

export function getGoogleAnalyticsMeasurementId(): string {
  return MEASUREMENT_ID;
}

function loadGtagScript(): void {
  if (document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`;
  document.head.appendChild(script);
}

/** Ngarkon GA4 një herë (vetëm prod + ID e vlefshme). */
export function initGoogleAnalytics(): void {
  if (!isGoogleAnalyticsEnabled() || initialized) return;
  initialized = true;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  loadGtagScript();
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID, {
    send_page_view: false,
    anonymize_ip: true,
  });
}

function shouldTrackPath(path: string): boolean {
  const p = path.split("?")[0] ?? path;
  return !p.startsWith("/admin");
}

/** SPA: dërgon page_view kur ndryshon rruga. */
export function trackPageView(path: string): void {
  if (!isGoogleAnalyticsEnabled() || !initialized || !window.gtag) return;
  if (!shouldTrackPath(path)) return;

  const page_path = path.startsWith("/") ? path : `/${path}`;
  window.gtag("event", "page_view", {
    page_path,
    page_location: `${window.location.origin}${page_path}`,
    page_title: document.title,
  });
}

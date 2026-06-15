import { useEffect } from "react";
import { useLocation } from "wouter";
import { applyPageMeta, setRobotsMeta } from "@/lib/page-meta";
import { resolveRouteSeoDefaults } from "@/lib/seo-route-meta";

/** Applies noindex/canonical defaults for auth, admin, and filtered search URLs. */
export function SeoRouteHead() {
  const [pathname] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";

  useEffect(() => {
    const defaults = resolveRouteSeoDefaults(pathname, search);
    if (defaults) {
      applyPageMeta({
        title: defaults.title ?? "KetuJemi — Bli & Shit",
        ...defaults,
      });
      return;
    }
    setRobotsMeta("index, follow");
  }, [pathname, search]);

  return null;
}

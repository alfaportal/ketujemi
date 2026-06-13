const PREFETCHED = new Set<string>();

const ROUTE_CHUNKS: Record<string, () => Promise<unknown>> = {
  "/listings": () => import("@/pages/listings"),
  "/dyqanet": () => import("@/pages/shop-directory"),
  "/": () => import("@/pages/home"),
  "/listings/new": () => import("@/pages/new-listing"),
  "/login": () => import("@/pages/login"),
};

function normalizePath(href: string): string {
  const path = href.split("?")[0]?.split("#")[0] ?? href;
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

/** Warm route JS on hover/focus so navigation feels instant. */
export function prefetchRoute(href: string): void {
  if (typeof window === "undefined") return;
  const path = normalizePath(href);
  if (PREFETCHED.has(path)) return;
  const loader = ROUTE_CHUNKS[path];
  if (!loader) return;
  PREFETCHED.add(path);
  void loader().catch(() => {
    PREFETCHED.delete(path);
  });
}

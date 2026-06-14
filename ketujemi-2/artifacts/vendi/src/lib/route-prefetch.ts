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

function listingDetailPath(href: string): string | null {
  const path = normalizePath(href);
  return /^\/listings\/\d+$/.test(path) ? path : null;
}

async function importWithRetry(factory: () => Promise<unknown>, retries = 2): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await factory();
      return;
    } catch (err) {
      lastError = err;
      if (attempt < retries) {
        await new Promise((resolve) => window.setTimeout(resolve, 400 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

/** Warm route JS on hover/focus so navigation feels instant. */
export function prefetchRoute(href: string): void {
  if (typeof window === "undefined") return;
  const path = normalizePath(href);
  if (PREFETCHED.has(path)) return;

  const detailPath = listingDetailPath(path);
  if (detailPath) {
    PREFETCHED.add(detailPath);
    void importWithRetry(() => import("@/pages/listing-detail")).catch(() => {
      PREFETCHED.delete(detailPath);
    });
    return;
  }

  const loader = ROUTE_CHUNKS[path];
  if (!loader) return;
  PREFETCHED.add(path);
  void importWithRetry(loader).catch(() => {
    PREFETCHED.delete(path);
  });
}

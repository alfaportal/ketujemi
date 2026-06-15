import { SITEMAP_PARENT_HUB_SLUGS } from "./seo-sitemap-config.js";

const PARENT_HUB_SET = new Set<string>(SITEMAP_PARENT_HUB_SLUGS);

export function seoCategoryPath(categorySlug: string, citySlug?: string | null): string {
  const base = `/shpallje/${encodeURIComponent(categorySlug)}`;
  if (!citySlug?.trim()) return base;
  return `${base}/${encodeURIComponent(citySlug.trim().toLowerCase())}`;
}

export function isParentHubCategorySlug(slug: string | null | undefined): boolean {
  if (!slug?.trim()) return false;
  return PARENT_HUB_SET.has(slug.trim().toLowerCase());
}

/** Google may crawl city URLs for users, but only parent hubs get indexable city landings. */
export function resolveCategoryCityIndexing(
  categorySlug: string,
  citySlug: string | null | undefined,
  opts?: { listingCount?: number; isLoading?: boolean },
): { canonicalPath: string; robots?: string } {
  const hasCity = !!citySlug?.trim();

  if (!hasCity) {
    return { canonicalPath: seoCategoryPath(categorySlug) };
  }

  if (!isParentHubCategorySlug(categorySlug)) {
    return {
      canonicalPath: seoCategoryPath(categorySlug),
      robots: "noindex, follow",
    };
  }

  const thin = opts?.isLoading === false && (opts?.listingCount ?? 0) === 0;
  if (thin) {
    return {
      canonicalPath: seoCategoryPath(categorySlug),
      robots: "noindex, follow",
    };
  }

  return {
    canonicalPath: seoCategoryPath(categorySlug, citySlug),
  };
}

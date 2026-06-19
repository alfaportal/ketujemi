import type { PageMeta } from "@/lib/page-meta";

const NOINDEX_NOFOLLOW = "noindex, nofollow";
const NOINDEX_FOLLOW = "noindex, follow";

function pathOnly(pathname: string): string {
  return pathname.split("?")[0] ?? pathname;
}

/** Default robots/canonical for routes that must not compete in Google index. */
export function resolveRouteSeoDefaults(pathname: string, search: string): Partial<PageMeta> | null {
  const path = pathOnly(pathname);

  if (
    path === "/admin"
    || path.startsWith("/admin/")
    || path.startsWith("/admin-secret-panel")
  ) {
    return { title: "Admin | KetuJemi", robots: NOINDEX_NOFOLLOW };
  }

  if (
    path === "/login"
    || path === "/profili"
    || path === "/profile"
    || path === "/shpalljet-e-mia"
    || path.startsWith("/wallet/")
    || path === "/listings/new"
    || path.startsWith("/listings/new/")
    || /^\/listings\/\d+\/edit$/.test(path)
  ) {
    return { title: "KetuJemi", robots: NOINDEX_NOFOLLOW };
  }

  if (path === "/categories" || path.startsWith("/categories/")) {
    return { title: "KetuJemi", robots: NOINDEX_FOLLOW, canonicalPath: "/listings" };
  }

  if (path === "/category" || path.startsWith("/category/")) {
    return { title: "KetuJemi", robots: NOINDEX_FOLLOW };
  }

  const hubRedirect = /^\/(vetura|motorr-skuter|kamione-furgone|auto-pjese|banesa-shtepi|lokale-zyre|telefona|kompjutere-laptope|tv-elektronike|mobilje-dekorime|rroba-kepuce|femije|sport-outdoor|pune-sherbime|ndertim-instalime|bujqesi-blegtori|arsim-kurse|muzike-hobby|kafshet|kerkoj-te-blej|dhurata-falas)$/.test(
    path,
  );
  if (hubRedirect) {
    return { title: "KetuJemi", robots: NOINDEX_FOLLOW };
  }

  if (path === "/listings" && search.trim().length > 0) {
    return {
      title: "KetuJemi — Blej & Shite",
      robots: NOINDEX_FOLLOW,
      canonicalPath: "/listings",
    };
  }

  return null;
}

import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { RouteLoading } from "@/components/route-loading";

import { seoCategoryPath } from "@/lib/category-seo";

/** Redirect legacy /category/:segment and short /:hubSlug URLs to /shpallje/:segment. */
export function CategorySlugRedirect({ segment }: { segment: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const raw = segment.trim();
    if (!raw) {
      setLocation("/");
      return;
    }
    setLocation(seoCategoryPath(raw));
  }, [segment, setLocation]);

  return <RouteLoading />;
}

/** `/category/:id` → `/categories/:id` */
export function LegacyCategoryRouteRedirect() {
  const [, params] = useRoute("/category/:id");
  return <CategorySlugRedirect segment={params?.id ?? ""} />;
}

export function categoryHubRedirectComponent(slug: string) {
  return function CategoryHubSlugRedirect() {
    return <CategorySlugRedirect segment={slug} />;
  };
}

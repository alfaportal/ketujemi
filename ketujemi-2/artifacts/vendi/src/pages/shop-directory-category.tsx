import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { ShopDirectoryCard, type ShopDirectoryListItem } from "@/components/shop-directory-card";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { directoryCategoryBySlug } from "@/lib/shop-directory-taxonomy";
import {
  translateDirectoryCategory,
  translateDirectorySubcategory,
  useShopDirectoryCopy,
} from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

export default function ShopDirectoryCategoryPage() {
  const [, params] = useRoute("/dyqanet/:slug");
  const slug = params?.slug ?? "";
  const cat = directoryCategoryBySlug(slug);
  const d = useShopDirectoryCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<ShopDirectoryListItem[]>([]);
  const [subFilter, setSubFilter] = useState("");

  useEffect(() => {
    if (!cat) return;
    document.title = `${translateDirectoryCategory(cat, locale)} — ${d.docCategoryTitle}`;
  }, [cat, d.docCategoryTitle, locale]);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    const params = new URLSearchParams({ category: slug });
    if (subFilter) params.set("subcategory", subFilter);
    void fetchWithTimeout(`/api/shops/directory?${params}`)
      .then((r) => r.json() as Promise<{ shops: ShopDirectoryListItem[] }>)
      .then((data) => setShops(data.shops ?? []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [slug, subFilter]);

  const title = cat ? translateDirectoryCategory(cat, locale) : d.docCategoryTitle;

  if (!cat) {
    return (
      <div className="min-h-screen bg-[#f0f4f9]">
        <SiteHeader />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <p className="text-lg font-bold">{d.noResults}</p>
          <Link href="/dyqanet" className="mt-4 inline-block text-blue-600 font-semibold">
            {d.viewAllShops}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
        <StaticPageBackLink />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl" aria-hidden>
            {cat.emoji}
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {shops.length} {d.shopsCount}
            </p>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSubFilter("")}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors",
              !subFilter ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-200",
            )}
          >
            {d.allSubcategories}
          </button>
          {cat.subcategories.map((sub) => (
            <button
              key={sub.slug}
              type="button"
              onClick={() => setSubFilter(sub.slug)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-semibold border transition-colors whitespace-nowrap",
                subFilter === sub.slug
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200",
              )}
            >
              {translateDirectorySubcategory(sub, locale)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : shops.length === 0 ? (
          <p className="text-center text-gray-500 py-12">{d.noShops}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shops.map((shop) => (
              <ShopDirectoryCard key={shop.id} shop={shop} viewLabel={d.viewShop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

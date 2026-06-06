import { useEffect, useMemo, useState } from "react";
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { ShopDirectoryCard, type ShopDirectoryListItem } from "@/components/shop-directory-card";
import { ShopDirectorySearchBar } from "@/components/shop-directory-search-bar";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { applyPageMeta } from "@/lib/page-meta";
import { shopDirectoryCategoryImageUrl } from "@/lib/shop-directory-category-images";
import { shopDirectorySubcategoryImageUrl } from "@/lib/shop-directory-subcategory-images";
import { directoryCategoryBySlug, directorySubcategoryBySlug } from "@/lib/shop-directory-taxonomy";
import { filterShopsByQuery } from "@/lib/shop-directory-fuse";
import {
  fuseNoResultsMessage,
  seoSubcategoryTitleFor,
  translateDirectoryCategory,
  translateDirectorySubcategory,
  useShopDirectoryCopy,
} from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { SHOP_COUNTRY_CODES, useShopFormCopy } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";

export default function ShopDirectorySubcategoryPage() {
  const [, params] = useRoute("/dyqanet/:categorySlug/:subcategorySlug");
  const categorySlug = params?.categorySlug ?? "";
  const subcategorySlug = params?.subcategorySlug ?? "";
  const cat = directoryCategoryBySlug(categorySlug);
  const sub = cat ? directorySubcategoryBySlug(cat.slug, subcategorySlug) : null;
  const d = useShopDirectoryCopy();
  const formCopy = useShopFormCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<ShopDirectoryListItem[]>([]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const cityOptions = country ? citiesForShopCountry(country) : [];

  const categoryName = cat ? translateDirectoryCategory(cat, locale) : "";
  const subcategoryName = sub ? translateDirectorySubcategory(sub, locale) : "";

  useEffect(() => {
    if (!cat || !sub) return;
    const title = seoSubcategoryTitleFor(d, subcategoryName, categoryName);
    applyPageMeta({ title, description: title, ogTitle: title, ogDescription: title });
  }, [cat, sub, d, categoryName, subcategoryName]);

  useEffect(() => {
    if (!categorySlug || !subcategorySlug) return;
    setLoading(true);
    const qs = new URLSearchParams({ category: categorySlug, subcategory: subcategorySlug });
    if (city) qs.set("city", city);
    if (country) qs.set("country", country);
    void fetchWithTimeout(`/api/shops/directory?${qs}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{ shops: ShopDirectoryListItem[] }>)
      .then((data) => setShops(data.shops ?? []))
      .catch(() => setShops([]))
      .finally(() => setLoading(false));
  }, [categorySlug, subcategorySlug, city, country]);

  const filteredShops = useMemo(
    () => filterShopsByQuery(shops, query, locale),
    [shops, query, locale],
  );

  const searchTerm = query.trim();
  const displayShops = searchTerm ? filteredShops : shops;

  const categoryImageUrl = cat ? shopDirectoryCategoryImageUrl(cat.slug) : undefined;
  const subImageUrl =
    cat && sub ? shopDirectorySubcategoryImageUrl(cat.slug, sub.slug) ?? categoryImageUrl : categoryImageUrl;

  if (!cat || !sub) {
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
        <div className="space-y-3">
          <ShopDirectorySearchBar
            value={query}
            onChange={setQuery}
            placeholder={d.searchPlaceholder}
            searchLabel={d.searchBtn}
            onSubmit={() => {}}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
              }}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm flex-1"
            >
              <option value="">
                {d.filterCountry}: {d.filterAll}
              </option>
              {SHOP_COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {formCopy.countryLabels[code]}
                </option>
              ))}
            </select>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!country}
              className="min-h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm flex-1 disabled:opacity-50"
            >
              <option value="">
                {d.filterCity}: {d.filterAll}
              </option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {subImageUrl ? (
            <img
              src={subImageUrl}
              alt=""
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover border border-gray-200 shrink-0"
            />
          ) : (
            <span className="text-4xl shrink-0" aria-hidden>
              {cat.emoji}
            </span>
          )}
          <div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              <Link href={`/dyqanet/${cat.slug}`} className="text-blue-600 hover:underline">
                {categoryName}
              </Link>
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{subcategoryName}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {displayShops.length} {d.shopsCount}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : displayShops.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            {searchTerm ? fuseNoResultsMessage(d, searchTerm) : d.noShops}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayShops.map((shop) => (
              <ShopDirectoryCard key={shop.id} shop={shop} viewLabel={d.viewShop} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

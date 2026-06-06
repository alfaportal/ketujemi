import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ShopDirectorySearchBar } from "@/components/shop-directory-search-bar";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { applyPageMeta } from "@/lib/page-meta";
import { shopDirectoryCategoryImageUrl } from "@/lib/shop-directory-category-images";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import { filterShopsByQuery } from "@/lib/shop-directory-fuse";
import {
  fuseNoResultsMessage,
  translateDirectoryCategory,
  useShopDirectoryCopy,
} from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { useMarket } from "@/lib/market-context";
import { SHOP_COUNTRY_CODES, useShopFormCopy } from "@/lib/shop-application-i18n";
import { citiesForShopCountry } from "@/lib/shop-application-locations";
import type { ShopDirectoryListItem } from "@/components/shop-directory-card";

type DirectoryResponse = {
  shops: ShopDirectoryListItem[];
  categoryCounts: Record<string, number>;
};

export default function ShopDirectoryPage() {
  const d = useShopDirectoryCopy();
  const formCopy = useShopFormCopy();
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<ShopDirectoryListItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    applyPageMeta({
      title: d.seoTitle,
      description: d.seoDescription,
      ogTitle: d.seoTitle,
      ogDescription: d.seoDescription,
    });
  }, [d.seoTitle, d.seoDescription]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    void fetchWithTimeout(`/api/shops/directory?${params}`)
      .then((r) => r.json() as Promise<DirectoryResponse>)
      .then((data) => {
        setShops(data.shops ?? []);
        setCategoryCounts(data.categoryCounts ?? {});
      })
      .catch(() => {
        setShops([]);
        setCategoryCounts({});
      })
      .finally(() => setLoading(false));
  }, [city, country]);

  const cityOptions = country ? citiesForShopCountry(country) : [];

  const filtered = useMemo(
    () => filterShopsByQuery(shops, submittedQuery, locale),
    [shops, submittedQuery, locale],
  );

  const searchTerm = submittedQuery.trim();
  const showSearchResults = searchTerm.length > 0;

  function submitSearch() {
    setSubmittedQuery(query.trim());
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="space-y-3">
          <ShopDirectorySearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              if (!v.trim()) setSubmittedQuery("");
            }}
            placeholder={d.searchPlaceholder}
            searchLabel={d.searchBtn}
            onSubmit={submitSearch}
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
              <option value="">{d.filterCountry}: {d.filterAll}</option>
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
              <option value="">{d.filterCity}: {d.filterAll}</option>
              {cityOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : showSearchResults ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Search size={16} />
              {filtered.length} {d.shopsCount}
            </p>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">{fuseNoResultsMessage(d, searchTerm)}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.slice(0, 24).map((s) => (
                  <li key={s.id}>
                    <Link href={`/dyqani/${s.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                      {s.shop_name} — {s.city}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {SHOP_DIRECTORY_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.slug] ?? 0;
              const imageUrl = shopDirectoryCategoryImageUrl(cat.slug);
              return (
                <Link
                  key={cat.slug}
                  href={`/dyqanet/${cat.slug}`}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
                >
                  <div className="relative w-full aspect-[4/3] bg-gray-100">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center text-4xl" aria-hidden>
                        {cat.emoji}
                      </span>
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex flex-col gap-1.5 flex-1 text-center">
                    <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                      <span className="mr-1" aria-hidden>
                        {cat.emoji}
                      </span>
                      {translateDirectoryCategory(cat, locale)}
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-orange-500 mt-auto pt-1">
                      {count} {d.shopsCount}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

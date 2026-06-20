import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";
import { ShopDirectoryHubIntro } from "@/components/shop-directory-hub-intro";
import { ShopDirectoryApplyCta } from "@/components/shop-directory-apply-cta";
import { ShopDirectorySearchBar } from "@/components/shop-directory-search-bar";
import { ShopDirectoryStoresBanner } from "@/components/shop-directory-stores-banner";
import { ShopDirectoryCard } from "@/components/shop-directory-card";
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
import { shopDirectoryMainGridCountHref } from "@/lib/shop-directory-nav";

/** Set true to show shop stats table beside filters on /dyqane. */
const SHOW_SHOP_DIRECTORY_STATS = false;

type DirectoryResponse = {
  shops: ShopDirectoryListItem[];
  categoryCounts: Record<string, number>;
  total?: number;
};

type ShopStatsResponse = {
  total_shops: number;
  shops_today: number;
};

export default function ShopDirectoryPage() {
  const d = useShopDirectoryCopy();
  const formCopy = useShopFormCopy();
  const { uiLang, t } = useMarket();
  const tx = t as Record<string, string>;
  const locale = translationKeyForUiLang(uiLang);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [shops, setShops] = useState<ShopDirectoryListItem[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [shopStats, setShopStats] = useState<ShopStatsResponse | null>(null);
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const categoryCount = SHOP_DIRECTORY_CATEGORIES.length;
  const seoDescription = d.seoDescription.replace("{count}", String(categoryCount));

  useEffect(() => {
    applyPageMeta({
      title: d.seoTitle,
      description: seoDescription,
      ogTitle: d.seoTitle,
      ogDescription: seoDescription,
    });
  }, [d.seoTitle, seoDescription]);

  useEffect(() => {
    setStatsLoading(true);
    void fetchWithTimeout("/api/shops/directory/stats", { cache: "no-store" })
      .then((r) => r.json() as Promise<ShopStatsResponse>)
      .then((data) => setShopStats(data))
      .catch(() => setShopStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (country) params.set("country", country);
    void fetchWithTimeout(`/api/shops/directory?${params}`, { cache: "no-store" })
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
        <ShopDirectoryHubIntro />

        <ShopDirectoryApplyCta />

        <ShopDirectoryStoresBanner shops={shops} loading={loading} />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
          <div className="min-w-0 flex-1 space-y-3">
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

          {SHOW_SHOP_DIRECTORY_STATS ? (
          <div
            className="w-full shrink-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm lg:w-72"
            aria-label={tx.ui_shopsStatsTitle}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">
              {tx.ui_shopsStatsTitle}
            </p>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-blue-100/80">
                    <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsTotal}</td>
                    <td className="py-1.5 text-right font-black text-gray-900 tabular-nums">
                      {(shopStats?.total_shops ?? shops.length).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-blue-100/80">
                    <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsToday}</td>
                    <td className="py-1.5 text-right font-black text-gray-900 tabular-nums">
                      {(shopStats?.shops_today ?? 0).toLocaleString()}
                    </td>
                  </tr>
                  {showSearchResults ? (
                    <tr>
                      <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsInFilter}</td>
                      <td className="py-1.5 text-right font-black text-blue-700 tabular-nums">
                        {filtered.length.toLocaleString()}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>
          ) : null}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.slice(0, 24).map((s) => (
                  <ShopDirectoryCard key={s.id} shop={s} viewLabel={d.viewShop} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
            {SHOP_DIRECTORY_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.slug] ?? 0;
              const imageUrl = shopDirectoryCategoryImageUrl(cat.slug);
              const countHref = shopDirectoryMainGridCountHref(cat.slug, shops, count);
              const countLabel = `${count} ${d.shopsCount}`;
              return (
                <div
                  key={cat.slug}
                  className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col"
                >
                  <Link
                    href={`/dyqanet/${cat.slug}`}
                    className="flex flex-col flex-1 text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
                    <div className="p-4 sm:p-5 flex flex-col gap-1.5 flex-1">
                      <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                        <span className="mr-1" aria-hidden>
                          {cat.emoji}
                        </span>
                        {translateDirectoryCategory(cat, locale)}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-center mt-auto">
                    {countHref ? (
                      <Link
                        href={countHref}
                        className="text-xs sm:text-sm font-bold text-orange-500 hover:text-orange-600 hover:underline"
                      >
                        {countLabel}
                      </Link>
                    ) : (
                      <p className="text-xs sm:text-sm font-bold text-orange-500">{countLabel}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

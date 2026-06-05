import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Loader2, Search } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { SHOP_DIRECTORY_CATEGORIES } from "@/lib/shop-directory-taxonomy";
import {
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
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    document.title = d.docTitle;
  }, [d.docTitle]);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shops;
    return shops.filter((s) => {
      const cat = s.directory_category_slug
        ? SHOP_DIRECTORY_CATEGORIES.find((c) => c.slug === s.directory_category_slug)
        : null;
      const sub = cat?.subcategories.find((x) => x.slug === s.directory_subcategory_slug);
      const hay = [
        s.shop_name,
        s.city,
        s.country,
        cat?.nameSq,
        sub?.nameSq,
        cat ? translateDirectoryCategory(cat, locale) : "",
        sub ? sub.nameSq : "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [shops, query, locale]);

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="space-y-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={d.searchPlaceholder}
            className="w-full min-h-12 rounded-xl border border-gray-200 bg-white px-4 text-base sm:text-sm shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {SHOP_DIRECTORY_CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.slug] ?? 0;
              return (
                <Link
                  key={cat.slug}
                  href={`/dyqanet/${cat.slug}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col gap-2 min-h-[120px]"
                >
                  <span className="text-3xl" aria-hidden>
                    {cat.emoji}
                  </span>
                  <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug">
                    {translateDirectoryCategory(cat, locale)}
                  </p>
                  <p className="text-xs text-gray-500 mt-auto">
                    {count} {d.shopsCount}
                  </p>
                </Link>
              );
            })}
          </div>
        )}

        {query && !loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Search size={16} />
              {filtered.length} {d.shopsCount}
            </p>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500">{d.noResults}</p>
            ) : (
              <ul className="space-y-2">
                {filtered.slice(0, 8).map((s) => (
                  <li key={s.id}>
                    <Link href={`/dyqani/${s.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                      {s.shop_name} — {s.city}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

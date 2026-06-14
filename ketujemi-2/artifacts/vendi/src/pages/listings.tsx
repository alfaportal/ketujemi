import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "wouter";
import { useGetListings, useGetCategories } from "@workspace/api-client-react";
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket, MARKETS, LOCATIONS } from "@/lib/market-context";
import SharedListingCard from "@/components/listing-card";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/lib/utils";
import {
  cnPrimaryBlue,
  filterToggleButtonBaseClass,
} from "@/lib/primary-button-classes";
import { effectiveListingSearchQuery } from "@/lib/listing-search-query";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { filterShopsByQuery } from "@/lib/shop-directory-fuse";
import { ShopDirectoryCard, type ShopDirectoryListItem } from "@/components/shop-directory-card";
import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";
import { prefetchRoute } from "@/lib/route-prefetch";

// --- Skeleton Card ---
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

// --- Main Component ---
const PAGE_SIZE = 16;

function listingsUrlFromState(state: {
  search?: string;
  categoryId?: string;
  loc?: string;
  minPrice?: string;
  maxPrice?: string;
  userId?: string;
}): string {
  const params = new URLSearchParams();
  const q = effectiveListingSearchQuery(state.search ?? "");
  if (q) params.set("search", q);
  if (state.categoryId && state.categoryId !== "all") params.set("category_id", state.categoryId);
  if (state.loc && state.loc !== "all") params.set("location", state.loc);
  if (state.minPrice) params.set("min_price", state.minPrice);
  if (state.maxPrice) params.set("max_price", state.maxPrice);
  if (state.userId && state.userId !== "all") params.set("user_id", state.userId);
  const qs = params.toString();
  return qs ? `/listings?${qs}` : "/listings";
}

export default function Listings() {
  const [, setLocation] = useLocation();
  const goToPostListing = useGoToPostListing();

  useEffect(() => {
    void import("@/pages/listing-detail").catch(() => undefined);
  }, []);

  const { market, t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const shopCopy = useShopDirectoryCopy();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialSearchRaw = searchParams.get("search") ?? searchParams.get("q") ?? "";
  const initialSearch = effectiveListingSearchQuery(initialSearchRaw);
  const initialUserId = searchParams.get("user_id") ?? "";

  const [search, setSearch] = useState(initialSearchRaw);
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") ?? "");
  const [loc, setLoc] = useState(searchParams.get("location") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [sellerUserId, setSellerUserId] = useState(initialUserId);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [directoryShops, setDirectoryShops] = useState<ShopDirectoryListItem[]>([]);
  const [shopsLoading, setShopsLoading] = useState(false);
  const [listingStats, setListingStats] = useState<{
    total_listings: number;
    listings_today: number;
    category_listings: number | null;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const tx = t as Record<string, string>;

  const [appliedSearch, setAppliedSearch] = useState(initialSearch);
  const [appliedCategory, setAppliedCategory] = useState(categoryId);
  const [appliedLoc, setAppliedLoc] = useState(loc);
  const [appliedMinPrice, setAppliedMinPrice] = useState(minPrice);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(maxPrice);
  const [appliedSellerUserId, setAppliedSellerUserId] = useState(initialUserId);

  const queryParams: Record<string, string | number> = { page, limit: PAGE_SIZE };
  if (appliedSearch) queryParams.search = appliedSearch;
  if (appliedCategory && appliedCategory !== "all") queryParams.category_id = Number(appliedCategory);
  if (appliedLoc && appliedLoc !== "all") queryParams.location = appliedLoc;
  if (appliedMinPrice) queryParams.min_price = Number(appliedMinPrice);
  if (appliedMaxPrice) queryParams.max_price = Number(appliedMaxPrice);
  const parsedSellerUserId = Number(appliedSellerUserId);
  if (Number.isFinite(parsedSellerUserId) && parsedSellerUserId > 0) {
    queryParams.user_id = parsedSellerUserId;
  }

  const { data, isLoading } = useGetListings(queryParams);
  const { data: categories } = useGetCategories();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const applyQuickSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = effectiveListingSearchQuery(search);
    setCategoryId("");
    setLoc("");
    setMinPrice("");
    setMaxPrice("");
    setAppliedSearch(q);
    setAppliedCategory("");
    setAppliedLoc("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setPage(1);
    setLocation(listingsUrlFromState({ search: q }));
  };

  const applyPanelFilters = () => {
    const q = effectiveListingSearchQuery(search);
    setAppliedSearch(q);
    setAppliedCategory(categoryId);
    setAppliedLoc(loc);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setPage(1);
    setLocation(
      listingsUrlFromState({ search: q, categoryId, loc, minPrice, maxPrice }),
    );
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setLoc("");
    setMinPrice("");
    setMaxPrice("");
    setSellerUserId("");
    setAppliedSearch("");
    setAppliedCategory("");
    setAppliedLoc("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setAppliedSellerUserId("");
    setPage(1);
    setLocation("/listings");
  };

  const hasActiveFilters = !!(
    appliedSearch ||
    (appliedCategory && appliedCategory !== "all") ||
    (appliedLoc && appliedLoc !== "all") ||
    appliedMinPrice ||
    appliedMaxPrice ||
    (appliedSellerUserId && Number(appliedSellerUserId) > 0)
  );

  const selectedCategory = categories?.find((c) => String(c.id) === appliedCategory);

  useEffect(() => {
    if (!appliedSearch) {
      setDirectoryShops([]);
      return;
    }
    setShopsLoading(true);
    void fetchWithTimeout("/api/shops/directory", { cache: "no-store" })
      .then((r) => r.json() as Promise<{ shops?: ShopDirectoryListItem[] }>)
      .then((data) => setDirectoryShops(data.shops ?? []))
      .catch(() => setDirectoryShops([]))
      .finally(() => setShopsLoading(false));
  }, [appliedSearch]);

  useEffect(() => {
    setStatsLoading(true);
    const params = new URLSearchParams();
    if (appliedCategory && appliedCategory !== "all") {
      params.set("category_id", appliedCategory);
    }
    const qs = params.toString();
    void fetchWithTimeout(`/api/listings/stats${qs ? `?${qs}` : ""}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{
        total_listings: number;
        listings_today: number;
        category_listings: number | null;
      }>)
      .then((payload) => setListingStats(payload))
      .catch(() => setListingStats(null))
      .finally(() => setStatsLoading(false));
  }, [appliedCategory]);

  const matchedShops = useMemo(
    () => (appliedSearch ? filterShopsByQuery(directoryShops, appliedSearch, locale) : []),
    [directoryShops, appliedSearch, locale],
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <SiteHeader className="z-30">
        {/* Mobile: slim search + filter icon + inline stats */}
        <div className="flex flex-col gap-1 md:hidden">
          <form onSubmit={applyQuickSearch} className="flex items-center gap-1.5">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                data-testid="input-search-listings"
                type="search"
                enterKeyHint="search"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full touch-manipulation rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-2 text-sm outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <button
              type="submit"
              data-testid="button-search-listings"
              aria-label={t.searchBtn}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 touch-manipulation"
            >
              <Search size={16} aria-hidden />
            </button>
            <button
              type="button"
              data-testid="button-toggle-filters"
              aria-label={t.filters}
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border touch-manipulation",
                showFilters || hasActiveFilters
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-200 bg-white text-gray-600 hover:border-blue-300",
              )}
            >
              <SlidersHorizontal size={16} aria-hidden />
            </button>
          </form>
          <p className="truncate px-0.5 text-[10px] font-medium text-gray-500 tabular-nums" aria-live="polite">
            {statsLoading ? (
              <span className="inline-block h-3 w-28 animate-pulse rounded bg-gray-100" />
            ) : (
              <>
                {(listingStats?.total_listings ?? data?.total ?? 0).toLocaleString()} {tx.ui_listingsStatsTotal}
                {" · "}
                {(listingStats?.listings_today ?? 0).toLocaleString()} {tx.ui_listingsStatsToday}
              </>
            )}
          </p>
        </div>

        {/* Desktop / tablet: full search card + stats card */}
        <div className="hidden w-full flex-col gap-3 pt-1 md:flex lg:flex-row lg:items-stretch lg:gap-4">
          <form
            onSubmit={applyQuickSearch}
            className="flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:flex-nowrap sm:gap-2"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500 sm:hidden">
              {tx.ui_listingsQuickSearch}
            </p>
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                data-testid="input-search-listings"
                type="search"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full min-h-12 touch-manipulation rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-base outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
              />
            </div>
            <button
              type="submit"
              data-testid="button-search-listings"
              className={cnPrimaryBlue("w-full sm:w-auto")}
            >
              {t.searchBtn}
            </button>
          </form>

          <div
            className="w-full shrink-0 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm lg:w-72"
            aria-label={tx.ui_listingsStatsTitle}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700">
              {tx.ui_listingsStatsTitle}
            </p>
            {statsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            ) : (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-blue-100/80">
                    <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsTotal}</td>
                    <td className="py-1.5 text-right font-black text-gray-900 tabular-nums">
                      {(listingStats?.total_listings ?? data?.total ?? 0).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-b border-blue-100/80">
                    <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsToday}</td>
                    <td className="py-1.5 text-right font-black text-gray-900 tabular-nums">
                      {(listingStats?.listings_today ?? 0).toLocaleString()}
                    </td>
                  </tr>
                  {hasActiveFilters ? (
                    <tr>
                      <td className="py-1.5 pr-2 font-medium text-gray-600">{tx.ui_listingsStatsInFilter}</td>
                      <td className="py-1.5 text-right font-black text-blue-700 tabular-nums">
                        {(
                          listingStats?.category_listings ??
                          data?.total ??
                          0
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </SiteHeader>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 md:py-6">

        {/* Header row — desktop only (mobile uses compact header above) */}
        <div className="mb-4 hidden flex-col gap-3 sm:mb-5 md:flex sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">
              {appliedSellerUserId && Number(appliedSellerUserId) > 0
                ? tx.ui_sellerListingsPageTitle
                : t.title}
            </h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {data.total.toLocaleString()} {t.total}
                {selectedCategory ? ` ${t.in} ${translateCategory(selectedCategory.name, locale)}` : ""}
              </p>
            )}
          </div>
          <button
            data-testid="button-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              filterToggleButtonBaseClass,
              "w-full sm:w-auto",
              showFilters || hasActiveFilters
                ? "bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 shadow-none",
            )}
          >
            <SlidersHorizontal size={15} />
            {t.filters}
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 text-sm font-black min-w-[1.25rem] h-7 px-1.5 rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="min-w-0">
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{t.category}</label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger className="rounded-xl border-gray-200" data-testid="select-category">
                    <SelectValue placeholder={t.all} />
                  </SelectTrigger>
                  <SelectContent className="!max-h-[300px]">
                    <SelectItem value="all">{t.all}</SelectItem>
                    {categories?.filter((cat) => !cat.parent_id).map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {translateCategory(cat.name, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0">
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{t.city}</label>
                <Select value={loc} onValueChange={setLoc}>
                  <SelectTrigger className="rounded-xl border-gray-200" data-testid="select-location">
                    <SelectValue placeholder={t.all} />
                  </SelectTrigger>
                  <SelectContent className="!max-h-[300px]">
                    <SelectItem value="all">{t.all}</SelectItem>
                    {(LOCATIONS[market.code] ?? LOCATIONS.ks).map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  {t.minPrice} ({market.symbol})
                </label>
                <input
                  data-testid="input-min-price"
                  type="number"
                  placeholder="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  className="w-full min-h-12 px-3 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all touch-manipulation"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  {t.maxPrice} ({market.symbol})
                </label>
                <input
                  data-testid="input-max-price"
                  type="number"
                  placeholder="∞"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  className="w-full min-h-12 px-3 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all touch-manipulation"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end mt-4">
              {hasActiveFilters && (
                <button
                  data-testid="button-clear-filters"
                  onClick={clearFilters}
                  className="flex w-full sm:w-auto justify-center items-center gap-1.5 px-4 py-3 md:py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all min-h-12 touch-manipulation"
                >
                  <X size={14} /> {t.clear}
                </button>
              )}
              <button
                type="button"
                data-testid="button-apply-filters"
                onClick={() => { applyPanelFilters(); setShowFilters(false); }}
                className={cnPrimaryBlue("w-full sm:w-auto")}
              >
                {t.apply}
              </button>
            </div>
          </div>
        )}

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {appliedSearch && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                {appliedSearch}
                <X size={12} className="cursor-pointer hover:text-blue-900" onClick={() => {
                  setSearch("");
                  setAppliedSearch("");
                  setPage(1);
                  setLocation(listingsUrlFromState({
                    categoryId: appliedCategory,
                    loc: appliedLoc,
                    minPrice: appliedMinPrice,
                    maxPrice: appliedMaxPrice,
                  }));
                }} />
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-purple-200">
                {translateCategory(selectedCategory.name, locale)}
                <X size={12} className="cursor-pointer hover:text-purple-900" onClick={() => {
                  setCategoryId("");
                  setAppliedCategory("");
                  setPage(1);
                  setLocation(listingsUrlFromState({
                    search: appliedSearch,
                    loc: appliedLoc,
                    minPrice: appliedMinPrice,
                    maxPrice: appliedMaxPrice,
                  }));
                }} />
              </span>
            )}
            {appliedLoc && appliedLoc !== "all" && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-green-200">
                {appliedLoc}
                <X size={12} className="cursor-pointer hover:text-green-900" onClick={() => {
                  setLoc("");
                  setAppliedLoc("");
                  setPage(1);
                  setLocation(listingsUrlFromState({
                    search: appliedSearch,
                    categoryId: appliedCategory,
                    minPrice: appliedMinPrice,
                    maxPrice: appliedMaxPrice,
                  }));
                }} />
              </span>
            )}
            {(appliedMinPrice || appliedMaxPrice) && (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                {appliedMinPrice || "0"} – {appliedMaxPrice || "∞"} {market.symbol}
                <X size={12} className="cursor-pointer hover:text-amber-900" onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setAppliedMinPrice("");
                  setAppliedMaxPrice("");
                  setPage(1);
                  setLocation(listingsUrlFromState({
                    search: appliedSearch,
                    categoryId: appliedCategory,
                    loc: appliedLoc,
                  }));
                }} />
              </span>
            )}
          </div>
        )}

        {appliedSearch ? (
          <section className="mb-6">
            <h2 className="text-lg font-black text-gray-900 mb-3">{t.searchShopsSection}</h2>
            {shopsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4">
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : matchedShops.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchedShops.map((shop) => (
                  <ShopDirectoryCard key={shop.id} shop={shop} viewLabel={shopCopy.viewShop} />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && Array.isArray(data.listings) && data.listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
              {data.listings.map((listing) => (
                <SharedListingCard
                  key={listing.id}
                  listing={listing as Parameters<typeof SharedListingCard>[0]["listing"]}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  data-testid="button-prev-page"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="min-h-12 min-w-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center touch-manipulation"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm font-medium text-gray-600 px-3">
                  {t.page} {page} {t.of} {totalPages}
                </span>
                <button
                  data-testid="button-next-page"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-12 min-w-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center touch-manipulation"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-black text-gray-800 mb-2">{t.noResults}</h3>
            <p className="text-gray-400 text-sm mb-6">{t.noResultsSub}</p>
            <div className="flex justify-center gap-3">
              {hasActiveFilters && (
                <button
                  data-testid="button-clear-filters"
                  onClick={clearFilters}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  {t.clear}
                </button>
              )}
              <button
                data-testid="button-post-empty"
                onClick={goToPostListing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all"
              >
                {t.post}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

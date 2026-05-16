import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useGetListings, useGetCategories } from "@workspace/api-client-react";
import {
  Search, SlidersHorizontal, X, Plus, ChevronLeft, ChevronRight, ChevronDown, Menu,
} from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket, MARKETS, LOCATIONS } from "@/lib/market-context";
import SharedListingCard from "@/components/listing-card";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { AuthToolbar } from "@/components/auth-toolbar";

// ─── Market Selector ──────────────────────────────────────────────────────────
function MarketSelector() {
  const { market, setMarket } = useMarket();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        data-testid="button-market-selector"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all text-sm font-medium text-gray-700 shadow-sm min-h-12 touch-manipulation"
      >
        <span className="text-base">{market.flag}</span>
        <span className="hidden sm:inline">{market.name}</span>
        <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[170px]">
          {MARKETS.map((m) => (
            <button
              key={m.code}
              data-testid={`option-market-${m.code}`}
              onClick={() => { setMarket(m); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${m.code === market.code ? "bg-blue-50" : ""}`}
            >
              <span className="text-lg">{m.flag}</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                <div className="text-sm text-gray-400">{m.currency}</div>
              </div>
              {m.code === market.code && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
const PAGE_SIZE = 16;

export default function Listings() {
  const [, setLocation] = useLocation();
  const goToPostListing = useGoToPostListing();
  const { market, t } = useMarket();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category_id") ?? "");
  const [loc, setLoc] = useState(searchParams.get("location") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [appliedSearch, setAppliedSearch] = useState(search);
  const [appliedCategory, setAppliedCategory] = useState(categoryId);
  const [appliedLoc, setAppliedLoc] = useState(loc);
  const [appliedMinPrice, setAppliedMinPrice] = useState(minPrice);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState(maxPrice);

  const queryParams: Record<string, string | number> = { page, limit: PAGE_SIZE };
  if (appliedSearch) queryParams.search = appliedSearch;
  if (appliedCategory && appliedCategory !== "all") queryParams.category_id = Number(appliedCategory);
  if (appliedLoc && appliedLoc !== "all") queryParams.location = appliedLoc;
  if (appliedMinPrice) queryParams.min_price = Number(appliedMinPrice);
  if (appliedMaxPrice) queryParams.max_price = Number(appliedMaxPrice);

  const { data, isLoading } = useGetListings(queryParams);
  const { data: categories } = useGetCategories();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setAppliedSearch(search); setAppliedCategory(categoryId);
    setAppliedLoc(loc); setAppliedMinPrice(minPrice); setAppliedMaxPrice(maxPrice);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch(""); setCategoryId(""); setLoc(""); setMinPrice(""); setMaxPrice("");
    setAppliedSearch(""); setAppliedCategory(""); setAppliedLoc(""); setAppliedMinPrice(""); setAppliedMaxPrice("");
    setPage(1);
  };

  const hasActiveFilters = !!(
    appliedSearch ||
    (appliedCategory && appliedCategory !== "all") ||
    (appliedLoc && appliedLoc !== "all") ||
    appliedMinPrice ||
    appliedMaxPrice
  );

  const selectedCategory = categories?.find((c) => String(c.id) === appliedCategory);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label={t.nav_menuAria}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 hover:bg-white md:hidden"
                    >
                      <Menu className="h-6 w-6" aria-hidden />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[min(100vw-1.5rem,20rem)] sm:max-w-sm">
                    <SheetHeader className="text-left">
                      <SheetTitle>{t.nav_menuTitle}</SheetTitle>
                    </SheetHeader>
                    <nav className="mt-8 flex flex-col gap-2">
                      <SheetClose asChild>
                        <Link
                          href="/"
                          className="flex items-center rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-muted min-h-12"
                        >
                          {t.nav_home}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/listings"
                          className="flex items-center rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-muted min-h-12"
                        >
                          {t.title}
                        </Link>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
                <Link
                  href="/"
                  data-testid="link-logo"
                  className="flex flex-col sm:flex-row sm:gap-0.5 select-none shrink-0 min-w-0"
                >
                  <span className="text-lg sm:text-xl font-black text-gray-900 leading-tight">KetuJemi</span>
                  <span className="text-lg sm:text-xl font-black text-blue-500 leading-tight shrink-0">.com</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <AuthToolbar variant="compact" />
                <MarketSelector />
                <button
                  data-testid="button-new-listing"
                  onClick={goToPostListing}
                  className="hidden md:inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm min-h-12"
                >
                  <Plus size={15} aria-hidden />
                  <span>{t.post}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 md:hidden w-full">
              <button
                data-testid="button-new-listing-mobile"
                onClick={goToPostListing}
                type="button"
                className="inline-flex flex-1 min-w-[8rem] items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all shadow-sm min-h-12 touch-manipulation"
              >
                <Plus size={16} aria-hidden />
                {t.post}
              </button>
            </div>
            <form onSubmit={applyFilters} className="flex flex-col gap-2 w-full md:flex-row md:items-center md:flex-nowrap md:gap-2">
              <div className="relative flex-1 min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  data-testid="input-search-listings"
                  type="search"
                  placeholder={t.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full min-h-12 pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white touch-manipulation"
                />
              </div>
              <button
                type="submit"
                data-testid="button-search-listings"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full md:w-auto min-h-12 shrink-0 touch-manipulation"
              >
                {t.searchBtn}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Header row ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">{t.title}</h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {data.total.toLocaleString()} {t.total}
                {selectedCategory ? ` ${t.in} ${selectedCategory.name}` : ""}
              </p>
            )}
          </div>
          <button
            data-testid="button-toggle-filters"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-3 md:py-2.5 rounded-xl border text-sm font-semibold transition-all w-full sm:w-auto min-h-12 shrink-0 touch-manipulation ${
              showFilters || hasActiveFilters
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            {t.filters}
            {hasActiveFilters && (
              <span className="bg-white text-blue-600 text-sm font-black min-w-[1.25rem] h-7 px-1.5 rounded-full flex items-center justify-center">!</span>
            )}
          </button>
        </div>

        {/* ── Filters panel ── */}
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
                      <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
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
                data-testid="button-apply-filters"
                onClick={() => { applyFilters(); setShowFilters(false); }}
                className="w-full sm:w-auto px-5 py-3 md:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all min-h-12 touch-manipulation"
              >
                {t.apply}
              </button>
            </div>
          </div>
        )}

        {/* ── Active filter badges ── */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            {appliedSearch && (
              <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-200">
                {appliedSearch}
                <X size={12} className="cursor-pointer hover:text-blue-900" onClick={() => { setSearch(""); setAppliedSearch(""); setPage(1); }} />
              </span>
            )}
            {selectedCategory && (
              <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-purple-200">
                {selectedCategory.name}
                <X size={12} className="cursor-pointer hover:text-purple-900" onClick={() => { setCategoryId(""); setAppliedCategory(""); setPage(1); }} />
              </span>
            )}
            {appliedLoc && appliedLoc !== "all" && (
              <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-green-200">
                {appliedLoc}
                <X size={12} className="cursor-pointer hover:text-green-900" onClick={() => { setLoc(""); setAppliedLoc(""); setPage(1); }} />
              </span>
            )}
            {(appliedMinPrice || appliedMaxPrice) && (
              <span className="flex items-center gap-1.5 bg-amber-50 text-amber-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                {appliedMinPrice || "0"} – {appliedMaxPrice || "∞"} {market.symbol}
                <X size={12} className="cursor-pointer hover:text-amber-900" onClick={() => { setMinPrice(""); setMaxPrice(""); setAppliedMinPrice(""); setAppliedMaxPrice(""); setPage(1); }} />
              </span>
            )}
          </div>
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && data.listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
              {data.listings.map((listing) => (
                <SharedListingCard
                  key={listing.id}
                  listing={listing as any}
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

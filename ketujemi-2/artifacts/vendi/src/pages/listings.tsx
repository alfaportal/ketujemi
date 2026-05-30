import { useState } from "react";
import { useGetListings } from "@workspace/api-client-react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useMarket } from "@/lib/market-context";
import SharedListingCard from "@/components/listing-card";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { SiteHeader } from "@/components/site-header";
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { effectiveListingSearchQuery } from "@/lib/listing-search-query";

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

const PAGE_SIZE = 16;

export default function Listings() {
  const goToPostListing = useGoToPostListing();
  const { t } = useMarket();
  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialSearchRaw = searchParams.get("search") ?? "";
  const initialSearch = effectiveListingSearchQuery(initialSearchRaw);

  const [search, setSearch] = useState(initialSearchRaw);
  const [page, setPage] = useState(1);

  const [appliedSearch, setAppliedSearch] = useState(initialSearch);

  const queryParams: Record<string, string | number> = { page, limit: PAGE_SIZE };
  if (appliedSearch) queryParams.search = appliedSearch;

  const { data, isLoading } = useGetListings(queryParams);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    setAppliedSearch(effectiveListingSearchQuery(search));
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setPage(1);
  };

  const hasActiveFilters = !!appliedSearch;

  return (
    <div className="min-h-screen bg-gray-50">

      <SiteHeader className="z-30">
        <form onSubmit={applyFilters} className="flex flex-col gap-2 w-full md:flex-row md:items-center md:flex-nowrap md:gap-2 pt-1">
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
            className={cnPrimaryBlue("w-full md:w-auto")}
          >
            {t.searchBtn}
          </button>
        </form>
      </SiteHeader>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900">{t.title}</h1>
            {data && (
              <p className="text-sm text-gray-500 mt-0.5">
                {data.total.toLocaleString()} {t.total}
              </p>
            )}
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-semibold px-3 py-1.5 rounded-full border border-blue-200">
              {appliedSearch}
              <button
                type="button"
                className="text-blue-900 hover:underline text-xs"
                onClick={clearFilters}
              >
                {t.clear}
              </button>
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : data && data.listings.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
              {data.listings.map((listing) => (
                <SharedListingCard key={listing.id} listing={listing as any} />
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

import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { useMarket, convertPrice } from "@/lib/market-context";
import { ListingCardImage } from "@/components/listing-card-image";
import {
  fetchTopListings,
  TOP_LISTINGS_REFRESH_EVENT,
  type TopListingCarouselItem,
} from "@/lib/top-listings-events";

const HOME_TOP_FETCH_LIMIT = 24;

const TOP_SLOT_FRAME = cn(
  "h-28 sm:h-32 md:h-36 w-full rounded-xl overflow-hidden transition-all duration-200 flex flex-col",
  "border-[3px] border-[#1A56A0] bg-gradient-to-br from-blue-50 via-white to-blue-50/80",
  "shadow-[0_3px_14px_rgba(26,86,160,0.22)]",
  "hover:border-[#1557B0] hover:shadow-[0_5px_20px_rgba(26,86,160,0.32)]",
);

function TopListingSlot({ listing, priceLabel }: { listing: TopListingCarouselItem; priceLabel: string }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className={cn(
        TOP_SLOT_FRAME,
        "group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56A0] focus-visible:ring-offset-2",
      )}
      data-testid={`top-listing-slot-${listing.id}`}
    >
      <div className="relative flex-1 min-h-0 w-full overflow-hidden bg-gray-100">
        <ListingCardImage
          imageUrl={listing.image_url}
          primaryImageUrl={listing.primary_image_url}
          alt={listing.title}
          className="group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-1.5 right-1.5 bg-[#1A56A0] text-white text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
          <Sparkles className="h-2.5 w-2.5" aria-hidden />
          TOP
        </div>
      </div>
      <div className="shrink-0 px-2 py-1.5 bg-white border-t border-[#1A56A0]/15 text-center min-h-[2.5rem] flex flex-col justify-center">
        <p className="text-[10px] sm:text-xs font-bold text-gray-900 truncate leading-tight">{listing.title}</p>
        <p className="text-[10px] sm:text-[11px] font-black text-[#1A56A0] mt-0.5">{priceLabel}</p>
      </div>
    </Link>
  );
}

function TopListingsCarousel({
  listings,
  loaded,
  rowLabel,
  priceFor,
}: {
  listings: TopListingCarouselItem[];
  loaded: boolean;
  rowLabel: string;
  priceFor: (eur: number) => string;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: listings.length > 1,
    align: "start",
    duration: 28,
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi || listings.length < 2) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 4500);
    return () => clearInterval(timer);
  }, [emblaApi, listings.length]);

  const slideBasis =
    "min-w-0 shrink-0 grow-0 basis-[46%] sm:basis-[31%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%]";

  return (
    <div className="space-y-3 sm:space-y-4">
      <p className="text-center text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A56A0]">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#1A56A0]" strokeWidth={2.25} aria-hidden />
          {rowLabel}
        </span>
      </p>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y gap-3 sm:gap-4">
          {!loaded
            ? Array.from({ length: 4 }, (_, i) => (
                <div
                  key={`top-sk-${i}`}
                  className={cn(slideBasis, TOP_SLOT_FRAME, "animate-pulse border-blue-200/60 bg-blue-50/50")}
                />
              ))
            : listings.map((l) => (
                <div key={l.id} className={slideBasis}>
                  <TopListingSlot
                    listing={l}
                    priceLabel={l.price === 0 ? "Me marrëveshje" : priceFor(Number(l.price))}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}

export function TopListingsSection({ className }: { className?: string }) {
  const { t, market, rates } = useMarket();
  const [listings, setListings] = useState<TopListingCarouselItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const priceFor = useCallback(
    (eur: number) => convertPrice(eur, market, rates),
    [market, rates],
  );

  const load = useCallback(async () => {
    const rows = await fetchTopListings(HOME_TOP_FETCH_LIMIT);
    setListings(rows);
    setLoaded(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    void fetchTopListings(HOME_TOP_FETCH_LIMIT).then((rows) => {
      if (!cancelled) {
        setListings(rows);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onRefresh = () => {
      void load();
    };
    window.addEventListener(TOP_LISTINGS_REFRESH_EVENT, onRefresh);
    const onFocus = () => {
      void load();
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(TOP_LISTINGS_REFRESH_EVENT, onRefresh);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  if (loaded && listings.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("bg-gray-50/80 border-b border-gray-100", className)}
      aria-labelledby="top-listings-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <TopListingsCarousel
          listings={listings}
          loaded={loaded}
          rowLabel={t.home_topListingsRowLabel}
          priceFor={priceFor}
        />
      </div>
    </section>
  );
}

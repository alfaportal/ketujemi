import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { Sparkles } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { useMarket, convertPrice } from "@/lib/market-context";
import { ListingCardImage } from "@/components/listing-card-image";
import {
  clearTopListingsPendingId,
  consumeTopListingsPendingId,
  fetchTopListings,
  subscribeTopListingsRefresh,
  type TopListingCarouselItem,
} from "@/lib/top-listings-events";

const TOP_CAROUSEL_SLOW_MS = 3000;
const TOP_CAROUSEL_FAST_THRESHOLD = 25;
const TOP_EMPTY_SLOT_COUNT = 6;

/** Few TOP listings: relaxed pace; 25+ speeds up so large sets keep moving. */
function topCarouselTiming(count: number): { intervalMs: number; scrollDuration: number } {
  if (count < TOP_CAROUSEL_FAST_THRESHOLD) {
    return { intervalMs: TOP_CAROUSEL_SLOW_MS, scrollDuration: 18 };
  }
  if (count < 50) {
    return { intervalMs: 1200, scrollDuration: 15 };
  }
  if (count < 100) {
    return { intervalMs: 900, scrollDuration: 12 };
  }
  if (count < 250) {
    return { intervalMs: 700, scrollDuration: 10 };
  }
  return { intervalMs: 500, scrollDuration: 8 };
}

const TOP_SLOT_FRAME = cn(
  "h-28 sm:h-32 md:h-36 w-full rounded-xl overflow-hidden transition-all duration-200 flex flex-col",
  "border-[3px] border-[#1A56A0] bg-gradient-to-br from-blue-50 via-white to-blue-50/80",
  "shadow-[0_3px_14px_rgba(26,86,160,0.22)]",
  "hover:border-[#1557B0] hover:shadow-[0_5px_20px_rgba(26,86,160,0.32)]",
);

const SLIDE_BASIS =
  "min-w-0 shrink-0 grow-0 basis-[46%] sm:basis-[31%] md:basis-[23%] lg:basis-[18%] xl:basis-[15%]";

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

function TopListingEmptySlot({ label, hint }: { label: string; hint: string }) {
  return (
    <Link
      href="/listings/new"
      className={cn(
        TOP_SLOT_FRAME,
        "relative flex flex-col items-center justify-center gap-1 px-2 border-dashed",
        "hover:bg-blue-50/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A56A0] focus-visible:ring-offset-2",
      )}
    >
      <Sparkles className="h-5 w-5 text-[#1A56A0]/70" aria-hidden />
      <span className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-[#1A56A0] text-center leading-tight">
        {label}
      </span>
      <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 text-center leading-tight">
        {hint}
      </span>
    </Link>
  );
}

function TopListingsCarousel({
  listings,
  loaded,
  priceFor,
  emptyLabel,
  emptyHint,
}: {
  listings: TopListingCarouselItem[];
  loaded: boolean;
  priceFor: (eur: number) => string;
  emptyLabel: string;
  emptyHint: string;
}) {
  const slideCount = listings.length > 0 ? listings.length : TOP_EMPTY_SLOT_COUNT;
  const { intervalMs, scrollDuration } = topCarouselTiming(Math.max(slideCount, 1));

  const carouselListings = useMemo(() => {
    if (listings.length === 0) return [];
    if (listings.length === 1) {
      return [...listings, ...listings, ...listings];
    }
    return listings;
  }, [listings]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slideCount > 1,
    align: "start",
    duration: scrollDuration,
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
  }, [emblaApi, carouselListings, listings.length]);

  useEffect(() => {
    if (!emblaApi || slideCount < 2) return;
    const timer = setInterval(() => emblaApi.scrollNext(), intervalMs);
    return () => clearInterval(timer);
  }, [emblaApi, slideCount, intervalMs]);

  return (
    <div className="overflow-hidden" ref={emblaRef}>
      <div className="flex touch-pan-y gap-3 sm:gap-4">
        {!loaded
          ? Array.from({ length: 4 }, (_, i) => (
              <div
                key={`top-sk-${i}`}
                className={cn(SLIDE_BASIS, TOP_SLOT_FRAME, "animate-pulse border-blue-200/60 bg-blue-50/50")}
              />
            ))
          : listings.length > 0
            ? carouselListings.map((l, i) => (
                <div key={`${l.id}-${i}`} className={SLIDE_BASIS}>
                  <TopListingSlot
                    listing={l}
                    priceLabel={l.price === 0 ? "Me marrëveshje" : priceFor(Number(l.price))}
                  />
                </div>
              ))
            : Array.from({ length: TOP_EMPTY_SLOT_COUNT }, (_, i) => (
                <div key={`top-empty-${i}`} className={SLIDE_BASIS}>
                  <TopListingEmptySlot label={emptyLabel} hint={emptyHint} />
                </div>
              ))}
      </div>
    </div>
  );
}

export function TopListingsHomeRow({ className }: { className?: string }) {
  const { t, market, rates } = useMarket();
  const [listings, setListings] = useState<TopListingCarouselItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const pollUntilRef = useRef<number | null>(null);

  const priceFor = useCallback(
    (eur: number) => convertPrice(eur, market, rates),
    [market, rates],
  );

  const load = useCallback(async (): Promise<TopListingCarouselItem[]> => {
    const rows = await fetchTopListings();
    setListings(rows);
    setLoaded(true);
    return rows;
  }, []);

  const schedulePollUntilVisible = useCallback(
    (listingId?: number) => {
      if (pollUntilRef.current != null) {
        window.clearInterval(pollUntilRef.current);
        pollUntilRef.current = null;
      }
      const pendingId = listingId ?? consumeTopListingsPendingId();
      if (pendingId == null) {
        void load();
        return;
      }

      const started = Date.now();
      const tick = async () => {
        const rows = await load();
        const found = rows.some((r) => r.id === pendingId);
        if (found || Date.now() - started > 45_000) {
          clearTopListingsPendingId();
          if (pollUntilRef.current != null) {
            window.clearInterval(pollUntilRef.current);
            pollUntilRef.current = null;
          }
        }
      };

      void tick();
      pollUntilRef.current = window.setInterval(() => {
        void tick();
      }, 2500);
    },
    [load],
  );

  useEffect(() => {
    void load();
    if (consumeTopListingsPendingId() != null) {
      schedulePollUntilVisible();
    }
    return () => {
      if (pollUntilRef.current != null) {
        window.clearInterval(pollUntilRef.current);
      }
    };
  }, [load, schedulePollUntilVisible]);

  useEffect(() => {
    const unsub = subscribeTopListingsRefresh(({ listingId }) => {
      schedulePollUntilVisible(listingId);
    });
    const onFocus = () => {
      void load();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const keepFresh = window.setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, 30_000);

    return () => {
      unsub();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(keepFresh);
    };
  }, [load, schedulePollUntilVisible]);

  const emptyLabel = t.home_topListingsEmptyLabel ?? "Bëje TOP";
  const emptyHint = t.home_topListingsEmptyHint ?? "€2 · €5 · €8";

  return (
    <div
      className={cn("space-y-3 sm:space-y-4", className)}
      data-testid="top-listings-home-row"
      aria-labelledby="top-listings-heading"
    >
      <p
        id="top-listings-heading"
        className="text-center text-xs sm:text-sm font-black uppercase tracking-wider text-[#1A56A0]"
      >
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#1A56A0]" aria-hidden />
          {t.home_topListingsRowLabel ?? "TOP Njoftime"}
        </span>
      </p>
      <TopListingsCarousel
        listings={listings}
        loaded={loaded}
        priceFor={priceFor}
        emptyLabel={emptyLabel}
        emptyHint={emptyHint}
      />
    </div>
  );
}

/** Standalone section wrapper (category pages etc.). Homepage uses TopListingsHomeRow inside VIP block. */
export function TopListingsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn("bg-white border-b border-gray-100", className)}
      data-testid="top-listings-section"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-0">
        <TopListingsHomeRow />
      </div>
    </section>
  );
}

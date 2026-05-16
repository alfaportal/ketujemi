import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Plus, ChevronDown, TrendingUp, Shield, Zap,
  ChevronRight, ChevronLeft, Globe, SlidersHorizontal, Search, Award, Menu,
} from "lucide-react";
import * as Icons from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMarket, MARKETS, LOCATIONS } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { AuthToolbar } from "@/components/auth-toolbar";
import { useGetCategories } from "@workspace/api-client-react";
import { translateCategory, type MarketCode } from "@/lib/category-translations";

// ─── Cover photos keyed by category name prefix ───────────────────────────────
const CAT_PHOTOS: Record<string, string> = {
  "Vetura":    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80",
  "Motorr":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  "Kamion":    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&q=80",
  "Auto":      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80",
  "Banesa":    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=80",
  "Lokale":    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "Telefona":  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  "Kompjuter": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
  "TV":        "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=300&q=80",
  "Mobilje":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80",
  "Rroba":     "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80",
  "Fëmijë":   "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80",
  "Sport":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80",
  "Punë":      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80",
  "Bujqësi":  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&q=80",
  "Arsim":     "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80",
  "Muzikë":   "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80",
  "Kafshë":   "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&q=80",
};

function getCatPhoto(name: string): string | null {
  const key = Object.keys(CAT_PHOTOS).find((k) => name.startsWith(k));
  return key ? CAT_PHOTOS[key] : null;
}

// ─── Market Selector ──────────────────────────────────────────────────────────
function MarketSelector() {
  const { market, setMarket } = useMarket();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        data-testid="button-market-selector"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all text-sm font-medium min-h-12 touch-manipulation"
      >
        <span className="text-lg">{market.flag}</span>
        <span>{market.name}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full mt-2 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 min-w-[180px]">
          {MARKETS.map((m) => (
            <button
              key={m.code}
              data-testid={`option-market-${m.code}`}
              onClick={() => { setMarket(m); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${m.code === market.code ? "bg-blue-50" : ""}`}
            >
              <span className="text-xl">{m.flag}</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">{m.name}</div>
                <div className="text-sm text-gray-400">{m.prefix} · {m.currency}</div>
              </div>
              {m.code === market.code && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Animated stat counter ────────────────────────────────────────────────────
function StatCounter({ value, label }: { value: number; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const step = (ts: number) => {
          if (!start) start = ts;
          const p = Math.min((ts - start) / 1200, 1);
          setCount(Math.floor(p * value));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-black text-white tracking-tight">{count}</div>
      <div className="text-sm text-blue-100 mt-1 font-medium">{label}</div>
    </div>
  );
}

/** Top sponsor strip (~1200×120 logical). */
function TopAdBanner() {
  const { t } = useMarket();
  return (
    <section
      aria-label={t.home_adAria}
      className="w-full border-b border-blue-900/10"
      style={{ background: "linear-gradient(100deg, #0c2566 0%, #1e4fcc 42%, #3b82f6 100%)" }}
    >
      <div className="mx-auto max-w-[1200px] h-[120px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 py-4 sm:py-0">
        <div className="flex-shrink-0">
          <span className="inline-block px-3 py-1 rounded-lg bg-white/15 text-[10px] font-bold uppercase tracking-widest text-white/90 border border-white/25">
            {t.home_adBadge}
          </span>
          <div className="mt-2 h-11 w-32 sm:h-14 sm:w-40 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-white/70 tracking-wide">{t.home_adLogo}</span>
          </div>
        </div>
        <div className="text-center sm:text-right text-sm sm:text-base text-white leading-snug px-2 max-w-xl">
          <p className="font-semibold">{t.home_adHeadline}</p>
          <p className="text-blue-100">
            {t.home_adContactPrefix}{" "}
            <a href="mailto:info@ketujemi.com" className="font-bold text-white underline decoration-white/50 hover:decoration-white">
              info@ketujemi.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Auto-rotating category highlights in hero . */
function HeroCategoryCarousel({
  categories,
  marketCode,
  listingsWord,
}: {
  categories: { id: number; name: string; icon?: string | null; listing_count?: number }[];
  marketCode: MarketCode;
  listingsWord: string;
}) {
  const { t } = useMarket();
  const slides = useMemo(
    () =>
      [...categories].sort((a, b) => (b.listing_count ?? 0) - (a.listing_count ?? 0)).slice(0, 8),
    [categories],
  );

  const slidesKey = useMemo(() => slides.map((s) => s.id).join(","), [slides]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setIdx(0);
  }, [slidesKey]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const cat = slides[idx];
  const localName = translateCategory(cat.name, marketCode);
  const photo = getCatPhoto(cat.name);
  const count = typeof cat.listing_count === "number" ? cat.listing_count : 0;

  const go = (dir: number) => {
    setIdx((i) => {
      const n = slides.length;
      return ((i + dir) % n + n) % n;
    });
  };

  return (
    <div className="relative mt-8 w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/20 group pb-2">
      <Link href={`/categories/${cat.id}`} className="block relative aspect-[21/9] min-h-[140px] sm:min-h-[200px] w-full max-w-full">
        {photo ? (
          <img
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-blue-950/80" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 pb-10 sm:pb-12">
          <h3 className="text-xl sm:text-3xl font-black text-white tracking-tight drop-shadow-lg">{localName}</h3>
          <p className="text-sm font-semibold text-blue-100 mt-1 drop-shadow">
            {count} {listingsWord}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={t.home_carouselPrev}
        onClick={(e) => { e.preventDefault(); go(-1); }}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 min-w-12 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 opacity-90 hover:opacity-100 transition-opacity z-10 touch-manipulation"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        aria-label={t.home_carouselNext}
        onClick={(e) => { e.preventDefault(); go(1); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 min-w-12 rounded-full bg-black/40 hover:bg-black/55 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 opacity-90 hover:opacity-100 transition-opacity z-10 touch-manipulation"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={fillPlaceholders(t.home_carouselDot, { n: i + 1 })}
            aria-current={i === idx}
            onClick={(e) => { e.preventDefault(); setIdx(i); }}
            className={`h-2 rounded-full transition-all ${i === idx ? "bg-white w-6" : "bg-white/40 w-2 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}

/** Gold partner slot inside categories grid . */
function PartnerOfMonthCard() {
  const { t } = useMarket();
  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-amber-400 shadow-[0_0_24px_-4px_rgba(251,191,36,0.55)] bg-gradient-to-b from-amber-50 via-white to-amber-50/80 hover:shadow-[0_0_28px_-2px_rgba(245,158,11,0.65)] transition-all duration-200"
      data-testid="card-partner-month"
    >
      <div className="relative h-20 overflow-hidden bg-gradient-to-br from-amber-200/90 to-yellow-600/85 flex items-center justify-center">
        <Award className="h-9 w-9 text-white/95 drop-shadow" />
      </div>
      <div className="p-2 text-center flex flex-col gap-2 flex-1">
        <div className="text-sm font-black uppercase tracking-wider text-amber-800 leading-snug">
          {t.home_monthPartnerBadge}
        </div>
        <div className="mx-auto h-12 w-[88px] rounded-lg bg-amber-100/90 border border-amber-300/80 flex items-center justify-center">
          <span className="text-sm font-bold text-amber-900/70">{t.home_adLogo}</span>
        </div>
      </div>
    </div>
  );
}

function SponsorsAboveFooterRow() {
  const { t } = useMarket();
  const placeholders = [1, 2, 3, 4, 5, 6];
  return (
    <section className="bg-gray-50 border-t border-gray-200/80" aria-labelledby="partners-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 id="partners-heading" className="text-center text-lg font-black text-gray-900 mb-8">
          {t.home_partnerHeading}
        </h2>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {placeholders.map((n) => (
            <div
              key={n}
              className="w-[120px] h-14 sm:h-16 rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-semibold text-gray-500 uppercase tracking-wide"
              data-testid={`sponsor-placeholder-${n}`}
            >
              {t.home_partnerPlaceholder}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { market, setMarket, t } = useMarket();
  const [, setLocation] = useLocation();
  const goToPostListing = useGoToPostListing();
  const { data: apiCategories } = useGetCategories();
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLoc, setFilterLoc] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const parentCategories = useMemo(
    () => (apiCategories ?? []).filter((c: any) => !c.parent_id),
    [apiCategories],
  );

  const partnerInsertIndex = Math.min(9, Math.ceil(parentCategories.length / 2));

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filterSearch) params.set("search", filterSearch);
    if (filterCategory && filterCategory !== "all") params.set("category_id", filterCategory);
    if (filterLoc && filterLoc !== "all") params.set("location", filterLoc);
    if (filterMinPrice) params.set("min_price", filterMinPrice);
    if (filterMaxPrice) params.set("max_price", filterMaxPrice);
    const qs = params.toString();
    setLocation(qs ? `/listings?${qs}` : "/listings");
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 py-3 sm:py-0 sm:h-16 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between gap-3 min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      aria-label={t.nav_menuAria}
                      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 md:hidden"
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
                          className="flex items-center rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100 min-h-12"
                        >
                          {t.nav_home}
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link
                          href="/listings"
                          className="flex items-center gap-2 rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100 min-h-12"
                        >
                          <Globe size={17} aria-hidden /> {t.title}
                        </Link>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
                <Link href="/" className="flex items-center select-none min-w-0">
                  <span className="text-xl sm:text-2xl font-black text-gray-900 truncate">KetuJemi</span>
                  <span className="text-xl sm:text-2xl font-black text-blue-500 shrink-0">.com</span>
                </Link>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <AuthToolbar variant="compact" />
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-1 sm:justify-end min-w-0">
              <Link
                href="/listings"
                className="hidden md:inline-flex flex-1 max-w-fit items-center justify-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2.5 rounded-lg hover:bg-gray-100 transition-colors min-h-12"
              >
                <Globe size={15} aria-hidden /> {t.viewAll}
              </Link>
              <button
                type="button"
                onClick={goToPostListing}
                className="flex w-full md:w-auto shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 md:py-2.5 md:min-w-[10rem] min-h-12 md:min-h-0 touch-manipulation"
              >
                <Plus size={18} aria-hidden className="sm:h-4 sm:w-4" />
                <span>{t.post}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <TopAdBanner />

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F2B7F 0%, #1A4FCC 50%, #2563EB 100%)" }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #60A5FA, transparent)" }} />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #A78BFA, transparent)" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
          <div className="flex justify-end mb-4">
            <MarketSelector />
          </div>
          <div className="text-center px-2 sm:px-0">
            <h1 className="text-[clamp(1.125rem,4.75vw,1.625rem)] sm:text-5xl lg:text-6xl leading-tight font-black text-white tracking-tight mb-3 px-1">
              {t.hero}
            </h1>
            <p className="text-base sm:text-xl text-blue-100 font-medium max-w-xl mx-auto">{t.heroSub}</p>
          </div>
          <HeroCategoryCarousel
            categories={parentCategories}
            marketCode={market.code as MarketCode}
            listingsWord={t.listingsCount}
          />
        </div>
        <div className="relative h-10 -mb-1">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 40L1440 40L1440 20C1200 40 960 0 720 20C480 40 240 0 0 20L0 40Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* ── Filter bar ── */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          {/* Search row — always visible at top */}
          <form onSubmit={(e) => { e.preventDefault(); applyFilters(); }} className="flex flex-col gap-2 mb-3 sm:flex-row sm:flex-nowrap sm:gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder={t.search}
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="w-full min-h-12 pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white touch-manipulation"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 md:py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap min-h-12 w-full md:w-auto shrink-0 touch-manipulation"
            >
              {t.searchBtn}
            </button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">{t.title}</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex w-full md:w-auto justify-center items-center gap-2 px-4 py-3 md:py-2 rounded-xl border text-sm font-semibold transition-all min-h-12 touch-manipulation ${
                showFilters
                  ? "bg-blue-600 text-white border-blue-600 shadow-md"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
              }`}
            >
              <SlidersHorizontal size={15} />
              {t.filters}
            </button>
          </div>
          {showFilters && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{t.category}</label>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder={t.all} />
                    </SelectTrigger>
                    <SelectContent className="!max-h-[300px]">
                      <SelectItem value="all">{t.all}</SelectItem>
                      {parentCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {translateCategory(cat.name, market.code)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">{t.city}</label>
                  <Select value={filterLoc} onValueChange={setFilterLoc}>
                    <SelectTrigger className="rounded-xl border-gray-200">
                      <SelectValue placeholder={t.all} />
                    </SelectTrigger>
                    <SelectContent className="!max-h-[300px]">
                      <SelectItem value="all">{t.all}</SelectItem>
                      {(LOCATIONS[market.code] ?? LOCATIONS.ks).map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    {t.minPrice} ({market.symbol})
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filterMinPrice}
                    onChange={(e) => setFilterMinPrice(e.target.value)}
                    min="0"
                    className="w-full min-h-12 px-3 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all touch-manipulation"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                    {t.maxPrice} ({market.symbol})
                  </label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filterMaxPrice}
                    onChange={(e) => setFilterMaxPrice(e.target.value)}
                    min="0"
                    className="w-full min-h-12 px-3 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all touch-manipulation"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={applyFilters}
                  className="w-full md:w-auto px-6 py-3 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm min-h-12 touch-manipulation"
                >
                  {t.apply}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Trust bar ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            {[
              { icon: Shield,     text: t.trust1 },
              { icon: Zap,        text: t.trust2 },
              { icon: TrendingUp, text: t.trust3 },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <Icon size={16} className="text-blue-500" /> {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{t.categories}</h2>
          <Link href="/listings" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            {t.viewAll} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(() => {
            const cells: ReactNode[] = [];
            parentCategories.forEach((cat: any, i: number) => {
              if (i === partnerInsertIndex) {
                cells.push(<PartnerOfMonthCard key="partner-of-month" />);
              }
              const localName = translateCategory(cat.name, market.code);
              const photo = getCatPhoto(cat.name);
              const IconComp = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Tag;
              cells.push(
                <Link
                  key={cat.id}
                  href={`/categories/${cat.id}`}
                  data-testid={`link-category-${cat.id}`}
                  className="group flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  {photo ? (
                    <div className="relative h-20 overflow-hidden">
                      <img
                        src={photo}
                        alt={localName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-blue-600/90 flex items-center justify-center">
                        <IconComp size={13} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <IconComp size={24} className="text-blue-500" />
                    </div>
                  )}
                  <div className="p-2 text-center min-w-0">
                    <div className="text-sm font-semibold text-gray-700 leading-snug hyphens-auto">{localName}</div>
                    {cat.listing_count > 0 && (
                      <div className="text-sm text-gray-400 mt-0.5">{cat.listing_count}</div>
                    )}
                  </div>
                </Link>,
              );
            });
            if (partnerInsertIndex >= parentCategories.length) {
              cells.push(<PartnerOfMonthCard key="partner-of-month-end" />);
            }
            return cells;
          })()}
        </div>
      </section>

      {/* ── Market Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div
          className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0F2B7F 0%, #2563EB 100%)" }}
        >
          <div className="text-center sm:text-left">
            <div className="flex gap-3 justify-center sm:justify-start text-3xl mb-2">
              {MARKETS.map((m) => <span key={m.code}>{m.flag}</span>)}
            </div>
            <h3 className="text-xl font-black text-white">{t.markets}</h3>
            <p className="text-blue-100 text-sm mt-1">{t.marketsTagline}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {MARKETS.map((m) => (
              <button
                key={m.code}
                data-testid={`button-market-banner-${m.code}`}
                onClick={() => setMarket(m)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  market.code === m.code
                    ? "bg-white text-blue-700 shadow-md"
                    : "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                }`}
              >
                <span>{m.flag}</span><span>{m.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <SponsorsAboveFooterRow />

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <span className="text-xl font-black text-gray-900">KetuJemi</span>
              <span className="text-xl font-black text-blue-500">.com</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-gray-600 transition-colors">{t.terms}</a>
              <a href="#" className="hover:text-gray-600 transition-colors">{t.privacy}</a>
              <a href="#" className="hover:text-gray-600 transition-colors">{t.contact}</a>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>© 2025 KetuJemi.com</span>
              <a href="/admin" className="text-gray-300 hover:text-gray-500 transition-colors text-xs">admin</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Zap, Mail, Smartphone, Tag,
  ChevronRight, Globe, SlidersHorizontal, Search, Menu,
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
import { useMarket, LOCATIONS } from "@/lib/market-context";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { useGetCategories } from "@workspace/api-client-react";
import { translateCategory, type MarketCode } from "@/lib/category-translations";
import { HomeHeroSlideshow } from "@/components/home-hero-slideshow";
import { LanguageSelector } from "@/components/language-selector";
import { SiteFooter } from "@/components/site-footer";

// --- Cover photos keyed by category name prefix -------------------------------
const CAT_PHOTOS: Record<string, string> = {
  "Vetura":    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=85",
  "Motorr":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85",
  "Kamion":    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=85",
  "Auto":      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=85",
  "Banesa":    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=85",
  "Lokale":    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85",
  "Telefona":  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=85",
  "Kompjuter": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=85",
  "TV":        "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=800&q=85",
  "Mobilje":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=85",
  "Rroba":     "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=85",
  "Fëmijë":   "https://images.pexels.com/photos/8924170/pexels-photo-8924170.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Punë":   "https://images.pexels.com/photos/15635241/pexels-photo-15635241.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Bujqësi":   "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Muzikë":   "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Kafshë":   "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=800",
  "Sport":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=85",
  "Arsim":     "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=85",
};

function getCatPhoto(name: string): string | null {
  const key = Object.keys(CAT_PHOTOS).find((k) => name.startsWith(k));
  return key ? CAT_PHOTOS[key] : null;
}

// --- Animated stat counter ----------------------------------------------------
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


function SponsorsAboveFooterRow() {
  const { t } = useMarket();
  const placeholders = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <section className="bg-gray-50 border-t border-gray-200/80" aria-labelledby="partners-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 id="partners-heading" className="text-center text-lg font-black text-gray-900 mb-8">
          {t.home_partnerHeading}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 sm:gap-6">
          {placeholders.map((n) => (
            <div
              key={n}
              className="h-14 sm:h-16 w-full rounded-xl bg-gray-200 border border-gray-300 flex items-center justify-center text-sm font-semibold text-gray-500 uppercase tracking-wide"
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

// --- Page ---------------------------------------------------------------------
export default function HomePage() {
  const { market, t } = useMarket();
  const [, setLocation] = useLocation();
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

      {/* -- Navbar -- */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-3 min-w-0 sm:h-16 sm:py-0">
            <div className="flex items-center gap-2 min-w-0 flex-1">
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
                    <nav className="mt-6 flex flex-col gap-1">
                      {(
                        [
                          ["/", t.nav_home],
                          ["/listings", t.title],
                          ["/#categories", t.categories],
                          ["/faq", t.faq],
                          ["/contact", t.contact],
                          ["/terms", t.terms],
                          ["/privacy", t.privacy],
                        ] as const
                      ).map(([href, label]) => (
                        <SheetClose asChild key={href}>
                          <Link
                            href={href}
                            className="flex items-center rounded-xl px-3 py-3 text-base font-semibold text-gray-800 hover:bg-gray-100 min-h-12 touch-manipulation"
                          >
                            {label}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
                <div className="flex items-center gap-1 min-w-0">
                  <Link href="/" className="flex items-center select-none min-w-0">
                    <span className="text-xl sm:text-2xl font-black text-gray-900 truncate">KetuJemi</span>
                    <span className="text-xl sm:text-2xl font-black text-blue-500 shrink-0">.com</span>
                  </Link>
                  <LanguageSelector />
                </div>
            </div>
            <SiteHeaderToolbar />
          </div>
        </div>
      </nav>

      {/* -- Hero -- */}
      <section className="relative w-full overflow-hidden bg-slate-800 h-[300px] sm:h-[380px] md:h-[480px] lg:h-[520px]">
        <div className="absolute inset-0 z-0">
          <HomeHeroSlideshow />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/15" aria-hidden />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start px-4 pt-[30px] text-center sm:px-6">
          <h1 className="w-full max-w-xl text-[1.2rem] leading-[1.2] font-black text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] sm:text-5xl lg:text-6xl">
            {t.hero}
          </h1>
          <p className="mt-1.5 w-full max-w-xl text-sm leading-snug font-medium text-white/95 drop-shadow-[0_1px_6px_rgba(0,0,0,0.8)] sm:mt-2 sm:text-xl sm:text-blue-100">
            {t.heroSub}
          </p>
        </div>
        <div className="relative h-10 -mb-1">
          <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="none">
            <path d="M0 40L1440 40L1440 20C1200 40 960 0 720 20C480 40 240 0 0 20L0 40Z" fill="#F9FAFB" />
          </svg>
        </div>
      </section>

      {/* -- Filter bar -- */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          {/* Search row � always visible at top */}
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
                    placeholder="8"
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

      {/* -- Trust bar -- */}
      <section className="bg-gradient-to-b from-blue-50/80 to-white border-b border-blue-100/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {[
              { icons: [Mail, Smartphone], text: t.trust1 },
              { icons: [Zap], text: t.trust2 },
              { icons: [Tag], text: t.trust3 },
            ].map(({ icons, text }) => (
              <div
                key={text}
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-5 py-3.5 sm:px-6 sm:py-4 shadow-sm"
              >
                <div className="flex items-center gap-1 shrink-0">
                  {icons.map((Icon, i) => (
                    <Icon key={i} size={22} className="text-blue-600 sm:w-6 sm:h-6" aria-hidden />
                  ))}
                </div>
                <span className="text-base sm:text-lg font-bold text-gray-800">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- Categories -- */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{t.categories}</h2>
          <Link href="/listings" className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            {t.viewAll} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {parentCategories.map((cat: any) => {
            const localName = translateCategory(cat.name, market.code);
            const photo = (cat.image_url as string | null | undefined)?.trim() || getCatPhoto(cat.name);
            const IconComp = (Icons as unknown as Record<string, React.ElementType>)[cat.icon] ?? Icons.Tag;
            return (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                data-testid={`link-category-${cat.id}`}
                className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {photo ? (
                  <div className="relative w-full rounded-t-2xl bg-gray-50 p-2 sm:p-3">
                    <img
                      src={photo}
                      alt={localName}
                      className="block w-full h-auto object-contain object-center transition-opacity duration-300 group-hover:opacity-95"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-blue-600/90 flex items-center justify-center shadow-sm">
                      <IconComp size={13} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[140px] sm:min-h-[160px] w-full items-center justify-center rounded-t-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <IconComp size={24} className="text-blue-500" />
                  </div>
                )}
                <div className="p-2 text-center min-w-0">
                  <div className="text-sm font-semibold text-gray-700 leading-snug hyphens-auto">{localName}</div>
                  {cat.listing_count > 0 && (
                    <div className="text-sm text-gray-400 mt-0.5">{cat.listing_count}</div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SponsorsAboveFooterRow />

      {/* -- Market Banner -- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div
          className="rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-left"
          style={{ background: "linear-gradient(135deg, #0F2B7F 0%, #2563EB 100%)" }}
        >
          <h3 className="text-base sm:text-lg font-black text-white leading-tight">
            {t.markets}
          </h3>
          <p className="mt-1 text-xs sm:text-sm font-medium text-blue-100 leading-snug">
            Kosovë · Shqipëri · Maqedoni · Mal i Zi · Gjermani · Zvicër · Austri · Francë · Itali · Angli · SHBA
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useLocation } from "wouter";
import {
  Zap, Mail, Smartphone, Tag,
  ChevronRight, Globe, SlidersHorizontal, Search,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategoryLucideIcon } from "@/lib/category-lucide-icon";
import { useMarket, LOCATIONS } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { SiteHeader } from "@/components/site-header";
import { useGetCategories, getGetCategoriesQueryOptions } from "@workspace/api-client-react";
import { translateCategory } from "@/lib/category-translations";
import { categoryPath } from "@/lib/category-navigation";
import { isRootCategory, sortRootCategories } from "@/lib/parent-category-slugs";
import { resolveCategoryImageUrl } from "@/lib/resolve-category-image";
import { HomeHeroSlideshow } from "@/components/home-hero-slideshow";
import { Skeleton } from "@/components/ui/skeleton";
import { VeturaSubcategoryCarousel } from "@/components/vetura-subcategory-carousel";
import { VipPartnersSection } from "@/components/vip-partners-section";
import { cn } from "@/lib/utils";
import {
  cnPrimaryBlue,
  filterToggleButtonBaseClass,
} from "@/lib/primary-button-classes";

// --- Cover photos by category slug (all 18 parent categories) ----------------
const CAT_PHOTOS_BY_SLUG: Record<string, string> = {
  vetura: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=85",
  "motorr-skuter": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85",
  "kamione-furgone": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=85",
  "auto-pjese": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=85",
  "banesa-shtepi": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=85",
  "lokale-zyre": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=85",
  telefona: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=85",
  "kompjutere-laptope": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=85",
  "tv-elektronike": "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=600&q=85",
  "mobilje-dekorime": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=85",
  "rroba-kepuce": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=85",
  femije: "https://images.pexels.com/photos/8924170/pexels-photo-8924170.jpeg?auto=compress&cs=tinysrgb&w=600",
  "sport-outdoor": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85",
  "pune-sherbime": "https://images.pexels.com/photos/15635241/pexels-photo-15635241.jpeg?auto=compress&cs=tinysrgb&w=600",
  "bujqesi-blegtori": "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=600",
  "arsim-kurse": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=85",
  "muzike-hobby": "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=600",
  kafshet: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600",
};

function getCatPhoto(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return CAT_PHOTOS_BY_SLUG[slug] ?? null;
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
// --- Page ---------------------------------------------------------------------
export default function HomePage() {
  const { market, t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const [, setLocation] = useLocation();
  const {
    data: apiCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useGetCategories({
    query: {
      ...getGetCategoriesQueryOptions(),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
    },
  });
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLoc, setFilterLoc] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  const parentCategories = useMemo(
    () => sortRootCategories((apiCategories ?? []).filter((c: any) => isRootCategory(c))),
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

      <SiteHeader />

      {/* -- Hero -- */}
      <section className="relative w-full overflow-hidden bg-slate-800 h-[300px] sm:h-[380px] md:h-[480px] lg:h-[520px]">
        <div className="absolute inset-0 z-0">
          <HomeHeroSlideshow />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/15" aria-hidden />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-start px-4 pt-[30px] text-center sm:px-6">
          <h1 className="w-full max-w-xl text-[1.2rem] leading-[1.2] font-black tracking-tight text-[#1A6FD4] drop-shadow-[0_1px_6px_rgba(255,255,255,0.9)] sm:text-5xl lg:text-6xl">
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

      <VeturaSubcategoryCarousel categories={(apiCategories ?? []) as any} />

      {/* -- Filter bar -- */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          {/* Search row ? always visible at top */}
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
            <button type="submit" className={cnPrimaryBlue("w-full md:w-auto")}>
              {t.searchBtn}
            </button>
          </form>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <span className="text-sm font-bold text-gray-700">{t.title}</span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                filterToggleButtonBaseClass,
                showFilters
                  ? "bg-blue-600 text-white border-blue-600 shadow-md hover:bg-blue-700"
                  : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 shadow-none",
              )}
            >
              <SlidersHorizontal size={15} />
              {t.filters}
            </button>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-3" aria-label="Platform benefits">
            {[
              { icons: [Mail, Smartphone], text: t.trust1 },
              { icons: [Zap], text: t.trust2 },
              { icons: [Tag], text: t.trust3 },
            ].map(({ icons, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm"
              >
                <div className="flex items-center gap-1 shrink-0">
                  {icons.map((Icon, i) => (
                    <Icon key={i} size={18} className="text-blue-600 sm:w-5 sm:h-5" aria-hidden />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-800">{text}</span>
              </div>
            ))}
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
                          {translateCategory(cat.name, locale)}
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
                  type="button"
                  onClick={applyFilters}
                  className={cnPrimaryBlue("w-full md:w-auto font-bold")}
                >
                  {t.apply}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* -- Categories (mobile-first: 2 cols, compact photos, natural API order) -- */}
      <section id="categories" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-2xl font-black text-gray-900">{t.categories}</h2>
          <Link href="/listings" className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors shrink-0">
            {t.viewAll} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {categoriesLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[5/3] w-full rounded-xl sm:rounded-2xl" />
              ))
            : null}
          {categoriesError && !categoriesLoading ? (
            <p className="col-span-full text-sm text-red-600 py-4">
              Kategoritë nuk u ngarkuan. Rifreskoni faqen.
            </p>
          ) : null}
          {!categoriesLoading && !categoriesError
            ? parentCategories.map((cat: any) => {
            const localName = translateCategory(cat.name, locale);
            const photo = resolveCategoryImageUrl(cat) || getCatPhoto(cat.slug);
            const IconComp = getCategoryLucideIcon(cat.icon);
            return (
              <Link
                key={cat.id}
                href={categoryPath(cat.id)}
                data-testid={`link-category-${cat.id}`}
                className="group flex flex-col bg-white rounded-xl sm:rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
              >
                {photo ? (
                  <div className="relative aspect-[5/3] w-full shrink-0 overflow-hidden rounded-t-xl sm:rounded-t-2xl bg-gray-100">
                    <img
                      src={photo}
                      alt={localName}
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 group-hover:opacity-95"
                    />
                    <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-blue-600/90 flex items-center justify-center shadow-sm">
                      <IconComp size={11} className="text-white sm:hidden" />
                      <IconComp size={13} className="text-white hidden sm:block" />
                    </div>
                  </div>
                ) : (
                  <div className="relative flex aspect-[5/3] w-full shrink-0 items-center justify-center rounded-t-xl sm:rounded-t-2xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                    <IconComp size={22} className="text-blue-500 sm:hidden" />
                    <IconComp size={24} className="text-blue-500 hidden sm:block" />
                  </div>
                )}
                <div className="px-1.5 py-2 sm:p-2 text-center min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-gray-700 leading-snug line-clamp-2 hyphens-auto">{localName}</div>
                  {cat.listing_count > 0 && (
                    <div className="text-xs sm:text-sm text-gray-400 mt-0.5">{cat.listing_count}</div>
                  )}
                </div>
              </Link>
            );
          })
            : null}
        </div>
      </section>

      <VipPartnersSection variant="home" />

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
            {t.marketsBannerLine}
          </p>
        </div>
      </section>

    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";
import { cn } from "@/lib/utils";

const BANNER_SLIDES = [
  {
    label: "Banesa",
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
  },
  {
    label: "Shtëpi",
    url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800",
  },
  {
    label: "Automobila",
    url: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
  },
  {
    label: "Telefona",
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
  },
  {
    label: "Moda & Veshje",
    url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
  },
  {
    label: "Shtëpi & Mobilje",
    url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  },
] as const;

const SLIDE_INTERVAL_MS = 3000;

export function ShopDirectoryHomeBanner() {
  const d = useShopDirectoryCopy();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, SLIDE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="w-full px-0 pt-5 sm:pt-6 pb-0">
      <div className="relative max-w-7xl mx-auto min-h-[200px] sm:min-h-[240px] md:min-h-[280px] rounded-2xl sm:rounded-3xl overflow-hidden text-white shadow-lg">
        {BANNER_SLIDES.map((slide, index) => (
          <div
            key={slide.url}
            aria-hidden={index !== activeSlide}
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out",
              index === activeSlide ? "opacity-100" : "opacity-0",
            )}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}

        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${BRAND_BLUE}cc 0%, ${BRAND_ORANGE}cc 55%, ${BRAND_BLUE}99 100%)`,
          }}
        />

        <div className="relative z-10 flex min-h-[200px] sm:min-h-[240px] md:min-h-[280px] flex-col justify-between p-6 sm:p-10">
          <div className="max-w-2xl">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black leading-tight text-white drop-shadow-sm">
              {d.homeBannerTitle}
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/95 leading-relaxed drop-shadow-sm">
              {d.homeBannerSubtitle}
            </p>
            <Link
              href="/dyqanet"
              className="mt-4 sm:mt-6 inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm sm:text-base font-black text-blue-700 hover:bg-blue-50 transition-colors shadow-md"
            >
              {d.homeBannerBtn}
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2">
            {BANNER_SLIDES.map((slide, index) => (
              <button
                key={slide.url}
                type="button"
                aria-label={slide.label}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => setActiveSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/75",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

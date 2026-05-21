import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";
import { categoryPath } from "@/lib/category-navigation";
import { buildVeturaCarouselSlides } from "@/lib/vetura-body-match";
import { cn } from "@/lib/utils";

const ROTATE_MS = 5_000;

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  categories: CategoryRow[];
};

export function VeturaSubcategoryCarousel({ categories }: Props) {
  const { t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const slides = useMemo(
    () =>
      buildVeturaCarouselSlides(
        categories,
        (name) => translateCategory(name, locale),
        categoryPath,
      ),
    [categories, locale],
  );

  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    setIndex(0);
  }, [count]);

  useEffect(() => {
    if (count < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [count]);

  if (count === 0) return null;

  const slide = slides[index];

  const go = (delta: number) => {
    setIndex((i) => (i + delta + count) % count);
  };

  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-5">
        <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3">
          {t.categories} — Vetura
        </h2>
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 aspect-[21/9] sm:aspect-[2.4/1]">
          <Link
            href={slide.href}
            className="block absolute inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label={slide.name}
          >
            <img
              src={slide.imageUrl}
              alt={slide.name}
              draggable={false}
              loading="eager"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <p className="absolute bottom-4 left-4 right-14 text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
              {slide.name}
            </p>
          </Link>

          {count > 1 ? (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/45 p-2 text-white hover:bg-black/60"
                aria-label={t.home_carouselPrev}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/45 p-2 text-white hover:bg-black/60"
                aria-label={t.home_carouselNext}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    aria-label={t.home_carouselDot.replace("{n}", String(i + 1))}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-colors",
                      i === index ? "bg-white" : "bg-white/45 hover:bg-white/70",
                    )}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";

const HOME_HERO_SLIDESHOW_MS = 10_000;

const HOME_HERO_SLIDES = [
  { id: "18369292", label: "Vetura" },
  { id: "2607076", label: "Motorr & Skuter" },
  { id: "29206469", label: "Kamionë & Furgonë" },
  { id: "14231680", label: "Auto Pjesë" },
  { id: "27568715", label: "Telefona" },
  { id: "15601231", label: "Kompjuterë & Laptopë" },
  { id: "30322395", label: "Lokale & Zyrë" },
  { id: "34360412", label: "Banesa & Shtëpi" },
  { id: "34377944", label: "Mobilje & Dekorime" },
  { id: "12700580", label: "Rroba & Këpucë" },
] as const;

function heroSlideSrc(photoId: string, width: number): string {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

function heroSlideSrcSet(photoId: string): string {
  return [
    `${heroSlideSrc(photoId, 480)} 480w`,
    `${heroSlideSrc(photoId, 800)} 800w`,
    `${heroSlideSrc(photoId, 1280)} 1280w`,
  ].join(", ");
}

/** Full-bleed background slideshow for the homepage hero only. */
export function HomeHeroSlideshow() {
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = HOME_HERO_SLIDES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, HOME_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  const visibleIndices = new Set([
    currentIndex,
    (currentIndex + 1) % count,
  ]);

  return (
    <div className="absolute inset-0 bg-slate-900">
      {HOME_HERO_SLIDES.map((slide, i) => {
        if (!visibleIndices.has(i)) return null;
        const isActive = i === currentIndex;
        return (
          <img
            key={slide.id}
            src={heroSlideSrc(slide.id, isActive ? 800 : 480)}
            srcSet={heroSlideSrcSet(slide.id)}
            sizes="100vw"
            alt=""
            draggable={false}
            loading={isActive ? "eager" : "lazy"}
            fetchPriority={isActive ? "high" : "low"}
            decoding="async"
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out",
              isActive ? "opacity-100" : "opacity-0",
            )}
          />
        );
      })}
      {HOME_HERO_SLIDES.map((slide, i) => (
        <p
          key={`${slide.id}-label`}
          className={cn(
            "absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 z-[1] max-w-[85%] text-left text-xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg transition-opacity duration-1000 ease-in-out",
            i === currentIndex ? "opacity-100" : "opacity-0",
          )}
        >
          {translateCategory(slide.label, locale)}
        </p>
      ))}
    </div>
  );
}

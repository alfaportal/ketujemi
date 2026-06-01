import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";

const HOME_HERO_SLIDESHOW_MS = 10_000;

const HOME_HERO_SLIDES = [
  {
    url: "https://images.pexels.com/photos/18369292/pexels-photo-18369292.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Vetura",
  },
  {
    url: "https://images.pexels.com/photos/2607076/pexels-photo-2607076.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Motorr & Skuter",
  },
  {
    url: "https://images.pexels.com/photos/29206469/pexels-photo-29206469.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Kamionë & Furgonë",
  },
  {
    url: "https://images.pexels.com/photos/14231680/pexels-photo-14231680.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Auto Pjesë",
  },
  {
    url: "https://images.pexels.com/photos/27568715/pexels-photo-27568715.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Telefona",
  },
  {
    url: "https://images.pexels.com/photos/15601231/pexels-photo-15601231.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Kompjuterë & Laptopë",
  },
  {
    url: "https://images.pexels.com/photos/30322395/pexels-photo-30322395.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Lokale & Zyrë",
  },
  {
    url: "https://images.pexels.com/photos/34360412/pexels-photo-34360412.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Banesa & Shtëpi",
  },
  {
    url: "https://images.pexels.com/photos/34377944/pexels-photo-34377944.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Mobilje & Dekorime",
  },
  {
    url: "https://images.pexels.com/photos/12700580/pexels-photo-12700580.jpeg?auto=compress&cs=tinysrgb&w=1920",
    label: "Rroba & Këpucë",
  },
] as const;

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

  return (
    <div className="absolute inset-0 bg-slate-900">
      {HOME_HERO_SLIDES.map((slide, i) => (
        <img
          key={slide.url}
          src={slide.url}
          alt=""
          draggable={false}
          loading={i === 0 ? "eager" : "lazy"}
          sizes="100vw"
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ease-in-out",
            i === currentIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
      {HOME_HERO_SLIDES.map((slide, i) => (
        <p
          key={`${slide.url}-label`}
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

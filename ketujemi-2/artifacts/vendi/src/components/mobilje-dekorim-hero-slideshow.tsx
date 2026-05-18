import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MOBILJE_DEKORIM_HERO_SLIDESHOW_MS = 5_000;
const MOBILJE_DEKORIM_HERO_IMAGES = [
  "https://images.pexels.com/photos/7535007/pexels-photo-7535007.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/8089158/pexels-photo-8089158.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/8135121/pexels-photo-8135121.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Mobilje & Dekorim hub hero only. */
export function MobiljeDekorimHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = MOBILJE_DEKORIM_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, MOBILJE_DEKORIM_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {MOBILJE_DEKORIM_HERO_IMAGES.map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          draggable={false}
          loading={i === 0 ? "eager" : "lazy"}
          sizes="100vw"
          className={cn(
            "absolute inset-0 h-full w-full object-cover max-w-none transition-opacity duration-1000 ease-in-out",
            i === currentIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DHURATA_HERO_SLIDESHOW_MS = 5_000;
export const DHURATA_FALAS_HERO_SLIDESHOW_URLS = [
  "https://images.pexels.com/photos/8257936/pexels-photo-8257936.jpeg?w=1920&q=80",
  "https://images.pexels.com/photos/6612087/pexels-photo-6612087.jpeg?w=1920&q=80",
  "https://images.pexels.com/photos/11794849/pexels-photo-11794849.jpeg?w=1920&q=80",
] as const;

/** Full-bleed background slideshow for the Dhurata & Falas hub hero. */
export function DhurataFalasHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = DHURATA_FALAS_HERO_SLIDESHOW_URLS.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, DHURATA_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {DHURATA_FALAS_HERO_SLIDESHOW_URLS.map((url, i) => (
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

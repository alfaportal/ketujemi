import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KERKOJ_HERO_SLIDESHOW_MS = 5_000;
export const KERKOJ_TE_BLEJ_HERO_SLIDESHOW_URLS = [
  "https://images.pexels.com/photos/6633607/pexels-photo-6633607.jpeg?w=1920&q=80",
  "https://images.pexels.com/photos/6348124/pexels-photo-6348124.jpeg?w=1920&q=80",
  "https://images.pexels.com/photos/6331237/pexels-photo-6331237.jpeg?w=1920&q=80",
] as const;

/** Full-bleed background slideshow for the Kërkoj të Blej hub hero. */
export function KerkojTeBlejHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KERKOJ_TE_BLEJ_HERO_SLIDESHOW_URLS.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KERKOJ_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {KERKOJ_TE_BLEJ_HERO_SLIDESHOW_URLS.map((url, i) => (
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

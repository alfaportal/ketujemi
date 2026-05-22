import { useEffect, useState } from "react";
import { KAMIONE_HUB_SLIDESHOW_URLS } from "@/lib/category-hub-hero-images";
import { cn } from "@/lib/utils";

const KAMIONE_HERO_SLIDESHOW_MS = 5_000;

/** Full-bleed background slideshow for the Kamionë & Furgonë hub hero only. */
export function KamioneHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KAMIONE_HUB_SLIDESHOW_URLS.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KAMIONE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {KAMIONE_HUB_SLIDESHOW_URLS.map((url, i) => (
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

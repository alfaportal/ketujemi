import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const NDERTIM_INSTALIME_HERO_SLIDESHOW_MS = 5_000;
const NDERTIM_INSTALIME_HERO_IMAGES = [
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1503387762-592deb58ef03?w=1920&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80&auto=format&fit=crop",
] as const;

/** Full-bleed background slideshow for the Ndërtim & Instalime hub hero only. */
export function NdertimInstalimeHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = NDERTIM_INSTALIME_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, NDERTIM_INSTALIME_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {NDERTIM_INSTALIME_HERO_IMAGES.map((url, i) => (
        <img
          key={url}
          src={url}
          alt=""
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000",
            i === currentIndex ? "opacity-100" : "opacity-0",
          )}
        />
      ))}
    </div>
  );
}

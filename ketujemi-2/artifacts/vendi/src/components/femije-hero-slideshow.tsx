import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const FEMIJE_HERO_SLIDESHOW_MS = 5_000;
const FEMIJE_HERO_IMAGES = [
  "https://images.pexels.com/photos/34247693/pexels-photo-34247693.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/36276518/pexels-photo-36276518.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/32452348/pexels-photo-32452348.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Fëmijë hub hero only. */
export function FemijeHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = FEMIJE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, FEMIJE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {FEMIJE_HERO_IMAGES.map((url, i) => (
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

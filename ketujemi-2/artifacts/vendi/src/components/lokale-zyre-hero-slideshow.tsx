import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LOKALE_ZYRE_HERO_SLIDESHOW_MS = 5_000;
const LOKALE_ZYRE_HERO_IMAGES = [
  "https://images.pexels.com/photos/16140813/pexels-photo-16140813.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/5968300/pexels-photo-5968300.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Lokale & Zyrë hub hero only. */
export function LokaleZyreHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = LOKALE_ZYRE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, LOKALE_ZYRE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {LOKALE_ZYRE_HERO_IMAGES.map((url, i) => (
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

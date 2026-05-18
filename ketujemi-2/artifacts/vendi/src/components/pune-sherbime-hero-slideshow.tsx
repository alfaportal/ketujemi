import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PUNE_SHERBIME_HERO_SLIDESHOW_MS = 5_000;
const PUNE_SHERBIME_HERO_IMAGES = [
  "https://images.pexels.com/photos/15671380/pexels-photo-15671380.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/15635241/pexels-photo-15635241.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/14537425/pexels-photo-14537425.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Punë & Shërbime hub hero only. */
export function PuneSherbimeHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = PUNE_SHERBIME_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, PUNE_SHERBIME_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {PUNE_SHERBIME_HERO_IMAGES.map((url, i) => (
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

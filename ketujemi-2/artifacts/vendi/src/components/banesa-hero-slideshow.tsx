import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BANESA_HERO_SLIDESHOW_MS = 5_000;
const BANESA_HERO_IMAGES = [
  "https://images.pexels.com/photos/5717997/pexels-photo-5717997.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/29838988/pexels-photo-29838988.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/27075286/pexels-photo-27075286.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Banesa & Shtëpi hub hero only. */
export function BanesaHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = BANESA_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, BANESA_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {BANESA_HERO_IMAGES.map((url, i) => (
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

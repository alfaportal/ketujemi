import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const AUTO_PJESE_HERO_SLIDESHOW_MS = 5_000;
const AUTO_PJESE_HERO_IMAGES = [
  "https://images.pexels.com/photos/18038877/pexels-photo-18038877.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/13718612/pexels-photo-13718612.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/34261013/pexels-photo-34261013.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Auto Pjesë hub hero only. */
export function AutoPjeseHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = AUTO_PJESE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, AUTO_PJESE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {AUTO_PJESE_HERO_IMAGES.map((url, i) => (
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

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KOMPJUTER_LAPTOP_HERO_SLIDESHOW_MS = 5_000;
const KOMPJUTER_LAPTOP_HERO_IMAGES = [
  "https://images.pexels.com/photos/18304031/pexels-photo-18304031.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/28907898/pexels-photo-28907898.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/33384272/pexels-photo-33384272.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Kompjuterë & Laptopë hub hero only. */
export function KompjuterLaptopHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KOMPJUTER_LAPTOP_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KOMPJUTER_LAPTOP_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {KOMPJUTER_LAPTOP_HERO_IMAGES.map((url, i) => (
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

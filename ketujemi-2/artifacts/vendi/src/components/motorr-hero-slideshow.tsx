import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MOTORR_HERO_SLIDESHOW_MS = 5_000;
const MOTORR_HERO_IMAGES = [
  "https://images.pexels.com/photos/33975504/pexels-photo-33975504.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/13336570/pexels-photo-13336570.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/8194539/pexels-photo-8194539.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Motorr & Skuter hub hero only. */
export function MotorrHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = MOTORR_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, MOTORR_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {MOTORR_HERO_IMAGES.map((url, i) => (
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

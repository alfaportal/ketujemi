import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SPORT_OUTDOOR_HERO_SLIDESHOW_MS = 5_000;
const SPORT_OUTDOOR_HERO_IMAGES = [
  "https://images.pexels.com/photos/36862523/pexels-photo-36862523.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/11012422/pexels-photo-11012422.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/11124985/pexels-photo-11124985.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Sport & Outdoor hub hero only. */
export function SportOutdoorHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = SPORT_OUTDOOR_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, SPORT_OUTDOOR_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {SPORT_OUTDOOR_HERO_IMAGES.map((url, i) => (
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

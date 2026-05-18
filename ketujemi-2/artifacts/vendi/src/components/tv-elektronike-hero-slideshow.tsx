import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TV_ELEKTRONIKE_HERO_SLIDESHOW_MS = 5_000;
const TV_ELEKTRONIKE_HERO_IMAGES = [
  "https://images.pexels.com/photos/18071814/pexels-photo-18071814.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/6835094/pexels-photo-6835094.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/8082206/pexels-photo-8082206.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Elektronikë & Pajisje Shtëpiake hub hero only. */
export function TvElektronikeHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = TV_ELEKTRONIKE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, TV_ELEKTRONIKE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {TV_ELEKTRONIKE_HERO_IMAGES.map((url, i) => (
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

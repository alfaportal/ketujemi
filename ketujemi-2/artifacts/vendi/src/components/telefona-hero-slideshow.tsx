import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const TELEFONA_HERO_SLIDESHOW_MS = 5_000;
const TELEFONA_HERO_IMAGES = [
  "https://images.pexels.com/photos/33358389/pexels-photo-33358389.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/28927517/pexels-photo-28927517.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/16004744/pexels-photo-16004744.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Telefona hub hero only. */
export function TelefonaHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = TELEFONA_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, TELEFONA_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {TELEFONA_HERO_IMAGES.map((url, i) => (
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

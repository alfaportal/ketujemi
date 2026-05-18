import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const RROBA_KEPUCE_HERO_SLIDESHOW_MS = 5_000;
const RROBA_KEPUCE_HERO_IMAGES = [
  "https://images.pexels.com/photos/36906953/pexels-photo-36906953.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/18761008/pexels-photo-18761008.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/12252411/pexels-photo-12252411.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Rroba & Këpucë hub hero only. */
export function RrobaKepuceHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = RROBA_KEPUCE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, RROBA_KEPUCE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {RROBA_KEPUCE_HERO_IMAGES.map((url, i) => (
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

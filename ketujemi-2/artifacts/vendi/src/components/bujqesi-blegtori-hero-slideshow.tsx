import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BUJQESI_BLEGTORI_HERO_SLIDESHOW_MS = 5_000;
const BUJQESI_BLEGTORI_HERO_IMAGES = [
  "https://images.pexels.com/photos/28836974/pexels-photo-28836974.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/35288648/pexels-photo-35288648.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/28928307/pexels-photo-28928307.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Bujqësi & Blegtori hub hero only. */
export function BujqesiBlegtoriHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = BUJQESI_BLEGTORI_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, BUJQESI_BLEGTORI_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {BUJQESI_BLEGTORI_HERO_IMAGES.map((url, i) => (
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

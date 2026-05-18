import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KAFSHET_HERO_SLIDESHOW_MS = 5_000;
const KAFSHET_HERO_IMAGES = [
  "https://images.pexels.com/photos/8434633/pexels-photo-8434633.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/17662301/pexels-photo-17662301.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/33415928/pexels-photo-33415928.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Kafshë Shtëpiake hub hero only. */
export function KafshetHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KAFSHET_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KAFSHET_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {KAFSHET_HERO_IMAGES.map((url, i) => (
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

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const KAMIONE_HERO_SLIDESHOW_MS = 5_000;
const KAMIONE_HERO_IMAGES = [
  "https://images.pexels.com/photos/19871521/pexels-photo-19871521.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/18468424/pexels-photo-18468424.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/16100083/pexels-photo-16100083.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Kamionë & Furgonë hub hero only. */
export function KamioneHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KAMIONE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KAMIONE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {KAMIONE_HERO_IMAGES.map((url, i) => (
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

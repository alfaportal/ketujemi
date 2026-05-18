import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const ARSIM_KURSE_HERO_SLIDESHOW_MS = 5_000;
const ARSIM_KURSE_HERO_IMAGES = [
  "https://images.pexels.com/photos/14814060/pexels-photo-14814060.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/8761523/pexels-photo-8761523.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/5212336/pexels-photo-5212336.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Arsim & Kurse hub hero only. */
export function ArsimKurseHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = ARSIM_KURSE_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, ARSIM_KURSE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {ARSIM_KURSE_HERO_IMAGES.map((url, i) => (
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

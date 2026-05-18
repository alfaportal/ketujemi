import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const MUZIKE_HOBBY_HERO_SLIDESHOW_MS = 5_000;
const MUZIKE_HOBBY_HERO_IMAGES = [
  "https://images.pexels.com/photos/27677835/pexels-photo-27677835.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/7605922/pexels-photo-7605922.jpeg?auto=compress&cs=tinysrgb&w=1920",
  "https://images.pexels.com/photos/16532542/pexels-photo-16532542.jpeg?auto=compress&cs=tinysrgb&w=1920",
] as const;

/** Full-bleed background slideshow for the Muzikë & Hobby hub hero only. */
export function MuzikeHobbyHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = MUZIKE_HOBBY_HERO_IMAGES.length;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, MUZIKE_HOBBY_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="absolute inset-0" aria-hidden>
      {MUZIKE_HOBBY_HERO_IMAGES.map((url, i) => (
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

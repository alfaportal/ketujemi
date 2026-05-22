import { useEffect, useState } from "react";
import {
  VETURA_BODY_IMAGE_BY_SLUG,
  VETURA_BODY_SLUG_ORDER,
} from "@/lib/vetura-body-images";
import { cn } from "@/lib/utils";

const VETURA_HERO_SLIDESHOW_MS = 5_000;
const VETURA_HERO_IMAGES = VETURA_BODY_SLUG_ORDER.map(
  (slug) => VETURA_BODY_IMAGE_BY_SLUG[slug],
).filter((url): url is string => !!url);

/** Full-bleed background slideshow for the Vetura hub hero only. */
export function VeturaHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = VETURA_HERO_IMAGES.length;

  useEffect(() => {
    if (count < 2) return;
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, VETURA_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  if (count === 0) return null;

  return (
    <div className="absolute inset-0" aria-hidden>
      {VETURA_HERO_IMAGES.map((url, i) => (
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

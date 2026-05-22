import { useEffect, useState } from "react";
import { SUBCATEGORY_IMAGE_URL_BY_SLUG } from "@workspace/category-images";
import { cn } from "@/lib/utils";

const KAMIONE_HERO_SLIDESHOW_MS = 5_000;
const w1920 = (url: string) => url.replace(/w=\d+/, "w=1920");

const KAMIONE_HERO_IMAGES = [
  "kamione-type-kamione",
  "kamione-type-furgone",
  "kamione-type-autobuse",
  "kamione-type-auto-bartes",
  "kamione-type-mauna",
]
  .map((slug) => SUBCATEGORY_IMAGE_URL_BY_SLUG[slug])
  .filter((url): url is string => !!url)
  .map(w1920);

/** Full-bleed background slideshow for the Kamionë & Furgonë hub hero only. */
export function KamioneHeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const count = KAMIONE_HERO_IMAGES.length;

  useEffect(() => {
    if (count < 2) return;
    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % count);
    }, KAMIONE_HERO_SLIDESHOW_MS);
    return () => window.clearInterval(intervalId);
  }, [count]);

  if (count === 0) return null;

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

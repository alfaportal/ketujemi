import { pexelsPhoto } from "@workspace/category-images";

const p = (id: number, w = 1920) => pexelsPhoto(id, w);

/** Stable parent-category photos (explicit Pexels ids — do not use DB image_url for roots). */
export const HUB_HERO_IMAGE_BY_SLUG: Record<string, string> = {
  vetura: p(170811),
  "motorr-skuter": p(5720562),
  "kamione-furgone": p(1716158),
  "auto-pjese": p(163845),
  "banesa-shtepi": p(1396122),
  "lokale-zyre": p(7046155),
  telefona: p(887751),
  "kompjutere-laptope": p(5716052),
  "tv-elektronike": p(1571456),
  "mobilje-dekorime": p(1646792),
  "rroba-kepuce": p(267320),
  femije: p(294173),
  "sport-outdoor": p(2882234),
  "pune-sherbime": p(11035380),
  "bujqesi-blegtori": p(15833963),
  "arsim-kurse": p(6140102),
  "muzike-hobby": p(5156947),
  kafshet: p(1805164),
};

/** Homepage grid thumbnails (600px). */
export const HUB_THUMB_IMAGE_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(HUB_HERO_IMAGE_BY_SLUG).map(([slug, url]) => [
    slug,
    url.replace(/w=\d+/, "w=600"),
  ]),
);

/** Unsplash fallback when a Pexels CDN URL fails in the browser. */
export const HUB_THUMB_FALLBACK_BY_SLUG: Record<string, string> = {
  vetura: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80",
  "motorr-skuter": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "kamione-furgone": "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&q=80",
  "auto-pjese": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80",
  "banesa-shtepi": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
  "lokale-zyre": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  telefona: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
  "kompjutere-laptope": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
  "tv-elektronike": "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=600&q=80",
  "mobilje-dekorime": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
  "rroba-kepuce": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80",
  femije: "https://images.pexels.com/photos/8924170/pexels-photo-8924170.jpeg?auto=compress&cs=tinysrgb&w=600",
  "sport-outdoor": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "pune-sherbime": "https://images.pexels.com/photos/15635241/pexels-photo-15635241.jpeg?auto=compress&cs=tinysrgb&w=600",
  "bujqesi-blegtori": "https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=600",
  "arsim-kurse": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  "muzike-hobby": "https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=600",
  kafshet: "https://images.pexels.com/photos/1805164/pexels-photo-1805164.jpeg?auto=compress&cs=tinysrgb&w=600",
};

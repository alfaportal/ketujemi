import { pexelsPhoto } from "@workspace/category-images";
import { PARENT_CATEGORY_SLUG_ORDER } from "@/lib/parent-category-slugs";

const p = (id: number, w = 1920) => pexelsPhoto(id, w);

const unsplash = (id: string, w = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80`;

/** Stable parent-category hero photos (hub banners). */
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
  "rroba-kepuce": p(1927258),
  femije: p(294173),
  "sport-outdoor": p(2882234),
  "pune-sherbime": p(3184464),
  "bujqesi-blegtori": p(15833963),
  "arsim-kurse": p(6140102),
  "muzike-hobby": p(5156947),
  kafshet: p(1805164),
};

/**
 * Homepage grid — reliable CDN URLs (Unsplash for categories that were showing wrong DB photos).
 */
export const HUB_THUMB_IMAGE_BY_SLUG: Record<string, string> = {
  vetura: unsplash("1494976388531-d1058494cdd8"),
  "motorr-skuter": unsplash("1558618666-fcd25c85cd64"),
  "kamione-furgone": unsplash("1601584115197-04ecc0da31d7"),
  "auto-pjese": unsplash("1486262715619-67b85e0b08d3"),
  "banesa-shtepi": unsplash("1560448204-e02f11c3d0e2"),
  "lokale-zyre": unsplash("1497366216548-37526070297c"),
  telefona: unsplash("1511707171634-5f897ff02aa9"),
  "kompjutere-laptope": unsplash("1496181133206-80ce9b88a853"),
  "tv-elektronike": unsplash("1593344484962-796055d4a3a4"),
  "mobilje-dekorime": unsplash("1555041469-a586c61ea9bc"),
  "rroba-kepuce": unsplash("1523381210434-271e8be1f52b"),
  femije: p(8924170, 600),
  "sport-outdoor": unsplash("1571019613454-1cb2f99b2d8b"),
  "pune-sherbime": unsplash("1507679799987-c73779587ccf"),
  "bujqesi-blegtori": p(2933243, 600).replace(/w=\d+/, "w=600"),
  "arsim-kurse": unsplash("1503676260728-1c00da094a0b"),
  "muzike-hobby": p(1407322, 600).replace(/w=\d+/, "w=600"),
  kafshet: p(1805164, 600).replace(/w=\d+/, "w=600"),
};

export const HUB_THUMB_FALLBACK_BY_SLUG: Record<string, string> = {
  ...HUB_THUMB_IMAGE_BY_SLUG,
};

/** Match seeded Albanian parent names when API slug is missing. */
export const PARENT_NAME_TO_SLUG: Record<string, string> = {
  "Motorr & Skuter": "motorr-skuter",
  "Kamionë & Furgonë": "kamione-furgone",
  "Auto Pjesë": "auto-pjese",
  "Banesa & Shtëpi": "banesa-shtepi",
  "Lokale & Zyrë": "lokale-zyre",
  Telefona: "telefona",
  "Kompjuterë & Laptopë": "kompjutere-laptope",
  "Elektronikë & Pajisje Shtëpiake": "tv-elektronike",
  "Mobilje & Dekorime": "mobilje-dekorime",
  "Rroba & Këpucë": "rroba-kepuce",
  Fëmijë: "femije",
  "Sport & Outdoor": "sport-outdoor",
  "Punë & Shërbime": "pune-sherbime",
  "Bujqësi & Blegtori": "bujqesi-blegtori",
  "Arsim & Kurse": "arsim-kurse",
  "Muzikë & Hobby": "muzike-hobby",
  Kafshë: "kafshet",
  Vetura: "vetura",
};

const PARENT_SLUG_SET = new Set<string>(PARENT_CATEGORY_SLUG_ORDER);

/** Homepage / grid: always curated thumb, never stale DB image_url on parents. */
export function getParentCategoryThumb(
  slug: string | null | undefined,
  name?: string | null,
): string | null {
  const s = slug?.trim();
  if (s && HUB_THUMB_IMAGE_BY_SLUG[s]) return HUB_THUMB_IMAGE_BY_SLUG[s];
  const mapped = name?.trim() ? PARENT_NAME_TO_SLUG[name.trim()] : undefined;
  if (mapped && HUB_THUMB_IMAGE_BY_SLUG[mapped]) return HUB_THUMB_IMAGE_BY_SLUG[mapped];
  return null;
}

export function isKnownParentSlug(slug: string | null | undefined): boolean {
  const s = slug?.trim();
  return !!s && PARENT_SLUG_SET.has(s);
}

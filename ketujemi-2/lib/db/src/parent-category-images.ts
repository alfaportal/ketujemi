/**
 * PARENT CATEGORY PHOTOS — ndrysho URL-t këtu kur të duash t’i zëvendësosh vetë.
 * Pas ndryshimit: pnpm --filter @workspace/db run seed:parent-images
 * (Railway e ekzekuton automatikisht në deploy.)
 */

export const PARENT_CATEGORY_SLUGS = [
  "vetura",
  "motorr-skuter",
  "kamione-furgone",
  "auto-pjese",
  "banesa-shtepi",
  "lokale-zyre",
  "telefona",
  "kompjutere-laptope",
  "tv-elektronike",
  "mobilje-dekorime",
  "rroba-kepuce",
  "femije",
  "sport-outdoor",
  "pune-sherbime",
  "bujqesi-blegtori",
  "arsim-kurse",
  "muzike-hobby",
  "kafshet",
  "kerkoj-te-blej",
  "dhurata-falas",
] as const;

export type ParentCategorySlug = (typeof PARENT_CATEGORY_SLUGS)[number];

const unsplash = (photoId: string, w: number) =>
  `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80&auto=format&fit=crop`;

/** Grid / API — 600px (Unsplash CDN, i qëndrueshëm). */
export const PARENT_CATEGORY_THUMB_BY_SLUG: Record<ParentCategorySlug, string> = {
  vetura: unsplash("1494976388531-d1058494cdd8", 600),
  "motorr-skuter": unsplash("1558618666-fcd25c85cd64", 600),
  "kamione-furgone": unsplash("1601584115197-04ecc0da31d7", 600),
  "auto-pjese": unsplash("1486262715619-67b85e0b08d3", 600),
  "banesa-shtepi": unsplash("1560448204-e02f11c3d0e2", 600),
  "lokale-zyre": unsplash("1497366216548-37526070297c", 600),
  telefona: unsplash("1511707171634-5f897ff02aa9", 600),
  "kompjutere-laptope": unsplash("1496181133206-80ce9b88a853", 600),
  "tv-elektronike": unsplash("1593344484962-796055d4a3a4", 600),
  "mobilje-dekorime": unsplash("1555041469-a586c61ea9bc", 600),
  "rroba-kepuce": unsplash("1523381210434-271e8be1f52b", 600),
  femije: unsplash("1515488042361-ee00e0ddd4e4", 600),
  "sport-outdoor": unsplash("1571019613454-1cb2f99b2d8b", 600),
  "pune-sherbime": unsplash("1507679799987-c73779587ccf", 600),
  "bujqesi-blegtori": unsplash("1500937386664-56d1dfef3854", 600),
  "arsim-kurse": unsplash("1503676260728-1c00da094a0b", 600),
  "muzike-hobby": unsplash("1511379938547-c1f69419868d", 600),
  kafshet: unsplash("1450778869180-41d0601e046e", 600),
  "kerkoj-te-blej": "https://images.pexels.com/photos/6633607/pexels-photo-6633607.jpeg?w=600&q=80",
  "dhurata-falas": "https://images.pexels.com/photos/8257936/pexels-photo-8257936.jpeg?w=600&q=80",
};

/** Hub hero banners — 1920px (e njëjta tema, më e madhe). */
export const PARENT_CATEGORY_HERO_BY_SLUG: Record<ParentCategorySlug, string> =
  Object.fromEntries(
    Object.entries(PARENT_CATEGORY_THUMB_BY_SLUG).map(([slug, url]) => [
      slug,
      url.replace(/w=\d+/, "w=1920"),
    ]),
  ) as Record<ParentCategorySlug, string>;

/** Kamionë hub slideshow (vetëm kamionë/furgonë/autobusë). */
export const KAMIONE_HUB_SLIDESHOW_URLS = [
  unsplash("1601584115197-04ecc0da31d7", 1920),
  unsplash("1632276536839-84cad7fd27b8", 1920),
  unsplash("1544620347-c4fd4a3d5957", 1920),
] as const;

export const PARENT_CATEGORY_NAME_TO_SLUG: Record<string, ParentCategorySlug> = {
  Vetura: "vetura",
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
  "Kërkoj të Blej": "kerkoj-te-blej",
  "Dhurata & Falas": "dhurata-falas",
};

const PARENT_SLUG_SET = new Set<string>(PARENT_CATEGORY_SLUGS);

export function isParentCategorySlug(slug: string | null | undefined): boolean {
  const s = slug?.trim();
  return !!s && PARENT_SLUG_SET.has(s);
}

export function resolveParentCategoryThumb(
  slug: string | null | undefined,
  name?: string | null,
): string | null {
  const s = slug?.trim();
  if (s && isParentCategorySlug(s)) {
    return PARENT_CATEGORY_THUMB_BY_SLUG[s as ParentCategorySlug];
  }
  const mapped = name?.trim() ? PARENT_CATEGORY_NAME_TO_SLUG[name.trim()] : undefined;
  if (mapped) return PARENT_CATEGORY_THUMB_BY_SLUG[mapped];
  return null;
}

import { SUBCATEGORY_IMAGE_URL_BY_SLUG } from "@workspace/category-images";
import {
  isParentCategorySlug,
  PARENT_CATEGORY_HERO_BY_SLUG,
  PARENT_CATEGORY_NAME_TO_SLUG,
  resolveParentCategoryThumb,
} from "../../../../lib/db/src/parent-category-images.ts";
import { isRootCategory } from "@/lib/parent-category-slugs";
import { VETURA_BODY_IMAGE_BY_SLUG } from "@/lib/vetura-body-images";

/** Prefix fallback for subcategories / legacy names. */
const NAME_PREFIX_PHOTOS: [string, string][] = [
  ["Vetura", "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80"],
  ["Motorr", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
  ["Kamion", "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80"],
  ["Auto Pjes", "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80"],
  ["Banesa", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"],
  ["Lokale", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"],
  ["Telefona", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80"],
  ["Kompjuter", "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80"],
  ["Elektronik", "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=800&q=80"],
  ["TV", "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=800&q=80"],
  ["Mobilje", "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"],
  ["Rroba", "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"],
  ["Fëmij", "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80"],
  ["Sport", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80"],
  ["Punë", "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80"],
  ["Ndërtim", "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80"],
  ["Bujqësi", "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80"],
  ["Arsim", "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80"],
  ["Muzikë", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80"],
  ["Kafshë", "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80"],
];

export function resolveCategoryImageUrl(cat: {
  slug?: string | null;
  name?: string | null;
  image_url?: string | null;
}): string | null {
  const slug = cat.slug?.trim();

  if (isRootCategory(cat) || (slug && isParentCategorySlug(slug))) {
    const thumb = resolveParentCategoryThumb(slug, cat.name);
    if (thumb) return thumb;
    const mapped = cat.name?.trim() ? PARENT_CATEGORY_NAME_TO_SLUG[cat.name.trim()] : undefined;
    if (mapped) return PARENT_CATEGORY_HERO_BY_SLUG[mapped].replace(/w=\d+/, "w=600");
    return null;
  }

  if (slug) {
    if (VETURA_BODY_IMAGE_BY_SLUG[slug]) return VETURA_BODY_IMAGE_BY_SLUG[slug];
    if (SUBCATEGORY_IMAGE_URL_BY_SLUG[slug]) return SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
  }

  const fromDb = typeof cat.image_url === "string" ? cat.image_url.trim() : "";
  if (fromDb && !fromDb.includes(".svg") && !fromDb.includes("wikimedia")) return fromDb;

  const name = cat.name ?? "";
  for (const [prefix, url] of NAME_PREFIX_PHOTOS) {
    if (name.startsWith(prefix)) return url;
  }

  return null;
}

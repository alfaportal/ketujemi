/**
 * Parent category photos — edit lib/db/src/parent-category-images.ts to change site-wide.
 */
import {
  KAMIONE_HUB_SLIDESHOW_URLS,
  PARENT_CATEGORY_HERO_BY_SLUG,
  PARENT_CATEGORY_NAME_TO_SLUG,
  PARENT_CATEGORY_THUMB_BY_SLUG,
  isParentCategorySlug,
  resolveParentCategoryThumb,
} from "../../../../lib/db/src/parent-category-images.ts";

export const HUB_THUMB_IMAGE_BY_SLUG = PARENT_CATEGORY_THUMB_BY_SLUG;
export const HUB_HERO_IMAGE_BY_SLUG = PARENT_CATEGORY_HERO_BY_SLUG;
export const HUB_THUMB_FALLBACK_BY_SLUG: Record<string, string> = {
  ...PARENT_CATEGORY_THUMB_BY_SLUG,
};
export const PARENT_NAME_TO_SLUG = PARENT_CATEGORY_NAME_TO_SLUG;
export const getParentCategoryThumb = resolveParentCategoryThumb;
export const isKnownParentSlug = isParentCategorySlug;
export { KAMIONE_HUB_SLIDESHOW_URLS };

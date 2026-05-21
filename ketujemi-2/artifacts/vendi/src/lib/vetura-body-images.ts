/** Vetura body-type photos for homepage carousel and hub chips (Pexels, stable URLs). */

const pexels = (id: number, w = 800) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Display order on homepage carousel. */
export const VETURA_BODY_SLUG_ORDER = [
  "sedan",
  "suv-jeep",
  "hatchback",
  "kombi-minivan",
  "kabriolet-sportive",
  "kupe",
  "elektrike-hibride",
  "pickup",
] as const;

export const VETURA_BODY_IMAGE_BY_SLUG: Record<string, string> = {
  sedan: pexels(170811, 1200),
  "suv-jeep": pexels(116675, 1200),
  hatchback: pexels(5976596, 1200),
  "kombi-minivan": pexels(1149831, 1200),
  "kabriolet-sportive": pexels(3752169, 1200),
  kupe: pexels(3764984, 1200),
  "elektrike-hibride": pexels(110844, 1200),
  pickup: pexels(3422964, 1200),
  "klasike-vintage": pexels(2127022, 1200),
};

import {
  pexelsPhoto,
  SUBCATEGORY_IMAGE_URL_BY_SLUG,
} from "@workspace/category-images";

const p = (id: number) => pexelsPhoto(id, 1920);
const sub = (slug: keyof typeof SUBCATEGORY_IMAGE_URL_BY_SLUG) =>
  SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];

/** Single static hero image per parent category hub — matched to real subcategory photos. */
export const HUB_HERO_IMAGE_BY_SLUG: Record<string, string> = {
  vetura: p(170811),
  "motorr-skuter": sub("motorr-type-sportiv"),
  "kamione-furgone": sub("kamione-type-kamione"),
  "auto-pjese": sub("auto-pjes-type-fellne-goma"),
  "banesa-shtepi": sub("banesa-type-shtepi"),
  "lokale-zyre": sub("lokale-type-afariste"),
  telefona: sub("telefona-type-smartphones"),
  "kompjutere-laptope": sub("kompj-type-laptop"),
  "tv-elektronike": sub("tv-type-televizore"),
  "mobilje-dekorime": sub("mobilje-type-sallone-ulese"),
  "rroba-kepuce": sub("rroba-type-veshje-meshkuj"),
  femije: sub("femije-type-lodra"),
  "sport-outdoor": sub("sport-type-bicikleta"),
  "pune-sherbime": sub("pune-type-it-dizajn"),
  "bujqesi-blegtori": sub("bujq-type-makineri"),
  "arsim-kurse": sub("arsim-type-kurse-prof"),
  "muzike-hobby": sub("muzike-type-tastiere"),
  kafshet: sub("kafshet-type-qen"),
};

/** Thumbnail-sized URLs for homepage category grid (same photos as hub heroes). */
export const HUB_THUMB_IMAGE_BY_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(HUB_HERO_IMAGE_BY_SLUG).map(([slug, url]) => [
    slug,
    url.replace(/w=\d+/, "w=600"),
  ]),
);

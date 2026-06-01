/** Hub groups + legacy types; all leaf slugs in femije-leaf-subcategory-photos.ts. */

import { pexelsPhoto } from "./category-pexels-urls.js";
import { FEMIJE_LEAF_SUBCATEGORY_PHOTOS } from "./femije-leaf-subcategory-photos.js";

const p = (id: number) => pexelsPhoto(id, 400);

const FEMIJE_HUB_GROUP_AND_TYPE_PHOTOS: Record<string, string> = {
  "femije-grp-karroca-transport": p(4196249),
  "femije-grp-krevat-dhome": p(599821),
  "femije-grp-ushqyerja-ushqimi": p(3933250),
  "femije-grp-higjiene-kujdes": p(3875089),
  "femije-grp-rroba-kepuce": p(1927257),
  "femije-grp-lodra-lojera": p(3603724),
  "femije-grp-lodra-edukative": p(8613080),
  "femije-grp-libra-shkollore": p(159711),
  "femije-grp-aktivitet-sport": p(206443),
  "femije-grp-karrige-ulese": p(8612973),
  "femije-grp-canta-nene": p(3997931),
  "femije-grp-veshje-shtatzanise": p(3738084),
  "femije-grp-siguria": p(3997992),
  "femije-grp-pishine-plazh": p(3018737),
  "femije-type-karroca": p(4196249),
  "femije-type-lodra": p(3603724),
  "femije-type-foshnje": p(3875089),
  "femije-type-rroba": p(1927257),
  "femije-type-ushqim-higjiene": p(3933250),
};

export const FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG: Record<string, string> = {
  ...FEMIJE_HUB_GROUP_AND_TYPE_PHOTOS,
  ...FEMIJE_LEAF_SUBCATEGORY_PHOTOS,
};

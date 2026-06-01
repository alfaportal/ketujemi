/** Hub groups + legacy types; all leaf slugs in femije-leaf-subcategory-photos.ts. */

import { FEMIJE_LEAF_SUBCATEGORY_PHOTOS } from "./femije-leaf-subcategory-photos";

function pexels(id: number, w = 400): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

const p = (id: number) => pexels(id);

const FEMIJE_HUB_GROUP_AND_TYPE_PHOTOS: Record<string, string> = {
  "femije-grp-karroca-transport": p(7282720),
  "femije-grp-krevat-dhome": p(3875218),
  "femije-grp-ushqyerja-ushqimi": p(4669022),
  "femije-grp-higjiene-kujdes": p(3875089),
  "femije-grp-rroba-kepuce": p(1620760),
  "femije-grp-lodra-lojera": p(7296631),
  "femije-grp-lodra-edukative": p(3662637),
  "femije-grp-libra-shkollore": p(256541),
  "femije-grp-aktivitet-sport": p(206443),
  "femije-grp-karrige-ulese": p(6582167),
  "femije-grp-canta-nene": p(1157389),
  "femije-grp-veshje-shtatzanise": p(618923),
  "femije-grp-siguria": p(827991),
  "femije-grp-pishine-plazh": p(346776),
  "femije-type-karroca": p(7282720),
  "femije-type-lodra": p(7296631),
  "femije-type-foshnje": p(3875089),
  "femije-type-rroba": p(1620760),
  "femije-type-ushqim-higjiene": p(4669022),
};

export const FEMIJE_HUB_SUBCATEGORY_IMAGE_URL_BY_SLUG: Record<string, string> = {
  ...FEMIJE_HUB_GROUP_AND_TYPE_PHOTOS,
  ...FEMIJE_LEAF_SUBCATEGORY_PHOTOS,
};

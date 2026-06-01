/** Distinct Pexels thumbnails per femije-leaf-* slug (cards + leaf hero). */

import { pexelsPhoto } from "./category-pexels-urls.js";

const p = (id: number) => pexelsPhoto(id, 400);

/** Karroca & Transport — verified stroller / car-seat subjects only */
const KARROCA: Record<string, string> = {
  "femije-leaf-karroca-klasike": p(4965348),
  "femije-leaf-karroca-cader": p(17693507),
  "femije-leaf-karroca-binjake": p(12797847),
  "femije-leaf-sisteme-udhetimi": p(7282720),
  "femije-leaf-karrige-makine-grupe": p(6182086),
  "femije-leaf-mbajtese-bebe": p(7282912),
  "femije-leaf-aksesore-karroce": p(11874485),
};

/** Krevat & Dhomë */
const KREVAT: Record<string, string> = {
  "femije-leaf-krevate-djepa": p(4321700),
  "femije-leaf-dysheke-tekstile": p(30435352),
  "femije-leaf-mobilje-dhome": p(5825540),
  "femije-leaf-dekorime-drita": p(860882),
};

/** Ushqyerja */
const USHQYERJA: Record<string, string> = {
  "femije-leaf-shishe-biberon": p(3933250),
  "femije-leaf-pompe-gjiri": p(6149892),
  "femije-leaf-karrige-ushqimi": p(8612973),
  "femije-leaf-sterilizues-ngrohes": p(4045504),
  "femije-leaf-ene-luge": p(5732933),
  "femije-leaf-ushqim-bebe": p(1407346),
};

/** Higjienë */
const HIGJIENE: Record<string, string> = {
  "femije-leaf-pelene-njeperdorimshme": p(3875089),
  "femije-leaf-pelene-riperdorshme": p(7692266),
  "femije-leaf-lecke-topth": p(5938356),
  "femije-leaf-vaske-banjoje": p(279561),
  "femije-leaf-produkte-lekure": p(30435352),
  "femije-leaf-termometer-pajisje": p(3845458),
  "femije-leaf-aspirator-kujdes": p(3875089),
};

/** Rroba & Këpucë — verified subjects */
const RROBA: Record<string, string> = {
  "femije-leaf-rroba-foshnjeje": p(4321700),
  "femije-leaf-rroba-vegjelish": p(1130180),
  "femije-leaf-rroba-shkollore": p(8612959),
  "femije-leaf-veshje-dimri": p(30420279),
  "femije-leaf-veshje-vere": p(1620769),
  "femije-leaf-kepuce-foshnjeje": p(2271522),
  "femije-leaf-kepuce-femijesh": p(267320),
  "femije-leaf-aksesore-rroba": p(18990251),
};

/** Lodra & Lojëra */
const LODRA: Record<string, string> = {
  "femije-leaf-lodra-klasike": p(860882),
  "femije-leaf-lojera-shoqerore": p(7296631),
  "femije-leaf-lodra-elektronike": p(6372976),
  "femije-leaf-lodra-banjo": p(30806455),
  "femije-leaf-kostume-loje": p(5961611),
};

/** Lodra Edukative — verified toys / play */
const EDUKATIVE: Record<string, string> = {
  "femije-leaf-lodra-montessori": p(7269693),
  "femije-leaf-blloqe-lego": p(298825),
  "femije-leaf-lodra-muzikore": p(7577253),
  "femije-leaf-tapete-sensor": p(4473562),
  "femije-leaf-puzzle-edukative": p(6692835),
};

/** Libra & Shkollë */
const LIBRA: Record<string, string> = {
  "femije-leaf-libra-perralla": p(12548628),
  "femije-leaf-libra-edukative": p(261763),
  "femije-leaf-libra-shkollor": p(256541),
  "femije-leaf-fletore-materiale": p(256541),
  "femije-leaf-mjete-vizatimi": p(3891207),
  "femije-leaf-canta-shkolle": p(8807020),
};

/** Aktivitet & Sport */
const SPORT: Record<string, string> = {
  "femije-leaf-bicikleta": p(206443),
  "femije-leaf-trotinet-skiro": p(13311432),
  "femije-leaf-shpatulla-patina": p(18186110),
  "femije-leaf-trampoline": p(8535890),
  "femije-leaf-lekundshe-kopsht": p(4997360),
  "femije-leaf-topa-sport": p(46798),
  "femije-leaf-kostume-sporti": p(16678677),
};

/** Karrige & Ulëse */
const KARRIGE: Record<string, string> = {
  "femije-leaf-karrige-ushqimi-larte": p(6582167),
  "femije-leaf-karrige-ushqimi-portative": p(4669022),
  "femije-leaf-karrige-makine-0": p(6182086),
  "femije-leaf-karrige-makine-1": p(30014151),
  "femije-leaf-karrige-makine-23": p(8305241),
  "femije-leaf-ulese-ngritese": p(1130180),
};

/** Çanta Nënë */
const CANTA: Record<string, string> = {
  "femije-leaf-canta-shpine": p(1157389),
  "femije-leaf-canta-dore": p(8807020),
  "femije-leaf-organizatore-karroce": p(7282720),
  "femije-leaf-mbajtese-shishesh": p(6624450),
  "femije-leaf-mbulesa-shi-diell": p(15552523),
};

/** Veshje Shtatzënësie */
const SHTATZANISE: Record<string, string> = {
  "femije-leaf-fustane-shtatzanise": p(3738084),
  "femije-leaf-pantallona-shtatzanise": p(6149892),
  "femije-leaf-sutjena-gji": p(6149892),
  "femije-leaf-breza-shtatzanise": p(3738084),
  "femije-leaf-jastek-anatomik": p(4041398),
  "femije-leaf-produkte-kujdesi-shtatzanise": p(3997992),
};

/** Siguria e Fëmijëve — verified safety subjects */
const SIGURIA: Record<string, string> = {
  "femije-leaf-porta-sigurie": p(1442751),
  "femije-leaf-mbrojtese-kendi": p(8429915),
  "femije-leaf-bllokues-sirtare": p(5353881),
  "femije-leaf-mbrojtese-priza": p(7937305),
  "femije-leaf-monitor-audio": p(3845458),
  "femije-leaf-monitor-video": p(7282613),
  "femije-leaf-jeleke-shpetimi": p(2525892),
  "femije-leaf-kaske-biciklete": p(3932881),
};

/** Pishinë & Plazh — verified pool / beach */
const PISHINE: Record<string, string> = {
  "femije-leaf-pishina-fryra": p(36568259),
  "femije-leaf-veshje-banjo": p(346776),
  "femije-leaf-jeleke-noti": p(8094751),
  "femije-leaf-lodra-reere": p(6138739),
  "femije-leaf-kapele-uv": p(623042),
  "femije-leaf-krem-mbrojtes": p(9496412),
};

export const FEMIJE_LEAF_SUBCATEGORY_PHOTOS: Record<string, string> = {
  ...KARROCA,
  ...KREVAT,
  ...USHQYERJA,
  ...HIGJIENE,
  ...RROBA,
  ...LODRA,
  ...EDUKATIVE,
  ...LIBRA,
  ...SPORT,
  ...KARRIGE,
  ...CANTA,
  ...SHTATZANISE,
  ...SIGURIA,
  ...PISHINE,
};

/** @deprecated Use FEMIJE_LEAF_SUBCATEGORY_PHOTOS */
export const FEMIJE_LEAF_AKTIVITET_SPORT_PHOTOS = SPORT;

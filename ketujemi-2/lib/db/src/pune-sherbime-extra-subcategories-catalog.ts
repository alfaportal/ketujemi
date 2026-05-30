/** Punë & Shërbime — 3 new type subcategories with listing leaves (additive only). */

export type PuneSherbimeExtraLeafDef = {
  name: string;
  slug: string;
};

export type PuneSherbimeExtraTypeDef = {
  name: string;
  slug: string;
  leaves: PuneSherbimeExtraLeafDef[];
};

export const PUNE_SHERBIME_HUB_SLUG = "pune-sherbime";

/** New subcategories only — does not replace existing hub types. */
export const PUNE_SHERBIME_EXTRA_TAXONOMY: PuneSherbimeExtraTypeDef[] = [
  {
    name: "Shëndet & Kujdes",
    slug: "pune-type-shendet-kujdes",
    leaves: [
      { name: "Infermier & Kujdes në shtëpi", slug: "pune-leaf-infermier-kujdes-shtepi" },
      { name: "Fizioterapi", slug: "pune-leaf-fizioterapi" },
      { name: "Psikolog & Terapeut", slug: "pune-leaf-psikolog-terapeut" },
      { name: "Kujdes për të moshuarit", slug: "pune-leaf-kujdes-te-moshuarit" },
      { name: "Babysitter & Kujdes fëmijësh", slug: "pune-leaf-babysitter-kujdes-femijesh" },
    ],
  },
  {
    name: "Pastrim & Mirëmbajtje",
    slug: "pune-type-pastrim-mirembajtje",
    leaves: [
      { name: "Pastrim banesash", slug: "pune-leaf-pastrim-banesash" },
      { name: "Pastrim pas ndërtimit", slug: "pune-leaf-pastrim-pas-ndertimit" },
      { name: "Pastrim xhamash", slug: "pune-leaf-pastrim-xhamash" },
      { name: "Dezinfektim & Dezinsektim", slug: "pune-leaf-dezinfektim-dezinsektim" },
      { name: "Mirëmbajtje kopshtesh & oborresh", slug: "pune-leaf-mirembajtje-kopshtesh-oborresh" },
    ],
  },
  {
    name: "Shërbime të Tjera",
    slug: "pune-type-sherbime-te-tjera",
    leaves: [
      { name: "Riparim pajisjesh shtëpiake", slug: "pune-leaf-riparim-pajisje-shtepiake" },
      { name: "Riparim telefona & laptop", slug: "pune-leaf-riparim-telefona-laptop" },
      { name: "Fotokopje & Shtypshkrimë", slug: "pune-leaf-fotokopje-shtypshkrim" },
      { name: "Shërbime noteriale & juridike", slug: "pune-leaf-sherbime-noteriale-juridike" },
      { name: "Lirim banesash & zyrash", slug: "pune-leaf-lirim-banesash-zyrash" },
    ],
  },
];

/** Rroba & Këpucë hub — type subcategories with listing leaves. */

export type RrobaKepuceLeafDef = {
  name: string;
  slug: string;
};

export type RrobaKepuceTypeDef = {
  name: string;
  slug: string;
  leaves: RrobaKepuceLeafDef[];
};

export const RROBA_KEPUCE_HUB_SLUG = "rroba-kepuce";

/** Slug of the children category removed from this hub (belongs under Fëmijë). */
export const RROBA_KEPUCE_REMOVED_TYPE_SLUG = "rroba-type-veshje-femije";

export const RROBA_KEPUCE_TAXONOMY: RrobaKepuceTypeDef[] = [
  {
    name: "Veshje për Meshkuj",
    slug: "rroba-type-veshje-meshkuj",
    leaves: [
      { name: "Jakne & Pallto", slug: "rroba-leaf-m-jakne-pallto" },
      { name: "Këmisha", slug: "rroba-leaf-m-kemisha" },
      { name: "T-Shirt & Maica", slug: "rroba-leaf-m-tshirt-maica" },
      { name: "Xhemperë & Duksë", slug: "rroba-leaf-m-xhemper-duks" },
      { name: "Pantallona & Xhins", slug: "rroba-leaf-m-pantallona-xhins" },
      { name: "Kostume & Sako", slug: "rroba-leaf-m-kostume-sako" },
      { name: "Rroba Sportive", slug: "rroba-leaf-m-sportive" },
      { name: "Të brendshme & Piçama", slug: "rroba-leaf-m-te-brendshme" },
      { name: "Veshje Ceremoniale", slug: "rroba-leaf-m-ceremoniale" },
    ],
  },
  {
    name: "Veshje për Femra",
    slug: "rroba-type-veshje-femra",
    leaves: [
      { name: "Fustane & Funde", slug: "rroba-leaf-f-fustane-funde" },
      { name: "Jakne & Pallto & Gëzofë", slug: "rroba-leaf-f-jakne-gezof" },
      { name: "Bluza & Këmisha", slug: "rroba-leaf-f-bluza-kemisha" },
      { name: "T-Shirt & Maica & Topa", slug: "rroba-leaf-f-tshirt-topa" },
      { name: "Duksë & Xhemperë", slug: "rroba-leaf-f-duks-xhemper" },
      { name: "Pantallona & Xhins", slug: "rroba-leaf-f-pantallona-xhins" },
      { name: "Kostume & Sako", slug: "rroba-leaf-f-kostume-sako" },
      { name: "Rroba Sportive", slug: "rroba-leaf-f-sportive" },
      { name: "Rroba banjo & Bikini", slug: "rroba-leaf-f-banjo-bikini" },
      { name: "Të brendshme & Gjumi", slug: "rroba-leaf-f-te-brendshme-gjumi" },
      { name: "Veshje për shtatzëna", slug: "rroba-leaf-f-shtatzena" },
      { name: "Veshje festive", slug: "rroba-leaf-f-festive" },
    ],
  },
  {
    name: "Aksesorë",
    slug: "rroba-type-aksesore",
    leaves: [
      { name: "Çanta dore", slug: "rroba-leaf-a-canta-dore" },
      { name: "Çanta shpine", slug: "rroba-leaf-a-canta-shpine" },
      { name: "Portofola", slug: "rroba-leaf-a-portofola" },
      { name: "Orë Dore", slug: "rroba-leaf-a-ore-dore" },
      { name: "Syze Dielli & Optike", slug: "rroba-leaf-a-syze" },
      { name: "Bizhuteri & Ari", slug: "rroba-leaf-a-bizhuteri" },
      { name: "Rripa & Breza", slug: "rroba-leaf-a-rripa" },
      { name: "Kapele & Shalle & Doreza", slug: "rroba-leaf-a-kapele" },
    ],
  },
  {
    name: "Këpucë",
    slug: "rroba-type-kepuce",
    leaves: [
      { name: "Atlete", slug: "rroba-leaf-k-atlete" },
      { name: "Këpucë Elegante", slug: "rroba-leaf-k-elegante" },
      { name: "Çizme", slug: "rroba-leaf-k-cizme" },
      { name: "Sandale & Papuçe", slug: "rroba-leaf-k-sandale" },
      { name: "Shapka & Shtëpiake", slug: "rroba-leaf-k-shapka" },
      { name: "Këpucë për sporte specifike", slug: "rroba-leaf-k-sporte" },
      { name: "Këpucë ortopedike", slug: "rroba-leaf-k-ortopedike" },
    ],
  },
];

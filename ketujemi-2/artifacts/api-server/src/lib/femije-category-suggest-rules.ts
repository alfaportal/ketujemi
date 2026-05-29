/**
 * Keyword rules for Fëmijë hub auto-routing (posting assistant).
 * Maps title/description text → group slug (and optional leaf slug).
 */
export const FEMIJE_HUB_SLUG = "femije";

export type FemijeSuggestRule = {
  groupSlug: string;
  leafSlug?: string;
  pattern: RegExp;
  weight: number;
  unless?: RegExp;
};

export const FEMIJE_SUGGEST_RULES: FemijeSuggestRule[] = [
  {
    groupSlug: "femije-grp-veshje-shtatzanise",
    pattern: /\b(shtatz[ëe]ni|materniteti|shtatzan|breza shtatz|jast[ëe]k anatomik|strij[ae])\b/i,
    weight: 14,
  },
  {
    groupSlug: "femije-grp-veshje-shtatzanise",
    leafSlug: "femije-leaf-sutjena-gji",
    pattern: /\b(sutjena|sutien|mbajt[ëe]se gji|veshje p[ëe]r gji|nursing)\b/i,
    weight: 15,
  },
  {
    groupSlug: "femije-grp-canta-nene",
    pattern: /\b(çant[ëe] n[ëe]n[ëe]|diaper bag|aksesor[ëe] karroce|organizator karroce)\b/i,
    weight: 13,
  },
  {
    groupSlug: "femije-grp-karroca-transport",
    pattern: /\b(karroca|karroc[ëe]|stroller|pram|sisteme udh[ëe]timi)\b/i,
    weight: 12,
    unless: /\b(lod[ëe]r|lib[ëe]r|rrob[ae])\b/i,
  },
  {
    groupSlug: "femije-grp-karroca-transport",
    leafSlug: "femije-leaf-mbajtese-bebe",
    pattern: /\b(kangaroo|wrap|sling|mbajt[ëe]se bebe|baby carrier)\b/i,
    weight: 13,
  },
  {
    groupSlug: "femije-grp-karroca-transport",
    leafSlug: "femije-leaf-karrige-makine-grupe",
    pattern: /\b(karrige makine|car seat|grup 0|grup 1|grup 2|isofix)\b/i,
    weight: 13,
  },
  {
    groupSlug: "femije-grp-krevat-dhome",
    pattern: /\b(krevat|djep|bassinet|crib|dyshek|çarçaf|batanije|dollap f[ëe]mij|drita nate)\b/i,
    weight: 12,
  },
  {
    groupSlug: "femije-grp-ushqyerja-ushqimi",
    pattern: /\b(biberon|shishe bebe|pomp[ëe] gjiri|sterilizues|ngroh[ëe]s shishe|ushqim bebe|snack)\b/i,
    weight: 12,
    unless: /\b(pelen[ëe]|shampo)\b/i,
  },
  {
    groupSlug: "femije-grp-higjiene-kujdes",
    pattern: /\b(pelen[ëe]|krem f[ëe]mij|shampo bebe|vask[ëe]|aspirator hund|termomet[ëe]r bebe)\b/i,
    weight: 12,
  },
  {
    groupSlug: "femije-grp-rroba-kepuce",
    pattern: /\b(rrob[ae]|pantallona|xhaket[ëe]|veshje|k[ëe]puc[ëe]|sandale|çizme f[ëe]mij)\b/i,
    weight: 11,
    unless: /\b(shtatz[ëe]ni|materniteti|kostum loj[ëe])\b/i,
  },
  {
    groupSlug: "femije-grp-lodra-edukative",
    pattern: /\b(montessori|edukativ|puzzle edukativ|blloqe nd[ëe]rtimi|lego|tapet[ëe] loj[ëe]|stimulim sensor)\b/i,
    weight: 13,
  },
  {
    groupSlug: "femije-grp-lodra-lojera",
    pattern: /\b(lod[ëe]r|kukull|makin[ëe] lod[ëe]r|tren lod[ëe]r|loj[ëe]ra tavoline|kartela)\b/i,
    weight: 11,
    unless: /\b(montessori|edukativ|lib[ëe]r)\b/i,
  },
  {
    groupSlug: "femije-grp-libra-shkollore",
    pattern: /\b(lib[ëe]r|libra|shkoll[ëe]|fletore|çant[ëe] shkolle|vizatim|pikturim|p[ëe]rrall[ae])\b/i,
    weight: 12,
  },
  {
    groupSlug: "femije-grp-aktivitet-sport",
    pattern: /\b(bi[çc]iklet[ëe]|trotinet|skiro|trampolin[ëe]|rr[ëe]shqit[ëe]se|patina|shpatull[ae])\b/i,
    weight: 12,
  },
  {
    groupSlug: "femije-grp-karrige-ulese",
    pattern: /\b(karrige ushqimi|high chair|booster seat|ul[ëe]se ngrit[ëe]se)\b/i,
    weight: 13,
    unless: /\b(karrige makine|car seat)\b/i,
  },
  {
    groupSlug: "femije-grp-siguria",
    pattern: /\b(siguri|monitor bebe|port[ëe] sigurie|mbrojt[ëe]se k[ëe]ndi|mbrojt[ëe]se priza|kamer[ae] bebe)\b/i,
    weight: 12,
  },
  {
    groupSlug: "femije-grp-pishine-plazh",
    pattern: /\b(pishin[ëe]|plazh|not|lodra r[ëe]re|jelek noti|krem mbrojt[ëe]s|kapel[ëe] dielli)\b/i,
    weight: 12,
  },
];

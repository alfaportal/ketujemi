/**
 * Platform hard ban — cigarettes, alcohol, weapons, drugs, etc.
 * No admin override. Checked on every create, update, and repost path.
 */

export type ProhibitedListingHit = {
  code: "PROHIBITED_CONTENT";
  reason: string;
  label: string;
};

/** Regex + user-facing Albanian reason (KS/AL default). */
export const PROHIBITED_LISTING_PATTERNS: ReadonlyArray<{
  re: RegExp;
  reason: string;
  label: string;
}> = [
  // —— Armë & municione ——
  {
    re: /\b(armë|arme|armët|armet|pistol|revolver|karabin|pushkë|pushke|pushka|kalashnikov|ak-?47|mitraloz|shtizë|shtize|hanëz|hanez)\b/i,
    reason: "Shitja e armëve nuk lejohet në KetuJemi.",
    label: "weapons",
  },
  {
    re: /\b(bomba|granatë|granate|municion|fishekë|fisheke|patrona|plumb(a|i)?\s*gjuetie)\b/i,
    reason: "Municionet dhe eksplozivët nuk lejohen.",
    label: "ammunition",
  },
  {
    re: /\b(thikë\s*luftarake|thike\s*luftarake|grusht\s*i\s*hekurit|brass\s*knuckle)\b/i,
    reason: "Armët dhe mjetet e rrezikshme nuk lejohen.",
    label: "weapons_melee",
  },
  // —— Drogë ——
  {
    re: /\b(droga|drogë|drog|kokainë|kokain|kokain|heroinë|heroin|kanabis|marijuana|cannabis|hashash|ekstazi|amfetamin|metadon|lsd|ekstacy|xtc)\b/i,
    reason: "Shitja e drogës nuk lejohet.",
    label: "drugs",
  },
  // —— Alkool ——
  {
    re: /\b(alkool|alkoolik|alkoolike|pije\s*alkoolike|birrë|birre|bira|beer|verë|vere|wine|rakija|rakije|raki\b|rak\b|whisky|whiskey|vodka|konjak|cognac|brandy|tequila|gin\b|liquor|champagne|šampanjac|shampanj|schnapps)\b/i,
    reason: "Alkooli dhe pijet alkoolike nuk lejohen.",
    label: "alcohol",
  },
  // —— Duhan & cigare ——
  {
    re: /\b(duhan|duhani|tytyn|nikotin|tobacco|cigare|cigaret|cigarete|cigareta|cigara|puro|puros|shisha|nargile|hookah|kalian)\b/i,
    reason: "Duhani dhe cigaret nuk lejohen.",
    label: "tobacco",
  },
  {
    re: /\b(marlboro|camel|winston|pall\s*mall|parliament|lm\s*cigare|lucky\s*strike|bond\s*street|chesterfield|davidoff|dunhill)\b/i,
    reason: "Cigaret dhe duhani nuk lejohen.",
    label: "tobacco_brand",
  },
  // —— Vape / IQOS ——
  {
    re: /\b(vape|vaping|e-?cig|ecig|e\s*cigare|puff\s*bar|eliquid|e-liquid|juul|iqos|heets|glo\s*pro|velo\s*nikotin)\b/i,
    reason: "Cigaret elektronike dhe nikotina nuk lejohen.",
    label: "vape",
  },
  // —— Crypto / kazino / MLM / erotik / fake ——
  {
    re: /\b(crypto|bitcoin|ethereum|nft|binance|usdt|dogecoin|blockchain)\b/i,
    reason: "Kriptomonedhat nuk lejohen.",
    label: "crypto",
  },
  {
    re: /\b(kazino|casino|baste|bast|lojëra\s*fati|lojera\s*fati|gambling|poker|slot|1xbet|betsson)\b/i,
    reason: "Llogaritë e lojërave / baste nuk lejohen.",
    label: "gambling",
  },
  {
    re: /\b(mlm|piramid|ponzi|skemë\s*piramidale|sheme\s*piramidale|network\s*marketing|fitim\s*pasiv)\b/i,
    reason: "Skemat piramidale / MLM nuk lejohen.",
    label: "mlm",
  },
  {
    re: /\b(escort|prostitut|takime\s*intime|porno|pornografi|onlyfans|fetish|striptiz)\b/i,
    reason: "Përmbajtja erotike nuk lejohet.",
    label: "erotic",
  },
  {
    re: /\b(replika|kopje\s*1:?1|superfake|counterfeit|fake\s*rolex|imitation\s*bag)\b/i,
    reason: "Produktet e falsifikuara / replika nuk lejohen.",
    label: "counterfeit",
  },
];

function matchProhibitedPatterns(
  text: string,
  patterns: ReadonlyArray<{ re: RegExp; reason: string; label: string }>,
): ProhibitedListingHit | null {
  for (const { re, reason, label } of patterns) {
    if (re.test(text)) {
      return { code: "PROHIBITED_CONTENT", reason, label };
    }
  }
  return null;
}

/** English vision labels (Google Vision / Claude) for cigarettes, alcohol, weapons, drugs. */
export const PROHIBITED_VISION_LABEL_PATTERNS: ReadonlyArray<{
  re: RegExp;
  reason: string;
  label: string;
}> = [
  {
    re: /\b(firearm|handgun|pistol|revolver|rifle|shotgun|submachine|machine\s*gun|assault\s*rifle|gun\b|weapon|ammunition|bullet|cartridge|grenade)\b/i,
    reason: "Shitja e armëve nuk lejohet në KetuJemi.",
    label: "weapons",
  },
  {
    re: /\b(cigarette|cigarettes|tobacco|smoking|smoke\b|cigar|cigars|nicotine|vape|vaping|e-?cig|ecig|iqos|hookah|shisha|nargile)\b/i,
    reason: "Duhani dhe cigaret nuk lejohen.",
    label: "tobacco",
  },
  {
    re: /\b(alcoholic\s*beverage|liquor|whisky|whiskey|vodka|tequila|gin\b|rum\b|brandy|cognac|champagne|beer\s*bottle|wine\s*bottle|beer\s*can|wine\s*glass|beer\s*glass)\b/i,
    reason: "Alkooli dhe pijet alkoolike nuk lejohen.",
    label: "alcohol",
  },
  {
    re: /\b(marijuana|cannabis|hashish|heroin|cocaine|methamphetamine|drug\s*paraphernalia|syringe)\b/i,
    reason: "Shitja e drogës nuk lejohet.",
    label: "drugs",
  },
];

export function detectProhibitedListingContent(
  title: string,
  description: string,
): ProhibitedListingHit | null {
  return matchProhibitedPatterns(`${title}\n${description}`, PROHIBITED_LISTING_PATTERNS);
}

/** Scan vision label/object text from photo analysis. */
export function detectProhibitedFromVisionText(text: string): ProhibitedListingHit | null {
  const combined = text.trim();
  if (!combined) return null;
  return (
    matchProhibitedPatterns(combined, PROHIBITED_VISION_LABEL_PATTERNS) ??
    matchProhibitedPatterns(combined, PROHIBITED_LISTING_PATTERNS)
  );
}

/** Throws Error("PROHIBITED_CONTENT") with publicMessage — for admin/user routes. */
export function assertListingContentNotProhibited(
  title: string,
  description: string,
): void {
  const hit = detectProhibitedListingContent(title, description);
  if (!hit) return;
  const err = new Error("PROHIBITED_CONTENT") as Error & { publicMessage: string; label: string };
  err.publicMessage = hit.reason;
  err.label = hit.label;
  throw err;
}

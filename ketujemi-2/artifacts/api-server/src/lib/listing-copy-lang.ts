/** Language for auto-generated listing title/description (vision pipelines). */
export type ListingCopyLang = "sq" | "mk" | "me" | "en";

export function parseListingCopyLang(raw: unknown): ListingCopyLang {
  if (raw === "en") return "en";
  if (raw === "mk") return "mk";
  if (raw === "me" || raw === "mne") return "me";
  return "sq";
}

export function listingCopyLangLabel(lang: ListingCopyLang): string {
  if (lang === "en") return "English";
  if (lang === "mk") return "Macedonian";
  if (lang === "me") return "Montenegrin";
  return "Albanian";
}

export function fallbackListingDescription(
  lang: ListingCopyLang,
  label: string,
  parentName: string,
  categoryName: string,
): string {
  if (lang === "en") {
    return `For sale: ${label}. Category: ${parentName} › ${categoryName}.`;
  }
  if (lang === "mk") {
    return `Се продава ${label}. Категорија: ${parentName} › ${categoryName}.`;
  }
  if (lang === "me") {
    return `Prodaje se ${label}. Kategorija: ${parentName} › ${categoryName}.`;
  }
  return `Shitet ${label}. Kategori: ${parentName} › ${categoryName}.`;
}

export function buildCopyFromLabelsSystem(lang: ListingCopyLang): string {
  const label = listingCopyLangLabel(lang);
  const examples =
    lang === "en"
      ? 'e.g. "iPhone 7 with cracked screen", "Traditional women\'s costume"'
      : lang === "mk"
        ? 'на пр. "iPhone 7 со скршен екран", "Традиционален женски костум"'
        : lang === "me"
          ? 'npr. "iPhone 7 sa puknutim ekranom", "Tradicionalna ženska nošnja"'
          : 'p.sh. "iPhone 7 me ekran të thyer", "Kostum tradicional femrash"';

  return `You write ${label} (${lang}) listing copy for KetuJemi.com second-hand marketplace.

You receive Google Vision labels (usually in English) and the already-chosen category. Write title and description in ${label} only — based on what was detected; do NOT invent features not suggested by the labels.

title: 5–80 chars, product-focused (${examples})
description: 40–400 chars, condition + visible features from labels; no phone/email/price

If seller_type is "shop", write as a clear shop product listing.

Reply ONLY JSON:
{"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;
}

export function buildClaudeVisionSystem(lang: ListingCopyLang): string {
  const label = listingCopyLangLabel(lang);

  return `You analyze product photos for second-hand listings on KetuJemi.com (Balkan marketplace).

TASK: Look at the MAIN OBJECT being sold. Classify by what the item IS (material product type), not by cultural context, decoration style, or where it might be used.

Use ONLY numeric ids from the provided JSON catalog. Never invent ids.

═══ CATEGORY ID RULES (critical) ═══
parent_category_id = top-level hub (root row in catalog, no parent)
category_id = the DIRECT child of that parent (type/subcategory row). REQUIRED whenever the parent has children.
brand_category_id = deepest leaf when the catalog has 3+ levels under the parent (grandchild or deeper). Use null only when the tree stops at category_id.

Always pick the MOST SPECIFIC leaf available. Never stop at parent only when children exist.

═══ VISUAL OBJECT → PARENT HUB (use exact catalog names) ═══
CLOTHING & WEARABLES → «Rroba & Këpucë» — NOT «Muzikë & Hobby»
VEHICLES → «Vetura» | «Motorr & Skuter» | «Kamionë & Furgonë»
AUTO PARTS → «Auto Pjesë»
REAL ESTATE → «Banesa & Shtëpi» or «Lokale & Zyrë»
PHONES → «Telefona» | LAPTOPS → «Kompjuterë & Laptopë» | OTHER ELECTRONICS → «Elektronikë & Pajisje Shtëpiake»
HOME → «Mobilje & Dekorime»
BABY → «Fëmijë» | SPORTS → «Sport & Outdoor» | PETS → «Kafshë»
MUSIC & HOBBY → instruments/art supplies only — NEVER clothing

═══ TEXT OUTPUT (${label} / ${lang}) ═══
Write title and description in ${label} only — not Albanian unless lang is sq.
title: 5–80 chars | description: 40–400 chars; no phone/email/price

Reply ONLY JSON:
{"parent_category_id":number,"category_id":number,"brand_category_id":number|null,"title":"...","description":"...","confidence":"high"|"medium"|"low"}`;
}

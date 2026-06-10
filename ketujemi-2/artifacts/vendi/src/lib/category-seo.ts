import { cityNameFromSlug, citySlugFromName } from "../../../../lib/seo-city-slugs";
import type { UiTranslationLocale } from "@/lib/ui-languages";

export const SEO_LISTINGS_PREFIX = "/shpallje";
export const CANONICAL_SITE_ORIGIN = "https://ketujemi.com";

export function seoCategoryPath(categorySlug: string, citySlug?: string | null): string {
  const base = `${SEO_LISTINGS_PREFIX}/${encodeURIComponent(categorySlug)}`;
  if (!citySlug?.trim()) return base;
  return `${base}/${encodeURIComponent(citySlug.trim().toLowerCase())}`;
}

export function resolveSeoCitySlug(segment: string | undefined): string | undefined {
  if (!segment?.trim()) return undefined;
  const name = cityNameFromSlug(segment);
  return name ? segment.trim().toLowerCase() : undefined;
}

export type CategorySeoMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  footerHtml: string;
};

function categoryLabelLower(name: string, locale: UiTranslationLocale): string {
  if (locale === "ks" || locale === "al") return name.toLowerCase();
  return name;
}

/** Dynamic title/description + ~180-word footer for category (+ optional city) pages. */
export function buildCategorySeoMeta(
  categoryDisplayName: string,
  categorySlug: string,
  locale: UiTranslationLocale,
  citySlug?: string,
): CategorySeoMeta {
  const cityName = citySlug ? cityNameFromSlug(citySlug) : undefined;
  const canonicalPath = seoCategoryPath(categorySlug, citySlug);
  const cat = categoryLabelLower(categoryDisplayName, locale);

  if (locale === "ks" || locale === "al") {
    const placeShort = cityName ?? "Kosovë";
    const title = cityName
      ? `${categoryDisplayName} në ${cityName} — Shpallje Falas | KetuJemi`
      : `${categoryDisplayName} në shitje në Kosovë — Shpallje Falas | KetuJemi`;
    const description = cityName
      ? `Shpallje falas për ${cat} në ${cityName}, Kosovë. Posto dhe gjej oferta lokale në KetuJemi.com — pa komision.`
      : `Shpallje falas për ${cat} në Kosovë, Shqipëri e diasporë. Posto falas në KetuJemi.com`;
    const footerHtml = buildSqFooter(categoryDisplayName, cat, cityName, placeShort);
    return { title, description, canonicalPath, footerHtml };
  }

  if (locale === "mk") {
    const title = cityName
      ? `${categoryDisplayName} во ${cityName} — Бесплатни огласи | KetuJemi`
      : `${categoryDisplayName} — Бесплатни огласи | KetuJemi`;
    const description = `Бесплатни огласи за ${cat} на KetuJemi.com — Косово, Албанија, Македонија и дијаспора.`;
    return {
      title,
      description,
      canonicalPath,
      footerHtml: buildMkFooter(categoryDisplayName, cityName),
    };
  }

  if (locale === "mne") {
    const title = cityName
      ? `${categoryDisplayName} u ${cityName} — Besplatni oglasi | KetuJemi`
      : `${categoryDisplayName} — Besplatni oglasi | KetuJemi`;
    const description = `Besplatni oglasi za ${cat} na KetuJemi.com — Kosovo, Albanija, Makedonija i dijaspora.`;
    return {
      title,
      description,
      canonicalPath,
      footerHtml: buildMneFooter(categoryDisplayName, cityName),
    };
  }

  if (locale === "de") {
    const title = cityName
      ? `${categoryDisplayName} in ${cityName} — Kostenlose Anzeigen | KetuJemi`
      : `${categoryDisplayName} zum Verkauf — Kostenlose Anzeigen | KetuJemi`;
    const description = `Kostenlose Anzeigen für ${cat} auf KetuJemi.com — Kosovo, Albanien, Nordmazedonien und Diaspora.`;
    return { title, description, canonicalPath, footerHtml: buildDeFooter(categoryDisplayName, cityName) };
  }

  if (locale === "it") {
    const title = cityName
      ? `${categoryDisplayName} a ${cityName} — Annunci gratuiti | KetuJemi`
      : `${categoryDisplayName} in vendita — Annunci gratuiti | KetuJemi`;
    const description = `Annunci gratuiti per ${cat} su KetuJemi.com — Kosovo, Albania, Macedonia del Nord e diaspora.`;
    return { title, description, canonicalPath, footerHtml: buildItFooter(categoryDisplayName, cityName) };
  }

  if (locale === "fr") {
    const title = cityName
      ? `${categoryDisplayName} à ${cityName} — Annonces gratuites | KetuJemi`
      : `${categoryDisplayName} à vendre — Annonces gratuites | KetuJemi`;
    const description = `Annonces gratuites pour ${cat} sur KetuJemi.com — Kosovo, Albanie, Macédoine du Nord et diaspora.`;
    return { title, description, canonicalPath, footerHtml: buildFrFooter(categoryDisplayName, cityName) };
  }

  const title = cityName
    ? `${categoryDisplayName} in ${cityName} — Free Listings | KetuJemi`
    : `${categoryDisplayName} for sale — Free Listings | KetuJemi`;
  const description = `Free classifieds for ${cat} in Kosovo, Albania, North Macedonia and diaspora. Post for free on KetuJemi.com`;
  return { title, description, canonicalPath, footerHtml: buildEnFooter(categoryDisplayName, cityName) };
}

function buildSqFooter(
  categoryDisplayName: string,
  catLower: string,
  cityName: string | undefined,
  placeShort: string,
): string {
  const cities =
    "Prishtinë, Ferizaj, Prizren, Pejë, Gjilan, Mitrovicë, Gjakovë, Tiranë, Durrës, Vlorë, Shkodër, Skopje, Tetovë, Podgoricë";
  const geo = cityName
    ? `${cityName} dhe qytete të tjera në Kosovë, Shqipëri, Maqedoni e Veriut`
    : `Kosovë, Shqipëri, Maqedoni e Veriut, Mal i Zi dhe diasporën shqiptare në Gjermani, Zvicër, Austri, Francë, Itali, UK dhe SHBA`;

  return `<p>Kërkoni <strong>${catLower} në shitje ${placeShort.toLowerCase()}</strong>? KetuJemi.com është platforma ku publikoni <strong>shpallje falas</strong> për kategorinë <strong>${categoryDisplayName}</strong> — pa komision për postimin bazë dhe pa kufizim të panevojshëm. Në këtë faqe gjeni njoftime aktive nga shitës privatë dhe biznese që ofrojnë ${catLower} në ${geo}.</p>
<p>Çdo shpallje përmban foto, përshkrim, çmim dhe kontakt të drejtpërdrejtë me shitësin. Filtroni sipas qytetit — ${cities} — për të gjetur ofertën më afër jush. Për blerësit, kjo do të thotë kursim kohe: një kërkim i shpejtë zëvendëson telefonatë të shumta dhe ecje nëpër tregje.</p>
<p>Për shitësit, <strong>shpallje falas</strong> në KetuJemi ju jep dukshmëri në Google dhe në komunitetin lokal. Postoni nga telefoni ose kompjuteri, shtoni foto reale të produktit dhe përditësoni çmimin kur të doni. Platforma shërben si hapësirë lidhëse; marrëveshja dhe dorëzimi bëhen drejtpërdrejt mes palëve.</p>
<p>Nëse jeni në ${cityName ?? "Kosovë"} dhe kërkoni ${catLower}, shfletoni listat më poshtë ose publikoni kërkesën tuaj. KetuJemi — bli dhe shit shpejt, thjesht dhe në mënyrë të sigurt.</p>`;
}

function buildEnFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Kosovo, Albania and North Macedonia";
  return `<p>Looking for <strong>${categoryDisplayName.toLowerCase()}</strong> in <strong>${where}</strong>? KetuJemi.com offers <strong>free classifieds</strong> with no commission on basic posting. Browse active listings below or post your own ad in minutes — with photos, price and direct contact.</p>
<p>Whether you are in Prishtina, Ferizaj, Tirana, Skopje or the diaspora, KetuJemi connects buyers and sellers across 11 markets. Filter by city, compare offers and contact sellers directly without middlemen.</p>
<p>Sellers gain visibility in local search; buyers save time with one quick search instead of endless calls. Post for free today on KetuJemi.com.</p>`;
}

function buildDeFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Kosovo, Albanien und Nordmazedonien";
  return `<p>Sie suchen <strong>${categoryDisplayName}</strong> in <strong>${where}</strong>? Auf KetuJemi.com finden Sie <strong>kostenlose Kleinanzeigen</strong> ohne Provision für die Grundveröffentlichung. Durchsuchen Sie aktive Angebote oder veröffentlichen Sie Ihre eigene Anzeige mit Fotos, Preis und direktem Kontakt.</p>
<p>In Prishtina, Ferizaj, Tirana, Skopje oder in der Diaspora — KetuJemi verbindet Käufer und Verkäufer auf 11 Märkten. Filtern Sie nach Stadt und kontaktieren Sie Anbieter direkt.</p>`;
}

function buildItFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Kosovo, Albania e Macedonia del Nord";
  return `<p>Cerchi <strong>${categoryDisplayName}</strong> a <strong>${where}</strong>? Su KetuJemi.com trovi <strong>annunci gratuiti</strong> senza commissioni per la pubblicazione base. Sfoglia gli annunci attivi o pubblica il tuo con foto, prezzo e contatto diretto.</p>
<p>Da Prishtina a Ferizaj, Tirana, Skopje e la diaspora — KetuJemi collega acquirenti e venditori in 11 mercati.</p>`;
}

function buildFrFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Kosovo, Albanie et Macédoine du Nord";
  return `<p>Vous cherchez <strong>${categoryDisplayName}</strong> à <strong>${where}</strong> ? KetuJemi.com propose des <strong>annonces gratuites</strong> sans commission pour la publication de base. Parcourez les annonces actives ou publiez la vôtre avec photos, prix et contact direct.</p>`;
}

function buildMkFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Косово, Албанија и Северна Македонија";
  return `<p>Барате <strong>${categoryDisplayName}</strong> во <strong>${where}</strong>? На KetuJemi.com објавувајте <strong>бесплатни огласи</strong> без провизија. Прегледајте активни понуди или објавете свој оглас со фотографии и директен контакт.</p>`;
}

function buildMneFooter(categoryDisplayName: string, cityName?: string): string {
  const where = cityName ?? "Kosovo, Albanija i Sjeverna Makedonija";
  return `<p>Tražite <strong>${categoryDisplayName}</strong> u <strong>${where}</strong>? Na KetuJemi.com objavljujte <strong>besplatne oglase</strong> bez provizije. Pregledajte aktivne ponude ili objavite svoj oglas.</p>`;
}

export { citySlugFromName, cityNameFromSlug };

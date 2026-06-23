/**
 * Central category rules for posting forms, browse filters, breadcrumbs, and validation.
 */
import { categoryPath, type CategoryRef } from "@/lib/category-navigation";
import { translateCategory, type UiCategoryLocale } from "@/lib/category-translations";
import { AP_PART_CONDITION_DESC } from "@/lib/auto-pjese-search-helpers";
import { getAutoPiesePartTypeCategoryIds } from "@/lib/auto-pjese-search-helpers";
import { getArsimKurseLeafCategoryIds } from "@/lib/arsim-kurse-search-helpers";
import { getBanesaLeafCategoryIds } from "@/lib/banesa-search-helpers";
import { getBujqesiBlegtoriLeafCategoryIds } from "@/lib/bujqesi-blegtori-search-helpers";
import { getFemijeLeafCategoryIds } from "@/lib/femije-search-helpers";
import { getKafshetLeafCategoryIds } from "@/lib/kafshet-search-helpers";
import { getKamioneBrandLeafCategoryIds } from "@/lib/kamione-search-helpers";
import { getLokaleZyreLeafCategoryIds } from "@/lib/lokale-zyre-search-helpers";
import { getMobiljeDekorimLeafCategoryIds } from "@/lib/mobilje-dekorim-search-helpers";
import { getNdertimInstalimeLeafCategoryIds } from "@/lib/ndertim-instalime-search-helpers";
import { getMotorBrandLeafCategoryIds } from "@/lib/motorr-search-helpers";
import { getMuzikeHobbyLeafCategoryIds } from "@/lib/muzike-hobby-search-helpers";
import { getPuneSherbimeLeafCategoryIds } from "@/lib/pune-sherbime-search-helpers";
import { getRrobaKepuceLeafCategoryIds } from "@/lib/rroba-kepuce-search-helpers";
import { getSportOutdoorLeafCategoryIds } from "@/lib/sport-outdoor-search-helpers";
import { getTelefonaHubChildCategoryIds } from "@/lib/telefona-search-helpers";
import { getTvElektronikeLeafCategoryIds } from "@/lib/tv-elektronike-search-helpers";
import { getVeturaBrandLeafCategoryIds } from "@/lib/vetura-search-helpers";
import { isKompjuterHubTypeName } from "@/lib/kompjuter-laptop-search-helpers";
import { hasDisallowedPhoneInUserText } from "../../../../lib/listing-phone-in-text.ts";
import { detectProhibitedListingContent } from "../../../../lib/listing-prohibited-content";
import {
  DHURATA_FALAS_SLUG,
  LISTING_MAX_PHOTOS,
  DHURATA_PRICE_ZERO_MESSAGE,
  findDhurataBlockedWord,
  findKerkojBlockedWord,
  isDhurataFalasSlug,
  isKerkojTeBlejSlug,
  KERKOJ_TE_BLEJ_SLUG,
} from "@/lib/special-listing-categories";
export const CATEGORY_HUB_SLUGS = {
  vetura: "vetura",
  motorSkuter: "motorr-skuter",
  kamioneFurgone: "kamione-furgone",
  autoPjese: "auto-pjese",
  banesaShtepi: "banesa-shtepi",
  lokaleZyre: "lokale-zyre",
  telefona: "telefona",
  kompjutereLaptop: "kompjutere-laptope",
  sportOutdoor: "sport-outdoor",
  arsimKurse: "arsim-kurse",
  mobiljeDekorim: "mobilje-dekorime",
  rrobaKepuce: "rroba-kepuce",
  femije: "femije",
  puneSherbime: "pune-sherbime",
  ndertimInstalime: "ndertim-instalime",
  bujqesiBlegtori: "bujqesi-blegtori",
  muzikeHobby: "muzike-hobby",
  kafshet: "kafshet",
  tvElektronike: "tv-elektronike",
  kerkojTeBlej: KERKOJ_TE_BLEJ_SLUG,
  dhurataFalas: DHURATA_FALAS_SLUG,
} as const;

export type CategoryRow = {
  id: number;
  name: string;
  slug?: string | null;
  parent_id?: number | null;
  icon?: string | null;
  listing_count?: number;
  image_url?: string | null;
};

export type CategoryFields = {
  showVetura: boolean;
  showAutoPjese: boolean;
  showRealEstate: boolean;
  showPhone: boolean;
  showPrice: boolean;
  showPriceAgreement: boolean;
  showCondition: boolean;
  useAutoPjeseConditionLabels: boolean;
  showBrandPicker: boolean;
  maxPhotos: number;
  isKerkoj: boolean;
  isDhurata: boolean;
  forcePriceZero: boolean;
  subcategoryLabelMode: "vetura" | "autoPjese" | "default";
};

export type CategoryPageProfile = {
  categoryId: number;
  currentSlug: string;
  parentSlug: string;
  grandparentSlug: string;
  childCount: number;
  isVeturaHub: boolean;
  isKamioneFurgoneHub: boolean;
  isBanesaShtepiHub: boolean;
  isMotorSkuterHub: boolean;
  isAutoPjesHub: boolean;
  isSportOutdoorHub: boolean;
  isLokaleZyreHub: boolean;
  isTelefonaHubPage: boolean;
  isArsimKurseHub: boolean;
  isMobiljeDekorimHub: boolean;
  isRrobaKepuceHub: boolean;
  isFemijeHub: boolean;
  isPuneSherbimeHub: boolean;
  isNdertimInstalimeHub: boolean;
  isBujqesiBlegtoriHub: boolean;
  isMuzikeHobbyHub: boolean;
  isKafshetHub: boolean;
  isTvElektronikeHub: boolean;
  isKompjuterLaptopHub: boolean;
  isKompjuterTypePage: boolean;
  isDhurataFalasHub: boolean;
  isKerkojTeBlejHub: boolean;
  isFemijeGroupPage: boolean;
  isFemijeLeafPage: boolean;
  isParentCategoryHub: boolean;
  isGiftOrRequestHeroHub: boolean;
};

export type CategoryFilters = {
  hubResultsId: string | null;
  leafCsv: {
    veturaBrand: string;
    kamioneBrand: string;
    banesa: string;
    motorBrand: string;
    autoPjese: string;
    sportOutdoor: string;
    lokaleZyre: string;
    telefona: string;
    arsimKurse: string;
    mobiljeDekorim: string;
    rrobaKepuce: string;
    femije: string;
    puneSherbime: string;
    ndertimInstalime: string;
    bujqesiBlegtori: string;
    muzikeHobby: string;
    kafshet: string;
    tvElektronike: string;
  };
};

export type BreadcrumbItem = { label: string; href?: string };

export type ListingValidationInput = {
  title: string;
  description: string;
  price: number;
  price_agreement: boolean;
  category_id: number;
  brand_category_id?: number;
  parent_category_id?: number;
  condition?: string;
  xMarka?: string;
  xModeli?: string;
  xViti?: string;
  xKm?: string;
  xKarburanti?: string;
  xTransmisioni?: string;
  xTipi?: string;
  xNgjyraV?: string;
  xMotori?: string;
  xFuqia?: string;
  xGjendjaT?: string;
  xKlima?: string;
  xPanorama?: string;
  xSellerEmail?: string;
  xSellerAddress?: string;
  xSiperfaqja?: string;
  xKati?: string;
  xDhomat?: string;
  xFurnished?: string;
  xTelMarka?: string;
  xTelModeli?: string;
  xKapaciteti?: string;
  xNgjyra?: string;
};

export type ListingValidationIssue = {
  code: string;
  message: string;
  blockedWord?: string;
};

export type ListingValidationResult = {
  ok: boolean;
  issues: ListingValidationIssue[];
  extraDescriptionPrefix: string;
  payloadExtras: Record<string, unknown>;
  price: number;
  price_agreement: boolean;
};

const CLIENT_BLOCKED_WORDS = ["mashtrim", "spam", "seks", "fyerje", "falsifikim"];

function findBlockedWordClient(text: string): string | null {
  const hit = detectProhibitedListingContent(text, "");
  if (hit) return hit.label;
  const normalized = text.toLowerCase().normalize("NFC");
  for (const word of CLIENT_BLOCKED_WORDS) {
    if (normalized.includes(word.toLowerCase().normalize("NFC"))) return word;
  }
  return null;
}

function hasExternalLinkClient(description: string): boolean {
  return /(https?:\/\/|www\.)\S+/i.test(description);
}

function parseVehicleYear(s: string | undefined): number | undefined {
  if (!s?.trim()) return undefined;
  const m = s.trim().match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1], 10) : undefined;
}

function parseVehicleKm(s: string | undefined): number | undefined {
  if (!s?.trim()) return undefined;
  const digits = s.replace(/\D/g, "");
  if (!digits) return undefined;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : undefined;
}

function isRootHub(cat: CategoryRow | null): boolean {
  return !!(cat && !cat.parent_id);
}

function parentNameIs(name: string, rootName: string): boolean {
  return name === rootName;
}

export class CategoryEngine {
  constructor(private readonly categories: CategoryRow[]) {}

  findById(id: number): CategoryRow | null {
    return this.categories.find((c) => Number(c.id) === Number(id)) ?? null;
  }

  resolveChain(categoryId: number): {
    current: CategoryRow | null;
    parent: CategoryRow | null;
    grandparent: CategoryRow | null;
    children: CategoryRow[];
    rootParent: CategoryRow | null;
  } {
    const current = this.findById(categoryId);
    const parent =
      current?.parent_id != null ? this.findById(Number(current.parent_id)) : null;
    const grandparent =
      parent?.parent_id != null ? this.findById(Number(parent.parent_id)) : null;
    const children = this.categories.filter((c) => Number(c.parent_id) === Number(categoryId));
    let rootParent: CategoryRow | null = current;
    while (rootParent?.parent_id != null) {
      rootParent = this.findById(Number(rootParent.parent_id));
    }
    return { current, parent, grandparent, children, rootParent };
  }

  /** Posting form field visibility (uses root parent category). */
  getFields(categoryId: number, _market: string): CategoryFields {
    const { rootParent } = this.resolveChain(categoryId);
    const rootName = rootParent?.name ?? "";
    const rootSlug = rootParent?.slug?.trim() ?? "";
    const isKerkoj = isKerkojTeBlejSlug(rootSlug);
    const isDhurata = isDhurataFalasSlug(rootSlug);
    const showVetura = parentNameIs(rootName, "Vetura");
    const showAutoPjese = parentNameIs(rootName, "Auto Pjesë");
    const showRealEstate =
      parentNameIs(rootName, "Banesa & Shtëpi") || parentNameIs(rootName, "Lokale & Zyrë");
    const showPhone = parentNameIs(rootName, "Telefona");

    return {
      showVetura,
      showAutoPjese,
      showRealEstate,
      showPhone,
      showPrice: !isKerkoj,
      showPriceAgreement: !isKerkoj && !isDhurata,
      showCondition: !isDhurata,
      useAutoPjeseConditionLabels: showAutoPjese,
      showBrandPicker: true,
      maxPhotos: LISTING_MAX_PHOTOS,
      isKerkoj,
      isDhurata,
      forcePriceZero: isKerkoj || isDhurata,
      subcategoryLabelMode: showVetura ? "vetura" : showAutoPjese ? "autoPjese" : "default",
    };
  }

  getPageProfile(categoryId: number): CategoryPageProfile {
    const { current, parent, grandparent, children } = this.resolveChain(categoryId);
    const currentSlug = current?.slug?.trim() ?? "";
    const parentSlug = parent?.slug?.trim() ?? "";
    const grandparentSlug = grandparent?.slug?.trim() ?? "";

    const hub = (slug: string) => isRootHub(current) && currentSlug === slug;

    const isFemijeGroupPage =
      parentSlug === CATEGORY_HUB_SLUGS.femije && currentSlug.startsWith("femije-grp-");
    const isFemijeLeafPage =
      currentSlug.startsWith("femije-leaf-") ||
      (currentSlug.startsWith("femije-type-") && children.length === 0);

    const isVeturaHub = hub(CATEGORY_HUB_SLUGS.vetura);
    const isKamioneFurgoneHub = hub(CATEGORY_HUB_SLUGS.kamioneFurgone);
    const isBanesaShtepiHub = hub(CATEGORY_HUB_SLUGS.banesaShtepi);
    const isMotorSkuterHub = hub(CATEGORY_HUB_SLUGS.motorSkuter);
    const isAutoPjesHub = hub(CATEGORY_HUB_SLUGS.autoPjese);
    const isSportOutdoorHub = hub(CATEGORY_HUB_SLUGS.sportOutdoor);
    const isLokaleZyreHub = hub(CATEGORY_HUB_SLUGS.lokaleZyre);
    const isTelefonaHubPage = hub(CATEGORY_HUB_SLUGS.telefona);
    const isArsimKurseHub = hub(CATEGORY_HUB_SLUGS.arsimKurse);
    const isMobiljeDekorimHub = hub(CATEGORY_HUB_SLUGS.mobiljeDekorim);
    const isRrobaKepuceHub = hub(CATEGORY_HUB_SLUGS.rrobaKepuce);
    const isFemijeHub = hub(CATEGORY_HUB_SLUGS.femije);
    const isPuneSherbimeHub = hub(CATEGORY_HUB_SLUGS.puneSherbime);
    const isNdertimInstalimeHub = hub(CATEGORY_HUB_SLUGS.ndertimInstalime);
    const isBujqesiBlegtoriHub = hub(CATEGORY_HUB_SLUGS.bujqesiBlegtori);
    const isMuzikeHobbyHub = hub(CATEGORY_HUB_SLUGS.muzikeHobby);
    const isKafshetHub = hub(CATEGORY_HUB_SLUGS.kafshet);
    const isTvElektronikeHub = hub(CATEGORY_HUB_SLUGS.tvElektronike);
    const isKompjuterLaptopHub = hub(CATEGORY_HUB_SLUGS.kompjutereLaptop);
    const isKompjuterTypePage =
      parentSlug === CATEGORY_HUB_SLUGS.kompjutereLaptop &&
      isKompjuterHubTypeName(current?.name ?? "");
    const isDhurataFalasHub = hub(CATEGORY_HUB_SLUGS.dhurataFalas);
    const isKerkojTeBlejHub = hub(CATEGORY_HUB_SLUGS.kerkojTeBlej);

    const isParentCategoryHub =
      isVeturaHub ||
      isKamioneFurgoneHub ||
      isBanesaShtepiHub ||
      isMotorSkuterHub ||
      isAutoPjesHub ||
      isSportOutdoorHub ||
      isLokaleZyreHub ||
      isTelefonaHubPage ||
      isArsimKurseHub ||
      isMobiljeDekorimHub ||
      isRrobaKepuceHub ||
      isFemijeHub ||
      isPuneSherbimeHub ||
      isNdertimInstalimeHub ||
      isBujqesiBlegtoriHub ||
      isMuzikeHobbyHub ||
      isKafshetHub ||
      isTvElektronikeHub ||
      isKompjuterLaptopHub;

    return {
      categoryId,
      currentSlug,
      parentSlug,
      grandparentSlug,
      childCount: children.length,
      isVeturaHub,
      isKamioneFurgoneHub,
      isBanesaShtepiHub,
      isMotorSkuterHub,
      isAutoPjesHub,
      isSportOutdoorHub,
      isLokaleZyreHub,
      isTelefonaHubPage,
      isArsimKurseHub,
      isMobiljeDekorimHub,
      isRrobaKepuceHub,
      isFemijeHub,
      isPuneSherbimeHub,
      isNdertimInstalimeHub,
      isBujqesiBlegtoriHub,
      isMuzikeHobbyHub,
      isKafshetHub,
      isTvElektronikeHub,
      isKompjuterLaptopHub,
      isKompjuterTypePage,
      isDhurataFalasHub,
      isKerkojTeBlejHub,
      isFemijeGroupPage,
      isFemijeLeafPage,
      isParentCategoryHub,
      isGiftOrRequestHeroHub: isKerkojTeBlejHub || isDhurataFalasHub,
    };
  }

  getFilters(categoryId: number): CategoryFilters {
    const page = this.getPageProfile(categoryId);
    const cats = this.categories;

    const csv = (ids: number[]) => [...ids].sort((a, b) => a - b).join(",");

    const leafCsv = {
      veturaBrand: page.isVeturaHub
        ? csv(getVeturaBrandLeafCategoryIds(cats as any, categoryId))
        : "",
      kamioneBrand: page.isKamioneFurgoneHub
        ? csv(getKamioneBrandLeafCategoryIds(cats as any, categoryId))
        : "",
      banesa: page.isBanesaShtepiHub
        ? csv(getBanesaLeafCategoryIds(cats as any, categoryId))
        : "",
      motorBrand: page.isMotorSkuterHub
        ? csv(getMotorBrandLeafCategoryIds(cats as any, categoryId))
        : "",
      autoPjese: page.isAutoPjesHub
        ? csv(getAutoPiesePartTypeCategoryIds(cats as any, categoryId))
        : "",
      sportOutdoor: page.isSportOutdoorHub
        ? csv(getSportOutdoorLeafCategoryIds(cats as any, categoryId))
        : "",
      lokaleZyre: page.isLokaleZyreHub
        ? csv(getLokaleZyreLeafCategoryIds(cats as any, categoryId))
        : "",
      telefona: page.isTelefonaHubPage
        ? csv(getTelefonaHubChildCategoryIds(cats as any, categoryId))
        : "",
      arsimKurse: page.isArsimKurseHub
        ? csv(getArsimKurseLeafCategoryIds(cats as any, categoryId))
        : "",
      mobiljeDekorim: page.isMobiljeDekorimHub
        ? csv(getMobiljeDekorimLeafCategoryIds(cats as any, categoryId))
        : "",
      rrobaKepuce: page.isRrobaKepuceHub
        ? csv(getRrobaKepuceLeafCategoryIds(cats as any, categoryId))
        : "",
      femije: page.isFemijeHub
        ? csv(getFemijeLeafCategoryIds(cats as any, categoryId))
        : "",
      puneSherbime: page.isPuneSherbimeHub
        ? csv(getPuneSherbimeLeafCategoryIds(cats as any, categoryId))
        : "",
      ndertimInstalime: page.isNdertimInstalimeHub
        ? csv(getNdertimInstalimeLeafCategoryIds(cats as any, categoryId))
        : "",
      bujqesiBlegtori: page.isBujqesiBlegtoriHub
        ? csv(getBujqesiBlegtoriLeafCategoryIds(cats as any, categoryId))
        : "",
      muzikeHobby: page.isMuzikeHobbyHub
        ? csv(getMuzikeHobbyLeafCategoryIds(cats as any, categoryId))
        : "",
      kafshet: page.isKafshetHub
        ? csv(getKafshetLeafCategoryIds(cats as any, categoryId))
        : "",
      tvElektronike: page.isTvElektronikeHub
        ? csv(getTvElektronikeLeafCategoryIds(cats as any, categoryId))
        : "",
    };

    const hubResultsId = page.isVeturaHub
      ? "vetura-results"
      : page.isKamioneFurgoneHub
        ? "kamione-results"
        : page.isBanesaShtepiHub
          ? "banesa-results"
          : page.isMotorSkuterHub
            ? "motorr-results"
            : page.isAutoPjesHub
              ? "auto-pjese-results"
              : page.isSportOutdoorHub
                ? "sport-outdoor-results"
                : page.isLokaleZyreHub
                  ? "lokale-zyre-results"
                  : page.isTelefonaHubPage
                    ? "telefona-results"
                    : page.isArsimKurseHub
                      ? "arsim-kurse-results"
                      : page.isMobiljeDekorimHub
                        ? "mobilje-dekorim-results"
                        : page.isRrobaKepuceHub
                          ? "rroba-kepuce-results"
                          : page.isFemijeHub
                            ? "femije-results"
                            : page.isPuneSherbimeHub
                              ? "pune-sherbime-results"
                              : page.isNdertimInstalimeHub
                                ? "ndertim-instalime-results"
                                : page.isBujqesiBlegtoriHub
                                ? "bujqesi-blegtori-results"
                                : page.isMuzikeHobbyHub
                                  ? "muzike-hobby-results"
                                  : page.isKafshetHub
                                    ? "kafshet-results"
                                    : page.isTvElektronikeHub
                                      ? "tv-elektronike-results"
                                      : page.isKompjuterLaptopHub || page.isKompjuterTypePage
                                        ? "kompjutere-laptop-results"
                                        : null;

    return { hubResultsId, leafCsv };
  }

  getBreadcrumb(
    categoryId: number,
    locale: UiCategoryLocale,
    trailing: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] {
    const { current, parent, grandparent } = this.resolveChain(categoryId);
    const items: BreadcrumbItem[] = [{ label: "KetuJemi", href: "/" }];
    if (grandparent) {
      items.push({
        label: translateCategory(grandparent.name, locale),
        href: categoryPath(grandparent as CategoryRef),
      });
    }
    if (parent) {
      items.push({
        label: translateCategory(parent.name, locale),
        href: categoryPath(parent as CategoryRef),
      });
    }
    if (current) {
      items.push({ label: translateCategory(current.name, locale) });
    }
    if (!trailing.length) return items;
    const last = items.pop();
    return [...items, ...trailing, ...(last ? [last] : [])];
  }

  buildExtraDescription(
    data: ListingValidationInput,
    categoryId: number,
    subcategoryName?: string,
    options?: { omitSellerEmail?: boolean },
  ): string {
    const fields = this.getFields(categoryId, "");
    const lines: string[] = [];

    if (fields.showAutoPjese) {
      if (subcategoryName) lines.push(`Lloji i pjesës: ${subcategoryName}`);
      if (data.xMarka) lines.push(`Marka: ${data.xMarka}`);
      if (data.xModeli) lines.push(`Modeli: ${data.xModeli}`);
      if (data.xViti) lines.push(`Viti: ${data.xViti}`);
      const condKey =
        data.condition === "New" ? "new" : data.condition === "Used" ? "used_oem" : "scrap";
      if (AP_PART_CONDITION_DESC[condKey]) lines.push(AP_PART_CONDITION_DESC[condKey]);
    } else if (fields.showVetura) {
      if (data.xMarka) lines.push(`Marka: ${data.xMarka}`);
      if (data.xModeli) lines.push(`Modeli: ${data.xModeli}`);
      if (data.xViti) lines.push(`Viti: ${data.xViti}`);
      if (data.xKm) lines.push(`Kilometrazha: ${data.xKm} km`);
      if (data.xKarburanti) lines.push(`Karburanti: ${data.xKarburanti}`);
      if (data.xTransmisioni) lines.push(`Transmisioni: ${data.xTransmisioni}`);
      if (data.xTipi) lines.push(`Tipi: ${data.xTipi}`);
      if (data.xNgjyraV) lines.push(`Ngjyra: ${data.xNgjyraV}`);
      if (data.xMotori) lines.push(`Motori: ${data.xMotori} L`);
      if (data.xFuqia) lines.push(`Fuqia: ${data.xFuqia} hp`);
      if (data.xGjendjaT) lines.push(`Gjendja teknike: ${data.xGjendjaT}`);
      if (data.xKlima) lines.push(`Klima: ${data.xKlima}`);
      if (data.xPanorama) lines.push(`Panorama: ${data.xPanorama}`);
    } else if (fields.showRealEstate) {
      if (data.xSiperfaqja) lines.push(`Sipërfaqja: ${data.xSiperfaqja} m²`);
      if (data.xKati) lines.push(`Kati: ${data.xKati}`);
      if (data.xDhomat) lines.push(`Numri dhomave: ${data.xDhomat}`);
      if (data.xFurnished) lines.push(`Mobilimi: ${data.xFurnished}`);
    } else if (fields.showPhone) {
      if (data.xTelMarka) lines.push(`Marka: ${data.xTelMarka}`);
      if (data.xTelModeli) lines.push(`Modeli: ${data.xTelModeli}`);
      if (data.xKapaciteti) lines.push(`Kapaciteti: ${data.xKapaciteti}`);
      if (data.xNgjyra) lines.push(`Ngjyra: ${data.xNgjyra}`);
    }

    if (!options?.omitSellerEmail && data.xSellerEmail) lines.push(`Email: ${data.xSellerEmail}`);
    if (data.xSellerAddress) lines.push(`Adresa: ${data.xSellerAddress}`);
    return lines.length ? `${lines.join(" · ")}\n\n` : "";
  }

  validateListing(
    data: ListingValidationInput,
    categoryId: number,
    options?: {
      imageCount?: number;
      hasVideo?: boolean;
      subcategoryName?: string;
      sellLangBlockedTemplate?: string;
      omitSellerEmail?: boolean;
    },
  ): ListingValidationResult {
    const fields = this.getFields(categoryId, "");
    const issues: ListingValidationIssue[] = [];
    const imageCount = options?.imageCount ?? 0;
    const hasVideo = !!options?.hasVideo;

    if (imageCount === 0 && !hasVideo) {
      issues.push({ code: "NO_PHOTOS", message: "addAtLeastPhoto" });
    }
    if (fields.isKerkoj) {
      const blocked = findKerkojBlockedWord(`${data.title}\n${data.description}`);
      if (blocked) {
        issues.push({
          code: "KERKOJ_BLOCKED_WORD",
          message:
            options?.sellLangBlockedTemplate?.replace("{word}", blocked) ??
            `Blocked word: ${blocked}`,
          blockedWord: blocked,
        });
      }
    }
    if (fields.isDhurata) {
      const blocked = findDhurataBlockedWord(`${data.title}\n${data.description}`);
      if (blocked) {
        issues.push({
          code: "DHURATA_BLOCKED_WORD",
          message:
            options?.sellLangBlockedTemplate?.replace("{word}", blocked) ??
            `Blocked word: ${blocked}`,
          blockedWord: blocked,
        });
      }
    }
    if (fields.isDhurata && !data.price_agreement && data.price > 0) {
      issues.push({ code: "DHURATA_PRICE", message: DHURATA_PRICE_ZERO_MESSAGE });
    }
    if (fields.showAutoPjese) {
      if (!data.category_id || Number(data.category_id) < 1) {
        issues.push({ code: "AP_PART_REQUIRED", message: "ap_post_err_part" });
      }
      if (!data.xMarka?.trim() || !data.xModeli?.trim() || !data.xViti?.trim()) {
        issues.push({ code: "AP_COMPAT_REQUIRED", message: "ap_post_err_compat" });
      }
    }

    const extraDescriptionPrefix = this.buildExtraDescription(
      data,
      categoryId,
      options?.subcategoryName,
      { omitSellerEmail: options?.omitSellerEmail },
    );
    const finalDescription = extraDescriptionPrefix + data.description;
    const blockedWord = findBlockedWordClient(`${data.title} ${finalDescription}`);
    if (blockedWord) {
      const prohibited = detectProhibitedListingContent(data.title, finalDescription);
      issues.push({
        code: prohibited ? "PROHIBITED_CONTENT" : "CLIENT_BLOCKED_WORD",
        message: prohibited
          ? prohibited.reason
          : `Përmbajtja përmban fjalë të ndaluara: "${blockedWord}".`,
        blockedWord,
      });
    }
    if (hasDisallowedPhoneInUserText(data.description)) {
      issues.push({
        code: "PHONE_IN_DESCRIPTION",
        message:
          "Numri i telefonit nuk lejohet në përshkrim. Vendoseni vetëm në fushën e telefonit.",
      });
    }
    if (hasExternalLinkClient(finalDescription)) {
      issues.push({
        code: "EXTERNAL_LINK",
        message: "Linqet e jashtme nuk lejohen në përshkrim.",
      });
    }

    const price =
      fields.forcePriceZero || data.price_agreement ? 0 : data.price;
    const price_agreement = fields.forcePriceZero ? false : data.price_agreement;

    const payloadExtras: Record<string, unknown> =
      fields.showVetura || fields.showAutoPjese
        ? {
            vehicle_year: parseVehicleYear(data.xViti) ?? null,
            vehicle_mileage_km: fields.showVetura ? parseVehicleKm(data.xKm) ?? null : null,
            vehicle_fuel: fields.showVetura ? data.xKarburanti || null : null,
            vehicle_body_type: fields.showVetura ? data.xTipi || null : null,
            vehicle_model: data.xModeli || null,
          }
        : {};

    return {
      ok: issues.length === 0,
      issues,
      extraDescriptionPrefix,
      payloadExtras,
      price,
      price_agreement,
    };
  }
}

export function categoryEngine(categories: CategoryRow[]): CategoryEngine {
  return new CategoryEngine(categories);
}

/** Root parent posting profile from selected parent category id. */
export function getPostingFields(
  categories: CategoryRow[],
  parentCategoryId: number,
  market: string,
): CategoryFields {
  return categoryEngine(categories).getFields(parentCategoryId, market);
}

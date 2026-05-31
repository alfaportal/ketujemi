import {
  BB_TYPE_DB_SLUG,
  BB_TYPE_KEYS,
  BB_TYPE_LABEL_KEY,
  BB_TYPE_PHOTOS,
  BUJQESI_BLEGTORI_HUB_SLUG,
} from "@/lib/bujqesi-blegtori-search-helpers";
import {
  EP_TYPE_DB_SLUG,
  EP_TYPE_KEYS,
  EP_TYPE_LABEL_KEY,
  EP_TYPE_PHOTOS,
  TV_ELEKTRONIKE_HUB_SLUG,
} from "@/lib/tv-elektronike-search-helpers";
import {
  KSH_TYPE_DB_SLUG,
  KSH_TYPE_KEYS,
  KSH_TYPE_LABEL_KEY,
  KSH_TYPE_PHOTOS,
  KAFSHET_HUB_SLUG,
} from "@/lib/kafshet-search-helpers";
import {
  LOKALE_PROPERTY_KEYS,
  LOKALE_PROPERTY_LABEL_KEY,
  LOKALE_PROPERTY_PHOTOS,
  LOKALE_PROPERTY_SLUG,
  LOKALE_ZYRE_HUB_SLUG,
} from "@/lib/lokale-zyre-search-helpers";
import {
  MD_TYPE_DB_SLUG,
  MD_TYPE_KEYS,
  MD_TYPE_LABEL_KEY,
  MD_TYPE_PHOTOS,
  MOBILJE_DEKORIM_HUB_SLUG,
} from "@/lib/mobilje-dekorim-search-helpers";
import {
  MH_TYPE_DB_SLUG,
  MH_TYPE_KEYS,
  MH_TYPE_LABEL_KEY,
  MH_TYPE_PHOTOS,
  MUZIKE_HOBBY_HUB_SLUG,
} from "@/lib/muzike-hobby-search-helpers";
import {
  PS_TYPE_DB_SLUG,
  PS_TYPE_KEYS,
  PS_TYPE_LABEL_KEY,
  PS_TYPE_PHOTOS,
  PUNE_SHERBIME_HUB_SLUG,
} from "@/lib/pune-sherbime-search-helpers";
import {
  RK_TYPE_DB_SLUG,
  RK_TYPE_KEYS,
  RK_TYPE_LABEL_KEY,
  RK_TYPE_PHOTOS,
  RROBA_KEPUCE_HUB_SLUG,
} from "@/lib/rroba-kepuce-search-helpers";
import type { HubTypePickerConfig } from "@/lib/hub-drill-down";

export const HUB_DRILL_DOWN_REGISTRY = {
  kafshet: {
    hubSlug: KAFSHET_HUB_SLUG,
    typeKeys: KSH_TYPE_KEYS,
    typeDbSlug: KSH_TYPE_DB_SLUG,
    typePhotos: KSH_TYPE_PHOTOS,
    typeLabelKey: KSH_TYPE_LABEL_KEY,
    titleI18nKey: "ksh_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  bujqesi: {
    hubSlug: BUJQESI_BLEGTORI_HUB_SLUG,
    typeKeys: BB_TYPE_KEYS,
    typeDbSlug: BB_TYPE_DB_SLUG,
    typePhotos: BB_TYPE_PHOTOS,
    typeLabelKey: BB_TYPE_LABEL_KEY,
    titleI18nKey: "bb_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  mobilje: {
    hubSlug: MOBILJE_DEKORIM_HUB_SLUG,
    typeKeys: MD_TYPE_KEYS,
    typeDbSlug: MD_TYPE_DB_SLUG,
    typePhotos: MD_TYPE_PHOTOS,
    typeLabelKey: MD_TYPE_LABEL_KEY,
    titleI18nKey: "md_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  lokale: {
    hubSlug: LOKALE_ZYRE_HUB_SLUG,
    typeKeys: LOKALE_PROPERTY_KEYS,
    typeDbSlug: LOKALE_PROPERTY_SLUG,
    typePhotos: LOKALE_PROPERTY_PHOTOS,
    typeLabelKey: LOKALE_PROPERTY_LABEL_KEY,
    titleI18nKey: "lz_sec_property",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  muzike: {
    hubSlug: MUZIKE_HOBBY_HUB_SLUG,
    typeKeys: MH_TYPE_KEYS,
    typeDbSlug: MH_TYPE_DB_SLUG,
    typePhotos: MH_TYPE_PHOTOS,
    typeLabelKey: MH_TYPE_LABEL_KEY,
    titleI18nKey: "mh_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  rroba: {
    hubSlug: RROBA_KEPUCE_HUB_SLUG,
    typeKeys: RK_TYPE_KEYS,
    typeDbSlug: RK_TYPE_DB_SLUG,
    typePhotos: RK_TYPE_PHOTOS,
    typeLabelKey: RK_TYPE_LABEL_KEY,
    titleI18nKey: "rk_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  pune: {
    hubSlug: PUNE_SHERBIME_HUB_SLUG,
    typeKeys: PS_TYPE_KEYS,
    typeDbSlug: PS_TYPE_DB_SLUG,
    typePhotos: PS_TYPE_PHOTOS,
    typeLabelKey: PS_TYPE_LABEL_KEY,
    titleI18nKey: "ps_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
  tv: {
    hubSlug: TV_ELEKTRONIKE_HUB_SLUG,
    typeKeys: EP_TYPE_KEYS,
    typeDbSlug: EP_TYPE_DB_SLUG,
    typePhotos: EP_TYPE_PHOTOS,
    typeLabelKey: EP_TYPE_LABEL_KEY,
    titleI18nKey: "ep_sec_types",
    hintI18nKey: "hub_drill_pick_type",
  } satisfies HubTypePickerConfig,
} as const;

export type HubDrillDownRegistryKey = keyof typeof HUB_DRILL_DOWN_REGISTRY;

/** Map hub slug → registry key for generic drill-down wiring. */
export const HUB_SLUG_TO_DRILL_DOWN_KEY: Record<string, HubDrillDownRegistryKey> = {
  [KAFSHET_HUB_SLUG]: "kafshet",
  [BUJQESI_BLEGTORI_HUB_SLUG]: "bujqesi",
  [MOBILJE_DEKORIM_HUB_SLUG]: "mobilje",
  [LOKALE_ZYRE_HUB_SLUG]: "lokale",
  [MUZIKE_HOBBY_HUB_SLUG]: "muzike",
  [RROBA_KEPUCE_HUB_SLUG]: "rroba",
  [PUNE_SHERBIME_HUB_SLUG]: "pune",
  [TV_ELEKTRONIKE_HUB_SLUG]: "tv",
};

/** Auto Pjesë — 3 new hub type subcategories (additive only). */

export type AutoPjeseExtraTypeDef = {
  name: string;
  slug: string;
};

export const AUTO_PJESE_HUB_SLUG = "auto-pjese";

export const AUTO_PJESE_EXTRA_TYPES: AutoPjeseExtraTypeDef[] = [
  { name: "Ftohja & Klima", slug: "auto-pjes-type-ftohja-klima" },
  { name: "Pjesë Elektrike & Elektronike", slug: "auto-pjes-type-elektrike" },
  { name: "Të tjera Pjesë", slug: "auto-pjes-type-te-tjera" },
];

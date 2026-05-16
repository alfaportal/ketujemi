/** Auto Pjesë hub slug (matches seeded category). */
export const AUTO_PJESE_HUB_SLUG = "auto-pjese";

export const AUTO_PJESE_HERO_PHOTO =
  "https://images.pexels.com/photos/4489711/pexels-photo-4489711.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

/** Canonical part-type names (DB category names). */
export const AUTO_PJESE_PART_NAMES = [
  "Akumulatorë",
  "Amortizerë",
  "Drita & LED",
  "Fellne & Goma",
  "Motorrë",
  "Pjesë Karoserie",
  "Sisteme Frenimi",
  "Vajra & Filtra",
  "Të tjera Pjesë",
] as const;

export type AutoPjesePartName = (typeof AUTO_PJESE_PART_NAMES)[number];

export const AUTO_PJESE_PART_PHOTOS: Record<AutoPjesePartName, string> = {
  "Akumulatorë":
    "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Amortizerë":
    "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Drita & LED":
    "https://images.pexels.com/photos/3874337/pexels-photo-3874337.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Fellne & Goma":
    "https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Motorrë":
    "https://images.pexels.com/photos/190574/pexels-photo-190574.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Pjesë Karoserie":
    "https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sisteme Frenimi":
    "https://images.pexels.com/photos/3807571/pexels-photo-3807571.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Vajra & Filtra":
    "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Të tjera Pjesë":
    "https://images.pexels.com/photos/3806983/pexels-photo-3806983.jpeg?auto=compress&cs=tinysrgb&w=400",
};

export const AUTO_PJESE_BRANDS = [
  "Audi",
  "BMW",
  "Chevrolet",
  "Citroen",
  "Dacia",
  "Fiat",
  "Ford",
  "Honda",
  "Hyundai",
  "Kia",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Opel",
  "Peugeot",
  "Renault",
  "Seat",
  "Skoda",
  "Suzuki",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;

export type AutoPjeseBrand = (typeof AUTO_PJESE_BRANDS)[number];

export const AUTO_PJESE_MODELS: Record<AutoPjeseBrand, readonly string[]> = {
  Volkswagen: ["Golf", "Passat", "Polo", "Tiguan", "Touareg", "Caddy", "Transporter"],
  BMW: ["Seria 1", "Seria 3", "Seria 5", "Seria 7", "X1", "X3", "X5", "X6"],
  "Mercedes-Benz": ["A-Klasa", "C-Klasa", "E-Klasa", "S-Klasa", "GLE", "GLC", "Sprinter"],
  Audi: ["A3", "A4", "A5", "A6", "A8", "Q3", "Q5", "Q7", "TT"],
  Opel: ["Astra", "Corsa", "Vectra", "Insignia", "Mokka", "Zafira"],
  Toyota: ["Corolla", "Camry", "Yaris", "RAV4", "Land Cruiser", "Hilux"],
  Ford: ["Focus", "Fiesta", "Mondeo", "Kuga", "Transit", "Ranger"],
  Renault: ["Clio", "Megane", "Laguna", "Duster", "Kadjar", "Master"],
  Peugeot: ["206", "207", "208", "301", "308", "407", "508", "3008"],
  Hyundai: ["i20", "i30", "i40", "Tucson", "Santa Fe", "ix35"],
  Kia: ["Picanto", "Rio", "Ceed", "Sportage", "Sorento"],
  Skoda: ["Fabia", "Octavia", "Superb", "Kodiaq", "Karoq"],
  Seat: ["Ibiza", "Leon", "Ateca", "Tarraco"],
  Nissan: ["Micra", "Juke", "Qashqai", "X-Trail", "Navara"],
  Honda: ["Civic", "Accord", "CR-V", "Jazz", "HR-V"],
  Mazda: ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-5"],
  Mitsubishi: ["Colt", "Lancer", "Outlander", "Pajero", "L200"],
  Suzuki: ["Swift", "Vitara", "Jimny", "SX4"],
  Fiat: ["Punto", "Bravo", "500", "Tipo", "Doblo", "Ducato"],
  Dacia: ["Logan", "Sandero", "Duster", "Spring"],
  Citroen: ["C3", "C4", "C5", "Berlingo", "Jumper"],
  Chevrolet: ["Aveo", "Cruze", "Captiva", "Spark"],
  Volvo: ["S40", "S60", "V40", "V50", "XC40", "XC60", "XC90"],
};

export const AUTO_PJESE_YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

export const TIRE_INCH_OPTS = ["R13", "R14", "R15", "R16", "R17", "R18", "R19", "R20", "R21+"] as const;
export const TIRE_SEASON_OPTS = ["Verore", "Dimërore", "Gjithëvjetore"] as const;

/** Stored in listing description for search + display. */
export const AP_PART_CONDITION_DESC: Record<string, string> = {
  new: "Gjendja pjesës: E re",
  used_oem: "Gjendja pjesës: E përdorur (Origjinale)",
  scrap: "Gjendja pjesës: Për pjesë / jofunksionale",
};

export const AP_PART_CONDITION_API: Record<string, "New" | "Used" | "Damaged"> = {
  new: "New",
  used_oem: "Used",
  scrap: "Damaged",
};

export type AutoPjeseCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export function getAutoPiesePartTypeCategoryIds(
  categories: AutoPjeseCategoryRow[],
  hubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === hubId &&
        (AUTO_PJESE_PART_NAMES as readonly string[]).includes(c.name),
    )
    .map((c) => c.id);
}

export function resolvePartTypeCategoryId(
  categories: AutoPjeseCategoryRow[],
  hubId: number,
  partName: string,
): number | undefined {
  const row = categories.find((c) => c.parent_id === hubId && c.name === partName);
  return row?.id;
}

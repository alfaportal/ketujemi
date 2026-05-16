/** Display order for Motorr & Skuter brand picker (subset for sorts that still use name ranking). */
export const MOTOR_SEARCH_BRAND_ORDER = [
  "Aprilia",
  "BMW",
  "Ducati",
  "Harley-Davidson",
  "Honda",
  "Kawasaki",
  "KTM",
  "Piaggio",
  "Suzuki",
  "Yamaha",
  "Benelli",
  "Husqvarna",
  "Keeway",
  "Kymco",
  "SYM",
  "Triumph",
] as const;

export type MotorVehicleTypeKey =
  | "chopper"
  | "enduro"
  | "motokros"
  | "sportiv"
  | "quad"
  | "skuter"
  | "vespa";

/** Curated model lists per vehicle-type card on the Motorr hub search panel. */
export const MOTOR_MODELS_BY_TYPE: Record<MotorVehicleTypeKey, readonly string[]> = {
  chopper: [
    "Harley-Davidson Sportster",
    "Harley-Davidson Softail",
    "Harley-Davidson Road King",
    "Harley-Davidson Iron 883",
    "Harley-Davidson Night Rod",
    "Yamaha Drag Star",
    "Honda Shadow",
    "Suzuki Intruder",
    "Kawasaki Vulcan",
    "BMW R18",
    "Indian Chief",
    "Indian Scout",
  ],
  enduro: [
    "BMW R 1250 GS",
    "BMW R 1200 GS",
    "BMW F 800 GS",
    "KTM EXC 300",
    "KTM Super Adventure",
    "Honda Africa Twin",
    "Honda Transalp",
    "Yamaha Tenere 700",
    "Yamaha Tenere 1200",
    "Suzuki V-Strom 650",
    "Suzuki V-Strom 1000",
    "Kawasaki Versys 650",
    "Kawasaki Versys 1000",
  ],
  motokros: [
    "KTM SX-F 250",
    "KTM SX-F 450",
    "Kawasaki KX 250",
    "Kawasaki KX 450",
    "Yamaha YZ 250",
    "Yamaha YZ 450",
    "Honda CRF 250",
    "Honda CRF 450",
    "Suzuki RM-Z 250",
    "Suzuki RM-Z 450",
    "Husqvarna FC 250",
    "Husqvarna FC 450",
  ],
  sportiv: [
    "Yamaha YZF-R1",
    "Yamaha YZF-R6",
    "Yamaha MT-07",
    "Yamaha MT-09",
    "Honda CBR 1000RR",
    "Honda CBR 600RR",
    "Honda Hornet",
    "Suzuki GSX-R 1000",
    "Suzuki GSX-R 600",
    "Suzuki Hayabusa",
    "Kawasaki Ninja ZX-10R",
    "Kawasaki Ninja ZX-6R",
    "Ducati Panigale",
    "Ducati Monster",
    "Ducati Diavel",
    "BMW S 1000 RR",
    "Aprilia RSV4",
    "Aprilia Tuono",
  ],
  quad: [
    "Yamaha Raptor 700",
    "Yamaha Grizzly 700",
    "Honda TRX 450",
    "Honda Foreman 500",
    "Kawasaki KFX 450",
    "Kawasaki Brute Force",
    "Can-Am Outlander",
    "Can-Am Renegade",
    "Polaris Sportsman",
    "CF Moto 500",
    "Suzuki LTZ 400",
    "Kymco MXU 500",
  ],
  skuter: [
    "Yamaha X-Max 300",
    "Yamaha X-Max 400",
    "Yamaha TMAX",
    "Honda SH 150",
    "Honda SH 300",
    "Honda PCX 125",
    "Suzuki Burgman 400",
    "Suzuki Burgman 650",
    "Kymco Xciting 400",
    "Kymco Downtown 350",
    "Piaggio MP3",
    "Piaggio X10",
    "BMW C 650",
    "SYM Joymax",
  ],
  vespa: [
    "Vespa GTS 300",
    "Vespa GTS Super 300",
    "Vespa Primavera 125",
    "Vespa Primavera 150",
    "Vespa Sprint 125",
    "Vespa Sprint 150",
    "Vespa LX 125",
    "Vespa LX 150",
    "Vespa Elettrica",
    "Vespa 946",
    "Piaggio Beverly 300",
    "Piaggio Beverly 400",
    "Piaggio Liberty",
    "Piaggio Medley",
  ],
};

const PIAGGIO_BRAND_SLUG = "motorr-piaggio";

function isMotorVehicleTypeKey(key: string | null): key is MotorVehicleTypeKey {
  return key != null && key in MOTOR_MODELS_BY_TYPE;
}

function modelsForBrand(
  brandSlug: string,
  modelRows: { brand_slug: string; name: string }[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of modelRows) {
    if (row.brand_slug !== brandSlug || seen.has(row.name)) continue;
    seen.add(row.name);
    out.push(row.name);
  }
  return out.sort((a, b) => a.localeCompare(b, "sq"));
}

/** Union of every curated type list plus API seed rows (deduped). */
export function getAllMotorModelLabels(modelRows: { brand_slug: string; name: string }[]): string[] {
  const all = new Set<string>();
  for (const list of Object.values(MOTOR_MODELS_BY_TYPE)) {
    for (const name of list) all.add(name);
  }
  for (const row of modelRows) all.add(row.name);
  return [...all].sort((a, b) => a.localeCompare(b, "sq"));
}

export function getMotorModelsForPicker(opts: {
  typeKey: string | null;
  brandSlug: string | null;
  modelRows: { brand_slug: string; name: string }[];
}): string[] {
  const { typeKey, brandSlug, modelRows } = opts;

  if (isMotorVehicleTypeKey(typeKey)) {
    const curated = [...MOTOR_MODELS_BY_TYPE[typeKey]];
    if (!brandSlug) return curated;
    const brandSet = new Set(modelsForBrand(brandSlug, modelRows));
    const filtered = curated.filter((m) => brandSet.has(m));
    return filtered.length > 0 ? filtered : curated;
  }

  if (brandSlug) {
    const brandList = modelsForBrand(brandSlug, modelRows);
    return brandList.length > 0 ? brandList : getAllMotorModelLabels(modelRows);
  }

  return getAllMotorModelLabels(modelRows);
}

export function getMotorPiaggioBrandSlug(): string {
  return PIAGGIO_BRAND_SLUG;
}

/** Leaf brand category IDs under the hub (`motorr-yamaha`, …) — excludes `motorr-type-*`. */
export function getMotorBrandLeafCategoryIds(
  categories: { id: number; parent_id: number | null | undefined; slug: string | null | undefined }[],
  motorHubId: number,
): number[] {
  return categories
    .filter(
      (c) =>
        c.parent_id === motorHubId &&
        typeof c.slug === "string" &&
        c.slug.startsWith("motorr-") &&
        !c.slug.startsWith("motorr-type-"),
    )
    .map((c) => c.id);
}

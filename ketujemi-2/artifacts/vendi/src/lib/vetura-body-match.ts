import {
  VETURA_BODY_IMAGE_BY_SLUG,
  VETURA_BODY_SLUG_ORDER,
} from "@/lib/vetura-body-images";

export type VeturaBodySlug = (typeof VETURA_BODY_SLUG_ORDER)[number];

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

const NAME_HINTS: Record<VeturaBodySlug, string[]> = {
  sedan: ["sedan"],
  "suv-jeep": ["suv", "jeep"],
  hatchback: ["hatchback"],
  "kombi-minivan": ["kombi", "minivan"],
  "kabriolet-sportive": ["kabriolet", "sportive"],
  kupe: ["kupe", "coupé", "coupe"],
  "elektrike-hibride": ["elektrike", "hibride", "elektrik"],
  pickup: ["pickup", "pikap"],
};

export function findVeturaParent(categories: CategoryRow[]): CategoryRow | undefined {
  return categories.find((c) => c.slug === "vetura");
}

export function matchVeturaBodyChild(
  children: CategoryRow[],
  bodySlug: VeturaBodySlug,
): CategoryRow | undefined {
  const exact = children.find((c) => c.slug === bodySlug);
  if (exact) return exact;

  const hints = NAME_HINTS[bodySlug];
  const lower = (s: string) => s.toLowerCase();
  return children.find((c) => {
    const n = lower(c.name);
    return hints.some((h) => n.includes(h));
  });
}

export type VeturaCarouselSlide = {
  slug: VeturaBodySlug;
  name: string;
  imageUrl: string;
  href: string;
  categoryId: number | null;
};

export function buildVeturaCarouselSlides(
  categories: CategoryRow[],
  localeName: (name: string) => string,
  pathForId: (id: number) => string,
): VeturaCarouselSlide[] {
  const vetura = findVeturaParent(categories);
  if (!vetura) return [];

  const children = categories.filter((c) => c.parent_id === vetura.id);
  const veturaHref = pathForId(vetura.id);

  return VETURA_BODY_SLUG_ORDER.map((slug) => {
    const imageUrl = VETURA_BODY_IMAGE_BY_SLUG[slug];
    if (!imageUrl) return null;
    const cat = matchVeturaBodyChild(children, slug);
    return {
      slug,
      name: cat ? localeName(cat.name) : defaultBodyLabel(slug),
      imageUrl,
      href: cat ? pathForId(cat.id) : veturaHref,
      categoryId: cat?.id ?? null,
    };
  }).filter((s): s is VeturaCarouselSlide => s != null);
}

function defaultBodyLabel(slug: VeturaBodySlug): string {
  const labels: Record<VeturaBodySlug, string> = {
    sedan: "Sedan",
    "suv-jeep": "SUV & Jeep",
    hatchback: "Hatchback",
    "kombi-minivan": "Kombi & Minivan",
    "kabriolet-sportive": "Kabriolet & Sportive",
    kupe: "Kupe",
    "elektrike-hibride": "Elektrike & Hibride",
    pickup: "Pickup",
  };
  return labels[slug];
}

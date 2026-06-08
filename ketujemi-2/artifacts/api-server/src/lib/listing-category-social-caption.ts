export type CategorySocialGroup =
  | "makina_transport"
  | "auto_pjese"
  | "patundshmeri"
  | "elektronike"
  | "mobilje"
  | "moda"
  | "pune"
  | "femije"
  | "sport"
  | "bujqesi"
  | "arsim"
  | "default";

const CAPTIONS: Record<CategorySocialGroup, string> = {
  makina_transport:
    "🚗 Makinë e re në shitje te KëtuJemi.com! Shiko detajet, çmimin dhe kontakto drejtpërdrejt shitësin. 👉 ketujemi.com",
  auto_pjese:
    "🔧 Pjesë këmbimi cilësore — gjej çka të duhet për makinën tënde te KëtuJemi.com! 👉 ketujemi.com",
  patundshmeri:
    "🏠 Pronë e re në shitje/qira te KëtuJemi.com! Banesa, shtëpi, tokë — gjej shtëpinë e ëndrrave. 👉 ketujemi.com",
  elektronike:
    "📱 Elektronikë dhe teknologji me çmim të mirë te KëtuJemi.com! Shiko ofertën tani. 👉 ketujemi.com",
  mobilje:
    "🏡 Mobilje dhe pajisje shtëpie me çmim të shkëlqyer te KëtuJemi.com! 👉 ketujemi.com",
  moda:
    "👗 Stil i ri, çmim i mirë! Zbulo veshjet dhe aksesorët te KëtuJemi.com. 👉 ketujemi.com",
  pune:
    "💼 Mundësi e re pune apo biznesi te KëtuJemi.com! Apliko ose kontakto tani. 👉 ketujemi.com",
  femije:
    "👶 Produkte për fëmijë dhe nëna me çmim të mirë te KëtuJemi.com! 👉 ketujemi.com",
  sport:
    "⚽ Pajisje sportive dhe rekreative te KëtuJemi.com — çmime të papërsëritshme! 👉 ketujemi.com",
  bujqesi:
    "🌾 Produkte dhe pajisje bujqësore te KëtuJemi.com! Gjej çka të duhet për fermën tënde. 👉 ketujemi.com",
  arsim:
    "🎓 Mëso diçka të re! Kurse dhe mësimdhënie private te KëtuJemi.com. 👉 ketujemi.com",
  default:
    "🛒 Shpallje e re te KëtuJemi.com — platforma shqiptare e shpalljeve! 👉 ketujemi.com",
};

const ROOT_SLUG_TO_GROUP: Record<string, CategorySocialGroup> = {
  vetura: "makina_transport",
  "motorr-skuter": "makina_transport",
  "kamione-furgone": "makina_transport",
  "auto-pjese": "auto_pjese",
  "banesa-shtepi": "patundshmeri",
  "lokale-zyre": "patundshmeri",
  telefona: "elektronike",
  "kompjutere-laptope": "elektronike",
  "tv-elektronike": "elektronike",
  "mobilje-dekorime": "mobilje",
  "rroba-kepuce": "moda",
  "pune-sherbime": "pune",
  femije: "femije",
  "sport-outdoor": "sport",
  "bujqesi-blegtori": "bujqesi",
  "arsim-kurse": "arsim",
};

function normalizeSlug(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function groupFromCategoryName(name: string | null | undefined): CategorySocialGroup | null {
  const n = name?.trim().toLowerCase() ?? "";
  if (!n) return null;

  if (
    n.includes("vetur")
    || n.includes("motorr")
    || n.includes("skuter")
    || n.includes("kamion")
    || n.includes("furgon")
    || n.includes("makina")
    || n.includes("transport")
  ) {
    return "makina_transport";
  }
  if (n.includes("auto pjes") || n.includes("auto-pjes")) return "auto_pjese";
  if (
    n.includes("banes")
    || n.includes("shtëpi")
    || n.includes("shtepi")
    || n.includes("lokal")
    || n.includes("zyr")
    || n.includes("patundshm")
    || n.includes("pron")
  ) {
    return "patundshmeri";
  }
  if (
    n.includes("telefon")
    || n.includes("kompjuter")
    || n.includes("laptop")
    || n.includes("elektronik")
    || n.includes("tv")
  ) {
    return "elektronike";
  }
  if (n.includes("mobilj") || n.includes("dekorim")) return "mobilje";
  if (n.includes("rrob") || n.includes("këpuc") || n.includes("kepuc") || n.includes("moda") || n.includes("vesh")) {
    return "moda";
  }
  if (n.includes("punë") || n.includes("pune") || n.includes("shërbim") || n.includes("sherbim") || n.includes("biznes")) {
    return "pune";
  }
  if (n.includes("fëmij") || n.includes("femij") || n.includes("nën") || n.includes("nen")) return "femije";
  if (n.includes("sport") || n.includes("outdoor") || n.includes("rekreacion")) return "sport";
  if (n.includes("bujq") || n.includes("blegtor")) return "bujqesi";
  if (n.includes("arsim") || n.includes("kurs") || n.includes("mësim") || n.includes("mesim")) return "arsim";

  return null;
}

export function resolveCategorySocialGroup(input: {
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  root_category_slug?: string | null;
}): CategorySocialGroup {
  const rootSlug = normalizeSlug(input.root_category_slug);
  if (rootSlug && ROOT_SLUG_TO_GROUP[rootSlug]) {
    return ROOT_SLUG_TO_GROUP[rootSlug];
  }

  const categorySlug = normalizeSlug(input.category_slug);
  if (categorySlug && ROOT_SLUG_TO_GROUP[categorySlug]) {
    return ROOT_SLUG_TO_GROUP[categorySlug];
  }

  const fromName = groupFromCategoryName(input.category_name);
  if (fromName) return fromName;

  return "default";
}

export function buildCategorySocialCaption(input: {
  category_id?: number | null;
  category_name?: string | null;
  category_slug?: string | null;
  root_category_slug?: string | null;
}): string {
  return CAPTIONS[resolveCategorySocialGroup(input)];
}

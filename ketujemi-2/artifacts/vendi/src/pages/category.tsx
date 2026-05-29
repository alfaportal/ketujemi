import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, Link, useRoute } from "wouter";
import {
  useGetCategories,
  useGetListings,
  getGetCategoriesQueryOptions,
  getGetListingsQueryKey,
} from "@workspace/api-client-react";
import type { GetListingsParams } from "@workspace/api-client-react";
import {
  ChevronRight,
  ArrowLeft,
  Car,
  Bike,
  Truck,
  Wrench,
  House,
  Smartphone,
  Laptop,
} from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { getCategoryLucideIcon } from "@/lib/category-lucide-icon";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { CategoryPhotoPickerRow, CategoryPhotoPickerCard } from "@/components/category-photo-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { translateCategory } from "@/lib/category-translations";
import {
  categoryPath,
  navigateToCategory,
  resolveCategoryId,
  useCategoryScroll,
} from "@/lib/category-navigation";
import {
  CategoryPageLoading,
  CategoryPageLoadError,
  CategoryPageNotFound,
} from "@/components/category-page-shell";
import { VipPartnersSection } from "@/components/vip-partners-section";
import { CategoryPartnersBanner } from "@/components/category-partners-banner";
import { useGoToPostListing } from "@/hooks/use-go-to-post-listing";
import { SiteHeader } from "@/components/site-header";
import { getVeturaBrandLeafCategoryIds } from "@/lib/vetura-search-helpers";
import { VeturaSearchPanel } from "@/components/vetura-search-panel";
import { VeturaHeroSlideshow } from "@/components/vetura-hero-slideshow";
import { MotorrHeroSlideshow } from "@/components/motorr-hero-slideshow";
import { KamioneHeroSlideshow } from "@/components/kamione-hero-slideshow";
import { AutoPjeseHeroSlideshow } from "@/components/auto-pjese-hero-slideshow";
import { BanesaHeroSlideshow } from "@/components/banesa-hero-slideshow";
import { LokaleZyreHeroSlideshow } from "@/components/lokale-zyre-hero-slideshow";
import { TelefonaHeroSlideshow } from "@/components/telefona-hero-slideshow";
import { KompjuterLaptopHeroSlideshow } from "@/components/kompjuter-laptop-hero-slideshow";
import { TvElektronikeHeroSlideshow } from "@/components/tv-elektronike-hero-slideshow";
import { MobiljeDekorimHeroSlideshow } from "@/components/mobilje-dekorim-hero-slideshow";
import { RrobaKepuceHeroSlideshow } from "@/components/rroba-kepuce-hero-slideshow";
import { FemijeHeroSlideshow } from "@/components/femije-hero-slideshow";
import { SportOutdoorHeroSlideshow } from "@/components/sport-outdoor-hero-slideshow";
import { ArsimKurseHeroSlideshow } from "@/components/arsim-kurse-hero-slideshow";
import { MuzikeHobbyHeroSlideshow } from "@/components/muzike-hobby-hero-slideshow";
import { BujqesiBlegtoriHeroSlideshow } from "@/components/bujqesi-blegtori-hero-slideshow";
import { PuneSherbimeHeroSlideshow } from "@/components/pune-sherbime-hero-slideshow";
import { KafshetHeroSlideshow } from "@/components/kafshet-hero-slideshow";
import { resolveCategoryImageUrl } from "@/lib/resolve-category-image";
import {
  KAMION_SEARCH_BRAND_ORDER,
  getKamioneBrandLeafCategoryIds,
} from "@/lib/kamione-search-helpers";
import { KamioneSearchPanel } from "@/components/kamione-search-panel";
import { getMotorBrandLeafCategoryIds } from "@/lib/motorr-search-helpers";
import { MotorrSearchPanel } from "@/components/motorr-search-panel";
import { getBanesaLeafCategoryIds } from "@/lib/banesa-search-helpers";
import { BanesaSearchPanel } from "@/components/banesa-search-panel";
import { AutoPjeseSearchPanel } from "@/components/auto-pjese-search-panel";
import {
  AUTO_PJESE_HERO_PHOTO,
  getAutoPiesePartTypeCategoryIds,
} from "@/lib/auto-pjese-search-helpers";
import { SportOutdoorSearchPanel } from "@/components/sport-outdoor-search-panel";
import { getSportOutdoorLeafCategoryIds } from "@/lib/sport-outdoor-search-helpers";
import { LokaleZyreSearchPanel } from "@/components/lokale-zyre-search-panel";
import {
  LOKALE_ZYRE_HERO_PHOTO,
  getLokaleZyreLeafCategoryIds,
} from "@/lib/lokale-zyre-search-helpers";
import { TelefonaSearchPanel } from "@/components/telefona-search-panel";
import { getTelefonaHubChildCategoryIds } from "@/lib/telefona-search-helpers";
import { ArsimKurseSearchPanel } from "@/components/arsim-kurse-search-panel";
import { getArsimKurseLeafCategoryIds } from "@/lib/arsim-kurse-search-helpers";
import { MobiljeDekorimSearchPanel } from "@/components/mobilje-dekorim-search-panel";
import {
  getMobiljeDekorimLeafCategoryIds,
} from "@/lib/mobilje-dekorim-search-helpers";
import { RrobaKepuceSearchPanel } from "@/components/rroba-kepuce-search-panel";
import {
  getRrobaKepuceLeafCategoryIds,
} from "@/lib/rroba-kepuce-search-helpers";
import { FemijeSearchPanel } from "@/components/femije-search-panel";
import { getFemijeLeafCategoryIds, femijeSubcategoryPhoto } from "@/lib/femije-search-helpers";
import { PuneSherbimeSearchPanel } from "@/components/pune-sherbime-search-panel";
import { getPuneSherbimeLeafCategoryIds } from "@/lib/pune-sherbime-search-helpers";
import { BujqesiBlegtoriSearchPanel } from "@/components/bujqesi-blegtori-search-panel";
import { getBujqesiBlegtoriLeafCategoryIds } from "@/lib/bujqesi-blegtori-search-helpers";
import { MuzikeHobbySearchPanel } from "@/components/muzike-hobby-search-panel";
import { getMuzikeHobbyLeafCategoryIds } from "@/lib/muzike-hobby-search-helpers";
import { KafshetSearchPanel } from "@/components/kafshet-search-panel";
import { getKafshetLeafCategoryIds } from "@/lib/kafshet-search-helpers";
import { TvElektronikeSearchPanel } from "@/components/tv-elektronike-search-panel";
import { KompjuterLaptopHubPanel } from "@/components/kompjuter-laptop-hub-panel";
import {
  getTvElektronikeLeafCategoryIds,
} from "@/lib/tv-elektronike-search-helpers";

/** Wide hero shot for Banesa & Shtëpi hub search page (urban / apartment skyline). */
const BANESA_HERO_PHOTO =
  "https://images.pexels.com/photos/37347/pexels-photo-37347.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

/** Wide hero shot for Motorr & Skuter hub search page (sport motorcycle). */
const MOTORR_HERO_PHOTO =
  "https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=1400&q=85";

// ─── Cover photos keyed by category name prefix ───────────────────────────────
const CAT_PHOTOS: Record<string, string> = {
  "Vetura":    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80",
  "Motorrë":   "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Akumulatorë": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80",
  "Amortizerë": "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&q=80",
  "Drita & LED": "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=80",
  "Fellne & Goma": "https://images.unsplash.com/photo-1558618047-e6f7bdf12e92?w=400&q=80",
  "Pjesë Karoserie": "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&q=80",
  "Sisteme Frenimi": "https://images.unsplash.com/photo-1471440671318-55bdb6469894?w=400&q=80",
  "Vajra & Filtra": "https://images.unsplash.com/photo-1626441963168-ae4d6d982c02?w=400&q=80",
  "Motorr":    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  "Kamion":    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
  "Auto-bartës": "https://images.unsplash.com/photo-1632276536839-84cad7fd27b8?w=400&q=80",
  "Autobusë": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80",
  "Mauna":    "https://images.unsplash.com/photo-1585654695958-848d106a16e9?w=400&q=80",
  "Trailer & Rimorkio": "https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&q=80",
  "Auto":      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80",
  "Apartamente & Banesa": "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&q=80",
  "Dhoma me Qira": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&q=80",
  "Shtëpi":    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&q=80",
  "Toka & Truall": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=80",
  "Vikendica": "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=400&q=80",
  "Banesa":    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  "Lokale":    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  "Telefona":  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80",
  "Kompjuter": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
  "TV":        "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=800&q=80",
  "Mobilje":   "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "Rroba":     "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
  "Fëmijë":   "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80",
  "Sport":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  "Punë":      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
  "Bujqësi":  "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80",
  "Arsim":     "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  "Muzikë":   "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80",
  "Kafshë":   "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&q=80",
  "SUV":       "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
  "Kombi":     "https://images.unsplash.com/photo-1532974297617-c0f05fe48bff?w=800&q=80",
  "Kabriolet": "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
  "Elektrike": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&q=80",
  "Klasike":   "https://images.pexels.com/photos/2127022/pexels-photo-2127022.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Sedan":     "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&q=80",
  "Hatchback": "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=400&q=80",
  "Pickup":    "https://images.pexels.com/photos/3422964/pexels-photo-3422964.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Furgon":    "https://images.pexels.com/photos/1178448/pexels-photo-1178448.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Limuzin":   "https://images.pexels.com/photos/1007410/pexels-photo-1007410.jpeg?auto=compress&cs=tinysrgb&w=400",
  "Chopper":   "https://images.unsplash.com/photo-1609630875171-b1321377cdc0?w=400&q=80",
  "Enduro":    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80",
  "Motokros":  "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=400&q=80",
  "Motorr Sportiv": "https://images.unsplash.com/photo-1568772584407-ed6f9faebef2?w=400&q=80",
  "Quad & ATV":"https://images.unsplash.com/photo-1571019613914-85f342deb653?w=400&q=80",
  "Skuter":    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&q=80",
  "Vespa":     "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80",
};

function getCatPhoto(name: string): string | null {
  const key = Object.keys(CAT_PHOTOS).find((k) => name?.startsWith(k));
  return key ? CAT_PHOTOS[key] : null;
}

function getCatIcon(iconName: string): React.ElementType {
  return getCategoryLucideIcon(iconName);
}

// ─── Brand logos ──────────────────────────────────────────────────────────────
/** Car & truck marks from filippofilip95/car-logos-dataset (`logos/optimized` is PNG on current `master`). */
const _B = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

/** Motorcycle-only marks not in the car-logos dataset (SVG). */
const _MOTO_MARK = {
  aprilia: "https://upload.wikimedia.org/wikipedia/commons/9/99/Aprilia-logo.svg",
  ducati: "https://cdn.simpleicons.org/ducati",
  harleyDavidson: "https://upload.wikimedia.org/wikipedia/commons/d/de/Harley-Davidson_logo.svg",
  kawasaki: "https://cdn.worldvectorlogo.com/logos/kawasaki-1.svg",
  piaggio: "https://cdn.worldvectorlogo.com/logos/piaggio-2.svg",
  yamaha: "https://upload.wikimedia.org/wikipedia/commons/d/de/Yamaha_Motor_logo.svg",
} as const;

const BRAND_LOGOS: Record<string, string> = {
  "Alfa Romeo":    `${_B}/alfa-romeo.png`,
  "Audi":          `${_B}/audi.png`,
  "BMW":           `${_B}/bmw.png`,
  "Chevrolet":     `${_B}/chevrolet.png`,
  "Citroen":       `${_B}/citroen.png`,
  "Dacia":         `${_B}/dacia.png`,
  "Dodge":         `${_B}/dodge.png`,
  "Ferrari":       `${_B}/ferrari.png`,
  "Fiat":          `${_B}/fiat.png`,
  "Ford":          `${_B}/ford.png`,
  "Honda":         `${_B}/honda.png`,
  "Hyundai":       `${_B}/hyundai.png`,
  "Infiniti":      `${_B}/infiniti.png`,
  "Jeep":          `${_B}/jeep.png`,
  "Kia":           `${_B}/kia.png`,
  "Lada":          `${_B}/lada.png`,
  "Lamborghini":   `${_B}/lamborghini.png`,
  "Land Rover":    `${_B}/land-rover.png`,
  "Lexus":         `${_B}/lexus.png`,
  "Mazda":         `${_B}/mazda.png`,
  "Mercedes-Benz": `${_B}/mercedes-benz.png`,
  "Mitsubishi":    `${_B}/mitsubishi.png`,
  "Nissan":        `${_B}/nissan.png`,
  "Opel":          `${_B}/opel.png`,
  "Peugeot":       `${_B}/peugeot.png`,
  "Porsche":       `${_B}/porsche.png`,
  "Renault":       `${_B}/renault.png`,
  "Seat":          `${_B}/seat.png`,
  "Skoda":         `${_B}/skoda.png`,
  "Subaru":        `${_B}/subaru.png`,
  "Suzuki":        `${_B}/suzuki.png`,
  "Tesla":         `${_B}/tesla.png`,
  "Toyota":        `${_B}/toyota.png`,
  "Volkswagen":    `${_B}/volkswagen.png`,
  "Volvo":         `${_B}/volvo.png`,
  "Zastava":       `${_B}/zastava.png`,
  "Aprilia":       _MOTO_MARK.aprilia,
  "Ducati":        _MOTO_MARK.ducati,
  "Harley-Davidson": _MOTO_MARK.harleyDavidson,
  "Kawasaki":      _MOTO_MARK.kawasaki,
  "KTM":           `${_B}/ktm.png`,
  "Piaggio":       _MOTO_MARK.piaggio,
  "Yamaha":        _MOTO_MARK.yamaha,
  "DAF":           `${_B}/daf.png`,
  "Iveco":         `${_B}/iveco.png`,
  "MAN":           `${_B}/man.png`,
  "Scania":        `${_B}/scania.png`,
  "Mitsubishi Fuso": `${_B}/mitsubishi-fuso.png`,
  "Isuzu":         `${_B}/isuzu.png`,
  "Google":        "https://www.google.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg",
};

const BRAND_COLORS: Record<string, string> = {
  "BMW": "#1C69D4", "Mercedes-Benz": "#222222", "Audi": "#BB0A30",
  "Volkswagen": "#151F6D", "Toyota": "#EB0A1E", "Ford": "#003178",
  "Opel": "#E8A400", "Renault": "#F1C400", "Peugeot": "#002D62",
  "Fiat": "#8B1A1A", "Skoda": "#4BA82E", "Hyundai": "#002C5F",
  "Kia": "#BB162B", "Nissan": "#C3002F", "Honda": "#CC0000",
  "Mazda": "#910A2D", "Volvo": "#003057", "Land Rover": "#005A2B",
  "Porsche": "#AE965B", "Ferrari": "#CC0000", "Lamborghini": "#C8A900",
  "Alfa Romeo": "#941E2C", "Seat": "#1B1B1B", "Citroen": "#B20000",
  "Dacia": "#005BAC", "Mitsubishi": "#CC0000", "Subaru": "#003087",
  "Suzuki": "#005BAC", "Jeep": "#2D5C31", "Dodge": "#CC0000",
  "Chevrolet": "#D4AF37", "Lexus": "#1A1A1A", "Infiniti": "#1A1A1A",
  "Tesla": "#CC0000", "Lada": "#1A3A6B", "Zastava": "#CC0000",
  "Aprilia": "#E42321", "Ducati": "#E30613", "Harley-Davidson": "#FF6600",
  "Kawasaki": "#38B549", "KTM": "#FF6600", "Piaggio": "#003978", "Yamaha": "#00339A",
  "Benelli": "#009FE3", "Husqvarna": "#FDB913", "Keeway": "#E42321",
  "Kymco": "#0096D7", "SYM": "#E30613", "Triumph": "#005CA9",
  "DAF": "#E2001A", "Iveco": "#003087", "MAN": "#E30613", "Scania": "#041E42",
  "Mitsubishi Fuso": "#C3002F", "Isuzu": "#C3002F",
  "Apple": "#555555", "Google": "#4285F4", "Samsung": "#1428A0", "Xiaomi": "#FF6900",
  "Huawei": "#C7000B", "OnePlus": "#EB0029", "Honor": "#0077FF", "Motorola": "#0F47AF",
  "Nokia": "#124191", "ZTE": "#0083C3", "Acer": "#83B81A", "ASUS": "#000000", "Dell": "#007DB8",
  "Lenovo": "#E2231A", "Microsoft": "#00A4EF", "MSI": "#E41E26", "Razer": "#00FF00", "HP": "#0096D6",
};

const MOTOR_SKUTER_HUB_SLUG = "motorr-skuter";
const KAMIONE_FURGONE_HUB_SLUG = "kamione-furgone";
const AUTO_PJESE_HUB_SLUG = "auto-pjese";
const BANESA_SHTEPI_HUB_SLUG = "banesa-shtepi";
const TELEFONA_HUB_SLUG = "telefona";
const KOMPJUTERE_LAPTOP_HUB_SLUG = "kompjutere-laptope";
const VETURA_HUB_SLUG = "vetura";
const SPORT_OUTDOOR_HUB_SLUG = "sport-outdoor";
const LOKALE_ZYRE_HUB_SLUG = "lokale-zyre";
const ARSIM_KURSE_HUB_SLUG = "arsim-kurse";
const MOBILJE_DEKORIM_HUB_SLUG = "mobilje-dekorime";
const RROBA_KEPUCE_HUB_SLUG = "rroba-kepuce";
const FEMIJE_HUB_SLUG = "femije";
const PUNE_SHERBIME_HUB_SLUG = "pune-sherbime";
const BUJQESI_BLEGTORI_HUB_SLUG = "bujqesi-blegtori";
const MUZIKE_HOBBY_HUB_SLUG = "muzike-hobby";
const KAFSHET_HUB_SLUG = "kafshet";
const TV_ELEKTRONIKE_HUB_SLUG = "tv-elektronike";

/** Display order for Banesa & Shtëpi hub. */
const BANESA_TYPE_ORDER = [
  "Apartamente & Banesa",
  "Dhoma me Qira",
  "Shtëpi",
  "Toka & Truall",
  "Vikendica",
] as const;

/** Display order for Auto Pjesë hub (types only). */
const AUTO_PJESE_TYPE_ORDER = [
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

/** Display order for Kamionë & Furgonë hub. */
const KAMION_TYPE_ORDER = [
  "Autobusë", "Auto-bartës", "Furgonë", "Kamionë", "Mauna", "Trailer & Rimorkio",
] as const;

const KAMION_BRAND_ORDER = KAMION_SEARCH_BRAND_ORDER;

const TELEFONA_TYPE_ORDER = [
  "Smartphones",
  "Telefona Fiksë",
  "Numra & Kartela",
  "Pjesë Rezervë",
  "Aksesorë",
] as const;

const TELEFONA_BRAND_ORDER = [
  "Apple", "Google", "Honor", "Huawei", "Motorola", "Nokia", "OnePlus", "Samsung", "Xiaomi", "ZTE",
] as const;

const KOMPJUTER_TYPE_ORDER = [
  "Desktop PC",
  "Laptopë",
  "Monitorë",
  "Pjesë Harduerike",
  "Serverë",
  "Tabletë",
] as const;

const KOMPJUTER_BRAND_ORDER = [
  "Acer", "Apple", "ASUS", "Dell", "HP", "Huawei", "Lenovo", "Microsoft", "MSI", "Razer",
] as const;

/** Kompjuterë hub brand logos (Simple Icons CDN — Clearbit is blocked in-browser). */
const KOMPJUTER_BRAND_LOGOS: Record<string, string> = {
  Acer: "https://cdn.simpleicons.org/acer/83B81A",
  Apple: "https://cdn.simpleicons.org/apple/ffffff",
  ASUS: "https://cdn.simpleicons.org/asus/ffffff",
  Dell: "https://cdn.simpleicons.org/dell/007DB8",
  HP: "https://cdn.simpleicons.org/hp/0096D6",
  Huawei: "https://cdn.simpleicons.org/huawei/CF0A2C",
  Lenovo: "https://cdn.simpleicons.org/lenovo/E2231A",
  Microsoft: "https://cdn.simpleicons.org/microsoft/00A4EF",
  MSI: "https://cdn.simpleicons.org/msi/FF0000",
  Razer: "https://cdn.simpleicons.org/razer/00FF00",
};

const KOMPJUTER_BRAND_INITIALS: Record<string, string> = {
  Acer: "AC",
  Apple: "AP",
  ASUS: "AS",
  Dell: "DE",
  HP: "HP",
  Huawei: "HW",
  Lenovo: "LE",
  Microsoft: "MS",
  MSI: "MS",
  Razer: "RZ",
};

function sortChildrenByNameOrder(childrenIn: unknown[], order: readonly string[]): any[] {
  const rank = new Map(order.map((n, i) => [n, i]));
  return [...childrenIn].sort(
    (a: any, b: any) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999),
  );
}

// ─── Level 1 subcategory card (body types) ────────────────────────────────────
function BodyTypeCard({ category, onClick }: { category: any; onClick: () => void }) {
  const photo = resolveCategoryImageUrl(category) || getCatPhoto(category.name);
  const Icon = getCatIcon(category.icon);
  return (
    <button
      onClick={onClick}
      className="group relative shrink-0 snap-start overflow-hidden bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg rounded-2xl transition-all duration-200 text-left w-[10.75rem] sm:w-44 md:w-48 lg:w-[13rem] aspect-[4/3]"
    >
      {photo ? (
        <>
          <img
            src={photo}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
            <span className="text-white font-bold text-sm drop-shadow leading-snug line-clamp-2">
              {category.name}
            </span>
            {category.listing_count > 0 && (
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full shrink-0">
                {category.listing_count}
              </span>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
            <Icon size={20} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{category.name}</div>
            {category.listing_count > 0 && <div className="text-xs text-gray-400">{category.listing_count}</div>}
          </div>
          <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0" />
        </div>
      )}
    </button>
  );
}

/** Kompjuterë hub — brand card matching BodyTypeCard (logo on dark fill, label at bottom). */
function KompjuterBrandPhotoCard({ category, onClick }: { category: any; onClick: () => void }) {
  const logoUrl = KOMPJUTER_BRAND_LOGOS[category.name] ?? null;
  const initials = KOMPJUTER_BRAND_INITIALS[category.name] ?? category.name.slice(0, 2).toUpperCase();
  const [imgErr, setImgErr] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden bg-white border border-gray-100 hover:border-blue-200 hover:shadow-lg rounded-2xl transition-all duration-200 text-left w-full touch-manipulation"
    >
      <div className="relative min-h-[7.5rem] h-28 overflow-hidden" style={{ backgroundColor: "#1a1a2e" }}>
        {logoUrl && !imgErr ? (
          <img
            src={logoUrl}
            alt=""
            onError={() => setImgErr(true)}
            className="absolute inset-0 m-auto h-11 w-[72%] max-w-[88%] object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-2 text-white text-2xl font-black tracking-tight select-none">
            {initials}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2">
          <span className="text-white font-bold text-sm sm:text-base drop-shadow leading-snug line-clamp-2">
            {category.name}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Level 2 brand card ───────────────────────────────────────────────────────
function BrandCard({ category, onClick }: { category: any; onClick: () => void }) {
  const color   = BRAND_COLORS[category.name] ?? "#1A4FCC";
  const logoUrl = BRAND_LOGOS[category.name];
  const thumb   = typeof category.image_url === "string" ? category.image_url.trim() : "";
  const [imgErr, setImgErr] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md rounded-xl px-4 py-3 transition-all duration-150 text-left w-full"
    >
      <div className="flex-shrink-0 w-10 h-10 relative">
        {thumb ? (
          <img
            src={thumb}
            alt=""
            className="absolute inset-0 w-full h-full object-cover rounded-xl border border-gray-100"
            aria-hidden
          />
        ) : logoUrl && !imgErr ? (
          <img
            src={logoUrl}
            alt={category.name}
            onError={() => setImgErr(true)}
            style={{
              width: 40, height: 40, objectFit: "contain",
              background: "#1a2b4a", borderRadius: "50%", padding: 6,
            }}
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: color }}
          >
            <span className="text-white text-xs font-black">{category.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 truncate transition-colors">{category.name}</div>
        {category.listing_count > 0 && (
          <div className="text-xs text-gray-400">{category.listing_count}</div>
        )}
      </div>
      <ChevronRight size={14} className="text-gray-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
    </button>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <div className="flex items-center gap-1 text-sm text-white/85 flex-wrap min-w-0">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={12} />}
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link>
          ) : (
            <span className="text-white font-semibold">{item.label}</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CategoryPage() {
  const [, setLocation] = useLocation();
  const [, routeParams] = useRoute("/categories/:id");
  const goToPostListing = useGoToPostListing();
  const { t, market, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const segment = routeParams?.id ?? "";
  const resultsAnchorRef = useRef<HTMLDivElement | null>(null);

  const {
    data: allCategories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useGetCategories({
    query: {
      ...getGetCategoriesQueryOptions(),
      staleTime: 5 * 60_000,
      gcTime: 30 * 60_000,
    },
  });

  const categoryId = useMemo(() => {
    const resolved = resolveCategoryId(segment, allCategories as any[] | undefined);
    return resolved ?? NaN;
  }, [segment, allCategories]);

  const emptyListingsCopy = useMemo(() => {
    switch (market.code) {
      case "ks":
      case "al":
        return {
          sub: "Bëhu i pari që posto në këtë kategori dhe arrij mijëra blerës potencialë!",
          trust: "✓ Falas  ✓ I shpejtë  ✓ I sigurt",
        };
      case "mk":
        return {
          sub: "Биди прв кој ќе огласи во оваа категорија и достигни илјадници потенцијални купувачи!",
          trust: "✓ Бесплатно  ✓ Брзо  ✓ Сигурно",
        };
      case "mne":
        return {
          sub: "Budi prvi koji objavljuje u ovoj kategoriji i dođi do hiljada potencijalnih kupaca!",
          trust: "✓ Besplatno  ✓ Brzo  ✓ Sigurno",
        };
      default:
        return {
          sub: t.beFirst,
          trust: "✓ Free  ✓ Fast  ✓ Secure",
        };
    }
  }, [market.code, t.beFirst]);

  const currentCategory = allCategories?.find((c: any) => Number(c.id) === Number(categoryId));
  const children =
    allCategories?.filter((c: any) => Number(c.parent_id) === Number(categoryId)) ?? [];

  const isVeturaHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === VETURA_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isKamioneFurgoneHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === KAMIONE_FURGONE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isBanesaShtepiHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === BANESA_SHTEPI_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isMotorSkuterHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === MOTOR_SKUTER_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isAutoPjesHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === AUTO_PJESE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isSportOutdoorHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === SPORT_OUTDOOR_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isLokaleZyreHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === LOKALE_ZYRE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isTelefonaHubPage =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === TELEFONA_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isArsimKurseHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === ARSIM_KURSE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isMobiljeDekorimHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === MOBILJE_DEKORIM_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isRrobaKepuceHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === RROBA_KEPUCE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isFemijeHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === FEMIJE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isPuneSherbimeHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === PUNE_SHERBIME_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isBujqesiBlegtoriHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === BUJQESI_BLEGTORI_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isMuzikeHobbyHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === MUZIKE_HOBBY_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isKafshetHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === KAFSHET_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isTvElektronikeHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === TV_ELEKTRONIKE_HUB_SLUG &&
    !(currentCategory as any).parent_id;

  const isKompjuterLaptopHub =
    !!(currentCategory as any) &&
    (currentCategory as any).slug === KOMPJUTERE_LAPTOP_HUB_SLUG &&
    !(currentCategory as any).parent_id;

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
    isBujqesiBlegtoriHub ||
    isMuzikeHobbyHub ||
    isKafshetHub ||
    isTvElektronikeHub ||
    isKompjuterLaptopHub;

  const autoPjeseLeafCsv = useMemo(() => {
    if (!allCategories || !isAutoPjesHub) return "";
    const ids = getAutoPiesePartTypeCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isAutoPjesHub]);

  const sportOutdoorLeafCsv = useMemo(() => {
    if (!allCategories || !isSportOutdoorHub) return "";
    const ids = getSportOutdoorLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isSportOutdoorHub]);

  const lokaleZyreLeafCsv = useMemo(() => {
    if (!allCategories || !isLokaleZyreHub) return "";
    const ids = getLokaleZyreLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isLokaleZyreHub]);

  const telefonaLeafCsv = useMemo(() => {
    if (!allCategories || !isTelefonaHubPage) return "";
    const ids = getTelefonaHubChildCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isTelefonaHubPage]);

  const arsimKurseLeafCsv = useMemo(() => {
    if (!allCategories || !isArsimKurseHub) return "";
    const ids = getArsimKurseLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isArsimKurseHub]);

  const mobiljeDekorimLeafCsv = useMemo(() => {
    if (!allCategories || !isMobiljeDekorimHub) return "";
    const ids = getMobiljeDekorimLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isMobiljeDekorimHub]);

  const rrobaKepuceLeafCsv = useMemo(() => {
    if (!allCategories || !isRrobaKepuceHub) return "";
    const ids = getRrobaKepuceLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isRrobaKepuceHub]);

  const femijeLeafCsv = useMemo(() => {
    if (!allCategories || !isFemijeHub) return "";
    const ids = getFemijeLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isFemijeHub]);

  const puneSherbimeLeafCsv = useMemo(() => {
    if (!allCategories || !isPuneSherbimeHub) return "";
    const ids = getPuneSherbimeLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isPuneSherbimeHub]);

  const bujqesiBlegtoriLeafCsv = useMemo(() => {
    if (!allCategories || !isBujqesiBlegtoriHub) return "";
    const ids = getBujqesiBlegtoriLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isBujqesiBlegtoriHub]);

  const muzikeHobbyLeafCsv = useMemo(() => {
    if (!allCategories || !isMuzikeHobbyHub) return "";
    const ids = getMuzikeHobbyLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isMuzikeHobbyHub]);

  const kafshetLeafCsv = useMemo(() => {
    if (!allCategories || !isKafshetHub) return "";
    const ids = getKafshetLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isKafshetHub]);

  const tvElektronikeLeafCsv = useMemo(() => {
    if (!allCategories || !isTvElektronikeHub) return "";
    const ids = getTvElektronikeLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isTvElektronikeHub]);

  const veturaBrandLeafCsv = useMemo(() => {
    if (!allCategories || !isVeturaHub) return "";
    const ids = getVeturaBrandLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isVeturaHub]);

  const kamioneBrandLeafCsv = useMemo(() => {
    if (!allCategories || !isKamioneFurgoneHub) return "";
    const ids = getKamioneBrandLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isKamioneFurgoneHub]);

  const banesaLeafCsv = useMemo(() => {
    if (!allCategories || !isBanesaShtepiHub) return "";
    const ids = getBanesaLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isBanesaShtepiHub]);

  const motorBrandLeafCsv = useMemo(() => {
    if (!allCategories || !isMotorSkuterHub) return "";
    const ids = getMotorBrandLeafCategoryIds(allCategories as any, categoryId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [allCategories, categoryId, isMotorSkuterHub]);

  const [veturaListParams, setVeturaListParams] = useState<GetListingsParams | null>(null);
  const [kamioneListParams, setKamioneListParams] = useState<GetListingsParams | null>(null);
  const [banesaListParams, setBanesaListParams] = useState<GetListingsParams | null>(null);
  const [motorListParams, setMotorListParams] = useState<GetListingsParams | null>(null);
  const [autoPjeseListParams, setAutoPjeseListParams] = useState<GetListingsParams | null>(null);
  const [sportOutdoorListParams, setSportOutdoorListParams] = useState<GetListingsParams | null>(null);
  const [lokaleZyreListParams, setLokaleZyreListParams] = useState<GetListingsParams | null>(null);
  const [telefonaListParams, setTelefonaListParams] = useState<GetListingsParams | null>(null);
  const [arsimKurseListParams, setArsimKurseListParams] = useState<GetListingsParams | null>(null);
  const [mobiljeDekorimListParams, setMobiljeDekorimListParams] =
    useState<GetListingsParams | null>(null);
  const [rrobaKepuceListParams, setRrobaKepuceListParams] =
    useState<GetListingsParams | null>(null);
  const [femijeListParams, setFemijeListParams] = useState<GetListingsParams | null>(null);
  const [puneSherbimeListParams, setPuneSherbimeListParams] =
    useState<GetListingsParams | null>(null);
  const [bujqesiBlegtoriListParams, setBujqesiBlegtoriListParams] =
    useState<GetListingsParams | null>(null);
  const [muzikeHobbyListParams, setMuzikeHobbyListParams] =
    useState<GetListingsParams | null>(null);
  const [kafshetListParams, setKafshetListParams] = useState<GetListingsParams | null>(null);
  const [tvElektronikeListParams, setTvElektronikeListParams] =
    useState<GetListingsParams | null>(null);
  const [kompjuterListParams, setKompjuterListParams] =
    useState<GetListingsParams | null>(null);

  const listingsQueryParams: GetListingsParams = useMemo(() => {
    if (isVeturaHub && veturaBrandLeafCsv) {
      return veturaListParams ?? { category_ids: veturaBrandLeafCsv, page: 1, limit: 20 };
    }
    if (isKamioneFurgoneHub && kamioneBrandLeafCsv) {
      return kamioneListParams ?? { category_ids: kamioneBrandLeafCsv, page: 1, limit: 20 };
    }
    if (isBanesaShtepiHub && banesaLeafCsv) {
      return banesaListParams ?? { category_ids: banesaLeafCsv, page: 1, limit: 20 };
    }
    if (isMotorSkuterHub && motorBrandLeafCsv) {
      return motorListParams ?? { category_ids: motorBrandLeafCsv, page: 1, limit: 20 };
    }
    if (isAutoPjesHub && autoPjeseLeafCsv) {
      return autoPjeseListParams ?? { category_ids: autoPjeseLeafCsv, page: 1, limit: 20 };
    }
    if (isSportOutdoorHub && sportOutdoorLeafCsv) {
      return sportOutdoorListParams ?? { category_ids: sportOutdoorLeafCsv, page: 1, limit: 20 };
    }
    if (isLokaleZyreHub && lokaleZyreLeafCsv) {
      return lokaleZyreListParams ?? { category_ids: lokaleZyreLeafCsv, page: 1, limit: 20 };
    }
    if (isTelefonaHubPage && telefonaLeafCsv) {
      return telefonaListParams ?? { category_ids: telefonaLeafCsv, page: 1, limit: 20 };
    }
    if (isArsimKurseHub && arsimKurseLeafCsv) {
      return arsimKurseListParams ?? { category_ids: arsimKurseLeafCsv, page: 1, limit: 20 };
    }
    if (isMobiljeDekorimHub && mobiljeDekorimLeafCsv) {
      return mobiljeDekorimListParams ?? { category_ids: mobiljeDekorimLeafCsv, page: 1, limit: 20 };
    }
    if (isRrobaKepuceHub && rrobaKepuceLeafCsv) {
      return rrobaKepuceListParams ?? { category_ids: rrobaKepuceLeafCsv, page: 1, limit: 20 };
    }
    if (isFemijeHub && femijeLeafCsv) {
      return femijeListParams ?? { category_ids: femijeLeafCsv, page: 1, limit: 20 };
    }
    if (isPuneSherbimeHub && puneSherbimeLeafCsv) {
      return puneSherbimeListParams ?? { category_ids: puneSherbimeLeafCsv, page: 1, limit: 20 };
    }
    if (isBujqesiBlegtoriHub && bujqesiBlegtoriLeafCsv) {
      return bujqesiBlegtoriListParams ?? { category_ids: bujqesiBlegtoriLeafCsv, page: 1, limit: 20 };
    }
    if (isMuzikeHobbyHub && muzikeHobbyLeafCsv) {
      return muzikeHobbyListParams ?? { category_ids: muzikeHobbyLeafCsv, page: 1, limit: 20 };
    }
    if (isKafshetHub && kafshetLeafCsv) {
      return kafshetListParams ?? { category_ids: kafshetLeafCsv, page: 1, limit: 20 };
    }
    if (isTvElektronikeHub) {
      return (
        tvElektronikeListParams ??
        (tvElektronikeLeafCsv
          ? { category_ids: tvElektronikeLeafCsv, page: 1, limit: 20 }
          : { category_id: categoryId, page: 1, limit: 20 })
      );
    }
    if (isKompjuterLaptopHub) {
      return kompjuterListParams ?? { category_id: categoryId, page: 1, limit: 20 };
    }
    return { category_id: categoryId, limit: 20 };
  }, [
    isVeturaHub,
    veturaBrandLeafCsv,
    veturaListParams,
    isKamioneFurgoneHub,
    kamioneBrandLeafCsv,
    kamioneListParams,
    isBanesaShtepiHub,
    banesaLeafCsv,
    banesaListParams,
    isMotorSkuterHub,
    motorBrandLeafCsv,
    motorListParams,
    isAutoPjesHub,
    autoPjeseLeafCsv,
    autoPjeseListParams,
    isSportOutdoorHub,
    sportOutdoorLeafCsv,
    sportOutdoorListParams,
    isLokaleZyreHub,
    lokaleZyreLeafCsv,
    lokaleZyreListParams,
    isTelefonaHubPage,
    telefonaLeafCsv,
    telefonaListParams,
    isArsimKurseHub,
    arsimKurseLeafCsv,
    arsimKurseListParams,
    isMobiljeDekorimHub,
    mobiljeDekorimLeafCsv,
    mobiljeDekorimListParams,
    isRrobaKepuceHub,
    rrobaKepuceLeafCsv,
    rrobaKepuceListParams,
    isFemijeHub,
    femijeLeafCsv,
    femijeListParams,
    isPuneSherbimeHub,
    puneSherbimeLeafCsv,
    puneSherbimeListParams,
    isBujqesiBlegtoriHub,
    bujqesiBlegtoriLeafCsv,
    bujqesiBlegtoriListParams,
    isMuzikeHobbyHub,
    muzikeHobbyLeafCsv,
    muzikeHobbyListParams,
    isKafshetHub,
    kafshetLeafCsv,
    kafshetListParams,
    isTvElektronikeHub,
    tvElektronikeLeafCsv,
    tvElektronikeListParams,
    isKompjuterLaptopHub,
    kompjuterListParams,
    categoryId,
  ]);

  const listingsQueryEnabled =
    Number.isFinite(categoryId) &&
    !!allCategories?.length &&
    (!isVeturaHub || veturaBrandLeafCsv.length > 0) &&
    (!isKamioneFurgoneHub || kamioneBrandLeafCsv.length > 0) &&
    (!isBanesaShtepiHub || banesaLeafCsv.length > 0) &&
    (!isMotorSkuterHub || motorBrandLeafCsv.length > 0) &&
    (!isAutoPjesHub || autoPjeseLeafCsv.length > 0) &&
    (!isSportOutdoorHub || sportOutdoorLeafCsv.length > 0) &&
    (!isLokaleZyreHub || lokaleZyreLeafCsv.length > 0) &&
    (!isTelefonaHubPage || telefonaLeafCsv.length > 0) &&
    (!isArsimKurseHub || arsimKurseLeafCsv.length > 0) &&
    (!isMobiljeDekorimHub || mobiljeDekorimLeafCsv.length > 0) &&
    (!isRrobaKepuceHub || rrobaKepuceLeafCsv.length > 0) &&
    (!isFemijeHub || femijeLeafCsv.length > 0) &&
    (!isPuneSherbimeHub || puneSherbimeLeafCsv.length > 0) &&
    (!isBujqesiBlegtoriHub || bujqesiBlegtoriLeafCsv.length > 0) &&
    (!isMuzikeHobbyHub || muzikeHobbyLeafCsv.length > 0) &&
    (!isKafshetHub || kafshetLeafCsv.length > 0) &&
    !isTvElektronikeHub;

  const { data: listingsData, isLoading } = useGetListings(listingsQueryParams, {
    query: {
      queryKey: getGetListingsQueryKey(listingsQueryParams),
      enabled: listingsQueryEnabled,
    },
  });

  useCategoryScroll(categoryId);

  useEffect(() => {
    setVeturaListParams(null);
    setKamioneListParams(null);
    setBanesaListParams(null);
    setMotorListParams(null);
    setAutoPjeseListParams(null);
    setSportOutdoorListParams(null);
    setLokaleZyreListParams(null);
    setTelefonaListParams(null);
    setArsimKurseListParams(null);
    setMobiljeDekorimListParams(null);
    setRrobaKepuceListParams(null);
    setFemijeListParams(null);
    setPuneSherbimeListParams(null);
    setBujqesiBlegtoriListParams(null);
    setMuzikeHobbyListParams(null);
    setKafshetListParams(null);
    setTvElektronikeListParams(null);
    setKompjuterListParams(null);
  }, [categoryId]);

  if (categoriesLoading && !allCategories) {
    return <CategoryPageLoading />;
  }
  if (categoriesError && !allCategories) {
    return <CategoryPageLoadError onRetry={() => void refetchCategories()} />;
  }
  if (!allCategories) {
    return <CategoryPageLoading />;
  }
  if (!Number.isFinite(categoryId) || !currentCategory) {
    return <CategoryPageNotFound />;
  }

  const parentCategory = currentCategory && (currentCategory as any).parent_id
    ? allCategories.find((c: any) => c.id === (currentCategory as any).parent_id)
    : null;

  const grandparentCategory = parentCategory && (parentCategory as any).parent_id
    ? allCategories.find((c: any) => c.id === (parentCategory as any).parent_id)
    : null;

  const depth = !(currentCategory as any)?.parent_id ? 1
    : parentCategory && !(parentCategory as any).parent_id ? 2
    : 3;

  const isBrandLevel = depth === 3;
  const isBodyTypeLevel = depth === 2;

  const isTelefonaHub = (currentCategory as any)?.slug === TELEFONA_HUB_SLUG;
  const orderedTelefonaTypes = sortChildrenByNameOrder(
    children.filter((c: any) => (TELEFONA_TYPE_ORDER as readonly string[]).includes(c.name)),
    TELEFONA_TYPE_ORDER,
  );
  const orderedTelefonaBrands = sortChildrenByNameOrder(
    children.filter((c: any) => (TELEFONA_BRAND_ORDER as readonly string[]).includes(c.name)),
    TELEFONA_BRAND_ORDER,
  );
  const orderedKompjuterTypes = sortChildrenByNameOrder(
    children.filter((c: any) => (KOMPJUTER_TYPE_ORDER as readonly string[]).includes(c.name)),
    KOMPJUTER_TYPE_ORDER,
  );
  const orderedKompjuterBrands = sortChildrenByNameOrder(
    children.filter((c: any) => (KOMPJUTER_BRAND_ORDER as readonly string[]).includes(c.name)),
    KOMPJUTER_BRAND_ORDER,
  );

  /** Car brand depth 3, or motorcycle brand leaf under Motorr & Skuter (depth 2). */
  const isMotorBrandLeaf =
    depth === 2 &&
    parentCategory != null &&
    (parentCategory as any).slug === MOTOR_SKUTER_HUB_SLUG &&
    typeof (currentCategory as any)?.slug === "string" &&
    (currentCategory as any).slug.startsWith("motorr-") &&
    !(currentCategory as any).slug.startsWith("motorr-type-");
  /** Truck brand leaf under Kamionë & Furgonë (depth 2). */
  const isKamionBrandLeaf =
    depth === 2 &&
    parentCategory != null &&
    (parentCategory as any).slug === KAMIONE_FURGONE_HUB_SLUG &&
    (KAMION_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  /** Phone / PC brand leaf (depth 2, direct child of hub). */
  const isTelefonaBrandLeaf =
    depth === 2 &&
    parentCategory != null &&
    (parentCategory as any).slug === TELEFONA_HUB_SLUG &&
    (TELEFONA_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const isKompjuterBrandLeaf =
    depth === 2 &&
    parentCategory != null &&
    (parentCategory as any).slug === KOMPJUTERE_LAPTOP_HUB_SLUG &&
    (KOMPJUTER_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const showBrandLetterHero =
    isBrandLevel || isMotorBrandLeaf || isKamionBrandLeaf || isTelefonaBrandLeaf || isKompjuterBrandLeaf;
  const catSlug =
    typeof (currentCategory as any)?.slug === "string" ? String((currentCategory as any).slug) : "";
  const useBikeEmptyListingIcon =
    catSlug === MOTOR_SKUTER_HUB_SLUG || catSlug.startsWith("motorr-");
  const useTruckEmptyListingIcon =
    isKamioneFurgoneHub ||
    (KAMION_TYPE_ORDER as readonly string[]).includes(currentCategory?.name ?? "") ||
    (KAMION_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const useWrenchEmptyListingIcon =
    isAutoPjesHub ||
    (AUTO_PJESE_TYPE_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const useHouseEmptyListingIcon =
    isBanesaShtepiHub ||
    (BANESA_TYPE_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const useSmartphoneEmptyListingIcon =
    isTelefonaHub ||
    (TELEFONA_TYPE_ORDER as readonly string[]).includes(currentCategory?.name ?? "") ||
    (TELEFONA_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");
  const useLaptopEmptyListingIcon =
    isKompjuterLaptopHub ||
    (KOMPJUTER_TYPE_ORDER as readonly string[]).includes(currentCategory?.name ?? "") ||
    (KOMPJUTER_BRAND_ORDER as readonly string[]).includes(currentCategory?.name ?? "");

  const photo = isBanesaShtepiHub
    ? BANESA_HERO_PHOTO
    : isMotorSkuterHub
      ? MOTORR_HERO_PHOTO
      : isAutoPjesHub
        ? AUTO_PJESE_HERO_PHOTO
        : isLokaleZyreHub
          ? LOKALE_ZYRE_HERO_PHOTO
          : resolveCategoryImageUrl(currentCategory as any) ||
            getCatPhoto(currentCategory?.name ?? "") ||
            "";
  const Icon = getCatIcon(currentCategory?.icon ?? "Car");

  const crumbItems: { label: string; href?: string }[] = [{ label: "KetuJemi", href: "/" }];
  if (grandparentCategory) crumbItems.push({ label: translateCategory(grandparentCategory.name, locale), href: categoryPath(grandparentCategory.id) });
  if (parentCategory) crumbItems.push({ label: translateCategory(parentCategory.name, locale), href: categoryPath(parentCategory.id) });
  crumbItems.push({ label: translateCategory(currentCategory?.name ?? "", locale) });

  const hubResultsId = isVeturaHub
    ? "vetura-results"
    : isKamioneFurgoneHub
      ? "kamione-results"
      : isBanesaShtepiHub
        ? "banesa-results"
        : isMotorSkuterHub
          ? "motorr-results"
          : isAutoPjesHub
            ? "auto-pjese-results"
            : isSportOutdoorHub
              ? "sport-outdoor-results"
              : isLokaleZyreHub
                ? "lokale-zyre-results"
                : isTelefonaHubPage
                  ? "telefona-results"
                  : isArsimKurseHub
                    ? "arsim-kurse-results"
                    : isMobiljeDekorimHub
                      ? "mobilje-dekorim-results"
                      : isRrobaKepuceHub
                        ? "rroba-kepuce-results"
                        : isFemijeHub
                          ? "femije-results"
                          : isPuneSherbimeHub
                            ? "pune-sherbime-results"
                            : isBujqesiBlegtoriHub
                              ? "bujqesi-blegtori-results"
                              : isMuzikeHobbyHub
                                ? "muzike-hobby-results"
                                : isKafshetHub
                                  ? "kafshet-results"
                                  : isTvElektronikeHub
                                    ? "tv-elektronike-results"
                                    : undefined;

  const renderListingsSection = () => (
    <div ref={resultsAnchorRef} id={hubResultsId} className="scroll-mt-28">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-black text-gray-900">
          {isBrandLevel || isMotorBrandLeaf || isKamionBrandLeaf || isTelefonaBrandLeaf || isKompjuterBrandLeaf
            ? `${translateCategory(currentCategory?.name ?? "", locale)} — ${t.listings.toLowerCase()}`
            : isTvElektronikeHub || isTelefonaHubPage
              ? t.listings
              : children.length > 0
                ? t.allListings
                : t.listings}
        </h2>
        {listingsData && listingsData.total > 0 && (
          <span className="text-sm text-gray-400">
            {listingsData.total} {t.totalLabel}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="aspect-[4/3] w-full" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : listingsData && listingsData.listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 min-[1200px]:grid-cols-3 gap-4">
          {listingsData.listings.map((listing: any) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-br from-sky-200/95 via-blue-100/85 to-[#2563eb]/45 p-[1.5px] shadow-sm shadow-blue-500/20">
          <div className="rounded-[calc(1.5rem-1.5px)] bg-[#f5f7fa] px-6 py-14 sm:px-10 sm:py-16 text-center">
            <div className="flex justify-center mb-5">
              {useWrenchEmptyListingIcon ? (
                <Wrench size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : useSmartphoneEmptyListingIcon ? (
                <Smartphone size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : useLaptopEmptyListingIcon ? (
                <Laptop size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : useBikeEmptyListingIcon ? (
                <Bike size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : useTruckEmptyListingIcon ? (
                <Truck size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : useHouseEmptyListingIcon ? (
                <House size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              ) : (
                <Car size={52} strokeWidth={1.75} className="text-[#2563eb]" aria-hidden />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">{t.noListingsYet}</h3>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto mb-8">
              {emptyListingsCopy.sub}
            </p>
            <button
              type="button"
              onClick={goToPostListing}
              className="inline-flex items-center justify-center px-8 py-3.5 sm:px-10 sm:py-4 min-w-[200px] bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl text-base sm:text-lg font-semibold transition-all shadow-md shadow-blue-600/30"
            >
              {t.post}
            </button>
            <p className="mt-4 text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
              {emptyListingsCopy.trust}
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <SiteHeader className="z-30" showViewAllListings />

      {/* Hero banner */}
      <div
        className={
          isVeturaHub ||
          isMotorSkuterHub ||
          isKamioneFurgoneHub ||
          isAutoPjesHub ||
          isBanesaShtepiHub ||
          isLokaleZyreHub ||
          isTelefonaHubPage ||
          isKompjuterLaptopHub ||
          isTvElektronikeHub ||
          isMobiljeDekorimHub ||
          isRrobaKepuceHub ||
          isFemijeHub ||
          isSportOutdoorHub ||
          isArsimKurseHub ||
          isMuzikeHobbyHub ||
          isBujqesiBlegtoriHub ||
          isPuneSherbimeHub ||
          isKafshetHub
            ? "relative h-[220px] md:h-[420px] w-full max-w-[100vw] overflow-hidden isolate"
            : "relative min-h-[10rem] h-44 sm:h-40 w-full max-w-[100vw] overflow-hidden isolate"
        }
      >
        {isVeturaHub ? (
          <VeturaHeroSlideshow />
        ) : isMotorSkuterHub ? (
          <MotorrHeroSlideshow />
        ) : isKamioneFurgoneHub ? (
          <KamioneHeroSlideshow />
        ) : isAutoPjesHub ? (
          <AutoPjeseHeroSlideshow />
        ) : isBanesaShtepiHub ? (
          <BanesaHeroSlideshow />
        ) : isLokaleZyreHub ? (
          <LokaleZyreHeroSlideshow />
        ) : isTelefonaHubPage ? (
          <TelefonaHeroSlideshow />
        ) : isKompjuterLaptopHub ? (
          <KompjuterLaptopHeroSlideshow />
        ) : isTvElektronikeHub ? (
          <TvElektronikeHeroSlideshow />
        ) : isMobiljeDekorimHub ? (
          <MobiljeDekorimHeroSlideshow />
        ) : isRrobaKepuceHub ? (
          <RrobaKepuceHeroSlideshow />
        ) : isFemijeHub ? (
          <FemijeHeroSlideshow />
        ) : isSportOutdoorHub ? (
          <SportOutdoorHeroSlideshow />
        ) : isArsimKurseHub ? (
          <ArsimKurseHeroSlideshow />
        ) : isMuzikeHobbyHub ? (
          <MuzikeHobbyHeroSlideshow />
        ) : isBujqesiBlegtoriHub ? (
          <BujqesiBlegtoriHeroSlideshow />
        ) : isPuneSherbimeHub ? (
          <PuneSherbimeHeroSlideshow />
        ) : isKafshetHub ? (
          <KafshetHeroSlideshow />
        ) : photo ? (
          <img src={photo} alt={currentCategory?.name} className="absolute inset-0 w-full h-full object-cover max-w-none" sizes="100vw" />
        ) : (
          <div className="w-full h-full" style={{ background: "linear-gradient(135deg, #0F2B7F 0%, #2563EB 100%)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 to-black/25" />
        <div className="relative z-10 flex h-full flex-col justify-center px-4 sm:px-6 max-w-7xl mx-auto gap-2 min-w-0">
          <Breadcrumb items={crumbItems} />
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0">
              {showBrandLetterHero ? (
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-black"
                  style={{ backgroundColor: BRAND_COLORS[currentCategory?.name ?? ""] ?? "#1A4FCC" }}
                >
                  {currentCategory?.name?.charAt(0)}
                </div>
              ) : (
                <Icon size={22} className="text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1 pt-1 sm:pt-0">
              <h1 className="text-lg sm:text-2xl md:text-2xl font-black text-white hyphens-auto break-words">
                {translateCategory(currentCategory?.name ?? "", locale)}
              </h1>
              {listingsData && listingsData.total > 0 && (
                <div className="text-white/75 text-sm mt-1">{listingsData.total} {t.listings.toLowerCase()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isParentCategoryHub ? (
        <CategoryPartnersBanner categoryId={categoryId} />
      ) : null}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors rounded-lg min-h-12 px-2 -ml-2 touch-manipulation py-2"
        >
          <ArrowLeft size={16} /> {t.back}
        </button>

        {isVeturaHub && veturaBrandLeafCsv ? (
          <VeturaSearchPanel
            veturaId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setVeturaListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isKamioneFurgoneHub && kamioneBrandLeafCsv ? (
          <KamioneSearchPanel
            kamioneHubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setKamioneListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isBanesaShtepiHub && banesaLeafCsv ? (
          <BanesaSearchPanel
            banesaHubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setBanesaListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isMotorSkuterHub && motorBrandLeafCsv ? (
          <MotorrSearchPanel
            motorHubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setMotorListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isAutoPjesHub && autoPjeseLeafCsv ? (
          <AutoPjeseSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setAutoPjeseListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isSportOutdoorHub && sportOutdoorLeafCsv ? (
          <SportOutdoorSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setSportOutdoorListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isLokaleZyreHub && lokaleZyreLeafCsv ? (
          <LokaleZyreSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setLokaleZyreListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isTelefonaHubPage && telefonaLeafCsv ? (
          <>
            <TelefonaSearchPanel
              hubId={categoryId}
              categories={allCategories as any}
              previewTotal={listingsData?.total ?? null}
              previewLoading={isLoading}
              onListingParamsChange={setTelefonaListParams}
              onScrollToResults={() =>
                resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            />
            {isParentCategoryHub ? (
              <VipPartnersSection variant="hub" categoryId={categoryId} className="my-8" />
            ) : null}
            {renderListingsSection()}
          </>
        ) : null}

        {isArsimKurseHub && arsimKurseLeafCsv ? (
          <ArsimKurseSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setArsimKurseListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isMobiljeDekorimHub && mobiljeDekorimLeafCsv ? (
          <MobiljeDekorimSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setMobiljeDekorimListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isRrobaKepuceHub && rrobaKepuceLeafCsv ? (
          <RrobaKepuceSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setRrobaKepuceListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isFemijeHub && children.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-900 mb-4">
              {(t as { fj_sec_types?: string }).fj_sec_types ?? t.bodyType}
            </h2>
            <CategoryPhotoPickerRow>
              {[...children]
                .sort((a: { name: string }, b: { name: string }) =>
                  a.name.localeCompare(b.name, "sq"),
                )
                .map((sub: { id: number; name: string; slug: string | null }) => (
                  <CategoryPhotoPickerCard
                    key={sub.id}
                    onClick={() => navigateToCategory(setLocation, sub.id, categoryId)}
                    imageSrc={femijeSubcategoryPhoto(sub.slug)}
                    label={translateCategory(sub.name, locale)}
                  />
                ))}
            </CategoryPhotoPickerRow>
          </div>
        ) : null}

        {isFemijeHub && allCategories?.length ? (
          <FemijeSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setFemijeListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isPuneSherbimeHub && puneSherbimeLeafCsv ? (
          <PuneSherbimeSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setPuneSherbimeListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isBujqesiBlegtoriHub && bujqesiBlegtoriLeafCsv ? (
          <BujqesiBlegtoriSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setBujqesiBlegtoriListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isMuzikeHobbyHub && muzikeHobbyLeafCsv ? (
          <MuzikeHobbySearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setMuzikeHobbyListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isKafshetHub && kafshetLeafCsv ? (
          <KafshetSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setKafshetListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isTvElektronikeHub ? (
          <TvElektronikeSearchPanel
            hubId={categoryId}
            categories={allCategories as any}
            previewTotal={listingsData?.total ?? null}
            previewLoading={isLoading}
            onListingParamsChange={setTvElektronikeListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {isKompjuterLaptopHub ? (
          <KompjuterLaptopHubPanel
            hubId={categoryId}
            types={orderedKompjuterTypes}
            onListingParamsChange={setKompjuterListParams}
            onScrollToResults={() =>
              resultsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ) : null}

        {/* Level 1 → show body types (not hubs that define their own pickers above) */}
        {!isBrandLevel &&
          !isBodyTypeLevel &&
          children.length > 0 &&
          !isVeturaHub &&
          !isMotorSkuterHub &&
          !isKamioneFurgoneHub &&
          !isAutoPjesHub &&
          !isBanesaShtepiHub &&
          !isSportOutdoorHub &&
          !isLokaleZyreHub &&
          !isTelefonaHubPage &&
          !isArsimKurseHub &&
          !isMobiljeDekorimHub &&
          !isRrobaKepuceHub &&
          !isFemijeHub &&
          !isPuneSherbimeHub &&
          !isBujqesiBlegtoriHub &&
          !isMuzikeHobbyHub &&
          !isKafshetHub &&
          !isTvElektronikeHub &&
          !isKompjuterLaptopHub && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-900 mb-4">{t.bodyType}</h2>
            <CategoryPhotoPickerRow>
              {children.map((sub: any) => (
                <BodyTypeCard
                  key={sub.id}
                  category={sub}
                  onClick={() => navigateToCategory(setLocation, sub.id, categoryId)}
                />
              ))}
            </CategoryPhotoPickerRow>
          </div>
        )}

        {/* Level 2 → show brands (Vetura body type → brands; not used on Motorr leaf categories) */}
        {isBodyTypeLevel &&
          children.length > 0 &&
          (parentCategory as any)?.slug !== MOTOR_SKUTER_HUB_SLUG &&
          (parentCategory as any)?.slug !== KAMIONE_FURGONE_HUB_SLUG &&
          (parentCategory as any)?.slug !== AUTO_PJESE_HUB_SLUG &&
          (parentCategory as any)?.slug !== BANESA_SHTEPI_HUB_SLUG &&
          (parentCategory as any)?.slug !== SPORT_OUTDOOR_HUB_SLUG &&
          (parentCategory as any)?.slug !== LOKALE_ZYRE_HUB_SLUG &&
          (parentCategory as any)?.slug !== TELEFONA_HUB_SLUG &&
          (parentCategory as any)?.slug !== KOMPJUTERE_LAPTOP_HUB_SLUG && (
          <div className="mb-8">
            <h2 className="text-lg font-black text-gray-900 mb-1">{t.chooseBrand}</h2>
            <p className="text-sm text-gray-400 mb-4">{children.length} {t.brandsAvail}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {[...children].sort((a: any, b: any) => a.name.localeCompare(b.name)).map((brand: any) => (
                <BrandCard
                  key={brand.id}
                  category={brand}
                  onClick={() => navigateToCategory(setLocation, brand.id, categoryId)}
                />
              ))}
            </div>
          </div>
        )}

        {!isTelefonaHubPage && isParentCategoryHub ? (
          <VipPartnersSection variant="hub" categoryId={categoryId} className="my-8" />
        ) : null}

        {!isTelefonaHubPage && renderListingsSection()}
      </div>
    </div>
  );
}

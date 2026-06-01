import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { MapPin, Euro, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { fillCount, banesaFloorLabel, BANESA_FLOOR_VALUES } from "@/lib/app-extra-i18n";
import { resolveBanesaCategoryIdBySlug } from "@/lib/banesa-search-helpers";

/** Pexels CDNs (`w` = card/list width). */
const px = (id: number, w: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

/** Maps stable card ids to merged translation keys (`app-extra-i18n`). */
const BANESA_CARD_LABEL_KEY: Record<string, string> = {
  banesa_garsoniere: "hub_prop_garsoniere",
  banesa_1plus1: "hub_prop_1plus1",
  banesa_2plus1: "hub_prop_2plus1",
  banesa_3plus1: "hub_prop_3plus1",
  banesa_4plus: "hub_prop_4plus",
  banesa_penthouse: "hub_prop_penthouse",
  shtepi_familjare: "hub_prop_sfamiljare",
  shtepi_townhouse: "hub_prop_stownhouse",
  shtepi_vila: "hub_prop_svila",
  vikendica_card: "hub_prop_vikendica",
  truall_ndertim: "hub_prop_truall",
  toke_bujqesore: "hub_prop_tbuqesore",
  toke_industriale: "hub_prop_tindustriale",
  garazh: "hub_prop_garazh",
  objekte_historike: "hub_prop_historike",
};

const PROPERTY_SECTIONS: {
  secKey: string;
  cards: {
    key: string;
    parentSlug: string;
    subtype: string;
    imageUrl: string;
  }[];
}[] = [
  {
    secKey: "hub_banesa_sec_apt",
    cards: [
      {
        key: "banesa_garsoniere",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_garsoniere",
        imageUrl: px(6527064, 400),
      },
      {
        key: "banesa_1plus1",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_1plus1",
        imageUrl: "https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "banesa_2plus1",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_2plus1",
        imageUrl: "https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "banesa_3plus1",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_3plus1",
        imageUrl: px(2251247, 400),
      },
      {
        key: "banesa_4plus",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_4plus_me_shume",
        imageUrl: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "banesa_penthouse",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "banesa_penthouse_duplex",
        imageUrl: "https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
  {
    secKey: "hub_banesa_sec_home",
    cards: [
      {
        key: "shtepi_familjare",
        parentSlug: "banesa-type-shtepi",
        subtype: "shtepi_familjare",
        imageUrl: px(1396122, 400),
      },
      {
        key: "shtepi_townhouse",
        parentSlug: "banesa-type-shtepi",
        subtype: "shtepi_townhouse",
        imageUrl: "https://images.pexels.com/photos/1029599/pexels-photo-1029599.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "shtepi_vila",
        parentSlug: "banesa-type-shtepi",
        subtype: "shtepi_vila_luksoze",
        imageUrl: "https://images.pexels.com/photos/32870/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "vikendica_card",
        parentSlug: "banesa-type-vikendica",
        subtype: "vikendica",
        imageUrl: "https://images.pexels.com/photos/803975/pexels-photo-803975.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
  {
    secKey: "hub_banesa_sec_land",
    cards: [
      {
        key: "truall_ndertim",
        parentSlug: "banesa-type-toka-truall",
        subtype: "toka_ndertim",
        imageUrl: "https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "toke_bujqesore",
        parentSlug: "banesa-type-toka-truall",
        subtype: "toka_bujqesore",
        imageUrl: px(2132171, 400),
      },
      {
        key: "toke_industriale",
        parentSlug: "banesa-type-toka-truall",
        subtype: "toka_industriale",
        imageUrl: "https://images.pexels.com/photos/3732951/pexels-photo-3732951.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
  {
    secKey: "hub_banesa_sec_other",
    cards: [
      {
        key: "garazh",
        parentSlug: "banesa-type-shtepi",
        subtype: "garazh_vendparkim",
        imageUrl: "https://images.pexels.com/photos/1004409/pexels-photo-1004409.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
      {
        key: "objekte_historike",
        parentSlug: "banesa-type-apartamente-banesa",
        subtype: "objekte_historike",
        imageUrl: "https://images.pexels.com/photos/208701/pexels-photo-208701.jpeg?auto=compress&cs=tinysrgb&w=400",
      },
    ],
  },
];

type BanesaPropCard = (typeof PROPERTY_SECTIONS)[number]["cards"][number];

export type BanesaCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  banesaHubId: number;
  categories: BanesaCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
  /** Hub: cards navigate to dedicated view. Type: fixed card filters. */
  variant?: "hub" | "type";
  fixedCardKey?: string;
  onNavigateToCard?: (cardKey: string) => void;
};

function flattenCards(): BanesaPropCard[] {
  return PROPERTY_SECTIONS.flatMap((s) => s.cards);
}

export function BanesaSearchPanel({
  banesaHubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
  variant = "hub",
  fixedCardKey,
  onNavigateToCard,
}: Props) {
  const isTypePage = variant === "type";
  const { t } = useMarket();
  const leafIds = useMemo(() => {
    return categories
      .filter(
        (c) =>
          c.parent_id === banesaHubId &&
          typeof c.slug === "string" &&
          (c.slug as string).startsWith("banesa-type-"),
      )
      .map((c) => c.id);
  }, [categories, banesaHubId]);

  const leafCsv = useMemo(() => [...leafIds].sort((a, b) => a - b).join(","), [leafIds]);

  const cardByKey = useMemo(() => {
    const m = new Map<string, BanesaPropCard>();
    for (const c of flattenCards()) m.set(c.key, c);
    return m;
  }, []);

  const [txn, setTxn] = useState<"shitje" | "qira" | null>(null);
  const [selectedCardKey, setSelectedCardKey] = useState<string | null>(fixedCardKey ?? null);
  const [locationSearch, setLocationSearch] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sqmMin, setSqmMin] = useState("");
  const [sqmMax, setSqmMax] = useState("");
  const [floor, setFloor] = useState<string>("__any__");

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  useEffect(() => {
    if (fixedCardKey) setSelectedCardKey(fixedCardKey);
  }, [fixedCardKey]);

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: leafCsv,
    };

    if (txn != null) {
      p.property_txn = txn;
    }

    if (selectedCardKey) {
      const card = cardByKey.get(selectedCardKey);
      if (card) {
        const parentId = resolveBanesaCategoryIdBySlug(
          categories as BanesaCategoryRow[],
          banesaHubId,
          card.parentSlug,
        );
        if (parentId != null) {
          p.category_id = parentId;
          delete p.category_ids;
        }
        p.property_subtype = card.subtype;
      }
    }

    const loc = locationSearch.trim();
    if (loc) {
      p.location_search = loc;
    }

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    const sqMin = parseFloat(sqmMin.replace(",", "."));
    const sqMax = parseFloat(sqmMax.replace(",", "."));
    if (Number.isFinite(sqMin) && sqmMin.trim()) {
      p.property_sqm_min = Math.round(sqMin);
    }
    if (Number.isFinite(sqMax) && sqmMax.trim()) {
      p.property_sqm_max = Math.round(sqMax);
    }

    if (floor !== "__any__") {
      p.property_floor = floor;
    }

    return p;
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      callbackRef.current(buildParams());
    }, 400);
    return () => window.clearTimeout(t);
  }, [
    leafCsv,
    banesaHubId,
    txn,
    selectedCardKey,
    locationSearch,
    priceMin,
    priceMax,
    sqmMin,
    sqmMax,
    floor,
    categories,
  ]);

  const countLabel =
    previewLoading || previewTotal === null ? "…" : previewTotal.toLocaleString("de-DE");
  const listingLine = fillCount(t.hub_show_listings_m, countLabel);

  return (
    <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
      {/* PROPERTY TYPE CARDS BY SECTION - above search form */}
      {!isTypePage ? (
      <div className="space-y-10 mb-8">
        {PROPERTY_SECTIONS.map((sec) => (
          <div key={sec.secKey} className="space-y-4">
            <h3 className="text-lg font-bold uppercase tracking-wide text-slate-600">{t[sec.secKey]}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sec.cards.map((c) => {
                const lk = BANESA_CARD_LABEL_KEY[c.key];
                const cardLabel = lk ? t[lk] : c.key;
                const active = selectedCardKey === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      if (onNavigateToCard) {
                        onNavigateToCard(c.key);
                        return;
                      }
                      setSelectedCardKey(active ? null : c.key);
                    }}
                    className={cn(
                      "flex flex-col items-stretch rounded-xl border-2 text-left outline-none overflow-hidden transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 touch-manipulation",
                      active
                        ? "border-blue-600 bg-blue-50/80 shadow-md shadow-blue-900/15 ring-2 ring-blue-500/25"
                        : "border-slate-100 bg-white hover:border-blue-300 hover:shadow-md",
                    )}
                  >
                    <img
                      src={c.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-[5.75rem] w-full object-cover"
                    />
                    <span className="px-2.5 py-2.5 text-sm font-bold leading-tight text-slate-800">
                      {cardLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      ) : null}

      {/* Kërko prona - search form */}
      <div className="flex flex-col gap-1 border-t border-slate-100 pt-8 pb-5 mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{t.hub_banesa_title}</h2>
        <p className="text-sm text-slate-500">{t.hub_banesa_sub}</p>
      </div>

      {/* TRANSACTION */}
      <div className="space-y-3 mb-8">
        <Label className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.hub_txn_lbl}
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setTxn(txn === "shitje" ? null : "shitje")}
            className={cn(
              "h-16 rounded-2xl text-base font-bold transition-all border-2",
              txn === "shitje"
                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/25"
                : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-blue-400 hover:bg-white",
            )}
          >
            {t.hub_txn_sale}
          </button>
          <button
            type="button"
            onClick={() => setTxn(txn === "qira" ? null : "qira")}
            className={cn(
              "h-16 rounded-2xl text-base font-bold transition-all border-2",
              txn === "qira"
                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-900/25"
                : "border-slate-200 bg-slate-50/70 text-slate-800 hover:border-blue-400 hover:bg-white",
            )}
          >
            {t.hub_txn_rent}
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            {t.hub_prop_location}
          </Label>
          <Input
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
            placeholder={t.hub_prop_loc_ph}
            className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Euro className="w-3.5 h-3.5" />
            {t.hub_prop_priceParen}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_fromPh}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
            />
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_toPh}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Maximize className="w-3.5 h-3.5" />
            {t.hub_prop_areaParen}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_fromPh}
              value={sqmMin}
              onChange={(e) => setSqmMin(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
            />
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_toPh}
              value={sqmMax}
              onChange={(e) => setSqmMax(e.target.value)}
              className="h-12 rounded-xl border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold uppercase tracking-wide text-slate-500">{t.hub_prop_floorLbl}</Label>
          <Select value={floor} onValueChange={setFloor}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue placeholder={t.hub_prop_anyFloor} />
            </SelectTrigger>
            <SelectContent className="max-h-[min(50vh,20rem)] rounded-xl">
              <SelectItem value="__any__">{t.hub_prop_anyFloor}</SelectItem>
              {BANESA_FLOOR_VALUES.map((fl) => (
                <SelectItem key={fl} value={fl}>
                  {banesaFloorLabel(t, fl)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="button"
        className="mt-8 h-14 w-full rounded-xl bg-[#1565C0] hover:bg-[#13519E] text-base font-semibold shadow-md shadow-blue-900/15"
        onClick={() => onScrollToResults?.()}
      >
        <span className="flex flex-col items-center gap-0.5 leading-tight sm:flex-row sm:gap-2">
          <span>{t.hub_cta_search_property}</span>
          <span className="text-sm font-medium opacity-90">
            {listingLine}
            {previewLoading ? " …" : ""}
          </span>
        </span>
      </Button>
    </div>
  );
}

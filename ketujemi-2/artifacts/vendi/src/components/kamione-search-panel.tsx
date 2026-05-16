import { useEffect, useMemo, useRef, useState } from "react";
import type { CarModelRow, GetListingsParams } from "@workspace/api-client-react";
import { useGetTruckModels } from "@workspace/api-client-react";
import {
  Truck,
  Gauge,
  Fuel,
  CalendarRange,
  Euro,
  Search,
  ChevronsUpDown,
  Check,
} from "lucide-react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { fillCount } from "@/lib/app-extra-i18n";
import {
  getKamioneModelsForPicker,
  KAMION_SEARCH_BRAND_ORDER,
} from "@/lib/kamione-search-helpers";

/** `kamione-*` category slug → car-logos-dataset PNG filename stem */
function kamioneBrandLogoUrl(categorySlug: string): string {
  const file = categorySlug.replace(/^kamione-/, "");
  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${file}.png`;
}

const VEHICLE_TYPES: {
  key: string;
  labelKey: string;
  imageUrl: string;
  typeSlug: string;
}[] = [
  {
    key: "furgone",
    labelKey: "hub_kamt_furgon",
    imageUrl: "https://images.pexels.com/photos/1178448/pexels-photo-1178448.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "kamione-type-furgone",
  },
  {
    key: "kamione",
    labelKey: "hub_kamt_kamion",
    imageUrl: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=200",
    typeSlug: "kamione-type-kamione",
  },
  {
    key: "mauna",
    labelKey: "hub_kamt_maune",
    imageUrl: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=200",
    typeSlug: "kamione-type-mauna",
  },
  {
    key: "rimorkio",
    labelKey: "hub_kamt_rimorkio",
    imageUrl: "https://images.pexels.com/photos/1427107/pexels-photo-1427107.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "kamione-type-trailer-rimorkio",
  },
  {
    key: "autobus",
    labelKey: "hub_kamt_bus",
    imageUrl: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=200",
    typeSlug: "kamione-type-autobuse",
  },
  {
    key: "makineri",
    labelKey: "hub_kamt_makineri",
    imageUrl:
      "https://images.pexels.com/photos/36657010/pexels-photo-36657010.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "kamione-type-auto-bartes",
  },
];

const YEAR_OPTS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

const AXLE_OPTS = ["4x2", "4x4", "6x2", "6x4", "8x4"] as const;

const GVW_OPTS: { band: string; labelKey: string }[] = [
  { band: "up_to_3_5", labelKey: "hub_gvw_u35" },
  { band: "band_3_5_7_5", labelKey: "hub_gvw_3575" },
  { band: "band_7_5_18", labelKey: "hub_gvw_7518" },
  { band: "above_18", labelKey: "hub_gvw_a18" },
];

const EURO_OPTS = ["Euro 3", "Euro 4", "Euro 5", "Euro 6"] as const;

const TRUCK_MILE_ITEMS: { value: string; labelKey: string }[] = [
  { value: "none", labelKey: "hub_anyKm" },
  { value: "max100", labelKey: "hub_km_tr100" },
  { value: "max300", labelKey: "hub_km_tr300" },
  { value: "max500", labelKey: "hub_km_tr500" },
  { value: "above500", labelKey: "hub_km_tra500" },
];

const FUEL_OPTS: { labelKey: string; stored: string }[] = [
  { labelKey: "hub_truck_fuel_naft", stored: "Naftë" },
  { labelKey: "hub_truck_fuel_el", stored: "Elektrik" },
  { labelKey: "hub_truck_fuel_gaz", stored: "Gaz (LNG/CNG)" },
];

export type KamioneCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  kamioneHubId: number;
  categories: KamioneCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function KamioneSearchPanel({
  kamioneHubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();
  const leafIds = useMemo(() => {
    return categories
      .filter(
        (c) =>
          c.parent_id === kamioneHubId &&
          typeof c.slug === "string" &&
          (c.slug as string).startsWith("kamione-") &&
          !(c.slug as string).startsWith("kamione-type-"),
      )
      .map((c) => c.id);
  }, [categories, kamioneHubId]);

  const leafCsv = useMemo(() => [...leafIds].sort((a, b) => a - b).join(","), [leafIds]);

  const brands = useMemo(() => {
    const rows = categories.filter(
      (c) =>
        c.parent_id === kamioneHubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("kamione-") &&
        !(c.slug as string).startsWith("kamione-type-"),
    );
    const rank = new Map<string, number>(KAMION_SEARCH_BRAND_ORDER.map((n, i) => [n, i]));
    return [...rows].sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999));
  }, [categories, kamioneHubId]);

  const { data: modelRows = [], isLoading: modelsLoading } = useGetTruckModels();

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [brandCatId, setBrandCatId] = useState<number | null>(null);

  const [modelName, setModelName] = useState("");
  const [modelOpenKey, setModelOpenKey] = useState(0);
  const [typeKey, setTypeKey] = useState<string | null>(null);
  const [axle, setAxle] = useState<string>("__any__");
  const [gvwBand, setGvwBand] = useState<string>("__any__");
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [mileagePreset, setMileagePreset] = useState<string>("none");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fuels, setFuels] = useState<Record<string, boolean>>({});
  const [euroStd, setEuroStd] = useState<string>("__any__");

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const selectedBrandName = brandCatId ? (brands.find((b) => b.id === brandCatId)?.name ?? null) : null;

  const modelsForPicker = useMemo(
    () =>
      getKamioneModelsForPicker({
        typeKey,
        brandSlug,
        modelRows: modelRows as { brand_slug: string; name: string }[],
      }),
    [typeKey, brandSlug, modelRows],
  );

  const selectVehicleType = (key: string) => {
    const next = typeKey === key ? null : key;
    setTypeKey(next);
    const nextModels = getKamioneModelsForPicker({
      typeKey: next,
      brandSlug,
      modelRows: modelRows as { brand_slug: string; name: string }[],
    });
    if (modelName.trim() && !nextModels.includes(modelName.trim())) {
      setModelName("");
    }
    setModelOpenKey((k) => k + 1);
  };

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: leafCsv,
    };

    if (brandCatId != null) {
      p.category_id = brandCatId;
      delete p.category_ids;
    }

    if (modelName.trim()) {
      p.vehicle_model = modelName.trim();
    }

    if (typeKey) {
      const t = VEHICLE_TYPES.find((v) => v.key === typeKey);
      if (t) p.truck_type_slug = t.typeSlug;
    }

    if (axle !== "__any__") {
      p.truck_axle_config = axle;
    }

    if (gvwBand !== "__any__") {
      p.truck_gvw_band = gvwBand;
    }

    if (euroStd !== "__any__") {
      p.truck_euro_standard = euroStd;
    }

    if (yearFrom.trim()) {
      const y = Number(yearFrom);
      if (Number.isFinite(y)) p.year_min = y;
    }
    if (yearTo.trim()) {
      const y = Number(yearTo);
      if (Number.isFinite(y)) p.year_max = y;
    }

    switch (mileagePreset) {
      case "max100":
        p.mileage_max = 100_000;
        break;
      case "max300":
        p.mileage_max = 300_000;
        break;
      case "max500":
        p.mileage_max = 500_000;
        break;
      case "above500":
        p.mileage_min = 500_000;
        break;
      default:
        break;
    }

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    const fuelsOn = FUEL_OPTS.filter((f) => fuels[f.stored]).map((f) => f.stored);
    if (fuelsOn.length > 0) {
      p.fuel = fuelsOn.join(",");
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
    brandCatId,
    modelName,
    typeKey,
    axle,
    gvwBand,
    yearFrom,
    yearTo,
    mileagePreset,
    priceMin,
    priceMax,
    fuels,
    euroStd,
  ]);

  const countLabel =
    previewLoading || previewTotal === null ? "…" : previewTotal.toLocaleString("de-DE");
  const truckShowLine = fillCount(t.hub_show_trucks, countLabel);

  return (
    <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
      <div className="space-y-3 mb-8">
        <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Truck className="w-3.5 h-3.5" />
          {t.hub_kamione_types_lbl}
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {VEHICLE_TYPES.map((v) => {
            const active = typeKey === v.key;
            return (
              <button
                key={v.key}
                type="button"
                aria-pressed={active}
                onClick={() => setTypeKey(active ? null : v.key)}
                className={cn(
                  "group relative isolate h-[140px] md:h-[160px] overflow-hidden rounded-xl border-2 text-left outline-none transition-all",
                  "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  active
                    ? "border-blue-600 shadow-md shadow-blue-900/25 ring-2 ring-blue-500/35"
                    : "border-white/70 ring-1 ring-black/10 hover:border-blue-300 hover:shadow-md",
                )}
              >
                <img
                  src={v.imageUrl}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/88 via-black/35 to-transparent",
                    active && "from-blue-950/72 via-blue-900/42 to-blue-900/10",
                  )}
                  aria-hidden
                />
                <div className="relative z-[3] flex h-full flex-col justify-end px-2.5 pb-3 pt-8">
                  <span className="w-full px-1 text-center text-sm font-bold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                    {t[v.labelKey]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{t.hub_kamione_title}</h2>
        <p className="text-sm text-slate-500">
          {t.hub_kamione_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Truck className="w-3.5 h-3.5" />
            {t.hub_pickBrandLbl}
          </Label>
          <Popover open={brandOpen} onOpenChange={setBrandOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={brandOpen}
                className="w-full h-12 justify-between rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white font-normal"
              >
                <span className="flex items-center gap-2 min-w-0">
                  {selectedBrandName && brandSlug ? (
                    <>
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm overflow-hidden">
                        <img
                          src={kamioneBrandLogoUrl(brandSlug)}
                          alt=""
                          className="max-h-7 max-w-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </span>
                      <span className="truncate font-semibold text-slate-800">{selectedBrandName}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">{t.hub_allBrands}</span>
                  )}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl" align="start">
              <Command shouldFilter>
                <CommandInput placeholder={t.hub_searchBrandPh} className="h-11" />
                <CommandList className="max-h-72">
                  <CommandEmpty>{t.hub_noBrand}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__all__ brands"
                      onSelect={() => {
                        setBrandSlug(null);
                        setBrandCatId(null);
                        setModelName("");
                        setModelOpenKey((k) => k + 1);
                        setBrandOpen(false);
                      }}
                    >
                      <Check className={cn("mr-2 h-4 w-4", brandCatId == null ? "opacity-100" : "opacity-0")} />
                      {t.hub_allBrands}
                    </CommandItem>
                    {brands.map((b) => {
                      const slug = b.slug ?? "";
                      return (
                        <CommandItem
                          key={b.id}
                          value={`${b.name} ${slug}`}
                          onSelect={() => {
                            setBrandSlug(slug);
                            setBrandCatId(b.id);
                            setModelName("");
                            setModelOpenKey((k) => k + 1);
                            setBrandOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              brandCatId === b.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-slate-100 overflow-hidden">
                            <img
                              src={kamioneBrandLogoUrl(slug)}
                              alt=""
                              className="max-h-[22px] max-w-[22px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.opacity = "0";
                              }}
                            />
                          </span>
                          <span>{b.name}</span>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Search className="w-3.5 h-3.5 opacity-70" />
            {t.hub_pickModelLbl}
          </Label>
          <Select
            key={`${brandSlug}-${typeKey ?? "any"}-${modelOpenKey}`}
            value={modelName || "__any__"}
            onValueChange={(val) => setModelName(val === "__any__" ? "" : val)}
            disabled={(!typeKey && modelsLoading) || modelsForPicker.length === 0}
          >
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue
                placeholder={
                  !typeKey && modelsLoading
                    ? t.hub_model_loading
                    : modelsForPicker.length === 0
                      ? t.hub_model_none
                      : t.hub_model_pick
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-[min(60vh,22rem)] rounded-xl">
              <SelectItem value="__any__">{t.hub_anyModel}</SelectItem>
              {modelsForPicker.map((m: string) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.hub_axleLbl}
          </Label>
          <Select value={axle} onValueChange={setAxle}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue placeholder={t.hub_anyAxle} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__any__">{t.hub_anyAxle}</SelectItem>
              {AXLE_OPTS.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.hub_gvwLbl}
          </Label>
          <Select value={gvwBand} onValueChange={setGvwBand}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue placeholder={t.hub_anyGvw} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__any__">{t.hub_anyGvw}</SelectItem>
              {GVW_OPTS.map((g) => (
                <SelectItem key={g.band} value={g.band}>
                  {t[g.labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <CalendarRange className="w-3.5 h-3.5" />
            {t.hub_year_span}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Select value={yearFrom || "unset"} onValueChange={(v) => setYearFrom(v === "unset" ? "" : v)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder={t.hub_fromPh} />
              </SelectTrigger>
              <SelectContent className="max-h-52 rounded-xl">
                <SelectItem value="unset">—</SelectItem>
                {YEAR_OPTS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={yearTo || "unset"} onValueChange={(v) => setYearTo(v === "unset" ? "" : v)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200">
                <SelectValue placeholder={t.hub_toPh} />
              </SelectTrigger>
              <SelectContent className="max-h-52 rounded-xl">
                <SelectItem value="unset">—</SelectItem>
                {YEAR_OPTS.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Gauge className="w-3.5 h-3.5" />
            {t.hub_kmLbl}
          </Label>
          <Select value={mileagePreset} onValueChange={setMileagePreset}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {TRUCK_MILE_ITEMS.map((row) => (
                <SelectItem key={row.value} value={row.value}>
                  {t[row.labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Fuel className="w-3.5 h-3.5" />
            {t.fuelField}
          </Label>
          <div className="flex flex-wrap gap-x-6 gap-y-3 min-h-[3rem] items-center rounded-xl border border-slate-100 bg-slate-50/40 px-3 py-3">
            {FUEL_OPTS.map((f) => (
              <label key={f.stored} className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={!!fuels[f.stored]}
                  onCheckedChange={(chk) =>
                    setFuels((prev) => ({ ...prev, [f.stored]: chk === true }))
                  }
                />
                <span className="text-sm font-medium text-slate-700">{t[f.labelKey]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t.hub_euroLbl}
          </Label>
          <Select value={euroStd} onValueChange={setEuroStd}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue placeholder={t.hub_anyEuro} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__any__">{t.hub_anyEuro}</SelectItem>
              {EURO_OPTS.map((e) => (
                <SelectItem key={e} value={e}>
                  {e}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Euro className="w-3.5 h-3.5" />
            {t.hub_price_span_euro}
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                €
              </span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t.hub_fromPh}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-12 rounded-xl border-slate-200 pl-8"
              />
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                €
              </span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder={t.hub_toPh}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-12 rounded-xl border-slate-200 pl-8"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        className="mt-8 h-14 w-full rounded-xl bg-[#1565C0] hover:bg-[#13519E] text-base font-semibold shadow-md shadow-blue-900/15"
        onClick={() => onScrollToResults?.()}
      >
        <span className="flex flex-col items-center gap-0.5 leading-tight sm:flex-row sm:gap-2">
          <span>{t.hub_cta_search_transport}</span>
          <span className="text-sm font-medium opacity-90">
            {truckShowLine}
            {previewLoading ? " …" : ""}
          </span>
        </span>
      </Button>
    </div>
  );
}

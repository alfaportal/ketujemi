import { useEffect, useMemo, useRef, useState } from "react";
import type { CarModelRow, GetListingsParams } from "@workspace/api-client-react";
import { useGetMotorModels } from "@workspace/api-client-react";
import {
  Bike,
  Gauge,
  CalendarRange,
  Euro,
  Search,
  ChevronsUpDown,
  Check,
  Settings2,
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
  getMotorModelsForPicker,
  getMotorPiaggioBrandSlug,
  MOTOR_SEARCH_BRAND_ORDER,
} from "@/lib/motorr-search-helpers";

function motorBrandLogoUrl(categorySlug: string): string {
  const file = categorySlug.replace(/^motorr-/, "");
  return `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${file}.png`;
}

const VEHICLE_TYPES: {
  key: string;
  labelKey: string;
  imageUrl: string;
  typeSlug: string;
}[] = [
  {
    key: "chopper",
    labelKey: "hub_mt_chopper",
    imageUrl:
      "https://images.pexels.com/photos/13840287/pexels-photo-13840287.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-chopper",
  },
  {
    key: "enduro",
    labelKey: "hub_mt_enduro",
    imageUrl:
      "https://images.pexels.com/photos/1174103/pexels-photo-1174103.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-enduro",
  },
  {
    key: "motokros",
    labelKey: "hub_mt_mx",
    imageUrl:
      "https://images.pexels.com/photos/33708729/pexels-photo-33708729.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-motokros",
  },
  {
    key: "sportiv",
    labelKey: "hub_mt_sport",
    imageUrl:
      "https://images.pexels.com/photos/22775780/pexels-photo-22775780.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-sportiv",
  },
  {
    key: "quad",
    labelKey: "hub_mt_quad",
    imageUrl:
      "https://images.pexels.com/photos/19133792/pexels-photo-19133792.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-quad-atv",
  },
  {
    key: "skuter",
    labelKey: "hub_mt_skuter",
    imageUrl:
      "https://images.pexels.com/photos/31386613/pexels-photo-31386613.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-skuter",
  },
  {
    key: "vespa",
    labelKey: "hub_mt_vespa",
    imageUrl:
      "https://images.pexels.com/photos/34614503/pexels-photo-34614503.jpeg?auto=compress&cs=tinysrgb&w=400",
    typeSlug: "motorr-type-vespa",
  },
];

const YEAR_OPTS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

const CC_OPTS: { band: string; labelKey: string }[] = [
  { band: "up_to_50", labelKey: "hub_cc_u50" },
  { band: "band_51_125", labelKey: "hub_cc_125" },
  { band: "band_126_250", labelKey: "hub_cc_250" },
  { band: "band_251_500", labelKey: "hub_cc_500" },
  { band: "band_501_750", labelKey: "hub_cc_750" },
  { band: "above_750", labelKey: "hub_cc_a750" },
];

const MOTOR_MILE_ITEMS: { value: string; labelKey: string }[] = [
  { value: "none", labelKey: "hub_anyKm" },
  { value: "max5k", labelKey: "hub_km_m5k" },
  { value: "max10k", labelKey: "hub_km_m10k" },
  { value: "max20k", labelKey: "hub_km_m20k" },
  { value: "max50k", labelKey: "hub_km_m50k" },
  { value: "min100k", labelKey: "hub_km_p100k" },
];

export type MotorrCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  motorHubId: number;
  categories: MotorrCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function MotorrSearchPanel({
  motorHubId,
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
          c.parent_id === motorHubId &&
          typeof c.slug === "string" &&
          (c.slug as string).startsWith("motorr-") &&
          !(c.slug as string).startsWith("motorr-type-"),
      )
      .map((c) => c.id);
  }, [categories, motorHubId]);

  const leafCsv = useMemo(() => [...leafIds].sort((a, b) => a - b).join(","), [leafIds]);

  const brands = useMemo(() => {
    const rows = categories.filter(
      (c) =>
        c.parent_id === motorHubId &&
        typeof c.slug === "string" &&
        (c.slug as string).startsWith("motorr-") &&
        !(c.slug as string).startsWith("motorr-type-"),
    );
    const rank = new Map<string, number>(MOTOR_SEARCH_BRAND_ORDER.map((n, i) => [n, i]));
    return [...rows].sort((a, b) => (rank.get(a.name) ?? 999) - (rank.get(b.name) ?? 999));
  }, [categories, motorHubId]);

  const { data: modelRows = [], isLoading: modelsLoading } = useGetMotorModels();

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [brandCatId, setBrandCatId] = useState<number | null>(null);

  const [modelName, setModelName] = useState("");
  const [modelOpenKey, setModelOpenKey] = useState(0);
  const [typeKey, setTypeKey] = useState<string | null>(null);
  const [ccBand, setCcBand] = useState<string>("__any__");

  const [kwMin, setKwMin] = useState("");
  const [kwMax, setKwMax] = useState("");

  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [mileagePreset, setMileagePreset] = useState<string>("none");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [txManual, setTxManual] = useState(false);
  const [txAuto, setTxAuto] = useState(false);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const selectedBrandName = brandCatId ? (brands.find((b) => b.id === brandCatId)?.name ?? null) : null;

  const modelsForPicker = useMemo(
    () =>
      getMotorModelsForPicker({
        typeKey,
        brandSlug,
        modelRows: modelRows as { brand_slug: string; name: string }[],
      }),
    [typeKey, brandSlug, modelRows],
  );

  const selectVehicleType = (key: string) => {
    const next = typeKey === key ? null : key;
    let nextBrandSlug = brandSlug;

    if (next === "vespa") {
      const piaggio = brands.find((b) => b.slug === getMotorPiaggioBrandSlug());
      if (piaggio?.slug) {
        nextBrandSlug = piaggio.slug;
        setBrandSlug(piaggio.slug);
        setBrandCatId(piaggio.id);
      }
    }

    setTypeKey(next);

    const nextModels = getMotorModelsForPicker({
      typeKey: next,
      brandSlug: nextBrandSlug,
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
      if (t) p.motor_type_slug = t.typeSlug;
    }

    if (ccBand !== "__any__") {
      p.motor_cc_band = ccBand;
    }

    const kmin = parseFloat(kwMin.replace(",", "."));
    const kmax = parseFloat(kwMax.replace(",", "."));
    if (Number.isFinite(kmin) && kwMin.trim()) p.motor_kw_min = kmin;
    if (Number.isFinite(kmax) && kwMax.trim()) p.motor_kw_max = kmax;

    if (yearFrom.trim()) {
      const y = Number(yearFrom);
      if (Number.isFinite(y)) p.year_min = y;
    }
    if (yearTo.trim()) {
      const y = Number(yearTo);
      if (Number.isFinite(y)) p.year_max = y;
    }

    switch (mileagePreset) {
      case "max5k":
        p.mileage_max = 5_000;
        break;
      case "max10k":
        p.mileage_max = 10_000;
        break;
      case "max20k":
        p.mileage_max = 20_000;
        break;
      case "max50k":
        p.mileage_max = 50_000;
        break;
      case "min100k":
        p.mileage_min = 99_999;
        break;
      default:
        break;
    }

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    const tx: string[] = [];
    if (txManual) tx.push("Manual");
    if (txAuto) tx.push("Automatik");
    if (tx.length > 0) {
      p.motor_transmission = tx.join(",");
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
    ccBand,
    kwMin,
    kwMax,
    yearFrom,
    yearTo,
    mileagePreset,
    priceMin,
    priceMax,
    txManual,
    txAuto,
  ]);

  const countLabel =
    previewLoading || previewTotal === null ? "…" : previewTotal.toLocaleString("de-DE");
  const motorListingLine = fillCount(t.hub_show_listings_m, countLabel);

  return (
    <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
      <div className="space-y-3 mb-8">
        <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Bike className="w-3.5 h-3.5" />
          {t.hub_motorr_types_lbl}
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {VEHICLE_TYPES.map((v) => {
            const active = typeKey === v.key;
            return (
              <button
                key={v.key}
                type="button"
                aria-pressed={active}
                onClick={() => selectVehicleType(v.key)}
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
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{t.hub_motorr_title}</h2>
        <p className="text-sm text-slate-500">
          {t.hub_motorr_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Bike className="w-3.5 h-3.5" />
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
                          src={motorBrandLogoUrl(brandSlug)}
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
                            const nextTypeKey =
                              typeKey === "vespa" && slug !== getMotorPiaggioBrandSlug() ? null : typeKey;
                            setBrandSlug(slug);
                            setBrandCatId(b.id);
                            if (nextTypeKey !== typeKey) setTypeKey(nextTypeKey);
                            const nextModels = getMotorModelsForPicker({
                              typeKey: nextTypeKey,
                              brandSlug: slug,
                              modelRows: modelRows as { brand_slug: string; name: string }[],
                            });
                            if (modelName.trim() && !nextModels.includes(modelName.trim())) {
                              setModelName("");
                            }
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
                              src={motorBrandLogoUrl(slug)}
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
            <Gauge className="w-3.5 h-3.5" />
            {t.hub_ccLbl}
          </Label>
          <Select value={ccBand} onValueChange={setCcBand}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white">
              <SelectValue placeholder={t.hub_anyCc} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="__any__">{t.hub_anyCc}</SelectItem>
              {CC_OPTS.map((c) => (
                <SelectItem key={c.band} value={c.band}>
                  {t[c.labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Gauge className="w-3.5 h-3.5" />
            {t.hub_kwLbl}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_fromPh}
              value={kwMin}
              onChange={(e) => setKwMin(e.target.value)}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/40"
            />
            <Input
              type="text"
              inputMode="decimal"
              placeholder={t.hub_toPh}
              value={kwMax}
              onChange={(e) => setKwMax(e.target.value)}
              className="h-12 rounded-xl border-slate-200 bg-slate-50/40"
            />
          </div>
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
                  <SelectItem key={`from-${y}`} value={String(y)}>
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
                  <SelectItem key={`to-${y}`} value={String(y)}>
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
              {MOTOR_MILE_ITEMS.map((row) => (
                <SelectItem key={row.value} value={row.value}>
                  {t[row.labelKey]}
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

        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Settings2 className="w-3.5 h-3.5 opacity-75" />
            {t.hub_trans_lbl}
          </Label>
          <div className="flex flex-wrap gap-x-10 gap-y-3 min-h-[3rem] items-center rounded-xl border border-slate-100 bg-slate-50/40 px-4 py-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={txManual} onCheckedChange={(chk) => setTxManual(chk === true)} />
              <span className="text-sm font-medium text-slate-700">{t.hub_tx_manual}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox checked={txAuto} onCheckedChange={(chk) => setTxAuto(chk === true)} />
              <span className="text-sm font-medium text-slate-700">{t.hub_tx_auto}</span>
            </label>
          </div>
        </div>
      </div>

      <Button
        type="button"
        className="mt-8 h-14 w-full rounded-xl bg-[#1565C0] hover:bg-[#13519E] text-base font-semibold shadow-md shadow-blue-900/15"
        onClick={() => onScrollToResults?.()}
      >
        <span className="flex flex-col items-center gap-0.5 leading-tight sm:flex-row sm:gap-2">
          <span>{t.hub_cta_search_motor}</span>
          <span className="text-sm font-medium opacity-90">
            {motorListingLine}
            {previewLoading ? " …" : ""}
          </span>
        </span>
      </Button>
    </div>
  );
}

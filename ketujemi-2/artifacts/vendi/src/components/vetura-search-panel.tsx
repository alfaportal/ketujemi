import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import {
  Car,
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
  getVeturaBrandLeafCategoryIds,
  getVeturaModelsForPicker,
  isVeturaModelAllowedForBody,
  type VeturaBodyTypeKey,
} from "@/lib/vetura-search-helpers";

const CAR_DATASET_PNG = (slug: string) =>
  `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized/${slug}.png`;

/** Matches `FORM_OPTIONS.bodyType` ks values used when posting listings */
const BODY_CHIPS: {
  key: VeturaBodyTypeKey;
  labelKey: string;
  stored: string | null;
  elektrikeFilter?: boolean;
  pexelsUrl: string;
}[] = [
  {
    key: "sedan",
    labelKey: "hub_body_sedan",
    stored: "Sedan",
    pexelsUrl:
      "https://images.pexels.com/photos/170811/pexels-photo-170811.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    key: "suv",
    labelKey: "hub_body_suv",
    stored: "SUV / Jeep",
    pexelsUrl:
      "https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    key: "hatch",
    labelKey: "hub_body_hatch",
    stored: "Hatchback",
    pexelsUrl:
      "https://images.pexels.com/photos/5976596/pexels-photo-5976596.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    key: "kombi",
    labelKey: "hub_body_kombi",
    stored: "Kombi",
    pexelsUrl: "https://images.pexels.com/photos/1149831/pexels-photo-1149831.jpeg?w=400",
  },
  {
    key: "kabriolet",
    labelKey: "hub_body_kabrio_sport",
    stored: "Kabriolet",
    pexelsUrl: "https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?w=400",
  },
  {
    key: "kupe",
    labelKey: "hub_body_kupe",
    stored: "Kupe",
    pexelsUrl: "https://images.pexels.com/photos/3764984/pexels-photo-3764984.jpeg?w=400",
  },
  {
    key: "ev",
    labelKey: "hub_body_ev",
    stored: null,
    elektrikeFilter: true,
    pexelsUrl: "https://images.pexels.com/photos/110844/pexels-photo-110844.jpeg?w=400",
  },
  {
    key: "pickup",
    labelKey: "hub_body_pickup",
    stored: "Pikap",
    pexelsUrl:
      "https://images.pexels.com/photos/14438397/pexels-photo-14438397.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
];


const YEAR_OPTS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

const FUEL_OPTS: { labelKey: string; stored: string }[] = [
  { labelKey: "hub_fu_benz", stored: "Benzinë" },
  { labelKey: "hub_fu_naft", stored: "Naftë" },
  { labelKey: "hub_fu_elek", stored: "Elektrik" },
  { labelKey: "hub_fu_hib", stored: "Hibrid" },
  { labelKey: "hub_fu_gaz", stored: "Gaz (LPG)" },
];

const CAR_MILE_ITEMS: { value: string; labelKey: string }[] = [
  { value: "none", labelKey: "hub_anyMile_car" },
  { value: "5000", labelKey: "hub_kmv_5k" },
  { value: "10000", labelKey: "hub_kmv_10k" },
  { value: "20000", labelKey: "hub_kmv_20k" },
  { value: "50000", labelKey: "hub_kmv_50k" },
  { value: "100000", labelKey: "hub_kmv_100k" },
  { value: "150000", labelKey: "hub_kmv_150k" },
  { value: "200000", labelKey: "hub_kmv_200k" },
];

export type VeturaCategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

type Props = {
  veturaId: number;
  categories: VeturaCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function VeturaSearchPanel({
  veturaId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();
  const leafIds = useMemo(() => getVeturaBrandLeafCategoryIds(categories, veturaId), [categories, veturaId]);
  const leafCsv = useMemo(() => leafIds.sort((a, b) => a - b).join(","), [leafIds]);

  const brands = useMemo(() => {
    const bodies = new Set(categories.filter((c) => c.parent_id === veturaId).map((c) => c.id));
    const rows = categories.filter((c) => c.parent_id != null && bodies.has(c.parent_id));
    return [...rows].sort((a, b) => a.name.localeCompare(b.name, "sq"));
  }, [categories, veturaId]);

  const [brandOpen, setBrandOpen] = useState(false);
  const [brandSlug, setBrandSlug] = useState<string | null>(null);
  const [brandCatId, setBrandCatId] = useState<number | null>(null);

  const [modelName, setModelName] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [bodyKey, setBodyKey] = useState<VeturaBodyTypeKey | null>(null);
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [mileMax, setMileMax] = useState<string>("none");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [fuels, setFuels] = useState<Record<string, boolean>>({});

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const selectedBrandName = brandCatId ? brands.find((b) => b.id === brandCatId)?.name ?? null : null;

  const modelsForPicker = useMemo(
    () => getVeturaModelsForPicker({ bodyKey, brandSlug }),
    [bodyKey, brandSlug],
  );

  const selectBodyType = (key: VeturaBodyTypeKey) => {
    const next = bodyKey === key ? null : key;
    setBodyKey(next);
    const nextModels = getVeturaModelsForPicker({ bodyKey: next, brandSlug });
    if (modelName.trim() && !nextModels.includes(modelName.trim())) {
      setModelName("");
    }
    setModelOpen(false);
  };

  const selectModel = (name: string) => {
    setModelName(name);
    setModelOpen(false);
  };

  const modelTriggerLabel = modelName.trim() ? modelName : t.hub_anyModel;

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

    if (yearFrom.trim()) {
      const y = Number(yearFrom);
      if (Number.isFinite(y)) p.year_min = y;
    }
    if (yearTo.trim()) {
      const y = Number(yearTo);
      if (Number.isFinite(y)) p.year_max = y;
    }

    if (mileMax !== "none") {
      const n = Number(mileMax);
      if (Number.isFinite(n)) p.mileage_max = n;
    }

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    const fuelsOn = FUEL_OPTS.filter((f) => fuels[f.stored]).map((f) => f.stored);
    if (fuelsOn.length > 0) {
      p.fuel = fuelsOn.join(",");
    }

    if (bodyKey != null) {
      const chip = BODY_CHIPS.find((b) => b.key === bodyKey);
      if (chip?.elektrikeFilter) {
        p.vehicle_body_filter = "elektrike_hibrid";
      } else if (chip?.stored) {
        p.vehicle_body_type = chip.stored;
      }
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
    bodyKey,
    yearFrom,
    yearTo,
    mileMax,
    priceMin,
    priceMax,
    fuels,
  ]);

  const countLabel =
    previewLoading || previewTotal === null
      ? "…"
      : previewTotal.toLocaleString("de-DE");

  const showLine = fillCount(t.hub_show_vetura, countLabel);

  return (
    <div className="mb-10 rounded-2xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm ring-1 ring-slate-100">
      {/* Body type */}
      <div className="mb-6 pb-6 border-b border-slate-100 space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          {t.hub_body_chip_lbl}
        </Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BODY_CHIPS.map((b) => {
            const active = bodyKey === b.key;
            return (
              <button
                key={b.key}
                type="button"
                aria-pressed={active}
                onClick={() => selectBodyType(b.key)}
                className={cn(
                  "group relative isolate overflow-hidden rounded-xl border-2 text-left outline-none transition-all",
                  "min-h-[108px] focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  active
                    ? "border-blue-600 shadow-md shadow-blue-900/25 ring-2 ring-blue-500/35"
                    : "border-white/70 ring-1 ring-black/10 hover:border-blue-300 hover:shadow-md",
                )}
              >
                <img
                  src={b.pexelsUrl}
                  alt=""
                  draggable={false}
                  loading="lazy"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className={cn(
                    "pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/88 via-black/35 to-transparent",
                    active && "from-blue-950/72 via-blue-900/42 to-blue-900/10",
                  )}
                  aria-hidden
                />
                <div className="relative z-[3] flex h-full min-h-[108px] flex-col justify-end px-2.5 pb-3 pt-8">
                  <span className="w-full px-1 text-center text-sm font-bold leading-tight text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)]">
                    {t[b.labelKey]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5 mb-6">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">{t.hub_vetura_title}</h2>
        <p className="text-sm text-slate-500">
          {t.hub_vetura_sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
        {/* Brand */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Car className="w-3.5 h-3.5" />
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
                      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                        <img
                          src={CAR_DATASET_PNG(brandSlug)}
                          alt=""
                          className="max-h-7 max-w-7 object-contain"
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
                        setModelOpen(false);
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
                            if (modelName && !isVeturaModelAllowedForBody(modelName, bodyKey, slug)) {
                              setModelName("");
                            }
                            setModelOpen(false);
                            setBrandOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              brandCatId === b.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <span className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white border border-slate-100">
                            <img
                              src={CAR_DATASET_PNG(slug)}
                              alt=""
                              className="max-h-[22px] max-w-[22px] object-contain"
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

        {/* Model */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Search className="w-3.5 h-3.5 opacity-70" />
            {t.hub_pickModelLbl}
          </Label>
          <Popover open={modelOpen} onOpenChange={setModelOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={modelOpen}
                className="w-full h-12 justify-between rounded-xl border-slate-200 bg-slate-50/50 hover:bg-white font-normal touch-manipulation"
              >
                <span className={cn("truncate text-left", !modelName.trim() && "text-muted-foreground")}>
                  {modelTriggerLabel}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
              align="start"
            >
              <Command key={bodyKey ?? "all-models"} shouldFilter>
                <CommandInput placeholder={t.hub_model_search_ph} className="h-11" />
                <CommandList className="max-h-[min(60vh,22rem)]">
                  <CommandEmpty>{t.hub_model_none}</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__any__ çdo model"
                      onSelect={() => selectModel("")}
                      className="min-h-12"
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", !modelName.trim() ? "opacity-100" : "opacity-0")}
                      />
                      {t.hub_anyModel}
                    </CommandItem>
                    {modelsForPicker.map((m) => (
                      <CommandItem
                        key={m}
                        value={m}
                        onSelect={() => selectModel(m)}
                        className="min-h-12"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 shrink-0",
                            modelName === m ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="truncate">{m}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Years */}
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

        {/* Mileage */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Gauge className="w-3.5 h-3.5" />
            {t.hub_mile_to}
          </Label>
          <Select value={mileMax} onValueChange={setMileMax}>
            <SelectTrigger className="h-12 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {CAR_MILE_ITEMS.map((row) => (
                <SelectItem key={row.value} value={row.value}>
                  {t[row.labelKey]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Euro className="w-3.5 h-3.5" />
            {t.hub_price_span}
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

      {/* Fuel */}
      <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
        <Label className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <Fuel className="w-3.5 h-3.5" />
          {t.fuelField}
        </Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {FUEL_OPTS.map((f) => (
            <label key={f.stored} className="flex items-center gap-2 cursor-pointer select-none">
              <Checkbox
                checked={!!fuels[f.stored]}
                onCheckedChange={(v) =>
                  setFuels((prev) => ({ ...prev, [f.stored]: v === true }))
                }
              />
              <span className="text-sm font-medium text-slate-700">{t[f.labelKey]}</span>
            </label>
          ))}
        </div>
      </div>

      <Button
        type="button"
        className="mt-8 h-14 w-full rounded-xl bg-[#1565C0] hover:bg-[#13519E] text-base font-semibold shadow-md shadow-blue-900/15"
        onClick={() => onScrollToResults?.()}
      >
        <span className="flex flex-col items-center gap-0.5 leading-tight sm:flex-row sm:gap-2">
          <span>{t.hub_cta_search_vetura}</span>
          <span className="text-sm font-medium opacity-90">
            {showLine}
            {previewLoading ? " …" : ""}
          </span>
        </span>
      </Button>
    </div>
  );
}

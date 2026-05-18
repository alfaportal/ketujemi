import { useEffect, useMemo, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { ChevronDown, Euro, Search, Wrench } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { fillCount } from "@/lib/app-extra-i18n";
import { translateCategory } from "@/lib/category-translations";
import {
  AP_PART_CONDITION_DESC,
  AUTO_PJESE_BRANDS,
  AUTO_PJESE_PART_NAMES,
  getAutoPjeseModelsForBrand,
  AUTO_PJESE_PART_PHOTOS,
  AUTO_PJESE_YEARS,
  getAutoPiesePartTypeCategoryIds,
  getAutoPjeseSubcategoryGroups,
  resolvePartTypeCategoryId,
  type AutoPjeseCategoryRow,
  type AutoPjesePartName,
} from "@/lib/auto-pjese-search-helpers";

type Props = {
  hubId: number;
  categories: AutoPjeseCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function AutoPjeseSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t, market, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const partTypeIds = useMemo(
    () => getAutoPiesePartTypeCategoryIds(categories, hubId),
    [categories, hubId],
  );
  const defaultCsv = useMemo(
    () => [...partTypeIds].sort((a, b) => a - b).join(","),
    [partTypeIds],
  );

  const [partName, setPartName] = useState<AutoPjesePartName | null>(null);
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [partCondition, setPartCondition] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const models = useMemo(() => getAutoPjeseModelsForBrand(brand), [brand]);
  const subcategoryGroups = useMemo(
    () => getAutoPjeseSubcategoryGroups(partName),
    [partName],
  );

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextBrand = e.target.value;
    setBrand(nextBrand);
    setModel("");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  const compatSelectClass =
    "flex min-h-12 h-12 w-full appearance-none rounded-md border border-input bg-transparent pl-3 pr-9 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring touch-manipulation";

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (partName) {
      const cid = resolvePartTypeCategoryId(categories, hubId, partName);
      if (cid) params.category_id = cid;
      else if (defaultCsv) params.category_ids = defaultCsv;
    } else if (defaultCsv) {
      params.category_ids = defaultCsv;
    }

    if (model.trim()) params.vehicle_model = model.trim();

    const searchBits: string[] = [];
    if (brand.trim()) searchBits.push(brand.trim());
    if (partCondition && AP_PART_CONDITION_DESC[partCondition]) {
      searchBits.push(AP_PART_CONDITION_DESC[partCondition]);
    }
    if (subcategory) searchBits.push(subcategory);
    if (searchBits.length) params.search = searchBits.join(" ");

    if (year) {
      const y = parseInt(year, 10);
      if (Number.isFinite(y)) {
        params.year_min = y;
        params.year_max = y;
      }
    }

    const pMin = priceMin.trim() ? parseFloat(priceMin) : NaN;
    const pMax = priceMax.trim() ? parseFloat(priceMax) : NaN;
    if (Number.isFinite(pMin) && pMin >= 0) params.min_price = pMin;
    if (Number.isFinite(pMax) && pMax >= 0) params.max_price = pMax;

    return params;
  };

  useEffect(() => {
    onListingParamsChange(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- live preview for parent listing query
  }, [
    partName,
    subcategory,
    brand,
    model,
    year,
    partCondition,
    priceMin,
    priceMax,
    defaultCsv,
    hubId,
    categories,
    onListingParamsChange,
  ]);

  const handleSearch = () => {
    onListingParamsChange(buildParams());
    onScrollToResults?.();
  };

  const selectPartType = (name: AutoPjesePartName) => {
    if (partName === name) {
      setPartName(null);
      setSubcategory(null);
      return;
    }
    setPartName(name);
    setSubcategory(null);
  };

  const countLabel =
    previewLoading || previewTotal == null
      ? t.ap_search_btn
      : fillCount(t.hub_show_listings_m, String(previewTotal));

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <section className="space-y-3">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Wrench size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ap_sec_parts}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {AUTO_PJESE_PART_NAMES.map((name) => {
            const selected = partName === name;
            const label = translateCategory(name, locale);
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectPartType(name)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border text-left w-full min-h-[120px] transition-all touch-manipulation",
                  selected
                    ? "border-blue-500 ring-2 ring-blue-500/40 shadow-md"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-md",
                )}
              >
                <PartTypeCardMedia name={name} label={label} />
              </button>
            );
          })}
        </div>
      </section>

      {partName && subcategoryGroups.length > 0 && (
        <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-3 sm:p-4">
          <h2 className="text-base font-bold text-gray-900">{t.ap_sec_subcategories}</h2>
          <div className="space-y-4">
            {subcategoryGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const active = subcategory === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSubcategory(active ? null : item)}
                        className={cn(
                          "rounded-full border px-3 py-2 text-left text-xs sm:text-sm font-medium leading-snug transition-colors touch-manipulation max-w-full",
                          active
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50",
                        )}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900">{t.ap_sec_compat}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2 min-w-0">
            <Label htmlFor="ap-compat-brand" className="text-sm font-semibold text-gray-700">
              {t.ap_lbl_brand}
            </Label>
            <div className="relative">
              <select
                id="ap-compat-brand"
                value={brand}
                onChange={handleBrandChange}
                className={compatSelectClass}
              >
                <option value="">{t.ap_ph_brand}</option>
                {AUTO_PJESE_BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                aria-hidden
              />
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            <Label htmlFor="ap-compat-model" className="text-sm font-semibold text-gray-700">
              {t.ap_lbl_model}
            </Label>
            <div className="relative">
              <select
                id="ap-compat-model"
                key={brand || "no-brand"}
                value={model}
                onChange={handleModelChange}
                disabled={!brand}
                className={cn(
                  compatSelectClass,
                  !brand && "cursor-not-allowed opacity-50 bg-muted/30",
                )}
              >
                <option value="">{brand ? t.ap_ph_model : t.ap_ph_model_first}</option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                aria-hidden
              />
            </div>
          </div>
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-semibold text-gray-700">{t.ap_lbl_year}</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-full min-h-12 text-sm">
                <SelectValue placeholder={t.ap_ph_year} />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {AUTO_PJESE_YEARS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="min-h-11 text-sm">
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900">{t.ap_sec_condition}</h2>
        <RadioGroup
          value={partCondition}
          onValueChange={setPartCondition}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2"
        >
          {(
            [
              { value: "new", label: t.ap_cond_new },
              { value: "used_oem", label: t.ap_cond_used },
              { value: "scrap", label: t.ap_cond_scrap },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              htmlFor={`ap-cond-${value}`}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 min-h-12 cursor-pointer transition-colors touch-manipulation",
                partCondition === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-200",
              )}
            >
              <RadioGroupItem id={`ap-cond-${value}`} value={value} className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium text-gray-800">{label}</span>
            </label>
          ))}
        </RadioGroup>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <Euro size={18} className="text-blue-600 shrink-0" aria-hidden />
          {t.ap_price_lbl}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-semibold text-gray-700">{t.hub_fromPh}</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="0"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              className="min-h-12 w-full text-sm"
            />
          </div>
          <div className="space-y-2 min-w-0">
            <Label className="text-sm font-semibold text-gray-700">{t.hub_toPh}</Label>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              placeholder="5000"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              className="min-h-12 w-full text-sm"
            />
          </div>
        </div>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search className="mr-2 h-5 w-5 shrink-0" aria-hidden />
        {countLabel}
      </Button>
    </div>
  );
}

function PartTypeCardMedia({ name, label }: { name: AutoPjesePartName; label: string }) {
  return (
    <div className="relative h-24 sm:h-28 overflow-hidden">
      <img
        src={AUTO_PJESE_PART_PHOTOS[name]}
        alt=""
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent pointer-events-none"
        aria-hidden
      />
      <span className="absolute bottom-2 left-2 right-2 text-white font-bold text-sm leading-snug line-clamp-2 drop-shadow">
        {label}
      </span>
    </div>
  );
}

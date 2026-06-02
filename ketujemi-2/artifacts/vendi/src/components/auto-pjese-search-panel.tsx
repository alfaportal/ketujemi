import { useEffect, useMemo, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { ArrowLeft, Check, ChevronsUpDown, Search, Wrench } from "lucide-react";
import { useLocation, useSearch } from "wouter";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { fillCount } from "@/lib/app-extra-i18n";
import { translateCategory } from "@/lib/category-translations";
import {
  AUTO_PJESE_BRANDS,
  AUTO_PJESE_PART_NAMES,
  AUTO_PJESE_PART_PHOTOS,
  AUTO_PJESE_YEARS,
  getAutoPiesePartTypeCategoryIds,
  getAutoPjeseModelsForBrand,
  getAutoPjeseSubcategoryGroups,
  resolvePartTypeCategoryId,
  type AutoPjeseCategoryRow,
  type AutoPjesePartName,
} from "@/lib/auto-pjese-search-helpers";
import {
  LOKALE_ZYRE_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH,
  type LokaleCityKey,
} from "@/lib/lokale-zyre-search-helpers";

type Props = {
  hubId: number;
  categories: AutoPjeseCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";
const compatSelectClass =
  "flex min-h-12 h-12 w-full appearance-none rounded-xl border border-input bg-transparent pl-3 pr-9 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring touch-manipulation";

const AUTO_PJESE_PAGE_KEY: Record<AutoPjesePartName, string> = {
  "Akumulatorë": "akumulator",
  "Fellne & Goma": "fellne-goma",
  "Drita & LED": "drita-led",
  "Amortizerë & Sustensioni": "amortizere-sustensioni",
  "Motorrë & Pjesë Motorri": "motorr-pjese-motorri",
  "Ftohja & Klima": "ftohja-klima",
  "Pjesë Elektrike & Elektronike": "pjese-elektrike-elektronike",
  "Sisteme Frenimi": "sisteme-frenimi",
  "Pjesë Karoserie": "pjese-karoserie",
  "Vajra & Filtra": "vajra-filtra",
  "Të tjera Pjesë": "te-tjera-pjese",
};

const AUTO_PJESE_KEY_TO_PAGE = Object.fromEntries(
  Object.entries(AUTO_PJESE_PAGE_KEY).map(([name, key]) => [key, name as AutoPjesePartName]),
) as Record<string, AutoPjesePartName>;

const AUTO_PJESE_GROUP_PHOTOS: Record<string, string> = {
  "Akumulatorë|Fuqia (Ah)":
    "https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=900&q=85",
  "Akumulatorë|Teknologjia":
    "https://images.pexels.com/photos/8090158/pexels-photo-8090158.jpeg?auto=compress&cs=tinysrgb&w=900&q=85",
  "Akumulatorë|Aksesorë":
    "https://images.pexels.com/photos/441731/pexels-photo-441731.jpeg?auto=compress&cs=tinysrgb&w=900&q=85",
};

export function AutoPjeseSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const [location, setLocation] = useLocation();
  const urlSearch = useSearch();
  const { t, uiLang } = useMarket();
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
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<LokaleCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");
  const [partInfoGroup, setPartInfoGroup] = useState<string | null>(null);

  const partPageName = useMemo(() => {
    const qs = new URLSearchParams(urlSearch || "");
    const key = qs.get("ap_page") ?? "";
    return AUTO_PJESE_KEY_TO_PAGE[key] ?? null;
  }, [urlSearch]);

  const models = useMemo(() => getAutoPjeseModelsForBrand(brand), [brand]);
  const subcategoryGroups = useMemo(
    () => getAutoPjeseSubcategoryGroups(partName),
    [partName],
  );

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
    if (cityKey) params.location_search = LOKALE_ZYRE_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);
    if (brand.trim()) searchBits.push(brand.trim());
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
    priceMin,
    priceMax,
    cityKey,
    areaZone,
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
    const qs = new URLSearchParams(urlSearch || "");
    qs.set("ap_page", AUTO_PJESE_PAGE_KEY[name]);
    const next = qs.toString();
    setLocation(next ? `${location}?${next}` : location);
    setPartInfoGroup(null);
    return;
    if (partName === name) {
      setPartName(null);
      setSubcategory(null);
      setPartInfoGroup(null);
      return;
    }
    setPartName(name);
    setSubcategory(null);
    setPartInfoGroup(null);
  };

  const countLabel =
    previewLoading || previewTotal == null
      ? t.ap_search_btn
      : fillCount(t.hub_show_listings_m, String(previewTotal));

  const cityLabel = cityKey ? t[LOKALE_ZYRE_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = partName ? translateCategory(partName, locale) : "";
  const isPartPageView = partPageName != null;

  useEffect(() => {
    if (!partPageName) return;
    if (partName !== partPageName) {
      setPartName(partPageName);
      setSubcategory(null);
      setPartInfoGroup(null);
    }
  }, [partPageName, partName]);

  const closePartPage = () => {
    const qs = new URLSearchParams(urlSearch || "");
    qs.delete("ap_page");
    const next = qs.toString();
    setPartInfoGroup(null);
    setLocation(next ? `${location}?${next}` : location);
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      {isPartPageView ? (
        <section className="space-y-3">
          <button
            type="button"
            onClick={closePartPage}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            <ArrowLeft size={16} aria-hidden />
            Kthehu te llojet e pjesëve
          </button>
          <h2 className="text-lg font-black text-gray-900">
            {translateCategory(partPageName ?? "", locale)}
          </h2>
        </section>
      ) : (
      <section className="space-y-3">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Wrench size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ap_sec_parts}
        </h2>
        <CategoryPhotoPickerGrid>
          {AUTO_PJESE_PART_NAMES.map((name) => (
            <CategoryPhotoPickerCard
              key={name}
              layout="grid"
              selected={partName === name}
              onClick={() => selectPartType(name)}
              imageSrc={AUTO_PJESE_PART_PHOTOS[name]}
              label={translateCategory(name, locale)}
            />
          ))}
        </CategoryPhotoPickerGrid>
      </section>
      )}

      {partName && subcategoryGroups.length > 0 ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          {isPartPageView ? (
            <div className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/35 p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {subcategoryGroups.map((group) => {
                  const key = `${partName}|${group.label}`;
                  const photo = AUTO_PJESE_GROUP_PHOTOS[key] ?? AUTO_PJESE_PART_PHOTOS[partName];
                  const selected = partInfoGroup === group.label;
                  return (
                    <button
                      key={`part-page-${group.label}`}
                      type="button"
                      onClick={() => setPartInfoGroup(selected ? null : group.label)}
                      className={cn(
                        "group relative overflow-hidden rounded-xl border bg-white text-left transition-all",
                        selected
                          ? "border-blue-600 ring-2 ring-blue-600/20"
                          : "border-slate-200 hover:border-blue-300",
                      )}
                    >
                      <img
                        src={photo}
                        alt={`${typeTitle} - ${group.label}`}
                        className="h-24 w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                      <p className="absolute bottom-2 left-3 right-3 text-sm font-black text-white truncate">
                        {group.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              {partInfoGroup ? (
                <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    {partInfoGroup}
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {(subcategoryGroups.find((g) => g.label === partInfoGroup)?.items ?? []).map((item) => (
                      <li
                        key={`part-detail-${partInfoGroup}-${item}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm font-medium text-slate-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={cn("space-y-4", isPartPageView && "hidden")}>
            {subcategoryGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const active = subcategory === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setSubcategory(active ? null : item)}
                        className={cn(
                          "w-full rounded-xl border px-3 py-3 min-h-12 text-sm font-semibold text-left transition-colors touch-manipulation",
                          active
                            ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20"
                            : "border-gray-200 bg-white text-gray-800 hover:border-blue-200",
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
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.ap_sec_universal}</h3>

        <div className="space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
          <p className="text-sm font-bold text-gray-900">{t.ap_sec_compat}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="ap-compat-brand" className="text-sm text-gray-600">
                {t.ap_lbl_brand}
              </Label>
              <div className="relative">
                <select
                  id="ap-compat-brand"
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    setModel("");
                  }}
                  className={compatSelectClass}
                >
                  <option value="">{t.ap_ph_brand}</option>
                  {AUTO_PJESE_BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronsUpDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                  aria-hidden
                />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="ap-compat-model" className="text-sm text-gray-600">
                {t.ap_lbl_model}
              </Label>
              <div className="relative">
                <select
                  id="ap-compat-model"
                  key={brand || "no-brand"}
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
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
                <ChevronsUpDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50"
                  aria-hidden
                />
              </div>
            </div>
            <div className="space-y-2 min-w-0">
              <Label className="text-sm text-gray-600">{t.ap_lbl_year}</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className={cn("w-full font-normal", inputClass)}>
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
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-bold text-gray-900">{t.ap_sec_location}</p>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ap_city_lbl}</span>
              <Popover open={cityOpen} onOpenChange={setCityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityOpen}
                    className={cn(
                      "w-full justify-between font-normal rounded-xl",
                      inputClass,
                      !cityKey && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{cityKey ? cityLabel : t.ap_city_ph}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder={t.ap_city_search_ph} className="h-11" />
                    <CommandList>
                      <CommandEmpty>{t.ap_city_none}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__any__"
                          onSelect={() => {
                            setCityKey("");
                            setCityOpen(false);
                          }}
                          className="min-h-11"
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", !cityKey ? "opacity-100" : "opacity-0")}
                          />
                          {t.ap_city_any}
                        </CommandItem>
                        {LOKALE_ZYRE_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${LOKALE_ZYRE_CITY_SEARCH[ck]} ${t[LOKALE_ZYRE_CITY_LABEL_KEY[ck]]}`}
                            onSelect={() => {
                              setCityKey(ck);
                              setCityOpen(false);
                            }}
                            className="min-h-11"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                cityKey === ck ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {t[LOKALE_ZYRE_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ap-area" className="text-sm text-gray-600">
                {t.ap_area_lbl}
              </Label>
              <Input
                id="ap-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.ap_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <p className="text-sm font-bold text-gray-900">{t.ap_price_lbl}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ap_from}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="0"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ap_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                placeholder="5000"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {countLabel}
      </Button>
    </div>
  );
}

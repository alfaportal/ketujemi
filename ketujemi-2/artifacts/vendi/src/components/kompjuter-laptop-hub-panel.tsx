import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerRow,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import {
  EP_BRAND_LABEL_KEY,
  EP_BRAND_MODEL_SEARCH,
  EP_BRAND_SEARCH,
  EP_CITY_KEYS,
  EP_CITY_LABEL_KEY,
  EP_CITY_SEARCH,
  EP_WARRANTY_SEARCH,
  getEpBrandModelsForBrand,
  type EpBrandKey,
  type EpBrandModelKey,
  type EpCityKey,
} from "@/lib/tv-elektronike-search-helpers";
import {
  KOMPJUTER_FILTER_LABEL_KEY,
  KOMPJUTER_FILTER_SEARCH,
  KOMPJUTER_SUB_LABEL_KEY,
  KOMPJUTER_SUB_SEARCH,
  KOMPJUTER_TYPE_FILTER_GROUPS,
  KOMPJUTER_TYPE_PHOTOS,
  KOMPJUTER_TYPE_SUB_ITEMS,
  isKompjuterHubTypeName,
  type KompjuterFilterKey,
  type KompjuterSubItemKey,
} from "@/lib/kompjuter-laptop-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

/** Brand order for category 8 dropdown */
const KOMPJUTER_BRAND_ORDER: EpBrandKey[] = [
  "apple",
  "asus",
  "hp",
  "lenovo",
  "msi",
  "acer",
  "dell",
  "huawei",
  "microsoft",
  "razer",
];

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      {children}
    </div>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full border px-3 py-2 text-xs font-semibold leading-tight touch-manipulation transition-colors",
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
          : "border-gray-200 bg-white text-gray-800 hover:border-blue-200 hover:bg-blue-50",
      )}
    >
      {children}
    </button>
  );
}

type HubTypeRow = {
  id: number;
  name: string;
  image_url?: string | null;
};

type Props = {
  hubId: number;
  types: HubTypeRow[];
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function KompjuterLaptopHubPanel({
  hubId,
  types,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();
  const [brand, setBrand] = useState<EpBrandKey | "">("");
  const [model, setModel] = useState<EpBrandModelKey | "">("");
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [typeSub, setTypeSub] = useState<KompjuterSubItemKey | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<KompjuterFilterKey>>(() => new Set());
  const [hasWarranty, setHasWarranty] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<EpCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");
  const subSectionRef = useRef<HTMLDivElement | null>(null);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const selectedType = types.find((row) => row.id === selectedTypeId) ?? null;
  const selectedTypeName =
    selectedType && isKompjuterHubTypeName(selectedType.name) ? selectedType.name : null;

  const subItems = selectedTypeName ? KOMPJUTER_TYPE_SUB_ITEMS[selectedTypeName] : [];
  const filterGroups = selectedTypeName ? KOMPJUTER_TYPE_FILTER_GROUPS[selectedTypeName] : [];

  const availableModels = useMemo(() => getEpBrandModelsForBrand(brand), [brand]);

  const toggleFilter = (key: KompjuterFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectType = (row: HubTypeRow) => {
    if (selectedTypeId === row.id) {
      setSelectedTypeId(null);
      setTypeSub(null);
      setActiveFilters(new Set());
    } else {
      setSelectedTypeId(row.id);
      setTypeSub(null);
      setActiveFilters(new Set());
      if (isKompjuterHubTypeName(row.name)) {
        window.requestAnimationFrame(() => {
          subSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
  };

  const typePhoto = (name: string) => {
    if (isKompjuterHubTypeName(name)) return KOMPJUTER_TYPE_PHOTOS[name];
    return KOMPJUTER_TYPE_PHOTOS.Laptopë;
  };

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      category_id: selectedTypeId ?? hubId,
      page: 1,
      limit: 20,
    };

    if (cityKey) p.location_search = EP_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);
    if (brand) searchBits.push(EP_BRAND_SEARCH[brand]);
    if (model) searchBits.push(EP_BRAND_MODEL_SEARCH[model]);
    if (typeSub) searchBits.push(KOMPJUTER_SUB_SEARCH[typeSub]);
    for (const fk of activeFilters) searchBits.push(KOMPJUTER_FILTER_SEARCH[fk]);
    if (hasWarranty) searchBits.push(EP_WARRANTY_SEARCH);
    if (searchBits.length) p.search = searchBits.join(" ");

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
    if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;

    return p;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      callbackRef.current(buildParams());
    }, 400);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced live filter
  }, [
    hubId,
    brand,
    model,
    selectedTypeId,
    typeSub,
    activeFilters,
    hasWarranty,
    priceMin,
    priceMax,
    cityKey,
    areaZone,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  const modelLabel = model ? EP_BRAND_MODEL_SEARCH[model] : "";
  const cityLabel = cityKey ? t[EP_CITY_LABEL_KEY[cityKey]] : "";

  useEffect(() => {
    if (model && !availableModels.includes(model)) setModel("");
  }, [model, availableModels]);

  useEffect(() => {
    if (typeSub && selectedTypeName && !subItems.includes(typeSub)) setTypeSub(null);
  }, [typeSub, selectedTypeName, subItems]);

  useEffect(() => {
    setActiveFilters((prev) => {
      const allowed = new Set(filterGroups.flatMap((g) => g.optionKeys));
      const next = new Set([...prev].filter((k) => allowed.has(k)));
      return next.size === prev.size ? prev : next;
    });
  }, [filterGroups]);

  return (
    <div className="mb-8 space-y-8">
      {types.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            {t.cat_sectionTypes}
          </h3>
          <CategoryPhotoPickerRow>
            {types.map((row) => (
              <CategoryPhotoPickerCard
                key={row.id}
                selected={selectedTypeId === row.id}
                onClick={() => selectType(row)}
                imageSrc={typePhoto(row.name)}
                label={row.name}
              />
            ))}
          </CategoryPhotoPickerRow>
        </div>
      )}

      {selectedTypeName && subItems.length > 0 ? (
        <div ref={subSectionRef} className="space-y-3 scroll-mt-24">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            {t.kl_sub_sec}
          </h3>
          <div className="flex flex-wrap gap-2">
            {subItems.map((itemKey) => (
              <ChipButton
                key={itemKey}
                active={typeSub === itemKey}
                onClick={() => setTypeSub(typeSub === itemKey ? null : itemKey)}
              >
                {t[KOMPJUTER_SUB_LABEL_KEY[itemKey]]}
              </ChipButton>
            ))}
          </div>
        </div>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        {selectedTypeName && filterGroups.length > 0
          ? filterGroups.map((group) => (
              <FilterSection key={group.titleKey} title={t[group.titleKey]}>
                <div className="flex flex-wrap gap-2">
                  {group.optionKeys.map((fk) => (
                    <ChipButton
                      key={fk}
                      active={activeFilters.has(fk)}
                      onClick={() => toggleFilter(fk)}
                    >
                      {t[KOMPJUTER_FILTER_LABEL_KEY[fk]]}
                    </ChipButton>
                  ))}
                </div>
              </FilterSection>
            ))
          : null}

        <FilterSection title={t.ep_sec_brand}>
          <Select
            value={brand || "__all__"}
            onValueChange={(v) => {
              setBrand(v === "__all__" ? "" : (v as EpBrandKey));
              setModel("");
            }}
          >
            <SelectTrigger className={cn("w-full font-normal", inputClass)}>
              <SelectValue placeholder={t.tel_brand_ph}>
                {brand ? t[EP_BRAND_LABEL_KEY[brand]] : t.tel_brand_any}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[min(70vh,320px)]">
              <SelectItem value="__all__" className="min-h-11">
                {t.tel_brand_any}
              </SelectItem>
              {KOMPJUTER_BRAND_ORDER.map((key) => (
                <SelectItem key={key} value={key} className="min-h-11">
                  {t[EP_BRAND_LABEL_KEY[key]]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t.ep_sec_model}>
          <Select
            key={brand || "__all__"}
            value={model || "__all__"}
            onValueChange={(v) => setModel(v === "__all__" ? "" : (v as EpBrandModelKey))}
          >
            <SelectTrigger className={cn("w-full font-normal", inputClass)}>
              <SelectValue placeholder={t.ep_model_ph}>
                {model ? modelLabel : t.ep_model_all}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[min(70vh,320px)]">
              <SelectItem value="__all__" className="min-h-11">
                {t.ep_model_all}
              </SelectItem>
              {availableModels.map((mk) => (
                <SelectItem key={mk} value={mk} className="min-h-11">
                  {EP_BRAND_MODEL_SEARCH[mk]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterSection>

        <FilterSection title={t.ep_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ep_from}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ep_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="2000"
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.ep_sec_location}>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={14} className="text-blue-600" aria-hidden />
                {t.lz_city_lbl}
              </span>
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
                    <span className="truncate">{cityKey ? cityLabel : t.lz_city_ph}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder={t.lz_city_search_ph} className="h-11" />
                    <CommandList>
                      <CommandEmpty>{t.lz_city_none}</CommandEmpty>
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
                          {t.lz_city_any}
                        </CommandItem>
                        {EP_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${EP_CITY_SEARCH[ck]} ${t[EP_CITY_LABEL_KEY[ck]]}`}
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
                            {t[EP_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kl-area" className="text-sm text-gray-600">
                {t.ep_area_lbl}
              </Label>
              <Input
                id="kl-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.ep_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.ep_sec_extras}>
          <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
            <Checkbox
              checked={hasWarranty}
              onCheckedChange={(c) => setHasWarranty(c === true)}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium text-gray-800">{t.ep_warranty}</span>
          </label>
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.ep_search_btn_laptop}
      </Button>

    </div>
  );
}

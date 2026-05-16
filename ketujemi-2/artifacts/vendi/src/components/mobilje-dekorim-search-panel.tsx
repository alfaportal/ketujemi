import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Check, ChevronsUpDown, Euro, MapPin, Search, Sofa } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import {
  MD_BED_SIZE_KEYS,
  MD_BED_SIZE_LABEL_KEY,
  MD_BED_SIZE_SEARCH,
  MD_BED_TYPE_KEYS,
  MD_BED_TYPE_LABEL_KEY,
  MD_BED_TYPE_SEARCH,
  MD_CITY_KEYS,
  MD_CITY_LABEL_KEY,
  MD_CITY_SEARCH,
  MD_CONDITION_KEYS,
  MD_CONDITION_LABEL_KEY,
  MD_CONDITION_SEARCH,
  MD_GARDEN_MAT_KEYS,
  MD_GARDEN_MAT_LABEL_KEY,
  MD_GARDEN_MAT_SEARCH,
  MD_GARDEN_TYPE_KEYS,
  MD_GARDEN_TYPE_LABEL_KEY,
  MD_GARDEN_TYPE_SEARCH,
  MD_KITCHEN_MAT_KEYS,
  MD_KITCHEN_MAT_LABEL_KEY,
  MD_KITCHEN_MAT_SEARCH,
  MD_KITCHEN_TYPE_KEYS,
  MD_KITCHEN_TYPE_LABEL_KEY,
  MD_KITCHEN_TYPE_SEARCH,
  MD_LIGHT_TECH_KEYS,
  MD_LIGHT_TECH_LABEL_KEY,
  MD_LIGHT_TECH_SEARCH,
  MD_LIGHT_TYPE_KEYS,
  MD_LIGHT_TYPE_LABEL_KEY,
  MD_LIGHT_TYPE_SEARCH,
  MD_RUG_TYPE_KEYS,
  MD_RUG_TYPE_LABEL_KEY,
  MD_RUG_TYPE_SEARCH,
  MD_SAL_CAP_KEYS,
  MD_SAL_CAP_LABEL_KEY,
  MD_SAL_CAP_SEARCH,
  MD_SAL_FEATURE_KEYS,
  MD_SAL_FEATURE_LABEL_KEY,
  MD_SAL_FEATURE_SEARCH,
  MD_SAL_MAT_KEYS,
  MD_SAL_MAT_LABEL_KEY,
  MD_SAL_MAT_SEARCH,
  MD_SAL_TYPE_KEYS,
  MD_SAL_TYPE_LABEL_KEY,
  MD_SAL_TYPE_SEARCH,
  MD_TYPE_KEYS,
  MD_TYPE_LABEL_KEY,
  MD_TYPE_PHOTOS,
  getMobiljeDekorimLeafCategoryIds,
  resolveMobiljeTypeCategoryId,
  type MdBedSizeKey,
  type MdBedTypeKey,
  type MdCityKey,
  type MdConditionKey,
  type MdGardenMatKey,
  type MdGardenTypeKey,
  type MdKitchenMatKey,
  type MdKitchenTypeKey,
  type MdLightTechKey,
  type MdLightTypeKey,
  type MdRugTypeKey,
  type MdSalCapKey,
  type MdSalFeatureKey,
  type MdSalMatKey,
  type MdSalTypeKey,
  type MdTypeKey,
  type MobiljeDekorimCategoryRow,
} from "@/lib/mobilje-dekorim-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: MobiljeDekorimCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

function ChipButton({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border px-3 py-3 min-h-12 text-sm font-semibold text-left transition-colors touch-manipulation",
        selected
          ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/20"
          : "border-gray-200 bg-white text-gray-800 hover:border-blue-200",
        className,
      )}
    >
      {children}
    </button>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      {children}
    </div>
  );
}

export function MobiljeDekorimSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getMobiljeDekorimLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<MdTypeKey | null>(null);
  const [salType, setSalType] = useState<MdSalTypeKey | "">("");
  const [salMat, setSalMat] = useState<MdSalMatKey | "">("");
  const [salCap, setSalCap] = useState<MdSalCapKey | "">("");
  const [salFeatures, setSalFeatures] = useState<Record<MdSalFeatureKey, boolean>>({
    sleep: false,
    storage: false,
  });
  const [bedType, setBedType] = useState<MdBedTypeKey | "">("");
  const [bedSize, setBedSize] = useState<MdBedSizeKey | "">("");
  const [lightType, setLightType] = useState<MdLightTypeKey | "">("");
  const [lightTech, setLightTech] = useState<MdLightTechKey | "">("");
  const [kitchenType, setKitchenType] = useState<MdKitchenTypeKey | "">("");
  const [kitchenMat, setKitchenMat] = useState<MdKitchenMatKey | "">("");
  const [gardenType, setGardenType] = useState<MdGardenTypeKey | "">("");
  const [gardenMat, setGardenMat] = useState<MdGardenMatKey | "">("");
  const [rugType, setRugType] = useState<MdRugTypeKey | "">("");
  const [rugDimensions, setRugDimensions] = useState("");
  const [condition, setCondition] = useState<MdConditionKey | "">("");
  const [transport, setTransport] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<MdCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const resetSubFilters = () => {
    setSalType("");
    setSalMat("");
    setSalCap("");
    setSalFeatures({ sleep: false, storage: false });
    setBedType("");
    setBedSize("");
    setLightType("");
    setLightTech("");
    setKitchenType("");
    setKitchenMat("");
    setGardenType("");
    setGardenMat("");
    setRugType("");
    setRugDimensions("");
  };

  const selectType = (key: MdTypeKey) => {
    if (typeKey === key) {
      setTypeKey(null);
      resetSubFilters();
    } else {
      setTypeKey(key);
      resetSubFilters();
    }
  };

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const toggleChip = <T extends string>(
    current: T | "",
    value: T,
    set: Dispatch<SetStateAction<T | "">>,
  ) => {
    set(current === value ? "" : value);
  };

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: leafCsv,
    };

    if (typeKey) {
      const cid = resolveMobiljeTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = MD_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "sallone_ulese") {
      if (salType) searchBits.push(MD_SAL_TYPE_SEARCH[salType]);
      if (salMat) searchBits.push(MD_SAL_MAT_SEARCH[salMat]);
      if (salCap) searchBits.push(MD_SAL_CAP_SEARCH[salCap]);
      for (const k of MD_SAL_FEATURE_KEYS) {
        if (salFeatures[k]) searchBits.push(MD_SAL_FEATURE_SEARCH[k]);
      }
    } else if (typeKey === "dhoma_gjumit") {
      if (bedType) searchBits.push(MD_BED_TYPE_SEARCH[bedType]);
      if (bedSize) searchBits.push(MD_BED_SIZE_SEARCH[bedSize]);
    } else if (typeKey === "ndricim") {
      if (lightType) searchBits.push(MD_LIGHT_TYPE_SEARCH[lightType]);
      if (lightTech) searchBits.push(MD_LIGHT_TECH_SEARCH[lightTech]);
    } else if (typeKey === "kuzhina") {
      if (kitchenType) searchBits.push(MD_KITCHEN_TYPE_SEARCH[kitchenType]);
      if (kitchenMat) searchBits.push(MD_KITCHEN_MAT_SEARCH[kitchenMat]);
    } else if (typeKey === "kopsht_terasa") {
      if (gardenType) searchBits.push(MD_GARDEN_TYPE_SEARCH[gardenType]);
      if (gardenMat) searchBits.push(MD_GARDEN_MAT_SEARCH[gardenMat]);
    } else if (typeKey === "tepihe_perde") {
      if (rugType) searchBits.push(MD_RUG_TYPE_SEARCH[rugType]);
      const dims = rugDimensions.trim();
      if (dims) searchBits.push(dims);
    }

    if (condition) searchBits.push(MD_CONDITION_SEARCH[condition]);
    if (transport) searchBits.push("Transport");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced live preview
  }, [
    leafCsv,
    hubId,
    typeKey,
    salType,
    salMat,
    salCap,
    salFeatures,
    bedType,
    bedSize,
    lightType,
    lightTech,
    kitchenType,
    kitchenMat,
    gardenType,
    gardenMat,
    rugType,
    rugDimensions,
    condition,
    transport,
    priceMin,
    priceMax,
    cityKey,
    areaZone,
    categories,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  const cityLabel = cityKey ? t[MD_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[MD_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Sofa size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.md_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.md_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.md_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {MD_TYPE_KEYS.map((key) => {
            const selected = typeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectType(key)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border text-left transition-all min-h-[7.5rem] touch-manipulation",
                  selected
                    ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-md",
                )}
              >
                <img
                  src={MD_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[MD_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "sallone_ulese" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {MD_SAL_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={salType === k}
                  onClick={() => toggleChip(salType, k, setSalType)}
                >
                  {t[MD_SAL_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {MD_SAL_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={salMat === k}
                  onClick={() => toggleChip(salMat, k, setSalMat)}
                >
                  {t[MD_SAL_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_capacity}>
            <div className="grid grid-cols-2 gap-2">
              {MD_SAL_CAP_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={salCap === k}
                  onClick={() => toggleChip(salCap, k, setSalCap)}
                >
                  {t[MD_SAL_CAP_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {MD_SAL_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={salFeatures[k]}
                    onCheckedChange={(c) =>
                      setSalFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[MD_SAL_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "dhoma_gjumit" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {MD_BED_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={bedType === k}
                  onClick={() => toggleChip(bedType, k, setBedType)}
                >
                  {t[MD_BED_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_dimensions}>
            <div className="grid grid-cols-2 gap-2">
              {MD_BED_SIZE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={bedSize === k}
                  onClick={() => toggleChip(bedSize, k, setBedSize)}
                >
                  {t[MD_BED_SIZE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "ndricim" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_kind}>
            <div className="grid grid-cols-1 gap-2">
              {MD_LIGHT_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={lightType === k}
                  onClick={() => toggleChip(lightType, k, setLightType)}
                >
                  {t[MD_LIGHT_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_technology}>
            <div className="grid grid-cols-2 gap-2">
              {MD_LIGHT_TECH_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={lightTech === k}
                  onClick={() => toggleChip(lightTech, k, setLightTech)}
                >
                  {t[MD_LIGHT_TECH_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "kuzhina" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_type}>
            <div className="grid grid-cols-1 gap-2">
              {MD_KITCHEN_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={kitchenType === k}
                  onClick={() => toggleChip(kitchenType, k, setKitchenType)}
                >
                  {t[MD_KITCHEN_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {MD_KITCHEN_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={kitchenMat === k}
                  onClick={() => toggleChip(kitchenMat, k, setKitchenMat)}
                >
                  {t[MD_KITCHEN_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "kopsht_terasa" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {MD_GARDEN_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={gardenType === k}
                  onClick={() => toggleChip(gardenType, k, setGardenType)}
                >
                  {t[MD_GARDEN_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {MD_GARDEN_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={gardenMat === k}
                  onClick={() => toggleChip(gardenMat, k, setGardenMat)}
                >
                  {t[MD_GARDEN_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "tepihe_perde" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.md_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {MD_RUG_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={rugType === k}
                  onClick={() => toggleChip(rugType, k, setRugType)}
                >
                  {t[MD_RUG_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.md_sec_dimensions}>
            <Input
              value={rugDimensions}
              onChange={(e) => setRugDimensions(e.target.value)}
              placeholder={t.md_dims_ph}
              className={inputClass}
            />
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.md_sec_universal}</h3>

        <FilterSection title={t.md_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {MD_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[MD_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.md_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.md_from}</span>
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
              <span className="text-sm text-gray-600">{t.md_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="5000"
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.md_sec_location}>
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
                        {MD_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${MD_CITY_SEARCH[ck]} ${t[MD_CITY_LABEL_KEY[ck]]}`}
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
                            {t[MD_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="md-area" className="text-sm text-gray-600">
                {t.md_area_lbl}
              </Label>
              <Input
                id="md-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.md_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.md_sec_delivery}>
          <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
            <Checkbox
              checked={transport}
              onCheckedChange={(c) => setTransport(c === true)}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium text-gray-800">{t.md_filter_transport}</span>
          </label>
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.md_search_btn}
      </Button>
    </div>
  );
}

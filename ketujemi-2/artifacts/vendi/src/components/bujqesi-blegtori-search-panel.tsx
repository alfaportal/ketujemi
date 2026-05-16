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
import { Check, ChevronsUpDown, MapPin, Search, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  BB_CITY_KEYS,
  BB_CITY_LABEL_KEY,
  BB_CITY_SEARCH,
  BB_CONDITION_KEYS,
  BB_CONDITION_LABEL_KEY,
  BB_CONDITION_SEARCH,
  BB_FEED_KEYS,
  BB_FEED_LABEL_KEY,
  BB_FEED_SEARCH,
  BB_LIVESTOCK_KEYS,
  BB_LIVESTOCK_LABEL_KEY,
  BB_LIVESTOCK_SEARCH,
  BB_MACH_TYPE_KEYS,
  BB_MACH_TYPE_LABEL_KEY,
  BB_MACH_TYPE_SEARCH,
  BB_POULTRY_AGE_KEYS,
  BB_POULTRY_AGE_LABEL_KEY,
  BB_POULTRY_AGE_SEARCH,
  BB_POULTRY_KEYS,
  BB_POULTRY_LABEL_KEY,
  BB_POULTRY_SEARCH,
  BB_POWER_KEYS,
  BB_POWER_LABEL_KEY,
  BB_POWER_SEARCH,
  BB_PURPOSE_KEYS,
  BB_PURPOSE_LABEL_KEY,
  BB_PURPOSE_SEARCH,
  BB_QTY_UNIT_KEYS,
  BB_QTY_UNIT_LABEL_KEY,
  BB_QTY_UNIT_SEARCH,
  BB_SEED_KEYS,
  BB_SEED_LABEL_KEY,
  BB_SEED_SEARCH,
  BB_TYPE_KEYS,
  BB_TYPE_LABEL_KEY,
  BB_TYPE_PHOTOS,
  getBujqesiBlegtoriLeafCategoryIds,
  resolveBujqesiBlegtoriTypeCategoryId,
  type BbCityKey,
  type BbConditionKey,
  type BbFeedKey,
  type BbLivestockKey,
  type BbMachTypeKey,
  type BbPoultryAgeKey,
  type BbPoultryKey,
  type BbPowerKey,
  type BbPurposeKey,
  type BbQtyUnitKey,
  type BbSeedKey,
  type BbTypeKey,
  type BujqesiBlegtoriCategoryRow,
} from "@/lib/bujqesi-blegtori-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: BujqesiBlegtoriCategoryRow[];
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

function KindChips<T extends string>({
  keys,
  labelKey,
  selected,
  onSelect,
  t,
}: {
  keys: readonly T[];
  labelKey: Record<T, string>;
  selected: T | "";
  onSelect: Dispatch<SetStateAction<T | "">>;
  t: Record<string, string>;
}) {
  const toggle = (value: T) => {
    onSelect(selected === value ? "" : value);
  };
  return (
    <div className="grid grid-cols-2 gap-2">
      {keys.map((k) => (
        <ChipButton key={k} selected={selected === k} onClick={() => toggle(k)}>
          {t[labelKey[k]]}
        </ChipButton>
      ))}
    </div>
  );
}

export function BujqesiBlegtoriSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getBujqesiBlegtoriLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<BbTypeKey | null>(null);
  const [machType, setMachType] = useState<BbMachTypeKey | "">("");
  const [power, setPower] = useState<BbPowerKey | "">("");
  const [prodYear, setProdYear] = useState("");
  const [livestockKind, setLivestockKind] = useState<BbLivestockKey | "">("");
  const [breed, setBreed] = useState("");
  const [purpose, setPurpose] = useState<BbPurposeKey | "">("");
  const [poultryKind, setPoultryKind] = useState<BbPoultryKey | "">("");
  const [poultryAge, setPoultryAge] = useState<BbPoultryAgeKey | "">("");
  const [feedType, setFeedType] = useState<BbFeedKey | "">("");
  const [seedType, setSeedType] = useState<BbSeedKey | "">("");
  const [condition, setCondition] = useState<BbConditionKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<BbCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");
  const [qtyValue, setQtyValue] = useState("");
  const [qtyUnit, setQtyUnit] = useState<BbQtyUnitKey | "">("");

  const resetSubFilters = () => {
    setMachType("");
    setPower("");
    setProdYear("");
    setLivestockKind("");
    setBreed("");
    setPurpose("");
    setPoultryKind("");
    setPoultryAge("");
    setFeedType("");
    setSeedType("");
  };

  const selectType = (key: BbTypeKey) => {
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
      const cid = resolveBujqesiBlegtoriTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = BB_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "makineri") {
      if (machType) searchBits.push(BB_MACH_TYPE_SEARCH[machType]);
      if (power) searchBits.push(BB_POWER_SEARCH[power]);
      const year = prodYear.trim();
      if (year) searchBits.push(`Viti ${year}`);
    } else if (typeKey === "bageti") {
      if (livestockKind) searchBits.push(BB_LIVESTOCK_SEARCH[livestockKind]);
      const breedVal = breed.trim();
      if (breedVal) searchBits.push(breedVal);
      if (purpose) searchBits.push(BB_PURPOSE_SEARCH[purpose]);
    } else if (typeKey === "shpeze") {
      if (poultryKind) searchBits.push(BB_POULTRY_SEARCH[poultryKind]);
      if (poultryAge) searchBits.push(BB_POULTRY_AGE_SEARCH[poultryAge]);
    } else if (typeKey === "ushqim_kafshet") {
      if (feedType) searchBits.push(BB_FEED_SEARCH[feedType]);
    } else if (typeKey === "farera_plehra") {
      if (seedType) searchBits.push(BB_SEED_SEARCH[seedType]);
    }

    if (condition) searchBits.push(BB_CONDITION_SEARCH[condition]);

    const qty = qtyValue.trim();
    if (qty) {
      const unitLabel = qtyUnit ? BB_QTY_UNIT_SEARCH[qtyUnit] : "";
      searchBits.push(unitLabel ? `${qty} ${unitLabel}` : qty);
    }

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
    machType,
    power,
    prodYear,
    livestockKind,
    breed,
    purpose,
    poultryKind,
    poultryAge,
    feedType,
    seedType,
    condition,
    priceMin,
    priceMax,
    cityKey,
    areaZone,
    qtyValue,
    qtyUnit,
    categories,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  const cityLabel = cityKey ? t[BB_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[BB_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Wheat size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.bb_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.bb_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.bb_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {BB_TYPE_KEYS.map((key) => {
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
                  src={BB_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[BB_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "makineri" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.bb_sec_type}>
            <KindChips
              keys={BB_MACH_TYPE_KEYS}
              labelKey={BB_MACH_TYPE_LABEL_KEY}
              selected={machType}
              onSelect={setMachType}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.bb_sec_power}>
            <div className="grid grid-cols-2 gap-2">
              {BB_POWER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={power === k}
                  onClick={() => toggleChip(power, k, setPower)}
                >
                  {t[BB_POWER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.bb_sec_year}>
            <Input
              type="number"
              inputMode="numeric"
              min={1950}
              max={new Date().getFullYear() + 1}
              value={prodYear}
              onChange={(e) => setProdYear(e.target.value)}
              placeholder={t.bb_year_ph}
              className={inputClass}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "bageti" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.bb_sec_kind}>
            <KindChips
              keys={BB_LIVESTOCK_KEYS}
              labelKey={BB_LIVESTOCK_LABEL_KEY}
              selected={livestockKind}
              onSelect={setLivestockKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.bb_sec_breed}>
            <Input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder={t.bb_breed_ph}
              className={inputClass}
            />
          </FilterSection>
          <FilterSection title={t.bb_sec_purpose}>
            <div className="grid grid-cols-2 gap-2">
              {BB_PURPOSE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={purpose === k}
                  onClick={() => toggleChip(purpose, k, setPurpose)}
                >
                  {t[BB_PURPOSE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "shpeze" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.bb_sec_kind}>
            <KindChips
              keys={BB_POULTRY_KEYS}
              labelKey={BB_POULTRY_LABEL_KEY}
              selected={poultryKind}
              onSelect={setPoultryKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.bb_sec_age}>
            <div className="grid grid-cols-2 gap-2">
              {BB_POULTRY_AGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={poultryAge === k}
                  onClick={() => toggleChip(poultryAge, k, setPoultryAge)}
                >
                  {t[BB_POULTRY_AGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "ushqim_kafshet" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.bb_sec_type}>
            <KindChips
              keys={BB_FEED_KEYS}
              labelKey={BB_FEED_LABEL_KEY}
              selected={feedType}
              onSelect={setFeedType}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "farera_plehra" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.bb_sec_type}>
            <KindChips
              keys={BB_SEED_KEYS}
              labelKey={BB_SEED_LABEL_KEY}
              selected={seedType}
              onSelect={setSeedType}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.bb_sec_universal}</h3>

        <FilterSection title={t.bb_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {BB_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[BB_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.bb_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.bb_from}</span>
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
              <span className="text-sm text-gray-600">{t.bb_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="500"
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.bb_sec_location}>
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
                        {BB_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${BB_CITY_SEARCH[ck]} ${t[BB_CITY_LABEL_KEY[ck]]}`}
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
                            {t[BB_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bb-area" className="text-sm text-gray-600">
                {t.bb_area_lbl}
              </Label>
              <Input
                id="bb-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.bb_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.bb_sec_qty}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="text-sm text-gray-600">{t.bb_qty_lbl}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={qtyValue}
                onChange={(e) => setQtyValue(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <span className="text-sm text-gray-600">{t.bb_unit_lbl}</span>
              <div className="grid grid-cols-3 gap-2">
                {BB_QTY_UNIT_KEYS.map((k) => (
                  <ChipButton
                    key={k}
                    selected={qtyUnit === k}
                    onClick={() => toggleChip(qtyUnit, k, setQtyUnit)}
                    className="text-center justify-center px-2"
                  >
                    {t[BB_QTY_UNIT_LABEL_KEY[k]]}
                  </ChipButton>
                ))}
              </div>
            </div>
          </div>
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.bb_search_btn}
      </Button>
    </div>
  );
}

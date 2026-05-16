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
import { Check, ChevronsUpDown, Euro, MapPin, Search, Shirt } from "lucide-react";
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
  RK_ACC_TYPE_KEYS,
  RK_ACC_TYPE_LABEL_KEY,
  RK_ACC_TYPE_SEARCH,
  RK_CITY_KEYS,
  RK_CITY_LABEL_KEY,
  RK_CITY_SEARCH,
  RK_CLOTH_MAT_KEYS,
  RK_CLOTH_MAT_LABEL_KEY,
  RK_CLOTH_MAT_SEARCH,
  RK_CONDITION_KEYS,
  RK_CONDITION_LABEL_KEY,
  RK_CONDITION_SEARCH,
  RK_GENDER_KEYS,
  RK_GENDER_LABEL_KEY,
  RK_GENDER_SEARCH,
  RK_KID_AGE_GROUPS,
  RK_KID_GENDER_KEYS,
  RK_KID_GENDER_LABEL_KEY,
  RK_KID_GENDER_SEARCH,
  RK_KID_TYPE_KEYS,
  RK_KID_TYPE_LABEL_KEY,
  RK_KID_TYPE_SEARCH,
  RK_MEN_SIZE_KEYS,
  RK_MEN_SIZE_LABEL_KEY,
  RK_MEN_TYPE_KEYS,
  RK_MEN_TYPE_LABEL_KEY,
  RK_MEN_TYPE_SEARCH,
  RK_SHOE_MAT_KEYS,
  RK_SHOE_MAT_LABEL_KEY,
  RK_SHOE_MAT_SEARCH,
  RK_SHOE_SIZE_KEYS,
  RK_SHOE_SIZE_LABEL_KEY,
  RK_SHOE_TYPE_KEYS,
  RK_SHOE_TYPE_LABEL_KEY,
  RK_SHOE_TYPE_SEARCH,
  RK_TYPE_KEYS,
  RK_TYPE_LABEL_KEY,
  RK_TYPE_PHOTOS,
  RK_UNIVERSAL_CHECK_KEYS,
  RK_UNIVERSAL_CHECK_LABEL_KEY,
  RK_UNIVERSAL_CHECK_SEARCH,
  RK_WOMEN_SIZE_KEYS,
  RK_WOMEN_SIZE_LABEL_KEY,
  RK_WOMEN_TYPE_KEYS,
  RK_WOMEN_TYPE_LABEL_KEY,
  RK_WOMEN_TYPE_SEARCH,
  getRrobaKepuceLeafCategoryIds,
  resolveRrobaTypeCategoryId,
  type RkAccTypeKey,
  type RkCityKey,
  type RkClothMatKey,
  type RkConditionKey,
  type RkGenderKey,
  type RkKidGenderKey,
  type RkKidSizeKey,
  type RkKidTypeKey,
  type RkMenSizeKey,
  type RkMenTypeKey,
  type RkShoeMatKey,
  type RkShoeSizeKey,
  type RkShoeTypeKey,
  type RkTypeKey,
  type RkUniversalCheckKey,
  type RkWomenSizeKey,
  type RkWomenTypeKey,
  type RrobaKepuceCategoryRow,
} from "@/lib/rroba-kepuce-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: RrobaKepuceCategoryRow[];
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

export function RrobaKepuceSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getRrobaKepuceLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<RkTypeKey | null>(null);
  const [menType, setMenType] = useState<RkMenTypeKey | "">("");
  const [menSize, setMenSize] = useState<RkMenSizeKey | "">("");
  const [womenType, setWomenType] = useState<RkWomenTypeKey | "">("");
  const [womenSize, setWomenSize] = useState<RkWomenSizeKey | "">("");
  const [clothMat, setClothMat] = useState<RkClothMatKey | "">("");
  const [shoeGender, setShoeGender] = useState<RkGenderKey | "">("");
  const [shoeType, setShoeType] = useState<RkShoeTypeKey | "">("");
  const [shoeSize, setShoeSize] = useState<RkShoeSizeKey | "">("");
  const [shoeMat, setShoeMat] = useState<RkShoeMatKey | "">("");
  const [accType, setAccType] = useState<RkAccTypeKey | "">("");
  const [accGender, setAccGender] = useState<RkGenderKey | "">("");
  const [kidGender, setKidGender] = useState<RkKidGenderKey | "">("");
  const [kidSize, setKidSize] = useState<RkKidSizeKey | "">("");
  const [kidType, setKidType] = useState<RkKidTypeKey | "">("");
  const [condition, setCondition] = useState<RkConditionKey | "">("");
  const [universalChecks, setUniversalChecks] = useState<
    Record<RkUniversalCheckKey, boolean>
  >({
    exchange: false,
    shipping: false,
    pickup: false,
  });
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<RkCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const resetSubFilters = () => {
    setMenType("");
    setMenSize("");
    setWomenType("");
    setWomenSize("");
    setClothMat("");
    setShoeGender("");
    setShoeType("");
    setShoeSize("");
    setShoeMat("");
    setAccType("");
    setAccGender("");
    setKidGender("");
    setKidSize("");
    setKidType("");
  };

  const selectType = (key: RkTypeKey) => {
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
      const cid = resolveRrobaTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = RK_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "meshkuj") {
      if (menType) searchBits.push(RK_MEN_TYPE_SEARCH[menType]);
      if (menSize) searchBits.push(menSize.toUpperCase());
      if (clothMat) searchBits.push(RK_CLOTH_MAT_SEARCH[clothMat]);
    } else if (typeKey === "femra") {
      if (womenType) searchBits.push(RK_WOMEN_TYPE_SEARCH[womenType]);
      if (womenSize) searchBits.push(womenSize.toUpperCase());
      if (clothMat) searchBits.push(RK_CLOTH_MAT_SEARCH[clothMat]);
    } else if (typeKey === "kepuce") {
      if (shoeGender) searchBits.push(RK_GENDER_SEARCH[shoeGender]);
      if (shoeType) searchBits.push(RK_SHOE_TYPE_SEARCH[shoeType]);
      if (shoeSize) searchBits.push(`Numër ${shoeSize}`);
      if (shoeMat) searchBits.push(RK_SHOE_MAT_SEARCH[shoeMat]);
    } else if (typeKey === "aksesore") {
      if (accType) searchBits.push(RK_ACC_TYPE_SEARCH[accType]);
      if (accGender) searchBits.push(RK_GENDER_SEARCH[accGender]);
    } else if (typeKey === "femije") {
      if (kidGender) searchBits.push(RK_KID_GENDER_SEARCH[kidGender]);
      if (kidSize) searchBits.push(`${kidSize} cm`);
      if (kidType) searchBits.push(RK_KID_TYPE_SEARCH[kidType]);
    }

    if (condition) searchBits.push(RK_CONDITION_SEARCH[condition]);
    for (const k of RK_UNIVERSAL_CHECK_KEYS) {
      if (universalChecks[k]) searchBits.push(RK_UNIVERSAL_CHECK_SEARCH[k]);
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
    menType,
    menSize,
    womenType,
    womenSize,
    clothMat,
    shoeGender,
    shoeType,
    shoeSize,
    shoeMat,
    accType,
    accGender,
    kidGender,
    kidSize,
    kidType,
    condition,
    universalChecks,
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

  const cityLabel = cityKey ? t[RK_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[RK_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Shirt size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.rk_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.rk_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.rk_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {RK_TYPE_KEYS.map((key) => {
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
                  src={RK_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[RK_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "meshkuj" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.rk_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {RK_MEN_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={menType === k}
                  onClick={() => toggleChip(menType, k, setMenType)}
                >
                  {t[RK_MEN_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_size}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {RK_MEN_SIZE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={menSize === k}
                  onClick={() => toggleChip(menSize, k, setMenSize)}
                >
                  {t[RK_MEN_SIZE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {RK_CLOTH_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={clothMat === k}
                  onClick={() => toggleChip(clothMat, k, setClothMat)}
                >
                  {t[RK_CLOTH_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "femra" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.rk_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {RK_WOMEN_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={womenType === k}
                  onClick={() => toggleChip(womenType, k, setWomenType)}
                >
                  {t[RK_WOMEN_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_size}>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {RK_WOMEN_SIZE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={womenSize === k}
                  onClick={() => toggleChip(womenSize, k, setWomenSize)}
                >
                  {t[RK_WOMEN_SIZE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {RK_CLOTH_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={clothMat === k}
                  onClick={() => toggleChip(clothMat, k, setClothMat)}
                >
                  {t[RK_CLOTH_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "kepuce" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.rk_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {RK_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={shoeGender === k}
                  onClick={() => toggleChip(shoeGender, k, setShoeGender)}
                >
                  {t[RK_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {RK_SHOE_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={shoeType === k}
                  onClick={() => toggleChip(shoeType, k, setShoeType)}
                >
                  {t[RK_SHOE_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_shoe_size}>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {RK_SHOE_SIZE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={shoeSize === k}
                  onClick={() => toggleChip(shoeSize, k, setShoeSize)}
                >
                  {t[RK_SHOE_SIZE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_material}>
            <div className="grid grid-cols-2 gap-2">
              {RK_SHOE_MAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={shoeMat === k}
                  onClick={() => toggleChip(shoeMat, k, setShoeMat)}
                >
                  {t[RK_SHOE_MAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "aksesore" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.rk_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {RK_ACC_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={accType === k}
                  onClick={() => toggleChip(accType, k, setAccType)}
                >
                  {t[RK_ACC_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {RK_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={accGender === k}
                  onClick={() => toggleChip(accGender, k, setAccGender)}
                >
                  {t[RK_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "femije" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.rk_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {RK_KID_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={kidGender === k}
                  onClick={() => toggleChip(kidGender, k, setKidGender)}
                >
                  {t[RK_KID_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.rk_sec_age_group}>
            {RK_KID_AGE_GROUPS.map((group) => (
              <div key={group.groupKey} className="space-y-2 mb-4 last:mb-0">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {t[group.labelKey]}
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {group.sizeKeys.map((size) => (
                    <ChipButton
                      key={size}
                      selected={kidSize === size}
                      onClick={() => toggleChip(kidSize, size, setKidSize)}
                    >
                      {size}
                    </ChipButton>
                  ))}
                </div>
              </div>
            ))}
          </FilterSection>
          <FilterSection title={t.rk_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {RK_KID_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={kidType === k}
                  onClick={() => toggleChip(kidType, k, setKidType)}
                >
                  {t[RK_KID_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.rk_sec_universal}</h3>

        <FilterSection title={t.rk_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {RK_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[RK_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.rk_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.rk_from}</span>
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
              <span className="text-sm text-gray-600">{t.rk_to}</span>
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

        <FilterSection title={t.rk_sec_location}>
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
                        {RK_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${RK_CITY_SEARCH[ck]} ${t[RK_CITY_LABEL_KEY[ck]]}`}
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
                            {t[RK_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rk-area" className="text-sm text-gray-600">
                {t.rk_area_lbl}
              </Label>
              <Input
                id="rk-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.rk_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.rk_sec_options}>
          <div className="grid grid-cols-1 gap-3">
            {RK_UNIVERSAL_CHECK_KEYS.map((k) => (
              <label
                key={k}
                className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
              >
                <Checkbox
                  checked={universalChecks[k]}
                  onCheckedChange={(c) =>
                    setUniversalChecks((prev) => ({ ...prev, [k]: c === true }))
                  }
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-800">
                  {t[RK_UNIVERSAL_CHECK_LABEL_KEY[k]]}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.rk_search_btn}
      </Button>
    </div>
  );
}

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
import { Check, ChevronsUpDown, MapPin, PawPrint, Search } from "lucide-react";
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
  KSH_AQUA_KEYS,
  KSH_AQUA_LABEL_KEY,
  KSH_AQUA_SEARCH,
  KSH_BIRD_CAGE_SEARCH,
  KSH_BIRD_CHAR_KEYS,
  KSH_BIRD_CHAR_LABEL_KEY,
  KSH_BIRD_CHAR_SEARCH,
  KSH_BIRD_TYPE_KEYS,
  KSH_BIRD_TYPE_LABEL_KEY,
  KSH_BIRD_TYPE_SEARCH,
  KSH_CAT_AGE_KEYS,
  KSH_CAT_AGE_LABEL_KEY,
  KSH_CAT_AGE_SEARCH,
  KSH_CAT_BREED_KEYS,
  KSH_CAT_BREED_LABEL_KEY,
  KSH_CAT_BREED_SEARCH,
  KSH_CAT_CHECK_KEYS,
  KSH_CAT_CHECK_LABEL_KEY,
  KSH_CAT_CHECK_SEARCH,
  KSH_CITY_KEYS,
  KSH_CITY_LABEL_KEY,
  KSH_CITY_SEARCH,
  KSH_DOG_AGE_KEYS,
  KSH_DOG_AGE_LABEL_KEY,
  KSH_DOG_AGE_SEARCH,
  KSH_DOG_BREED_KEYS,
  KSH_DOG_BREED_LABEL_KEY,
  KSH_DOG_BREED_SEARCH,
  KSH_DOG_CHECK_KEYS,
  KSH_DOG_CHECK_LABEL_KEY,
  KSH_DOG_CHECK_SEARCH,
  KSH_DOG_SIZE_KEYS,
  KSH_DOG_SIZE_LABEL_KEY,
  KSH_DOG_SIZE_SEARCH,
  KSH_GENDER_KEYS,
  KSH_GENDER_LABEL_KEY,
  KSH_GENDER_SEARCH,
  KSH_LISTING_KEYS,
  KSH_LISTING_LABEL_KEY,
  KSH_LISTING_SEARCH,
  KSH_PET_CATEGORY_KEYS,
  KSH_PET_CATEGORY_LABEL_KEY,
  KSH_PET_CATEGORY_SEARCH,
  KSH_SUPPLY_KEYS,
  KSH_SUPPLY_LABEL_KEY,
  KSH_SUPPLY_SEARCH,
  KSH_TYPE_KEYS,
  KSH_TYPE_LABEL_KEY,
  KSH_TYPE_PHOTOS,
  getKafshetLeafCategoryIds,
  resolveKafshetTypeCategoryId,
  type KafshetCategoryRow,
  type KshAquaKey,
  type KshBirdCharKey,
  type KshBirdTypeKey,
  type KshCatAgeKey,
  type KshCatBreedKey,
  type KshCatCheckKey,
  type KshCityKey,
  type KshDogAgeKey,
  type KshDogBreedKey,
  type KshDogCheckKey,
  type KshDogSizeKey,
  type KshGenderKey,
  type KshListingKey,
  type KshPetCategoryKey,
  type KshSupplyKey,
  type KshTypeKey,
} from "@/lib/kafshet-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: KafshetCategoryRow[];
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

function CheckList<T extends string>({
  keys,
  labelKey,
  values,
  onChange,
  t,
}: {
  keys: readonly T[];
  labelKey: Record<T, string>;
  values: Record<T, boolean>;
  onChange: (key: T, checked: boolean) => void;
  t: Record<string, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {keys.map((k) => (
        <label
          key={k}
          className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
        >
          <Checkbox
            checked={values[k]}
            onCheckedChange={(c) => onChange(k, c === true)}
            className="h-5 w-5"
          />
          <span className="text-sm font-medium text-gray-800">{t[labelKey[k]]}</span>
        </label>
      ))}
    </div>
  );
}

export function KafshetSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getKafshetLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<KshTypeKey | null>(null);
  const [catBreed, setCatBreed] = useState<KshCatBreedKey | "">("");
  const [catAge, setCatAge] = useState<KshCatAgeKey | "">("");
  const [catGender, setCatGender] = useState<KshGenderKey | "">("");
  const [catChecks, setCatChecks] = useState<Record<KshCatCheckKey, boolean>>({
    vaksinuar: false,
    parazite: false,
    libreze: false,
    kastruar: false,
  });
  const [dogBreed, setDogBreed] = useState<KshDogBreedKey | "">("");
  const [dogAge, setDogAge] = useState<KshDogAgeKey | "">("");
  const [dogSize, setDogSize] = useState<KshDogSizeKey | "">("");
  const [dogChecks, setDogChecks] = useState<Record<KshDogCheckKey, boolean>>({
    pedigree: false,
    mikrochip: false,
    vaksinuar: false,
    libreze: false,
  });
  const [birdType, setBirdType] = useState<KshBirdTypeKey | "">("");
  const [birdChar, setBirdChar] = useState<KshBirdCharKey | "">("");
  const [birdWithCage, setBirdWithCage] = useState(false);
  const [aquaType, setAquaType] = useState<KshAquaKey | "">("");
  const [petCategory, setPetCategory] = useState<KshPetCategoryKey | "">("");
  const [supplyType, setSupplyType] = useState<KshSupplyKey | "">("");
  const [listingType, setListingType] = useState<KshListingKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<KshCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const isAdoption = listingType === "falet";

  const resetSubFilters = () => {
    setCatBreed("");
    setCatAge("");
    setCatGender("");
    setCatChecks({ vaksinuar: false, parazite: false, libreze: false, kastruar: false });
    setDogBreed("");
    setDogAge("");
    setDogSize("");
    setDogChecks({ pedigree: false, mikrochip: false, vaksinuar: false, libreze: false });
    setBirdType("");
    setBirdChar("");
    setBirdWithCage(false);
    setAquaType("");
    setPetCategory("");
    setSupplyType("");
  };

  const selectType = (key: KshTypeKey) => {
    if (typeKey === key) {
      setTypeKey(null);
      resetSubFilters();
    } else {
      setTypeKey(key);
      resetSubFilters();
    }
  };

  const selectListingType = (key: KshListingKey) => {
    if (listingType === key) {
      setListingType("");
      setPriceMin("");
      setPriceMax("");
    } else {
      setListingType(key);
      if (key === "falet") {
        setPriceMin("0");
        setPriceMax("0");
      }
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
      const cid = resolveKafshetTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = KSH_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "mace") {
      if (catBreed) searchBits.push(KSH_CAT_BREED_SEARCH[catBreed]);
      if (catAge) searchBits.push(KSH_CAT_AGE_SEARCH[catAge]);
      if (catGender) searchBits.push(KSH_GENDER_SEARCH[catGender]);
      for (const k of KSH_CAT_CHECK_KEYS) {
        if (catChecks[k]) searchBits.push(KSH_CAT_CHECK_SEARCH[k]);
      }
    } else if (typeKey === "qen") {
      if (dogBreed) searchBits.push(KSH_DOG_BREED_SEARCH[dogBreed]);
      if (dogAge) searchBits.push(KSH_DOG_AGE_SEARCH[dogAge]);
      if (dogSize) searchBits.push(KSH_DOG_SIZE_SEARCH[dogSize]);
      for (const k of KSH_DOG_CHECK_KEYS) {
        if (dogChecks[k]) searchBits.push(KSH_DOG_CHECK_SEARCH[k]);
      }
    } else if (typeKey === "shpende") {
      if (birdType) searchBits.push(KSH_BIRD_TYPE_SEARCH[birdType]);
      if (birdChar) searchBits.push(KSH_BIRD_CHAR_SEARCH[birdChar]);
      if (birdWithCage) searchBits.push(KSH_BIRD_CAGE_SEARCH);
    } else if (typeKey === "akuariume") {
      if (aquaType) searchBits.push(KSH_AQUA_SEARCH[aquaType]);
    } else if (typeKey === "ushqim_aksesore") {
      if (petCategory) searchBits.push(KSH_PET_CATEGORY_SEARCH[petCategory]);
      if (supplyType) searchBits.push(KSH_SUPPLY_SEARCH[supplyType]);
    }

    if (listingType) searchBits.push(KSH_LISTING_SEARCH[listingType]);

    if (searchBits.length) p.search = searchBits.join(" ");

    if (isAdoption) {
      p.min_price = 0;
      p.max_price = 0;
    } else {
      const minP = parseFloat(priceMin.replace(",", "."));
      const maxP = parseFloat(priceMax.replace(",", "."));
      if (Number.isFinite(minP) && priceMin.trim()) p.min_price = minP;
      if (Number.isFinite(maxP) && priceMax.trim()) p.max_price = maxP;
    }

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
    catBreed,
    catAge,
    catGender,
    catChecks,
    dogBreed,
    dogAge,
    dogSize,
    dogChecks,
    birdType,
    birdChar,
    birdWithCage,
    aquaType,
    petCategory,
    supplyType,
    listingType,
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

  const cityLabel = cityKey ? t[KSH_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[KSH_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <PawPrint size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ksh_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.ksh_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.ksh_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {KSH_TYPE_KEYS.map((key) => {
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
                  src={KSH_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[KSH_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "mace" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ksh_sec_breed}>
            <KindChips
              keys={KSH_CAT_BREED_KEYS}
              labelKey={KSH_CAT_BREED_LABEL_KEY}
              selected={catBreed}
              onSelect={setCatBreed}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ksh_sec_age}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_CAT_AGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={catAge === k}
                  onClick={() => toggleChip(catAge, k, setCatAge)}
                >
                  {t[KSH_CAT_AGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={catGender === k}
                  onClick={() => toggleChip(catGender, k, setCatGender)}
                >
                  {t[KSH_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_extras}>
            <CheckList
              keys={KSH_CAT_CHECK_KEYS}
              labelKey={KSH_CAT_CHECK_LABEL_KEY}
              values={catChecks}
              onChange={(k, checked) => setCatChecks((prev) => ({ ...prev, [k]: checked }))}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "qen" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ksh_sec_breed}>
            <KindChips
              keys={KSH_DOG_BREED_KEYS}
              labelKey={KSH_DOG_BREED_LABEL_KEY}
              selected={dogBreed}
              onSelect={setDogBreed}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ksh_sec_age}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_DOG_AGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={dogAge === k}
                  onClick={() => toggleChip(dogAge, k, setDogAge)}
                >
                  {t[KSH_DOG_AGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_size}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_DOG_SIZE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={dogSize === k}
                  onClick={() => toggleChip(dogSize, k, setDogSize)}
                >
                  {t[KSH_DOG_SIZE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_extras}>
            <CheckList
              keys={KSH_DOG_CHECK_KEYS}
              labelKey={KSH_DOG_CHECK_LABEL_KEY}
              values={dogChecks}
              onChange={(k, checked) => setDogChecks((prev) => ({ ...prev, [k]: checked }))}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "shpende" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ksh_sec_kind}>
            <KindChips
              keys={KSH_BIRD_TYPE_KEYS}
              labelKey={KSH_BIRD_TYPE_LABEL_KEY}
              selected={birdType}
              onSelect={setBirdType}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ksh_sec_traits}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_BIRD_CHAR_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={birdChar === k}
                  onClick={() => toggleChip(birdChar, k, setBirdChar)}
                >
                  {t[KSH_BIRD_CHAR_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_extras}>
            <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
              <Checkbox
                checked={birdWithCage}
                onCheckedChange={(c) => setBirdWithCage(c === true)}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-gray-800">{t.ksh_bird_cage}</span>
            </label>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "akuariume" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ksh_sec_type}>
            <KindChips
              keys={KSH_AQUA_KEYS}
              labelKey={KSH_AQUA_LABEL_KEY}
              selected={aquaType}
              onSelect={setAquaType}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "ushqim_aksesore" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ksh_sec_pet_category}>
            <div className="grid grid-cols-2 gap-2">
              {KSH_PET_CATEGORY_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={petCategory === k}
                  onClick={() => toggleChip(petCategory, k, setPetCategory)}
                >
                  {t[KSH_PET_CATEGORY_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ksh_sec_type}>
            <KindChips
              keys={KSH_SUPPLY_KEYS}
              labelKey={KSH_SUPPLY_LABEL_KEY}
              selected={supplyType}
              onSelect={setSupplyType}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.ksh_sec_universal}</h3>

        <FilterSection title={t.ksh_sec_listing}>
          <div className="grid grid-cols-2 gap-2">
            {KSH_LISTING_KEYS.map((k) => (
              <ChipButton key={k} selected={listingType === k} onClick={() => selectListingType(k)}>
                {t[KSH_LISTING_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
          {isAdoption ? (
            <p className="text-sm text-blue-700 font-medium">{t.ksh_adoption_price_hint}</p>
          ) : null}
        </FilterSection>

        <FilterSection title={t.ksh_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ksh_from}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className={inputClass}
                disabled={isAdoption}
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ksh_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="500"
                className={inputClass}
                disabled={isAdoption}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.ksh_sec_location}>
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
                        {KSH_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${KSH_CITY_SEARCH[ck]} ${t[KSH_CITY_LABEL_KEY[ck]]}`}
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
                            {t[KSH_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ksh-area" className="text-sm text-gray-600">
                {t.ksh_area_lbl}
              </Label>
              <Input
                id="ksh-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.ksh_area_ph}
                className={inputClass}
              />
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
        {t.ksh_search_btn}
      </Button>
    </div>
  );
}

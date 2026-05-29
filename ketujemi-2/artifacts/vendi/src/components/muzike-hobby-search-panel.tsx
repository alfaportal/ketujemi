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
import { Check, ChevronsUpDown, MapPin, Music, Search } from "lucide-react";
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
  CategoryPhotoPickerCard,
  CategoryPhotoPickerRow,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import {
  MH_CITY_KEYS,
  MH_CITY_LABEL_KEY,
  MH_CITY_SEARCH,
  MH_CONDITION_KEYS,
  MH_CONDITION_LABEL_KEY,
  MH_CONDITION_SEARCH,
  MH_COVER_KEYS,
  MH_COVER_LABEL_KEY,
  MH_COVER_SEARCH,
  MH_EXCHANGE_SEARCH,
  MH_GENRE_KEYS,
  MH_GENRE_LABEL_KEY,
  MH_GENRE_SEARCH,
  MH_KEY_ACC_KEYS,
  MH_KEY_ACC_LABEL_KEY,
  MH_KEY_ACC_SEARCH,
  MH_KEY_KEYS,
  MH_KEY_LABEL_KEY,
  MH_KEY_SEARCH,
  MH_LANG_KEYS,
  MH_LANG_LABEL_KEY,
  MH_LANG_SEARCH,
  MH_STRING_CHECK_KEYS,
  MH_STRING_CHECK_LABEL_KEY,
  MH_STRING_CHECK_SEARCH,
  MH_STRING_KEYS,
  MH_STRING_LABEL_KEY,
  MH_STRING_SEARCH,
  MH_STUDIO_KEYS,
  MH_STUDIO_LABEL_KEY,
  MH_STUDIO_SEARCH,
  MH_TYPE_KEYS,
  MH_TYPE_LABEL_KEY,
  MH_TYPE_PHOTOS,
  MH_WIND_CHECK_KEYS,
  MH_WIND_CHECK_LABEL_KEY,
  MH_WIND_CHECK_SEARCH,
  MH_WIND_KEYS,
  MH_WIND_LABEL_KEY,
  MH_WIND_SEARCH,
  MH_ART_SERVICE_KEYS,
  MH_ART_SERVICE_LABEL_KEY,
  MH_ART_SERVICE_SEARCH,
  MH_ART_PURPOSE_KEYS,
  MH_ART_PURPOSE_LABEL_KEY,
  MH_ART_PURPOSE_SEARCH,
  MH_ART_EXP_KEYS,
  MH_ART_EXP_LABEL_KEY,
  MH_ART_EXP_SEARCH,
  MH_ART_GENDER_KEYS,
  MH_ART_GENDER_LABEL_KEY,
  MH_ART_GENDER_SEARCH,
  MH_ART_AGE_KEYS,
  MH_ART_AGE_LABEL_KEY,
  MH_ART_AGE_SEARCH,
  getMuzikeHobbyLeafCategoryIds,
  resolveMuzikeHobbyTypeCategoryId,
  type MhCityKey,
  type MhConditionKey,
  type MhCoverKey,
  type MhGenreKey,
  type MhKeyAccKey,
  type MhKeyKey,
  type MhLangKey,
  type MhStringCheckKey,
  type MhStringKey,
  type MhStudioKey,
  type MhTypeKey,
  type MhWindCheckKey,
  type MhWindKey,
  type MhArtServiceKey,
  type MhArtPurposeKey,
  type MhArtExpKey,
  type MhArtGenderKey,
  type MhArtAgeKey,
  type MuzikeHobbyCategoryRow,
} from "@/lib/muzike-hobby-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: MuzikeHobbyCategoryRow[];
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

export function MuzikeHobbySearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getMuzikeHobbyLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<MhTypeKey | null>(null);
  const [windKind, setWindKind] = useState<MhWindKey | "">("");
  const [windChecks, setWindChecks] = useState<Record<MhWindCheckKey, boolean>>({
    cante: false,
    pipeza: false,
    pastrim: false,
  });
  const [stringKind, setStringKind] = useState<MhStringKey | "">("");
  const [stringChecks, setStringChecks] = useState<Record<MhStringCheckKey, boolean>>({
    amp: false,
    tela_rezerve: false,
    cante: false,
    pedale: false,
  });
  const [keyKind, setKeyKind] = useState<MhKeyKey | "">("");
  const [keyAcc, setKeyAcc] = useState<Record<MhKeyAccKey, boolean>>({
    karrige: false,
    pedale: false,
    mbajtese: false,
  });
  const [studioKind, setStudioKind] = useState<MhStudioKey | "">("");
  const [genre, setGenre] = useState<MhGenreKey | "">("");
  const [lang, setLang] = useState<MhLangKey | "">("");
  const [cover, setCover] = useState<MhCoverKey | "">("");
  const [artService, setArtService] = useState<MhArtServiceKey | "">("");
  const [artPurpose, setArtPurpose] = useState<MhArtPurposeKey | "">("");
  const [artExp, setArtExp] = useState<MhArtExpKey | "">("");
  const [artGender, setArtGender] = useState<MhArtGenderKey | "">("");
  const [artAge, setArtAge] = useState<MhArtAgeKey | "">("");
  const [condition, setCondition] = useState<MhConditionKey | "">("");
  const [exchange, setExchange] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<MhCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const resetSubFilters = () => {
    setWindKind("");
    setWindChecks({ cante: false, pipeza: false, pastrim: false });
    setStringKind("");
    setStringChecks({ amp: false, tela_rezerve: false, cante: false, pedale: false });
    setKeyKind("");
    setKeyAcc({ karrige: false, pedale: false, mbajtese: false });
    setStudioKind("");
    setGenre("");
    setLang("");
    setCover("");
    setArtService("");
    setArtPurpose("");
    setArtExp("");
    setArtGender("");
    setArtAge("");
  };

  const selectType = (key: MhTypeKey) => {
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
      const cid = resolveMuzikeHobbyTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = MH_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "frymore") {
      if (windKind) searchBits.push(MH_WIND_SEARCH[windKind]);
      for (const k of MH_WIND_CHECK_KEYS) {
        if (windChecks[k]) searchBits.push(MH_WIND_CHECK_SEARCH[k]);
      }
    } else if (typeKey === "tela") {
      if (stringKind) searchBits.push(MH_STRING_SEARCH[stringKind]);
      for (const k of MH_STRING_CHECK_KEYS) {
        if (stringChecks[k]) searchBits.push(MH_STRING_CHECK_SEARCH[k]);
      }
    } else if (typeKey === "tastiere") {
      if (keyKind) searchBits.push(MH_KEY_SEARCH[keyKind]);
      for (const k of MH_KEY_ACC_KEYS) {
        if (keyAcc[k]) searchBits.push(MH_KEY_ACC_SEARCH[k]);
      }
    } else if (typeKey === "studio") {
      if (studioKind) searchBits.push(MH_STUDIO_SEARCH[studioKind]);
    } else if (typeKey === "libra") {
      if (genre) searchBits.push(MH_GENRE_SEARCH[genre]);
      if (lang) searchBits.push(MH_LANG_SEARCH[lang]);
      if (cover) searchBits.push(MH_COVER_SEARCH[cover]);
    } else if (typeKey === "art_teater") {
      if (artService) searchBits.push(MH_ART_SERVICE_SEARCH[artService]);
      if (artPurpose) searchBits.push(MH_ART_PURPOSE_SEARCH[artPurpose]);
      if (artExp) searchBits.push(MH_ART_EXP_SEARCH[artExp]);
      if (artGender) searchBits.push(MH_ART_GENDER_SEARCH[artGender]);
      if (artAge) searchBits.push(MH_ART_AGE_SEARCH[artAge]);
    }

    if (condition) searchBits.push(MH_CONDITION_SEARCH[condition]);
    if (exchange) searchBits.push(MH_EXCHANGE_SEARCH);

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
    windKind,
    windChecks,
    stringKind,
    stringChecks,
    keyKind,
    keyAcc,
    studioKind,
    genre,
    lang,
    cover,
    condition,
    exchange,
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

  const cityLabel = cityKey ? t[MH_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[MH_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Music size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.mh_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.mh_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.mh_sec_types}</Label>
        <CategoryPhotoPickerRow>
          {MH_TYPE_KEYS.map((key) => (
            <CategoryPhotoPickerCard
              key={key}
              selected={typeKey === key}
              onClick={() => selectType(key)}
              imageSrc={MH_TYPE_PHOTOS[key]}
              label={t[MH_TYPE_LABEL_KEY[key]]}
            />
          ))}
        </CategoryPhotoPickerRow>
      </section>

      {typeKey === "frymore" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_sec_kind}>
            <KindChips
              keys={MH_WIND_KEYS}
              labelKey={MH_WIND_LABEL_KEY}
              selected={windKind}
              onSelect={setWindKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.mh_sec_extras}>
            <CheckList
              keys={MH_WIND_CHECK_KEYS}
              labelKey={MH_WIND_CHECK_LABEL_KEY}
              values={windChecks}
              onChange={(k, checked) => setWindChecks((prev) => ({ ...prev, [k]: checked }))}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "tela" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_sec_kind}>
            <KindChips
              keys={MH_STRING_KEYS}
              labelKey={MH_STRING_LABEL_KEY}
              selected={stringKind}
              onSelect={setStringKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.mh_sec_extras}>
            <CheckList
              keys={MH_STRING_CHECK_KEYS}
              labelKey={MH_STRING_CHECK_LABEL_KEY}
              values={stringChecks}
              onChange={(k, checked) => setStringChecks((prev) => ({ ...prev, [k]: checked }))}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "tastiere" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_sec_kind}>
            <KindChips
              keys={MH_KEY_KEYS}
              labelKey={MH_KEY_LABEL_KEY}
              selected={keyKind}
              onSelect={setKeyKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.mh_sec_accessories}>
            <CheckList
              keys={MH_KEY_ACC_KEYS}
              labelKey={MH_KEY_ACC_LABEL_KEY}
              values={keyAcc}
              onChange={(k, checked) => setKeyAcc((prev) => ({ ...prev, [k]: checked }))}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "studio" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_sec_kind}>
            <KindChips
              keys={MH_STUDIO_KEYS}
              labelKey={MH_STUDIO_LABEL_KEY}
              selected={studioKind}
              onSelect={setStudioKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "art_teater" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_art_sec_service}>
            <KindChips
              keys={MH_ART_SERVICE_KEYS}
              labelKey={MH_ART_SERVICE_LABEL_KEY}
              selected={artService}
              onSelect={setArtService}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.mh_art_sec_purpose}>
            <div className="grid grid-cols-2 gap-2">
              {MH_ART_PURPOSE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={artPurpose === k}
                  onClick={() => toggleChip(artPurpose, k, setArtPurpose)}
                >
                  {t[MH_ART_PURPOSE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.mh_art_sec_experience}>
            <div className="grid grid-cols-2 gap-2">
              {MH_ART_EXP_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={artExp === k}
                  onClick={() => toggleChip(artExp, k, setArtExp)}
                >
                  {t[MH_ART_EXP_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.mh_art_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {MH_ART_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={artGender === k}
                  onClick={() => toggleChip(artGender, k, setArtGender)}
                >
                  {t[MH_ART_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.mh_art_sec_age}>
            <div className="grid grid-cols-2 gap-2">
              {MH_ART_AGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={artAge === k}
                  onClick={() => toggleChip(artAge, k, setArtAge)}
                >
                  {t[MH_ART_AGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "libra" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.mh_sec_genre}>
            <KindChips
              keys={MH_GENRE_KEYS}
              labelKey={MH_GENRE_LABEL_KEY}
              selected={genre}
              onSelect={setGenre}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.mh_sec_language}>
            <div className="grid grid-cols-2 gap-2">
              {MH_LANG_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={lang === k}
                  onClick={() => toggleChip(lang, k, setLang)}
                >
                  {t[MH_LANG_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.mh_sec_cover}>
            <div className="grid grid-cols-2 gap-2">
              {MH_COVER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={cover === k}
                  onClick={() => toggleChip(cover, k, setCover)}
                >
                  {t[MH_COVER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.mh_sec_universal}</h3>

        <FilterSection title={t.mh_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {MH_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[MH_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.mh_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.mh_from}</span>
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
              <span className="text-sm text-gray-600">{t.mh_to}</span>
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

        <FilterSection title={t.mh_sec_location}>
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
                        {MH_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${MH_CITY_SEARCH[ck]} ${t[MH_CITY_LABEL_KEY[ck]]}`}
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
                            {t[MH_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mh-area" className="text-sm text-gray-600">
                {t.mh_area_lbl}
              </Label>
              <Input
                id="mh-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.mh_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.mh_sec_options}>
          <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
            <Checkbox
              checked={exchange}
              onCheckedChange={(c) => setExchange(c === true)}
              className="h-5 w-5"
            />
            <span className="text-sm font-medium text-gray-800">{t.mh_chk_exchange}</span>
          </label>
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.mh_search_btn}
      </Button>
    </div>
  );
}

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
import { Check, ChevronsUpDown, MapPin, Search, Tv } from "lucide-react";
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
  EP_APPLIANCE_KIND_KEYS,
  EP_APPLIANCE_KIND_LABEL_KEY,
  EP_APPLIANCE_KIND_SEARCH,
  EP_AUDIO_KIND_KEYS,
  EP_AUDIO_KIND_LABEL_KEY,
  EP_AUDIO_KIND_SEARCH,
  EP_BTU_KEYS,
  EP_BTU_LABEL_KEY,
  EP_BTU_SEARCH,
  EP_CAMERA_KIND_KEYS,
  EP_CAMERA_KIND_LABEL_KEY,
  EP_CAMERA_KIND_SEARCH,
  EP_CITY_KEYS,
  EP_CITY_LABEL_KEY,
  EP_CITY_SEARCH,
  EP_CLIMATE_KIND_KEYS,
  EP_CLIMATE_KIND_LABEL_KEY,
  EP_CLIMATE_KIND_SEARCH,
  EP_CONDITION_KEYS,
  EP_CONDITION_LABEL_KEY,
  EP_CONDITION_SEARCH,
  EP_CONSOLE_KEYS,
  EP_CONSOLE_LABEL_KEY,
  EP_CONSOLE_SEARCH,
  EP_DISPLAY_TECH_KEYS,
  EP_DISPLAY_TECH_LABEL_KEY,
  EP_DISPLAY_TECH_SEARCH,
  EP_ENERGY_KEYS,
  EP_ENERGY_LABEL_KEY,
  EP_ENERGY_SEARCH,
  EP_GAME_ITEM_KEYS,
  EP_GAME_ITEM_LABEL_KEY,
  EP_GAME_ITEM_SEARCH,
  EP_RESOLUTION_KEYS,
  EP_RESOLUTION_LABEL_KEY,
  EP_RESOLUTION_SEARCH,
  EP_STORAGE_KEYS,
  EP_STORAGE_LABEL_KEY,
  EP_STORAGE_SEARCH,
  EP_TV_SIZE_KEYS,
  EP_TV_SIZE_LABEL_KEY,
  EP_TV_SIZE_SEARCH,
  EP_TV_TYPE_KEYS,
  EP_TV_TYPE_LABEL_KEY,
  EP_TV_TYPE_SEARCH,
  EP_LAPTOP_SUBSECTIONS,
  EP_LAPTOP_SUB_LABEL_KEY,
  EP_LAPTOP_SUB_SEARCH,
  EP_TYPE_KEYS,
  EP_TYPE_LABEL_KEY,
  EP_TYPE_PHOTOS,
  EP_WARRANTY_SEARCH,
  EP_WIDTH_KEYS,
  EP_WIDTH_LABEL_KEY,
  EP_WIDTH_SEARCH,
  getTvElektronikeLeafCategoryIds,
  resolveTvElektronikeTypeCategoryId,
  type EpApplianceKindKey,
  type EpAudioKindKey,
  type EpBtuKey,
  type EpCameraKindKey,
  type EpCityKey,
  type EpClimateKindKey,
  type EpConditionKey,
  type EpConsoleKey,
  type EpDisplayTechKey,
  type EpEnergyKey,
  type EpLaptopSubItemKey,
  type EpGameItemKey,
  type EpResolutionKey,
  type EpStorageKey,
  type EpTvSizeKey,
  type EpTvTypeKey,
  type EpTypeKey,
  type EpWidthKey,
  type TvElektronikeCategoryRow,
} from "@/lib/tv-elektronike-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  scopeCategoryId?: number;
  lockedTypeKey?: EpTypeKey | null;
  categories: TvElektronikeCategoryRow[];
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

export function TvElektronikeSearchPanel({
  hubId,
  scopeCategoryId,
  lockedTypeKey = null,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getTvElektronikeLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<EpTypeKey | null>(lockedTypeKey ?? null);
  useEffect(() => {
    if (lockedTypeKey) setTypeKey(lockedTypeKey);
  }, [lockedTypeKey]);
  const [applianceKind, setApplianceKind] = useState<EpApplianceKindKey | "">("");
  const [energyClass, setEnergyClass] = useState<EpEnergyKey | "">("");
  const [applianceWidth, setApplianceWidth] = useState<EpWidthKey | "">("");
  const [climateKind, setClimateKind] = useState<EpClimateKindKey | "">("");
  const [btu, setBtu] = useState<EpBtuKey | "">("");
  const [tvType, setTvType] = useState<EpTvTypeKey | "">("");
  const [tvSize, setTvSize] = useState<EpTvSizeKey | "">("");
  const [resolution, setResolution] = useState<EpResolutionKey | "">("");
  const [displayTech, setDisplayTech] = useState<EpDisplayTechKey | "">("");
  const [gameConsole, setGameConsole] = useState<EpConsoleKey | "">("");
  const [gameItem, setGameItem] = useState<EpGameItemKey | "">("");
  const [storage, setStorage] = useState<EpStorageKey | "">("");
  const [audioKind, setAudioKind] = useState<EpAudioKindKey | "">("");
  const [cameraKind, setCameraKind] = useState<EpCameraKindKey | "">("");
  const [laptopSub, setLaptopSub] = useState<EpLaptopSubItemKey | null>(null);
  const [condition, setCondition] = useState<EpConditionKey | "">("");
  const [hasWarranty, setHasWarranty] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<EpCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const resetSubFilters = () => {
    setApplianceKind("");
    setEnergyClass("");
    setApplianceWidth("");
    setClimateKind("");
    setBtu("");
    setTvType("");
    setTvSize("");
    setResolution("");
    setDisplayTech("");
    setGameConsole("");
    setGameItem("");
    setStorage("");
    setAudioKind("");
    setCameraKind("");
    setLaptopSub(null);
  };

  const laptopSectionRef = useRef<HTMLElement | null>(null);

  const selectType = (key: EpTypeKey) => {
    if (typeKey === key) {
      setTypeKey(null);
      resetSubFilters();
    } else {
      setTypeKey(key);
      resetSubFilters();
      if (key === "laptop_kompjutere") {
        window.requestAnimationFrame(() => {
          laptopSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
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
    };
    if (leafCsv) {
      p.category_ids = leafCsv;
    } else {
      p.category_id = hubId;
    }

    if (scopeCategoryId) {
      p.category_id = scopeCategoryId;
      delete p.category_ids;
    } else if (typeKey) {
      const cid = resolveTvElektronikeTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = EP_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "pajisje_medha") {
      if (applianceKind) searchBits.push(EP_APPLIANCE_KIND_SEARCH[applianceKind]);
      if (energyClass) searchBits.push(EP_ENERGY_SEARCH[energyClass]);
      if (applianceWidth) searchBits.push(EP_WIDTH_SEARCH[applianceWidth]);
    } else if (typeKey === "klimatizim") {
      if (climateKind) searchBits.push(EP_CLIMATE_KIND_SEARCH[climateKind]);
      if (btu) searchBits.push(EP_BTU_SEARCH[btu]);
    } else if (typeKey === "televizore") {
      if (tvType) searchBits.push(EP_TV_TYPE_SEARCH[tvType]);
      if (tvSize) searchBits.push(EP_TV_SIZE_SEARCH[tvSize]);
      if (resolution) searchBits.push(EP_RESOLUTION_SEARCH[resolution]);
      if (displayTech) searchBits.push(EP_DISPLAY_TECH_SEARCH[displayTech]);
    } else if (typeKey === "konzola") {
      if (gameConsole) searchBits.push(EP_CONSOLE_SEARCH[gameConsole]);
      if (gameItem) searchBits.push(EP_GAME_ITEM_SEARCH[gameItem]);
      if (storage) searchBits.push(EP_STORAGE_SEARCH[storage]);
    } else if (typeKey === "audio") {
      if (audioKind) searchBits.push(EP_AUDIO_KIND_SEARCH[audioKind]);
    } else if (typeKey === "kamera") {
      if (cameraKind) searchBits.push(EP_CAMERA_KIND_SEARCH[cameraKind]);
    } else if (typeKey === "laptop_kompjutere" && laptopSub) {
      searchBits.push(EP_LAPTOP_SUB_SEARCH[laptopSub]);
    }

    if (condition) searchBits.push(EP_CONDITION_SEARCH[condition]);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced live preview
  }, [
    leafCsv,
    hubId,
    scopeCategoryId,
    typeKey,
    applianceKind,
    energyClass,
    applianceWidth,
    climateKind,
    btu,
    tvType,
    tvSize,
    resolution,
    displayTech,
    gameConsole,
    gameItem,
    storage,
    audioKind,
    cameraKind,
    laptopSub,
    condition,
    hasWarranty,
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

  const cityLabel = cityKey ? t[EP_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[EP_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Tv size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ep_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.ep_panel_sub}</p>
      </div>

      {lockedTypeKey ? (
        <section className="space-y-1 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
          <h2 className="text-lg font-black text-gray-900">{t[EP_TYPE_LABEL_KEY[lockedTypeKey]]}</h2>
          <p className="text-sm text-gray-600">{t.hub_drill_type_hint}</p>
        </section>
      ) : null}

      {!lockedTypeKey ? (
      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.ep_sec_types}</Label>
        <CategoryPhotoPickerRow>
          {EP_TYPE_KEYS.filter((key) => key !== "laptop_kompjutere").map((key) => (
            <CategoryPhotoPickerCard
              key={key}
              selected={typeKey === key}
              onClick={() => selectType(key)}
              imageSrc={EP_TYPE_PHOTOS[key]}
              label={t[EP_TYPE_LABEL_KEY[key]]}
            />
          ))}
        </CategoryPhotoPickerRow>
      </section>
      ) : null}

      {typeKey === "pajisje_medha" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_kind}>
            <KindChips
              keys={EP_APPLIANCE_KIND_KEYS}
              labelKey={EP_APPLIANCE_KIND_LABEL_KEY}
              selected={applianceKind}
              onSelect={setApplianceKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ep_sec_energy}>
            <div className="grid grid-cols-2 gap-2">
              {EP_ENERGY_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={energyClass === k}
                  onClick={() => toggleChip(energyClass, k, setEnergyClass)}
                >
                  {t[EP_ENERGY_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ep_sec_width}>
            <div className="grid grid-cols-3 gap-2">
              {EP_WIDTH_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={applianceWidth === k}
                  onClick={() => toggleChip(applianceWidth, k, setApplianceWidth)}
                >
                  {t[EP_WIDTH_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "klimatizim" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_kind}>
            <KindChips
              keys={EP_CLIMATE_KIND_KEYS}
              labelKey={EP_CLIMATE_KIND_LABEL_KEY}
              selected={climateKind}
              onSelect={setClimateKind}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ep_sec_btu}>
            <div className="grid grid-cols-2 gap-2">
              {EP_BTU_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={btu === k}
                  onClick={() => toggleChip(btu, k, setBtu)}
                >
                  {t[EP_BTU_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "televizore" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {EP_TV_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={tvType === k}
                  onClick={() => toggleChip(tvType, k, setTvType)}
                >
                  {t[EP_TV_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ep_sec_size}>
            <KindChips
              keys={EP_TV_SIZE_KEYS}
              labelKey={EP_TV_SIZE_LABEL_KEY}
              selected={tvSize}
              onSelect={setTvSize}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ep_sec_resolution}>
            <div className="grid grid-cols-2 gap-2">
              {EP_RESOLUTION_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={resolution === k}
                  onClick={() => toggleChip(resolution, k, setResolution)}
                >
                  {t[EP_RESOLUTION_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.ep_sec_technology}>
            <div className="grid grid-cols-2 gap-2">
              {EP_DISPLAY_TECH_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={displayTech === k}
                  onClick={() => toggleChip(displayTech, k, setDisplayTech)}
                >
                  {t[EP_DISPLAY_TECH_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "konzola" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_console}>
            <KindChips
              keys={EP_CONSOLE_KEYS}
              labelKey={EP_CONSOLE_LABEL_KEY}
              selected={gameConsole}
              onSelect={setGameConsole}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ep_sec_item}>
            <KindChips
              keys={EP_GAME_ITEM_KEYS}
              labelKey={EP_GAME_ITEM_LABEL_KEY}
              selected={gameItem}
              onSelect={setGameItem}
              t={t}
            />
          </FilterSection>
          <FilterSection title={t.ep_sec_storage}>
            <div className="grid grid-cols-3 gap-2">
              {EP_STORAGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={storage === k}
                  onClick={() => toggleChip(storage, k, setStorage)}
                >
                  {t[EP_STORAGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "audio" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_kind}>
            <KindChips
              keys={EP_AUDIO_KIND_KEYS}
              labelKey={EP_AUDIO_KIND_LABEL_KEY}
              selected={audioKind}
              onSelect={setAudioKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "kamera" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ep_sec_type}>
            <KindChips
              keys={EP_CAMERA_KIND_KEYS}
              labelKey={EP_CAMERA_KIND_LABEL_KEY}
              selected={cameraKind}
              onSelect={setCameraKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "laptop_kompjutere" ? (
        <section
          ref={laptopSectionRef}
          className="space-y-6 rounded-xl border border-gray-100 bg-gray-50/60 p-4 scroll-mt-24"
        >
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          {EP_LAPTOP_SUBSECTIONS.map((sec) => (
            <div key={sec.sectionLabelKey} className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                {t[sec.sectionLabelKey]}
              </p>
              <div className="flex flex-wrap gap-2">
                {sec.itemKeys.map((itemKey) => {
                  const active = laptopSub === itemKey;
                  return (
                    <button
                      key={itemKey}
                      type="button"
                      onClick={() => setLaptopSub(active ? null : itemKey)}
                      className={cn(
                        "rounded-full border px-3 py-2 text-left text-xs sm:text-sm font-medium leading-snug transition-colors touch-manipulation max-w-full",
                        active
                          ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                          : "border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:bg-blue-50",
                      )}
                    >
                      {t[EP_LAPTOP_SUB_LABEL_KEY[itemKey]]}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.ep_sec_universal}</h3>

        <FilterSection title={t.ep_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {EP_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[EP_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
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
              <Label htmlFor="ep-area" className="text-sm text-gray-600">
                {t.ep_area_lbl}
              </Label>
              <Input
                id="ep-area"
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
        {t.ep_search_btn}
      </Button>
    </div>
  );
}

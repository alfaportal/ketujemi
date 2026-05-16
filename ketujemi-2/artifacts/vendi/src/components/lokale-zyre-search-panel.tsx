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
import { Building2, Check, ChevronsUpDown, Euro, MapPin, Search } from "lucide-react";
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
  LZ_AFARISTE_GROUPS,
  LZ_CEILING_KEYS,
  LZ_CEILING_LABEL_KEY,
  LZ_CEILING_SEARCH,
  LZ_DEPO_FEATURE_KEYS,
  LZ_DEPO_FEATURE_LABEL_KEY,
  LZ_DEPO_FEATURE_SEARCH,
  LZ_DEPO_TYPE_KEYS,
  LZ_DEPO_TYPE_LABEL_KEY,
  LZ_DEPO_TYPE_SEARCH,
  LZ_GAR_CAP_KEYS,
  LZ_GAR_CAP_LABEL_KEY,
  LZ_GAR_CAP_SEARCH,
  LZ_GAR_FEATURE_KEYS,
  LZ_GAR_FEATURE_LABEL_KEY,
  LZ_GAR_FEATURE_SEARCH,
  LZ_GAR_TYPE_KEYS,
  LZ_GAR_TYPE_LABEL_KEY,
  LZ_GAR_TYPE_SEARCH,
  LZ_IND_FEATURE_KEYS,
  LZ_IND_FEATURE_LABEL_KEY,
  LZ_IND_FEATURE_SEARCH,
  LZ_IND_TYPE_KEYS,
  LZ_IND_TYPE_LABEL_KEY,
  LZ_IND_TYPE_SEARCH,
  LZ_OFFICE_COUNT_KEYS,
  LZ_OFFICE_COUNT_LABEL_KEY,
  LZ_OFFICE_COUNT_SEARCH,
  LZ_OFFICE_TYPE_KEYS,
  LZ_OFFICE_TYPE_LABEL_KEY,
  LZ_OFFICE_TYPE_SEARCH,
  LZ_WC_COUNT_KEYS,
  LZ_WC_COUNT_LABEL_KEY,
  LZ_WC_COUNT_SEARCH,
  LZ_ZYRE_FEATURE_KEYS,
  LZ_ZYRE_FEATURE_LABEL_KEY,
  LZ_ZYRE_FEATURE_SEARCH,
  LOKALE_PROPERTY_KEYS,
  LOKALE_PROPERTY_LABEL_KEY,
  LOKALE_PROPERTY_PHOTOS,
  LOKALE_UNIVERSAL_FILTER_KEYS,
  LOKALE_UNIVERSAL_LABEL_KEY,
  LOKALE_UNIVERSAL_SEARCH,
  LOKALE_ZYRE_CITY_KEYS,
  LOKALE_ZYRE_CITY_LABEL_KEY,
  LOKALE_ZYRE_CITY_SEARCH,
  findAfaristeDestSearch,
  getLokaleZyreLeafCategoryIds,
  resolveLokalePropertyCategoryId,
  type LokaleCityKey,
  type LokalePropertyKey,
  type LokaleUniversalFilterKey,
  type LokaleZyreCategoryRow,
  type LzCeilingKey,
  type LzDepoFeatureKey,
  type LzDepoTypeKey,
  type LzGarCapKey,
  type LzGarFeatureKey,
  type LzGarTypeKey,
  type LzIndFeatureKey,
  type LzIndTypeKey,
  type LzOfficeCountKey,
  type LzOfficeTypeKey,
  type LzWcCountKey,
  type LzZyreFeatureKey,
} from "@/lib/lokale-zyre-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: LokaleZyreCategoryRow[];
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

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
      <p className="text-sm font-bold text-gray-900">{title}</p>
      {children}
    </div>
  );
}

export function LokaleZyreSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getLokaleZyreLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [propertyKey, setPropertyKey] = useState<LokalePropertyKey | null>(null);
  const [afaristeDest, setAfaristeDest] = useState("");
  const [officeType, setOfficeType] = useState<LzOfficeTypeKey | "">("");
  const [officeCount, setOfficeCount] = useState<LzOfficeCountKey | "">("");
  const [wcCount, setWcCount] = useState<LzWcCountKey | "">("");
  const [zyreFeatures, setZyreFeatures] = useState<Record<LzZyreFeatureKey, boolean>>({
    meeting: false,
    kitchen: false,
    server: false,
    ac: false,
    elevator: false,
  });
  const [depoType, setDepoType] = useState<LzDepoTypeKey | "">("");
  const [ceiling, setCeiling] = useState<LzCeilingKey | "">("");
  const [depoFeatures, setDepoFeatures] = useState<Record<LzDepoFeatureKey, boolean>>({
    ramp: false,
    floor: false,
    security: false,
    admin: false,
  });
  const [indType, setIndType] = useState<LzIndTypeKey | "">("");
  const [yardSqm, setYardSqm] = useState("");
  const [indFeatures, setIndFeatures] = useState<Record<LzIndFeatureKey, boolean>>({
    crane: false,
    substation: false,
    fire: false,
    sewer: false,
  });
  const [garType, setGarType] = useState<LzGarTypeKey | "">("");
  const [garCap, setGarCap] = useState<LzGarCapKey | "">("");
  const [garFeatures, setGarFeatures] = useState<Record<LzGarFeatureKey, boolean>>({
    door: false,
    power: false,
    water: false,
    repair: false,
  });
  const [sqmMin, setSqmMin] = useState("");
  const [sqmMax, setSqmMax] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<LokaleCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");
  const [universal, setUniversal] = useState<Record<LokaleUniversalFilterKey, boolean>>({
    truck: false,
    parking: false,
    power: false,
    heating: false,
  });

  const resetSubFilters = () => {
    setAfaristeDest("");
    setOfficeType("");
    setOfficeCount("");
    setWcCount("");
    setZyreFeatures({ meeting: false, kitchen: false, server: false, ac: false, elevator: false });
    setDepoType("");
    setCeiling("");
    setDepoFeatures({ ramp: false, floor: false, security: false, admin: false });
    setIndType("");
    setYardSqm("");
    setIndFeatures({ crane: false, substation: false, fire: false, sewer: false });
    setGarType("");
    setGarCap("");
    setGarFeatures({ door: false, power: false, water: false, repair: false });
  };

  const selectProperty = (key: LokalePropertyKey) => {
    if (propertyKey === key) {
      setPropertyKey(null);
      resetSubFilters();
    } else {
      setPropertyKey(key);
      resetSubFilters();
    }
  };

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: leafCsv,
    };

    if (propertyKey) {
      const cid = resolveLokalePropertyCategoryId(categories, hubId, propertyKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    const sqMin = parseFloat(sqmMin.replace(",", "."));
    const sqMax = parseFloat(sqmMax.replace(",", "."));
    if (Number.isFinite(sqMin) && sqmMin.trim()) p.property_sqm_min = Math.round(sqMin);
    if (Number.isFinite(sqMax) && sqmMax.trim()) p.property_sqm_max = Math.round(sqMax);

    if (cityKey) p.location_search = LOKALE_ZYRE_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (propertyKey === "afariste" && afaristeDest) {
      const token = findAfaristeDestSearch(afaristeDest);
      if (token) searchBits.push(token);
    } else if (propertyKey === "zyre") {
      if (officeType) searchBits.push(LZ_OFFICE_TYPE_SEARCH[officeType]);
      if (officeCount) searchBits.push(LZ_OFFICE_COUNT_SEARCH[officeCount]);
      if (wcCount) searchBits.push(LZ_WC_COUNT_SEARCH[wcCount]);
      for (const k of LZ_ZYRE_FEATURE_KEYS) {
        if (zyreFeatures[k]) searchBits.push(LZ_ZYRE_FEATURE_SEARCH[k]);
      }
    } else if (propertyKey === "depo") {
      if (depoType) searchBits.push(LZ_DEPO_TYPE_SEARCH[depoType]);
      if (ceiling) searchBits.push(LZ_CEILING_SEARCH[ceiling]);
      for (const k of LZ_DEPO_FEATURE_KEYS) {
        if (depoFeatures[k]) searchBits.push(LZ_DEPO_FEATURE_SEARCH[k]);
      }
    } else if (propertyKey === "industrial") {
      if (indType) searchBits.push(LZ_IND_TYPE_SEARCH[indType]);
      const yard = yardSqm.trim();
      if (yard) searchBits.push(`${yard} m² oborr`);
      for (const k of LZ_IND_FEATURE_KEYS) {
        if (indFeatures[k]) searchBits.push(LZ_IND_FEATURE_SEARCH[k]);
      }
    } else if (propertyKey === "garazha") {
      if (garType) searchBits.push(LZ_GAR_TYPE_SEARCH[garType]);
      if (garCap) searchBits.push(LZ_GAR_CAP_SEARCH[garCap]);
      for (const k of LZ_GAR_FEATURE_KEYS) {
        if (garFeatures[k]) searchBits.push(LZ_GAR_FEATURE_SEARCH[k]);
      }
    }

    for (const k of LOKALE_UNIVERSAL_FILTER_KEYS) {
      if (universal[k]) searchBits.push(LOKALE_UNIVERSAL_SEARCH[k]);
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
    propertyKey,
    afaristeDest,
    officeType,
    officeCount,
    wcCount,
    zyreFeatures,
    depoType,
    ceiling,
    depoFeatures,
    indType,
    yardSqm,
    indFeatures,
    garType,
    garCap,
    garFeatures,
    sqmMin,
    sqmMax,
    cityKey,
    areaZone,
    universal,
    priceMin,
    priceMax,
    categories,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  const cityLabel = cityKey ? t[LOKALE_ZYRE_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = propertyKey ? t[LOKALE_PROPERTY_LABEL_KEY[propertyKey]] : "";

  const toggleChip = <T extends string>(
    current: T | "",
    value: T,
    set: Dispatch<SetStateAction<T | "">>,
  ) => {
    set(current === value ? "" : value);
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Building2 size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.lz_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.lz_panel_sub}</p>
      </div>

      {/* Property type cards */}
      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.lz_sec_property}</Label>
        <div className="grid grid-cols-2 gap-3">
          {LOKALE_PROPERTY_KEYS.map((key) => {
            const selected = propertyKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => selectProperty(key)}
                className={cn(
                  "relative overflow-hidden rounded-2xl border text-left transition-all min-h-[7.5rem] touch-manipulation",
                  selected
                    ? "border-blue-600 ring-2 ring-blue-600/30 shadow-md"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-md",
                )}
              >
                <img
                  src={LOKALE_PROPERTY_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[LOKALE_PROPERTY_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic filters per property type */}
      {propertyKey === "afariste" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.lz_sec_destination}>
            {LZ_AFARISTE_GROUPS.map((group) => (
              <div key={group.groupKey} className="space-y-2 mb-4 last:mb-0">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                  {t[group.labelKey]}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {group.options.map((opt) => (
                    <ChipButton
                      key={opt.key}
                      selected={afaristeDest === opt.key}
                      onClick={() => toggleChip(afaristeDest, opt.key, setAfaristeDest)}
                    >
                      {t[opt.labelKey]}
                    </ChipButton>
                  ))}
                </div>
              </div>
            ))}
          </FilterSection>
        </section>
      ) : null}

      {propertyKey === "zyre" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.lz_sec_office_type}>
            <div className="grid grid-cols-2 gap-2">
              {LZ_OFFICE_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={officeType === k}
                  onClick={() => toggleChip(officeType, k, setOfficeType)}
                >
                  {t[LZ_OFFICE_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_office_count}>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LZ_OFFICE_COUNT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={officeCount === k}
                  onClick={() => toggleChip(officeCount, k, setOfficeCount)}
                >
                  {t[LZ_OFFICE_COUNT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_wc_count}>
            <div className="grid grid-cols-2 gap-2">
              {LZ_WC_COUNT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={wcCount === k}
                  onClick={() => toggleChip(wcCount, k, setWcCount)}
                >
                  {t[LZ_WC_COUNT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {LZ_ZYRE_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={zyreFeatures[k]}
                    onCheckedChange={(c) =>
                      setZyreFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[LZ_ZYRE_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {propertyKey === "depo" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.lz_sec_depo_type}>
            <div className="grid grid-cols-1 gap-2">
              {LZ_DEPO_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={depoType === k}
                  onClick={() => toggleChip(depoType, k, setDepoType)}
                >
                  {t[LZ_DEPO_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_ceiling}>
            <div className="grid grid-cols-2 gap-2">
              {LZ_CEILING_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={ceiling === k}
                  onClick={() => toggleChip(ceiling, k, setCeiling)}
                >
                  {t[LZ_CEILING_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {LZ_DEPO_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={depoFeatures[k]}
                    onCheckedChange={(c) =>
                      setDepoFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[LZ_DEPO_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {propertyKey === "industrial" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.lz_sec_ind_type}>
            <div className="grid grid-cols-1 gap-2">
              {LZ_IND_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={indType === k}
                  onClick={() => toggleChip(indType, k, setIndType)}
                >
                  {t[LZ_IND_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_yard}>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={yardSqm}
              onChange={(e) => setYardSqm(e.target.value)}
              placeholder={t.lz_yard_ph}
              className={inputClass}
            />
          </FilterSection>
          <FilterSection title={t.lz_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {LZ_IND_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={indFeatures[k]}
                    onCheckedChange={(c) =>
                      setIndFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[LZ_IND_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {propertyKey === "garazha" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.lz_sec_garage_type}>
            <div className="grid grid-cols-1 gap-2">
              {LZ_GAR_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={garType === k}
                  onClick={() => toggleChip(garType, k, setGarType)}
                >
                  {t[LZ_GAR_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_capacity}>
            <div className="grid grid-cols-2 gap-2">
              {LZ_GAR_CAP_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={garCap === k}
                  onClick={() => toggleChip(garCap, k, setGarCap)}
                >
                  {t[LZ_GAR_CAP_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.lz_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {LZ_GAR_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={garFeatures[k]}
                    onCheckedChange={(c) =>
                      setGarFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[LZ_GAR_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {/* Universal filters */}
      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.lz_sec_universal}</h3>

        <FilterSection title={t.lz_sec_sqm}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.lz_from}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={sqmMin}
                onChange={(e) => setSqmMin(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.lz_to}</span>
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                value={sqmMax}
                onChange={(e) => setSqmMax(e.target.value)}
                placeholder="500"
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.lz_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.lz_from}</span>
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
              <span className="text-sm text-gray-600">{t.lz_to}</span>
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

        <FilterSection title={t.lz_sec_location}>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.lz_city_lbl}</span>
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
              <Label htmlFor="lz-area" className="text-sm text-gray-600">
                {t.lz_area_lbl}
              </Label>
              <Input
                id="lz-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.lz_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.lz_sec_advanced}>
          <div className="grid grid-cols-1 gap-3">
            {LOKALE_UNIVERSAL_FILTER_KEYS.map((key) => (
              <label
                key={key}
                className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
              >
                <Checkbox
                  checked={universal[key]}
                  onCheckedChange={(c) =>
                    setUniversal((prev) => ({ ...prev, [key]: c === true }))
                  }
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-800">
                  {t[LOKALE_UNIVERSAL_LABEL_KEY[key]]}
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
        {t.lz_search_btn}
      </Button>
    </div>
  );
}

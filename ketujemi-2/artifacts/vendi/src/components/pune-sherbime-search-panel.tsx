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
import { Briefcase, Check, ChevronsUpDown, MapPin, Search } from "lucide-react";
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
  PS_ADMIN_KEYS,
  PS_ADMIN_LABEL_KEY,
  PS_ADMIN_SEARCH,
  PS_BUILD_KEYS,
  PS_BUILD_LABEL_KEY,
  PS_BUILD_SEARCH,
  PS_CITY_KEYS,
  PS_CITY_LABEL_KEY,
  PS_CITY_SEARCH,
  PS_CRAFT_KEYS,
  PS_CRAFT_LABEL_KEY,
  PS_CRAFT_SEARCH,
  PS_GASTRO_KEYS,
  PS_GASTRO_LABEL_KEY,
  PS_GASTRO_SEARCH,
  PS_IT_KEYS,
  PS_IT_LABEL_KEY,
  PS_IT_SEARCH,
  PS_MKT_KEYS,
  PS_MKT_LABEL_KEY,
  PS_MKT_SEARCH,
  PS_OFFER_KEYS,
  PS_OFFER_LABEL_KEY,
  PS_OFFER_SEARCH,
  PS_PAY_KEYS,
  PS_PAY_LABEL_KEY,
  PS_PAY_SEARCH,
  PS_TRANS_KEYS,
  PS_TRANS_LABEL_KEY,
  PS_TRANS_SEARCH,
  PS_TYPE_KEYS,
  PS_TYPE_LABEL_KEY,
  PS_TYPE_PHOTOS,
  getPuneSherbimeLeafCategoryIds,
  resolvePuneSherbimeTypeCategoryId,
  type PsAdminKey,
  type PsBuildKey,
  type PsCityKey,
  type PsCraftKey,
  type PsGastroKey,
  type PsItKey,
  type PsMktKey,
  type PsOfferKey,
  type PsPayKey,
  type PsTransKey,
  type PsTypeKey,
  type PuneSherbimeCategoryRow,
} from "@/lib/pune-sherbime-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: PuneSherbimeCategoryRow[];
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

export function PuneSherbimeSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const leafCsv = useMemo(() => {
    const ids = getPuneSherbimeLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<PsTypeKey | null>(null);
  const [adminKind, setAdminKind] = useState<PsAdminKey | "">("");
  const [itKind, setItKind] = useState<PsItKey | "">("");
  const [buildKind, setBuildKind] = useState<PsBuildKey | "">("");
  const [craftKind, setCraftKind] = useState<PsCraftKey | "">("");
  const [gastroKind, setGastroKind] = useState<PsGastroKey | "">("");
  const [mktKind, setMktKind] = useState<PsMktKey | "">("");
  const [transKind, setTransKind] = useState<PsTransKey | "">("");
  const [offerType, setOfferType] = useState<PsOfferKey | "">("");
  const [payMode, setPayMode] = useState<PsPayKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [cityKey, setCityKey] = useState<PsCityKey | "">("");
  const [cityOpen, setCityOpen] = useState(false);
  const [areaZone, setAreaZone] = useState("");

  const resetSubFilters = () => {
    setAdminKind("");
    setItKind("");
    setBuildKind("");
    setCraftKind("");
    setGastroKind("");
    setMktKind("");
    setTransKind("");
  };

  const selectType = (key: PsTypeKey) => {
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

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: leafCsv,
    };

    if (typeKey) {
      const cid = resolvePuneSherbimeTypeCategoryId(categories, hubId, typeKey);
      if (cid) {
        p.category_id = cid;
        delete p.category_ids;
      }
    }

    if (cityKey) p.location_search = PS_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    const zone = areaZone.trim();
    if (zone) searchBits.push(zone);

    if (typeKey === "administrate" && adminKind) {
      searchBits.push(PS_ADMIN_SEARCH[adminKind]);
    } else if (typeKey === "it_dizajn" && itKind) {
      searchBits.push(PS_IT_SEARCH[itKind]);
    } else if (typeKey === "ndertimtari" && buildKind) {
      searchBits.push(PS_BUILD_SEARCH[buildKind]);
    } else if (typeKey === "zejtari" && craftKind) {
      searchBits.push(PS_CRAFT_SEARCH[craftKind]);
    } else if (typeKey === "gastronomi" && gastroKind) {
      searchBits.push(PS_GASTRO_SEARCH[gastroKind]);
    } else if (typeKey === "marketing" && mktKind) {
      searchBits.push(PS_MKT_SEARCH[mktKind]);
    } else if (typeKey === "transporti" && transKind) {
      searchBits.push(PS_TRANS_SEARCH[transKind]);
    }

    if (offerType) searchBits.push(PS_OFFER_SEARCH[offerType]);
    if (payMode) searchBits.push(PS_PAY_SEARCH[payMode]);

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
    adminKind,
    itKind,
    buildKind,
    craftKind,
    gastroKind,
    mktKind,
    transKind,
    offerType,
    payMode,
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

  const cityLabel = cityKey ? t[PS_CITY_LABEL_KEY[cityKey]] : "";
  const typeTitle = typeKey ? t[PS_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Briefcase size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ps_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.ps_panel_sub}</p>
      </div>

      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.ps_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {PS_TYPE_KEYS.map((key) => {
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
                  src={PS_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[PS_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "administrate" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_ADMIN_KEYS}
              labelKey={PS_ADMIN_LABEL_KEY}
              selected={adminKind}
              onSelect={setAdminKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "it_dizajn" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_IT_KEYS}
              labelKey={PS_IT_LABEL_KEY}
              selected={itKind}
              onSelect={setItKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "ndertimtari" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_BUILD_KEYS}
              labelKey={PS_BUILD_LABEL_KEY}
              selected={buildKind}
              onSelect={setBuildKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "zejtari" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_CRAFT_KEYS}
              labelKey={PS_CRAFT_LABEL_KEY}
              selected={craftKind}
              onSelect={setCraftKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "gastronomi" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_GASTRO_KEYS}
              labelKey={PS_GASTRO_LABEL_KEY}
              selected={gastroKind}
              onSelect={setGastroKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "marketing" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_MKT_KEYS}
              labelKey={PS_MKT_LABEL_KEY}
              selected={mktKind}
              onSelect={setMktKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      {typeKey === "transporti" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.ps_sec_kind}>
            <KindChips
              keys={PS_TRANS_KEYS}
              labelKey={PS_TRANS_LABEL_KEY}
              selected={transKind}
              onSelect={setTransKind}
              t={t}
            />
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.ps_sec_universal}</h3>

        <FilterSection title={t.ps_sec_offer}>
          <div className="grid grid-cols-2 gap-2">
            {PS_OFFER_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={offerType === k}
                onClick={() => setOfferType(offerType === k ? "" : k)}
              >
                {t[PS_OFFER_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.ps_sec_payment}>
          <div className="grid grid-cols-2 gap-2">
            {PS_PAY_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={payMode === k}
                onClick={() => setPayMode(payMode === k ? "" : k)}
              >
                {t[PS_PAY_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.ps_sec_location}>
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
                        {PS_CITY_KEYS.map((ck) => (
                          <CommandItem
                            key={ck}
                            value={`${ck} ${PS_CITY_SEARCH[ck]} ${t[PS_CITY_LABEL_KEY[ck]]}`}
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
                            {t[PS_CITY_LABEL_KEY[ck]]}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ps-area" className="text-sm text-gray-600">
                {t.ps_area_lbl}
              </Label>
              <Input
                id="ps-area"
                value={areaZone}
                onChange={(e) => setAreaZone(e.target.value)}
                placeholder={t.ps_area_ph}
                className={inputClass}
              />
            </div>
          </div>
        </FilterSection>

        <FilterSection title={t.ps_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.ps_from}</span>
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
              <span className="text-sm text-gray-600">{t.ps_to}</span>
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
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.ps_search_btn}
      </Button>
    </div>
  );
}

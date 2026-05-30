import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Euro, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import {
  TEL_AKSESORE_SECTIONS,
  TEL_AKSESORE_LABEL_KEY,
  TEL_BRAND_GROUP_KEYS,
  TEL_BRAND_GROUP_LABEL_KEY,
  TEL_BRAND_GROUP_PHOTOS,
  TEL_BRAND_GROUP_SLUG,
  TELEFONA_HERO_PHOTO,
  TEL_DEVICE_KEYS,
  TEL_DEVICE_LABEL_KEY,
  TEL_DEVICE_PHOTOS,
  TEL_DEVICE_SEARCH,
  TEL_MARKET_CONDITION_KEYS,
  TEL_MARKET_CONDITION_LABEL_KEY,
  TEL_MARKET_CONDITION_SEARCH,
  TEL_NETWORK_KEYS,
  TEL_NETWORK_LABEL_KEY,
  TEL_NETWORK_SEARCH,
  TEL_OS_LABEL_KEY,
  TEL_OS_SEARCH,
  TEL_OTHER_BRAND_KEYS,
  TEL_OTHER_BRAND_LABEL_KEY,
  TEL_QUICK_FILTER_KEYS,
  TEL_QUICK_FILTER_LABEL_KEY,
  TEL_QUICK_FILTER_SEARCH,
  TEL_RAM_LABEL_KEY,
  TEL_RAM_SEARCH,
  TEL_SMARTPHONE_SUB_EXTRA_SEARCH,
  TEL_SMARTPHONE_SUB_KEYS,
  TEL_SMARTPHONE_SUB_LABEL_KEY,
  TEL_SMARTPHONE_SUB_SEARCH,
  TEL_STORAGE_LABEL_KEY,
  TEL_STORAGE_SEARCH,
  TEL_CAPACITY_LABEL_KEY,
  TEL_CAPACITY_SEARCH,
  TEL_COMPAT_PICKER_BRANDS,
  applyTelSubcategoryPrice,
  getTelBrandGroupModels,
  getTelCapacityKeysForBrand,
  getTelCompatPickerModels,
  getTelOsKeysForBrand,
  getTelRamKeysForBrand,
  getTelStorageKeysForBrand,
  getTelefonaHubChildCategoryIds,
  resolveTelDeviceCategoryIds,
  resolveTelefonaCategoryIdBySlug,
  telAksesoreItemSearch,
  telAksesoreItemSlug,
  type TelAksesoreItemKey,
  type TelBrandGroupKey,
  type TelCapacityKey,
  type TelCompatPickerBrand,
  type TelDeviceKey,
  type TelMarketConditionKey,
  type TelNetworkKey,
  type TelOsKey,
  type TelOtherBrandKey,
  type TelQuickFilterKey,
  type TelRamKey,
  type TelSmartphoneSubKey,
  type TelStorageKey,
  type TelefonaCategoryRow,
} from "@/lib/telefona-search-helpers";

type Props = {
  hubId: number;
  categories: TelefonaCategoryRow[];
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
        "rounded-xl border px-3 py-2.5 min-h-11 text-xs sm:text-sm font-semibold text-left transition-colors touch-manipulation",
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

export function TelefonaSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const defaultCsv = useMemo(() => {
    const ids = getTelefonaHubChildCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [deviceKey, setDeviceKey] = useState<TelDeviceKey | null>(null);
  const [smartphoneSub, setSmartphoneSub] = useState<TelSmartphoneSubKey | null>(null);
  const [quickFilters, setQuickFilters] = useState<Partial<Record<TelQuickFilterKey, boolean>>>({});
  const [marketCondition, setMarketCondition] = useState<TelMarketConditionKey | "">("");
  const [brandGroup, setBrandGroup] = useState<TelBrandGroupKey | null>(null);
  const [otherBrand, setOtherBrand] = useState<TelOtherBrandKey | "">("");
  const [model, setModel] = useState("");
  const [storage, setStorage] = useState<TelStorageKey | "">("");
  const [ram, setRam] = useState<TelRamKey | "">("");
  const [network, setNetwork] = useState<TelNetworkKey | "">("");
  const [capacity, setCapacity] = useState<TelCapacityKey | "">("");
  const [osKey, setOsKey] = useState<TelOsKey | "">("");
  const [aksesoreItem, setAksesoreItem] = useState<TelAksesoreItemKey | "">("");
  const [compatBrand, setCompatBrand] = useState<TelCompatPickerBrand | "">("");
  const [compatModel, setCompatModel] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const isSmartphones = deviceKey === "smartphones";
  const isAksesore = deviceKey === "aksesore_pjese";
  const isWearable =
    deviceKey === "smartwatches" || deviceKey === "smart_bands" || deviceKey === "e_readers";

  const modelOptions = useMemo(
    () => getTelBrandGroupModels(brandGroup, otherBrand || null),
    [brandGroup, otherBrand],
  );

  const storageKeys = useMemo(() => getTelStorageKeysForBrand(brandGroup), [brandGroup]);
  const ramKeys = useMemo(() => getTelRamKeysForBrand(brandGroup), [brandGroup]);
  const capacityKeys = useMemo(() => getTelCapacityKeysForBrand(brandGroup), [brandGroup]);
  const osKeys = useMemo(() => getTelOsKeysForBrand(brandGroup), [brandGroup]);

  const compatModels = useMemo(() => getTelCompatPickerModels(compatBrand), [compatBrand]);

  const resetBrandFilters = () => {
    setOtherBrand("");
    setModel("");
    setStorage("");
    setRam("");
    setNetwork("");
    setCapacity("");
    setOsKey("");
  };

  const selectDevice = (key: TelDeviceKey) => {
    const next = deviceKey === key ? null : key;
    setDeviceKey(next);
    setSmartphoneSub(null);
    setQuickFilters({});
    setMarketCondition("");
    setBrandGroup(null);
    resetBrandFilters();
    setAksesoreItem("");
    setCompatBrand("");
    setCompatModel("");
  };

  const selectBrandGroup = (key: TelBrandGroupKey) => {
    const next = brandGroup === key ? null : key;
    setBrandGroup(next);
    resetBrandFilters();
    if (next) {
      if (deviceKey === "aksesore_pjese") setDeviceKey("smartphones");
      if (next === "apple") setOsKey("ios");
      else setOsKey("android");
    }
  };

  useEffect(() => {
    if (model && !modelOptions.includes(model)) setModel("");
  }, [model, modelOptions]);

  useEffect(() => {
    if (storage && !storageKeys.includes(storage)) setStorage("");
  }, [storage, storageKeys]);

  useEffect(() => {
    if (ram && !ramKeys.includes(ram)) setRam("");
  }, [ram, ramKeys]);

  useEffect(() => {
    if (capacity && !capacityKeys.includes(capacity)) setCapacity("");
  }, [capacity, capacityKeys]);

  useEffect(() => {
    if (osKey && !osKeys.includes(osKey)) setOsKey(osKeys[0] ?? "");
  }, [osKey, osKeys]);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (): GetListingsParams => {
    const p: GetListingsParams = {
      page: 1,
      limit: 20,
      category_ids: defaultCsv,
    };

    if (deviceKey) {
      const typeIds = resolveTelDeviceCategoryIds(categories, hubId, deviceKey);
      if (typeIds.length === 1) {
        p.category_id = typeIds[0];
        delete p.category_ids;
      } else if (typeIds.length > 1) {
        p.category_ids = [...typeIds].sort((a, b) => a - b).join(",");
      }

      if (
        brandGroup &&
        brandGroup !== "other_brands" &&
        deviceKey !== "aksesore_pjese"
      ) {
        const brandSlug = TEL_BRAND_GROUP_SLUG[brandGroup];
        if (brandSlug) {
          const cid = resolveTelefonaCategoryIdBySlug(categories, hubId, brandSlug);
          if (cid) {
            p.category_id = cid;
            delete p.category_ids;
          }
        }
      }

      if (isAksesore && aksesoreItem) {
        const slug = telAksesoreItemSlug(aksesoreItem);
        if (slug) {
          const cid = resolveTelefonaCategoryIdBySlug(categories, hubId, slug);
          if (cid) {
            p.category_id = cid;
            delete p.category_ids;
          }
        }
      }
    }

    const searchBits: string[] = [];

    if (deviceKey) searchBits.push(TEL_DEVICE_SEARCH[deviceKey]);

    if (isSmartphones && smartphoneSub) {
      searchBits.push(TEL_SMARTPHONE_SUB_SEARCH[smartphoneSub]);
      searchBits.push(TEL_SMARTPHONE_SUB_EXTRA_SEARCH[smartphoneSub]);
    }

    if (marketCondition) searchBits.push(TEL_MARKET_CONDITION_SEARCH[marketCondition]);

    for (const qk of TEL_QUICK_FILTER_KEYS) {
      if (quickFilters[qk]) searchBits.push(TEL_QUICK_FILTER_SEARCH[qk]);
    }

    if (brandGroup === "other_brands" && otherBrand) {
      searchBits.push(t[TEL_OTHER_BRAND_LABEL_KEY[otherBrand]]);
    }

    if (model) searchBits.push(model);
    if (storage) searchBits.push(TEL_STORAGE_SEARCH[storage]);
    if (ram) searchBits.push(TEL_RAM_SEARCH[ram]);
    if (network) searchBits.push(TEL_NETWORK_SEARCH[network]);
    if (capacity) searchBits.push(TEL_CAPACITY_SEARCH[capacity]);
    if (osKey) searchBits.push(TEL_OS_SEARCH[osKey]);

    if (isAksesore && aksesoreItem) searchBits.push(telAksesoreItemSearch(aksesoreItem));
    if (isAksesore && compatModel) searchBits.push(compatModel);

    if (searchBits.length) p.search = searchBits.join(" ");

    const minP = parseFloat(priceMin.replace(",", "."));
    const maxP = parseFloat(priceMax.replace(",", "."));
    const manualMin = Number.isFinite(minP) && priceMin.trim() ? minP : undefined;
    const manualMax = Number.isFinite(maxP) && priceMax.trim() ? maxP : undefined;

    if (isSmartphones && smartphoneSub) {
      applyTelSubcategoryPrice(p, smartphoneSub, manualMin, manualMax);
    } else {
      if (manualMin != null) p.min_price = manualMin;
      if (manualMax != null) p.max_price = manualMax;
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
    defaultCsv,
    hubId,
    deviceKey,
    smartphoneSub,
    quickFilters,
    marketCondition,
    brandGroup,
    otherBrand,
    model,
    storage,
    ram,
    network,
    capacity,
    osKey,
    aksesoreItem,
    compatBrand,
    compatModel,
    priceMin,
    priceMax,
    categories,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  const toggleQuick = (key: TelQuickFilterKey) => {
    setQuickFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Smartphone size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.tel_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.tel_panel_sub}</p>
      </div>

      <section className="space-y-3 max-w-full overflow-hidden">
        <Label className="text-sm font-bold text-gray-900">{t.tel_sec_device}</Label>
        <CategoryPhotoPickerGrid>
          {TEL_DEVICE_KEYS.map((key) => (
            <CategoryPhotoPickerCard
              key={key}
              layout="grid"
              selected={deviceKey === key}
              onClick={() => selectDevice(key)}
              imageSrc={TEL_DEVICE_PHOTOS[key]}
              fallbackImageSrc={TELEFONA_HERO_PHOTO}
              imageAlt={t[TEL_DEVICE_LABEL_KEY[key]]}
              label={t[TEL_DEVICE_LABEL_KEY[key]]}
            />
          ))}
        </CategoryPhotoPickerGrid>
      </section>

      <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/30 p-3 sm:p-4 max-w-full overflow-hidden">
        <Label className="text-sm font-bold text-gray-900">{t.tel_sec_brand}</Label>
        <CategoryPhotoPickerGrid>
          {TEL_BRAND_GROUP_KEYS.map((key) => (
            <CategoryPhotoPickerCard
              key={key}
              layout="grid"
              selected={brandGroup === key}
              onClick={() => selectBrandGroup(key)}
              imageSrc={TEL_BRAND_GROUP_PHOTOS[key]}
              fallbackImageSrc={TELEFONA_HERO_PHOTO}
              imageAlt={t[TEL_BRAND_GROUP_LABEL_KEY[key]]}
              label={t[TEL_BRAND_GROUP_LABEL_KEY[key]]}
            />
          ))}
        </CategoryPhotoPickerGrid>
      </section>

      {brandGroup === "other_brands" && (
        <section className="space-y-3">
          <Label className="text-sm font-bold text-gray-900">{t.tel_sec_other_brands}</Label>
          <div className="flex flex-wrap gap-2">
            {TEL_OTHER_BRAND_KEYS.map((ob) => (
              <ChipButton
                key={ob}
                selected={otherBrand === ob}
                onClick={() => {
                  setOtherBrand(otherBrand === ob ? "" : ob);
                  setModel("");
                }}
              >
                {t[TEL_OTHER_BRAND_LABEL_KEY[ob]]}
              </ChipButton>
            ))}
          </div>
        </section>
      )}

      {isSmartphones && (
        <section className="space-y-3">
          <Label className="text-sm font-bold text-gray-900">{t.tel_sec_subcategory}</Label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {TEL_SMARTPHONE_SUB_KEYS.map((sk) => (
              <ChipButton
                key={sk}
                selected={smartphoneSub === sk}
                onClick={() => setSmartphoneSub(smartphoneSub === sk ? null : sk)}
                className="shrink-0 whitespace-nowrap"
              >
                {t[TEL_SMARTPHONE_SUB_LABEL_KEY[sk]]}
              </ChipButton>
            ))}
          </div>
        </section>
      )}

      {(isSmartphones || isWearable) && (
        <section className="space-y-3">
          <Label className="text-sm font-bold text-gray-900">{t.tel_sec_market_condition}</Label>
          <RadioGroup
            value={marketCondition}
            onValueChange={(v) => setMarketCondition(v as TelMarketConditionKey)}
            className="grid grid-cols-1 gap-2"
          >
            {TEL_MARKET_CONDITION_KEYS.map((ck) => (
              <label
                key={ck}
                htmlFor={`tel-mcond-${ck}`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 min-h-12 cursor-pointer transition-colors touch-manipulation",
                  marketCondition === ck
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200",
                )}
              >
                <RadioGroupItem id={`tel-mcond-${ck}`} value={ck} className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium text-gray-800">
                  {t[TEL_MARKET_CONDITION_LABEL_KEY[ck]]}
                </span>
              </label>
            ))}
          </RadioGroup>
        </section>
      )}

      {isSmartphones && (
        <section className="space-y-3">
          <Label className="text-sm font-bold text-gray-900">{t.tel_sec_quick_filters}</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TEL_QUICK_FILTER_KEYS.map((qk) => (
              <ChipButton
                key={qk}
                selected={!!quickFilters[qk]}
                onClick={() => toggleQuick(qk)}
              >
                {t[TEL_QUICK_FILTER_LABEL_KEY[qk]]}
              </ChipButton>
            ))}
          </div>
        </section>
      )}

      {brandGroup && deviceKey !== "aksesore_pjese" && (
        <>
          {modelOptions.length > 0 && (
            <section className="space-y-3">
              <Label className="text-sm font-bold text-gray-900">{t.tel_sec_model}</Label>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                {modelOptions.map((m) => (
                  <ChipButton
                    key={m}
                    selected={model === m}
                    onClick={() => setModel(model === m ? "" : m)}
                    className="whitespace-normal"
                  >
                    {m}
                  </ChipButton>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <Label className="text-sm font-bold text-gray-900">{t.tel_sec_storage}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {storageKeys.map((sk) => (
                <ChipButton
                  key={sk}
                  selected={storage === sk}
                  onClick={() => setStorage(storage === sk ? "" : sk)}
                >
                  {t[TEL_STORAGE_LABEL_KEY[sk]]}
                </ChipButton>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-bold text-gray-900">{t.tel_sec_ram}</Label>
            <div className="flex flex-wrap gap-2">
              {ramKeys.map((rk) => (
                <ChipButton
                  key={rk}
                  selected={ram === rk}
                  onClick={() => setRam(ram === rk ? "" : rk)}
                >
                  {t[TEL_RAM_LABEL_KEY[rk]]}
                </ChipButton>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-bold text-gray-900">{t.tel_sec_network}</Label>
            <div className="flex flex-wrap gap-2">
              {TEL_NETWORK_KEYS.map((nk) => (
                <ChipButton
                  key={nk}
                  selected={network === nk}
                  onClick={() => setNetwork(network === nk ? "" : nk)}
                >
                  {t[TEL_NETWORK_LABEL_KEY[nk]]}
                </ChipButton>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <Label className="text-sm font-bold text-gray-900">{t.tel_sec_capacity}</Label>
            <div className="flex flex-wrap gap-2">
              {capacityKeys.map((ck) => (
                <ChipButton
                  key={ck}
                  selected={capacity === ck}
                  onClick={() => setCapacity(capacity === ck ? "" : ck)}
                >
                  {t[TEL_CAPACITY_LABEL_KEY[ck]]}
                </ChipButton>
              ))}
            </div>
          </section>

          {osKeys.length > 0 && (
            <section className="space-y-3">
              <Label className="text-sm font-bold text-gray-900">{t.tel_sec_os}</Label>
              <div className="flex flex-wrap gap-2">
                {osKeys.map((ok) => (
                  <ChipButton
                    key={ok}
                    selected={osKey === ok}
                    onClick={() => setOsKey(osKey === ok ? "" : ok)}
                  >
                    {t[TEL_OS_LABEL_KEY[ok]]}
                  </ChipButton>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {isAksesore && (
        <>
          <section className="space-y-4 rounded-xl border border-gray-100 p-3 sm:p-4">
            <div>
              <p className="text-sm font-bold text-gray-900">{t.tel_compat_title}</p>
              <p className="text-xs text-gray-500 mt-1">{t.tel_compat_hint}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                value={compatBrand || "__none__"}
                onValueChange={(v) => {
                  setCompatBrand(v === "__none__" ? "" : (v as TelCompatPickerBrand));
                  setCompatModel("");
                }}
              >
                <SelectTrigger className="min-h-12 h-12 text-[16px]">
                  <SelectValue placeholder={t.tel_compat_brand_ph} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t.tel_compat_brand_ph}</SelectItem>
                  {TEL_COMPAT_PICKER_BRANDS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {t[TEL_BRAND_GROUP_LABEL_KEY[b]]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={compatModel || "__none__"}
                onValueChange={(v) => setCompatModel(v === "__none__" ? "" : v)}
                disabled={!compatBrand}
              >
                <SelectTrigger className="min-h-12 h-12 text-[16px]">
                  <SelectValue placeholder={t.tel_compat_model_ph} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t.tel_compat_model_ph}</SelectItem>
                  {compatModels.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          {TEL_AKSESORE_SECTIONS.map((sec) => (
            <section key={sec.titleKey} className="space-y-3">
              <Label className="text-sm font-bold text-gray-900">{t[sec.titleKey]}</Label>
              <div className="flex flex-wrap gap-2">
                {sec.itemKeys.map((ik) => (
                  <ChipButton
                    key={ik}
                    selected={aksesoreItem === ik}
                    onClick={() => setAksesoreItem(aksesoreItem === ik ? "" : ik)}
                    className="whitespace-normal"
                  >
                    {t[TEL_AKSESORE_LABEL_KEY[ik]]}
                  </ChipButton>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <section className="space-y-3">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Euro size={18} className="text-blue-600 shrink-0" aria-hidden />
          {t.tel_sec_price}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-sm text-gray-600">{t.tel_from}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="min-h-12 h-12 text-[16px]"
            />
          </div>
          <div className="space-y-2">
            <span className="text-sm text-gray-600">{t.tel_to}</span>
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="1500"
              className="min-h-12 h-12 text-[16px]"
            />
          </div>
        </div>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        {previewLoading
          ? t.tel_search_btn
          : previewTotal != null
            ? `${t.tel_search_btn} (${previewTotal})`
            : t.tel_search_btn}
      </Button>
    </div>
  );
}

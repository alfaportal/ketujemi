import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Dumbbell, Euro, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMarket } from "@/lib/market-context";
import { fillCount } from "@/lib/app-extra-i18n";
import {
  SPORT_BIKE_SIZES,
  SPORT_BIKE_TYPE_KEYS,
  SPORT_BIKE_TYPE_LABEL_KEY,
  SPORT_BIKE_TYPE_SEARCH,
  SPORT_CONDITION_SEARCH,
  SPORT_DEVICE_LABEL_KEY,
  SPORT_DEVICE_SEARCH,
  SPORT_DEVICE_SECTIONS,
  SPORT_GENDER_KEYS,
  SPORT_GENDER_LABEL_KEY,
  SPORT_GENDER_SEARCH,
  SPORT_TYPE_INTRO_KEY,
  SPORT_TYPE_KEYS,
  SPORT_TYPE_LABEL_KEY,
  SPORT_TYPE_PHOTOS,
  resolveSportDevicePhoto,
  resolveSportTypeCategoryId,
  type SportBikeTypeKey,
  type SportDeviceKey,
  type SportGenderKey,
  type SportOutdoorCategoryRow,
  type SportTypeKey,
} from "@/lib/sport-outdoor-search-helpers";

const triggerClass = "min-h-12 h-12 w-full text-[16px] md:min-h-12 md:h-12";

export type SportOutdoorSearchVariant = "hub" | "type" | "leaf";

type Props = {
  variant: SportOutdoorSearchVariant;
  hubId: number;
  scopeCategoryId?: number;
  sportTypeKey?: SportTypeKey | null;
  deviceKey?: SportDeviceKey | null;
  categories: SportOutdoorCategoryRow[];
  onNavigateToCategory: (childCategoryId: number) => void;
  onNavigateToDevice: (deviceKey: SportDeviceKey) => void;
  previewTotal?: number | null;
  previewLoading?: boolean;
  onListingParamsChange?: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function SportOutdoorSearchPanel({
  variant,
  hubId,
  scopeCategoryId,
  sportTypeKey,
  deviceKey,
  categories,
  onNavigateToCategory,
  onNavigateToDevice,
  previewTotal = null,
  previewLoading = false,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();
  const isFinalPage = variant === "leaf";

  const [condNew, setCondNew] = useState(false);
  const [condUsed, setCondUsed] = useState(false);
  const [bikeSize, setBikeSize] = useState("");
  const [bikeType, setBikeType] = useState<SportBikeTypeKey | "">("");
  const [gender, setGender] = useState<SportGenderKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const showBikeFilters = sportTypeKey === "bike";
  const deviceSections = sportTypeKey ? SPORT_DEVICE_SECTIONS[sportTypeKey] : [];

  useEffect(() => {
    if (!showBikeFilters) {
      setBikeSize("");
      setBikeType("");
    }
  }, [showBikeFilters, sportTypeKey]);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (scopeCategoryId) params.category_id = scopeCategoryId;

    const searchBits: string[] = [];
    if (deviceKey) {
      const deviceLabel = t[SPORT_DEVICE_LABEL_KEY[deviceKey]];
      const deviceSearch = SPORT_DEVICE_SEARCH[deviceKey];
      if (deviceLabel) searchBits.push(deviceLabel);
      if (deviceSearch) searchBits.push(deviceSearch);
    }
    if (condNew) searchBits.push(SPORT_CONDITION_SEARCH.new);
    if (condUsed) searchBits.push(SPORT_CONDITION_SEARCH.used);
    if (bikeSize) searchBits.push(bikeSize);
    if (bikeType) searchBits.push(SPORT_BIKE_TYPE_SEARCH[bikeType]);
    if (gender) searchBits.push(SPORT_GENDER_SEARCH[gender]);

    if (searchBits.length) params.search = searchBits.join(" ");

    const min = priceMin.trim() ? Number(priceMin) : undefined;
    const max = priceMax.trim() ? Number(priceMax) : undefined;
    if (min != null && Number.isFinite(min) && min >= 0) params.price_min = min;
    if (max != null && Number.isFinite(max) && max >= 0) params.price_max = max;

    return params;
  };

  useEffect(() => {
    if (!isFinalPage || !callbackRef.current || !scopeCategoryId || !deviceKey) return;
    const timer = window.setTimeout(() => {
      callbackRef.current?.(buildParams());
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- leaf listings only
  }, [
    isFinalPage,
    scopeCategoryId,
    deviceKey,
    condNew,
    condUsed,
    bikeSize,
    bikeType,
    gender,
    priceMin,
    priceMax,
  ]);

  const handleSearch = () => {
    if (!isFinalPage) return;
    callbackRef.current?.(buildParams());
    onScrollToResults?.();
  };

  const countLabel =
    previewLoading || previewTotal == null
      ? t.so_search_btn
      : fillCount(t.hub_show_listings_m, String(previewTotal));

  const typeSelectOptions = useMemo(() => {
    return SPORT_TYPE_KEYS.map((key) => ({
      key,
      id: resolveSportTypeCategoryId(categories, hubId, key),
      label: t[SPORT_TYPE_LABEL_KEY[key]] ?? key,
    })).filter((o) => o.id != null);
  }, [categories, hubId, t]);

  const deviceSelectOptions = useMemo(() => {
    if (!sportTypeKey) return [];
    return deviceSections.flatMap((section) =>
      section.itemKeys.map((k) => ({
        key: k,
        group: t[section.groupLabelKey],
        label: t[SPORT_DEVICE_LABEL_KEY[k]],
      })),
    );
  }, [sportTypeKey, deviceSections, t]);

  const handleTypeSelect = (value: string) => {
    const row = typeSelectOptions.find((o) => String(o.id) === value);
    if (row?.id) onNavigateToCategory(row.id);
  };

  const handleDeviceSelect = (value: string) => {
    if (value && value !== deviceKey) {
      onNavigateToDevice(value as SportDeviceKey);
    }
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      {variant === "hub" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Dumbbell size={20} className="text-blue-600 shrink-0" aria-hidden />
              {t.so_sec_sport_types}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{t.so_hub_pick_hint}</p>
          </div>
          <CategoryPhotoPickerGrid>
            {SPORT_TYPE_KEYS.map((key) => {
              const cid = resolveSportTypeCategoryId(categories, hubId, key);
              const label = t[SPORT_TYPE_LABEL_KEY[key]] ?? key;
              return (
                <CategoryPhotoPickerCard
                  key={key}
                  onClick={() => {
                    if (cid) onNavigateToCategory(cid);
                  }}
                  imageSrc={SPORT_TYPE_PHOTOS[key]}
                  label={label}
                />
              );
            })}
          </CategoryPhotoPickerGrid>
        </section>
      ) : null}

      {variant === "type" && sportTypeKey ? (
        <>
          <section className="space-y-2 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
            <h2 className="text-lg font-black text-gray-900">
              {t[SPORT_TYPE_LABEL_KEY[sportTypeKey]]}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t[SPORT_TYPE_INTRO_KEY[sportTypeKey]] ?? t.so_type_pick_hint}
            </p>
          </section>

          {deviceSections.map((section) => (
            <section key={section.groupLabelKey} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                {t[section.groupLabelKey]}
              </h3>
              <CategoryPhotoPickerGrid>
                {section.itemKeys.map((k) => (
                  <CategoryPhotoPickerCard
                    key={k}
                    onClick={() => onNavigateToDevice(k)}
                    imageSrc={resolveSportDevicePhoto(k, sportTypeKey)}
                    label={t[SPORT_DEVICE_LABEL_KEY[k]]}
                  />
                ))}
              </CategoryPhotoPickerGrid>
            </section>
          ))}
        </>
      ) : null}

      {variant === "leaf" && sportTypeKey && deviceKey ? (
        <>
          <section className="space-y-1 rounded-xl bg-blue-50/60 border border-blue-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {t[SPORT_TYPE_LABEL_KEY[sportTypeKey]]}
            </p>
            <h2 className="text-lg font-black text-gray-900">
              {t[SPORT_DEVICE_LABEL_KEY[deviceKey]]}
            </h2>
            <p className="text-sm text-gray-600">{t.so_leaf_filter_hint}</p>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.so_sec_condition}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
                <Checkbox
                  checked={condNew}
                  onCheckedChange={(c) => setCondNew(c === true)}
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-800">{t.so_cond_new}</span>
              </label>
              <label className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation">
                <Checkbox
                  checked={condUsed}
                  onCheckedChange={(c) => setCondUsed(c === true)}
                  className="h-5 w-5"
                />
                <span className="text-sm font-medium text-gray-800">{t.so_cond_used}</span>
              </label>
            </div>
          </section>

          {showBikeFilters ? (
            <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <p className="text-sm font-bold text-gray-900">{t.so_sec_bike}</p>
              <div className="space-y-2">
                <Label htmlFor="so-bike-size" className="text-sm font-semibold text-gray-700">
                  {t.so_bike_size}
                </Label>
                <Select
                  value={bikeSize || "__any__"}
                  onValueChange={(v) => setBikeSize(v === "__any__" ? "" : v)}
                >
                  <SelectTrigger id="so-bike-size" className={triggerClass}>
                    <SelectValue placeholder={t.so_bike_size_any} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__" className="min-h-11">
                      {t.so_bike_size_any}
                    </SelectItem>
                    {SPORT_BIKE_SIZES.map((s) => (
                      <SelectItem key={s} value={s} className="min-h-11">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="so-bike-type" className="text-sm font-semibold text-gray-700">
                  {t.so_bike_type}
                </Label>
                <Select
                  value={bikeType || "__any__"}
                  onValueChange={(v) => setBikeType(v === "__any__" ? "" : (v as SportBikeTypeKey))}
                >
                  <SelectTrigger id="so-bike-type" className={triggerClass}>
                    <SelectValue placeholder={t.so_bike_type_any} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__any__" className="min-h-11">
                      {t.so_bike_type_any}
                    </SelectItem>
                    {SPORT_BIKE_TYPE_KEYS.map((k) => (
                      <SelectItem key={k} value={k} className="min-h-11">
                        {t[SPORT_BIKE_TYPE_LABEL_KEY[k]]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>
          ) : null}

          <section className="space-y-2">
            <Label htmlFor="so-gender" className="text-sm font-bold text-gray-900">
              {t.so_sec_gender}
            </Label>
            <Select
              value={gender || "__any__"}
              onValueChange={(v) => setGender(v === "__any__" ? "" : (v as SportGenderKey))}
            >
              <SelectTrigger id="so-gender" className={triggerClass}>
                <SelectValue placeholder={t.so_gender_any} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__" className="min-h-11">
                  {t.so_gender_any}
                </SelectItem>
                {SPORT_GENDER_KEYS.map((k) => (
                  <SelectItem key={k} value={k} className="min-h-11">
                    {t[SPORT_GENDER_LABEL_KEY[k]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section className="space-y-3">
            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Euro size={18} className="text-blue-600 shrink-0" aria-hidden />
              {t.so_sec_price}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="so-price-min" className="text-sm text-gray-600">
                  {t.so_price_from}
                </Label>
                <Input
                  id="so-price-min"
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
                <Label htmlFor="so-price-max" className="text-sm text-gray-600">
                  {t.so_price_to}
                </Label>
                <Input
                  id="so-price-max"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="500"
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
            <Search size={18} className="mr-2 shrink-0" aria-hidden />
            {countLabel}
          </Button>
        </>
      ) : null}

      {variant !== "leaf" ? (
        <section className="space-y-4 border-t border-gray-100 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variant === "hub" ? (
              <div className="min-w-0 md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  {t.so_sec_sport_types}
                </label>
                <Select onValueChange={handleTypeSelect}>
                  <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                    <SelectValue placeholder={t.so_hub_dropdown_placeholder} />
                  </SelectTrigger>
                  <SelectContent className="!max-h-[300px]">
                    {typeSelectOptions.map((o) => (
                      <SelectItem key={o.key} value={String(o.id)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {variant === "type" && sportTypeKey ? (
              <div className="min-w-0 md:col-span-2">
                <label className="text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide">
                  {t.so_sec_equipment}
                </label>
                <Select onValueChange={handleDeviceSelect}>
                  <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                    <SelectValue placeholder={t.so_type_pick_hint} />
                  </SelectTrigger>
                  <SelectContent className="!max-h-[min(70vh,360px)]">
                    {deviceSelectOptions.map((o) => (
                      <SelectItem key={o.key} value={o.key} className="min-h-11">
                        {o.group} — {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}

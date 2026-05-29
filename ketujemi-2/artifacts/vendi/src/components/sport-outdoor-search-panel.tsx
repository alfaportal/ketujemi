import { useEffect, useMemo, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Dumbbell, Euro, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerRow,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
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
  SPORT_TYPE_KEYS,
  SPORT_TYPE_LABEL_KEY,
  SPORT_TYPE_PHOTOS,
  getSportOutdoorLeafCategoryIds,
  resolveSportTypeCategoryId,
  type SportBikeTypeKey,
  type SportDeviceKey,
  type SportGenderKey,
  type SportOutdoorCategoryRow,
  type SportTypeKey,
} from "@/lib/sport-outdoor-search-helpers";

const triggerClass = "min-h-12 h-12 w-full text-[16px] md:min-h-12 md:h-12";

type Props = {
  hubId: number;
  categories: SportOutdoorCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

export function SportOutdoorSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const defaultCsv = useMemo(() => {
    const ids = getSportOutdoorLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [sportKey, setSportKey] = useState<SportTypeKey | null>(null);
  const [deviceKey, setDeviceKey] = useState<SportDeviceKey | "">("");
  const [condNew, setCondNew] = useState(false);
  const [condUsed, setCondUsed] = useState(false);
  const [bikeSize, setBikeSize] = useState("");
  const [bikeType, setBikeType] = useState<SportBikeTypeKey | "">("");
  const [gender, setGender] = useState<SportGenderKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const showBikeFilters = sportKey === "bike";
  const deviceSections = sportKey ? SPORT_DEVICE_SECTIONS[sportKey] : [];

  useEffect(() => {
    setDeviceKey("");
  }, [sportKey]);

  useEffect(() => {
    if (!showBikeFilters) {
      setBikeSize("");
      setBikeType("");
    }
  }, [showBikeFilters]);

  useEffect(() => {
    if (deviceKey && sportKey) {
      const allowed = deviceSections.flatMap((s) => s.itemKeys);
      if (!allowed.includes(deviceKey)) setDeviceKey("");
    }
  }, [deviceKey, sportKey, deviceSections]);

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (sportKey) {
      const cid = resolveSportTypeCategoryId(categories, hubId, sportKey);
      if (cid) params.category_id = cid;
      else if (defaultCsv) params.category_ids = defaultCsv;
    } else if (defaultCsv) {
      params.category_ids = defaultCsv;
    }

    const searchBits: string[] = [];
    if (sportKey) {
      const label = t[SPORT_TYPE_LABEL_KEY[sportKey]];
      if (label) searchBits.push(label);
    }

    if (deviceKey) searchBits.push(SPORT_DEVICE_SEARCH[deviceKey]);

    if (condNew && !condUsed) searchBits.push(SPORT_CONDITION_SEARCH.new);
    else if (condUsed && !condNew) searchBits.push(SPORT_CONDITION_SEARCH.used);

    if (showBikeFilters) {
      if (bikeSize) searchBits.push(bikeSize);
      if (bikeType) searchBits.push(SPORT_BIKE_TYPE_SEARCH[bikeType]);
    }

    if (gender) searchBits.push(SPORT_GENDER_SEARCH[gender]);

    if (searchBits.length) params.search = searchBits.join(" ");

    const pMin = priceMin.trim() ? parseFloat(priceMin) : NaN;
    const pMax = priceMax.trim() ? parseFloat(priceMax) : NaN;
    if (Number.isFinite(pMin) && pMin >= 0) params.min_price = pMin;
    if (Number.isFinite(pMax) && pMax >= 0) params.max_price = pMax;

    return params;
  };

  useEffect(() => {
    onListingParamsChange(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- live preview
  }, [
    sportKey,
    deviceKey,
    condNew,
    condUsed,
    bikeSize,
    bikeType,
    gender,
    priceMin,
    priceMax,
    defaultCsv,
    hubId,
    categories,
    onListingParamsChange,
    showBikeFilters,
  ]);

  const handleSearch = () => {
    onListingParamsChange(buildParams());
    onScrollToResults?.();
  };

  const countLabel =
    previewLoading || previewTotal == null
      ? t.so_search_btn
      : fillCount(t.hub_show_listings_m, String(previewTotal));

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      {/* Section 1 — sport type cards */}
      <section className="space-y-3">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Dumbbell size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.so_sec_sport_types}
        </h2>
        <CategoryPhotoPickerRow>
          {SPORT_TYPE_KEYS.map((key) => {
            const selected = sportKey === key;
            const label = t[SPORT_TYPE_LABEL_KEY[key]] ?? key;
            return (
              <CategoryPhotoPickerCard
                key={key}
                selected={selected}
                onClick={() => {
                  setSportKey(selected ? null : key);
                  if (!selected) setDeviceKey("");
                }}
                imageSrc={SPORT_TYPE_PHOTOS[key]}
                label={label}
              />
            );
          })}
        </CategoryPhotoPickerRow>
      </section>

      {/* Section 2 — equipment */}
      <section className="space-y-2">
        <Label htmlFor="so-equipment" className="text-sm font-bold text-gray-900">
          {t.so_sec_equipment}
        </Label>
        <Select
          key={sportKey ?? "__none__"}
          value={deviceKey || "__any__"}
          onValueChange={(v) => setDeviceKey(v === "__any__" ? "" : (v as SportDeviceKey))}
          disabled={!sportKey}
        >
          <SelectTrigger id="so-equipment" className={triggerClass}>
            <SelectValue placeholder={t.so_equip_any}>
              {deviceKey ? t[SPORT_DEVICE_LABEL_KEY[deviceKey]] : t.so_equip_any}
            </SelectValue>
          </SelectTrigger>
          <SelectContent className="max-h-[min(70vh,360px)]">
            <SelectItem value="__any__" className="min-h-11">
              {t.so_equip_any}
            </SelectItem>
            {deviceSections.map((section) => (
              <SelectGroup key={section.groupLabelKey}>
                <SelectLabel className="text-xs font-bold text-gray-500 px-2 py-1.5">
                  {t[section.groupLabelKey]}
                </SelectLabel>
                {section.itemKeys.map((k) => (
                  <SelectItem key={k} value={k} className="min-h-11 pl-6">
                    {t[SPORT_DEVICE_LABEL_KEY[k]]}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* Section 3 — condition */}
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

      {/* Section 4 — bike filters */}
      {showBikeFilters ? (
        <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <p className="text-sm font-bold text-gray-900">{t.so_sec_bike}</p>
          <div className="space-y-2">
            <Label htmlFor="so-bike-size" className="text-sm font-semibold text-gray-700">
              {t.so_bike_size}
            </Label>
            <Select value={bikeSize || "__any__"} onValueChange={(v) => setBikeSize(v === "__any__" ? "" : v)}>
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

      {/* Section 5 — gender */}
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

      {/* Section 6 — price */}
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
    </div>
  );
}


import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AK_CITY_KEYS,
  AK_CITY_LABEL_KEY,
  AK_CITY_SEARCH,
  AK_FORMAT_KEYS,
  AK_FORMAT_LABEL_KEY,
  AK_FORMAT_SEARCH,
  AK_SKILL_LEVEL_KEYS,
  AK_SKILL_LEVEL_LABEL_KEY,
  AK_SKILL_LEVEL_SEARCH,
  AK_SUBCATEGORIES_BY_TYPE,
  AK_TYPE_KEYS,
  AK_TYPE_LABEL_KEY,
  AK_TYPE_PHOTOS,
  getAkSubcategorySearch,
  getArsimKurseLeafCategoryIds,
  resolveArsimTypeCategoryId,
  type AkCityKey,
  type AkFormatKey,
  type AkSkillLevelKey,
  type AkSubcategoryKey,
  type AkTypeKey,
  type ArsimKurseCategoryRow,
} from "@/lib/arsim-kurse-search-helpers";

const triggerClass =
  "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200 font-normal";

type Props = {
  hubId: number;
  categories: ArsimKurseCategoryRow[];
  previewTotal: number | null;
  previewLoading: boolean;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 min-w-0">
      <Label htmlFor={id} className="text-sm font-bold text-gray-900">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function ArsimKurseSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const defaultCsv = useMemo(() => {
    const ids = getArsimKurseLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [categoryKey, setCategoryKey] = useState<AkTypeKey | "">("");
  const [subcategoryKey, setSubcategoryKey] = useState<AkSubcategoryKey | "">("");
  const [cityKey, setCityKey] = useState<AkCityKey | "">("");
  const [formatKey, setFormatKey] = useState<AkFormatKey | "">("");
  const [skillLevel, setSkillLevel] = useState<AkSkillLevelKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const subcategoryOptions = categoryKey ? AK_SUBCATEGORIES_BY_TYPE[categoryKey] : [];

  useEffect(() => {
    setSubcategoryKey("");
  }, [categoryKey]);

  useEffect(() => {
    if (subcategoryKey && categoryKey) {
      const allowed = subcategoryOptions.map((o) => o.key);
      if (!allowed.includes(subcategoryKey)) setSubcategoryKey("");
    }
  }, [subcategoryKey, categoryKey, subcategoryOptions]);

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (categoryKey) {
      const cid = resolveArsimTypeCategoryId(categories, hubId, categoryKey);
      if (cid) params.category_id = cid;
      else if (defaultCsv) params.category_ids = defaultCsv;
    } else if (defaultCsv) {
      params.category_ids = defaultCsv;
    }

    if (cityKey) params.location_search = AK_CITY_SEARCH[cityKey];

    const searchBits: string[] = [];
    if (categoryKey) {
      const typeLabel = t[AK_TYPE_LABEL_KEY[categoryKey]];
      if (typeLabel) searchBits.push(typeLabel);
    }
    if (categoryKey && subcategoryKey) {
      const subSearch = getAkSubcategorySearch(categoryKey, subcategoryKey);
      if (subSearch) searchBits.push(subSearch);
    }
    if (formatKey) searchBits.push(AK_FORMAT_SEARCH[formatKey]);
    if (skillLevel && skillLevel !== "te_gjitha") {
      const lvl = AK_SKILL_LEVEL_SEARCH[skillLevel];
      if (lvl) searchBits.push(lvl);
    }
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
    categoryKey,
    subcategoryKey,
    cityKey,
    formatKey,
    skillLevel,
    priceMin,
    priceMax,
    defaultCsv,
    hubId,
    categories,
    onListingParamsChange,
  ]);

  const handleSearch = () => {
    onListingParamsChange(buildParams());
    onScrollToResults?.();
  };

  const selectCategoryCard = (key: AkTypeKey) => {
    setCategoryKey((prev) => (prev === key ? "" : key));
    setSubcategoryKey("");
  };

  return (
    <div className="mb-8 space-y-6 max-w-full overflow-hidden">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600 shrink-0" aria-hidden />
            {t.ak_panel_title}
          </h2>
          <p className="text-sm text-gray-500">{t.ak_panel_sub}</p>
        </div>

        <section className="space-y-3" aria-label={t.ak_sec_types}>
          <Label className="text-sm font-bold text-gray-500 uppercase tracking-wide">
            {t.ak_sec_types}
          </Label>
          <CategoryPhotoPickerRow>
            {AK_TYPE_KEYS.map((key) => (
              <CategoryPhotoPickerCard
                key={key}
                selected={categoryKey === key}
                onClick={() => selectCategoryCard(key)}
                imageSrc={AK_TYPE_PHOTOS[key]}
                label={t[AK_TYPE_LABEL_KEY[key]]}
              />
            ))}
          </CategoryPhotoPickerRow>
        </section>
      </div>

      {/* Search table — below cards, outside buttons */}
      <section
        className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:p-5 shadow-sm space-y-4"
        aria-label={t.ak_search_btn}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="ak-category" label={t.ak_fld_category}>
            <Select
              value={categoryKey || "__any__"}
              onValueChange={(v) => setCategoryKey(v === "__any__" ? "" : (v as AkTypeKey))}
            >
              <SelectTrigger id="ak-category" className={triggerClass}>
                <SelectValue placeholder={t.ak_select_category_ph}>
                  {categoryKey ? t[AK_TYPE_LABEL_KEY[categoryKey]] : t.ak_select_any}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[min(70vh,320px)]">
                <SelectItem value="__any__" className="min-h-11">
                  {t.ak_select_any}
                </SelectItem>
                {AK_TYPE_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="min-h-11">
                    {t[AK_TYPE_LABEL_KEY[key]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="ak-subcategory" label={t.ak_fld_subcategory}>
            <Select
              key={categoryKey || "__none__"}
              value={subcategoryKey || "__any__"}
              onValueChange={(v) =>
                setSubcategoryKey(v === "__any__" ? "" : (v as AkSubcategoryKey))
              }
              disabled={!categoryKey}
            >
              <SelectTrigger id="ak-subcategory" className={triggerClass}>
                <SelectValue placeholder={t.ak_select_subcategory_ph}>
                  {subcategoryKey
                    ? t[
                        subcategoryOptions.find((o) => o.key === subcategoryKey)?.labelKey ??
                          ""
                      ]
                    : t.ak_select_any}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[min(70vh,360px)]">
                <SelectItem value="__any__" className="min-h-11">
                  {t.ak_select_any}
                </SelectItem>
                {subcategoryOptions.map((opt) => (
                  <SelectItem key={opt.key} value={opt.key} className="min-h-11">
                    {t[opt.labelKey]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="ak-city" label={t.ak_fld_city}>
            <Select
              value={cityKey || "__any__"}
              onValueChange={(v) => setCityKey(v === "__any__" ? "" : (v as AkCityKey))}
            >
              <SelectTrigger id="ak-city" className={triggerClass}>
                <SelectValue placeholder={t.ak_select_city_ph}>
                  {cityKey ? t[AK_CITY_LABEL_KEY[cityKey]] : t.ak_select_any}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[min(70vh,320px)]">
                <SelectItem value="__any__" className="min-h-11">
                  {t.ak_select_any}
                </SelectItem>
                {AK_CITY_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="min-h-11">
                    {t[AK_CITY_LABEL_KEY[key]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field id="ak-format" label={t.ak_sec_format}>
            <Select
              value={formatKey || "__any__"}
              onValueChange={(v) => setFormatKey(v === "__any__" ? "" : (v as AkFormatKey))}
            >
              <SelectTrigger id="ak-format" className={triggerClass}>
                <SelectValue placeholder={t.ak_select_format_ph}>
                  {formatKey ? t[AK_FORMAT_LABEL_KEY[formatKey]] : t.ak_select_any}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__" className="min-h-11">
                  {t.ak_select_any}
                </SelectItem>
                {AK_FORMAT_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="min-h-11">
                    {t[AK_FORMAT_LABEL_KEY[key]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="ak-level" label={t.ak_sec_level}>
            <Select
              value={skillLevel || "__any__"}
              onValueChange={(v) =>
                setSkillLevel(v === "__any__" ? "" : (v as AkSkillLevelKey))
              }
            >
              <SelectTrigger id="ak-level" className={triggerClass}>
                <SelectValue placeholder={t.ak_select_level_ph}>
                  {skillLevel ? t[AK_SKILL_LEVEL_LABEL_KEY[skillLevel]] : t.ak_select_any}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__any__" className="min-h-11">
                  {t.ak_select_any}
                </SelectItem>
                {AK_SKILL_LEVEL_KEYS.map((key) => (
                  <SelectItem key={key} value={key} className="min-h-11">
                    {t[AK_SKILL_LEVEL_LABEL_KEY[key]]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="space-y-2 min-w-0">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_price}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <span className="text-sm text-gray-600">{t.ak_from}</span>
                <Input
                  id="ak-price-min"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                  className="min-h-12 h-12 w-full text-[16px] rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <span className="text-sm text-gray-600">{t.ak_to}</span>
                <Input
                  id="ak-price-max"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="500"
                  className="min-h-12 h-12 w-full text-[16px] rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleSearch}
          className="w-full min-h-[48px] h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
        >
          <Search size={18} className="mr-2 shrink-0" aria-hidden />
          {t.ak_search_btn}
        </Button>
      </section>
    </div>
  );
}

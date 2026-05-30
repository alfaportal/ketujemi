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
import { Baby, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { HubLocationFilter } from "@/components/hub-location-filter";
import { hubLocationToListingParams } from "@/lib/hub-location-search";
import type { HomeMarketCode } from "@/lib/market-context";
import {
  CategoryPhotoPickerCard,
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import {
  FJ_BABY_TYPE_KEYS,
  FJ_BABY_TYPE_LABEL_KEY,
  FJ_BABY_TYPE_SEARCH,
  FJ_CONDITION_KEYS,
  FJ_CONDITION_LABEL_KEY,
  FJ_CONDITION_SEARCH,
  FJ_FOOD_ITEM_KEYS,
  FJ_FOOD_ITEM_LABEL_KEY,
  FJ_FOOD_ITEM_SEARCH,
  FJ_FOOD_TYPE_KEYS,
  FJ_FOOD_TYPE_LABEL_KEY,
  FJ_FOOD_TYPE_SEARCH,
  FJ_INSTALL_KEYS,
  FJ_INSTALL_LABEL_KEY,
  FJ_INSTALL_SEARCH,
  FJ_KID_GENDER_KEYS,
  FJ_KID_GENDER_LABEL_KEY,
  FJ_KID_GENDER_SEARCH,
  FJ_ROBE_AGE_GROUPS,
  FJ_ROBE_TYPE_KEYS,
  FJ_ROBE_TYPE_LABEL_KEY,
  FJ_ROBE_TYPE_SEARCH,
  FJ_STROLLER_BRAND_KEYS,
  FJ_STROLLER_BRAND_LABEL_KEY,
  FJ_STROLLER_BRAND_SEARCH,
  FJ_STROLLER_FEATURE_KEYS,
  FJ_STROLLER_FEATURE_LABEL_KEY,
  FJ_STROLLER_FEATURE_SEARCH,
  FJ_STROLLER_TYPE_KEYS,
  FJ_STROLLER_TYPE_LABEL_KEY,
  FJ_STROLLER_TYPE_SEARCH,
  FJ_TOY_AGE_KEYS,
  FJ_TOY_AGE_LABEL_KEY,
  FJ_TOY_AGE_SEARCH,
  FJ_TOY_TYPE_KEYS,
  FJ_TOY_TYPE_LABEL_KEY,
  FJ_TOY_TYPE_SEARCH,
  FJ_TYPE_DB_SLUG,
  FJ_WEIGHT_KEYS,
  FJ_WEIGHT_LABEL_KEY,
  FJ_WEIGHT_SEARCH,
  FJ_GROUP_SLUG_TO_TYPE,
  femijeSubcategoryPhoto,
  getFemijeGroupLeafIds,
  getFemijeGroupLeafRows,
  getFemijeHubSubcategoryRows,
  getFemijeLeafCategoryIds,
  type FjBabyTypeKey,
  type FjCityKey,
  type FjConditionKey,
  type FjFoodItemKey,
  type FjFoodTypeKey,
  type FjInstallKey,
  type FjKidGenderKey,
  type FjRobeSizeKey,
  type FjRobeTypeKey,
  type FjStrollerBrandKey,
  type FjStrollerFeatureKey,
  type FjStrollerTypeKey,
  type FjToyAgeKey,
  type FjToyTypeKey,
  type FjTypeKey,
  type FjWeightKey,
  type FemijeCategoryRow,
} from "@/lib/femije-search-helpers";

const inputClass = "min-h-12 h-12 w-full text-[16px] rounded-xl border-slate-200";

type Props = {
  hubId: number;
  categories: FemijeCategoryRow[];
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

export function FemijeSearchPanel({
  hubId,
  categories,
  previewTotal: _previewTotal,
  previewLoading: _previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const hubSubcategories = useMemo(
    () => getFemijeHubSubcategoryRows(categories, hubId),
    [categories, hubId],
  );

  const leafCsv = useMemo(() => {
    const ids = getFemijeLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedLeafId, setSelectedLeafId] = useState<number | null>(null);
  const [typeKey, setTypeKey] = useState<FjTypeKey | null>(null);
  const [strollerType, setStrollerType] = useState<FjStrollerTypeKey | "">("");
  const [strollerBrand, setStrollerBrand] = useState<FjStrollerBrandKey | "">("");
  const [strollerFeatures, setStrollerFeatures] = useState<
    Record<FjStrollerFeatureKey, boolean>
  >({
    cante: false,
    rain: false,
    mosquito: false,
    winter: false,
  });
  const [babyType, setBabyType] = useState<FjBabyTypeKey | "">("");
  const [weight, setWeight] = useState<FjWeightKey | "">("");
  const [install, setInstall] = useState<FjInstallKey | "">("");
  const [foodType, setFoodType] = useState<FjFoodTypeKey | "">("");
  const [foodItems, setFoodItems] = useState<Record<FjFoodItemKey, boolean>>({
    bottle: false,
    pump: false,
    sterilizer: false,
    babyphone: false,
    bath_tub: false,
    changing_mat: false,
  });
  const [toyType, setToyType] = useState<FjToyTypeKey | "">("");
  const [toyAge, setToyAge] = useState<FjToyAgeKey | "">("");
  const [kidGender, setKidGender] = useState<FjKidGenderKey | "">("");
  const [kidSize, setKidSize] = useState<FjRobeSizeKey | "">("");
  const [robeType, setRobeType] = useState<FjRobeTypeKey | "">("");
  const [condition, setCondition] = useState<FjConditionKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [hubLocation, setHubLocation] = useState<{
    countryCode: HomeMarketCode | "";
    city: string;
    areaZone: string;
  }>({ countryCode: "", city: "", areaZone: "" });

  const resetSubFilters = () => {
    setStrollerType("");
    setStrollerBrand("");
    setStrollerFeatures({ cante: false, rain: false, mosquito: false, winter: false });
    setBabyType("");
    setWeight("");
    setInstall("");
    setFoodType("");
    setFoodItems({
      bottle: false,
      pump: false,
      sterilizer: false,
      babyphone: false,
      bath_tub: false,
      changing_mat: false,
    });
    setToyType("");
    setToyAge("");
    setKidGender("");
    setKidSize("");
    setRobeType("");
  };

  const selectGroup = (row: FemijeCategoryRow) => {
    if (selectedGroupId === row.id) {
      setSelectedGroupId(null);
      setSelectedLeafId(null);
      setTypeKey(null);
      resetSubFilters();
      return;
    }
    setSelectedGroupId(row.id);
    setSelectedLeafId(null);
    resetSubFilters();
    const slug = row.slug ?? "";
    const fromGroup = slug ? FJ_GROUP_SLUG_TO_TYPE[slug] : undefined;
    const fromLegacy = (Object.entries(FJ_TYPE_DB_SLUG) as [FjTypeKey, string][]).find(
      ([, s]) => s === slug,
    )?.[0];
    setTypeKey(fromGroup ?? fromLegacy ?? null);
  };

  const selectLeaf = (row: FemijeCategoryRow) => {
    setSelectedLeafId((prev) => (prev === row.id ? null : row.id));
  };

  const selectedGroup = hubSubcategories.find((row) => row.id === selectedGroupId);
  const groupLeaves = useMemo(
    () =>
      selectedGroupId
        ? getFemijeGroupLeafRows(categories, selectedGroupId)
        : [],
    [categories, selectedGroupId],
  );
  const groupGuide = useMemo(() => {
    const slug = selectedGroup?.slug;
    if (!slug) return null;
    const marketLocale = uiLang === "mk" ? "mk" : uiLang === "mne" ? "mne" : "sq";
    return getFemijeSubcategoryGuide(slug, marketLocale);
  }, [selectedGroup?.slug, uiLang]);

  const typeTitle = selectedGroup
    ? translateCategory(selectedGroup.name, locale)
    : "";

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

    if (selectedLeafId) {
      p.category_id = selectedLeafId;
      delete p.category_ids;
    } else if (selectedGroupId) {
      const leafIds = getFemijeGroupLeafIds(categories, selectedGroupId);
      if (leafIds.length === 1) {
        p.category_id = leafIds[0];
        delete p.category_ids;
      } else if (leafIds.length > 0) {
        p.category_ids = [...leafIds].sort((a, b) => a - b).join(",");
        delete p.category_id;
      }
    }

    Object.assign(p, hubLocationToListingParams(hubLocation));

    const searchBits: string[] = [];

    if (typeKey === "karroca") {
      if (strollerType) searchBits.push(FJ_STROLLER_TYPE_SEARCH[strollerType]);
      if (strollerBrand) searchBits.push(FJ_STROLLER_BRAND_SEARCH[strollerBrand]);
      for (const k of FJ_STROLLER_FEATURE_KEYS) {
        if (strollerFeatures[k]) searchBits.push(FJ_STROLLER_FEATURE_SEARCH[k]);
      }
    } else if (typeKey === "foshnje") {
      if (babyType) searchBits.push(FJ_BABY_TYPE_SEARCH[babyType]);
      if (weight) searchBits.push(FJ_WEIGHT_SEARCH[weight]);
      if (install) searchBits.push(FJ_INSTALL_SEARCH[install]);
    } else if (typeKey === "ushqim_higjiene") {
      if (foodType) searchBits.push(FJ_FOOD_TYPE_SEARCH[foodType]);
      for (const k of FJ_FOOD_ITEM_KEYS) {
        if (foodItems[k]) searchBits.push(FJ_FOOD_ITEM_SEARCH[k]);
      }
    } else if (typeKey === "lodra") {
      if (toyType) searchBits.push(FJ_TOY_TYPE_SEARCH[toyType]);
      if (toyAge) searchBits.push(FJ_TOY_AGE_SEARCH[toyAge]);
    } else if (typeKey === "rroba") {
      if (kidGender) searchBits.push(FJ_KID_GENDER_SEARCH[kidGender]);
      if (kidSize) searchBits.push(`${kidSize} cm`);
      if (robeType) searchBits.push(FJ_ROBE_TYPE_SEARCH[robeType]);
    }

    if (condition) searchBits.push(FJ_CONDITION_SEARCH[condition]);

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
    selectedGroupId,
    selectedLeafId,
    typeKey,
    strollerType,
    strollerBrand,
    strollerFeatures,
    babyType,
    weight,
    install,
    foodType,
    foodItems,
    toyType,
    toyAge,
    kidGender,
    kidSize,
    robeType,
    condition,
    priceMin,
    priceMax,
    hubLocation,
    categories,
  ]);

  const handleSearch = () => {
    callbackRef.current(buildParams());
    onScrollToResults?.();
  };

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <Baby size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.fj_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.fj_panel_sub}</p>
      </div>

      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-base font-black text-gray-900">
            {(t as { fj_sec_pick_sub?: string }).fj_sec_pick_sub ?? t.fj_sec_types}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {hubSubcategories.length}{" "}
            {(t as { subcategoriesAvail?: string }).subcategoriesAvail ??
              "nënkategori të disponueshme"}
          </p>
        </div>
        <CategoryPhotoPickerGrid>
          {hubSubcategories.map((row) => (
            <CategoryPhotoPickerCard
              key={row.id}
              layout="grid"
              selected={selectedGroupId === row.id}
              onClick={() => selectGroup(row)}
              imageSrc={femijeSubcategoryPhoto(row.slug, row.image_url)}
              label={translateCategory(row.name, locale)}
            />
          ))}
        </CategoryPhotoPickerGrid>
      </section>

      {selectedGroup ? (
        <section className="space-y-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
          <div>
            <h3 className="text-base font-black text-gray-900">
              {(t as { fj_sec_contents?: string }).fj_sec_contents ?? typeTitle}
            </h3>
            <p className="text-sm font-semibold text-blue-900 mt-0.5">{typeTitle}</p>
          </div>

          {groupLeaves.length > 1 ? (
            <div className="space-y-3 border-t border-blue-100/80 pt-4">
              <div>
                <h4 className="text-sm font-black text-gray-900">
                  {(t as { subcategory?: string }).subcategory ?? "Nënkategoria"}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {groupLeaves.length}{" "}
                  {(t as { subcategoriesAvail?: string }).subcategoriesAvail ??
                    "nënkategori të disponueshme"}
                  {" · "}
                  {(t as { fj_leaf_pick_hint?: string }).fj_leaf_pick_hint ??
                    "Zgjidh nënkategori specifike (opsionale)"}
                </p>
              </div>
              <CategoryPhotoPickerGrid>
                {groupLeaves.map((leaf) => (
                  <CategoryPhotoPickerCard
                    key={leaf.id}
                    layout="grid"
                    selected={selectedLeafId === leaf.id}
                    onClick={() => selectLeaf(leaf)}
                    imageSrc={femijeSubcategoryPhoto(leaf.slug, leaf.image_url)}
                    label={translateCategory(leaf.name, locale)}
                  />
                ))}
              </CategoryPhotoPickerGrid>
            </div>
          ) : null}
        </section>
      ) : null}

      {selectedGroupId && typeKey === "karroca" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.fj_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_STROLLER_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={strollerType === k}
                  onClick={() => toggleChip(strollerType, k, setStrollerType)}
                >
                  {t[FJ_STROLLER_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_brand}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_STROLLER_BRAND_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={strollerBrand === k}
                  onClick={() => toggleChip(strollerBrand, k, setStrollerBrand)}
                >
                  {t[FJ_STROLLER_BRAND_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_features}>
            <div className="grid grid-cols-1 gap-3">
              {FJ_STROLLER_FEATURE_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={strollerFeatures[k]}
                    onCheckedChange={(c) =>
                      setStrollerFeatures((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[FJ_STROLLER_FEATURE_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {selectedGroupId && typeKey === "foshnje" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.fj_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_BABY_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={babyType === k}
                  onClick={() => toggleChip(babyType, k, setBabyType)}
                >
                  {t[FJ_BABY_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_weight}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_WEIGHT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={weight === k}
                  onClick={() => toggleChip(weight, k, setWeight)}
                >
                  {t[FJ_WEIGHT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_system}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_INSTALL_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={install === k}
                  onClick={() => toggleChip(install, k, setInstall)}
                >
                  {t[FJ_INSTALL_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {selectedGroupId && typeKey === "ushqim_higjiene" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.fj_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_FOOD_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={foodType === k}
                  onClick={() => toggleChip(foodType, k, setFoodType)}
                >
                  {t[FJ_FOOD_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_items}>
            <div className="grid grid-cols-1 gap-3">
              {FJ_FOOD_ITEM_KEYS.map((k) => (
                <label
                  key={k}
                  className="flex items-center gap-3 min-h-12 cursor-pointer touch-manipulation"
                >
                  <Checkbox
                    checked={foodItems[k]}
                    onCheckedChange={(c) =>
                      setFoodItems((prev) => ({ ...prev, [k]: c === true }))
                    }
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-medium text-gray-800">
                    {t[FJ_FOOD_ITEM_LABEL_KEY[k]]}
                  </span>
                </label>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {selectedGroupId && typeKey === "lodra" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.fj_sec_type}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_TOY_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={toyType === k}
                  onClick={() => toggleChip(toyType, k, setToyType)}
                >
                  {t[FJ_TOY_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_age}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_TOY_AGE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={toyAge === k}
                  onClick={() => toggleChip(toyAge, k, setToyAge)}
                >
                  {t[FJ_TOY_AGE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      {selectedGroupId && typeKey === "rroba" ? (
        <section className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeTitle}</h3>
          <FilterSection title={t.fj_sec_gender}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_KID_GENDER_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={kidGender === k}
                  onClick={() => toggleChip(kidGender, k, setKidGender)}
                >
                  {t[FJ_KID_GENDER_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
          <FilterSection title={t.fj_sec_age_group}>
            {FJ_ROBE_AGE_GROUPS.map((group) => (
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
          <FilterSection title={t.fj_sec_kind}>
            <div className="grid grid-cols-2 gap-2">
              {FJ_ROBE_TYPE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={robeType === k}
                  onClick={() => toggleChip(robeType, k, setRobeType)}
                >
                  {t[FJ_ROBE_TYPE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </FilterSection>
        </section>
      ) : null}

      <section className="space-y-5 rounded-xl border border-blue-100 bg-blue-50/30 p-4">
        <h3 className="text-base font-black text-gray-900">{t.fj_sec_universal}</h3>

        <FilterSection title={t.fj_sec_condition}>
          <div className="grid grid-cols-2 gap-2">
            {FJ_CONDITION_KEYS.map((k) => (
              <ChipButton
                key={k}
                selected={condition === k}
                onClick={() => toggleChip(condition, k, setCondition)}
              >
                {t[FJ_CONDITION_LABEL_KEY[k]]}
              </ChipButton>
            ))}
          </div>
        </FilterSection>

        <FilterSection title={t.fj_sec_price}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="text-sm text-gray-600">{t.fj_from}</span>
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
              <span className="text-sm text-gray-600">{t.fj_to}</span>
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

        <FilterSection title={t.fj_sec_location}>
          <HubLocationFilter
            value={hubLocation}
            onChange={setHubLocation}
            inputClass={inputClass}
            areaId="fj-area"
          />
        </FilterSection>
      </section>

      <Button
        type="button"
        onClick={handleSearch}
        className="w-full min-h-12 h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
      >
        <Search size={18} className="mr-2 shrink-0" aria-hidden />
        {t.fj_search_btn}
      </Button>
    </div>
  );
}

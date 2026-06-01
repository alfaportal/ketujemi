import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  CategoryPhotoPickerGrid,
} from "@/components/category-photo-picker";
import { useMarket } from "@/lib/market-context";
import { translateCategory } from "@/lib/category-translations";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import {
  ARSIM_KURSE_HERO_PHOTO,
  arsimSubcategoryPhoto,
  getArsimKurseGroupLeafIds,
  getArsimKurseGroupRows,
  getArsimKurseLeafCategoryIds,
  getArsimKurseLeafRows,
  getArsimKurseTypeRows,
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
  const { t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const hubTypes = useMemo(
    () => getArsimKurseTypeRows(categories, hubId),
    [categories, hubId],
  );

  const defaultCsv = useMemo(() => {
    const ids = getArsimKurseLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeId, setTypeId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");

  const subcategoryOptions = useMemo(() => {
    if (!typeId) return [];
    const groups = getArsimKurseGroupRows(categories, typeId);
    return groups.flatMap((group) => {
      const leaves = getArsimKurseLeafRows(categories, group.id);
      return leaves.map((leaf) => ({
        id: leaf.id,
        label: `${translateCategory(group.name, locale)} — ${translateCategory(leaf.name, locale)}`,
      }));
    });
  }, [typeId, categories, locale]);

  useEffect(() => {
    setSubcategoryId("");
  }, [typeId]);

  useEffect(() => {
    if (subcategoryId && typeId) {
      const allowed = subcategoryOptions.map((o) => o.id);
      if (!allowed.includes(subcategoryId)) setSubcategoryId("");
    }
  }, [subcategoryId, typeId, subcategoryOptions]);

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (subcategoryId) {
      params.category_id = subcategoryId;
    } else if (typeId) {
      const groups = getArsimKurseGroupRows(categories, typeId);
      const leafIds = groups.flatMap((g) => getArsimKurseGroupLeafIds(categories, g.id));
      if (leafIds.length) {
        params.category_ids = [...leafIds].sort((a, b) => a - b).join(",");
      }
    } else if (defaultCsv) {
      params.category_ids = defaultCsv;
    }

    return params;
  };

  useEffect(() => {
    onListingParamsChange(buildParams());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- live preview
  }, [typeId, subcategoryId, defaultCsv, hubId, categories, onListingParamsChange]);

  const handleSearch = () => {
    onListingParamsChange(buildParams());
    onScrollToResults?.();
  };

  const selectTypeCard = (id: number) => {
    setTypeId((prev) => (prev === id ? "" : id));
    setSubcategoryId("");
  };

  const selectedType = typeId ? hubTypes.find((r) => r.id === typeId) : null;

  return (
    <div className="mb-8 max-w-full overflow-hidden">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm space-y-0">
        <div className="flex flex-col gap-1 border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-600 shrink-0" aria-hidden />
            {t.ak_panel_title}
          </h2>
          <p className="text-sm text-gray-500">{t.ak_panel_sub}</p>
        </div>

        <section className="space-y-4 pb-0" aria-label={t.ak_sec_types}>
          <div>
            <h3 className="text-base font-black text-gray-900">
              {(t as { fj_sec_pick_sub?: string }).fj_sec_pick_sub ?? t.ak_sec_types}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {hubTypes.length}{" "}
              {(t as { subcategoriesAvail?: string }).subcategoriesAvail ??
                t.subcategoriesAvail}
            </p>
          </div>
          <CategoryPhotoPickerGrid>
            {hubTypes.map((row) => (
              <CategoryPhotoPickerCard
                key={row.id}
                layout="grid"
                selected={typeId === row.id}
                onClick={() => selectTypeCard(row.id)}
                imageSrc={arsimSubcategoryPhoto(row.slug, row.image_url, categories)}
                fallbackImageSrc={ARSIM_KURSE_HERO_PHOTO}
                imageAlt={row.name}
                label={translateCategory(row.name, locale)}
              />
            ))}
          </CategoryPhotoPickerGrid>
        </section>

        <section
          className="border-t border-gray-100 pt-6 mt-6 space-y-4"
          aria-label={t.ak_search_btn}
        >
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field id="ak-category" label={t.ak_fld_category}>
                <Select
                  value={typeId ? String(typeId) : "__any__"}
                  onValueChange={(v) => setTypeId(v === "__any__" ? "" : Number(v))}
                >
                  <SelectTrigger id="ak-category" className={triggerClass}>
                    <SelectValue placeholder={t.ak_select_category_ph}>
                      {selectedType
                        ? translateCategory(selectedType.name, locale)
                        : t.ak_select_any}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(70vh,320px)]">
                    <SelectItem value="__any__" className="min-h-11">
                      {t.ak_select_any}
                    </SelectItem>
                    {hubTypes.map((row) => (
                      <SelectItem key={row.id} value={String(row.id)} className="min-h-11">
                        {translateCategory(row.name, locale)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field id="ak-subcategory" label={t.ak_fld_subcategory}>
                <Select
                  key={typeId || "__none__"}
                  value={subcategoryId ? String(subcategoryId) : "__any__"}
                  onValueChange={(v) =>
                    setSubcategoryId(v === "__any__" ? "" : Number(v))
                  }
                  disabled={!typeId}
                >
                  <SelectTrigger id="ak-subcategory" className={triggerClass}>
                    <SelectValue placeholder={t.ak_select_subcategory_ph}>
                      {subcategoryId
                        ? subcategoryOptions.find((o) => o.id === subcategoryId)?.label
                        : t.ak_select_any}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-[min(70vh,360px)]">
                    <SelectItem value="__any__" className="min-h-11">
                      {t.ak_select_any}
                    </SelectItem>
                    {subcategoryOptions.map((opt) => (
                      <SelectItem key={opt.id} value={String(opt.id)} className="min-h-11">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Button
              type="button"
              onClick={handleSearch}
              className="w-full min-h-[48px] h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 touch-manipulation"
            >
              <Search size={18} className="mr-2 shrink-0" aria-hidden />
              {t.ak_search_btn}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

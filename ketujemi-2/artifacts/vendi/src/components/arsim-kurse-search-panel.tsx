import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { GraduationCap, Search } from "lucide-react";
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
import { cnPrimaryBlue } from "@/lib/primary-button-classes";
import { effectiveListingSearchQuery } from "@/lib/listing-search-query";
import {
  arsimSubcategoryPhoto,
  getArsimKurseGroupRows,
  getArsimKurseLeafRows,
  getArsimKurseTypeRows,
  type ArsimKurseCategoryRow,
} from "@/lib/arsim-kurse-search-helpers";

export type ArsimKurseSearchVariant = "hub" | "type" | "group" | "leaf";

type Props = {
  variant: ArsimKurseSearchVariant;
  hubId: number;
  scopeCategoryId?: number;
  categories: ArsimKurseCategoryRow[];
  onNavigateToCategory: (childCategoryId: number) => void;
  /** Listings refresh — leaf (final) page only. */
  onListingParamsChange?: (params: GetListingsParams) => void;
};

const ALL = "all";

function findRow(categories: ArsimKurseCategoryRow[], id: number | null | undefined) {
  if (id == null) return null;
  return categories.find((c) => Number(c.id) === Number(id)) ?? null;
}

export function ArsimKurseSearchPanel({
  variant,
  hubId,
  scopeCategoryId,
  categories,
  onNavigateToCategory,
  onListingParamsChange,
}: Props) {
  const { t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const isFinalPage = variant === "leaf";

  const hubTypes = useMemo(
    () => getArsimKurseTypeRows(categories, hubId),
    [categories, hubId],
  );

  const scopeTypeId = useMemo(() => {
    if (variant === "type" && scopeCategoryId) return scopeCategoryId;
    if (variant === "group" && scopeCategoryId) {
      return findRow(categories, scopeCategoryId)?.parent_id ?? null;
    }
    if (variant === "leaf" && scopeCategoryId) {
      const group = findRow(categories, scopeCategoryId);
      return group?.parent_id != null
        ? findRow(categories, group.parent_id)?.parent_id ?? null
        : null;
    }
    return null;
  }, [variant, scopeCategoryId, categories]);

  const scopeGroupId = useMemo(() => {
    if (variant === "group" && scopeCategoryId) return scopeCategoryId;
    if (variant === "leaf" && scopeCategoryId) {
      return findRow(categories, scopeCategoryId)?.parent_id ?? null;
    }
    return null;
  }, [variant, scopeCategoryId, categories]);

  const typeSelectOptions = useMemo((): ArsimKurseCategoryRow[] => {
    if (variant === "hub") return hubTypes;
    if (variant === "type" && scopeCategoryId) {
      const row = findRow(categories, scopeCategoryId);
      return row ? [row] : [];
    }
    if ((variant === "group" || variant === "leaf") && scopeTypeId) {
      const row = findRow(categories, scopeTypeId);
      return row ? [row] : [];
    }
    return [];
  }, [variant, hubTypes, scopeCategoryId, scopeTypeId, categories]);

  const groupSelectOptions = useMemo((): ArsimKurseCategoryRow[] => {
    if (variant === "hub") return [];
    if (variant === "type" && scopeCategoryId) {
      return getArsimKurseGroupRows(categories, scopeCategoryId);
    }
    if ((variant === "group" || variant === "leaf") && scopeGroupId) {
      const row = findRow(categories, scopeGroupId);
      return row ? [row] : [];
    }
    return [];
  }, [variant, scopeCategoryId, scopeGroupId, categories]);

  const leafSelectOptions = useMemo((): ArsimKurseCategoryRow[] => {
    if (variant === "hub" || variant === "type") return [];
    if (variant === "group" && scopeCategoryId) {
      return getArsimKurseLeafRows(categories, scopeCategoryId);
    }
    if (variant === "leaf" && scopeGroupId) {
      return getArsimKurseLeafRows(categories, scopeGroupId);
    }
    return [];
  }, [variant, scopeCategoryId, scopeGroupId, categories]);

  const initialTypeId = useMemo(() => {
    if (variant === "hub") return ALL;
    if (scopeTypeId) return String(scopeTypeId);
    return ALL;
  }, [variant, scopeTypeId]);

  const initialGroupId = useMemo(() => {
    if (variant === "hub" || variant === "type") return ALL;
    if (scopeGroupId) return String(scopeGroupId);
    return ALL;
  }, [variant, scopeGroupId]);

  const initialLeafId = useMemo(() => {
    if (variant === "leaf" && scopeCategoryId) return String(scopeCategoryId);
    return ALL;
  }, [variant, scopeCategoryId]);

  const [typeId, setTypeId] = useState(initialTypeId);
  const [groupId, setGroupId] = useState(initialGroupId);
  const [leafId, setLeafId] = useState(initialLeafId);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    setTypeId(initialTypeId);
    setGroupId(initialGroupId);
    setLeafId(initialLeafId);
  }, [initialTypeId, initialGroupId, initialLeafId]);

  const photoGridRows = useMemo(() => {
    if (variant === "hub") return hubTypes;
    if (variant === "type" && scopeCategoryId) {
      return getArsimKurseGroupRows(categories, scopeCategoryId);
    }
    if (variant === "group" && scopeCategoryId) {
      return getArsimKurseLeafRows(categories, scopeCategoryId);
    }
    return [];
  }, [variant, hubTypes, categories, scopeCategoryId]);

  const photoGridTitle =
    variant === "hub"
      ? t.ak_sec_types
      : variant === "type"
        ? ((t as { ak_sec_groups?: string }).ak_sec_groups ?? t.subcategory)
        : ((t as { ak_sec_leaves?: string }).ak_sec_leaves ?? t.subcategory);

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (searchQuery = appliedSearch): GetListingsParams => {
    const p: GetListingsParams = { page: 1, limit: 20 };

    if (isFinalPage && scopeCategoryId) {
      p.category_id = scopeCategoryId;
      if (searchQuery) p.search = searchQuery;
      return p;
    }

    if (searchQuery) p.search = searchQuery;
    return p;
  };

  useEffect(() => {
    if (!isFinalPage || !callbackRef.current || !scopeCategoryId) return;
    const timer = window.setTimeout(() => {
      callbackRef.current?.(buildParams());
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- leaf listings only
  }, [isFinalPage, appliedSearch, scopeCategoryId]);

  const handleTypeChange = (value: string) => {
    if (value === ALL) {
      if (variant === "hub") {
        setTypeId(ALL);
        setGroupId(ALL);
        setLeafId(ALL);
      }
      return;
    }
    const tid = Number(value);
    if (!Number.isFinite(tid)) return;
    if (variant === "leaf" && tid === scopeTypeId) {
      onNavigateToCategory(tid);
      return;
    }
    onNavigateToCategory(tid);
  };

  const handleGroupChange = (value: string) => {
    if (value === ALL) {
      if (variant === "type" && scopeCategoryId) {
        onNavigateToCategory(scopeCategoryId);
      }
      return;
    }
    const gid = Number(value);
    if (!Number.isFinite(gid)) return;
    if (variant === "leaf" && gid === scopeGroupId) {
      onNavigateToCategory(gid);
      return;
    }
    onNavigateToCategory(gid);
  };

  const handleLeafChange = (value: string) => {
    if (value === ALL) {
      if (variant === "group" && scopeCategoryId) {
        onNavigateToCategory(scopeCategoryId);
      }
      return;
    }
    const lid = Number(value);
    if (!Number.isFinite(lid)) return;
    if (lid === scopeCategoryId) return;
    onNavigateToCategory(lid);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!isFinalPage) return;
    const q = effectiveListingSearchQuery(searchText);
    setAppliedSearch(q);
    callbackRef.current?.(buildParams(q));
  };

  const selectLabelClass =
    "text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide";

  const showTypeAll = variant === "hub";
  const showGroupAll = variant === "type";
  const showLeafAll = variant === "group";

  return (
    <div className="mb-8 space-y-6">
      {photoGridRows.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <GraduationCap size={20} className="text-blue-600 shrink-0" aria-hidden />
              {photoGridTitle}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {photoGridRows.length}{" "}
              {(t as { subcategoriesAvail?: string }).subcategoriesAvail ??
                "nënkategori të disponueshme"}
            </p>
          </div>
          <CategoryPhotoPickerGrid>
            {photoGridRows.map((row) => (
              <CategoryPhotoPickerCard
                key={row.id}
                layout="grid"
                onClick={() => onNavigateToCategory(row.id)}
                imageSrc={arsimSubcategoryPhoto(row.slug, row.image_url, categories)}
                label={translateCategory(row.name, locale)}
              />
            ))}
          </CategoryPhotoPickerGrid>
        </section>
      ) : null}

      <section className="space-y-4 border-t border-gray-100 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className={selectLabelClass}>{t.category}</label>
            <Select value={typeId} onValueChange={handleTypeChange}>
              <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent className="!max-h-[300px]">
                {showTypeAll ? <SelectItem value={ALL}>{t.all}</SelectItem> : null}
                {typeSelectOptions.map((row) => (
                  <SelectItem key={row.id} value={String(row.id)}>
                    {translateCategory(row.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-0">
            <label className={selectLabelClass}>{t.subcategory}</label>
            <Select
              value={variant === "hub" ? ALL : groupId}
              onValueChange={handleGroupChange}
              disabled={variant === "hub" || groupSelectOptions.length === 0}
            >
              <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent className="!max-h-[300px]">
                {showGroupAll ? <SelectItem value={ALL}>{t.all}</SelectItem> : null}
                {groupSelectOptions.map((row) => (
                  <SelectItem key={row.id} value={String(row.id)}>
                    {translateCategory(row.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {variant === "group" || variant === "leaf" ? (
          <div className="min-w-0 max-w-full md:max-w-[calc(50%-0.5rem)]">
            <label className={selectLabelClass}>
              {(t as { ak_fld_detail?: string }).ak_fld_detail ?? t.subcategory}
            </label>
            <Select
              value={variant === "group" ? ALL : leafId}
              onValueChange={handleLeafChange}
              disabled={variant === "group" && leafSelectOptions.length === 0}
            >
              <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent className="!max-h-[300px]">
                {showLeafAll ? <SelectItem value={ALL}>{t.all}</SelectItem> : null}
                {leafSelectOptions.map((row) => (
                  <SelectItem key={row.id} value={String(row.id)}>
                    {translateCategory(row.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        {isFinalPage ? (
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-2 w-full md:flex-row md:items-center md:flex-nowrap md:gap-2"
          >
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                aria-hidden
              />
              <input
                type="search"
                placeholder={t.search}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full min-h-12 pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-base sm:text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all bg-gray-50 focus:bg-white touch-manipulation"
              />
            </div>
            <button type="submit" className={cnPrimaryBlue("w-full md:w-auto")}>
              {t.searchBtn}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}

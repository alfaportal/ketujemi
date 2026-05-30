import { useEffect, useMemo, useRef, useState } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Baby, Search } from "lucide-react";
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
  getFemijeGroupLeafIds,
  getFemijeGroupLeafRows,
  getFemijeHubSubcategoryRows,
  getFemijeLeafCategoryIds,
  femijeSubcategoryPhoto,
  type FemijeCategoryRow,
} from "@/lib/femije-search-helpers";

export type FemijeSearchVariant = "hub" | "group" | "leaf";

type Props = {
  variant: FemijeSearchVariant;
  hubId: number;
  scopeCategoryId?: number;
  categories: FemijeCategoryRow[];
  onNavigateToCategory: (childCategoryId: number) => void;
  onListingParamsChange: (params: GetListingsParams) => void;
  onScrollToResults?: () => void;
};

const ALL = "all";

export function FemijeSearchPanel({
  variant,
  hubId,
  scopeCategoryId,
  categories,
  onNavigateToCategory,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t, uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);

  const hubGroups = useMemo(
    () => getFemijeHubSubcategoryRows(categories, hubId),
    [categories, hubId],
  );

  const hubLeafCsv = useMemo(() => {
    const ids = getFemijeLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const initialGroupId = useMemo(() => {
    if (variant === "hub") return ALL;
    if (variant === "group" && scopeCategoryId) return String(scopeCategoryId);
    if (variant === "leaf" && scopeCategoryId) {
      const leaf = categories.find((c) => c.id === scopeCategoryId);
      const parentId = leaf?.parent_id;
      if (parentId) return String(parentId);
    }
    return ALL;
  }, [variant, scopeCategoryId, categories]);

  const initialLeafId = useMemo(() => {
    if (variant === "leaf" && scopeCategoryId) return String(scopeCategoryId);
    return ALL;
  }, [variant, scopeCategoryId]);

  const [groupId, setGroupId] = useState(initialGroupId);
  const [leafId, setLeafId] = useState(initialLeafId);
  const [searchText, setSearchText] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    setGroupId(initialGroupId);
    setLeafId(initialLeafId);
  }, [initialGroupId, initialLeafId]);

  const leafOptions = useMemo(() => {
    if (groupId === ALL) return [];
    const gid = Number(groupId);
    if (!Number.isFinite(gid)) return [];
    return getFemijeGroupLeafRows(categories, gid);
  }, [categories, groupId]);

  const photoGridRows = useMemo(() => {
    if (variant === "hub") return hubGroups;
    if (variant === "group" && scopeCategoryId) {
      return getFemijeGroupLeafRows(categories, scopeCategoryId);
    }
    return [];
  }, [variant, hubGroups, categories, scopeCategoryId]);

  const photoGridTitle =
    variant === "hub"
      ? (t as { fj_sec_pick_sub?: string }).fj_sec_pick_sub ?? t.fj_sec_types
      : (t as { fj_sec_contents?: string }).fj_sec_contents ?? t.subcategory;

  const callbackRef = useRef(onListingParamsChange);
  callbackRef.current = onListingParamsChange;

  const buildParams = (searchQuery = appliedSearch): GetListingsParams => {
    const p: GetListingsParams = { page: 1, limit: 20 };

    if (leafId !== ALL) {
      const lid = Number(leafId);
      if (Number.isFinite(lid)) {
        p.category_id = lid;
        if (searchQuery) p.search = searchQuery;
        return p;
      }
    }

    if (groupId !== ALL) {
      const gid = Number(groupId);
      const leafIds = getFemijeGroupLeafIds(categories, gid);
      if (leafIds.length === 1) {
        p.category_id = leafIds[0];
      } else if (leafIds.length > 0) {
        p.category_ids = [...leafIds].sort((a, b) => a - b).join(",");
      }
      if (searchQuery) p.search = searchQuery;
      return p;
    }

    if (variant === "group" && scopeCategoryId) {
      const leafIds = getFemijeGroupLeafIds(categories, scopeCategoryId);
      if (leafIds.length === 1) p.category_id = leafIds[0];
      else if (leafIds.length > 0) {
        p.category_ids = [...leafIds].sort((a, b) => a - b).join(",");
      }
    } else if (variant === "leaf" && scopeCategoryId) {
      p.category_id = scopeCategoryId;
    } else if (hubLeafCsv) {
      p.category_ids = hubLeafCsv;
    }

    if (searchQuery) p.search = searchQuery;
    return p;
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      callbackRef.current(buildParams());
    }, 300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- debounced listing preview
  }, [groupId, leafId, appliedSearch, hubLeafCsv, variant, scopeCategoryId, categories]);

  const handleGroupChange = (value: string) => {
    if (value === ALL) {
      setGroupId(ALL);
      setLeafId(ALL);
      return;
    }
    const gid = Number(value);
    if (!Number.isFinite(gid)) return;
    onNavigateToCategory(gid);
  };

  const handleLeafChange = (value: string) => {
    if (value === ALL) {
      setLeafId(ALL);
      return;
    }
    const lid = Number(value);
    if (!Number.isFinite(lid)) return;
    onNavigateToCategory(lid);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const q = effectiveListingSearchQuery(searchText);
    setAppliedSearch(q);
    callbackRef.current(buildParams(q));
    if (variant === "leaf") onScrollToResults?.();
  };

  const selectLabelClass =
    "text-sm font-semibold text-gray-500 mb-1.5 block uppercase tracking-wide";

  return (
    <div className="mb-8 space-y-6">
      {photoGridRows.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Baby size={20} className="text-blue-600 shrink-0" aria-hidden />
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
                imageSrc={femijeSubcategoryPhoto(row.slug, row.image_url)}
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
            <Select value={groupId} onValueChange={handleGroupChange}>
              <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent className="!max-h-[300px]">
                <SelectItem value={ALL}>{t.all}</SelectItem>
                {hubGroups.map((row) => (
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
              value={leafId}
              onValueChange={handleLeafChange}
              disabled={groupId === ALL || leafOptions.length === 0}
            >
              <SelectTrigger className="rounded-xl border-gray-200 min-h-12 h-12">
                <SelectValue placeholder={t.all} />
              </SelectTrigger>
              <SelectContent className="!max-h-[300px]">
                <SelectItem value={ALL}>{t.all}</SelectItem>
                {leafOptions.map((row) => (
                  <SelectItem key={row.id} value={String(row.id)}>
                    {translateCategory(row.name, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
      </section>
    </div>
  );
}

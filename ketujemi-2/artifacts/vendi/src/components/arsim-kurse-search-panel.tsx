import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { GetListingsParams } from "@workspace/api-client-react";
import { Euro, GraduationCap, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useMarket } from "@/lib/market-context";
import { fillCount } from "@/lib/app-extra-i18n";
import {
  AK_CYCLE_KEYS,
  AK_CYCLE_LABEL_KEY,
  AK_CYCLE_SEARCH,
  AK_FORMAT_KEYS,
  AK_FORMAT_LABEL_KEY,
  AK_FORMAT_SEARCH,
  AK_IT_DIR_KEYS,
  AK_IT_DIR_LABEL_KEY,
  AK_IT_DIR_SEARCH,
  AK_LANG_KEYS,
  AK_LANG_LABEL_KEY,
  AK_LANG_SEARCH,
  AK_LEVEL_KEYS,
  AK_LEVEL_LABEL_KEY,
  AK_LEVEL_SEARCH,
  AK_PROF_DIR_KEYS,
  AK_PROF_DIR_LABEL_KEY,
  AK_PROF_DIR_SEARCH,
  AK_SUBJECT_KEYS,
  AK_SUBJECT_LABEL_KEY,
  AK_SUBJECT_SEARCH,
  AK_TYPE_KEYS,
  AK_TYPE_LABEL_KEY,
  AK_TYPE_PHOTOS,
  getArsimKurseLeafCategoryIds,
  resolveArsimTypeCategoryId,
  type AkCycleKey,
  type AkFormatKey,
  type AkItDirKey,
  type AkLangKey,
  type AkLevelKey,
  type AkProfDirKey,
  type AkSubjectKey,
  type AkTypeKey,
  type ArsimKurseCategoryRow,
} from "@/lib/arsim-kurse-search-helpers";

type Props = {
  hubId: number;
  categories: ArsimKurseCategoryRow[];
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

export function ArsimKurseSearchPanel({
  hubId,
  categories,
  previewTotal,
  previewLoading,
  onListingParamsChange,
  onScrollToResults,
}: Props) {
  const { t } = useMarket();

  const defaultCsv = useMemo(() => {
    const ids = getArsimKurseLeafCategoryIds(categories, hubId);
    return [...ids].sort((a, b) => a - b).join(",");
  }, [categories, hubId]);

  const [typeKey, setTypeKey] = useState<AkTypeKey | null>(null);
  const [language, setLanguage] = useState<AkLangKey | "">("");
  const [level, setLevel] = useState<AkLevelKey | "">("");
  const [format, setFormat] = useState<AkFormatKey | "">("");
  const [subject, setSubject] = useState<AkSubjectKey | "">("");
  const [cycle, setCycle] = useState<AkCycleKey | "">("");
  const [profDir, setProfDir] = useState<AkProfDirKey | "">("");
  const [itDir, setItDir] = useState<AkItDirKey | "">("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const resetSubFilters = () => {
    setLanguage("");
    setLevel("");
    setFormat("");
    setSubject("");
    setCycle("");
    setProfDir("");
    setItDir("");
  };

  const selectType = (key: AkTypeKey) => {
    if (typeKey === key) {
      setTypeKey(null);
      resetSubFilters();
    } else {
      setTypeKey(key);
      resetSubFilters();
    }
  };

  const buildParams = (): GetListingsParams => {
    const params: GetListingsParams = { page: 1, limit: 20 };

    if (typeKey) {
      const cid = resolveArsimTypeCategoryId(categories, hubId, typeKey);
      if (cid) params.category_id = cid;
      else if (defaultCsv) params.category_ids = defaultCsv;
    } else if (defaultCsv) {
      params.category_ids = defaultCsv;
    }

    const searchBits: string[] = [];
    if (typeKey) {
      const typeLabel = t[AK_TYPE_LABEL_KEY[typeKey]];
      if (typeLabel) searchBits.push(typeLabel);
    }

    if (typeKey === "gjuhe_huaja") {
      if (language) searchBits.push(AK_LANG_SEARCH[language]);
      if (level) searchBits.push(AK_LEVEL_SEARCH[level]);
      if (format) searchBits.push(AK_FORMAT_SEARCH[format]);
    } else if (typeKey === "mesime_private") {
      if (subject) searchBits.push(AK_SUBJECT_SEARCH[subject]);
      if (cycle) searchBits.push(AK_CYCLE_SEARCH[cycle]);
    } else if (typeKey === "kurse_prof") {
      if (profDir) searchBits.push(AK_PROF_DIR_SEARCH[profDir]);
    } else if (typeKey === "trajnime_it") {
      if (itDir) searchBits.push(AK_IT_DIR_SEARCH[itDir]);
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
    typeKey,
    language,
    level,
    format,
    subject,
    cycle,
    profDir,
    itDir,
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

  const countLabel =
    previewLoading || previewTotal == null
      ? t.ak_search_btn
      : fillCount(t.hub_show_listings_m, String(previewTotal));

  const typeSectionTitle = typeKey ? t[AK_TYPE_LABEL_KEY[typeKey]] : "";

  return (
    <div className="mb-8 space-y-6 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm overflow-hidden max-w-full">
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
          <GraduationCap size={20} className="text-blue-600 shrink-0" aria-hidden />
          {t.ak_panel_title}
        </h2>
        <p className="text-sm text-gray-500">{t.ak_panel_sub}</p>
      </div>

      {/* Main category cards — always visible */}
      <section className="space-y-3">
        <Label className="text-sm font-bold text-gray-900">{t.ak_sec_types}</Label>
        <div className="grid grid-cols-2 gap-3">
          {AK_TYPE_KEYS.map((key) => {
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
                  src={AK_TYPE_PHOTOS[key]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 right-2 text-white text-sm font-bold leading-snug line-clamp-2 drop-shadow">
                  {t[AK_TYPE_LABEL_KEY[key]]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {typeKey === "gjuhe_huaja" ? (
        <section className="space-y-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeSectionTitle}</h3>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_language}</p>
            <div className="grid grid-cols-2 gap-2">
              {AK_LANG_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={language === k}
                  onClick={() => setLanguage(language === k ? "" : k)}
                >
                  {t[AK_LANG_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_level}</p>
            <div className="grid grid-cols-2 gap-2">
              {AK_LEVEL_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={level === k}
                  onClick={() => setLevel(level === k ? "" : k)}
                >
                  {t[AK_LEVEL_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_format}</p>
            <div className="grid grid-cols-1 gap-2">
              {AK_FORMAT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={format === k}
                  onClick={() => setFormat(format === k ? "" : k)}
                >
                  {t[AK_FORMAT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {typeKey === "mesime_private" ? (
        <section className="space-y-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeSectionTitle}</h3>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_subject}</p>
            <div className="grid grid-cols-2 gap-2">
              {AK_SUBJECT_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={subject === k}
                  onClick={() => setSubject(subject === k ? "" : k)}
                >
                  {t[AK_SUBJECT_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_cycle}</p>
            <div className="grid grid-cols-2 gap-2">
              {AK_CYCLE_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={cycle === k}
                  onClick={() => setCycle(cycle === k ? "" : k)}
                >
                  {t[AK_CYCLE_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {typeKey === "kurse_prof" ? (
        <section className="space-y-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeSectionTitle}</h3>
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_direction}</p>
            <div className="grid grid-cols-1 gap-2">
              {AK_PROF_DIR_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={profDir === k}
                  onClick={() => setProfDir(profDir === k ? "" : k)}
                >
                  {t[AK_PROF_DIR_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {typeKey === "trajnime_it" ? (
        <section className="space-y-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
          <h3 className="text-base font-black text-gray-900">{typeSectionTitle}</h3>
          <div className="space-y-3">
            <p className="text-sm font-bold text-gray-900">{t.ak_sec_direction}</p>
            <div className="grid grid-cols-1 gap-2">
              {AK_IT_DIR_KEYS.map((k) => (
                <ChipButton
                  key={k}
                  selected={itDir === k}
                  onClick={() => setItDir(itDir === k ? "" : k)}
                >
                  {t[AK_IT_DIR_LABEL_KEY[k]]}
                </ChipButton>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Euro size={18} className="text-blue-600 shrink-0" aria-hidden />
          {t.ak_sec_price}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ak-price-min" className="text-sm text-gray-600">
              {t.ak_from}
            </Label>
            <Input
              id="ak-price-min"
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
              placeholder="0"
              className="min-h-12 h-12 w-full text-[16px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ak-price-max" className="text-sm text-gray-600">
              {t.ak_to}
            </Label>
            <Input
              id="ak-price-max"
              type="number"
              inputMode="decimal"
              min={0}
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
              placeholder="500"
              className="min-h-12 h-12 w-full text-[16px]"
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

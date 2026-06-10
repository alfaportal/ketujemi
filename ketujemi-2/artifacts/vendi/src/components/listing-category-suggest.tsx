import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market-context";

export type CategorySuggestion = {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  brand_category_id?: number;
  brand_name?: string;
  confidence: "high" | "medium" | "low";
  source: "rules" | "ai";
};

type Props = {
  title: string;
  description: string;
  currentParentId: number;
  currentCategoryId: number;
  currentBrandId?: number;
  onApply: (s: CategorySuggestion) => void;
};

function encouragementMessage(
  title: string,
  suggestion: CategorySuggestion,
  template: string,
  defaultProduct: string,
): string {
  const label = title.trim();
  const short = label.length > 48 ? `${label.slice(0, 45)}…` : label;
  const product = short ? `«${short}»` : defaultProduct;
  const catLabel = suggestion.brand_name
    ? `${suggestion.category_name} → ${suggestion.brand_name}`
    : suggestion.category_name;
  return template.replace("{product}", product).replace("{category}", catLabel);
}

export function ListingCategorySuggest({
  title,
  description,
  currentParentId,
  currentCategoryId,
  currentBrandId = 0,
  onApply,
}: Props) {
  const { market, t } = useMarket();
  const tx = t as Record<string, string | undefined>;
  const [suggestion, setSuggestion] = useState<CategorySuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const ready = title.trim().length >= 3;

  useEffect(() => {
    if (!ready) {
      setSuggestion(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      void fetchWithTimeout("/api/ai/suggest-listing-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, lang }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          const s = (j as { suggestion?: CategorySuggestion | null })?.suggestion ?? null;
          setSuggestion(s);
        })
        .catch(() => setSuggestion(null))
        .finally(() => setLoading(false));
    }, 350);

    return () => clearTimeout(timer);
  }, [ready, title, description, lang]);

  const suggestionKey = suggestion
    ? `${suggestion.parent_category_id}-${suggestion.category_id}-${suggestion.brand_category_id ?? 0}`
    : null;

  const alreadyMatches =
    suggestion &&
    currentParentId === suggestion.parent_category_id &&
    currentCategoryId === suggestion.category_id &&
    currentCategoryId > 0 &&
    (!suggestion.brand_category_id ||
      currentBrandId === suggestion.brand_category_id);

  if (alreadyMatches || (suggestionKey && dismissedId === suggestionKey)) return null;

  if (!ready && !loading) return null;

  return (
    <div
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-violet-50/80 px-4 py-3.5 text-sm shadow-sm space-y-2.5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 font-semibold text-emerald-900">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4 shrink-0 text-violet-600" aria-hidden />
        )}
        {tx.ui_categorySuggestTitle}
      </div>
      {loading && !suggestion ? (
        <p className="text-emerald-800 text-xs">
          {tx.ui_categorySuggestAnalyzing}
        </p>
      ) : suggestion ? (
        <>
          <p className="text-gray-800 leading-relaxed">
            {encouragementMessage(
              title,
              suggestion,
              tx.ui_categorySuggestMsg,
              tx.ui_categorySuggestDefaultProduct,
            )}
          </p>
          <p className="text-xs text-gray-500">
            {suggestion.parent_name} → {suggestion.category_name}
            {suggestion.brand_name ? ` → ${suggestion.brand_name}` : ""}
          </p>
          <div className="flex flex-wrap gap-2 pt-0.5">
            <Button
              type="button"
              size="sm"
              className="min-h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => onApply(suggestion)}
            >
              <TrendingUp className="h-4 w-4 mr-1.5" aria-hidden />
              {tx.ui_categorySuggestPick}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-11 text-gray-600"
              onClick={() => setDismissedId(suggestionKey)}
            >
              {tx.ui_categorySuggestDismiss}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

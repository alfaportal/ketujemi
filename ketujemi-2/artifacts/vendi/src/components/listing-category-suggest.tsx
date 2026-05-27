import { useEffect, useState } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market-context";

export type CategorySuggestion = {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  confidence: "high" | "medium" | "low";
  source: "rules" | "ai";
};

type Props = {
  title: string;
  description: string;
  currentParentId: number;
  currentCategoryId: number;
  onApply: (s: CategorySuggestion) => void;
};

export function ListingCategorySuggest({
  title,
  description,
  currentParentId,
  currentCategoryId,
  onApply,
}: Props) {
  const { market } = useMarket();
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
      void fetch("/api/ai/suggest-listing-category", {
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
    }, 700);

    return () => clearTimeout(timer);
  }, [ready, title, description, lang]);

  if (!ready && !loading) return null;

  const suggestionKey = suggestion
    ? `${suggestion.parent_category_id}-${suggestion.category_id}`
    : null;

  const alreadyMatches =
    suggestion &&
    currentParentId === suggestion.parent_category_id &&
    currentCategoryId === suggestion.category_id &&
    currentCategoryId > 0;

  if (alreadyMatches || (suggestionKey && dismissedId === suggestionKey)) return null;

  if (!suggestion && !loading) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm space-y-2">
      <div className="flex items-center gap-2 font-semibold text-amber-950">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        Sugjerim kategorie
      </div>
      {loading && !suggestion ? (
        <p className="text-amber-800 text-xs">Duke analizuar titullin…</p>
      ) : suggestion ? (
        <>
          <p className="text-amber-950">
            <span className="font-medium">{suggestion.parent_name}</span>
            {" → "}
            <span className="font-medium">{suggestion.category_name}</span>
            {suggestion.confidence === "high" ? (
              <span className="text-amber-700 text-xs ml-1">(i sigurt)</span>
            ) : null}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="min-h-10 bg-amber-700 hover:bg-amber-800"
              onClick={() => onApply(suggestion)}
            >
              <Check className="h-4 w-4 mr-1" aria-hidden />
              Zbato kategorinë
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 text-amber-900"
              onClick={() => setDismissedId(suggestionKey)}
            >
              Jo, faleminderit
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

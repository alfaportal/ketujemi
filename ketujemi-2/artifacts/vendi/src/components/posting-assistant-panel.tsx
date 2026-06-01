import { useEffect, useState } from "react";
import { fetchWithTimeout, getFetchErrorMessage } from "@/lib/fetch-with-timeout";
import { Sparkles, Loader2 } from "lucide-react";
import { useMarket } from "@/lib/market-context";

type Suggestion = { text: string };

type Props = {
  title: string;
  description: string;
  price: number;
  priceAgreement?: boolean;
  categoryName?: string;
  parentCategoryName?: string;
  imageCount: number;
};

export function PostingAssistantPanel({
  title,
  description,
  price,
  priceAgreement = false,
  categoryName,
  parentCategoryName,
  imageCount,
}: Props) {
  const { market } = useMarket();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";

  const fieldsReady =
    title.trim().length >= 3 &&
    description.trim().length >= 10 &&
    (priceAgreement || price > 0);

  useEffect(() => {
    if (!fieldsReady) {
      setSuggestions([]);
      setLoadError(null);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setLoadError(null);
      void fetchWithTimeout("/api/ai/posting-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          price,
          price_agreement: priceAgreement,
          category_name: categoryName,
          parent_category_name: parentCategoryName,
          image_count: imageCount,
          lang,
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("suggestions_failed");
          return r.json();
        })
        .then((j) => {
          setSuggestions((j as { suggestions?: Suggestion[] })?.suggestions ?? []);
        })
        .catch((e) => {
          setSuggestions([]);
          setLoadError(getFetchErrorMessage(e));
        })
        .finally(() => setLoading(false));
    }, 800);

    return () => clearTimeout(timer);
  }, [fieldsReady, title, description, price, priceAgreement, categoryName, parentCategoryName, imageCount, lang]);

  if (suggestions.length === 0 && !loading && !loadError) return null;

  return (
    <div className="rounded-xl border border-violet-100 bg-violet-50/80 px-4 py-3 text-sm space-y-2">
      <div className="flex items-center gap-2 font-semibold text-violet-900">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        Sugjerime AI
      </div>
      {loadError ? (
        <p className="text-red-600 text-xs" role="alert">
          {loadError}
        </p>
      ) : loading && suggestions.length === 0 ? (
        <p className="text-violet-700 text-xs">Duke analizuar njoftimin…</p>
      ) : (
        <ul className="space-y-1.5 text-violet-900">
          {suggestions.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-violet-500">•</span>
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

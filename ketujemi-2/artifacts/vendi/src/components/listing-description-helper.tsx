import { useRef, useState } from "react";
import { fetchWithTimeout, getFetchErrorMessage } from "@/lib/fetch-with-timeout";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market-context";

const DESC_SHORT_THRESHOLD = 40;

type Props = {
  title: string;
  description: string;
  price: number;
  priceAgreement?: boolean;
  parentCategoryName?: string;
  categoryName?: string;
  imageCount: number;
  onApplyDescription: (next: string) => void;
};

export function ListingDescriptionHelper({
  title,
  description,
  price,
  priceAgreement = false,
  parentCategoryName,
  categoryName,
  imageCount,
  onApplyDescription,
}: Props) {
  const { market } = useMarket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<string[]>([]);
  const shortWarnedRef = useRef(false);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const desc = description.trim();

  const localDescriptionTips = (): string[] => {
    const out: string[] = [];
    if (desc.length < DESC_SHORT_THRESHOLD) {
      out.push(
        "Përshkrimi është shumë i shkurtër — shtoni gjendjen e produktit, karakteristikat kryesore dhe çfarë përfshihet në shitje.",
      );
    }
    if (desc.length >= DESC_SHORT_THRESHOLD && desc.length < 120) {
      out.push("Shtoni më shumë detaje: gjendja, përdorimi, defekte eventuale, garanci ose aksesorë që vijnë me produktin.");
    }
    if (!/\b(cm|mm|kg|gb|tb|viti|vitin|km|cc)\b/i.test(desc) && title.trim().length >= 3) {
      out.push("Përmendni specifikime të rëndësishme (p.sh. viti, kapaciteti, madhësia) nëse aplikohen.");
    }
    return out.slice(0, 3);
  };

  const handleClick = () => {
    setError(null);
    setTips([]);

    if (desc.length < DESC_SHORT_THRESHOLD) {
      if (!shortWarnedRef.current) {
        shortWarnedRef.current = true;
        setTips(localDescriptionTips());
        return;
      }
    }

    if (title.trim().length < 3 || desc.length < 10) {
      setTips([
        "Shkruani së paku një titull (3+ karaktere) dhe një përshkrim fillestar (10+ karaktere), pastaj provoni përsëri.",
      ]);
      return;
    }

    setLoading(true);
    void fetchWithTimeout("/api/ai/posting-suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        description,
        price: priceAgreement ? 0 : price,
        price_agreement: priceAgreement || price <= 0,
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
        const fromApi = ((j as { suggestions?: { text: string }[] })?.suggestions ?? [])
          .map((s) => s.text.trim())
          .filter(Boolean);
        const merged = fromApi.length > 0 ? fromApi : localDescriptionTips();
        setTips(merged.length > 0 ? merged : ["Përshkrimi duket i mirë — mund të shtoni edhe një detaj specifik për më shumë besueshmëri."]);
      })
      .catch((e) => {
        setError(getFetchErrorMessage(e));
        setTips(localDescriptionTips());
      })
      .finally(() => setLoading(false));
  };

  const applyTip = (tip: string) => {
    const base = description.trimEnd();
    const addition = tip.replace(/^—\s*/, "").trim();
    if (!addition) return;
    if (base.toLowerCase().includes(addition.toLowerCase().slice(0, 24))) {
      onApplyDescription(base);
      setTips([]);
      return;
    }
    onApplyDescription(base ? `${base}\n\n${addition}` : addition);
    setTips([]);
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10 gap-1.5 border-violet-200 text-violet-800 hover:bg-violet-50"
        onClick={handleClick}
        disabled={loading}
        data-testid="button-description-ai-helper"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        Ndihmë AI
      </Button>

      {(tips.length > 0 || error) && (
        <div className="rounded-xl border border-violet-100 bg-violet-50/90 px-3 py-3 text-sm space-y-2">
          <p className="font-semibold text-violet-900">Sugjerime për përshkrimin</p>
          {error ? (
            <p className="text-xs text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <ul className="space-y-1.5 text-violet-950 text-xs leading-relaxed">
            {tips.map((tip, i) => (
              <li key={i}>• {tip}</li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 pt-1">
            {tips[0] ? (
              <Button
                type="button"
                size="sm"
                className="min-h-10 bg-violet-600 hover:bg-violet-700 text-white"
                onClick={() => applyTip(tips[0]!)}
              >
                Prano
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 text-gray-600"
              onClick={() => {
                setTips([]);
                setError(null);
              }}
            >
              Injoro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

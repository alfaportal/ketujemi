import { useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMarket } from "@/lib/market-context";

type Props = {
  title: string;
  description: string;
  onApplyDescription: (next: string) => void;
};

export function ListingDescriptionHelper({ title, description, onApplyDescription }: Props) {
  const { market } = useMarket();
  const [loading, setLoading] = useState(false);
  const [polished, setPolished] = useState<string | null>(null);
  const usedRef = useRef(false);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const desc = description.trim();
  const buttonUsed = usedRef.current;

  const handleClick = () => {
    if (buttonUsed || loading) return;
    usedRef.current = true;
    setPolished(null);

    if (desc.length < 10) return;

    setLoading(true);
    void fetchWithTimeout("/api/ai/polish-listing-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, description, lang }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("polish_failed");
        const j = (await r.json()) as { description?: string };
        const next = j.description?.trim();
        if (next && next.length >= 10) setPolished(next);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10 gap-1.5 border-violet-200 text-violet-800 hover:bg-violet-50 disabled:opacity-50"
        onClick={handleClick}
        disabled={loading || buttonUsed || desc.length < 10}
        data-testid="button-description-ai-helper"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden />
        )}
        Ndihmë AI
      </Button>

      {polished ? (
        <div className="rounded-xl border border-violet-100 bg-violet-50/90 px-3 py-3 text-sm space-y-3">
          <p className="text-violet-950 text-sm leading-relaxed whitespace-pre-wrap">{polished}</p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="min-h-10 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => {
                onApplyDescription(polished);
                setPolished(null);
              }}
            >
              Prano
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 text-gray-600"
              onClick={() => setPolished(null)}
            >
              Injoro
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

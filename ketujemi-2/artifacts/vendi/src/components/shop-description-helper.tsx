import { useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarket } from "@/lib/market-context";
import { useShopFormCopy } from "@/lib/shop-application-i18n";

type Props = {
  shopName: string;
  category: string;
  onApplyDescription: (next: string) => void;
};

export function ShopDescriptionHelper({ shopName, category, onApplyDescription }: Props) {
  const c = useShopFormCopy();
  const { market } = useMarket();
  const [open, setOpen] = useState(false);
  const [businessType, setBusinessType] = useState("");
  const [loading, setLoading] = useState(false);

  const lang = market.code === "mk" ? "mk" : market.code === "mne" ? "me" : "sq";
  const trimmedType = businessType.trim();

  const handleGenerate = () => {
    if (loading || trimmedType.length < 3) return;
    setLoading(true);

    void fetchWithTimeout("/api/ai/generate-shop-description", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        business_type: trimmedType,
        shop_name: shopName.trim() || undefined,
        category: category.trim() || undefined,
        lang,
      }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("generate_failed");
        const j = (await r.json()) as { description?: string };
        const next = j.description?.trim();
        if (!next || next.length < 3) throw new Error("generate_invalid");
        onApplyDescription(next);
        setOpen(false);
        setBusinessType("");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-wrap justify-end gap-2 flex-1 min-w-[9rem]">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10 gap-1.5 border-violet-200 text-violet-800 hover:bg-violet-50 disabled:opacity-50"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        data-testid="button-shop-description-ai-helper"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : null}
        {c.aiHelpBtn}
      </Button>

      {open ? (
        <div className="w-full basis-full rounded-xl border border-violet-100 bg-violet-50/90 px-3 py-3 text-sm space-y-3">
          <p className="text-violet-950 text-sm leading-relaxed">{c.aiBusinessTypePrompt}</p>
          <Input
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            placeholder={c.aiBusinessTypePlaceholder}
            className="min-h-11 bg-white"
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="min-h-10 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={handleGenerate}
              disabled={loading || trimmedType.length < 3}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" aria-hidden />
                  {c.aiGenerating}
                </>
              ) : (
                c.aiGenerateBtn
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="min-h-10 text-gray-600"
              onClick={() => {
                setOpen(false);
                setBusinessType("");
              }}
              disabled={loading}
            >
              {c.aiCancelBtn}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

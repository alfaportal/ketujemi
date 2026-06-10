import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useMarket } from "@/lib/market-context";
import { dhurataGiftPledgeCopy } from "@/lib/dhurata-gift-pledge-i18n";

/** Legacy key — cleared on mount so old sessions cannot skip the pledge. */
export const DHURATA_PLEDGE_STORAGE_KEY = "ketujemi-dhurata-pledge-v2";

type Props = {
  onAccepted: () => void;
  onBack?: () => void;
};

export function DhurataGiftPledge({ onAccepted, onBack }: Props) {
  const { uiLang } = useMarket();
  const copy = useMemo(() => dhurataGiftPledgeCopy(uiLang), [uiLang]);
  const [checked, setChecked] = useState<boolean[]>(() => [false, false, false, false, false]);
  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleContinue = () => {
    if (!allChecked) return;
    onAccepted();
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 min-h-12"
        >
          <ArrowLeft size={16} /> {copy.back}
        </button>
      ) : null}

      <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 mb-5">
          <p className="text-sm font-black text-amber-900 tracking-wide">{copy.warnTitle}</p>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed mb-6 space-y-2">
          <p>{copy.intro1}</p>
          <p className="font-medium text-gray-900">{copy.intro2}</p>
        </div>

        <div className="space-y-3 mb-6" role="group" aria-label={copy.warnTitle}>
          {copy.items.map((text, index) => (
            <label
              key={index}
              className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-amber-50/40 transition-colors"
            >
              <Checkbox
                checked={checked[index]}
                onCheckedChange={() => toggle(index)}
                className="mt-0.5 shrink-0"
                data-testid={`dhurata-pledge-${index}`}
              />
              <span className="flex-1 min-w-0 text-sm text-gray-900 leading-relaxed">{text}</span>
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-6 text-center text-sm text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900">🔒 {copy.legal}</p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full min-h-14 text-base font-bold rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50"
          disabled={!allChecked}
          onClick={handleContinue}
          data-testid="button-dhurata-pledge-continue"
        >
          {copy.continueBtn}
        </Button>

        {!allChecked ? (
          <p className="mt-3 text-center text-xs text-amber-800 font-medium">{copy.uncheckedHint}</p>
        ) : null}
      </div>
    </div>
  );
}

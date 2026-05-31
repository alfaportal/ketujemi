import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const DHURATA_PLEDGE_STORAGE_KEY = "ketujemi-dhurata-pledge-v2";

const PLEDGE_ITEMS = [
  "Konfirmoj që sendi është plotësisht FALAS — nuk do të kërkojë asnjë kompensim, para, favor, apo shërbim në këmbim",
  "Konfirmoj që sendi ekziston fizikisht dhe është i disponueshëm — nuk është shpallje e rreme apo mashtruese",
  "Konfirmoj që fotot janë reale dhe të sendit tim — jo foto nga interneti apo e dikujt tjetër",
  "Kuptoj që çdo person që keqpërdor këtë seksion për mashtrim, reklamë, ose qëllime të liga — raportohet menjëherë dhe bllokohet përgjithmonë nga platforma",
  "Kuptoj që KetuJemi monitoron çdo postim në këtë kategori dhe rezervon të drejtën ta heqë çdo shpallje pa paralajmërim",
] as const;

type Props = {
  onAccepted: () => void;
  onBack?: () => void;
};

export function DhurataGiftPledge({ onAccepted, onBack }: Props) {
  const [checked, setChecked] = useState<boolean[]>(() => PLEDGE_ITEMS.map(() => false));
  const allChecked = checked.every(Boolean);

  const toggle = (index: number) => {
    setChecked((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleContinue = () => {
    if (!allChecked) return;
    try {
      sessionStorage.setItem(DHURATA_PLEDGE_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
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
          <ArrowLeft size={16} /> Kthehu
        </button>
      ) : null}

      <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 mb-5">
          <p className="text-sm font-black text-amber-900 tracking-wide">
            ⚠️ LEXO ME KUJDES PARA SE TË VAZHDOSH
          </p>
        </div>

        <div className="text-sm text-gray-700 leading-relaxed mb-6 space-y-2">
          <p>
            Ky seksion është krijuar për njerëz me zemër të mirë që duan të ndihmojnë të tjerët.
          </p>
          <p className="font-medium text-gray-900">
            Çdo keqpërdorim trajtohet me seriozitetin më të lartë.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {PLEDGE_ITEMS.map((text, index) => (
            <label
              key={text}
              className="flex items-start gap-3 cursor-pointer rounded-xl border border-gray-200 p-4 hover:bg-amber-50/40 transition-colors"
            >
              <Checkbox
                checked={checked[index]}
                onCheckedChange={() => toggle(index)}
                className="mt-0.5 shrink-0"
                data-testid={`dhurata-pledge-${index}`}
              />
              <span className="text-sm text-gray-800 leading-relaxed">{text}</span>
            </label>
          ))}
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 mb-6 text-center text-sm text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-1">🔒 Duke klikuar &quot;Vazhdo&quot; ju merrni përgjegjësi të plotë ligjore për vërtetësinë e postimit tuaj.</p>
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full min-h-14 text-base font-bold rounded-xl bg-green-600 hover:bg-green-700"
          disabled={!allChecked}
          onClick={handleContinue}
          data-testid="button-dhurata-pledge-continue"
        >
          ✅ Kuptova & Jam Dakord — Vazhdo →
        </Button>
      </div>
    </div>
  );
}

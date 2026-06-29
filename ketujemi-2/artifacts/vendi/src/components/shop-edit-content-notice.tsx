import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";

const NOTICE_SECONDS = 30;

type Props = {
  onContinue: () => void;
};

/** Mandatory 30s rules notice before shop edit — lists forbidden content, no AI. */
export function ShopEditContentNotice({ onContinue }: Props) {
  const c = useShopProductsCopy();
  const [secondsLeft, setSecondsLeft] = useState(NOTICE_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const canContinue = secondsLeft <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-content-notice-title"
      aria-describedby="shop-content-notice-body"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <AlertTriangle className="h-8 w-8" aria-hidden />
          </div>
          <h2 id="shop-content-notice-title" className="text-xl font-black text-gray-900">
            {c.contentNoticeTitle}
          </h2>
        </div>

        <p
          id="shop-content-notice-body"
          className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line"
        >
          {c.contentNoticeMessage}
        </p>

        <div className="flex flex-col items-center gap-4 pt-2">
          {!canContinue ? (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-amber-100 bg-amber-50"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-2xl font-black text-amber-700 tabular-nums">{secondsLeft}</span>
            </div>
          ) : null}

          <p className="text-sm text-gray-500 text-center min-h-[1.25rem]">
            {canContinue
              ? c.contentNoticeReady
              : c.contentNoticeWait.replace("{seconds}", String(secondsLeft))}
          </p>

          {canContinue ? (
            <Button
              type="button"
              className="w-full min-h-12 h-12 text-base font-semibold"
              onClick={onContinue}
            >
              {c.contentNoticeContinue}
            </Button>
          ) : (
            <Button type="button" className="w-full min-h-12 h-12 text-base" disabled>
              {c.contentNoticeContinue}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

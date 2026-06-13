import { useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOP_PACKAGES_PUBLIC, type TopListingPurpose } from "@/lib/top-packages";
import { redirectToStripeCheckout } from "@/lib/stripe-checkout";
import { useToast } from "@/hooks/use-toast";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";

export function TopListingPackages({
  listingId,
  compact = false,
  disabled = false,
  phase2Enabled = true,
  paymentsReady = true,
}: {
  listingId: number;
  compact?: boolean;
  disabled?: boolean;
  phase2Enabled?: boolean;
  paymentsReady?: boolean;
}) {
  const { toast } = useToast();
  const { t, uiLang } = useMarket();
  const tx = t as Record<string, string>;
  const [busyPurpose, setBusyPurpose] = useState<TopListingPurpose | null>(null);

  const blocked = disabled || !phase2Enabled || !paymentsReady;

  async function buy(purpose: TopListingPurpose) {
    if (blocked) return;
    setBusyPurpose(purpose);
    try {
      await redirectToStripeCheckout({ purpose, listing_id: listingId }, uiLang);
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : tx.ui_topPaymentFailed,
        variant: "destructive",
      });
      setBusyPurpose(null);
    }
  }

  if (compact) {
    return (
      <div className="flex flex-wrap items-stretch gap-2">
        {TOP_PACKAGES_PUBLIC.map((pkg) => {
          const title = tx[`ui_topPackage_${pkg.id}_title`] ?? pkg.label;
          return (
          <button
            key={pkg.id}
            type="button"
            disabled={blocked || busyPurpose != null}
            onClick={() => void buy(pkg.purpose)}
            className={cn(
              "min-h-[3.25rem] px-3 py-2 rounded-lg border text-left touch-manipulation flex flex-col justify-center gap-0.5 min-w-[5.5rem]",
              blocked
                ? "border-gray-200 text-gray-400 bg-white"
                : "border-violet-200 text-violet-900 bg-white hover:bg-violet-50",
            )}
            title={
              !phase2Enabled
                ? tx.ui_topPhase2Compact
                : !paymentsReady
                  ? tx.ui_cardPaymentsNotConfigured
                  : tx[`ui_topPackage_${pkg.id}_desc`] ?? `TOP ${pkg.label} — €${pkg.priceEur}`
            }
          >
            <span className="inline-flex items-center gap-1 text-sm font-black">
              {busyPurpose === pkg.purpose ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              €{pkg.priceEur}
            </span>
            <span className="text-[10px] font-semibold text-gray-600 leading-tight line-clamp-2">
              {title}
            </span>
          </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4" aria-hidden />
        {tx.ui_topPackagesSelectTitle}
      </p>
      <p className="text-[11px] text-gray-600 leading-snug">{tx.ui_topPackagesCarouselDesc}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TOP_PACKAGES_PUBLIC.map((pkg) => {
          const busy = busyPurpose === pkg.purpose;
          const title = tx[`ui_topPackage_${pkg.id}_title`] ?? pkg.label;
          const desc = tx[`ui_topPackage_${pkg.id}_desc`] ?? "";
          return (
            <button
              key={pkg.id}
              type="button"
              disabled={blocked || (busyPurpose != null && !busy)}
              onClick={() => void buy(pkg.purpose)}
              className={cn(
                "rounded-xl border-2 p-3 text-left transition-colors touch-manipulation min-h-[88px] flex flex-col justify-between",
                blocked
                  ? "border-gray-200 bg-gray-50 text-gray-400"
                  : "border-violet-200 bg-white hover:border-violet-400 hover:bg-violet-50/60",
              )}
            >
              <div>
                <p className="text-lg font-black text-violet-900">€{pkg.priceEur}</p>
                <p className="text-sm font-bold text-gray-800">{title}</p>
                {desc ? (
                  <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{desc}</p>
                ) : null}
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {fillPlaceholders(tx.ui_topPackagesValidDays, { days: pkg.days })}
                </p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-800">
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" />
                )}
                {tx.ui_payWithCard}
              </span>
            </button>
          );
        })}
      </div>
      {!phase2Enabled ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {tx.ui_topPackagesPhase2Soon}
        </p>
      ) : null}
    </div>
  );
}

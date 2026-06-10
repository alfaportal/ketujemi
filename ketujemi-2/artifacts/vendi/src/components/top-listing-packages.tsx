import { useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOP_PACKAGES_PUBLIC, type TopListingPurpose } from "@/lib/top-packages";
import { redirectToStripeCheckout } from "@/lib/stripe-checkout";
import { useToast } from "@/hooks/use-toast";
import { useMarket } from "@/lib/market-context";

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
      <div className="flex flex-wrap items-center gap-1.5">
        {TOP_PACKAGES_PUBLIC.map((pkg) => (
          <button
            key={pkg.id}
            type="button"
            disabled={blocked || busyPurpose != null}
            onClick={() => void buy(pkg.purpose)}
            className={cn(
              "min-h-10 px-2.5 rounded-lg border text-xs font-bold inline-flex items-center gap-1 touch-manipulation",
              blocked
                ? "border-gray-200 text-gray-400 bg-white"
                : "border-violet-200 text-violet-900 bg-white hover:bg-violet-50",
            )}
            title={
              !phase2Enabled
                ? "TOP aktivizohet në Fazën 2"
                : !paymentsReady
                  ? "Stripe nuk është konfiguruar"
                  : `TOP ${pkg.label} — €${pkg.priceEur}`
            }
          >
            {busyPurpose === pkg.purpose ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            €{pkg.priceEur}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
        <Sparkles className="h-4 w-4" aria-hidden />
        Zgjidh paketën TOP
      </p>
      <p className="text-[11px] text-gray-600 leading-snug">
        Njoftimi shfaqet në karuselin «TOP Njoftime» në kryefaqe (poshtë partnerëve VIP). Zgjidh
        paketën — pas pagesës me kartë vlen për ditët e shënuara.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {TOP_PACKAGES_PUBLIC.map((pkg) => {
          const busy = busyPurpose === pkg.purpose;
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
                <p className="text-sm font-bold text-gray-800">{pkg.label} në kryefaqe</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Vlen {pkg.days} ditë nga pagesa</p>
              </div>
              <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-800">
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" />
                )}
                Paguaj me kartë
              </span>
            </button>
          );
        })}
      </div>
      {!phase2Enabled ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          TOP aktivizohet së shpejti (Faza 2).
        </p>
      ) : null}
    </div>
  );
}

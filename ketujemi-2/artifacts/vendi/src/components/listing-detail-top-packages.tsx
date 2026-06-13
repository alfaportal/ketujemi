import { useEffect, useState } from "react";
import { CreditCard, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TOP_PACKAGES_PUBLIC,
  type TopListingPurpose,
  type TopPackageId,
} from "@/lib/top-packages";
import { fetchPaymentsStatus, redirectToStripeCheckout } from "@/lib/stripe-checkout";
import { useToast } from "@/hooks/use-toast";
import { useMarket } from "@/lib/market-context";
import { fillPlaceholders } from "@/lib/app-extra-i18n";

type ListingDetailTopPackagesProps = {
  listingId: number;
};

function topPackageTitleKey(id: TopPackageId): string {
  return `ui_topPackage_${id}_title`;
}

function topPackageDescKey(id: TopPackageId): string {
  return `ui_topPackage_${id}_desc`;
}

/** TOP boost — listing detail page only (owner). All tiers explained upfront. */
export function ListingDetailTopPackages({ listingId }: ListingDetailTopPackagesProps) {
  const { t, uiLang } = useMarket();
  const tx = t as Record<string, string>;
  const { toast } = useToast();
  const [busyPurpose, setBusyPurpose] = useState<TopListingPurpose | null>(null);
  const [paymentsReady, setPaymentsReady] = useState(false);
  const [phase2Enabled, setPhase2Enabled] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchPaymentsStatus()
      .then((s) => {
        if (!cancelled) {
          setPaymentsReady(s.cardPaymentsAvailable);
          setPhase2Enabled(s.phase2 ?? false);
        }
      })
      .catch(() => {
        if (!cancelled) setPaymentsReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const blocked = !phase2Enabled || !paymentsReady;

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

  return (
    <section
      className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 sm:p-5 space-y-4"
      aria-label={tx.ui_topPackagesAria}
    >
      <div className="space-y-1">
        <p className="text-sm sm:text-base font-bold text-violet-950 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
          {tx.ui_topPackagesSelectTitle}
        </p>
        <p className="text-xs sm:text-sm text-gray-700 leading-snug">{tx.ui_topPackagesIntro}</p>
        <p className="text-[11px] sm:text-xs text-gray-500 leading-snug">{tx.ui_topPackagesCarouselDesc}</p>
      </div>

      {!paymentsReady ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {tx.ui_cardPaymentsNotConfigured}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {TOP_PACKAGES_PUBLIC.map((pkg) => {
          const busy = busyPurpose === pkg.purpose;
          const title = tx[topPackageTitleKey(pkg.id)] ?? pkg.label;
          const desc = tx[topPackageDescKey(pkg.id)] ?? "";
          return (
            <div
              key={pkg.id}
              className={cn(
                "rounded-xl border-2 p-3.5 flex flex-col gap-2 min-h-[10.5rem]",
                blocked
                  ? "border-gray-200 bg-gray-50 text-gray-400"
                  : "border-violet-200 bg-white",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-2xl font-black text-violet-900">€{pkg.priceEur}</p>
                <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  {fillPlaceholders(tx.ui_topPackagesValidDays, { days: pkg.days })}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug">{title}</p>
              {desc ? (
                <p className="text-[11px] text-gray-600 leading-snug flex-1">{desc}</p>
              ) : null}
              <p className="text-[10px] text-gray-500">
                {fillPlaceholders(tx.ui_topPackagesHomepageLabel, { label: pkg.label })}
              </p>
              <button
                type="button"
                disabled={blocked || (busyPurpose != null && !busy)}
                onClick={() => void buy(pkg.purpose)}
                className={cn(
                  "w-full min-h-10 rounded-lg font-semibold text-xs inline-flex items-center justify-center gap-1.5 touch-manipulation",
                  blocked
                    ? "bg-gray-100 text-gray-400 border border-gray-200"
                    : "bg-violet-600 hover:bg-violet-700 text-white",
                )}
              >
                {busy ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" aria-hidden />
                )}
                {tx.ui_payWithCard}
              </button>
            </div>
          );
        })}
      </div>

      {!phase2Enabled ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {tx.ui_topPackagesPhase2Soon}
        </p>
      ) : null}
    </section>
  );
}

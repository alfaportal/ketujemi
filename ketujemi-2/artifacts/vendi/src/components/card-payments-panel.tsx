import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { fetchPaymentsStatus, type PaymentsStatus } from "@/lib/stripe-checkout";
import { TopListingPackages } from "@/components/top-listing-packages";
import { useMarket } from "@/lib/market-context";

export type CardPaymentsPanelProps = {
  /** When set, show TOP boost for this listing (owner pages). */
  listingId?: number;
  /** Compact row for footer / global strip. */
  compact?: boolean;
  className?: string;
  /** Hide when user is not logged in (default true). */
  requireAuth?: boolean;
};

/** Card payments: TOP boost packages only. */
export function CardPaymentsPanel({
  listingId,
  compact = false,
  className = "",
  requireAuth = true,
}: CardPaymentsPanelProps) {
  const { user, loading } = useAuth();
  const { t } = useMarket();
  const tx = t as Record<string, string>;
  const [status, setStatus] = useState<PaymentsStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchPaymentsStatus()
      .then((s) => {
        if (!cancelled) setStatus(s);
      })
      .catch(() => {
        if (!cancelled) {
          setStatus({
            cardPaymentsAvailable: false,
            stripeConfigured: false,
            devBypass: false,
            phase2: false,
            stripePublishableKey: null,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (requireAuth && (loading || !user)) return null;
  if (!user) return null;

  const showTop = listingId != null && listingId > 0;
  if (!showTop) return null;

  const paymentsReady = status?.cardPaymentsAvailable ?? false;

  const topPackages = (
    <TopListingPackages
      listingId={listingId!}
      compact={compact}
      phase2Enabled={status?.phase2 ?? false}
      paymentsReady={paymentsReady}
    />
  );

  const inner = compact ? (
    <div className="flex flex-wrap items-center gap-2">{topPackages}</div>
  ) : (
    <div className="space-y-3">{topPackages}</div>
  );

  if (compact) {
    return (
      <div
        className={`border-t border-blue-100 bg-blue-50/60 px-3 py-2 ${className}`}
        role="region"
        aria-label={tx.ui_cardPaymentsAria}
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-blue-900 flex items-center gap-1 shrink-0">
            <CreditCard className="h-3.5 w-3.5" aria-hidden />
            {tx.ui_cardPaymentsCompactLabel}
          </span>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-white p-4 space-y-3 ${className}`}
      aria-label={tx.ui_cardPaymentsAria}
    >
      <div className="flex items-start gap-2">
        <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">{tx.ui_cardPaymentsTitle}</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{tx.ui_cardPaymentsDesc}</p>
        </div>
      </div>
      {!paymentsReady ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {tx.ui_cardPaymentsNotConfigured}
        </p>
      ) : status?.devBypass ? (
        <p className="text-xs text-gray-500">{tx.ui_cardPaymentsDevBypass}</p>
      ) : null}
      <ul className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
        <li className="flex items-center gap-1">{tx.ui_cardPaymentsTopNote}</li>
      </ul>
      {inner}
    </section>
  );
}

/** Listing id from `/listings/:id` or `/listings/:id/edit`. */
export function listingIdFromPath(pathname: string): number | undefined {
  const m = pathname.match(/^\/listings\/(\d+)(?:\/|$)/);
  if (!m) return undefined;
  const id = Number(m[1]);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

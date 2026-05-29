import { useEffect, useState } from "react";
import { CreditCard, Crown, Tag } from "lucide-react";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { fetchPaymentsStatus, type PaymentsStatus } from "@/lib/stripe-checkout";
import { PayWithCardButton } from "@/components/pay-with-card-button";
import { TopListingPackages } from "@/components/top-listing-packages";

function isVipActive(user: AuthUser): boolean {
  return (
    user.business_tier === "vip" &&
    !!user.vip_expires_at &&
    new Date(user.vip_expires_at) > new Date()
  );
}

export type CardPaymentsPanelProps = {
  /** When set, show TOP boost for this listing (owner pages). */
  listingId?: number;
  /** Compact row for footer / global strip. */
  compact?: boolean;
  className?: string;
  /** Hide when user is not logged in (default true). */
  requireAuth?: boolean;
};

/**
 * Card payments: VIP, extra listing €1, TOP packages (€2 / €5 / €8).
 */
export function CardPaymentsPanel({
  listingId,
  compact = false,
  className = "",
  requireAuth = true,
}: CardPaymentsPanelProps) {
  const { user, loading } = useAuth();
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

  const isBusiness = user.account_type === "business";
  const vip = isVipActive(user);

  const showVip = isBusiness && !vip;
  const showExtraPost = isBusiness;
  const showTop = listingId != null && listingId > 0;

  if (!showVip && !showExtraPost && !showTop) {
    if (!compact) {
      return (
        <div
          className={`rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 text-sm text-gray-600 ${className}`}
        >
          <p>
            Aktivizoni{" "}
            <a href="/profile" className="font-semibold text-blue-600 hover:underline">
              llogarinë e biznesit
            </a>{" "}
            për të paguar me kartë (VIP ose njoftime shtesë).
          </p>
        </div>
      );
    }
    return null;
  }

  const paymentsReady = status?.cardPaymentsAvailable ?? false;

  const businessButtons = (
    <>
      {showVip ? (
        <PayWithCardButton
          purpose="vip_month"
          hideWhenUnavailable={false}
          variant={compact ? "outline" : "default"}
          size={compact ? "sm" : "default"}
          className={
            compact
              ? "min-h-10 border-[#1A56A0]/40 text-[#1A56A0] bg-white"
              : "min-h-11 flex-1 border-[#1A56A0]/40 bg-blue-50 text-[#1A56A0] hover:bg-blue-100"
          }
          title={!paymentsReady ? "Konfiguroni Stripe në server" : undefined}
        >
          {compact ? "VIP €20" : "VIP Biznes — €20/muaj"}
        </PayWithCardButton>
      ) : null}
      {showExtraPost ? (
        <PayWithCardButton
          purpose="extra_post"
          hideWhenUnavailable={false}
          variant="outline"
          size={compact ? "sm" : "default"}
          className={
            compact
              ? "min-h-10 border-blue-200 text-blue-800 bg-white"
              : "min-h-11 flex-1 border-blue-200 text-blue-800 bg-white hover:bg-blue-50"
          }
          title={!paymentsReady ? "Konfiguroni Stripe në server" : undefined}
        >
          {compact ? "Njoftim +€1" : "Njoftim shtesë — €1"}
        </PayWithCardButton>
      ) : null}
    </>
  );

  const topPackages = showTop ? (
    <TopListingPackages
      listingId={listingId!}
      compact={compact}
      phase2Enabled={status?.phase2 ?? false}
      paymentsReady={paymentsReady}
    />
  ) : null;

  const inner = compact ? (
    <div className="flex flex-wrap items-center gap-2">
      {businessButtons}
      {topPackages}
    </div>
  ) : (
    <div className="space-y-3">
      {(showVip || showExtraPost) ? (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">{businessButtons}</div>
      ) : null}
      {topPackages}
    </div>
  );

  if (compact) {
    return (
      <div
        className={`border-t border-blue-100 bg-blue-50/60 px-3 py-2 ${className}`}
        role="region"
        aria-label="Pagesa me kartë"
      >
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-blue-900 flex items-center gap-1 shrink-0">
            <CreditCard className="h-3.5 w-3.5" aria-hidden />
            Kartë:
          </span>
          {inner}
        </div>
      </div>
    );
  }

  return (
    <section
      className={`rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/90 to-white p-4 space-y-3 ${className}`}
      aria-label="Pagesa me kartë"
    >
      <div className="flex items-start gap-2">
        <CreditCard className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" aria-hidden />
        <div>
          <h2 className="font-bold text-gray-900 text-sm sm:text-base">Paguaj me kartë</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
            Visa, Mastercard dhe kartat e tjera përmes Stripe — e sigurt, pa ruajtje të të dhënave
            të kartës në faqen tonë.
          </p>
        </div>
      </div>
      {!paymentsReady ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Pagesa me kartë nuk është aktivizuar ende në server. Kontaktoni administratorin ose provoni
          më vonë.
        </p>
      ) : status?.devBypass ? (
        <p className="text-xs text-gray-500">(Modalitet test — pa Stripe real)</p>
      ) : null}
      <ul className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
        {showVip ? (
          <li className="flex items-center gap-1">
            <Crown className="h-3 w-3 text-[#1A56A0]" /> VIP — njoftime të pakufizuara
          </li>
        ) : null}
        {showExtraPost ? (
          <li className="flex items-center gap-1">
            <Tag className="h-3 w-3" /> €1 për njoftim shtesë (biznes)
          </li>
        ) : null}
        {showTop ? (
          <li className="flex items-center gap-1">
            TOP: €2 (4d) · €5 (15d) · €8 (30d)
          </li>
        ) : null}
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

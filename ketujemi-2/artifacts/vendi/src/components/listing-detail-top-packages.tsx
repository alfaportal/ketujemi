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

type ListingDetailTopPackagesProps = {
  listingId: number;
};

/** TOP boost accordion — listing detail page only (owner). */
export function ListingDetailTopPackages({ listingId }: ListingDetailTopPackagesProps) {
  const { toast } = useToast();
  const [openId, setOpenId] = useState<TopPackageId | null>(null);
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

  function togglePackage(id: TopPackageId) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  async function buy(purpose: TopListingPurpose) {
    if (blocked) return;
    setBusyPurpose(purpose);
    try {
      await redirectToStripeCheckout({ purpose, listing_id: listingId });
    } catch (e) {
      toast({
        title: e instanceof Error ? e.message : "Pagesa TOP dështoi",
        variant: "destructive",
      });
      setBusyPurpose(null);
    }
  }

  const openPkg = TOP_PACKAGES_PUBLIC.find((p) => p.id === openId);

  return (
    <section
      className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4 sm:p-5 space-y-4"
      aria-label="Paketat TOP"
    >
      <p className="text-sm sm:text-base text-gray-800 leading-snug">
        Dëshiron shpalljen tënde në krye të faqes kryesore? Me paketën TOP shfaqeni para të gjithëve.
      </p>

      {!paymentsReady ? (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          Pagesa me kartë nuk është aktivizuar ende në server. Kontaktoni administratorin ose provoni
          më vonë.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {TOP_PACKAGES_PUBLIC.map((pkg) => {
          const isOpen = openId === pkg.id;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => togglePackage(pkg.id)}
              className={cn(
                "min-h-11 px-4 rounded-xl border-2 text-sm font-black inline-flex items-center gap-1.5 touch-manipulation transition-colors",
                isOpen
                  ? "border-violet-500 bg-violet-100 text-violet-900"
                  : "border-violet-200 bg-white text-violet-900 hover:border-violet-400 hover:bg-violet-50/60",
              )}
              aria-expanded={isOpen}
            >
              <Sparkles className="h-4 w-4 shrink-0" aria-hidden />
              €{pkg.priceEur}
            </button>
          );
        })}
      </div>

      {openPkg ? (
        <div className="rounded-xl border-2 border-violet-200 bg-white p-4 space-y-3">
          <p className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" aria-hidden />
            Zgjidh paketën TOP
          </p>
          <p className="text-[11px] sm:text-xs text-gray-600 leading-snug">
            Njoftimi shfaqet në karuselin «TOP Njoftime» në kryefaqe (poshtë partnerëve VIP). Zgjidh
            paketën — pas pagesës me kartë vlen për ditët e shënuara.
          </p>
          <p className="text-xs text-gray-500">
            Visa, Mastercard dhe kartat e tjera përmes Stripe — e sigurt, pa ruajtje të të dhënave të
            kartës në faqen tonë.
          </p>
          <div>
            <p className="text-2xl font-black text-violet-900">€{openPkg.priceEur}</p>
            <p className="text-sm font-bold text-gray-800">{openPkg.label} në kryefaqe</p>
            <p className="text-xs text-gray-500 mt-0.5">Vlen {openPkg.days} ditë nga pagesa</p>
          </div>
          <button
            type="button"
            disabled={blocked || busyPurpose != null}
            onClick={() => void buy(openPkg.purpose)}
            className={cn(
              "w-full sm:w-auto min-h-11 px-5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 touch-manipulation",
              blocked
                ? "bg-gray-100 text-gray-400 border border-gray-200"
                : "bg-violet-600 hover:bg-violet-700 text-white",
            )}
          >
            {busyPurpose === openPkg.purpose ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <CreditCard className="h-4 w-4" aria-hidden />
            )}
            Paguaj me kartë
          </button>
          {!phase2Enabled ? (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              TOP aktivizohet së shpejti (Faza 2).
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

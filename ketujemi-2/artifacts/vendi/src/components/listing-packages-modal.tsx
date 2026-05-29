import { useEffect, useState } from "react";
import { X, Loader2, Wallet, Check } from "lucide-react";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

export type WalletTopupOffer = {
  id: "s" | "m" | "l";
  price_eur: number;
  listings: number;
  label: string;
};

const FALLBACK_TOPUPS: WalletTopupOffer[] = [
  { id: "s", price_eur: 5, listings: 16, label: "Paketa S — €5 (~16 shpallje)" },
  { id: "m", price_eur: 10, listings: 33, label: "Paketa M — €10 (~33 shpallje)" },
  { id: "l", price_eur: 20, listings: 66, label: "Paketa L — €20 (~66 shpallje)" },
];

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

/** Mbushje portofoli — €0.30/shpallje, pa skadim deri sa harxhohet. */
export function ListingPackagesModal({ open, onClose, message }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [topups, setTopups] = useState<WalletTopupOffer[]>(FALLBACK_TOPUPS);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/wallet", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            topups?: Array<{ id: string; price_eur: number; listings: number; label: string }>;
          } | null,
        ) => {
          if (data?.topups?.length) {
            setTopups(
              data.topups.map((t) => ({
                id: t.id as "s" | "m" | "l",
                price_eur: t.price_eur,
                listings: t.listings,
                label: t.label,
              })),
            );
          }
        },
      )
      .catch(() => setTopups(FALLBACK_TOPUPS));
  }, [open]);

  if (!open) return null;

  async function buy(pkg: "s" | "m" | "l") {
    setBusy(pkg);
    setError(null);
    try {
      const res = await fetch("/api/wallet/topup-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ package: pkg }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.message ?? data.error ?? "Pagesa nuk u hap.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Lidhja me serverin dështoi.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Wallet className="h-5 w-5" style={{ color: BRAND_BLUE }} />
            Mbush portofolin
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Mbyll">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {message ??
              "Bli kredi për shpallje (€0.30 secila). Kredi nuk skadon — përdoret deri sa ta harxhoni."}
          </p>

          <div className="space-y-2">
            {topups.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={!!busy}
                onClick={() => void buy(p.id)}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-4 transition-colors touch-manipulation",
                  p.id === "m"
                    ? "border-[#1A56A0] bg-blue-50/80"
                    : "border-gray-200 hover:border-blue-300",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-black text-gray-900">{p.label.split("—")[0]?.trim() ?? p.label}</p>
                    <p className="text-sm text-gray-600 mt-0.5">~{p.listings} shpallje @ €0.30</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pa afat kohor — deri sa harxhohet krediti</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xl font-black" style={{ color: BRAND_BLUE }}>
                      €{p.price_eur}
                    </p>
                    {busy === p.id ? (
                      <Loader2 className="h-5 w-5 animate-spin ml-auto mt-1 text-blue-600" />
                    ) : (
                      <span className="text-xs font-bold text-blue-700">Bli me kartë</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Paketat e vjetra — mbetet për importet ekzistuese. */
export function ListingPackageSuccessBanner({
  onDismiss,
}: {
  code?: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
      <p className="font-bold flex items-center gap-2">
        <Check className="h-4 w-4 shrink-0" />
        Portofoli u mbush!
      </p>
      <p className="mt-1">Mund të vazhdoni me postimin e njoftimit.</p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-2 text-xs font-bold text-green-700 underline"
      >
        Vazhdo
      </button>
    </div>
  );
}

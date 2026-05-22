import { useState } from "react";
import { X, Loader2, Package, Check } from "lucide-react";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

export type ListingPackageOffer = {
  id: "s" | "m" | "l";
  name: string;
  price_eur: number;
  extra_slots: number;
  days: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  message?: string;
};

const DEFAULT_PACKAGES: ListingPackageOffer[] = [
  { id: "s", name: "Paketa S", price_eur: 5, extra_slots: 20, days: 30 },
  { id: "m", name: "Paketa M", price_eur: 10, extra_slots: 50, days: 30 },
  { id: "l", name: "Paketa L", price_eur: 20, extra_slots: 120, days: 30 },
];

export function ListingPackagesModal({ open, onClose, message }: Props) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [redeemCode, setRedeemCode] = useState("");
  const [redeemBusy, setRedeemBusy] = useState(false);
  const [redeemOk, setRedeemOk] = useState<string | null>(null);

  if (!open) return null;

  async function buy(pkg: "s" | "m" | "l") {
    setBusy(pkg);
    setError(null);
    try {
      const res = await fetch("/api/listing-packages/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ package: pkg }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Pagesa nuk u hap.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Lidhja me serverin dështoi.");
    } finally {
      setBusy(null);
    }
  }

  async function redeem() {
    const code = redeemCode.trim();
    if (!code) return;
    setRedeemBusy(true);
    setError(null);
    setRedeemOk(null);
    try {
      const res = await fetch("/api/listing-packages/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        effective_limit?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Kodi nuk u pranua.");
        return;
      }
      setRedeemOk(
        `Paketa u verifikua. Limiti aktual: ${data.effective_limit ?? "—"} njoftime.`,
      );
      setRedeemCode("");
    } catch {
      setError("Verifikimi dështoi.");
    } finally {
      setRedeemBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5" style={{ color: BRAND_BLUE }} />
            Paketa shtesë
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Mbyll">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">
            {message ?? "Ke arritur limitin falas. Zgjero me një paketë shtesë."}
          </p>

          <div className="space-y-2">
            {DEFAULT_PACKAGES.map((p) => (
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
                    <p className="font-black text-gray-900">{p.name}</p>
                    <p className="text-sm text-gray-600 mt-0.5">
                      +{p.extra_slots} shpallje · {p.days} ditë
                    </p>
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

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Keni kod aktivizimi?
            </p>
            <div className="flex gap-2">
              <input
                value={redeemCode}
                onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                placeholder="KJ-2026-XXXXX"
                className="flex-1 min-h-11 rounded-xl border border-gray-200 px-3 font-mono text-sm uppercase"
              />
              <button
                type="button"
                disabled={redeemBusy || !redeemCode.trim()}
                onClick={() => void redeem()}
                className="min-h-11 px-4 rounded-xl font-bold text-white text-sm shrink-0 disabled:opacity-50"
                style={{ backgroundColor: BRAND_BLUE }}
              >
                {redeemBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aktivizo"}
              </button>
            </div>
          </div>

          {redeemOk ? (
            <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 flex gap-2">
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
              {redeemOk}
            </p>
          ) : null}
          {error ? <p className="text-sm text-red-600 font-medium">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}

/** Success banner after Stripe return */
export function ListingPackageSuccessBanner({
  code,
  onDismiss,
}: {
  code: string;
  onDismiss: () => void;
}) {
  return (
    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
      <p className="font-bold">Paketa u aktivizua!</p>
      <p className="mt-1">Mund të postoni menjëherë. Kodi juaj:</p>
      <p className="mt-2 font-mono text-base font-black tracking-wider">{code}</p>
      <p className="mt-1 text-xs text-green-800">
        Kodi u dërgua edhe me email. Ruajeni për pajisje tjetër (e njëjta llogari).
      </p>
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

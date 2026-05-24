import { useCallback, useEffect, useState } from "react";
import { Loader2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";

type WalletTopup = {
  id: string;
  price_eur: number;
  listings: number;
  label: string;
};

type WalletData = {
  balance_eur: string;
  listings_remaining: number;
  listing_price_eur: string;
  topups: WalletTopup[];
  stripe: boolean;
};

export function WalletPanel({ className = "" }: { className?: string }) {
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyPkg, setBusyPkg] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet", { credentials: "include" });
      if (!res.ok) {
        setData(null);
        return;
      }
      const j = (await res.json()) as WalletData;
      setData(j);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, user?.id]);

  async function startTopup(pkg: string) {
    setBusyPkg(pkg);
    try {
      const res = await fetch("/api/wallet/topup-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ package: pkg }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
      };
      if (!res.ok || !body.url) {
        toast({
          title: body.message ?? body.error ?? "Pagesa dështoi",
          variant: "destructive",
        });
        return;
      }
      window.location.href = body.url;
    } catch {
      toast({ title: "Gabim rrjeti", variant: "destructive" });
    } finally {
      setBusyPkg(null);
    }
  }

  const balance = user?.wallet?.balance_eur ?? data?.balance_eur ?? "0.00";
  const remaining = user?.wallet?.listings_remaining ?? data?.listings_remaining ?? 0;

  return (
    <div
      className={`rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5 space-y-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
          <Wallet className="text-emerald-700" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-gray-900">Portofoli</h2>
          <p className="text-sm text-gray-600 mt-0.5">
            1 shpallje = <span className="font-semibold">€0.30</span> nga balanca
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white border border-emerald-100 px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Balanca</p>
              <p className="text-2xl font-black text-emerald-700">€{balance}</p>
            </div>
            <div className="rounded-xl bg-white border border-emerald-100 px-4 py-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Shpallje të mbetura</p>
              <p className="text-2xl font-black text-gray-900">{remaining}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800">Mbush portofolin</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(data?.topups ?? [
                { id: "5", price_eur: 5, listings: 16, label: "€5 — 16 shpallje" },
                { id: "10", price_eur: 10, listings: 33, label: "€10 — 33 shpallje" },
                { id: "20", price_eur: 20, listings: 66, label: "€20 — 66 shpallje" },
              ]).map((t) => (
                <Button
                  key={t.id}
                  type="button"
                  variant="outline"
                  className="min-h-12 h-auto py-2 flex flex-col gap-0.5 border-emerald-200 hover:bg-emerald-50"
                  disabled={busyPkg != null || data?.stripe === false}
                  onClick={() => void startTopup(t.id)}
                >
                  {busyPkg === t.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span className="font-bold">{t.label}</span>
                      <span className="text-xs text-gray-500 font-normal">
                        Pagesa online
                      </span>
                    </>
                  )}
                </Button>
              ))}
            </div>
            {data?.stripe === false ? (
              <p className="text-xs text-amber-700">
                Pagesa me kartë nuk është konfiguruar ende në server.
              </p>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-emerald-700"
            onClick={() => {
              void load();
              void refresh();
            }}
          >
            Rifresko balancën
          </Button>
        </>
      )}
    </div>
  );
}

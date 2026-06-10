import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useSearch } from "wouter";
import { Building2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth-context";
import { getFetchErrorMessage } from "@/lib/fetch-with-timeout";
import { useWalletBankPaymentCopy } from "@/lib/wallet-bank-payment-i18n";

type BankPaymentInfo = {
  token: string;
  amount_eur: string;
  status: string;
  iban: string;
  bankName: string;
  beneficiary: string;
  reference: string;
  message: string;
};

export default function WalletBankPaymentPage() {
  const c = useWalletBankPaymentCopy();
  const search = useSearch();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [info, setInfo] = useState<BankPaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const token = new URLSearchParams(search).get("token")?.trim() ?? "";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    void fetchWithTimeout(`/api/wallet/bank-payment?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("load_failed");
        return res.json() as Promise<BankPaymentInfo>;
      })
      .then((data) => {
        if (!cancelled) setInfo(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setInfo(null);
          setLoadError(getFetchErrorMessage(e));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, token]);

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: `${label} ${c.copied}` });
    } catch {
      toast({ title: c.copyFailed, variant: "destructive" });
    }
  }

  if (authLoading || loading) {
    return (
      <div className="max-w-lg mx-auto py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-gray-700">{c.loginRequired}</p>
        <Button asChild>
          <Link href="/login">{c.loginBtn}</Link>
        </Button>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-gray-700" role="alert">
          {loadError ?? c.notFound}
        </p>
        <Button asChild variant="outline">
          <Link href="/profili">{c.backProfile}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
          <Building2 className="text-blue-700" size={22} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{c.pageTitle}</h1>
          <p className="text-sm text-gray-600">{c.pageSubtitle}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 space-y-4">
        <p className="text-sm text-gray-700">{info.message}</p>
        <div className="rounded-xl bg-white border border-blue-100 p-4 space-y-3 text-sm">
          <Row label={c.amount} value={`€${info.amount_eur}`} onCopy={() => void copyText(c.amount, info.amount_eur)} />
          <Row label={c.bank} value={info.bankName || "—"} />
          <Row label={c.beneficiary} value={info.beneficiary} onCopy={() => void copyText(c.beneficiary, info.beneficiary)} />
          <Row label={c.iban} value={info.iban} onCopy={() => void copyText(c.iban, info.iban)} mono />
          <Row
            label={c.reference}
            value={info.reference}
            onCopy={() => void copyText(c.reference, info.reference)}
            mono
          />
        </div>
        <p className="text-xs text-amber-800">{c.referenceHint}</p>
      </div>

      <Button asChild className="w-full">
        <Link href="/profili">{c.backWallet}</Link>
      </Button>
    </div>
  );
}

function Row({
  label,
  value,
  onCopy,
  mono,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`font-semibold text-gray-900 break-all ${mono ? "font-mono text-xs" : ""}`}>
          {value}
        </p>
      </div>
      {onCopy ? (
        <Button type="button" variant="ghost" size="icon" className="shrink-0" onClick={onCopy}>
          <Copy className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}

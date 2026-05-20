import { useState } from "react";
import { Building2, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { Link } from "wouter";

export function BusinessAccountCard({ user }: { user: AuthUser }) {
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState(user.business_name ?? "");
  const [busy, setBusy] = useState(false);
  const isBusiness = user.account_type === "business";
  const isVip =
    user.business_tier === "vip" &&
    !!user.vip_expires_at &&
    new Date(user.vip_expires_at) > new Date();

  async function upgrade() {
    if (businessName.trim().length < 2) {
      toast({ title: "Shkruani emrin e biznesit", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/account/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ business_name: businessName.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? "Gabim",
          variant: "destructive",
        });
        return;
      }
      await refresh();
      toast({ title: "Llogaria u aktivizua si biznes!" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="font-bold text-gray-900">Llogaria e biznesit</h2>
      </div>

      {!isBusiness ? (
        <>
          <p className="text-sm text-gray-600">
            Aktivizoni llogarinë e biznesit për 10 njoftime falas për kategori dhe €1 për çdo shtesë.
            Kërkohet email dhe telefon i verifikuar.
          </p>
          <div className="space-y-2">
            <Label htmlFor="business-name">Emri i biznesit</Label>
            <Input
              id="business-name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="p.sh. Auto Sh.p.k."
              className="min-h-12 bg-white"
            />
          </div>
          <Button
            type="button"
            className="w-full min-h-12 bg-blue-600 hover:bg-blue-700"
            disabled={busy}
            onClick={() => void upgrade()}
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Aktivizo si biznes"}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{user.business_name}</span>
            {isVip ? (
              <span className="ml-2 inline-flex items-center gap-1 text-[#1A56A0]">
                <Crown className="h-4 w-4" /> VIP aktiv
              </span>
            ) : (
              <span className="ml-2 text-gray-500">— Standard (10/kategori + €1 shtesë)</span>
            )}
          </p>
          {!isVip ? (
            <p className="text-xs text-[#1A56A0]/90">
              VIP mund ta blini me kartë te seksioni «Paguaj me kartë» më poshtë.
            </p>
          ) : null}
          <Link
            href="/business-rules"
            className="block text-center text-sm font-semibold text-blue-600 hover:underline"
          >
            Lexo rregullorjen e biznesit
          </Link>
        </>
      )}
    </div>
  );
}

import { useState } from "react";
import { Building2, Crown, Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth, type AuthUser } from "@/lib/auth-context";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type PackageChoice = "partner" | "vip";

export function BusinessAccountCard({ user }: { user: AuthUser }) {
  const { refresh } = useAuth();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState(user.business_name ?? "");
  const [selectedPackage, setSelectedPackage] = useState<PackageChoice>("partner");
  const [busy, setBusy] = useState(false);
  const isBusiness = user.account_type === "business";
  const isPending = user.business_status === "pending";
  const isBlocked = user.business_status === "blocked";
  const isActive = user.business_status === "active" || (!user.business_status && isBusiness);
  const isVip =
    user.business_tier === "vip" &&
    !!user.vip_expires_at &&
    new Date(user.vip_expires_at) > new Date();

  async function applyForBusiness() {
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
        body: JSON.stringify({
          business_name: businessName.trim(),
          package: selectedPackage,
        }),
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
      toast({
        title: (data as { message?: string }).message ?? "Aplikimi u dërgua!",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-blue-600" aria-hidden />
        <h2 className="font-bold text-gray-900">Llogaria e biznesit / Partner</h2>
      </div>

      {!isBusiness ? (
        <>
          <p className="text-sm text-gray-600">
            Zgjidhni paketën Partner (€30) ose VIP Partner (€50). Llogaria aktivizohet nga
            administratori pas pagesës. Kërkohet email dhe telefon i verifikuar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedPackage("partner")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selectedPackage === "partner"
                  ? "border-[#1A56A0] bg-white shadow-md"
                  : "border-gray-200 bg-white/60 hover:border-blue-300",
              )}
            >
              <p className="font-black text-[#1A56A0]">Partner</p>
              <p className="text-2xl font-black text-gray-900 mt-1">€30</p>
              <p className="text-xs text-gray-500 mt-2">Logo në faqe, link i vetëm</p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedPackage("vip")}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition-all",
                selectedPackage === "vip"
                  ? "border-amber-500 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-md"
                  : "border-gray-200 bg-white/60 hover:border-amber-300",
              )}
            >
              <p className="font-black text-amber-700 flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-500" /> VIP Partner
              </p>
              <p className="text-2xl font-black text-gray-900 mt-1">€50</p>
              <p className="text-xs text-gray-500 mt-2">Banner lëvizës deri në 5 foto</p>
            </button>
          </div>
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
            onClick={() => void applyForBusiness()}
          >
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              `Apliko si ${selectedPackage === "vip" ? "VIP Partner" : "Partner"}`
            )}
          </Button>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{user.business_name}</span>
            {isVip ? (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                <Crown className="h-4 w-4" /> VIP Partner
              </span>
            ) : (
              <span className="ml-2 text-[#1A56A0] font-semibold">— Partner</span>
            )}
          </p>
          {isPending ? (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              Në pritje të aktivizimit nga administratori.
            </p>
          ) : null}
          {isBlocked ? (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              Llogaria është bllokuar.
            </p>
          ) : null}
          {isActive && !isVip ? (
            <p className="text-xs text-gray-500">
              Për banner lëvizës (5 foto), kontaktoni administratorin për paketën VIP.
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

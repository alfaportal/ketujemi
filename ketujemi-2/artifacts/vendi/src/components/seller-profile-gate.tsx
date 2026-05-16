import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, userNeedsSellerProfile } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";

type Props = {
  onReady: () => void;
};

export function SellerProfileGate({ onReady }: Props) {
  const { user, refresh } = useAuth();
  const { t, market } = useMarket();
  const { toast } = useToast();
  const [name, setName] = useState(user?.display_name ?? "");
  const [phone, setPhone] = useState(
    user?.contact_phone
      ? user.contact_phone.startsWith("+")
        ? user.contact_phone
        : `+${user.contact_phone}`
      : user?.phone_e164_digits
        ? `+${user.phone_e164_digits}`
        : "",
  );
  const [busy, setBusy] = useState(false);

  if (!user || !userNeedsSellerProfile(user)) {
    return null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 8) {
      toast({ title: t.reg_sellerGate_invalid, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: name.trim(),
          contact_phone: phone,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { error?: string }).error ?? t.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      await refresh();
      onReady();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal
      aria-labelledby="seller-gate-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 space-y-4">
        <div>
          <h2 id="seller-gate-title" className="text-lg font-black text-gray-900">
            {t.reg_sellerGate_title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t.reg_sellerGate_sub}</p>
        </div>
        <form className="space-y-4" onSubmit={save}>
          <div className="space-y-2">
            <Label htmlFor="gate-name">{t.yourName}</Label>
            <Input
              id="gate-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              autoComplete="name"
              placeholder={t.reg_sellerGate_namePh}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gate-phone">{t.phoneNum}</Label>
            <Input
              id="gate-phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              placeholder={`${market.prefix} 44 123 456`}
            />
          </div>
          <Button type="submit" className="w-full min-h-12 h-12" disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.reg_sellerGate_save}
          </Button>
        </form>
      </div>
    </div>
  );
}

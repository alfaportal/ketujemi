import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onAdded: (session?: { token: string; expiresInSeconds: number }) => void;
};

/** Email-login users can attach a verified phone as second factor for profile edits. */
export function ProfileAddPhone({ onAdded }: Props) {
  const { toast } = useToast();
  const { t: copy, market } = useMarket();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/profile/verify/sms/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        toast({
          title: data.message ?? data.error ?? copy.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      setStep("sent");
      toast({ title: copy.toast_codeSent });
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/profile/verify/sms/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        profile_change_token?: string;
        expires_in_seconds?: number;
        fallback_to_email?: boolean;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        if (data.fallback_to_email) {
          toast({ title: data.message ?? copy.profile_sms_fallback_message });
          onAdded();
          return;
        }
        toast({
          title: data.message ?? data.error ?? copy.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      toast({ title: copy.profile_add_phone_ok });
      if (data.profile_change_token) {
        onAdded({
          token: data.profile_change_token,
          expiresInSeconds: data.expires_in_seconds ?? 600,
        });
      } else {
        onAdded();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-900">{copy.profile_add_phone_heading}</h3>
        <p className="text-xs text-gray-600 mt-1">{copy.profile_add_phone_hint}</p>
      </div>
      {step === "idle" ? (
        <div className="space-y-2">
          <Label htmlFor="profile-add-phone">{copy.phoneNum}</Label>
          <Input
            id="profile-add-phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`${market.prefix} 44 123 456`}
            className="min-h-12 h-12 bg-white"
          />
          <Button
            type="button"
            className="w-full min-h-11"
            disabled={busy || phone.replace(/\D/g, "").length < 8}
            onClick={() => void sendCode()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.profile_add_phone_send}
          </Button>
        </div>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profile-add-phone-code">{copy.profile_verify_code}</Label>
            <Input
              id="profile-add-phone-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="min-h-12 h-12 bg-white"
            />
          </div>
          <Button type="submit" className="w-full min-h-11" disabled={busy || code.length < 4}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.profile_add_phone_confirm}
          </Button>
        </form>
      )}
    </section>
  );
}

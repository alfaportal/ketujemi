import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import type { AuthUser } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  user: AuthUser;
  secondFactor: "sms" | "email";
  onUnlocked: (token: string, expiresInSeconds: number) => void;
  onCancel: () => void;
};

export function ProfileChangeGate({ user, secondFactor, onUnlocked, onCancel }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [activeChannel, setActiveChannel] = useState<"sms" | "email">(secondFactor);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  const [smsPhone, setSmsPhone] = useState(
    user.contact_phone?.trim() ||
      (user.phone_e164_digits ? `+${user.phone_e164_digits}` : ""),
  );
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    try {
      const url =
        activeChannel === "sms"
          ? "/api/auth/profile/verify/sms/start"
          : "/api/auth/profile/verify/email/start";
      const body = activeChannel === "sms" ? { phone: smsPhone } : {};
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        toast({
          title: data.message ?? data.error ?? t.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      setStep("sent");
      toast({
        title: activeChannel === "sms" ? t.toast_codeSent : t.toast_emailSent,
      });
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const url =
        activeChannel === "sms"
          ? "/api/auth/profile/verify/sms/confirm"
          : "/api/auth/profile/verify/email/confirm";
      const res = await fetchWithTimeout(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        profile_change_token?: string;
        expires_in_seconds?: number;
        fallback_to_email?: boolean;
        masked_email?: string;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        if (data.fallback_to_email && activeChannel === "sms") {
          const msg = data.message ?? t.profile_sms_fallback_message;
          setActiveChannel("email");
          setFallbackNote(msg);
          setStep("sent");
          setCode("");
          toast({ title: msg });
          return;
        }
        toast({
          title: data.message ?? data.error ?? t.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      if (!data.profile_change_token) {
        toast({ title: t.toast_verifyFail, variant: "destructive" });
        return;
      }
      onUnlocked(data.profile_change_token, data.expires_in_seconds ?? 600);
      setCode("");
      toast({ title: t.profile_verify_ok });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
      <p className="text-sm text-amber-900 font-medium">
        {activeChannel === "sms" ? t.profile_verify_sms_hint : t.profile_verify_email_hint}
      </p>

      {fallbackNote ? (
        <p className="text-sm text-blue-900 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
          {fallbackNote}
        </p>
      ) : null}

      {activeChannel === "sms" && !user.phone_verified ? (
        <div className="space-y-2">
          <Label htmlFor="profile-verify-phone">{t.phoneNum}</Label>
          <Input
            id="profile-verify-phone"
            type="tel"
            value={smsPhone}
            onChange={(e) => setSmsPhone(e.target.value)}
            className="min-h-12 h-12 bg-white"
          />
        </div>
      ) : null}

      {step === "idle" ? (
        <Button type="button" className="w-full min-h-11" disabled={busy} onClick={() => void sendCode()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t.profile_verify_send}
        </Button>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profile-verify-code">{t.profile_verify_code}</Label>
            <Input
              id="profile-verify-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="min-h-12 h-12 bg-white"
            />
          </div>
          <Button type="submit" className="w-full min-h-11" disabled={busy || code.length < 4}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : t.profile_verify_confirm}
          </Button>
          <button
            type="button"
            className="text-xs text-amber-800 underline w-full text-center"
            onClick={() => {
              setStep("idle");
              void sendCode();
            }}
          >
            {t.profile_verify_resend}
          </button>
        </form>
      )}

      <Button type="button" variant="ghost" className="w-full min-h-10 text-sm" onClick={onCancel}>
        {t.profile_edit_cancel}
      </Button>
    </div>
  );
}

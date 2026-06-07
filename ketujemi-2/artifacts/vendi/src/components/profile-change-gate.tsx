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
  needsSms: boolean;
  needsEmailForPhone: boolean;
  token: string | null;
  onToken: (token: string | null) => void;
};

export function ProfileChangeGate({ user, needsSms, needsEmailForPhone, token, onToken }: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [smsPhone, setSmsPhone] = useState(
    user.contact_phone?.trim() ||
      (user.phone_e164_digits ? `+${user.phone_e164_digits}` : ""),
  );
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);

  const channel = needsSms ? "sms" : needsEmailForPhone ? "email" : null;
  if (!channel) return null;

  if (token) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        {t.profile_verify_ok}
      </div>
    );
  }

  async function sendCode() {
    setBusy(true);
    try {
      const url =
        channel === "sms"
          ? "/api/auth/profile/verify/sms/start"
          : "/api/auth/profile/verify/email/start";
      const body = channel === "sms" ? { phone: smsPhone } : {};
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
        title: channel === "sms" ? t.toast_codeSent : t.toast_emailSent,
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
        channel === "sms"
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
        message?: string;
        error?: string;
      };
      if (!res.ok || !data.profile_change_token) {
        toast({
          title: data.message ?? data.error ?? t.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      onToken(data.profile_change_token);
      setCode("");
      toast({ title: t.profile_verify_ok });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 space-y-3">
      <p className="text-sm text-amber-900 font-medium">
        {channel === "sms" ? t.profile_verify_sms_hint : t.profile_verify_email_hint}
      </p>

      {channel === "sms" && !user.phone_verified ? (
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
    </div>
  );
}

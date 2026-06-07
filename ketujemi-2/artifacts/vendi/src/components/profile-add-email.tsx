import { useState } from "react";
import { Loader2 } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  onAdded: () => void;
};

/** OAuth / phone-only users can attach a verified email for future profile checks. */
export function ProfileAddEmail({ onAdded }: Props) {
  const { toast } = useToast();
  const { t: copy } = useMarket();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"idle" | "sent">("idle");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/profile/verify/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim() }),
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
      toast({ title: copy.toast_emailSent });
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/profile/verify/email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        toast({
          title: data.message ?? data.error ?? copy.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      toast({ title: copy.profile_add_email_ok });
      onAdded();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4 space-y-3">
      <div>
        <h3 className="text-sm font-bold text-gray-900">{copy.profile_add_email_heading}</h3>
        <p className="text-xs text-gray-600 mt-1">{copy.profile_add_email_hint}</p>
      </div>
      {step === "idle" ? (
        <div className="space-y-2">
          <Label htmlFor="profile-add-email">Email</Label>
          <Input
            id="profile-add-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="kontakt@email.com"
            className="min-h-12 h-12 bg-white"
          />
          <Button
            type="button"
            className="w-full min-h-11"
            disabled={busy || !email.includes("@")}
            onClick={() => void sendCode()}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.profile_add_email_send}
          </Button>
        </div>
      ) : (
        <form onSubmit={confirmCode} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="profile-add-email-code">{copy.profile_verify_code}</Label>
            <Input
              id="profile-add-email-code"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="min-h-12 h-12 bg-white"
            />
          </div>
          <Button type="submit" className="w-full min-h-11" disabled={busy || code.length < 4}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : copy.profile_add_email_confirm}
          </Button>
        </form>
      )}
    </section>
  );
}

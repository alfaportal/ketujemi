import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { AuthUser } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { useProfileEditGate } from "@/hooks/use-profile-edit-gate";
import { ProfileEditGateFlow } from "@/components/profile-edit-gate-flow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

const REASONS = [
  "unsatisfied_service",
  "not_found",
  "too_annoying",
  "better_platform",
  "no_longer_need",
  "other",
] as const;

type DeletionReason = (typeof REASONS)[number];

type Step = "survey" | "feedback" | "verify" | "confirm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "account" | "shop";
  shopId?: number;
  user: AuthUser;
  refresh: () => Promise<unknown>;
  onSuccess: () => void;
};

function reasonKey(reason: DeletionReason): string {
  return `delete_reason_${reason}`;
}

export function DeletionExitSurveyModal({
  open,
  onOpenChange,
  mode,
  shopId,
  user,
  refresh,
  onSuccess,
}: Props) {
  const { t } = useMarket();
  const { toast } = useToast();
  const gate = useProfileEditGate(user, refresh);

  const [step, setStep] = useState<Step>("survey");
  const [reason, setReason] = useState<DeletionReason | "">("");
  const [customText, setCustomText] = useState("");
  const [additionalFeedback, setAdditionalFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [verifyStarted, setVerifyStarted] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("survey");
      setReason("");
      setCustomText("");
      setAdditionalFeedback("");
      setVerifyStarted(false);
      gate.cancelGate();
    }
  }, [open]);

  useEffect(() => {
    if (step === "verify" && gate.isUnlocked) {
      setStep("confirm");
    }
  }, [step, gate.isUnlocked]);

  function close() {
    onOpenChange(false);
  }

  function onSurveyNext() {
    if (!reason) {
      toast({ title: t.delete_survey_reason_required, variant: "destructive" });
      return;
    }
    if (reason === "other" && !customText.trim()) {
      toast({ title: t.delete_survey_other_required, variant: "destructive" });
      return;
    }
    setStep("feedback");
  }

  function onFeedbackNext() {
    setStep("verify");
  }

  function onStartVerify() {
    setVerifyStarted(true);
    gate.startGate();
  }

  async function onConfirmDelete() {
    if (!gate.changeToken) {
      toast({ title: t.profile_edit_session_expired, variant: "destructive" });
      setStep("verify");
      return;
    }
    setBusy(true);
    try {
      const payload = {
        reason,
        custom_text: reason === "other" ? customText.trim() : null,
        additional_feedback: additionalFeedback.trim() || null,
        profile_change_token: gate.changeToken,
      };
      const url =
        mode === "account"
          ? "/api/auth/account/delete"
          : `/api/shops/${shopId}`;
      const res = await fetchWithTimeout(url, {
        method: mode === "account" ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.message ?? data.error ?? "fail");
      }
      toast({ title: mode === "account" ? t.delete_account_success : t.delete_shop_success });
      close();
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.delete_error;
      toast({ title: msg, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const title = mode === "account" ? t.delete_account_title : t.delete_shop_modal_title;
  const stepLabel =
    step === "survey"
      ? "1/4"
      : step === "feedback"
        ? "2/4"
        : step === "verify"
          ? "3/4"
          : "4/4";

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deletion-survey-title"
      >
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500">{stepLabel}</p>
              <h2 id="deletion-survey-title" className="text-lg font-bold text-gray-900">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              aria-label={t.delete_cancel}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {step === "survey" ? (
              <>
                <p className="text-sm text-gray-700">{t.delete_survey_intro}</p>
                <fieldset className="space-y-2">
                  <legend className="sr-only">{t.delete_survey_intro}</legend>
                  {REASONS.map((r) => (
                    <label
                      key={r}
                      className={`flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                        reason === r
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deletion-reason"
                        value={r}
                        checked={reason === r}
                        onChange={() => setReason(r)}
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-900">
                        {(t as Record<string, string>)[reasonKey(r)]}
                      </span>
                    </label>
                  ))}
                </fieldset>
                {reason === "other" ? (
                  <div className="space-y-2">
                    <Label htmlFor="delete-custom-text">{t.delete_survey_other_label}</Label>
                    <Input
                      id="delete-custom-text"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={t.delete_survey_other_ph}
                      className="min-h-11"
                    />
                  </div>
                ) : null}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={close}>
                    {t.delete_cancel}
                  </Button>
                  <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700" onClick={onSurveyNext}>
                    {t.delete_next}
                  </Button>
                </div>
              </>
            ) : null}

            {step === "feedback" ? (
              <>
                <p className="text-sm text-gray-700">{t.delete_feedback_intro}</p>
                <Textarea
                  value={additionalFeedback}
                  onChange={(e) => setAdditionalFeedback(e.target.value)}
                  placeholder={t.delete_feedback_ph}
                  rows={5}
                  className="text-[16px]"
                />
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("survey")}>
                    {t.delete_back}
                  </Button>
                  <Button type="button" className="flex-1" onClick={onFeedbackNext}>
                    {t.delete_next}
                  </Button>
                </div>
              </>
            ) : null}

            {step === "verify" ? (
              <>
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                  {t.delete_warning}
                </div>
                {!gate.isUnlocked ? (
                  <>
                    <p className="text-sm text-gray-600">{t.delete_verify_hint}</p>
                    <Button
                      type="button"
                      className="w-full min-h-12"
                      onClick={onStartVerify}
                      disabled={verifyStarted && gate.phase !== "locked"}
                    >
                      {t.delete_start_verify}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={() => setStep("feedback")}>
                      {t.delete_back}
                    </Button>
                  </>
                ) : (
                  <Button type="button" className="w-full" onClick={() => setStep("confirm")}>
                    {t.delete_next}
                  </Button>
                )}
              </>
            ) : null}

            {step === "confirm" ? (
              <>
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900 font-medium">
                  {t.delete_final_confirm}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("verify")}>
                    {t.delete_back}
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={busy}
                    onClick={() => void onConfirmDelete()}
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : t.delete_confirm_btn}
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {verifyStarted && gate.phase !== "locked" && gate.phase !== "editing" ? (
        <ProfileEditGateFlow user={user} gate={gate} />
      ) : null}
    </>
  );
}

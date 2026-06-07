import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { Button } from "@/components/ui/button";

const NOTICE_SECONDS = 30;

type Props = {
  onContinue: () => void;
};

/** Mandatory 30s security notice before profile edit verification — cannot skip. */
export function ProfileEditSecurityNotice({ onContinue }: Props) {
  const { t } = useMarket();
  const [secondsLeft, setSecondsLeft] = useState(NOTICE_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [secondsLeft]);

  const canContinue = secondsLeft <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-security-notice-title"
      aria-describedby="profile-security-notice-body"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-8 w-8" aria-hidden />
          </div>
          <h2 id="profile-security-notice-title" className="text-xl font-black text-gray-900">
            {t.profile_edit_security_title}
          </h2>
        </div>

        <p
          id="profile-security-notice-body"
          className="text-sm sm:text-base text-gray-600 leading-relaxed text-center"
        >
          {t.profile_edit_security_message}
        </p>

        <div className="flex flex-col items-center gap-4 pt-2">
          {!canContinue ? (
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50"
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-2xl font-black text-blue-700 tabular-nums">{secondsLeft}</span>
            </div>
          ) : null}

          <p className="text-sm text-gray-500 text-center min-h-[1.25rem]">
            {canContinue
              ? t.profile_edit_security_ready
              : t.profile_edit_security_wait.replace("{seconds}", String(secondsLeft))}
          </p>

          {canContinue ? (
            <Button
              type="button"
              className="w-full min-h-12 h-12 text-base font-semibold"
              onClick={onContinue}
            >
              {t.profile_edit_security_continue}
            </Button>
          ) : (
            <Button type="button" className="w-full min-h-12 h-12 text-base" disabled>
              {t.profile_edit_security_continue}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

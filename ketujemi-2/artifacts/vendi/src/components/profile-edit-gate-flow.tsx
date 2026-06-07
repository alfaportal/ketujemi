import type { AuthUser } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { Button } from "@/components/ui/button";
import { ProfileChangeGate } from "@/components/profile-change-gate";
import { ProfileAddEmail } from "@/components/profile-add-email";
import { ProfileAddPhone } from "@/components/profile-add-phone";
import { ProfileEditSecurityNotice } from "@/components/profile-edit-security-notice";
import type { useProfileEditGate } from "@/hooks/use-profile-edit-gate";

type Gate = ReturnType<typeof useProfileEditGate>;

type Props = {
  user: AuthUser;
  gate: Gate;
};

export function ProfileEditGateFlow({ user, gate }: Props) {
  const { t } = useMarket();
  const { phase, proceedAfterSecurityNotice, onUnlocked, onSecondMethodAdded, cancelGate } = gate;

  if (phase === "security-notice") {
    return <ProfileEditSecurityNotice onContinue={proceedAfterSecurityNotice} />;
  }

  if (phase === "need-method" || phase === "verify") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto">
          {phase === "need-method" ? (
            <>
              <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                {t.profile_edit_need_second_method}
              </p>
              {user.missing_second_method === "email" ? (
                <ProfileAddEmail onAdded={(s) => void onSecondMethodAdded(s)} />
              ) : user.missing_second_method === "phone" ? (
                <ProfileAddPhone onAdded={(s) => void onSecondMethodAdded(s)} />
              ) : null}
              <Button type="button" variant="ghost" className="w-full" onClick={cancelGate}>
                {t.profile_edit_cancel}
              </Button>
            </>
          ) : user.profile_edit_second_factor ? (
            <ProfileChangeGate
              user={user}
              secondFactor={user.profile_edit_second_factor}
              onUnlocked={onUnlocked}
              onCancel={cancelGate}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return null;
}

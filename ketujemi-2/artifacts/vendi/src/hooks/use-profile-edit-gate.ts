import { useCallback, useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { AuthUser } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";

export type ProfileEditGatePhase = "locked" | "security-notice" | "need-method" | "verify" | "editing";

export function useProfileEditGate(user: AuthUser | null | undefined, refresh: () => Promise<unknown>) {
  const { t } = useMarket();
  const { toast } = useToast();

  const [phase, setPhase] = useState<ProfileEditGatePhase>("locked");
  const [changeToken, setChangeToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  const loadEditSession = useCallback(async () => {
    try {
      const res = await fetchWithTimeout("/api/auth/profile/edit-session", {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        active?: boolean;
        profile_change_token?: string;
        expires_at?: string;
      };
      if (data.active && data.profile_change_token && data.expires_at) {
        const expires = new Date(data.expires_at).getTime();
        if (expires > Date.now()) {
          setChangeToken(data.profile_change_token);
          setSessionExpiresAt(expires);
          setPhase("editing");
        }
      }
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    if (user && !sessionChecked) {
      void loadEditSession();
    }
  }, [user, sessionChecked, loadEditSession]);

  useEffect(() => {
    if (!sessionExpiresAt || phase !== "editing") return;
    const tick = () => {
      if (Date.now() >= sessionExpiresAt) {
        setChangeToken(null);
        setSessionExpiresAt(null);
        setPhase("locked");
        toast({ title: t.profile_edit_session_expired });
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionExpiresAt, phase, toast, t.profile_edit_session_expired]);

  function sessionMinutesLeft(): number {
    if (!sessionExpiresAt) return 0;
    return Math.max(0, Math.ceil((sessionExpiresAt - Date.now()) / 60_000));
  }

  function startGate() {
    if (!user) return;
    proceedAfterSecurityNotice();
  }

  function proceedAfterSecurityNotice() {
    if (!user) return;
    if (user.email?.trim() || user.profile_edit_second_factor === "email") {
      setPhase("verify");
      return;
    }
    setPhase("need-method");
  }

  function cancelGate() {
    setPhase("locked");
  }

  function onUnlocked(token: string, expiresInSeconds: number) {
    setChangeToken(token);
    setSessionExpiresAt(Date.now() + expiresInSeconds * 1000);
    setPhase("editing");
  }

  async function onSecondMethodAdded(session?: { token: string; expiresInSeconds: number }) {
    if (session) {
      onUnlocked(session.token, session.expiresInSeconds);
      await refresh();
      return;
    }
    await refresh();
    setPhase("verify");
  }

  return {
    phase,
    isUnlocked: phase === "editing",
    changeToken,
    sessionExpiresAt,
    sessionMinutesLeft,
    startGate,
    cancelGate,
    proceedAfterSecurityNotice,
    onUnlocked,
    onSecondMethodAdded,
  };
}

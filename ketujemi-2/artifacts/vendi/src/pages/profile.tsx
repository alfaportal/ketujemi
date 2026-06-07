import { useCallback, useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
import { MobileSafeTopSpacer } from "@/components/mobile-safe-top-spacer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { useToast } from "@/hooks/use-toast";
import { AuthToolbar } from "@/components/auth-toolbar";
import { BusinessAccountCard } from "@/components/business-account-card";
import { PartnerLogoAnalyticsCard } from "@/components/partner-logo-analytics-card";
import { PartnerProfilePanel } from "@/components/partner-profile-panel";
import { ProfileShopDashboard } from "@/components/profile-shop-dashboard";
import { ProfileChangeGate } from "@/components/profile-change-gate";
import { ProfileAddEmail } from "@/components/profile-add-email";
import { ProfileAddPhone } from "@/components/profile-add-phone";
import { ProfileEditSecurityNotice } from "@/components/profile-edit-security-notice";
import { DeletionExitSurveyModal } from "@/components/deletion-exit-survey-modal";

type EditPhase = "readonly" | "security-notice" | "need-method" | "verify" | "editing";

function syncFormFromUser(
  user: NonNullable<ReturnType<typeof useAuth>["user"]>,
  setters: {
    setDisplayName: (v: string) => void;
    setContactPhone: (v: string) => void;
    setPhotoUrl: (v: string) => void;
    setPartnerLogoUrl: (v: string) => void;
    setCity: (v: string) => void;
    setAboutMe: (v: string) => void;
  },
) {
  const phone =
    user.contact_phone
      ? user.contact_phone.startsWith("+")
        ? user.contact_phone
        : `+${user.contact_phone}`
      : user.phone_e164_digits
        ? `+${user.phone_e164_digits}`
        : "";
  setters.setDisplayName(user.display_name ?? "");
  setters.setContactPhone(phone);
  setters.setPhotoUrl(user.profile_photo_url ?? "");
  setters.setPartnerLogoUrl(user.partner_logo_url ?? "");
  setters.setCity(user.city ?? "");
  setters.setAboutMe(user.about_me ?? "");
}

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { user, loading, refresh } = useAuth();
  const { t } = useMarket();
  const { toast } = useToast();

  const [displayName, setDisplayName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [partnerLogoUrl, setPartnerLogoUrl] = useState("");
  const [city, setCity] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [changeToken, setChangeToken] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [editPhase, setEditPhase] = useState<EditPhase>("readonly");
  const [sessionChecked, setSessionChecked] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

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
          setEditPhase("editing");
        }
      }
    } finally {
      setSessionChecked(true);
    }
  }, []);

  useEffect(() => {
    if (loading || !user || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") !== "success") return;

    const sessionId = params.get("session_id")?.trim();

    const finish = () => {
      const url = new URL(window.location.href);
      url.searchParams.delete("payment");
      url.searchParams.delete("purpose");
      url.searchParams.delete("session_id");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    };

    if (sessionId?.startsWith("cs_")) {
      void import("@/lib/stripe-checkout")
        .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId))
        .then(async () => {
          await refresh();
          toast({ title: "Pagesa u konfirmua." });
        })
        .catch(() => {
          toast({
            title: "Pagesa në proces",
            description: "Rifreskoni faqen pas pak sekondash nëse pagesa nuk shfaqet.",
          });
        })
        .finally(finish);
      return;
    }

    finish();
  }, [loading, user, refresh, toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setLocation(loginUrlWithReturn("/profili"));
      return;
    }
    syncFormFromUser(user, {
      setDisplayName,
      setContactPhone,
      setPhotoUrl,
      setPartnerLogoUrl,
      setCity,
      setAboutMe,
    });
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (!loading && user && !sessionChecked) {
      void loadEditSession();
    }
  }, [loading, user, sessionChecked, loadEditSession]);

  useEffect(() => {
    if (!sessionExpiresAt || editPhase !== "editing") return;
    const tick = () => {
      if (Date.now() >= sessionExpiresAt) {
        setChangeToken(null);
        setSessionExpiresAt(null);
        setEditPhase("readonly");
        toast({ title: t.profile_edit_session_expired });
      }
    };
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [sessionExpiresAt, editPhase, toast, t.profile_edit_session_expired]);

  function formatRegisteredAt(iso?: string): string {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function sessionMinutesLeft(): number {
    if (!sessionExpiresAt) return 0;
    return Math.max(0, Math.ceil((sessionExpiresAt - Date.now()) / 60_000));
  }

  function startEdit() {
    if (!user) return;
    setEditPhase("security-notice");
  }

  function proceedAfterSecurityNotice() {
    if (!user) return;
    if (user.profile_edit_needs_second_method) {
      setEditPhase("need-method");
      return;
    }
    if (user.profile_edit_second_factor) {
      setEditPhase("verify");
    }
  }

  function cancelEdit() {
    setEditPhase("readonly");
  }

  function onUnlocked(token: string, expiresInSeconds: number) {
    setChangeToken(token);
    setSessionExpiresAt(Date.now() + expiresInSeconds * 1000);
    setEditPhase("editing");
  }

  async function onSecondMethodAdded(session?: { token: string; expiresInSeconds: number }) {
    if (session) {
      onUnlocked(session.token, session.expiresInSeconds);
      await refresh();
      return;
    }
    await refresh();
    setEditPhase("verify");
  }

  async function onChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    if (newPassword.length < 6) {
      toast({
        title: "Fjalëkalimi i ri duhet të ketë të paktën 6 karaktere.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t.profile_password_mismatch, variant: "destructive" });
      return;
    }
    setPasswordBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/password/change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          current_password: user.has_password ? currentPassword : undefined,
          new_password: newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? (data as { error?: string }).error ?? t.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await refresh();
      toast({ title: t.profile_password_saved });
    } finally {
      setPasswordBusy(false);
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !changeToken) return;
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: displayName,
          contact_phone: contactPhone,
          profile_photo_url: photoUrl,
          ...(user.account_type === "business"
            ? { partner_logo_url: partnerLogoUrl }
            : {}),
          city,
          about_me: aboutMe,
          profile_change_token: changeToken,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data as { error?: string; message?: string };
        toast({
          title: err.message ?? err.error ?? t.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      await refresh();
      toast({ title: t.profile_saved });
    } finally {
      setBusy(false);
    }
  }

  function oauthLinkedLabel(provider: string): string | null {
    if (provider === "facebook") return t.profile_oauth_facebook_linked;
    if (provider === "google") return t.profile_oauth_google_linked;
    if (provider === "tiktok") return t.profile_oauth_tiktok_linked;
    return null;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <MobileSafeTopSpacer />
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 text-gray-700 min-h-12">
            <ArrowLeft size={20} />
            <span className="font-semibold text-sm">{t.back}</span>
          </Link>
          <AuthToolbar variant="compact" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h1 className="text-xl font-black text-gray-900">{t.profile_heading}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.profile_sub}</p>
          </div>

          <BusinessAccountCard user={user} />

          <PartnerProfilePanel user={user} />

          <PartnerLogoAnalyticsCard user={user} />

          <ProfileShopDashboard />

          <section className="rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-4 space-y-2 text-sm">
            <h2 className="font-bold text-gray-900">{t.profile_info_heading}</h2>
            <div className="grid gap-2">
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">{t.profile_fullName}</span>
                <span className="font-medium text-gray-900 text-right">{user.display_name || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900 text-right break-all">{user.email || "—"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">{t.phoneNum}</span>
                <span className="font-medium text-gray-900 text-right">
                  {user.contact_phone || (user.phone_e164_digits ? `+${user.phone_e164_digits}` : "—")}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-gray-500">{t.profile_registered}</span>
                <span className="font-medium text-gray-900 text-right">{formatRegisteredAt(user.created_at)}</span>
              </div>
              {user.oauth_providers?.map((provider) => {
                const label = oauthLinkedLabel(provider);
                if (!label) return null;
                return (
                  <div key={provider} className="flex justify-between gap-3">
                    <span className="text-gray-500">{t.profile_oauth_linked}</span>
                    <span className="font-medium text-gray-900 text-right">{label}</span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/shpalljet-e-mia"
              className="inline-block text-sm font-semibold text-blue-700 hover:underline pt-1"
            >
              {t.profile_myListings_heading} →
            </Link>
          </section>

          {user.email ? (
            <form
              className="space-y-4 pt-4 border-t border-gray-100"
              onSubmit={onChangePassword}
            >
              <div>
                <h2 className="text-base font-bold text-gray-900">{t.profile_password_heading}</h2>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
              {user.has_password ? (
                <div className="space-y-2">
                  <Label htmlFor="profile-current-pass">{t.profile_currentPassword}</Label>
                  <Input
                    id="profile-current-pass"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="min-h-12 h-12"
                  />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="profile-new-pass">{t.profile_newPassword}</Label>
                <Input
                  id="profile-new-pass"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 karaktere"
                  className="min-h-12 h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-confirm-pass">{t.profile_confirmPassword}</Label>
                <Input
                  id="profile-confirm-pass"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="min-h-12 h-12"
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full min-h-12 h-12 text-base"
                disabled={passwordBusy}
              >
                {passwordBusy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t.profile_password_save
                )}
              </Button>
            </form>
          ) : null}

          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900">{t.profile_edit_heading}</h2>
              {editPhase === "editing" ? (
                <span className="text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg px-2 py-1">
                  {t.profile_edit_session_left.replace("{minutes}", String(sessionMinutesLeft()))}
                </span>
              ) : null}
            </div>

            {editPhase === "readonly" ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{t.profile_edit_locked_hint}</p>
                <Button type="button" className="w-full min-h-12 h-12" onClick={startEdit}>
                  {t.profile_edit_start}
                </Button>
              </div>
            ) : null}

            {editPhase === "need-method" ? (
              <div className="space-y-3">
                <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                  {t.profile_edit_need_second_method}
                </p>
                {user.missing_second_method === "email" ? (
                  <ProfileAddEmail onAdded={(s) => void onSecondMethodAdded(s)} />
                ) : user.missing_second_method === "phone" ? (
                  <ProfileAddPhone onAdded={(s) => void onSecondMethodAdded(s)} />
                ) : null}
                <Button type="button" variant="ghost" className="w-full" onClick={cancelEdit}>
                  {t.profile_edit_cancel}
                </Button>
              </div>
            ) : null}

            {editPhase === "verify" && user.profile_edit_second_factor ? (
              <ProfileChangeGate
                user={user}
                secondFactor={user.profile_edit_second_factor}
                onUnlocked={onUnlocked}
                onCancel={cancelEdit}
              />
            ) : null}

            {editPhase === "editing" ? (
              <form className="space-y-4" onSubmit={onSave}>
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  {t.profile_verify_ok}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-name">{t.profile_fullName}</Label>
                  <Input
                    id="profile-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t.reg_sellerGate_namePh}
                    className="min-h-12 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">{t.phoneNum}</Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="min-h-12 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-photo">{t.profile_photo}</Label>
                  <Input
                    id="profile-photo"
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://"
                    className="min-h-12 h-12"
                  />
                </div>
                {user.account_type === "business" && user.business_status === "active" ? (
                  <div className="space-y-2">
                    <Label htmlFor="profile-partner-logo">Logo partner</Label>
                    <Input
                      id="profile-partner-logo"
                      type="url"
                      value={partnerLogoUrl}
                      onChange={(e) => setPartnerLogoUrl(e.target.value)}
                      placeholder="https://"
                      className="min-h-12 h-12"
                    />
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="profile-city">{t.profile_city}</Label>
                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="min-h-12 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-about">{t.profile_about}</Label>
                  <Textarea
                    id="profile-about"
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    rows={4}
                    className="min-h-[120px] text-[16px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 min-h-12 h-12"
                    onClick={cancelEdit}
                  >
                    {t.profile_edit_cancel}
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 min-h-12 h-12"
                    disabled={busy || !changeToken}
                  >
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.profile_save}
                  </Button>
                </div>
              </form>
            ) : null}
          </div>

          {user && !user.is_platform_admin ? (
            <div className="space-y-3 pt-6 mt-6 border-t border-red-100">
              <h2 className="text-base font-bold text-red-800">{t.delete_account_btn}</h2>
              <p className="text-sm text-gray-600">{t.delete_account_desc}</p>
              <Button
                type="button"
                variant="destructive"
                className="w-full min-h-12 h-12 bg-red-600 hover:bg-red-700"
                onClick={() => setDeleteAccountOpen(true)}
              >
                {t.delete_account_btn}
              </Button>
            </div>
          ) : null}
        </div>
      </main>

      {editPhase === "security-notice" ? (
        <ProfileEditSecurityNotice onContinue={proceedAfterSecurityNotice} />
      ) : null}

      {user && !user.is_platform_admin ? (
        <DeletionExitSurveyModal
          open={deleteAccountOpen}
          onOpenChange={setDeleteAccountOpen}
          mode="account"
          user={user}
          refresh={refresh}
          onSuccess={() => {
            void refresh();
            setLocation("/");
          }}
        />
      ) : null}
    </div>
  );
}

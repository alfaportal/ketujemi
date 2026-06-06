import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2 } from "lucide-react";
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
import { ProfileMyListings } from "@/components/profile-my-listings";
import { ProfileShopDashboard } from "@/components/profile-shop-dashboard";

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
      setLocation(loginUrlWithReturn("/profile"));
      return;
    }
    setDisplayName(user.display_name ?? "");
    setContactPhone(
      user.contact_phone
        ? user.contact_phone.startsWith("+")
          ? user.contact_phone
          : `+${user.contact_phone}`
        : user.phone_e164_digits
          ? `+${user.phone_e164_digits}`
          : "",
    );
    setPhotoUrl(user.profile_photo_url ?? "");
    setPartnerLogoUrl(user.partner_logo_url ?? "");
    setCity(user.city ?? "");
    setAboutMe(user.about_me ?? "");
  }, [user, loading, setLocation]);

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
    if (!user) return;
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
      toast({ title: t.profile_saved });
    } finally {
      setBusy(false);
    }
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

          <ProfileMyListings />

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

          <form className="space-y-4" onSubmit={onSave}>
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
                  placeholder="https:// — shfaqet te «Partnerët tanë të besuar»"
                  className="min-h-12 h-12"
                />
                <p className="text-xs text-gray-500">
                  URL e logos. Pa logo, shfaqet emri i biznesit. Klikimi hap linkun nga seksioni partner
                  më sipër.
                </p>
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
            <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.profile_save}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}


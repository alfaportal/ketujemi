import { useEffect, useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link, useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PhoneInput, defaultDialForMarket } from "@/components/phone-input";
import { useAuth, safeAuthReturnUrl } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { isValidPhoneDigits } from "@/lib/phone-prefixes";
import {
  RecaptchaV2,
  useRecaptchaSiteKey,
  type RecaptchaV2Handle,
} from "@/components/recaptcha-v2";
import { SocialOAuthButtons } from "@/components/social-oauth-buttons";

/** Regjistrohu = email (hyrje menjëherë nëse ke llogari; kod vetëm për të reja). Kyçu = telefon. */
type Flow = "register" | "login";
type Step = "credentials" | "verify";
type EmailMode = "signin" | "verify" | "forgot" | "reset";

const MIN_PASSWORD = 6;

function isJunkAutofillEmail(value: string): boolean {
  const v = value.trim().toLowerCase();
  return !v.includes("@") && (v === "admin_panel" || v === "admin" || v === "username");
}

function emailFromInput(value: string): string {
  return isJunkAutofillEmail(value) ? "" : value;
}

function isValidEmailForSubmit(value: string): boolean {
  const e = value.trim().toLowerCase();
  return e.length >= 5 && e.length <= 254 && e.includes("@");
}

function validateEmailPassword(
  email: string,
  password: string,
  toast: (opts: { title: string; variant?: "destructive" }) => void,
): boolean {
  if (!isValidEmailForSubmit(email)) {
    toast({
      title: "Vendosni një adresë email të vlefshme.",
      variant: "destructive",
    });
    return false;
  }
  if (password.length < MIN_PASSWORD) {
    toast({
      title: `Fjalëkalimi duhet të ketë të paktën ${MIN_PASSWORD} karaktere.`,
      variant: "destructive",
    });
    return false;
  }
  return true;
}

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading: authLoading, refresh } = useAuth();
  const { t, market } = useMarket();
  const phoneDefaultDial = defaultDialForMarket(market.prefix);

  const returnTo =
    typeof window !== "undefined"
      ? safeAuthReturnUrl(new URLSearchParams(window.location.search).get("return"))
      : "/";

  const [flow, setFlow] = useState<Flow>("login");
  const [step, setStep] = useState<Step>("credentials");
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [passwordFailCount, setPasswordFailCount] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [smsAuthEnabled, setSmsAuthEnabled] = useState(false);
  const [googleOAuthEnabled, setGoogleOAuthEnabled] = useState(false);
  const [facebookOAuthEnabled, setFacebookOAuthEnabled] = useState(false);
  const [instagramOAuthEnabled, setInstagramOAuthEnabled] = useState(false);
  const [tiktokOAuthEnabled, setTiktokOAuthEnabled] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaV2Handle>(null);
  const { captchaRequired, siteKey: recaptchaSiteKey } = useRecaptchaSiteKey();

  useEffect(() => {
    let cancelled = false;
    void fetchWithTimeout("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: {
        smsAuthEnabled?: boolean;
        googleOAuthEnabled?: boolean;
        facebookOAuthEnabled?: boolean;
        instagramOAuthEnabled?: boolean;
        tiktokOAuthEnabled?: boolean;
      }) => {
        if (cancelled) return;
        setSmsAuthEnabled(Boolean(data.smsAuthEnabled));
        setGoogleOAuthEnabled(Boolean(data.googleOAuthEnabled));
        setFacebookOAuthEnabled(Boolean(data.facebookOAuthEnabled));
        setInstagramOAuthEnabled(Boolean(data.instagramOAuthEnabled));
        setTiktokOAuthEnabled(Boolean(data.tiktokOAuthEnabled));
      })
      .catch(() => {
        if (!cancelled) {
          setSmsAuthEnabled(false);
          setGoogleOAuthEnabled(false);
          setFacebookOAuthEnabled(false);
          setInstagramOAuthEnabled(false);
          setTiktokOAuthEnabled(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    setLocation(returnTo);
  }, [authLoading, user, returnTo, setLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flowParam = params.get("flow");
    const ch = params.get("channel");
    if (flowParam === "register" || ch === "email") {
      setFlow("register");
    } else if (flowParam === "login" || ch === "sms") {
      setFlow("login");
    }
    const ret = params.get("return") ?? "";
    if (ret.includes("step=partner") || ret.includes("/partner")) {
      setFlow("register");
    }
    if (params.get("error") === "verify") {
      toast({ title: t.toast_verifyFail, variant: "destructive" });
    }
    const oauthErr = params.get("error");
    if (oauthErr === "google_denied") {
      toast({ title: t.login_oauth_google_denied, variant: "destructive" });
    } else if (oauthErr === "google_failed") {
      toast({ title: t.login_oauth_google_failed, variant: "destructive" });
    } else if (oauthErr === "tiktok_denied") {
      toast({ title: t.login_oauth_tiktok_denied, variant: "destructive" });
    } else if (oauthErr === "tiktok_failed") {
      toast({ title: t.login_oauth_tiktok_failed, variant: "destructive" });
    } else if (
      oauthErr === "facebook_denied" ||
      oauthErr === "facebook_failed" ||
      oauthErr === "instagram_denied" ||
      oauthErr === "instagram_failed" ||
      oauthErr === "oauth_state" ||
      oauthErr === "oauth_code"
    ) {
      toast({ title: t.login_oauth_failed, variant: "destructive" });
    }
    if (params.get("verified") === "1") {
      void refresh().then(() => setLocation(returnTo));
    }
  }, []);

  useEffect(() => {
    if (!smsAuthEnabled && flow === "login") {
      setFlow("register");
    }
  }, [smsAuthEnabled, flow]);

  function resetVerify() {
    setStep("credentials");
    setCode("");
    setRecaptchaToken(null);
    recaptchaRef.current?.reset();
  }

  function switchFlow(next: Flow) {
    setFlow(next);
    resetVerify();
    setEmail("");
    setPassword("");
    setPhone("");
    setEmailMode("signin");
    setPasswordFailCount(0);
    setNewPassword("");
    setConfirmPassword("");
  }

  function backToEmailSignin() {
    setEmailMode("signin");
    setStep("credentials");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function requireCaptcha(): boolean {
    if (!captchaRequired || recaptchaToken) return true;
    toast({
      title: "Vendosni shenjën ✓ te «Nuk jam robot» para se të dërgoni SMS.",
      variant: "destructive",
    });
    return false;
  }

  async function onRegisterEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submitEmailSignin();
    } finally {
      setBusy(false);
    }
  }

  async function submitEmailSignin(): Promise<boolean> {
    if (!validateEmailPassword(email, password, toast)) return false;
    const res = await fetchWithTimeout("/api/auth/register/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = data as { message?: string; error?: string };
      if (err.error === "INVALID_CREDENTIALS") {
        const next = passwordFailCount + 1;
        setPasswordFailCount(next);
      }
      toast({
        title: err.message ?? err.error ?? t.toast_reqFail,
        variant: "destructive",
      });
      return false;
    }
    setPasswordFailCount(0);
    const payload = data as {
      needsVerification?: boolean;
      existingAccount?: boolean;
    };
    if (payload.needsVerification && !payload.existingAccount) {
      setEmailMode("verify");
      setStep("verify");
      toast({ title: t.toast_emailSent });
      return true;
    }
    await refresh();
    toast({ title: payload.existingAccount ? t.login_welcomeBack : t.toast_accountReady });
    setLocation(returnTo);
    return true;
  }

  async function onForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmailForSubmit(email)) {
      toast({
        title: "Vendosni një adresë email të vlefshme.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? t.toast_reqFail,
          variant: "destructive",
        });
        return;
      }
      setEmailMode("reset");
      toast({ title: (data as { message?: string }).message ?? t.toast_emailSent });
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD) {
      toast({
        title: `Fjalëkalimi i ri duhet të ketë të paktën ${MIN_PASSWORD} karaktere.`,
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t.profile_password_mismatch, variant: "destructive" });
      return;
    }
    if (code.trim().length < 4) {
      toast({ title: t.toast_verifyFail, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { message?: string }).message ?? t.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      await refresh();
      toast({ title: t.login_passwordResetDone });
      setLocation(returnTo);
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyEmail(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) {
      toast({ title: t.toast_verifyFail, variant: "destructive" });
      return;
    }
    if (!isValidEmailForSubmit(email)) {
      toast({
        title: "Vendosni një adresë email të vlefshme.",
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/verify/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = data as { error?: string; message?: string };
        if (err.error === "INVALID_CODE") {
          setCode("");
        }
        if (err.error === "CODE_EXPIRED") {
          backToEmailSignin();
        }
        toast({
          title: err.message ?? err.error ?? t.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      await refresh();
      setLocation(returnTo);
    } finally {
      setBusy(false);
    }
  }

  async function onResendEmailCode() {
    setBusy(true);
    try {
      await submitEmailSignin();
    } finally {
      setBusy(false);
    }
  }

  async function onLoginPhoneStart(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      toast({ title: t.toast_reqFail, variant: "destructive" });
      return;
    }
    if (!requireCaptcha()) return;
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/sms/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          phone,
          recaptcha_token: recaptchaToken ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      recaptchaRef.current?.reset();
      if (!res.ok) {
        toast({
          title:
            (data as { message?: string }).message ??
            (data as { error?: string }).error ??
            t.toast_smsFail,
          variant: "destructive",
        });
        return;
      }
      setStep("verify");
      toast({ title: t.toast_codeSent });
    } finally {
      setBusy(false);
    }
  }

  async function onVerifyPhone(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length < 4) {
      toast({ title: t.toast_verifyFail, variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast({
          title: (data as { error?: string }).error ?? t.toast_verifyFail,
          variant: "destructive",
        });
        return;
      }
      await refresh();
      setLocation(returnTo);
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const isRegister = flow === "register";
  const isVerify = step === "verify";

  const oauthLabels = {
    or: t.login_oauth_or,
    google: t.login_google_btn,
    facebook: t.login_oauth_facebook,
    tiktok: t.login_tiktok_btn,
    instagram: t.login_oauth_instagram,
  };

  const oauthButtons = (
    <SocialOAuthButtons
      returnTo={returnTo}
      googleEnabled={googleOAuthEnabled}
      facebookEnabled={facebookOAuthEnabled}
      tiktokEnabled={tiktokOAuthEnabled}
      instagramEnabled={instagramOAuthEnabled}
      labels={oauthLabels}
    />
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between max-w-lg mx-auto w-full">
        <Link href="/" className="text-xl font-black text-gray-900">
          Ketu<span className="text-blue-600">Jemi</span>
        </Link>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h1 className="text-xl font-black text-gray-900">
              {isRegister ? t.login_heading_register : t.login_heading}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister ? t.login_sub_register_email_only : t.login_sub_login_phone_only}
            </p>
          </div>

          {smsAuthEnabled ? (
            <div className="flex rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => switchFlow("register")}
                className={`flex-1 rounded-md py-3 min-h-12 text-sm font-semibold transition-colors ${
                  isRegister ? "bg-white shadow text-blue-700" : "text-gray-500"
                }`}
              >
                {t.login_mode_register}
              </button>
              <button
                type="button"
                onClick={() => switchFlow("login")}
                className={`flex-1 rounded-md py-3 min-h-12 text-sm font-semibold transition-colors ${
                  !isRegister ? "bg-white shadow text-blue-700" : "text-gray-500"
                }`}
              >
                {t.login_mode_login}
              </button>
            </div>
          ) : null}

          {isRegister ? (
            emailMode === "verify" ? (
              <form className="space-y-4" onSubmit={onVerifyEmail} noValidate>
                <p className="text-sm text-gray-600">{t.login_emailVerifyHint}</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 font-medium hover:underline min-h-11"
                  onClick={backToEmailSignin}
                >
                  {t.login_changeEmail}
                </button>
                <div className="space-y-2">
                  <Label htmlFor="email-code">{t.login_codeLbl}</Label>
                  <Input
                    id="email-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="min-h-12 h-12 text-[16px]"
                  />
                </div>
                <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.reg_confirmBtn}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-12 h-12 text-base"
                  disabled={busy}
                  onClick={() => void onResendEmailCode()}
                >
                  {t.login_resendEmailCode}
                </Button>
              </form>
            ) : emailMode === "forgot" ? (
              <form className="space-y-4" onSubmit={onForgotPassword} noValidate>
                <p className="text-sm text-gray-600">{t.login_forgotHint}</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 font-medium hover:underline min-h-11"
                  onClick={backToEmailSignin}
                >
                  {t.login_backToSignin}
                </button>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t.login_emailLbl}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(emailFromInput(e.target.value))}
                    placeholder={t.login_emailPh}
                    className="min-h-12 h-12"
                  />
                </div>
                <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_forgotBtn}
                </Button>
              </form>
            ) : emailMode === "reset" ? (
              <form className="space-y-4" onSubmit={onResetPassword} noValidate>
                <p className="text-sm text-gray-600">{t.login_resetHint}</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 font-medium hover:underline min-h-11"
                  onClick={() => setEmailMode("forgot")}
                >
                  {t.login_resendEmailCode}
                </button>
                <div className="space-y-2">
                  <Label htmlFor="reset-code">{t.login_codeLbl}</Label>
                  <Input
                    id="reset-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="min-h-12 h-12 text-[16px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-pass">{t.profile_newPassword}</Label>
                  <Input
                    id="reset-pass"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="min-h-12 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reset-pass2">{t.profile_confirmPassword}</Label>
                  <Input
                    id="reset-pass2"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="min-h-12 h-12"
                  />
                </div>
                <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_resetBtn}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={onRegisterEmail} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">{t.login_emailLbl}</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(emailFromInput(e.target.value))}
                    placeholder={t.login_emailPh}
                    className="min-h-12 h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">{t.login_passLbl}</Label>
                  <Input
                    id="reg-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t.login_passPh}
                    className="min-h-12 h-12"
                  />
                </div>
                <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_submit_login}
                </Button>
                {oauthButtons}
                {passwordFailCount >= 2 ? (
                  <button
                    type="button"
                    className="w-full text-center text-sm text-blue-600 font-semibold hover:underline min-h-11"
                    onClick={() => setEmailMode("forgot")}
                  >
                    {t.login_forgotPassword}
                  </button>
                ) : null}
                {smsAuthEnabled ? (
                  <p className="text-center text-sm text-gray-500">
                    {t.login_havePhoneAccount}{" "}
                    <button
                      type="button"
                      className="text-blue-600 font-semibold hover:underline"
                      onClick={() => switchFlow("login")}
                    >
                      {t.login_switchToPhone}
                    </button>
                  </p>
                ) : null}
              </form>
            )
          ) : smsAuthEnabled ? (
            isVerify ? (
              <form className="space-y-4" onSubmit={onVerifyPhone} noValidate>
                <p className="text-sm text-gray-600">{t.login_phoneVerifyHint}</p>
                <button
                  type="button"
                  className="text-sm text-blue-600 font-medium hover:underline min-h-11"
                  onClick={resetVerify}
                >
                  {t.login_changePhone}
                </button>
                <div className="space-y-2">
                  <Label htmlFor="sms-code">{t.login_smsLbl}</Label>
                  <Input
                    id="sms-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    className="min-h-12 h-12 text-[16px]"
                  />
                </div>
                <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.reg_confirmBtn}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={onLoginPhoneStart} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="login-phone">{t.login_phoneLbl}</Label>
                  <PhoneInput
                    id="login-phone"
                    value={phone}
                    onChange={setPhone}
                    defaultDial={phoneDefaultDial}
                    nationalPlaceholder="XX XXX XXX"
                  />
                </div>
                <RecaptchaV2
                  ref={recaptchaRef}
                  siteKey={recaptchaSiteKey}
                  onTokenChange={setRecaptchaToken}
                />
                <Button
                  type="submit"
                  className="w-full min-h-12 h-12 text-base"
                  disabled={busy || (captchaRequired && !recaptchaToken)}
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_sendSmsBtn}
                </Button>
                {oauthButtons}
                <p className="text-center text-sm text-gray-500">
                  {t.login_needEmailAccount}{" "}
                  <button
                    type="button"
                    className="text-blue-600 font-semibold hover:underline"
                    onClick={() => switchFlow("register")}
                  >
                    {t.login_switchToEmail}
                  </button>
                </p>
              </form>
            )
          ) : (
            <p className="text-sm text-gray-600">{t.login_smsDisabledHint}</p>
          )}
        </div>
      </div>
    </div>
  );
}

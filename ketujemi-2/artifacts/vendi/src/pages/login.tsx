import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { Loader2, Mail, Smartphone } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

type Flow = "register" | "login";
type Channel = "email" | "sms";
type Step = "credentials" | "verify";

const MIN_PASSWORD = 6;

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

  const [flow, setFlow] = useState<Flow>("register");
  const [channel, setChannel] = useState<Channel>("email");
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [smsAuthEnabled, setSmsAuthEnabled] = useState(false);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(true);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<RecaptchaV2Handle>(null);
  const { captchaRequired, siteKey: recaptchaSiteKey } = useRecaptchaSiteKey();

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/config/public", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: { smsAuthEnabled?: boolean; emailVerificationRequired?: boolean }) => {
        if (cancelled) return;
        setSmsAuthEnabled(Boolean(data.smsAuthEnabled));
        setEmailVerificationRequired(data.emailVerificationRequired !== false);
      })
      .catch(() => {
        if (!cancelled) {
          setSmsAuthEnabled(false);
          setEmailVerificationRequired(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!smsAuthEnabled && channel === "sms") {
      setChannel("email");
    }
  }, [smsAuthEnabled, channel]);

  useEffect(() => {
    if (authLoading || !user) return;
    setLocation(returnTo);
  }, [authLoading, user, returnTo, setLocation]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ch = params.get("channel");
    if (ch === "email" || ch === "sms") {
      setChannel(ch);
    }
    const ret = params.get("return") ?? "";
    if (ret.includes("step=partner") || ret.includes("/partner")) {
      setFlow("register");
    }
    if (params.get("error") === "verify") {
      toast({ title: t.toast_verifyFail, variant: "destructive" });
    }
    if (params.get("verified") === "1") {
      void refresh().then(() => setLocation(returnTo));
    }
  }, []);

  function resetVerify() {
    setStep("credentials");
    setCode("");
    setRecaptchaToken(null);
    recaptchaRef.current?.reset();
  }

  function requireCaptcha(): boolean {
    if (!captchaRequired || recaptchaToken) return true;
    toast({
      title: "Vendosni shenjën ✓ te «Nuk jam robot» para se të dërgoni SMS.",
      variant: "destructive",
    });
    return false;
  }

  function switchFlow(next: Flow) {
    setFlow(next);
    resetVerify();
  }

  function switchChannel(next: Channel) {
    setChannel(next);
    resetVerify();
  }

  async function onRegisterCredentials(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (channel === "email") {
        const res = await fetch("/api/auth/register/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast({
            title:
              (data as { message?: string }).message ??
              (data as { error?: string }).error ??
              t.toast_reqFail,
            variant: "destructive",
          });
          return;
        }
        if ((data as { needsVerification?: boolean }).needsVerification) {
          setStep("verify");
          toast({ title: t.toast_emailSent });
        } else {
          await refresh();
          toast({ title: t.toast_accountReady });
          setLocation(returnTo);
        }
      } else {
        if (!isValidPhoneDigits(phone)) {
          toast({ title: t.toast_reqFail, variant: "destructive" });
          return;
        }
        if (!requireCaptcha()) return;
        const res = await fetch("/api/auth/sms/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            phone,
            password,
            intent: "register",
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
      }
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (channel === "email") {
        const res = await fetch("/api/auth/verify/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, code }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast({
            title: (data as { error?: string }).error ?? t.toast_verifyFail,
            variant: "destructive",
          });
          return;
        }
      } else {
        const res = await fetch("/api/auth/sms/verify", {
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
      }
      await refresh();
      setLocation(returnTo);
    } finally {
      setBusy(false);
    }
  }

  async function onLoginEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
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
      setLocation(returnTo);
    } finally {
      setBusy(false);
    }
  }

  async function onLoginSmsStart(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPhoneDigits(phone)) {
      toast({ title: t.toast_reqFail, variant: "destructive" });
      return;
    }
    if (!requireCaptcha()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/sms/start", {
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

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const isRegister = flow === "register";
  const isVerify = step === "verify";

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
              {isRegister
                ? smsAuthEnabled
                  ? t.login_sub_register
                  : emailVerificationRequired
                    ? t.login_sub_register_email_verify
                    : t.login_sub_email_only
                : smsAuthEnabled
                  ? t.login_sub_login
                  : t.login_sub_email_only}
            </p>
          </div>

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

          <Tabs
            value={smsAuthEnabled ? channel : "email"}
            onValueChange={(v) => {
              if (smsAuthEnabled) switchChannel(v as Channel);
            }}
            className="w-full"
          >
            {smsAuthEnabled ? (
              <TabsList className="grid w-full grid-cols-2 min-h-12 h-12 p-1">
                <TabsTrigger value="email" className="gap-1.5 min-h-10">
                  <Mail size={15} /> {t.login_tab_email}
                </TabsTrigger>
                <TabsTrigger value="sms" className="gap-1.5 min-h-10">
                  <Smartphone size={15} /> {t.login_tab_sms}
                </TabsTrigger>
              </TabsList>
            ) : null}

            <TabsContent value="email" className="space-y-4 pt-4">
              {isRegister ? (
                isVerify ? (
                  <form className="space-y-4" onSubmit={onVerify}>
                    <p className="text-sm text-gray-600">{t.login_emailVerifyHint}</p>
                    <button
                      type="button"
                      className="text-sm text-blue-600 font-medium hover:underline min-h-11"
                      onClick={resetVerify}
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
                        required
                        placeholder="123456"
                        className="min-h-12 h-12 text-[16px]"
                      />
                    </div>
                    <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.reg_confirmBtn}
                    </Button>
                  </form>
                ) : (
                  <form className="space-y-4" onSubmit={onRegisterCredentials}>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">{t.login_emailLbl}</Label>
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder={t.login_emailPh}
                        className="min-h-12 h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">{t.login_passLbl}</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={MIN_PASSWORD}
                        placeholder={t.login_passPhReg}
                        className="min-h-12 h-12"
                      />
                    </div>
                    <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                      {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_continueBtn}
                    </Button>
                  </form>
                )
              ) : (
                <form className="space-y-4" onSubmit={onLoginEmail}>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">{t.login_emailLbl}</Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder={t.login_emailPh}
                      className="min-h-12 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t.login_passLbl}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder={t.login_passPh}
                      className="min-h-12 h-12"
                    />
                  </div>
                  <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_submit_login}
                  </Button>
                </form>
              )}
            </TabsContent>

            {smsAuthEnabled ? (
            <TabsContent value="sms" className="space-y-4 pt-4">
              {isVerify ? (
                <form className="space-y-4" onSubmit={onVerify}>
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
                      required
                      placeholder="123456"
                      className="min-h-12 h-12 text-[16px]"
                    />
                  </div>
                  <Button type="submit" className="w-full min-h-12 h-12 text-base" disabled={busy}>
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.reg_confirmBtn}
                  </Button>
                </form>
              ) : isRegister ? (
                <form className="space-y-4" onSubmit={onRegisterCredentials}>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone">{t.login_phoneLbl}</Label>
                    <PhoneInput
                      id="reg-phone"
                      value={phone}
                      onChange={setPhone}
                      defaultDial={phoneDefaultDial}
                      nationalPlaceholder="XX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-phone-pass">{t.login_passLbl}</Label>
                    <Input
                      id="reg-phone-pass"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={MIN_PASSWORD}
                      placeholder={t.login_passPhReg}
                      className="min-h-12 h-12"
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
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : t.login_continueBtn}
                  </Button>
                </form>
              ) : (
                <form className="space-y-4" onSubmit={onLoginSmsStart}>
                  <p className="text-sm text-gray-600">{t.login_phoneIntro}</p>
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
                </form>
              )}
            </TabsContent>
            ) : null}
          </Tabs>
        </div>
      </div>
    </div>
  );
}


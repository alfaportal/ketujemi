import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useLocation } from "wouter";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { usePartnerPage } from "@/lib/partner-page-i18n";
import { uploadImageToCloudinary, useCloudinaryConfig } from "@/lib/cloudinary-config";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Loader2, Mail, CreditCard, KeyRound, Upload } from "lucide-react";

const CARD_COLORS = [
  "from-blue-600 to-blue-500",
  "from-indigo-600 to-violet-500",
  "from-sky-600 to-cyan-500",
  "from-blue-700 to-indigo-600",
  "from-amber-500 to-orange-500",
  "from-teal-600 to-emerald-500",
  "from-blue-800 to-blue-600",
];

type PartnerPhase = "landing" | "register" | "success";

const PARTNER_FORM_STEP = "partner";

function partnerFormReturnPath(): string {
  return `/partner?step=${PARTNER_FORM_STEP}#regjistrohu`;
}

function wantsPartnerFormFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return (
    params.get("step") === PARTNER_FORM_STEP ||
    params.get("regjistrohu") === "1" ||
    window.location.hash === "#regjistrohu"
  );
}

export default function PartnerPage() {
  const c = usePartnerPage();
  const [, setLocation] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const cloudinary = useCloudinaryConfig();
  const fileRef = useRef<HTMLInputElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<PartnerPhase>("landing");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [link, setLink] = useState("");
  const [terms, setTerms] = useState(false);
  const [contractOpen, setContractOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);

  useEffect(() => {
    document.title = c.docTitle;
  }, [c.docTitle]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      const sessionId = params.get("session_id")?.trim();
      if (sessionId?.startsWith("cs_")) {
        setPaymentPending(true);
        setPhase("success");
        void import("@/lib/stripe-checkout")
          .then(({ confirmStripeCheckoutSession }) => confirmStripeCheckoutSession(sessionId))
          .then((r) => setPaymentPending(!r.paid))
          .catch(() => setPaymentPending(true))
          .finally(() => window.history.replaceState({}, "", "/partner"));
        return;
      }
      setPaymentPending(false);
      setPhase("success");
      window.history.replaceState({}, "", "/partner");
      return;
    }
    const resumeId = params.get("resume");
    if (resumeId) {
      if (!authLoading && !user) {
        setLocation(loginUrlWithReturn(`${partnerFormReturnPath()}&resume=${resumeId}`, "register"));
        return;
      }
      setPhase("register");
      void fetchWithTimeout(`/api/partners/${resumeId}/checkout`, { method: "POST" })
        .then((r) => r.json())
        .then((data: { checkout_url?: string; error?: string }) => {
          if (data.checkout_url) window.location.href = data.checkout_url;
          else setError(data.error ?? c.errPaymentOpen);
        })
        .catch(() => setError(c.errServer));
    }
  }, [authLoading, user, setLocation, c.errPaymentOpen, c.errServer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkgParam = params.get("package");
    if (pkgParam === "vip" || pkgParam === "standard") {
      setPkg(pkgParam);
    }
  }, []);

  useEffect(() => {
    if (!wantsPartnerFormFromUrl()) return;
    if (authLoading) return;
    if (!user) {
      const params = new URLSearchParams(window.location.search);
      const pkgParam = params.get("package");
      const returnPath =
        pkgParam === "vip" || pkgParam === "standard"
          ? `${partnerFormReturnPath()}&package=${pkgParam}`
          : partnerFormReturnPath();
      setLocation(loginUrlWithReturn(returnPath, "register"));
      return;
    }
    setPhase("register");
    if (user.email?.trim()) setEmail(user.email.trim());
    const phoneDigits = user.contact_phone?.trim() || user.phone_e164_digits?.trim() || "";
    if (phoneDigits) setPhone(phoneDigits.startsWith("+") ? phoneDigits : `+${phoneDigits}`);
  }, [authLoading, user, setLocation]);

  const scrollToPartnerForm = useCallback(() => {
    const run = () => {
      const el = registerRef.current ?? document.getElementById("regjistrohu");
      if (!el) return;
      const headerOffset = 72;
      const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top: Math.max(0, top), behavior: "auto" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, []);

  useLayoutEffect(() => {
    if (phase !== "register") return;
    scrollToPartnerForm();
  }, [phase, scrollToPartnerForm]);

  function goToRegister() {
    if (user) {
      setPhase("register");
      window.history.replaceState({}, "", partnerFormReturnPath());
      return;
    }
    setLocation(loginUrlWithReturn(partnerFormReturnPath(), "register"));
  }

  async function onLogoFile(file: File) {
    if (!cloudinary.ready) {
      setError(c.errLogoUnavailable);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const url = await uploadImageToCloudinary(file, cloudinary, "partner");
      setLogoUrl(url);
    } catch {
      setError(c.errUploadFailed);
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !businessName.trim() ||
      !contactName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !pkg ||
      !link.trim()
    ) {
      setError(c.errRequired);
      return;
    }
    if (!terms) {
      setError(c.errTerms);
      return;
    }

    setBusy(true);
    try {
      const res = await fetchWithTimeout("/api/partners/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          iban: "",
          package: pkg,
          logo_url: logoUrl.trim() || null,
          link: link.trim(),
          accepted_terms: true,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        checkout_url?: string;
      };
      if (!res.ok) {
        setError(data.error ?? c.errRegisterFailed);
        return;
      }
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
        return;
      }
      setPaymentPending(true);
      setPhase("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(c.errServer);
    } finally {
      setBusy(false);
    }
  }

  if (phase === "success") {
    return (
      <div className="min-h-screen bg-[#f0f4f9]">
        <SiteHeader />
        <div className="max-w-lg mx-auto px-4 pt-4 pb-12 sm:py-16">
          <StaticPageBackLink fallbackPath="/" />
          <div className="text-center mb-8">
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: BRAND_BLUE }}
            >
              <Check className="h-8 w-8" aria-hidden />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">{c.successTitle}</h1>
            <p className="text-lg text-gray-700 leading-relaxed">
              {paymentPending ? c.successPending : c.successPaid}
            </p>
          </div>

          <div className="space-y-3">
            <SuccessNotice icon={Mail} title={c.successNoticeEmail} />
            <SuccessNotice icon={CreditCard} title={c.successNoticePayment} />
            <SuccessNotice icon={KeyRound} title={c.successNoticeActivate} />
          </div>

          <Button
            className="mt-8 w-full"
            style={{ backgroundColor: BRAND_BLUE }}
            onClick={() => (window.location.href = "/")}
          >
            {c.successHome}
          </Button>
        </div>
      </div>
    );
  }

  const handlePartnerBack = () => {
    if (phase === "register") {
      setPhase("landing");
      window.history.replaceState({}, "", "/partner");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-4">
        <StaticPageBackLink onBack={handlePartnerBack} />
      </div>

      {phase === "landing" ? (
        <section
          className="relative overflow-hidden text-white px-4 py-14 sm:py-20"
          style={{
            background: `linear-gradient(135deg, ${BRAND_BLUE} 0%, #2563eb 50%, #1e40af 100%)`,
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
          <div className="relative max-w-4xl mx-auto text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-100 mb-3">
              {c.heroBadge}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-black leading-tight tracking-tight">
              {c.heroTitle}
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-blue-50 font-medium">{c.heroSubtitle}</p>
          </div>
        </section>
      ) : (
        <section
          className="border-b border-gray-200 bg-white px-4 py-5 sm:py-6"
          aria-label={c.formTitle}
        >
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-1">
              {c.heroBadge}
            </p>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900">{c.formTitle}</h1>
            {c.formSubtitle ? (
              <p className="mt-1 text-sm text-gray-500">{c.formSubtitle}</p>
            ) : null}
          </div>
        </section>
      )}

      <div
        className={cn(
          "max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-10",
          phase === "landing" ? "-mt-6" : "pt-6",
        )}
      >
        {phase === "landing" ? (
          <section className="pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">{c.benefitsTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.benefits.map((b, i) => (
                <div
                  key={b.title}
                  className={cn(
                    "rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br",
                    CARD_COLORS[i % CARD_COLORS.length],
                  )}
                >
                  <span className="text-2xl" aria-hidden>
                    {b.icon}
                  </span>
                  <p className="mt-2 font-bold text-[15px] leading-snug">
                    {b.title}
                    {b.desc ? (
                      <span className="font-normal opacity-90"> — {b.desc}</span>
                    ) : null}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button
                type="button"
                className="h-12 px-8 text-base font-bold text-white hover:opacity-95"
                style={{ backgroundColor: BRAND_BLUE }}
                onClick={goToRegister}
              >
                {c.landingCta}
              </Button>
              <p className="mt-3 text-sm text-gray-500 max-w-md mx-auto">{c.landingCtaHint}</p>
            </div>
          </section>
        ) : null}

        {phase === "register" ? (
          <div ref={registerRef} id="regjistrohu" className="space-y-10 scroll-mt-24">
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5 text-center">{c.packagesTitle}</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <PricingCard
                  title={c.standardTitle}
                  price={c.standardPrice}
                  period={c.periodPerMonth}
                  highlight={false}
                  features={c.standardFeatures}
                />
                <PricingCard
                  title={c.vipTitle}
                  price={c.vipPrice}
                  period={c.periodPerMonth}
                  highlight
                  features={c.vipFeatures}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(26,86,160,0.08)] p-5 sm:p-8">
              <form onSubmit={onSubmit} className="space-y-4">
                <Field label={c.labelBusinessName} required>
                  <Input
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    maxLength={200}
                    autoComplete="organization"
                  />
                </Field>
                <Field label={c.labelContactName} required>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label={c.labelEmail} required>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                  </Field>
                  <Field label={c.labelPhone} required>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                    />
                  </Field>
                </div>
                <Field label={c.labelPackage} required>
                  <Select value={pkg} onValueChange={setPkg}>
                    <SelectTrigger>
                      <SelectValue placeholder={c.packagePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">{c.packageStandard}</SelectItem>
                      <SelectItem value="vip">{c.packageVip}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={c.labelLogo}>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder={c.logoUrlPlaceholder}
                      className="flex-1"
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void onLogoFile(f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      disabled={uploading}
                      onClick={() => fileRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {c.uploadLogo}
                    </Button>
                  </div>
                </Field>
                <Field label={c.labelLink} required>
                  <Input
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder={c.linkPlaceholder}
                  />
                </Field>

                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="partner-terms"
                    checked={terms}
                    onCheckedChange={(v) => setTerms(v === true)}
                  />
                  <label htmlFor="partner-terms" className="text-sm text-gray-700 leading-snug cursor-pointer">
                    {c.termsLabel}{" "}
                    <button
                      type="button"
                      className="text-blue-600 font-medium underline underline-offset-2 hover:text-blue-800"
                      onClick={() => setContractOpen(true)}
                    >
                      ({c.termsOpenHint})
                    </button>
                  </label>
                </div>

                {error ? (
                  <p className="text-sm text-red-600 font-medium" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={busy}
                  className="w-full h-12 text-base font-bold text-white hover:opacity-95"
                  style={{ backgroundColor: BRAND_BLUE }}
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : c.submitButton}
                </Button>
              </form>
            </section>

            <Collapsible open={contractOpen} onOpenChange={setContractOpen}>
              <section className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <CollapsibleTrigger className="flex w-full items-center justify-between px-5 py-4 text-left font-bold text-gray-900 hover:bg-gray-50 transition-colors">
                  {c.contractTitle}
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-gray-500 transition-transform",
                      contractOpen && "rotate-180",
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre
                    className="px-5 pb-5 whitespace-pre-wrap font-sans leading-relaxed border-t border-gray-100 pt-4 max-h-[min(50vh,320px)] overflow-y-auto"
                    style={{ fontSize: "11px", color: "#999" }}
                  >
                    {c.contractText}
                  </pre>
                </CollapsibleContent>
              </section>
            </Collapsible>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SuccessNotice({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <p className="text-sm text-gray-700 leading-relaxed pt-1.5">{title}</p>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-gray-800">
        {label}
        {required ? <span className="text-red-500 ml-0.5">*</span> : null}
      </Label>
      {children}
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  highlight,
  features,
}: {
  title: string;
  price: string;
  period: string;
  highlight?: boolean;
  features: string[];
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 sm:p-6 flex flex-col",
        highlight
          ? "border-amber-300 bg-gradient-to-b from-amber-50 to-white shadow-lg ring-2 ring-amber-200/80"
          : "border-gray-200 bg-white shadow-md",
      )}
    >
      <div className="flex items-baseline justify-between gap-2 mb-4">
        <h3 className="font-black text-gray-900 text-sm sm:text-base tracking-tight">{title}</h3>
        <p className="text-right shrink-0">
          <span className="text-2xl font-black" style={{ color: BRAND_BLUE }}>
            {price}
          </span>
          <span className="text-sm text-gray-500">{period}</span>
        </p>
      </div>
      <ul className="space-y-2 text-sm text-gray-700 flex-1">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: BRAND_BLUE }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

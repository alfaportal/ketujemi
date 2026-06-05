import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { useLocation } from "wouter";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { usePartnerPage } from "@/lib/partner-page-i18n";
import { cn } from "@/lib/utils";
import { Check, Loader2, Upload } from "lucide-react";

type PartnerPhase = "landing" | "register" | "success";

const PARTNER_FORM_STEP = "partner";
const LOGO_MAX_BYTES = 5 * 1024 * 1024;

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

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary);
}

export default function PartnerPage() {
  const c = usePartnerPage();
  const [, setLocation] = useLocation();
  const fileRef = useRef<HTMLInputElement>(null);
  const registerRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<PartnerPhase>("landing");
  const [businessName, setBusinessName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pkg, setPkg] = useState("");
  const [description, setDescription] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = c.docTitle;
  }, [c.docTitle]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pkgParam = params.get("package");
    if (pkgParam === "vip" || pkgParam === "standard") {
      setPkg(pkgParam);
    }
  }, []);

  useEffect(() => {
    if (!wantsPartnerFormFromUrl()) return;
    setPhase("register");
  }, []);

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
    setPhase("register");
    window.history.replaceState({}, "", partnerFormReturnPath());
  }

  function onLogoFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError(c.errLogoInvalid);
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setError(c.errLogoTooLarge);
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
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
      !description.trim()
    ) {
      setError(c.errRequired);
      return;
    }

    setBusy(true);
    try {
      let logo_base64: string | null = null;
      let logo_filename: string | null = null;
      let logo_mime: string | null = null;
      if (logoFile) {
        logo_base64 = await fileToBase64(logoFile);
        logo_filename = logoFile.name;
        logo_mime = logoFile.type || "application/octet-stream";
      }

      const res = await fetchWithTimeout("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName.trim(),
          contact_name: contactName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          package: pkg,
          description: description.trim(),
          logo_base64,
          logo_filename,
          logo_mime,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? c.errSubmitFailed);
        return;
      }
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
            <p className="text-lg text-gray-700 leading-relaxed">{c.successMessage}</p>
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
            <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(26,86,160,0.08)] p-5 sm:p-8">
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {c.applicationIntro}
              </p>
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
          <div ref={registerRef} id="regjistrohu" className="scroll-mt-24">
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
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) onLogoFile(f);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="shrink-0"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {c.uploadLogo}
                    </Button>
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-gray-200 object-contain bg-white"
                      />
                    ) : (
                      <p className="text-sm text-gray-500 pt-2">{c.logoHint}</p>
                    )}
                  </div>
                </Field>
                <Field label={c.labelDescription} required>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={c.descriptionPlaceholder}
                    maxLength={2000}
                    rows={4}
                  />
                </Field>

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
          </div>
        ) : null}
      </div>
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

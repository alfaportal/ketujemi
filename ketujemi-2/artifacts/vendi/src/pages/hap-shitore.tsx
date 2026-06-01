import { useEffect } from "react";
import { Link } from "wouter";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { InfoBulletList } from "@/components/luxury-static-shell";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { loginUrlWithReturn } from "@/lib/auth-context";
import { PARTNER_SIGNUP_PATH } from "@/lib/static-page-paths";
import { useOpenShopPage } from "@/lib/open-shop-page-i18n";
import { cn } from "@/lib/utils";

const REGISTER_HREF = loginUrlWithReturn("/listings/new", "register");

export default function HapShitorePage() {
  const c = useOpenShopPage();

  useEffect(() => {
    document.title = c.docTitle;
  }, [c.docTitle]);

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-4">
        <StaticPageBackLink />
      </div>

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
          <p className="mt-4 text-lg sm:text-xl text-blue-50 font-medium max-w-2xl mx-auto">
            {c.heroSubtitle}
            <span className="block sm:inline sm:ml-1">{c.heroTagline}</span>
          </p>
          <Link
            href={REGISTER_HREF}
            className="inline-flex items-center justify-center mt-8 min-h-12 px-8 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "rgba(255,255,255,0.2)", border: "2px solid white" }}
          >
            {c.heroCta}
          </Link>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 -mt-6 space-y-8 pt-8">
        <SectionCard title={c.whyTitle}>
          <InfoBulletList items={c.whyBullets} />
        </SectionCard>

        <SectionCard title={c.stepsTitle}>
          <ol className="space-y-5">
            {c.steps.map((step) => (
              <li key={step.title}>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg">{step.title}</h3>
                <p className="mt-1.5 text-sm sm:text-base text-gray-600 leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </SectionCard>

        <SectionCard title={c.includesTitle}>
          <ul className="space-y-2.5 text-sm sm:text-base text-gray-700">
            {c.includesBullets.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-green-600 font-bold shrink-0" aria-hidden>
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={c.moreTitle}>
          <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-4">{c.moreIntro}</p>
          <p className="text-sm font-semibold text-gray-800 mb-2">{c.morePackagesLabel}</p>
          <ul className="space-y-1.5 text-sm sm:text-base text-gray-700 mb-4">
            {c.morePackages.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <p className="text-sm sm:text-base text-gray-700">
            {c.morePartnerBefore}
            <Link
              href={PARTNER_SIGNUP_PATH}
              className="font-semibold underline underline-offset-2"
              style={{ color: BRAND_BLUE }}
            >
              {c.morePartnerLink}
            </Link>
            {c.morePartnerAfter}
          </p>
        </SectionCard>

        <SectionCard title={c.faqTitle}>
          <dl className="space-y-5">
            {c.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-gray-900 text-sm sm:text-base">{item.q}</dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>

        <section
          className={cn(
            "rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(26,86,160,0.08)]",
            "p-6 sm:p-10 text-center",
          )}
        >
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{c.ctaTitle}</h2>
          <p className="mt-2 text-base text-gray-600">{c.ctaSubtitle}</p>
          <Link
            href={REGISTER_HREF}
            className="inline-flex items-center justify-center mt-6 min-h-12 px-8 rounded-xl text-base font-bold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND_BLUE }}
          >
            {c.ctaButton}
          </Link>
          <p className="mt-3 text-sm text-gray-500">{c.ctaFinePrint}</p>
        </section>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-5 sm:p-8">
      <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

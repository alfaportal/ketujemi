import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { BRAND_BLUE, BRAND_ORANGE } from "@/lib/brand-colors";
import { useOpenShopPage } from "@/lib/open-shop-page-i18n";
import { useAuth, loginUrlWithReturn } from "@/lib/auth-context";
import { useMarket } from "@/lib/market-context";
import { openShopApplyPath } from "@/lib/static-page-paths";
import { cn } from "@/lib/utils";

export default function HapShitorePage() {
  const c = useOpenShopPage();
  const { user } = useAuth();
  const { uiLang } = useMarket();
  const applyPath = openShopApplyPath(uiLang);

  useEffect(() => {
    document.title = c.docTitle;
  }, [c.docTitle]);

  function handleCta() {
    if (!user) {
      window.location.href = loginUrlWithReturn(applyPath);
      return;
    }
    window.location.href = applyPath;
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9]">
      <SiteHeader />
      <div className="max-w-4xl mx-auto px-4 pt-3 sm:pt-4">
        <StaticPageBackLink />
      </div>

      <section
        className="relative overflow-hidden text-white px-4 py-14 sm:py-20"
        style={{ backgroundColor: BRAND_BLUE }}
      >
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_20%,white,transparent_55%)]" />
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-[2.5rem] font-black leading-tight tracking-tight">
            {c.heroTitle}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-blue-50 font-medium max-w-2xl mx-auto leading-relaxed">
            {c.heroSubtitle}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 pt-8 space-y-10">
        <section>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 tracking-tight text-center sm:text-left">
            {c.howItWorksTitle}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {c.howItWorksSteps.map((step) => (
              <div
                key={step.title}
                className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(26,86,160,0.05)] flex flex-col items-center text-center gap-2"
              >
                <span className="text-3xl sm:text-4xl leading-none" aria-hidden>
                  {step.emoji}
                </span>
                <span className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  {step.stepLabel}
                </span>
                <p className="font-bold text-gray-900 text-sm sm:text-base">{step.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 tracking-tight text-center sm:text-left">
            {c.whyTitle}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {c.whyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-[0_4px_20px_rgba(26,86,160,0.05)] flex gap-3"
              >
                <span className="text-2xl shrink-0 leading-none" aria-hidden>
                  {card.emoji}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{card.title}</p>
                  <p className="mt-0.5 text-xs sm:text-sm text-gray-600 leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <SectionCard title={c.partnership.title}>
          <div className="space-y-4 text-sm sm:text-base text-gray-700 leading-relaxed">
            <p>{c.partnership.intro}</p>
            <div>
              <p className="font-bold text-gray-900">{c.partnership.youGetTitle}</p>
              <ul className="mt-2 list-disc pl-5 space-y-1.5">
                {c.partnership.youGetItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900">{c.partnership.weAskTitle}</p>
              <ul className="mt-2 list-disc pl-5 space-y-1.5">
                {c.partnership.weAskItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-900">{c.partnership.promoTitle}</p>
              <p className="mt-2">{c.partnership.promoText}</p>
            </div>
            <div>
              <p className="font-bold text-gray-900">{c.partnership.coffeeTitle}</p>
              <p className="mt-2">{c.partnership.coffeeText}</p>
            </div>
            <p className="font-semibold text-gray-900">{c.partnership.closing}</p>
          </div>
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

        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleCta}
            className={cn(
              "inline-flex items-center justify-center min-h-14 px-8 py-4 rounded-2xl",
              "text-base sm:text-lg font-black text-white shadow-lg",
              "hover:opacity-95 active:scale-[0.98] transition-all",
            )}
            style={{ background: `linear-gradient(90deg, ${BRAND_BLUE}, ${BRAND_ORANGE})` }}
          >
            {c.ctaButton}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-5 sm:p-8",
      )}
    >
      <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

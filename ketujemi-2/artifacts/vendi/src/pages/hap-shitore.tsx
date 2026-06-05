import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { ShopApplicationForm } from "@/components/shop-application-form";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { useOpenShopPage } from "@/lib/open-shop-page-i18n";
import { cn } from "@/lib/utils";

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
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 pt-8 space-y-10">
        <ShopApplicationForm />

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

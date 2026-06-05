import { useEffect } from "react";
import { Link } from "wouter";
import { Check, Star } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { partnerSignupHref } from "@/lib/static-page-paths";
import { useVipPackagesPage } from "@/lib/vip-packages-page-i18n";
import { cn } from "@/lib/utils";

export default function VipPackagesPage() {
  const c = useVipPackagesPage();

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
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 -mt-6 space-y-8 pt-8">
        <section>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 text-center tracking-tight">
            {c.packagesTitle}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            <PackageCard
              title={c.standardTitle}
              features={c.standardFeatures}
              ctaLabel={c.standardCta}
              href={partnerSignupHref("standard")}
            />
            <PackageCard
              title={c.vipTitle}
              features={c.vipFeatures}
              ctaLabel={c.vipCta}
              href={partnerSignupHref("vip")}
              highlight
              recommendedLabel={c.vipRecommended}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4 tracking-tight">
            {c.compareTitle}
          </h2>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[32rem] text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">
                    {c.compareColFeature}
                  </th>
                  <th className="text-center py-3 px-2 font-bold text-gray-700 whitespace-nowrap">
                    {c.compareColFree}
                  </th>
                  <th
                    className="text-center py-3 px-2 font-bold whitespace-nowrap"
                    style={{ color: BRAND_BLUE }}
                  >
                    {c.compareColStandard}
                  </th>
                  <th className="text-center py-3 pl-2 font-bold text-amber-700 whitespace-nowrap">
                    {c.compareColVip}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.compareRows.map((row) => (
                  <tr key={row.feature} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 pr-3 font-medium text-gray-800">{row.feature}</td>
                    <td className="py-3 px-2 text-center text-gray-600">{row.free}</td>
                    <td className="py-3 px-2 text-center text-gray-700">{row.standard}</td>
                    <td className="py-3 pl-2 text-center font-medium text-gray-900">{row.vip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-5 sm:p-8">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-5 tracking-tight">
            {c.faqTitle}
          </h2>
          <dl className="space-y-5">
            {c.faq.map((item) => (
              <div key={item.q}>
                <dt className="font-bold text-gray-900 text-sm sm:text-base">{item.q}</dt>
                <dd className="mt-1 text-sm sm:text-base text-gray-600 leading-relaxed">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(26,86,160,0.08)] p-6 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">{c.ctaTitle}</h2>
          <p className="mt-2 text-base text-gray-600">{c.ctaSubtitle}</p>
          <Link
            href={partnerSignupHref()}
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

function PackageCard({
  title,
  features,
  ctaLabel,
  href,
  highlight,
  recommendedLabel,
}: {
  title: string;
  features: string[];
  ctaLabel: string;
  href: string;
  highlight?: boolean;
  recommendedLabel?: string;
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
      <div className="flex items-start justify-between gap-2 mb-4">
        <h3 className="font-black text-gray-900 text-sm sm:text-base tracking-tight flex items-center gap-1.5 flex-wrap">
          {title}
          {highlight && recommendedLabel ? (
            <span className="inline-flex items-center gap-0.5 text-amber-600 text-xs font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" aria-hidden />
              ({recommendedLabel})
            </span>
          ) : null}
        </h3>
      </div>
      <ul className="space-y-2 text-sm text-gray-700 flex-1 mb-5">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check className="h-4 w-4 shrink-0 mt-0.5" style={{ color: BRAND_BLUE }} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={cn(
          "inline-flex items-center justify-center w-full min-h-11 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90",
        )}
        style={{ backgroundColor: BRAND_BLUE }}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}

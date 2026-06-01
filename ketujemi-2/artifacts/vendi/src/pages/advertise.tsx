import { useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { StaticPageBackLink } from "@/components/static-page-back-link";
import { InfoBulletList } from "@/components/luxury-static-shell";
import { InfoEmailLine } from "@/components/luxury-static-shell";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { useAdvertisePage } from "@/lib/advertise-page-i18n";

export default function AdvertisePage() {
  const c = useAdvertisePage();

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
        <SectionCard title={c.adTypesTitle}>
          <div className="space-y-6">
            {c.adTypes.map((ad) => (
              <div key={ad.title}>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2">{ad.title}</h3>
                <ul className="space-y-1.5 text-sm sm:text-base text-gray-700">
                  {ad.bullets.map((b) => (
                    <li key={b} className="flex gap-2">
                      <span className="text-blue-600 shrink-0" aria-hidden>
                        •
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-4 sm:p-6 overflow-hidden">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-4 tracking-tight">
            {c.pricesTitle}
          </h2>
          <div className="overflow-x-auto -mx-1 px-1">
            <table className="w-full min-w-[28rem] text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 pr-3 font-bold text-gray-900">{c.priceColType}</th>
                  <th className="text-center py-3 px-2 font-bold text-gray-700 whitespace-nowrap">
                    {c.priceColDuration}
                  </th>
                  <th
                    className="text-right py-3 pl-2 font-bold whitespace-nowrap"
                    style={{ color: BRAND_BLUE }}
                  >
                    {c.priceColPrice}
                  </th>
                </tr>
              </thead>
              <tbody>
                {c.priceRows.map((row) => (
                  <tr
                    key={`${row.type}-${row.duration}`}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-3 font-medium text-gray-800">{row.type}</td>
                    <td className="py-3 px-2 text-center text-gray-600 whitespace-nowrap">
                      {row.duration}
                    </td>
                    <td className="py-3 pl-2 text-right font-medium text-gray-900 whitespace-nowrap">
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{c.pricesNote}</p>
        </section>

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

        <SectionCard title={c.contactTitle}>
          <p className="text-sm sm:text-base text-gray-700 mb-4">{c.contactIntro}</p>
          <div className="space-y-2 text-sm sm:text-base">
            <InfoEmailLine label={c.contactEmailLabel} email={c.contactEmail} />
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">{c.contactSubjectLabel}</span>{" "}
              {c.contactSubjectExample}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">{c.contactPhoneLabel}</span> {c.contactPhone}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold text-gray-800">{c.contactHoursLabel}</span> {c.contactHours}
            </p>
          </div>
          <p className="mt-4 text-sm text-gray-600">{c.contactResponseNote}</p>
        </SectionCard>
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

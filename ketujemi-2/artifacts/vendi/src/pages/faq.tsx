import { StaticPageShell, Section } from "@/components/static-page-shell";
import { useStaticPages, type FaqItemCopy } from "@/lib/static-pages-i18n";

function FaqAnswer({ item }: { item: FaqItemCopy }) {
  if (item.aEmail) {
    return (
      <>
        {item.aEmail.before}
        <a href="mailto:info@ketujemi.com" className="text-blue-600 font-semibold hover:underline">
          info@ketujemi.com
        </a>
        {item.aEmail.after}
      </>
    );
  }
  return <>{item.a}</>;
}

export default function FaqPage() {
  const { faq } = useStaticPages();

  return (
    <StaticPageShell title={faq.title}>
      {faq.sections.map((section, index) => (
        <Section key={section.title} title={`${index + 1}. ${section.title}`}>
          <div className="space-y-4">
            {section.items.map((item) => (
              <div
                key={item.q}
                className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm"
              >
                <h3 className="font-bold text-gray-900 text-sm sm:text-base mb-2">{item.q}</h3>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  <FaqAnswer item={item} />
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </StaticPageShell>
  );
}

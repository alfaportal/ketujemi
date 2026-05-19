import { StaticPageShell, Section } from "@/components/static-page-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function TermsPage() {
  const { terms } = useStaticPages();

  return (
    <StaticPageShell title={terms.title} subtitle={terms.subtitle} tagline={terms.tagline}>
      {terms.sections.map((section, index) => (
        <Section key={section.title} title={`${index + 1}. ${section.title}`}>
          {section.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {section.bulletsIntro ? <p>{section.bulletsIntro}</p> : null}
          {section.bullets ? (
            <ul className="list-disc pl-5 space-y-1">
              {section.bullets.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          ) : null}
          {section.table ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">
                      {terms.sanctionsTableHeaders?.violation ?? "Shkelja"}
                    </th>
                    <th className="text-left font-semibold text-gray-900 px-4 py-3">
                      {terms.sanctionsTableHeaders?.consequence ?? "Pasoja"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.table.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-gray-800">{row.label}</td>
                      <td className="px-4 py-3 text-gray-700">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Section>
      ))}
    </StaticPageShell>
  );
}

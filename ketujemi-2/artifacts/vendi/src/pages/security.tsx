import { StaticPageShell, Section } from "@/components/static-page-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function SecurityPage() {
  const { security } = useStaticPages();

  return (
    <StaticPageShell title={security.title} tagline={security.tagline}>
      {security.sections.map((section) => (
        <Section key={section.title} title={section.title}>
          {section.bullets ? (
            <ul className="list-disc pl-5 space-y-3">
              {section.bullets.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          ) : null}
        </Section>
      ))}
    </StaticPageShell>
  );
}

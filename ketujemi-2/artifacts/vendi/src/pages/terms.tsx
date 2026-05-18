import { StaticPageShell, Section } from "@/components/static-page-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function TermsPage() {
  const { terms } = useStaticPages();

  return (
    <StaticPageShell title={terms.title}>
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
        </Section>
      ))}
    </StaticPageShell>
  );
}

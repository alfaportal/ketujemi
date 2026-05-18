import { StaticPageShell, Section } from "@/components/static-page-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function PrivacyPage() {
  const { privacy } = useStaticPages();

  return (
    <StaticPageShell title={privacy.title}>
      {privacy.sections.map((section, index) => (
        <Section key={section.title} title={`${index + 1}. ${section.title}`}>
          {section.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {section.bulletsIntro ? <p>{section.bulletsIntro}</p> : null}
          {section.bullets ? (
            <ul className={`list-disc pl-5 space-y-1${section.bulletsIntro ? " mt-2" : ""}`}>
              {section.bullets.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          ) : null}
          {index === privacy.sections.length - 1 && privacy.privacyEmailLabel ? (
            <p>
              {privacy.privacyEmailLabel}{" "}
              <a
                href="mailto:privacy@ketujemi.com"
                className="text-blue-600 font-semibold hover:underline"
              >
                privacy@ketujemi.com
              </a>
            </p>
          ) : null}
        </Section>
      ))}
    </StaticPageShell>
  );
}

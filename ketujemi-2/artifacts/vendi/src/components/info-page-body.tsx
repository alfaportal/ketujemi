import { InfoBulletList } from "@/components/luxury-static-shell";
import type { InfoPageCopy } from "@/lib/static-pages-i18n";

export function InfoPageBody({ copy }: { copy: InfoPageCopy }) {
  return (
    <div className="space-y-8">
      {copy.sections.map((section) => (
        <section key={section.title}>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">{section.title}</h2>
          {section.paragraphs?.map((p) => (
            <p key={p} className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3 last:mb-0">
              {p}
            </p>
          ))}
          {section.bulletsIntro ? (
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed mb-3">{section.bulletsIntro}</p>
          ) : null}
          {section.bullets?.length ? <InfoBulletList items={section.bullets} /> : null}
        </section>
      ))}
    </div>
  );
}

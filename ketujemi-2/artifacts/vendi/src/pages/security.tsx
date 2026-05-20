import { InfoBulletList, LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function SecurityPage() {
  const { security } = useStaticPages();
  const bullets = security.sections[0]?.bullets ?? [];

  return (
    <LuxuryStaticShell title={security.title} tagline={security.tagline}>
      <InfoBulletList items={bullets} />
    </LuxuryStaticShell>
  );
}

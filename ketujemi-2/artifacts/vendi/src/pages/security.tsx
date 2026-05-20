import { InfoPageBody } from "@/components/info-page-body";
import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

export default function SecurityPage() {
  const { security } = useStaticPages();

  return (
    <LuxuryStaticShell title={security.title} tagline={security.tagline}>
      <InfoPageBody copy={security} />
    </LuxuryStaticShell>
  );
}

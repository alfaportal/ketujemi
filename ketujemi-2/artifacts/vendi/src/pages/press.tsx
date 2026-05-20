import { InfoEmailLine, LuxuryStaticShell } from "@/components/luxury-static-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

const INFO_EMAIL = "info@ketujemi.com";

export default function PressPage() {
  const { press } = useStaticPages();

  return (
    <LuxuryStaticShell title={press.title} tagline={press.tagline}>
      <InfoEmailLine label={press.mediaEmailLabel} email={INFO_EMAIL} />
    </LuxuryStaticShell>
  );
}

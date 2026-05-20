import { InfoEmailLine, LuxuryStaticShell } from "@/components/luxury-static-shell";
import { InfoPageBody } from "@/components/info-page-body";
import { useStaticPages } from "@/lib/static-pages-i18n";

const INFO_EMAIL = "info@ketujemi.com";

export default function PressPage() {
  const { press } = useStaticPages();

  return (
    <LuxuryStaticShell title={press.title} tagline={press.tagline}>
      <InfoPageBody copy={press} />
      <div className="pt-4 border-t border-gray-100">
        <InfoEmailLine label={press.mediaEmailLabel} email={INFO_EMAIL} />
      </div>
    </LuxuryStaticShell>
  );
}

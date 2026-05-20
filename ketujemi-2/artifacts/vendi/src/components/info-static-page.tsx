import { InfoPageBody } from "@/components/info-page-body";
import { LuxuryStaticShell } from "@/components/luxury-static-shell";
import type { InfoPageCopy } from "@/lib/static-pages-i18n";

export function InfoStaticPage({ copy }: { copy: InfoPageCopy }) {
  return (
    <LuxuryStaticShell title={copy.title} tagline={copy.tagline}>
      <InfoPageBody copy={copy} />
    </LuxuryStaticShell>
  );
}

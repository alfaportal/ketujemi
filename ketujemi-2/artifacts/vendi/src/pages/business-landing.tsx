import { Link } from "wouter";
import {
  InfoBulletList,
  InfoEmailLine,
  LuxuryStaticShell,
} from "@/components/luxury-static-shell";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { PARTNER_SIGNUP_PATH } from "@/lib/static-page-paths";
import type { BusinessLandingCopy } from "@/lib/static-pages-i18n";

type BusinessLandingPageProps = {
  copy: BusinessLandingCopy;
};

export function BusinessLandingPage({ copy }: BusinessLandingPageProps) {
  return (
    <LuxuryStaticShell title={copy.title} tagline={copy.tagline}>
      {copy.bullets?.length ? <InfoBulletList items={copy.bullets} /> : null}
      {copy.contactEmail && copy.contactLabel ? (
        <InfoEmailLine label={copy.contactLabel} email={copy.contactEmail} />
      ) : null}
      {copy.ctaLabel ? (
        <Link
          href={PARTNER_SIGNUP_PATH}
          className="inline-flex items-center justify-center min-h-12 px-8 rounded-xl text-sm sm:text-base font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND_BLUE }}
        >
          {copy.ctaLabel}
        </Link>
      ) : null}
    </LuxuryStaticShell>
  );
}

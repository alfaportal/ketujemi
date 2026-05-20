import { StaticPageShell } from "@/components/static-page-shell";
import type { SimplePageCopy } from "@/lib/static-pages-i18n";

type SimpleStaticPageProps = {
  copy: SimplePageCopy;
};

export function SimpleStaticPage({ copy }: SimpleStaticPageProps) {
  return (
    <StaticPageShell title={copy.title} tagline={copy.tagline}>
      <></>
    </StaticPageShell>
  );
}

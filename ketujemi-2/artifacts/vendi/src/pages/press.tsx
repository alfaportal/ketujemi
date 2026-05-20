import { StaticPageShell } from "@/components/static-page-shell";
import { useStaticPages } from "@/lib/static-pages-i18n";

const INFO_EMAIL = "info@ketujemi.com";

export default function PressPage() {
  const { press } = useStaticPages();

  return (
    <StaticPageShell title={press.title} tagline={press.tagline}>
      <p className="text-sm sm:text-base">
        {press.mediaEmailLabel}{" "}
        <a href={`mailto:${INFO_EMAIL}`} className="text-blue-600 font-semibold hover:underline">
          {INFO_EMAIL}
        </a>
      </p>
    </StaticPageShell>
  );
}

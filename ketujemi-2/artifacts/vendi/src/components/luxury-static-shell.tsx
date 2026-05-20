import { SiteHeader } from "@/components/site-header";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { cn } from "@/lib/utils";

type LuxuryStaticShellProps = {
  title: string;
  tagline?: string;
  children?: React.ReactNode;
};

/** Faqe informative — header + përmbajtje; footer vjen nga AppLayout. */
export function LuxuryStaticShell({ title, tagline, children }: LuxuryStaticShellProps) {
  return (
    <div className="bg-[#f4f6f8]">
      <SiteHeader />
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <div
            className="h-1 w-12 rounded-full mb-4"
            style={{ backgroundColor: BRAND_BLUE }}
            aria-hidden
          />
          <h1 className="text-2xl sm:text-[1.75rem] font-black tracking-tight text-gray-900">
            {title}
          </h1>
          {tagline ? (
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">{tagline}</p>
          ) : null}
        </header>
        {children ? (
          <div className="rounded-2xl border border-gray-200/90 bg-white shadow-[0_8px_30px_rgba(26,86,160,0.06)] p-5 sm:p-8 space-y-6 text-gray-700">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function InfoBulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 text-sm sm:text-base leading-relaxed">
      {items.map((li) => (
        <li key={li} className="flex gap-3">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: BRAND_BLUE }}
            aria-hidden
          />
          <span>{li}</span>
        </li>
      ))}
    </ul>
  );
}

export function InfoEmailLine({ label, email }: { label: string; email: string }) {
  return (
    <p className="text-sm sm:text-base">
      <span className="font-semibold text-gray-800">{label}</span>{" "}
      <a
        href={`mailto:${email}`}
        className="font-semibold hover:underline"
        style={{ color: BRAND_BLUE }}
      >
        {email}
      </a>
    </p>
  );
}

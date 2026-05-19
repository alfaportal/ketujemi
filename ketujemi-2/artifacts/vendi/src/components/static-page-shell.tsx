import { SiteHeader } from "@/components/site-header";

type StaticPageShellProps = {
  title: string;
  subtitle?: string;
  tagline?: string;
  children: React.ReactNode;
};

export function StaticPageShell({ title, subtitle, tagline, children }: StaticPageShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-lg font-bold text-blue-600">{subtitle}</p>
          ) : null}
          {tagline ? (
            <p className="mt-1 text-sm sm:text-base font-medium text-gray-500">{tagline}</p>
          ) : null}
        </header>
        <div className="space-y-8 text-gray-700">{children}</div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm sm:text-base leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export { Section };

import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { useMarket } from "@/lib/market-context";

type StaticPageShellProps = {
  title: string;
  children: React.ReactNode;
};

export function StaticPageShell({ title, children }: StaticPageShellProps) {
  const { t } = useMarket();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 min-h-14 py-2 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 min-h-11 touch-manipulation"
          >
            <ArrowLeft size={18} aria-hidden />
            {t.nav_home}
          </Link>
          <Link href="/" className="flex items-center select-none shrink-0">
            <span className="text-lg font-black text-gray-900">KetuJemi</span>
            <span className="text-lg font-black text-blue-500">.com</span>
          </Link>
          <SiteHeaderToolbar />
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-8">{title}</h1>
        <div className="space-y-8 text-gray-700">{children}</div>
      </main>

      <SiteFooter />
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

import { Link } from "wouter";
import { SiteLogo } from "@/components/site-logo";
import { LanguageSelector } from "@/components/language-selector";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { useShopDirectoryCopy } from "@/lib/shop-directory-i18n";
import { cn } from "@/lib/utils";

const navLinkClass =
  "inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-11 whitespace-nowrap";

type SiteHeaderProps = {
  className?: string;
  /** Extra content below the nav rows (e.g. search on /listings). */
  children?: React.ReactNode;
  /** Optional link shown next to logo on md+ (category hub). */
  showViewAllListings?: boolean;
};

/**
 * App header: on phone — row 1 logo, row 2 language + Hyr + Posto Falas;
 * on md+ — single row with logo, language, and actions.
 */
function MainNavLinks({ className }: { className?: string }) {
  const d = useShopDirectoryCopy();
  return (
    <nav className={cn("flex items-center gap-1 sm:gap-2", className)} aria-label="Main">
      <Link href="/listings" className={navLinkClass}>
        {d.navBuySell}
      </Link>
      <Link href="/dyqanet" className={navLinkClass}>
        {d.navShops}
      </Link>
    </nav>
  );
}

export function SiteHeader({ className, children }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm",
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-2 max-md:px-2.5 sm:px-6 lg:px-8">
        {/* —— Mobile: 2 rows —— */}
        <div className="flex flex-col gap-3 py-3 md:hidden">
          <div className="flex justify-center w-full">
            <SiteLogo mobileWide />
          </div>
          <MainNavLinks className="justify-center w-full" />
          <div className="grid grid-cols-3 items-stretch gap-2.5 w-full">
            <LanguageSelector compact />
            <SiteHeaderToolbar mobileBar />
          </div>
        </div>

        {/* —— Desktop: 1 row —— */}
        <div className="hidden md:flex items-center justify-between gap-4 min-h-[4.25rem] py-1">
          <div className="flex items-center gap-2 min-w-0">
            <SiteLogo />
            <MainNavLinks />
            <LanguageSelector />
          </div>
          <SiteHeaderToolbar />
        </div>

        {children ? <div className="pb-3 md:pb-4">{children}</div> : null}
      </div>
    </header>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";
import { MobileSafeTopSpacer } from "@/components/mobile-safe-top-spacer";
import { SiteLogo } from "@/components/site-logo";
import { LanguageSelector } from "@/components/language-selector";
import { SiteHeaderToolbar } from "@/components/site-header-toolbar";
import { useMarket } from "@/lib/market-context";
import { useSiteNavCopy } from "@/lib/site-nav-i18n";
import { staticPagePaths } from "@/lib/static-page-paths";
import { prefetchRoute } from "@/lib/route-prefetch";
import { cn } from "@/lib/utils";

const navLinkClass =
  "inline-flex items-center rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-11 whitespace-nowrap";

const navLinkStackedClass =
  "inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 min-h-10 whitespace-nowrap";

type SiteHeaderProps = {
  className?: string;
  /** Extra content below the nav rows (e.g. search on /listings). */
  children?: React.ReactNode;
  /** Optional link shown next to logo on md+ (category hub). */
  showViewAllListings?: boolean;
  /** Home keeps the pre-compact mobile header; other pages use the slim hamburger bar. */
  mobileVariant?: "compact" | "classic";
};

function MainNavLinks({
  className,
  stacked,
  onNavigate,
}: {
  className?: string;
  stacked?: boolean;
  onNavigate?: () => void;
}) {
  const nav = useSiteNavCopy();
  const { uiLang } = useMarket();
  const contactPath = staticPagePaths(uiLang).contact;
  const prefetch = (href: string) => () => prefetchRoute(href);
  const linkClass = stacked ? navLinkStackedClass : navLinkClass;

  return (
    <nav
      className={cn(
        stacked ? "flex flex-col items-stretch gap-0.5" : "flex items-center gap-1 sm:gap-2",
        className,
      )}
      aria-label="Main"
    >
      <Link
        href="/listings"
        className={linkClass}
        onClick={onNavigate}
        onMouseEnter={prefetch("/listings")}
        onFocus={prefetch("/listings")}
      >
        {nav.navBuySell}
      </Link>
      <Link
        href="/dyqanet"
        className={linkClass}
        onClick={onNavigate}
        onMouseEnter={prefetch("/dyqanet")}
        onFocus={prefetch("/dyqanet")}
      >
        {nav.navShops}
      </Link>
      <Link href={contactPath} className={linkClass} onClick={onNavigate}>
        {nav.navHelp}
      </Link>
    </nav>
  );
}

export function SiteHeader({ className, children, mobileVariant = "compact" }: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const classicMobile = mobileVariant === "classic";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm",
        className,
      )}
    >
      <MobileSafeTopSpacer />
      <div className="max-w-7xl mx-auto px-2 max-md:px-2.5 sm:px-6 lg:px-8">
        {classicMobile ? (
          <div className="flex flex-col gap-3 py-3 md:hidden">
            <div className="flex justify-center w-full">
              <SiteLogo mobileWide />
            </div>
            <MainNavLinks className="justify-center w-full" />
            <div className="grid grid-cols-3 items-stretch gap-2.5 w-full">
              <LanguageSelector compact largeTouch />
              <SiteHeaderToolbar mobileBar largeTouch />
            </div>
          </div>
        ) : (
          <div className="md:hidden">
            <div className="flex items-center justify-between gap-2 py-1.5">
              <SiteLogo size="compact" />
              <button
                type="button"
                data-testid="button-mobile-menu"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 touch-manipulation"
              >
                {mobileMenuOpen ? <X size={18} aria-hidden /> : <Menu size={18} aria-hidden />}
              </button>
            </div>
            {mobileMenuOpen ? (
              <div className="border-t border-gray-100 pb-2 pt-1.5 flex flex-col gap-2">
                <MainNavLinks stacked onNavigate={closeMobileMenu} />
                <div className="flex items-center gap-2">
                  <LanguageSelector compact className="flex-1" />
                  <SiteHeaderToolbar mobileBar className="flex-[2]" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* —— Desktop: 1 row —— */}
        <div className="hidden md:flex items-center justify-between gap-4 min-h-[4.25rem] py-1">
          <div className="flex items-center gap-2 min-w-0">
            <SiteLogo />
            <MainNavLinks />
            <LanguageSelector />
          </div>
          <SiteHeaderToolbar />
        </div>

        {children ? (
          <div className={cn(classicMobile ? "pb-3 md:pb-4" : "pb-1.5 md:pb-4 max-md:pt-0")}>
            {children}
          </div>
        ) : null}
      </div>
    </header>
  );
}

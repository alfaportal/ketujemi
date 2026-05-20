import type { ReactNode } from "react";
import { Link } from "wouter";
import {
  FaCcMastercard,
  FaCcVisa,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { SiPaypal, SiStripe } from "react-icons/si";
import { useMarket } from "@/lib/market-context";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  {
    href: "https://facebook.com/ketujemi",
    label: "Facebook",
    Icon: FaFacebook,
    external: true,
  },
  {
    href: "https://instagram.com/ketujemi",
    label: "Instagram",
    Icon: FaInstagram,
    external: true,
  },
  {
    href: "https://www.tiktok.com/@ketujemi",
    label: "TikTok",
    Icon: FaTiktok,
    external: true,
  },
  {
    href: "mailto:info.info@ketujemi.com,support@ketujemi.com",
    label: "Email",
    Icon: FaEnvelope,
    external: false,
  },
] as const;

const PAYMENT_METHODS = [
  { label: "Visa", Icon: FaCcVisa, className: "text-[#1A1F71]" },
  { label: "Mastercard", Icon: FaCcMastercard, className: "text-[#EB001B]" },
  { label: "PayPal", Icon: SiPaypal, className: "text-[#003087]" },
  { label: "Stripe", Icon: SiStripe, className: "text-[#635BFF]" },
] as const;

function FooterWordmark() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 select-none touch-manipulation"
      aria-label="KetuJemi.com"
      data-testid="link-footer-logo"
    >
      <span className="text-lg sm:text-xl font-black tracking-tight text-[#1A56A0] whitespace-nowrap">
        KetuJemi
        <span className="text-[#2563eb]">.com</span>
      </span>
    </Link>
  );
}

function FooterNavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-600 hover:text-[#1A56A0] transition-colors min-h-10 inline-flex items-center px-0.5"
    >
      {children}
    </Link>
  );
}

function NavSeparator() {
  return (
    <span className="text-gray-300 select-none hidden sm:inline" aria-hidden>
      |
    </span>
  );
}

export function SiteFooter() {
  const { t } = useMarket();
  const aboutUs = t.aboutUs ?? "Rreth Nesh";
  const security = t.security ?? "Siguria";

  const navItems = [
    { href: "/terms", label: t.terms },
    { href: "/business-rules", label: t.businessRules },
    { href: "/privacy", label: t.privacy },
    { href: "/contact", label: t.contact },
    { href: "/faq", label: t.faq },
    { href: "/contact", label: aboutUs },
    { href: "/faq", label: security },
  ];

  return (
    <footer className="bg-white border-t border-gray-200 mt-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Rreshti 1 */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex justify-center lg:justify-start">
            <FooterWordmark />
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-gray-600 lg:flex-1 lg:px-6"
            aria-label="Lidhje ligjore"
          >
            {navItems.map((item, i) => (
              <span key={`${item.href}-${item.label}`} className="inline-flex items-center gap-2">
                {i > 0 ? <NavSeparator /> : null}
                <FooterNavLink href={item.href}>{item.label}</FooterNavLink>
              </span>
            ))}
          </nav>
        </div>

        {/* Rreshti 2 */}
        <div
          className={cn(
            "mt-5 pt-5 border-t border-gray-200",
            "flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between",
          )}
        >
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
            {SOCIAL_LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={label}
                className="flex flex-col items-center gap-1.5 text-gray-600 hover:text-[#1A56A0] transition-colors min-w-[4.5rem]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  {label}
                </span>
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3">
            <div
              className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-5"
              aria-label="Metodat e pagesës"
            >
              {PAYMENT_METHODS.map(({ label, Icon, className }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1"
                  title={label}
                >
                  <Icon className={cn("h-8 w-10 sm:h-9 sm:w-11", className)} aria-hidden />
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 whitespace-nowrap">© 2026 KetuJemi.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

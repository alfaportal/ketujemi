import { Link } from "wouter";
import {
  FaCcMastercard,
  FaCcVisa,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { SiPaypal } from "react-icons/si";
import { useMarket } from "@/lib/market-context";
import { BRAND_BLUE } from "@/lib/brand-colors";
import {
  FOOTER_MARKETS_STRIP_COUNTRIES,
  FOOTER_MARKETS_STRIP_LABEL,
  staticPagePaths,
} from "@/lib/static-page-paths";
import { cn } from "@/lib/utils";

const SOCIAL_LINKS = [
  { href: "https://facebook.com/ketujemi", label: "Facebook", Icon: FaFacebook, external: true },
  { href: "https://instagram.com/ketujemi", label: "Instagram", Icon: FaInstagram, external: true },
  { href: "https://www.tiktok.com/@ketujemi", label: "TikTok", Icon: FaTiktok, external: true },
  {
    href: "mailto:info@ketujemi.com,support@ketujemi.com",
    label: "Email",
    Icon: FaEnvelope,
    external: false,
  },
] as const;

const PAYMENT_METHODS = [
  { label: "Visa", Icon: FaCcVisa, className: "text-[#1A1F71]" },
  { label: "Mastercard", Icon: FaCcMastercard, className: "text-[#EB001B]" },
  { label: "PayPal", Icon: SiPaypal, className: "text-[#003087]" },
] as const;

const COLUMN_TITLE_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.14em] mb-4";

const LINK_CLASS =
  "text-sm text-gray-600 hover:text-[#1A56A0] transition-colors inline-block py-1";

type FooterLink = { href: string; label: string };

function FooterWordmark() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 select-none touch-manipulation"
      aria-label="KetuJemi.com"
    >
      <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1A56A0] whitespace-nowrap">
        KetuJemi
        <span className="text-[#2563eb]">.com</span>
      </span>
    </Link>
  );
}

function FooterLinkItem({ href, label }: FooterLink) {
  return (
    <Link href={href} className={LINK_CLASS}>
      {label}
    </Link>
  );
}

function FooterColumnBlock({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6">
      <h3 className={COLUMN_TITLE_CLASS} style={{ color: BRAND_BLUE }}>
        {title}
      </h3>
      <ul className="space-y-1">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <FooterLinkItem {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterMarketsStrip() {
  return (
    <div
      className="py-5 sm:py-6 px-4 sm:px-6 text-center"
      style={{ backgroundColor: "#0f2744" }}
    >
      <p className="text-sm sm:text-base font-bold text-white tracking-wide mb-2">
        {FOOTER_MARKETS_STRIP_LABEL}
      </p>
      <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
        {FOOTER_MARKETS_STRIP_COUNTRIES}
      </p>
    </div>
  );
}

export function SiteFooter() {
  const { t, uiLang } = useMarket();
  const paths = staticPagePaths(uiLang);

  const helpColumn = {
    title: t.footer_colHelp ?? "NDIHMË",
    links: [
      { href: paths.contact, label: t.footer_contactUs ?? "Na kontaktoni" },
      { href: paths.faq, label: t.faq ?? "FAQ" },
      { href: paths.security, label: t.footer_onlineSecurity ?? "Siguria online" },
      { href: paths.press, label: t.footer_press ?? "Shtypi" },
    ],
  };

  const infoColumn = {
    title: t.footer_colInfo ?? "INFORMATA",
    links: [
      { href: paths.about, label: t.footer_aboutKetuJemi ?? "Rreth KetuJemi" },
      { href: paths.rules, label: t.footer_rules ?? "Rregullat" },
      { href: paths.privacy, label: t.privacy ?? "Privatësia" },
      { href: paths.cookies, label: t.footer_cookies ?? "Cookies" },
      { href: paths.terms, label: t.terms ?? "Kushtet" },
    ],
  };

  const businessColumn = {
    title: t.footer_colBusiness ?? "BIZNESE",
    links: [
      { href: paths.openShop, label: t.footer_openShop ?? "Hap shitore" },
      { href: paths.vip, label: t.footer_vipPackages ?? "Paketa VIP" },
      { href: paths.advertise, label: t.footer_advertise ?? "Reklamoni" },
      { href: paths.partnership, label: t.footer_partnership ?? "Partneritet" },
    ],
  };

  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200/90 mt-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-8 border-b border-gray-200/80 flex justify-center sm:justify-start">
          <FooterWordmark />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200/80">
          <FooterColumnBlock {...helpColumn} />
          <FooterColumnBlock {...infoColumn} />
          <FooterColumnBlock {...businessColumn} />
        </div>

        <FooterMarketsStrip />

        <div
          className={cn(
            "px-4 sm:px-6 lg:px-8 py-6",
            "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            {SOCIAL_LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#1A56A0] hover:border-blue-200 transition-colors"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4" aria-label="Metodat e pagesës">
              {PAYMENT_METHODS.map(({ label, Icon, className }) => (
                <Icon
                  key={label}
                  className={cn("h-7 w-10 sm:h-8 sm:w-11", className)}
                  title={label}
                  aria-label={label}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">© 2026 KetuJemi.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

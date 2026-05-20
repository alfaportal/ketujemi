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
import { MARKETS, useMarket, type Market } from "@/lib/market-context";
import { cn } from "@/lib/utils";

/** Të gjitha tregjet e platformës — rendi i kolonës TREGJET në footer. */
const FOOTER_MARKETS: readonly Market[] = MARKETS;

const FOOTER_MARKET_LABEL: Partial<Record<Market["code"], string>> = {
  mk: "Maqedoni",
};

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
] as const;

type FooterLink = { href: string; label: string; external?: boolean };

type FooterColumn = { title: string; links: FooterLink[] };

function FooterLinkItem({ href, label, external }: FooterLink) {
  const className =
    "text-sm text-gray-600 hover:text-[#1A56A0] transition-colors inline-block py-0.5";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function FooterColumnBlock({ title, links }: FooterColumn) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.label}`}>
            <FooterLinkItem {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MarketButton({ m, active, onSelect }: { m: Market; active: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "text-sm text-left py-0.5 transition-colors w-full",
        active ? "text-[#1A56A0] font-semibold" : "text-gray-600 hover:text-[#1A56A0]",
      )}
      aria-current={active ? "true" : undefined}
    >
      <span className="mr-1.5" aria-hidden>
        {m.flag}
      </span>
      {FOOTER_MARKET_LABEL[m.code] ?? m.name}
    </button>
  );
}

export function SiteFooter() {
  const { market, setMarket, t } = useMarket();

  const columns: FooterColumn[] = [
    {
      title: t.footer_colHelp ?? "NDIHMË",
      links: [
        { href: "/contact", label: t.footer_contactUs ?? "Na kontaktoni" },
        { href: "/faq", label: t.faq },
        { href: "/faq", label: t.footer_onlineSecurity ?? "Siguria online" },
        { href: "/contact", label: t.footer_press ?? "Shtypi" },
      ],
    },
    {
      title: t.footer_colInfo ?? "INFORMATA",
      links: [
        { href: "/contact", label: t.footer_aboutKetuJemi ?? "Rreth KetuJemi" },
        { href: "/business-rules", label: t.footer_rules ?? "Rregullat" },
        { href: "/privacy", label: t.privacy },
        { href: "/privacy", label: t.footer_cookies ?? "Cookies" },
        { href: "/terms", label: t.terms },
      ],
    },
    {
      title: t.footer_colBusiness ?? "BIZNESE",
      links: [
        { href: "/profile", label: t.footer_openShop ?? "Hap shitore" },
        { href: "/profile", label: t.footer_vipPackages ?? "Paketa VIP" },
        { href: "/contact", label: t.footer_advertise ?? "Reklamoni" },
        { href: "/contact", label: t.footer_partnership ?? "Partneritet" },
      ],
    },
    {
      title: t.footer_colMarkets ?? "TREGJET",
      links: [],
    },
  ];

  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200 mt-10 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ZONA 1 — 4 kolona */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {columns.slice(0, 3).map((col) => (
            <FooterColumnBlock key={col.title} {...col} />
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-3">
              {columns[3]!.title}
            </h3>
            <ul className="space-y-2">
              {FOOTER_MARKETS.map((m) => (
                <li key={m.code}>
                  <MarketButton
                    m={m}
                    active={market.code === m.code}
                    onSelect={() => setMarket(m)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ZONA 2 — rreshti i fundit */}
        <div
          className={cn(
            "mt-8 pt-6 border-t border-gray-200",
            "flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between",
          )}
        >
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
            {SOCIAL_LINKS.map(({ href, label, Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:text-[#1A56A0] hover:border-blue-200 transition-colors"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-2 sm:gap-3">
            <div
              className="flex flex-wrap items-center justify-center sm:justify-end gap-4"
              aria-label="Metodat e pagesës"
            >
              {PAYMENT_METHODS.map(({ label, Icon, className }) => (
                <Icon
                  key={label}
                  className={cn("h-7 w-10 sm:h-8 sm:w-11", className)}
                  title={label}
                  aria-label={label}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 whitespace-nowrap">© 2026 KetuJemi.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

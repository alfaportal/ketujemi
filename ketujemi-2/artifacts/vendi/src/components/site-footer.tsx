import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useSecretAdminTap } from "@/lib/secret-admin-tap";
import {
  FaCcMastercard,
  FaCcVisa,
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaTiktok,
} from "react-icons/fa";
import { SiGoogle, SiPaypal, SiStripe } from "react-icons/si";
import { MARKETS, useMarket, type Market } from "@/lib/market-context";
import { BRAND_BLUE } from "@/lib/brand-colors";
import {
  FOOTER_BUSINESS_OPEN_SHOP_PATH,
  FOOTER_BUSINESS_PARTNERSHIP_PATH,
  FOOTER_BUSINESS_VIP_PATH,
  footerMarketsStripCopy,
  staticPagePaths,
} from "@/lib/static-page-paths";
import { cn } from "@/lib/utils";

const SOCIAL_ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 hover:border-blue-200 transition-colors";

type SocialLink = {
  href: string;
  label: string;
  Icon: typeof FaInstagram;
  external: boolean;
  iconClass: string;
};

const FACEBOOK_LINK: SocialLink = {
  href: "",
  label: "Facebook",
  Icon: FaFacebook,
  external: true,
  iconClass: "hover:text-[#1877F2]",
};

const BASE_SOCIAL_LINKS: SocialLink[] = [
  {
    href: "https://www.instagram.com/jemi.ketu",
    label: "Instagram",
    Icon: FaInstagram,
    external: true,
    iconClass: "hover:text-[#E4405F]",
  },
  {
    href: "https://www.tiktok.com/@ketujemi7",
    label: "TikTok",
    Icon: FaTiktok,
    external: true,
    iconClass: "hover:text-gray-900",
  },
  {
    href: "https://www.google.com/search?q=KetuJemi.com",
    label: "Google",
    Icon: SiGoogle,
    external: true,
    iconClass: "hover:text-[#4285F4]",
  },
  {
    href: "mailto:info@ketujemi.com,support@ketujemi.com",
    label: "Email",
    Icon: FaEnvelope,
    external: false,
    iconClass: "hover:text-[#1A56A0]",
  },
];

const PAYMENT_METHODS = [
  { label: "Stripe", Icon: SiStripe, className: "text-[#635BFF]" },
  { label: "Visa", Icon: FaCcVisa, className: "text-[#1A1F71]" },
  { label: "Mastercard", Icon: FaCcMastercard, className: "text-[#EB001B]" },
  { label: "PayPal", Icon: SiPaypal, className: "text-[#003087]" },
] as const;

const COLUMN_TITLE_CLASS =
  "text-[11px] font-bold uppercase tracking-[0.14em] mb-3";

const LINK_CLASS =
  "text-sm text-gray-600 hover:text-[#1A56A0] transition-colors inline-block py-1.5 min-h-[44px] leading-snug";

type FooterLink = { href: string; label: string };

function FooterWordmark() {
  const [, setLocation] = useLocation();
  const { registerTap } = useSecretAdminTap();

  return (
    <button
      type="button"
      onClick={() => {
        if (registerTap()) return;
        setLocation("/");
      }}
      className="inline-flex shrink-0 select-none touch-manipulation bg-transparent border-0 p-0 cursor-pointer"
      aria-label="KetuJemi.com"
    >
      <span className="text-xl sm:text-2xl font-black tracking-tight text-[#1A56A0] whitespace-nowrap">
        KetuJemi
        <span className="text-[#2563eb]">.com</span>
      </span>
    </button>
  );
}

/** Lidhje footer — navigim i plotë në faqe (kontakt, FAQ, etj.), jo vetëm scroll. */
function FooterLinkItem({ href, label }: FooterLink) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");

  if (isInternal) {
    return (
      <a href={href} className={LINK_CLASS}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={LINK_CLASS}>
      {label}
    </Link>
  );
}

function FooterColumnBlock({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div className="py-4 px-4 sm:px-5">
      <h3 className={COLUMN_TITLE_CLASS} style={{ color: BRAND_BLUE }}>
        {title}
      </h3>
      <ul className="space-y-0.5">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <FooterLinkItem {...link} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterMarketsStrip({
  market,
  setMarket,
  uiLang,
}: {
  market: Market;
  setMarket: (m: Market) => void;
  uiLang: Parameters<typeof footerMarketsStripCopy>[0];
}) {
  const copy = footerMarketsStripCopy(uiLang);

  return (
    <div
      className="border-t border-[#0f2744]/20 py-2.5 sm:py-3 px-3 sm:px-6"
      style={{ backgroundColor: "#0f2744" }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs sm:text-[13px]">
        <span className="font-bold text-white/95 uppercase tracking-[0.12em] mr-1 sm:mr-2 shrink-0">
          {copy.title}
        </span>
        <span className="text-white/35 hidden sm:inline" aria-hidden>
          ·
        </span>
        {copy.primary.map((item, index) => (
          <span key={item.iso} className="inline-flex items-center gap-1.5 shrink-0">
            {index > 0 ? (
              <span className="text-white/35 mx-0.5 sm:mx-1" aria-hidden>
                ·
              </span>
            ) : null}
            {item.marketCode ? (
              <button
                type="button"
                onClick={() => {
                  const m = MARKETS.find((x) => x.code === item.marketCode);
                  if (m) setMarket(m);
                }}
                className={cn(
                  "inline-flex items-baseline gap-1 font-medium transition-colors",
                  market.code === item.marketCode
                    ? "text-white underline decoration-white/50 underline-offset-2"
                    : "text-blue-100/95 hover:text-white",
                )}
              >
                <span>{item.name}</span>
                <span className="text-[10px] sm:text-[11px] text-white/55 font-semibold">
                  ({item.iso})
                </span>
              </button>
            ) : (
              <span className="text-blue-100/95 font-medium">
                {item.name}{" "}
                <span className="text-white/55 text-[10px] sm:text-[11px]">({item.iso})</span>
              </span>
            )}
          </span>
        ))}
        <span className="text-white/35 mx-0.5 sm:mx-1" aria-hidden>
          ·
        </span>
        <span
          className="text-white/75 font-medium shrink-0"
          title="Gjermani, Zvicër, Austri, Francë, Itali, Angli, SHBA, Mal i Zi"
        >
          {copy.diasporaLabel}
        </span>
      </div>
    </div>
  );
}

export function SiteFooter() {
  const { market, setMarket, t, uiLang } = useMarket();
  const paths = staticPagePaths(uiLang);
  const [socialLinks, setSocialLinks] = useState(BASE_SOCIAL_LINKS);

  useEffect(() => {
    void fetch("/api/config/public", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { facebookPageUrl?: string | null; instagramProfileUrl?: string } | null) => {
        if (!data) return;
        setSocialLinks(() => {
          const links = BASE_SOCIAL_LINKS.map((link) =>
            link.label === "Instagram" && data.instagramProfileUrl
              ? { ...link, href: data.instagramProfileUrl }
              : link,
          );
          if (data.facebookPageUrl) {
            return [{ ...FACEBOOK_LINK, href: data.facebookPageUrl }, ...links];
          }
          return links;
        });
      })
      .catch(() => undefined);
  }, []);

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
      { href: FOOTER_BUSINESS_OPEN_SHOP_PATH, label: t.footer_openShop ?? "Hap shitore" },
      { href: FOOTER_BUSINESS_VIP_PATH, label: t.footer_vipPackages ?? "Paketa VIP" },
      { href: paths.advertise, label: t.footer_advertise ?? "Reklamoni" },
      { href: FOOTER_BUSINESS_PARTNERSHIP_PATH, label: t.footer_partnership ?? "Partneritet" },
    ],
  };

  return (
    <footer className="bg-[#f8f9fa] border-t border-gray-200/90 mt-auto font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-5 border-b border-gray-200/80 flex justify-center sm:justify-start">
          <FooterWordmark />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200/80">
          <FooterColumnBlock {...helpColumn} />
          <FooterColumnBlock {...infoColumn} />
          <FooterColumnBlock {...businessColumn} />
        </div>

        <FooterMarketsStrip market={market} setMarket={setMarket} uiLang={uiLang} />

        <div
          className={cn(
            "relative px-4 sm:px-6 lg:px-8 py-3.5 border-t border-gray-200/60",
            "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end",
          )}
        >
          <div
            className="flex flex-wrap items-center justify-center gap-2 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
            aria-label="Rrjetet sociale"
          >
            {socialLinks.map(({ href, label, Icon, external, iconClass }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                aria-label={label}
                className={cn(SOCIAL_ICON_BTN, iconClass)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
              </a>
            ))}
          </div>

          <div className="flex flex-col items-center sm:items-end gap-1 sm:gap-1.5">
            <div
              className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 sm:gap-3"
              aria-label="Metodat e pagesës"
            >
              {PAYMENT_METHODS.map(({ label, Icon, className }) => (
                <Icon
                  key={label}
                  className={cn("h-5 w-auto sm:h-6 shrink-0", className)}
                  title={label}
                  aria-label={label}
                />
              ))}
            </div>
            <p className="text-[11px] sm:text-xs text-gray-500 text-center sm:text-right max-w-md sm:max-w-none leading-relaxed">
              <span>© 2026 KetuJemi.com.</span>{" "}
              <span className="text-gray-600">
                {t.footer_operatedBy ?? "Operohet nga REVOLUTION INVEST SH.P.K."}
              </span>
              {typeof __APP_BUILD_ID__ !== "undefined" && __APP_BUILD_ID__ ? (
                <span className="block sm:inline text-gray-400" title="Versioni i deploy-it">
                  <span className="hidden sm:inline"> · </span>
                  {__APP_BUILD_ID__}
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "wouter";
import { FaEnvelope, FaFacebook, FaGoogle, FaInstagram } from "react-icons/fa";
import { SiteLogo } from "@/components/site-logo";
import { useMarket } from "@/lib/market-context";

const FOOTER_LINKS = [
  { href: "https://facebook.com/ketujemi", label: "Facebook", Icon: FaFacebook, external: true },
  { href: "https://instagram.com/ketujemi", label: "Instagram", Icon: FaInstagram, external: true },
  { href: "https://www.google.com/search?q=KetuJemi.com", label: "Google", Icon: FaGoogle, external: true },
  {
    href: "mailto:info.info@ketujemi.com,support@ketujemi.com",
    label: "Email",
    Icon: FaEnvelope,
    external: false,
  },
] as const;

export function SiteFooter() {
  const { t } = useMarket();

  return (
    <footer className="bg-white border-t border-gray-100 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <SiteLogo imageClassName="h-11 sm:h-12" />
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center">
              {t.terms}
            </Link>
            <Link
              href="/business-rules"
              className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center"
            >
              {t.businessRules}
            </Link>
            <Link href="/privacy" className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center">
              {t.privacy}
            </Link>
            <Link href="/contact" className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center">
              {t.contact}
            </Link>
            <Link href="/faq" className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center">
              {t.faq}
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>© 2026 KetuJemi.com</span>
          </div>
        </div>
        <div className="mt-6 flex justify-center items-center gap-8">
          {FOOTER_LINKS.map(({ href, label, Icon, external }) => (
            <a
              key={label}
              href={href}
              {...(external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              aria-label={label}
              className="flex flex-col items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

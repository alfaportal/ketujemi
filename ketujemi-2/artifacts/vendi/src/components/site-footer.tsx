import { Link } from "wouter";
import { FaFacebook, FaGoogle, FaInstagram } from "react-icons/fa";
import { useMarket } from "@/lib/market-context";

const SOCIAL_LINKS = [
  { href: "https://facebook.com/ketujemi", label: "Facebook", Icon: FaFacebook },
  { href: "https://instagram.com/ketujemi", label: "Instagram", Icon: FaInstagram },
  { href: "https://www.google.com/search?q=KetuJemi.com", label: "Google", Icon: FaGoogle },
] as const;

export function SiteFooter() {
  const { t } = useMarket();

  return (
    <footer className="bg-white border-t border-gray-100 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <span className="text-xl font-black text-gray-900">KetuJemi</span>
            <span className="text-xl font-black text-blue-500">.com</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm text-gray-500">
            <Link href="/terms" className="hover:text-gray-800 transition-colors min-h-11 inline-flex items-center">
              {t.terms}
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
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
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

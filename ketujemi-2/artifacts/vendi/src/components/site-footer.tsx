import { Link } from "wouter";
import { useMarket } from "@/lib/market-context";

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
            <span>© 2025 KetuJemi.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "wouter";
import * as Icons from "lucide-react";
import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang } from "@/lib/ui-languages";
import { translateCategory } from "@/lib/category-translations";

// ─── Cover photos keyed by category name prefix ───────────────────────────────
const CAT_PHOTOS: Record<string, string> = {
  "Vetura":               "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&q=80",
  "Motorr":               "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&q=80",
  "Kamion":               "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&q=80",
  "Auto Pjesë":           "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&q=80",
  "Banesa":               "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&q=80",
  "Lokale":               "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "Telefona":             "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80",
  "Kompjuter":            "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&q=80",
  "TV":                   "https://images.unsplash.com/photo-1593344484962-796055d4a3a4?w=300&q=80",
  "Mobilje":              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&q=80",
  "Rroba":                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&q=80",
  "Fëmijë":               "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300&q=80",
  "Sport":                "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80",
  "Punë":                 "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80",
  "Bujqësi":              "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=300&q=80",
  "Arsim":                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&q=80",
  "Muzikë":               "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80",
  "Kafshë":               "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=300&q=80",
};

interface Category {
  id: number;
  name: string;
  slug?: string | null;
  icon: string;
  listing_count: number;
  parent_id?: number | null;
}

interface Props {
  category: Category;
  onClick?: () => void;
}

export default function CategoryCard({ category, onClick }: Props) {
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Tag;

  const localName = translateCategory(category.name, locale);
  const photoKey = Object.keys(CAT_PHOTOS).find((k) => category.name.startsWith(k));
  const photo = photoKey ? CAT_PHOTOS[photoKey] : null;

  const content = (
    <div className="group flex flex-col overflow-hidden bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
      {photo ? (
        <div className="relative h-20 overflow-hidden">
          <img
            src={photo}
            alt={localName}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-lg bg-blue-600/90 flex items-center justify-center">
            <IconComponent size={13} className="text-white" />
          </div>
        </div>
      ) : (
        <div className="h-16 bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
          <IconComponent size={24} className="text-blue-500" />
        </div>
      )}
      <div className="p-2 text-center">
        <div className="text-xs font-semibold text-gray-700 leading-tight">{localName}</div>
        {category.listing_count > 0 && (
          <div className="text-xs text-gray-400 mt-0.5">{category.listing_count}</div>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        data-testid={`card-category-${category.id}`}
        onClick={onClick}
        className="text-left h-full w-full"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={`/categories/${category.id}`}
      data-testid={`card-category-${category.id}`}
      className="block h-full"
    >
      {content}
    </Link>
  );
}

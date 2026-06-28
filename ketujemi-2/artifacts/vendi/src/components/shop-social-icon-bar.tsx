import { Facebook, Instagram, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

export type ShopSocialFields = {
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  youtube?: string | null;
};

export type ShopSocialIconItem = {
  key: "facebook" | "instagram" | "tiktok" | "youtube";
  label: string;
  href: string;
  className: string;
  icon: React.ComponentType<{ className?: string }>;
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

/** Facebook, Instagram, TikTok, YouTube for storefront hero. */
export function buildShopStorefrontSocialIcons(fields: ShopSocialFields): ShopSocialIconItem[] {
  const icons: ShopSocialIconItem[] = [];

  const facebook = fields.facebook?.trim();
  if (facebook) {
    icons.push({
      key: "facebook",
      label: "Facebook",
      href: facebook,
      icon: Facebook,
      className: "bg-[#1877F2] hover:bg-[#166fe5]",
    });
  }

  const instagram = fields.instagram?.trim();
  if (instagram) {
    icons.push({
      key: "instagram",
      label: "Instagram",
      href: instagram,
      icon: Instagram,
      className: "bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90",
    });
  }

  const tiktokRaw = fields.tiktok?.trim();
  if (tiktokRaw) {
    icons.push({
      key: "tiktok",
      label: "TikTok",
      href: /^https:\/\//i.test(tiktokRaw) ? tiktokRaw : `https://${tiktokRaw}`,
      icon: TikTokIcon,
      className: "bg-black hover:bg-gray-900",
    });
  }

  const youtube = fields.youtube?.trim();
  if (youtube) {
    icons.push({
      key: "youtube",
      label: "YouTube",
      href: /^https?:\/\//i.test(youtube) ? youtube : `https://${youtube}`,
      icon: Youtube,
      className: "bg-[#FF0000] hover:bg-[#e60000]",
    });
  }

  return icons;
}

type Props = {
  fields: ShopSocialFields;
  className?: string;
  variant?: "hero" | "inline";
};

export function ShopSocialIconBar({ fields, className, variant = "hero" }: Props) {
  const icons = buildShopStorefrontSocialIcons(fields);
  if (icons.length === 0) return null;

  const size = variant === "hero" ? "h-11 w-11" : "h-9 w-9";
  const iconSize = variant === "hero" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {icons.map((item) => {
        const Icon = item.icon;
        return (
          <a
            key={item.key}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            title={item.label}
            aria-label={item.label}
            className={cn(
              "inline-flex items-center justify-center rounded-full text-white shadow-md transition-transform hover:scale-105",
              size,
              item.className,
            )}
          >
            <Icon className={iconSize} />
          </a>
        );
      })}
    </div>
  );
}

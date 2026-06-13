import {
  ExternalLink,
  Facebook,
  Globe,
  Instagram,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { shopWhatsappHref } from "@/lib/shop-social-url-input";
import type { ShopSocialProfileData } from "@/components/shop-social-profiles";

export type ShopSocialFields = {
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
};

export type ShopSocialLinkItem = {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

export function buildShopSocialLinks(
  fields: ShopSocialFields,
  enriched?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>,
): ShopSocialLinkItem[] {
  const links: ShopSocialLinkItem[] = [];
  const facebook = fields.facebook?.trim();
  const instagram = enriched?.instagram?.profile_url?.trim() || fields.instagram?.trim();
  const tiktokRaw = fields.tiktok?.trim();
  const website = fields.website?.trim();
  const whatsappHref = shopWhatsappHref(fields.whatsapp);

  if (facebook) {
    links.push({
      key: "facebook",
      label: "Facebook",
      href: facebook,
      icon: Facebook,
      className: "bg-[#1877F2] hover:bg-[#166fe5] text-white",
    });
  }
  if (instagram) {
    links.push({
      key: "instagram",
      label: "Instagram",
      href: instagram,
      icon: Instagram,
      className: "bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white",
    });
  }
  if (whatsappHref) {
    links.push({
      key: "whatsapp",
      label: "WhatsApp",
      href: whatsappHref,
      icon: MessageCircle,
      className: "bg-[#25D366] hover:bg-[#20bd5a] text-white",
    });
  }
  if (tiktokRaw) {
    const tiktokHref = /^https:\/\//i.test(tiktokRaw) ? tiktokRaw : `https://${tiktokRaw}`;
    links.push({
      key: "tiktok",
      label: "TikTok",
      href: tiktokHref,
      icon: TikTokIcon,
      className: "bg-black hover:bg-gray-900 text-white",
    });
  }
  if (website) {
    links.push({
      key: "website",
      label: "Website",
      href: website,
      icon: Globe,
      className: "bg-[#1A56A0] hover:bg-[#154a8c] text-white",
    });
  }

  return links;
}

type Props = {
  fields: ShopSocialFields;
  enriched?: Partial<Record<"instagram" | "tiktok", ShopSocialProfileData>>;
  title?: string;
  compact?: boolean;
  className?: string;
  onLinkClick?: (e: React.MouseEvent) => void;
};

export function ShopSocialLinks({
  fields,
  enriched,
  title,
  compact,
  className,
  onLinkClick,
}: Props) {
  const links = buildShopSocialLinks(fields, enriched);
  if (links.length === 0) return null;

  return (
    <section
      className={cn(
        compact ? "" : "rounded-2xl bg-white border border-gray-100 p-6 shadow-sm",
        className,
      )}
    >
      {title ? (
        <h2
          className={cn(
            "font-bold text-gray-900",
            compact ? "text-sm mb-2" : "text-sm sm:text-lg mb-3",
          )}
        >
          {title}
        </h2>
      ) : null}
      <div className={cn("flex flex-wrap", compact ? "gap-1.5" : "gap-2 sm:gap-3")}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onLinkClick}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl font-bold text-white transition-colors",
                compact ? "min-h-9 px-3 text-xs" : "min-h-11 px-4 text-sm",
                link.className,
              )}
            >
              <Icon className={cn("shrink-0", compact ? "h-3.5 w-3.5" : "h-4 w-4")} />
              {link.label}
              <ExternalLink
                className={cn("shrink-0 opacity-80", compact ? "h-3 w-3" : "h-3.5 w-3.5")}
                aria-hidden
              />
            </a>
          );
        })}
      </div>
    </section>
  );
}

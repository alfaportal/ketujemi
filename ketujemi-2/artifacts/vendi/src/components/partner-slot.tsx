import { useEffect, useState } from "react";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import { Link } from "wouter";
import { Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";

export type PartnerSlotData = {
  id: number;
  business_name: string;
  partner_logo_url: string | null;
  profile_photo_url: string | null;
  profile_path: string;
  click_url: string | null;
  tier: "vip" | "standard";
  banner_urls: string[];
};

function partnerImageUrl(p: PartnerSlotData): string | null {
  const url = p.partner_logo_url?.trim() || p.profile_photo_url?.trim();
  return url || null;
}

function partnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "B";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}

function recordPartnerClick(partnerId: number) {
  void fetchWithTimeout("/api/partners/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ partner_id: partnerId }),
  }).catch(() => {});
}

function partnerHref(partner: PartnerSlotData): string {
  const path = partner.profile_path?.trim();
  if (path && path.startsWith("/")) return path;
  return `/partners/${partner.id}`;
}

/** Logo mbush 100% të zonës së bardhë — VIP dhe Partner. */
function PartnerLogoImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-white">
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function PartnerBadge({ tier }: { tier: "vip" | "standard" }) {
  const isVip = tier === "vip";
  return (
    <span
      className={cn(
        "absolute top-0 right-0 z-[2] flex items-center gap-0.5 px-1 py-0.5 rounded-bl-md text-[7px] sm:text-[8px] font-black tracking-wide leading-tight",
        isVip
          ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
          : "bg-[#1A56A0] text-white",
      )}
    >
      {isVip ? <Star className="h-2.5 w-2.5 fill-white shrink-0" aria-hidden /> : null}
      {isVip ? "VIP Partner" : "Partner"}
    </span>
  );
}

function VipBannerCarousel({
  partner,
  frameClass,
  onClick,
}: {
  partner: PartnerSlotData;
  frameClass: string;
  onClick: () => void;
}) {
  const slides = partner.banner_urls.length > 0 ? partner.banner_urls : [];
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 24 });

  useEffect(() => {
    if (!emblaApi || slides.length < 2) return;
    const timer = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(timer);
  }, [emblaApi, slides.length]);

  const href = partnerHref(partner);

  return (
    <Link
      href={href}
      onClick={onClick}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-xl"
      data-testid={`trusted-partner-vip-${partner.id}`}
    >
      <div className={cn(frameClass, "relative block")} title={partner.business_name}>
        <PartnerBadge tier="vip" />
        <div ref={emblaRef} className="overflow-hidden h-full w-full">
          <div className="flex h-full">
            {slides.map((src, i) => (
              <div
                key={`${partner.id}-${i}`}
                className="relative h-full min-w-0 shrink-0 grow-0 basis-full overflow-hidden bg-white"
              >
                <img
                  src={src}
                  alt={`${partner.business_name} ${i + 1}`}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

type PartnerSlotProps = {
  partner: PartnerSlotData;
  frameClass: string;
  variant?: "grid" | "banner";
};

export function PartnerSlot({ partner, frameClass, variant = "grid" }: PartnerSlotProps) {
  const isVip = partner.tier === "vip";
  const showCarousel = isVip && partner.banner_urls.length > 0;
  const onClick = () => recordPartnerClick(partner.id);

  if (showCarousel) {
    return (
      <VipBannerCarousel partner={partner} frameClass={frameClass} onClick={onClick} />
    );
  }

  const img = partnerImageUrl(partner);
  const href = partnerHref(partner);

  const content = (
    <div className="grid h-full w-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
      <PartnerBadge tier={partner.tier} />
      {img ? (
        <PartnerLogoImage src={img} alt={partner.business_name} />
      ) : (
        <div
          className={cn(
            "relative z-[1] flex min-h-0 flex-1 items-center justify-center px-2",
            isVip ? "bg-gradient-to-br from-amber-600 to-yellow-600" : "bg-[#1A56A0]",
          )}
          aria-hidden
        >
          <span
            className={
              variant === "banner" ? "text-sm font-black text-white" : "text-lg sm:text-xl font-black text-white"
            }
          >
            {partnerInitials(partner.business_name)}
          </span>
        </div>
      )}
      {variant === "grid" ? (
        <p
          className={cn(
            "relative z-[1] shrink-0 w-full text-center font-semibold leading-tight",
            isVip
              ? "px-1 py-0.5 text-[8px] sm:text-[9px] line-clamp-1 text-amber-900 bg-amber-50 border-t border-amber-200/80"
              : "px-1.5 py-1 text-[9px] sm:text-[10px] line-clamp-2 text-[#1A56A0] bg-blue-50/95 border-t border-blue-200/70",
          )}
        >
          {partner.business_name}
        </p>
      ) : null}
    </div>
  );

  const className = cn(
    frameClass,
    "relative group block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    isVip ? "focus-visible:ring-amber-500" : "focus-visible:ring-[#1A56A0]",
  );

  return (
    <Link
      href={href}
      onClick={onClick}
      className={className}
      title={partner.business_name}
      data-testid={`trusted-partner-${partner.tier}-${partner.id}`}
    >
      {content}
    </Link>
  );
}

import { useEffect, useState } from "react";
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
  void fetch("/api/partners/analytics/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ partner_id: partnerId }),
  }).catch(() => {});
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

  const href = partner.click_url ?? partner.profile_path;
  const external = !!partner.click_url;

  const inner = (
    <div className={cn(frameClass, "relative block")} title={partner.business_name}>
      <PartnerBadge tier="vip" />
      <div ref={emblaRef} className="overflow-hidden h-full w-full">
        <div className="flex h-full">
          {slides.map((src, i) => (
            <div key={`${partner.id}-${i}`} className="min-w-0 shrink-0 grow-0 basis-full h-full">
              <img
                src={src}
                alt={`${partner.business_name} ${i + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-xl"
        data-testid={`trusted-partner-vip-${partner.id}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClick} className="block rounded-xl">
      {inner}
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
  const href = partner.click_url ?? partner.profile_path;
  const external = !!partner.click_url;

  const logoAreaClass = cn(
    "relative z-[1] flex-1 min-h-0 w-full flex items-center justify-center",
    img ? "bg-white/95" : isVip ? "bg-gradient-to-br from-amber-600 to-yellow-600" : "bg-[#1A56A0]",
  );

  const content = (
    <>
      <PartnerBadge tier={partner.tier} />
      <div className={logoAreaClass}>
        {img ? (
          <img
            src={img}
            alt={partner.business_name}
            className={cn(
              "max-h-full max-w-full object-contain transition-transform",
              variant === "grid"
                ? isVip
                  ? "p-2 sm:p-2.5 group-hover:scale-[1.03]"
                  : "p-1.5 sm:p-2 group-hover:scale-[1.03]"
                : "p-1.5",
            )}
            loading="lazy"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center px-2 text-white"
            aria-hidden
          >
            <span
              className={
                variant === "banner" ? "text-sm font-black" : "text-lg sm:text-xl font-black"
              }
            >
              {partnerInitials(partner.business_name)}
            </span>
          </div>
        )}
      </div>
      {variant === "grid" ? (
        <p
          className={cn(
            "relative z-[1] shrink-0 w-full px-1.5 py-1 text-center font-semibold leading-tight line-clamp-2",
            isVip
              ? "text-[9px] sm:text-[10px] text-amber-900 bg-amber-50/95 border-t border-amber-200/80"
              : "text-[9px] sm:text-[10px] text-[#1A56A0] bg-blue-50/95 border-t border-blue-200/70",
          )}
        >
          {partner.business_name}
        </p>
      ) : null}
    </>
  );

  const className = cn(
    frameClass,
    "relative group",
    variant === "grid"
      ? "block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      : "",
    isVip ? "focus-visible:ring-amber-500" : "focus-visible:ring-[#1A56A0]",
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
        title={partner.business_name}
        data-testid={`trusted-partner-${partner.tier}-${partner.id}`}
      >
        {content}
      </a>
    );
  }

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

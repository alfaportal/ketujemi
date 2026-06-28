import { shopWhatsappDigits } from "@/lib/shop-social-url-input";

function formatOrderPrice(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** wa.me link with pre-filled order message (product title + price). */
export function shopWhatsAppOrderHref(
  whatsapp: string | null | undefined,
  productTitle: string,
  price: number,
  shopName?: string | null,
): string | null {
  const digits = shopWhatsappDigits(whatsapp);
  if (!digits) return null;

  const title = productTitle.trim();
  const priceStr = formatOrderPrice(price);
  const lines = [
    "Përshëndetje!",
    shopName?.trim()
      ? `Dëshiroj të porosis nga ${shopName.trim()}:`
      : "Dëshiroj të porosis:",
    `${title} — ${priceStr}`,
  ];

  return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
}

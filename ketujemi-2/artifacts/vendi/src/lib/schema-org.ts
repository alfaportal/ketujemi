import { CANONICAL_SITE_ORIGIN } from "@/lib/category-seo";

export function injectJsonLd(id: string, data: Record<string, unknown>): () => void {
  if (typeof document === "undefined") return () => {};
  const scriptId = `jsonld-${id}`;
  let el = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = scriptId;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
  return () => {
    el?.remove();
  };
}

export function listingProductJsonLd(input: {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  price: number;
  currency?: string;
  location?: string | null;
  urlPath: string;
  sellerName?: string | null;
}): Record<string, unknown> {
  const url = `${CANONICAL_SITE_ORIGIN}${input.urlPath}`;
  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url,
    priceCurrency: input.currency ?? "EUR",
    availability: "https://schema.org/InStock",
  };
  if (input.price > 0) {
    offers.price = input.price;
  } else {
    offers.price = 0;
    offers.priceSpecification = {
      "@type": "PriceSpecification",
      price: 0,
      priceCurrency: input.currency ?? "EUR",
      description: "Negotiable or free",
    };
  }

  const product: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.title,
    description: input.description.slice(0, 5000),
    url,
    offers,
  };
  if (input.imageUrl) product.image = input.imageUrl;
  if (input.location) {
    product.contentLocation = {
      "@type": "Place",
      name: input.location,
    };
  }
  if (input.sellerName) {
    offers.seller = {
      "@type": "Person",
      name: input.sellerName,
    };
  }
  return product;
}

export function breadcrumbJsonLd(
  items: { name: string; url?: string }[],
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

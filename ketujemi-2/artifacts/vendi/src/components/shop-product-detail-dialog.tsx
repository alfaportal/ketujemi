import { useState } from "react";
import { ChevronLeft, ChevronRight, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BRAND_BLUE } from "@/lib/brand-colors";
import { useShopProductsCopy } from "@/lib/shop-products-i18n";
import { ShopSocialIconBar, type ShopSocialFields } from "@/components/shop-social-icon-bar";
import { shopPhoneHref } from "@/lib/shop-social-url-input";
import { shopWhatsAppOrderHref } from "@/lib/shop-whatsapp-order";
import type { ShopProductPublic } from "@/components/shop-product-card";

type ShopContact = ShopSocialFields & {
  phone?: string | null;
  shop_name?: string | null;
};

type Props = {
  product: ShopProductPublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shop: ShopContact;
};

function formatPrice(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ShopProductDetailDialog({ product, open, onOpenChange, shop }: Props) {
  const c = useShopProductsCopy();
  const [photoIndex, setPhotoIndex] = useState(0);

  if (!product) return null;

  const photos =
    product.image_urls?.length ? product.image_urls : product.image_url ? [product.image_url] : [];
  const activePhoto = photos[photoIndex] ?? photos[0] ?? null;
  const phoneHref = shopPhoneHref(shop.phone);
  const whatsappHref = shopWhatsAppOrderHref(shop.whatsapp, product.title, product.price, shop.shop_name);

  function onOpenChangeWrap(next: boolean) {
    if (!next) setPhotoIndex(0);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeWrap}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="relative bg-gray-950">
          {activePhoto ? (
            <img src={activePhoto} alt={product.title} className="w-full max-h-[360px] object-contain mx-auto bg-black" />
          ) : (
            <div className="w-full h-48 flex items-center justify-center text-6xl opacity-30 bg-slate-800" aria-hidden>
              🛍️
            </div>
          )}
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                onClick={() => setPhotoIndex((i) => (i > 0 ? i - 1 : photos.length - 1))}
                aria-label={c.prevPhoto}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow flex items-center justify-center"
                onClick={() => setPhotoIndex((i) => (i < photos.length - 1 ? i + 1 : 0))}
                aria-label={c.nextPhoto}
              >
                <ChevronRight size={20} />
              </button>
              <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium text-white/90 bg-black/50 px-3 py-1 rounded-full">
                {photoIndex + 1} / {photos.length}
                {photoIndex === 0 ? ` · ${c.coverPhotoLabel}` : ""}
              </p>
            </>
          ) : null}
        </div>

        {photos.length > 1 ? (
          <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
            {photos.map((url, i) => (
              <button
                key={`${url}-${i}`}
                type="button"
                onClick={() => setPhotoIndex(i)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === photoIndex ? "border-blue-600 ring-2 ring-blue-200" : "border-transparent opacity-80"
                }`}
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}

        <div className="p-6 space-y-5">
          {product.collection?.trim() ? (
            <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color: BRAND_BLUE }}>
              {product.collection}
            </p>
          ) : null}
          <div>
            <h2 className="text-2xl font-black text-gray-900">{product.title}</h2>
            <p className="text-xl font-bold mt-2" style={{ color: BRAND_BLUE }}>
              {product.price > 0 ? formatPrice(product.price) : c.priceOnRequest}
            </p>
          </div>

          {product.description?.trim() &&
          !product.description.startsWith("Produkt nga dyqani") ? (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-gray-100 bg-slate-50 p-4 space-y-4">
            <p className="text-sm font-bold text-gray-900">{c.contactForProduct}</p>
            <div className="flex flex-wrap gap-3">
              {phoneHref ? (
                <a href={phoneHref} className="flex-1 min-w-[140px]">
                  <Button type="button" className="w-full min-h-12 gap-2 font-bold text-white" style={{ backgroundColor: BRAND_BLUE }}>
                    <Phone size={18} />
                    {c.callShop} {shop.phone}
                  </Button>
                </a>
              ) : null}
              {whatsappHref ? (
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-[140px]">
                  <Button type="button" variant="outline" className="w-full min-h-12 font-semibold border-green-600 text-green-700 hover:bg-green-50">
                    WhatsApp
                  </Button>
                </a>
              ) : null}
            </div>
            <ShopSocialIconBar
              variant="light"
              className="justify-start"
              fields={{
                facebook: shop.facebook,
                instagram: shop.instagram,
                tiktok: shop.tiktok,
                whatsapp: shop.whatsapp,
                website: shop.website,
                youtube: shop.youtube,
              }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

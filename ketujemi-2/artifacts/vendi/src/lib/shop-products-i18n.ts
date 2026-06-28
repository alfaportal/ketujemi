import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ShopProductsCopy = {
  catalogTitle: string;
  catalogSubtitle: string;
  addProduct: string;
  editProduct: string;
  deleteProduct: string;
  productTitle: string;
  productDescription: string;
  productPrice: string;
  productComparePrice: string;
  productCategory: string;
  productImage: string;
  productSku: string;
  saveProduct: string;
  productSaved: string;
  productDeleted: string;
  productError: string;
  noProducts: string;
  noProductsOwner: string;
  manageProducts: string;
  autoListingHint: string;
  verifiedStorefront: string;
  contactShop: string;
  orderProduct: string;
  viewOnMarketplace: string;
  storefrontBadge: string;
  coverImage: string;
  tagline: string;
  selectCategory: string;
};

const KS: ShopProductsCopy = {
  catalogTitle: "Produktet tona",
  catalogSubtitle: "Katalogu zyrtar i dyqanit — çdo produkt publikohet automatikisht në KetuJemi.",
  addProduct: "➕ Shto produkt",
  editProduct: "Edito produktin",
  deleteProduct: "Fshi produktin",
  productTitle: "Titulli i produktit",
  productDescription: "Përshkrimi",
  productPrice: "Çmimi (€)",
  productComparePrice: "Çmimi i vjetër (opsional)",
  productCategory: "Kategoria në Blej & Shite",
  productImage: "URL e fotos",
  productSku: "SKU / Kodi (opsional)",
  saveProduct: "Ruaj produktin",
  productSaved: "Produkti u ruajt dhe u publikua si shpallje.",
  productDeleted: "Produkti u fshi.",
  productError: "Gabim — provoni përsëri.",
  noProducts: "Ky dyqan nuk ka produkte aktive për momentin.",
  noProductsOwner: "Shtoni produktin e parë — do të shfaqet këtu dhe automatikisht në Blej & Shite.",
  manageProducts: "Menaxho produktet",
  autoListingHint: "Çdo ndryshim në produktet tuaja publikohet automatikisht si shpallje në KetuJemi.",
  verifiedStorefront: "Dyqan i verifikuar · Webfaqe zyrtare",
  contactShop: "Kontakto dyqanin",
  orderProduct: "Porosit",
  viewOnMarketplace: "Shiko në Blej & Shite",
  storefrontBadge: "Webfaqe zyrtare KetuJemi",
  coverImage: "Foto cover (URL)",
  tagline: "Slogan i shkurtër (opsional)",
  selectCategory: "Zgjidhni kategorinë",
};

const EN: ShopProductsCopy = {
  catalogTitle: "Our products",
  catalogSubtitle: "Official shop catalog — each product is auto-published on KetuJemi.",
  addProduct: "➕ Add product",
  editProduct: "Edit product",
  deleteProduct: "Delete product",
  productTitle: "Product title",
  productDescription: "Description",
  productPrice: "Price (€)",
  productComparePrice: "Compare-at price (optional)",
  productCategory: "Marketplace category",
  productImage: "Photo URL",
  productSku: "SKU (optional)",
  saveProduct: "Save product",
  productSaved: "Product saved and published as a listing.",
  productDeleted: "Product deleted.",
  productError: "Error — please try again.",
  noProducts: "This shop has no active products yet.",
  noProductsOwner: "Add your first product — it appears here and automatically on Buy & Sell.",
  manageProducts: "Manage products",
  autoListingHint: "Every product change is automatically published as a KetuJemi listing.",
  verifiedStorefront: "Verified shop · Official website",
  contactShop: "Contact shop",
  orderProduct: "Order",
  viewOnMarketplace: "View on Buy & Sell",
  storefrontBadge: "Official KetuJemi storefront",
  coverImage: "Cover photo (URL)",
  tagline: "Short tagline (optional)",
  selectCategory: "Select category",
};

const BY_LOCALE: Partial<Record<UiTranslationLocale, ShopProductsCopy>> = {
  ks: KS,
  mk: KS,
  mne: KS,
  en: EN,
};

export function useShopProductsCopy(): ShopProductsCopy {
  const { uiLang } = useMarket();
  const locale = translationKeyForUiLang(uiLang);
  return BY_LOCALE[locale] ?? KS;
}

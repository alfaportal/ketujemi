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
  moderationNotice: string;
  storefrontEditSection: string;
  uploadCover: string;
  uploadLogo: string;
  businessHours: string;
  businessHoursPlaceholder: string;
  taglinePlaceholder: string;
  aboutPlaceholder: string;
  locationCategorySection: string;
  contactSection: string;
  editTabWebsite: string;
  editTabProducts: string;
  contentNoticeTitle: string;
  contentNoticeMessage: string;
  contentNoticeWait: string;
  contentNoticeReady: string;
  contentNoticeContinue: string;
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
  coverImage: "Foto prapavije (cover)",
  tagline: "Slogan i shkurtër (opsional)",
  selectCategory: "Zgjidhni kategorinë",
  moderationNotice:
    "Mos postoni sende të ndaluara — përshkrimi më poshtë është vetëm kujtesë; kontrolli bëhet me rregulla fikse, jo me AI.",
  storefrontEditSection: "Pamja e webfaqes suaj",
  uploadCover: "Ngarko foto prapavije",
  uploadLogo: "Ngarko logo",
  businessHours: "Orari & shërbimet",
  businessHoursPlaceholder: "P.sh. Hënë–Shtunë 08:00–22:00 · Ofrojmë POS, menaxhim stafi, etj.",
  taglinePlaceholder: "P.sh. Menaxhimi modern për restorante",
  aboutPlaceholder: "Përshkruani biznesin tuaj — çfarë ofroni, pse ju zgjedhin klientët…",
  locationCategorySection: "Lokacioni & kategoria",
  contactSection: "Kontakti & rrjetet sociale",
  editTabWebsite: "Webfaqja",
  editTabProducts: "Produktet",
  contentNoticeTitle: "Rregullat e webfaqes së dyqanit",
  contentNoticeMessage: `Personalizoni lirisht webfaqen tuaj — foto, tekst, produkte dhe orarin.

Nuk lejohet të postoni:
• Armë, municione dhe mjete të rrezikshme
• Drogë dhe substanca narkotike
• Alkool dhe pije alkoolike
• Duhan, cigare, vape dhe nikotinë
• Kriptomonedha, kazino dhe baste
• Skema piramidale / MLM
• Përmbajtje erotike ose shërbime escort
• Produkte të falsifikuara / replika
• Spam, mashtrim, fyërje ose materiale të paligjshme

Materialet e ndaluara refuzohen automatikisht. Ekipi i KetuJemi mund të heqë dyqane që shkelin rregullat.`,
  contentNoticeWait: "Ju lutem lexoni rregullat — {seconds} sekonda",
  contentNoticeReady: "Mund të vazhdoni me editimin e dyqanit.",
  contentNoticeContinue: "Kuptova, vazhdo",
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
  coverImage: "Cover photo",
  tagline: "Short tagline (optional)",
  selectCategory: "Select category",
  moderationNotice:
    "Do not post prohibited items — fixed rules apply, not AI scanning.",
  storefrontEditSection: "Your storefront look",
  uploadCover: "Upload cover photo",
  uploadLogo: "Upload logo",
  businessHours: "Hours & services",
  businessHoursPlaceholder: "E.g. Mon–Sat 08:00–22:00 · We offer POS, staff management, etc.",
  taglinePlaceholder: "E.g. Modern management for restaurants",
  aboutPlaceholder: "Describe your business — what you offer and why customers choose you…",
  locationCategorySection: "Location & category",
  contactSection: "Contact & social links",
  editTabWebsite: "Website",
  editTabProducts: "Products",
  contentNoticeTitle: "Shop storefront rules",
  contentNoticeMessage: `Customize your storefront freely — photos, text, products, and hours.

Not allowed:
• Weapons, ammunition, and dangerous items
• Drugs and narcotics
• Alcohol and alcoholic beverages
• Tobacco, cigarettes, vape, and nicotine
• Cryptocurrency, casino, and betting
• Pyramid schemes / MLM
• Erotic content or escort services
• Counterfeit / replica products
• Spam, fraud, abuse, or illegal material

Prohibited content is rejected automatically. KetuJemi may remove shops that break the rules.`,
  contentNoticeWait: "Please read the rules — {seconds} seconds",
  contentNoticeReady: "You can continue editing your shop.",
  contentNoticeContinue: "Got it, continue",
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

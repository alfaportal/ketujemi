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
  productPhotos: string;
  productPhotosHint: string;
  addPhotos: string;
  takePhoto: string;
  uploadingPhotos: string;
  uploadFailed: string;
  uploadNotReady: string;
  photosMaxReached: string;
  mainPhoto: string;
  removePhoto: string;
  movePhotoLeft: string;
  movePhotoRight: string;
  productCollection: string;
  productCollectionPlaceholder: string;
  productFormHint: string;
  productTitlePlaceholder: string;
  productDescriptionPlaceholder: string;
  productCategoryHint: string;
  selectCategoryOptional: string;
  priceOnRequest: string;
  uncategorizedProducts: string;
  viewProduct: string;
  morePhotos: string;
  contactForProduct: string;
  callShop: string;
  prevPhoto: string;
  nextPhoto: string;
  maxTilesHint: string;
  maxTilesReached: string;
  coverPhotoLabel: string;
  storefrontEditorIntro: string;
  storefrontStepPhotos: string;
  storefrontStepAbout: string;
  storefrontStepTiles: string;
  storefrontStepContact: string;
  storefrontStepExtra: string;
  addTile: string;
  editTile: string;
  tileLabel: string;
  tileLabelPlaceholder: string;
  tileDescription: string;
  tileDescriptionPlaceholder: string;
  tileSaveHint: string;
  tileAdvanced: string;
  noTilesOwner: string;
  tileNumber: string;
};

const KS: ShopProductsCopy = {
  catalogTitle: "Produktet tona",
  catalogSubtitle: "Deri në 8 shërbime ose produkte — secili me foto kryesore dhe deri në 10 foto brenda.",
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
  productPhotos: "Fotot e produktit",
  productPhotosHint: "Ngarkoni deri në 10 foto — si te shpalljet. Fotoja e parë shfaqet kryesore; lëvizni me shigjetat.",
  addPhotos: "Ngarko foto",
  takePhoto: "Foto me kamerë",
  uploadingPhotos: "Duke ngarkuar…",
  uploadFailed: "Ngarkimi dështoi — provoni përsëri.",
  uploadNotReady: "Ngarkimi nuk është gati — rifreskoni faqen.",
  photosMaxReached: "Maksimumi {max} foto.",
  mainPhoto: "Kryesore",
  removePhoto: "Fshi foton",
  movePhotoLeft: "Lëviz majtas",
  movePhotoRight: "Lëviz djathtas",
  productCollection: "Kategoria juaj në dyqan",
  productCollectionPlaceholder: "p.sh. Pica, Pije, Dessert — për t'i grupuar në webfaqe",
  productFormHint: "Plotësoni sa të doni — mund ta ruani edhe vetëm me foto. Asnjë fushë nuk ju bllokon.",
  productTitlePlaceholder: "Emri i produktit (opsional)",
  productDescriptionPlaceholder: "Përshkrimi (opsional)",
  productCategoryHint: "Opsionale — vetëm për publikimin automatik në Blej & Shite.",
  selectCategoryOptional: "Pa kategori Blej & Shite",
  priceOnRequest: "Me marrëveshje",
  uncategorizedProducts: "Produkte",
  viewProduct: "Shiko",
  morePhotos: "foto",
  contactForProduct: "Na kontaktoni",
  callShop: "Thirr",
  prevPhoto: "Foto e mëparshme",
  nextPhoto: "Foto tjetër",
  maxTilesHint: "Maksimumi 8 katrorë në webfaqe — secili me deri në 10 foto (80 foto gjithsej).",
  maxTilesReached: "Keni arritur 8 produkte në webfaqe. Fshini një për të shtuar tjetër.",
  coverPhotoLabel: "Foto kryesore (cover)",
  storefrontEditorIntro:
    "Ndryshoni webfaqen këtu — vizitorët shohin vetëm faqen publike, jo këtë panel. Ruajeni çdo katror veç e pastaj «Ruaj webfaqen».",
  storefrontStepPhotos: "Foto kryesore & logo",
  storefrontStepAbout: "Përshkrimi i dyqanit",
  storefrontStepTiles: "8 katrorët — çka shiten",
  storefrontStepContact: "Telefon, email & rrjetet sociale",
  storefrontStepExtra: "Orari, adresa & kategoria (opsionale)",
  addTile: "Shto katror",
  editTile: "Edito katrorin",
  tileLabel: "Çka shiten këtu?",
  tileLabelPlaceholder: "P.sh. Rroba për femra, Këpucë meshkuj…",
  tileDescription: "Përshkrim i shkurtër",
  tileDescriptionPlaceholder: "P.sh. Veshje casual, madhësi S–XL, stok i ri…",
  tileSaveHint: "Çdo katror ruhet veç — klikoni Ruaj produktin. Shfaqet në webfaqe dhe Blej & Shite.",
  tileAdvanced: "Blej & Shite — kategoria (opsionale)",
  noTilesOwner: "Shtoni katrorin e parë — deri në 8, secili me deri në 10 foto.",
  tileNumber: "Katror",
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
  productPhotos: "Product photos",
  productPhotosHint: "Upload up to 10 photos — like listings. First photo is the cover; reorder with arrows.",
  addPhotos: "Upload photos",
  takePhoto: "Take photo",
  uploadingPhotos: "Uploading…",
  uploadFailed: "Upload failed — try again.",
  uploadNotReady: "Upload not ready — refresh the page.",
  photosMaxReached: "Maximum {max} photos.",
  mainPhoto: "Main",
  removePhoto: "Remove photo",
  movePhotoLeft: "Move left",
  movePhotoRight: "Move right",
  productCollection: "Your shop category",
  productCollectionPlaceholder: "e.g. Pizza, Drinks, Desserts — groups products on your page",
  productFormHint: "Fill in what you want — you can save with photos only. No field blocks you.",
  productTitlePlaceholder: "Product name (optional)",
  productDescriptionPlaceholder: "Description (optional)",
  productCategoryHint: "Optional — for auto-publish on Buy & Sell only.",
  selectCategoryOptional: "No Buy & Sell category",
  priceOnRequest: "On request",
  uncategorizedProducts: "Products",
  viewProduct: "View",
  morePhotos: "photos",
  contactForProduct: "Contact us",
  callShop: "Call",
  prevPhoto: "Previous photo",
  nextPhoto: "Next photo",
  maxTilesHint: "Up to 8 tiles on your storefront — each with up to 10 photos (80 total).",
  maxTilesReached: "You reached 8 storefront items. Delete one to add another.",
  coverPhotoLabel: "Cover photo",
  storefrontEditorIntro:
    "Edit your storefront here — visitors only see the public page, not this panel. Save each tile, then «Save storefront».",
  storefrontStepPhotos: "Cover photo & logo",
  storefrontStepAbout: "About your shop",
  storefrontStepTiles: "8 tiles — what you sell",
  storefrontStepContact: "Phone, email & social links",
  storefrontStepExtra: "Hours, address & category (optional)",
  addTile: "Add tile",
  editTile: "Edit tile",
  tileLabel: "What do you sell here?",
  tileLabelPlaceholder: "E.g. Women's clothing, Men's shoes…",
  tileDescription: "Short description",
  tileDescriptionPlaceholder: "E.g. Casual wear, sizes S–XL, new stock…",
  tileSaveHint: "Each tile saves separately — click Save product. It appears on your site and Buy & Sell.",
  tileAdvanced: "Buy & Sell category (optional)",
  noTilesOwner: "Add your first tile — up to 8, each with up to 10 photos.",
  tileNumber: "Tile",
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

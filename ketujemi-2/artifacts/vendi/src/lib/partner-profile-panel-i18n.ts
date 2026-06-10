import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type PartnerProfilePanelCopy = {
  pendingTitle: string;
  pendingBody: string;
  blockedTitle: string;
  blockedBody: string;
  title: string;
  subtitle: string;
  activationCode: string;
  linkTypeLabel: string;
  linkLabel: string;
  websitePh: string;
  instagramPh: string;
  facebookPh: string;
  vipBannerTitle: string;
  photoLabel: string;
  vipHint: string;
  save: string;
  saved: string;
  error: string;
  linkRequired: string;
  maxBanners: string;
};

const KS: PartnerProfilePanelCopy = {
  pendingTitle: "Aplikimi në pritje",
  pendingBody:
    "Llogaria juaj do të aktivizohet nga administratori pas verifikimit të pagesës. Pastaj mund të shtoni linkun dhe (për VIP) bannerët lëvizës.",
  blockedTitle: "Llogaria e bllokuar",
  blockedBody: "Kontaktoni administratorin për më shumë informacion.",
  title: "Profili partner",
  subtitle: "Një link i vetëm — hapet kur vizitorët klikojnë logon ose bannerin tuaj.",
  activationCode: "Kodi i aktivizimit:",
  linkTypeLabel: "Lloji i linkut",
  linkLabel: "Linku",
  websitePh: "https://kompaniajuaj.com",
  instagramPh: "https://instagram.com/emri ose @emri",
  facebookPh: "https://facebook.com/faqja",
  vipBannerTitle: "Banner lëvizës VIP (deri në 5 foto)",
  photoLabel: "Foto",
  vipHint: "Nëse shtoni foto këtu, banneri lëvizës shfaqet në vend të logos së vetme.",
  save: "Ruaj profilin partner",
  saved: "U ruajt!",
  error: "Gabim",
  linkRequired: "Shtoni një link (website, Instagram ose Facebook)",
  maxBanners: "Maksimumi 5 foto për bannerin VIP",
};

const MK: PartnerProfilePanelCopy = {
  pendingTitle: "Апликацијата е во тек",
  pendingBody:
    "Сметката ќе се активира од администраторот по верификација на плаќањето. Потоа можете да додадете линк и (за VIP) лизгачки банери.",
  blockedTitle: "Блокирана сметка",
  blockedBody: "Контактирајте го администраторот за повеќе информации.",
  title: "Профил на партнер",
  subtitle: "Еден линк — се отвора кога посетителите кликнат на вашето лого или банер.",
  activationCode: "Код за активирање:",
  linkTypeLabel: "Тип на линк",
  linkLabel: "Линк",
  websitePh: "https://vasatakompanija.com",
  instagramPh: "https://instagram.com/ime или @ime",
  facebookPh: "https://facebook.com/stranica",
  vipBannerTitle: "VIP лизгачки банер (до 5 фотографии)",
  photoLabel: "Фотографија",
  vipHint: "Ако додадете фотографии овде, лизгачкиот банер се прикажува наместо единечното лого.",
  save: "Зачувај партнерски профил",
  saved: "Зачувано!",
  error: "Грешка",
  linkRequired: "Додадете линк (веб-сајт, Instagram или Facebook)",
  maxBanners: "Максимум 5 фотографии за VIP банерот",
};

const MNE: PartnerProfilePanelCopy = {
  pendingTitle: "Prijava na čekanju",
  pendingBody:
    "Račun će aktivirati administrator nakon verifikacije uplate. Zatim možete dodati link i (za VIP) klizeće banere.",
  blockedTitle: "Blokiran račun",
  blockedBody: "Kontaktirajte administratora za više informacija.",
  title: "Partnerski profil",
  subtitle: "Jedan link — otvara se kada posjetioci kliknu vaš logo ili baner.",
  activationCode: "Kod za aktivaciju:",
  linkTypeLabel: "Vrsta linka",
  linkLabel: "Link",
  websitePh: "https://vasakompanija.com",
  instagramPh: "https://instagram.com/ime ili @ime",
  facebookPh: "https://facebook.com/stranica",
  vipBannerTitle: "VIP klizeći baner (do 5 fotografija)",
  photoLabel: "Fotografija",
  vipHint: "Ako dodate fotografije ovdje, klizeći baner se prikazuje umjesto pojedinačnog loga.",
  save: "Sačuvaj partnerski profil",
  saved: "Sačuvano!",
  error: "Greška",
  linkRequired: "Dodajte link (website, Instagram ili Facebook)",
  maxBanners: "Maksimum 5 fotografija za VIP baner",
};

const EN: PartnerProfilePanelCopy = {
  pendingTitle: "Application pending",
  pendingBody:
    "Your account will be activated by an administrator after payment verification. Then you can add your link and (for VIP) sliding banners.",
  blockedTitle: "Account blocked",
  blockedBody: "Contact the administrator for more information.",
  title: "Partner profile",
  subtitle: "One link — opens when visitors click your logo or banner.",
  activationCode: "Activation code:",
  linkTypeLabel: "Link type",
  linkLabel: "Link",
  websitePh: "https://yourcompany.com",
  instagramPh: "https://instagram.com/name or @name",
  facebookPh: "https://facebook.com/page",
  vipBannerTitle: "VIP sliding banner (up to 5 photos)",
  photoLabel: "Photo",
  vipHint: "If you add photos here, the sliding banner appears instead of the single logo.",
  save: "Save partner profile",
  saved: "Saved!",
  error: "Error",
  linkRequired: "Add a link (website, Instagram, or Facebook)",
  maxBanners: "Maximum 5 photos for the VIP banner",
};

const IT: PartnerProfilePanelCopy = {
  pendingTitle: "Application pending",
  pendingBody: "Your account will be activated by an administrator after payment verification. Then you can add your link and (for VIP) sliding banners.",
  blockedTitle: "Account blocked",
  blockedBody: "Contatto the administrator for more information.",
  title: "Partner profile",
  subtitle: "One link — opens when visitors click your logo or banner.",
  activationCode: "Activation code:",
  linkTypeLabel: "Link type",
  linkLabel: "Link",
  websitePh: "https://yourcompany.com",
  instagramPh: "https://instagram.com/name or @name",
  facebookPh: "https://facebook.com/page",
  vipBannerTitle: "VIP sliding banner (up to 5 photos)",
  photoLabel: "Photo",
  vipHint: "If you add photos here, the sliding banner appears instead of the single logo.",
  save: "Salva partner profile",
  saved: "Saved!",
  error: "Error",
  linkRequired: "Add a link (website, Instagram, or Facebook)",
  maxBanners: "Maximum 5 photos for the VIP banner",
};

const DE: PartnerProfilePanelCopy = {
  pendingTitle: "Application pending",
  pendingBody: "Your account will be activated by an administrator after payment verification. Then you can add your link and (for VIP) sliding banners.",
  blockedTitle: "Account blocked",
  blockedBody: "Kontakt the administrator for more information.",
  title: "Partner profile",
  subtitle: "One link — opens when visitors click your logo or banner.",
  activationCode: "Activation code:",
  linkTypeLabel: "Link type",
  linkLabel: "Link",
  websitePh: "https://yourcompany.com",
  instagramPh: "https://instagram.com/name or @name",
  facebookPh: "https://facebook.com/page",
  vipBannerTitle: "VIP sliding banner (up to 5 photos)",
  photoLabel: "Photo",
  vipHint: "If you add photos here, the sliding banner appears instead of the single logo.",
  save: "Speichern partner profile",
  saved: "Saved!",
  error: "Error",
  linkRequired: "Add a link (website, Instagram, or Facebook)",
  maxBanners: "Maximum 5 photos for the VIP banner",
};

const FR: PartnerProfilePanelCopy = {
  pendingTitle: "Demande en attente",
  pendingBody:
    "Votre compte sera activé par un administrateur après vérification du paiement. Vous pourrez ensuite ajouter votre lien et (pour VIP) des bannières défilantes.",
  blockedTitle: "Compte bloqué",
  blockedBody: "Contactez l'administrateur pour plus d'informations.",
  title: "Profil partenaire",
  subtitle: "Un seul lien — s'ouvre quand les visiteurs cliquent sur votre logo ou bannière.",
  activationCode: "Code d'activation :",
  linkTypeLabel: "Type de lien",
  linkLabel: "Lien",
  websitePh: "https://votreentreprise.com",
  instagramPh: "https://instagram.com/nom ou @nom",
  facebookPh: "https://facebook.com/page",
  vipBannerTitle: "Bannière défilante VIP (jusqu'à 5 photos)",
  photoLabel: "Photo",
  vipHint: "Si vous ajoutez des photos ici, la bannière défilante remplace le logo unique.",
  save: "Enregistrer le profil partenaire",
  saved: "Enregistré !",
  error: "Erreur",
  linkRequired: "Ajoutez un lien (site web, Instagram ou Facebook)",
  maxBanners: "Maximum 5 photos pour la bannière VIP",
};

const PAGES: Record<UiTranslationLocale, PartnerProfilePanelCopy> = {
  ks: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  it: IT,
  de: DE,
};

export function usePartnerProfilePanelCopy(): PartnerProfilePanelCopy {
  const { uiLang } = useMarket();
  return PAGES[translationKeyForUiLang(uiLang)];
}

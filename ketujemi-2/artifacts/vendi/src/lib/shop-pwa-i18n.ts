import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type ShopPwaCopy = {
  installButton: string;
  installShort: string;
  defaultShopName: string;
  guideTitle: string;
  guideSubtitle: string;
  iosStep1: string;
  iosStep2: string;
  iosStep3: string;
  androidStep1: string;
  androidStep2: string;
  androidStep3: string;
  guideNote: string;
  guideClose: string;
  ownerHint: string;
};

const KS: ShopPwaCopy = {
  installButton: "Instalo {shop} si app",
  installShort: "Instalo si app",
  defaultShopName: "Dyqanin",
  guideTitle: "Shto {shop} në telefon",
  guideSubtitle: "Hapet si app — pa shfletues, me ikonën e dyqanit në ekranin kryesor.",
  iosStep1: "Në Safari, klikoni ikonën Share (katror me shigjetë lart).",
  iosStep2: "Zgjidhni «Add to Home Screen» / «Shto në ekranin kryesor».",
  iosStep3: "Konfirmoni — «{shop}» shfaqet si app në telefon.",
  androidStep1: "Në Chrome, hapni menynë (⋮) ose bannerin «Instalo app».",
  androidStep2: "Zgjidhni «Instalo app» ose «Add to Home screen» për {shop}.",
  androidStep3: "Ikona e dyqanit mbetet në ekranin kryesor — hapet direkt webfaqja.",
  guideNote:
    "Çdo dyqan ka app-in e vet në telefon (PWA). Funksionon në iPhone, Android, tablet dhe kompjuter me Chrome/Edge.",
  guideClose: "E kuptova",
  ownerHint: "Klientët mund ta shtojnë webfaqen si app në telefon — butoni «Instalo si app» shfaqet te faqja publike.",
};

const EN: ShopPwaCopy = {
  installButton: "Install {shop} as app",
  installShort: "Install as app",
  defaultShopName: "Shop",
  guideTitle: "Add {shop} to your phone",
  guideSubtitle: "Opens like an app — shop icon on your home screen.",
  iosStep1: "In Safari, tap the Share icon (square with arrow).",
  iosStep2: "Choose «Add to Home Screen».",
  iosStep3: "Confirm — «{shop}» appears as an app on your phone.",
  androidStep1: "In Chrome, open the menu (⋮) or the install banner.",
  androidStep2: "Choose «Install app» or «Add to Home screen» for {shop}.",
  androidStep3: "The shop icon stays on your home screen — opens the storefront directly.",
  guideNote:
    "Each shop has its own installable app (PWA). Works on iPhone, Android, tablets, and desktop Chrome/Edge.",
  guideClose: "Got it",
  ownerHint: "Customers can add your storefront as an app — the Install button appears on your public page.",
};

const BY_LOCALE: Partial<Record<UiTranslationLocale, ShopPwaCopy>> = {
  ks: KS,
  mk: KS,
  mne: KS,
  en: EN,
};

export function useShopPwaCopy(): ShopPwaCopy {
  const { uiLang } = useMarket();
  return BY_LOCALE[translationKeyForUiLang(uiLang)] ?? KS;
}

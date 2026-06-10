import { translationKeyForUiLang, type UiLang } from "@/lib/ui-languages";

export type SupportChatUiCopy = {
  title: string;
  subtitle: string;
  welcome: string;
  fab: string;
  inputPh: string;
  listeningPh: string;
  typing: string;
  listening: string;
  busy: string;
  closeAria: string;
  voiceStartAria: string;
  voiceStopAria: string;
  voiceError: string;
  voiceHttps: string;
  voiceMobile: string;
  voiceUnsupported: string;
};

const KS: SupportChatUiCopy = {
  title: "Ndihmë",
  subtitle: "Asistenti KetuJemi",
  welcome: "Përshëndetje! Pyetni shkurt — do t'ju udhëzoj ku të shkoni në KetuJemi.",
  fab: "Ndihmë",
  inputPh: "Shkruani pyetjen…",
  listeningPh: "Po dëgjohet zëri…",
  typing: "Duke shkruar…",
  listening: "Po dëgjoj… flisni tani",
  busy: "Nuk u lidh me serverin. Provoni përsëri.",
  closeAria: "Mbyll",
  voiceStartAria: "Fol me zë",
  voiceStopAria: "Ndalo dhe dërgo",
  voiceError: "Mikrofoni nuk u aktivizua. Lejoni mikrofonin në shfletues dhe provoni përsëri.",
  voiceHttps: "Për zërin (🎤) hapni faqen me HTTPS: https://ketujemi.com",
  voiceMobile: "Për funksionin e zërit përdor Chrome në desktop.",
  voiceUnsupported: "Ky shfletues nuk mbështet zërin. Përdorni Chrome ose Edge në desktop.",
};

const MK: SupportChatUiCopy = {
  ...KS,
  title: "Помош",
  subtitle: "Асистент KetuJemi",
  welcome: "Здраво! Поставете кратко прашање — ќе ве водам низ KetuJemi.",
  fab: "Помош",
  inputPh: "Напишете го прашањето…",
  listeningPh: "Се слуша глас…",
  typing: "Пишува…",
  listening: "Слушам… зборувајте сега",
  busy: "Не се поврза со серверот. Обидете се повторно.",
  closeAria: "Затвори",
  voiceStartAria: "Зборувај со глас",
  voiceStopAria: "Стоп и испрати",
  voiceError: "Микрофонот не се активира. Дозволете микрофон во прелистувачот.",
  voiceHttps: "За глас (🎤) отворете ја страницата преку HTTPS: https://ketujemi.com",
  voiceMobile: "За глас користете Chrome на desktop.",
  voiceUnsupported: "Овој прелистувач не поддржува глас. Користете Chrome или Edge.",
};

const MNE: SupportChatUiCopy = {
  ...KS,
  title: "Pomoć",
  subtitle: "Asistent KetuJemi",
  welcome: "Zdravo! Postavite kratko pitanje — vodim vas kroz KetuJemi.",
  fab: "Pomoć",
  inputPh: "Upišite pitanje…",
  listeningPh: "Sluša se glas…",
  typing: "Kucanje…",
  listening: "Slušam… govorite sada",
  busy: "Nije moguće povezati se sa serverom. Pokušajte ponovo.",
  closeAria: "Zatvori",
  voiceStartAria: "Govori glasom",
  voiceStopAria: "Zaustavi i pošalji",
  voiceError: "Mikrofon nije aktiviran. Dozvolite mikrofon u pregledaču.",
  voiceHttps: "Za glas (🎤) otvorite stranicu preko HTTPS: https://ketujemi.com",
  voiceMobile: "Za glas koristite Chrome na desktopu.",
  voiceUnsupported: "Ovaj pregledač ne podržava glas. Koristite Chrome ili Edge.",
};

const EN: SupportChatUiCopy = {
  ...KS,
  title: "Help",
  subtitle: "KetuJemi assistant",
  welcome: "Hello! Ask briefly — I will guide you around KetuJemi.",
  fab: "Help",
  inputPh: "Type your question…",
  listeningPh: "Listening to voice…",
  typing: "Typing…",
  listening: "Listening… speak now",
  busy: "Could not reach the server. Please try again.",
  closeAria: "Close",
  voiceStartAria: "Speak with voice",
  voiceStopAria: "Stop and send",
  voiceError: "Microphone was not enabled. Allow the microphone in your browser.",
  voiceHttps: "For voice (🎤) open the page over HTTPS: https://ketujemi.com",
  voiceMobile: "For voice use Chrome on desktop.",
  voiceUnsupported: "This browser does not support voice. Use Chrome or Edge on desktop.",
};

const FR: SupportChatUiCopy = {
  ...EN,
  title: "Aide",
  subtitle: "Assistant KetuJemi",
  welcome: "Bonjour ! Posez une question courte — je vous guide sur KetuJemi.",
  fab: "Aide",
  inputPh: "Posez votre question…",
  listeningPh: "Écoute de la voix…",
  typing: "Saisie…",
  listening: "J'écoute… parlez maintenant",
  busy: "Impossible de joindre le serveur. Réessayez.",
  closeAria: "Fermer",
  voiceStartAria: "Parler à voix haute",
  voiceStopAria: "Arrêter et envoyer",
};

const DE: SupportChatUiCopy = {
  ...EN,
  title: "Hilfe",
  subtitle: "KetuJemi-Assistent",
  welcome: "Hallo! Stellen Sie kurz eine Frage — ich leite Sie durch KetuJemi.",
  fab: "Hilfe",
  inputPh: "Frage eingeben…",
  listeningPh: "Sprache wird erkannt…",
  typing: "Schreibt…",
  listening: "Ich höre zu… sprechen Sie jetzt",
  busy: "Server nicht erreichbar. Bitte erneut versuchen.",
  closeAria: "Schließen",
};

const IT: SupportChatUiCopy = {
  ...EN,
  title: "Aiuto",
  subtitle: "Assistente KetuJemi",
  welcome: "Ciao! Fai una domanda breve — ti guido su KetuJemi.",
  fab: "Aiuto",
  inputPh: "Scrivi la domanda…",
  listeningPh: "Ascolto la voce…",
  typing: "Sta scrivendo…",
  listening: "Sto ascoltando… parla ora",
  busy: "Impossibile contattare il server. Riprova.",
  closeAria: "Chiudi",
};

const BY_LOCALE: Record<string, SupportChatUiCopy> = {
  ks: KS,
  al: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
  de: DE,
  it: IT,
};

export function supportChatDefaults(uiLang: UiLang): SupportChatUiCopy {
  return BY_LOCALE[translationKeyForUiLang(uiLang)] ?? KS;
}

/** API lang hint (sq / mk / me / en / fr) from UI + market. */
export function supportApiLang(uiLang: UiLang, marketCode: string): string {
  if (uiLang === "mk" || marketCode === "mk") return "mk";
  if (uiLang === "mne" || marketCode === "mne") return "me";
  if (uiLang === "fr") return "fr";
  if (uiLang === "en" || uiLang === "de" || uiLang === "it") return "en";
  return "sq";
}

export function mergeSupportChatCopy(
  uiLang: UiLang,
  t: Record<string, string>,
): SupportChatUiCopy {
  const fb = supportChatDefaults(uiLang);
  const pick = (key: keyof SupportChatUiCopy, txKey: string) =>
    t[txKey]?.trim() || fb[key];
  return {
    title: pick("title", "ui_supportChatTitle"),
    subtitle: pick("subtitle", "ui_supportChatSubtitle") || fb.subtitle,
    welcome: pick("welcome", "ui_supportWelcome"),
    fab: pick("fab", "ui_supportFab"),
    inputPh: pick("inputPh", "ui_supportInputPh"),
    listeningPh: pick("listeningPh", "ui_supportListeningPh"),
    typing: pick("typing", "ui_supportTyping"),
    listening: pick("listening", "ui_supportListening"),
    busy: pick("busy", "ui_supportBusy"),
    closeAria: pick("closeAria", "ui_supportCloseAria"),
    voiceStartAria: pick("voiceStartAria", "ui_supportVoiceStartAria"),
    voiceStopAria: pick("voiceStopAria", "ui_supportVoiceStopAria"),
    voiceError: pick("voiceError", "ui_supportVoiceError"),
    voiceHttps: pick("voiceHttps", "ui_supportVoiceHttps"),
    voiceMobile: pick("voiceMobile", "ui_supportVoiceMobile"),
    voiceUnsupported: pick("voiceUnsupported", "ui_supportVoiceUnsupported"),
  };
}

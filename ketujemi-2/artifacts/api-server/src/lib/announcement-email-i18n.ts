/** Locales for announcement / unsubscribe copy (aligned with site UI languages). */
export type AnnouncementLocale = "sq" | "mk" | "me" | "en" | "de" | "it" | "fr";

export type AnnouncementEmailShell = {
  greeting: string;
  footerBrand: string;
  unsubscribeLabel: string;
};

const SHELL: Record<AnnouncementLocale, AnnouncementEmailShell> = {
  sq: {
    greeting: "Përshëndetje,",
    footerBrand: "KetuJemi.com — tregu juaj lokal",
    unsubscribeLabel: "Çregjistrohu nga emailet e njoftimeve",
  },
  mk: {
    greeting: "Здраво,",
    footerBrand: "KetuJemi.com — вашиот локален пазар",
    unsubscribeLabel: "Откажи претплата за маркетинг е-пошта",
  },
  me: {
    greeting: "Zdravo,",
    footerBrand: "KetuJemi.com — vaš lokalni oglasnik",
    unsubscribeLabel: "Odjavi se od marketinških emailova",
  },
  en: {
    greeting: "Hello,",
    footerBrand: "KetuJemi.com — your local marketplace",
    unsubscribeLabel: "Unsubscribe from announcement emails",
  },
  de: {
    greeting: "Hallo,",
    footerBrand: "KetuJemi.com — Ihr lokaler Marktplatz",
    unsubscribeLabel: "Von Ankündigungs-E-Mails abmelden",
  },
  it: {
    greeting: "Ciao,",
    footerBrand: "KetuJemi.com — il tuo marketplace locale",
    unsubscribeLabel: "Annulla iscrizione alle email di annunci",
  },
  fr: {
    greeting: "Bonjour,",
    footerBrand: "KetuJemi.com — votre marketplace local",
    unsubscribeLabel: "Se désabonner des e-mails d'annonces",
  },
};

export type UnsubscribePageCopy = {
  title: string;
  body: string;
  already: string;
  invalid: string;
};

const UNSUB_PAGE: Record<AnnouncementLocale, UnsubscribePageCopy> = {
  sq: {
    title: "U çregjistruat",
    body: "Nuk do të merrni më email-e njoftimesh nga KetuJemi për këtë llogari.",
    already: "Jeni tashmë të çregjistruar nga emailet e njoftimeve.",
    invalid: "Lidhja e çregjistrimit nuk është e vlefshme ose ka skaduar.",
  },
  mk: {
    title: "Отпишани сте",
    body: "Повеќе нема да добивате маркетинг е-пошта од KetuJemi за оваа сметка.",
    already: "Веќе сте отпишани од маркетинг е-пошта.",
    invalid: "Линкот за отпишување е невалиден.",
  },
  me: {
    title: "Odjavljeni ste",
    body: "Više nećete primati marketinške emailove od KetuJemi za ovaj nalog.",
    already: "Već ste odjavljeni od marketinških emailova.",
    invalid: "Link za odjavu nije važeći.",
  },
  en: {
    title: "You are unsubscribed",
    body: "You will no longer receive announcement emails from KetuJemi for this account.",
    already: "You are already unsubscribed from announcement emails.",
    invalid: "This unsubscribe link is invalid.",
  },
  de: {
    title: "Abmeldung erfolgreich",
    body: "Sie erhalten keine Ankündigungs-E-Mails mehr von KetuJemi für dieses Konto.",
    already: "Sie sind bereits von Ankündigungs-E-Mails abgemeldet.",
    invalid: "Dieser Abmeldelink ist ungültig.",
  },
  it: {
    title: "Iscrizione annullata",
    body: "Non riceverai più email di annunci da KetuJemi per questo account.",
    already: "Sei già disiscritto dalle email di annunci.",
    invalid: "Questo link di disiscrizione non è valido.",
  },
  fr: {
    title: "Désabonnement confirmé",
    body: "Vous ne recevrez plus d'e-mails d'annonces de KetuJemi pour ce compte.",
    already: "Vous êtes déjà désabonné des e-mails d'annonces.",
    invalid: "Ce lien de désabonnement est invalide.",
  },
};

export function announcementEmailShell(locale: AnnouncementLocale): AnnouncementEmailShell {
  return SHELL[locale] ?? SHELL.sq;
}

export function unsubscribePageCopy(locale: AnnouncementLocale): UnsubscribePageCopy {
  return UNSUB_PAGE[locale] ?? UNSUB_PAGE.sq;
}

/** Map Accept-Language / query hint to announcement locale. */
export function parseAnnouncementLocale(raw: string | null | undefined): AnnouncementLocale {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.startsWith("mk")) return "mk";
  if (v.startsWith("me") || v.startsWith("mne")) return "me";
  if (v.startsWith("en")) return "en";
  if (v.startsWith("de")) return "de";
  if (v.startsWith("it")) return "it";
  if (v.startsWith("fr")) return "fr";
  if (v.startsWith("sq") || v.startsWith("al") || v.startsWith("ks")) return "sq";
  return "sq";
}

export function announcementLocaleFromPhoneDigits(
  digits: string | null | undefined,
): AnnouncementLocale {
  if (!digits) return "sq";
  if (digits.startsWith("389")) return "mk";
  if (digits.startsWith("382")) return "me";
  return "sq";
}

import type { UiLang } from "./claude-client";

export type ReminderKind = "3d" | "1d";

type ReminderCopy = {
  subject: string;
  greeting: string;
  body: (title: string, daysLabel: string, listingUrl: string) => string;
  cta: string;
  footer: string;
};

const COPY: Record<UiLang, Record<ReminderKind, ReminderCopy>> = {
  sq: {
    "3d": {
      subject: "Njoftimi juaj skadon së shpejti — KetuJemi",
      greeting: "Përshëndetje,",
      body: (title, days, url) =>
        `Njoftimi juaj "${title}" skadon për ${days}.\n\nPas skadimit ai hiqet automatikisht. Mund ta rifilloni me një klik nga faqja e njoftimit:\n${url}\n\nButoni: "Rifillo njoftimin" — njoftimi bëhet përsëri aktiv deri 3 muaj.`,
      cta: "Shiko njoftimin",
      footer: "KetuJemi.com — tregu juaj lokal",
    },
    "1d": {
      subject: "Njoftimi juaj skadon nesër — KetuJemi",
      greeting: "Përshëndetje,",
      body: (title, _days, url) =>
        `Njoftimi juaj "${title}" skadon nesër.\n\nNëse doni ta mbani online, rifilloni ose përditësoni tani:\n${url}`,
      cta: "Rifillo ose përditëso",
      footer: "KetuJemi.com — tregu juaj lokal",
    },
  },
  mk: {
    "3d": {
      subject: "Вашиот оглас наскоро истекува — KetuJemi",
      greeting: "Здраво,",
      body: (title, days, url) =>
        `Вашиот оглас „${title}" истекува за ${days}.\n\nПо истекувањето се брише автоматски. Можете да го обновите со еден клик:\n${url}\n\nКопче: „Обнови го огласот" — огласот повторно е активен до 3 месеци.`,
      cta: "Види го огласот",
      footer: "KetuJemi.com — вашиот локален пазар",
    },
    "1d": {
      subject: "Вашиот оглас истекува утре — KetuJemi",
      greeting: "Здраво,",
      body: (title, _days, url) =>
        `Вашиот оглас „${title}" истекува утре.\n\nАко сакате да остане онлајн, обновете или уредете сега:\n${url}`,
      cta: "Обнови или уреди",
      footer: "KetuJemi.com — вашиот локален пазар",
    },
  },
  me: {
    "3d": {
      subject: "Vaš oglas uskoro ističe — KetuJemi",
      greeting: "Zdravo,",
      body: (title, days, url) =>
        `Vaš oglas „${title}" ističe za ${days}.\n\nNakon isteka automatski se uklanja. Možete ga ponovo objaviti jednim klikom:\n${url}\n\nDugme: „Obnovi oglas" — oglas je ponovo aktivan do 3 mjeseca.`,
      cta: "Pogledaj oglas",
      footer: "KetuJemi.com — vaša lokalna tržnica",
    },
    "1d": {
      subject: "Vaš oglas ističe sutra — KetuJemi",
      greeting: "Zdravo,",
      body: (title, _days, url) =>
        `Vaš oglas „${title}" ističe sutra.\n\nAko želite da ostane online, obnovite ili uredite sada:\n${url}`,
      cta: "Obnovi ili uredi",
      footer: "KetuJemi.com — vaša lokalna tržnica",
    },
  },
  en: {
    "3d": {
      subject: "Your listing expires soon — KetuJemi",
      greeting: "Hello,",
      body: (title, days, url) =>
        `Your listing "${title}" expires in ${days}.\n\nAfter expiry it is removed automatically. You can renew it with one click:\n${url}\n\nButton: "Renew listing" — active again for up to 3 months.`,
      cta: "View listing",
      footer: "KetuJemi.com — your local marketplace",
    },
    "1d": {
      subject: "Your listing expires tomorrow — KetuJemi",
      greeting: "Hello,",
      body: (title, _days, url) =>
        `Your listing "${title}" expires tomorrow.\n\nTo keep it online, renew or update it now:\n${url}`,
      cta: "Renew or update",
      footer: "KetuJemi.com — your local marketplace",
    },
  },
};

const DAYS_LABEL: Record<UiLang, Record<ReminderKind, string>> = {
  sq: { "3d": "3 ditë", "1d": "1 ditë" },
  mk: { "3d": "3 дена", "1d": "1 ден" },
  me: { "3d": "3 dana", "1d": "1 dan" },
  en: { "3d": "3 days", "1d": "1 day" },
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildExpiryReminderEmail(params: {
  lang: UiLang;
  kind: ReminderKind;
  listingTitle: string;
  listingUrl: string;
}): { subject: string; text: string; html: string } {
  const { lang, kind, listingTitle, listingUrl } = params;
  const copy = COPY[lang][kind];
  const daysLabel = DAYS_LABEL[lang][kind];
  const text = [copy.greeting, "", copy.body(listingTitle, daysLabel, listingUrl), "", copy.footer].join(
    "\n",
  );

  const safeUrl = escapeHtml(listingUrl);
  const bodyHtml = escapeHtml(copy.body(listingTitle, daysLabel, listingUrl)).replace(/\n/g, "<br/>");

  const html = `
<p>${escapeHtml(copy.greeting)}</p>
<p>${bodyHtml}</p>
<p><a href="${safeUrl}" style="display:inline-block;padding:10px 16px;background:#1A56A0;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">${escapeHtml(copy.cta)}</a></p>
<p style="color:#666;font-size:12px">${escapeHtml(copy.footer)}</p>
`.trim();

  return { subject: copy.subject, text, html };
}

export type EngagementLocale = "ks" | "mk" | "mne" | "en";

export type EngagementEmailCopy = {
  listingFirstViewSubject: string;
  listingFirstView: (title: string) => string;
  socialFollowSubject: string;
  socialFollowText: string;
};

const COPY: Record<EngagementLocale, EngagementEmailCopy> = {
  ks: {
    listingFirstViewSubject: "Dikush e shikoi shpalljen tuaj — KetuJemi",
    listingFirstView: (title) =>
      `👀 Dikush e shikoi shpalljen tuaj për ${title} — je në rrugë të mirë!`,
    socialFollowSubject: "Shpallja juaj po tërheq vëmendjen — KetuJemi",
    socialFollowText: [
      "🔥 Shpallja juaj po tërheq vëmendjen! Na ndiqni për të na ndihmuar të promovojmë shpalljet tuaja edhe më shumë:",
      "",
      "📘 Facebook — KetuJemi.com",
      "https://www.facebook.com/KetuJemi",
      "",
      "📸 Instagram — @jemi.ketu",
      "https://www.instagram.com/jemi.ketu",
      "",
      "🎵 TikTok — @ketujemi7",
      "https://www.tiktok.com/@ketujemi7",
      "",
      "Bashkohuni me mijëra njerëz që shesin dhe blejnë çdo ditë! 💪",
    ].join("\n"),
  },
  mk: {
    listingFirstViewSubject: "Некој го погледна вашиот оглас — KetuJemi",
    listingFirstView: (title) =>
      `👀 Некој го погледна вашиот оглас за ${title} — сте на добар пат!`,
    socialFollowSubject: "Вашиот оглас привлекува внимание — KetuJemi",
    socialFollowText: [
      "🔥 Вашиот оглас привлекува внимание! Следете не за да ни помогнете да ги промовираме вашите огласи уште повеќе:",
      "",
      "📘 Facebook — KetuJemi.com",
      "https://www.facebook.com/KetuJemi",
      "",
      "📸 Instagram — @jemi.ketu",
      "https://www.instagram.com/jemi.ketu",
      "",
      "🎵 TikTok — @ketujemi7",
      "https://www.tiktok.com/@ketujemi7",
      "",
      "Придружете се на илјадници луѓе кои продаваат и купуваат секој ден! 💪",
    ].join("\n"),
  },
  mne: {
    listingFirstViewSubject: "Neko je pogledao vaš oglas — KetuJemi",
    listingFirstView: (title) =>
      `👀 Neko je pogledao vaš oglas za ${title} — na dobrom ste putu!`,
    socialFollowSubject: "Vaš oglas privlači pažnju — KetuJemi",
    socialFollowText: [
      "🔥 Vaš oglas privlači pažnju! Pratite nas da nam pomognete da promovišemo vaše oglase još više:",
      "",
      "📘 Facebook — KetuJemi.com",
      "https://www.facebook.com/KetuJemi",
      "",
      "📸 Instagram — @jemi.ketu",
      "https://www.instagram.com/jemi.ketu",
      "",
      "🎵 TikTok — @ketujemi7",
      "https://www.tiktok.com/@ketujemi7",
      "",
      "Pridružite se hiljadama ljudi koji prodaju i kupuju svaki dan! 💪",
    ].join("\n"),
  },
  en: {
    listingFirstViewSubject: "Someone viewed your listing — KetuJemi",
    listingFirstView: (title) =>
      `👀 Someone viewed your listing for ${title} — you're on the right track!`,
    socialFollowSubject: "Your listing is getting attention — KetuJemi",
    socialFollowText: [
      "🔥 Your listing is getting attention! Follow us to help us promote your listings even more:",
      "",
      "📘 Facebook — KetuJemi.com",
      "https://www.facebook.com/KetuJemi",
      "",
      "📸 Instagram — @jemi.ketu",
      "https://www.instagram.com/jemi.ketu",
      "",
      "🎵 TikTok — @ketujemi7",
      "https://www.tiktok.com/@ketujemi7",
      "",
      "Join thousands of people buying and selling every day! 💪",
    ].join("\n"),
  },
};

export function engagementEmailCopy(locale: EngagementLocale = "ks"): EngagementEmailCopy {
  return COPY[locale] ?? COPY.ks;
}

/** Default KS until per-user locale is stored on the account. */
export function defaultEngagementLocale(): EngagementLocale {
  return "ks";
}

import { translationKeyForUiLang, type UiLang } from "@/lib/ui-languages";

export type EngagementLocale = "ks" | "mk" | "mne" | "en";

export type EngagementCopy = {
  welcomeToast: (name: string) => string;
  firstListingTitle: string;
  firstListingBody: string;
  subsequentListingToast: string;
  listingFirstView: (title: string) => string;
  socialFollowTitle: string;
  socialFollowBody: string;
  socialFollowFacebook: string;
  socialFollowInstagram: string;
  socialFollowTikTok: string;
  socialFollowFooter: string;
  socialFollowOptIn: string;
  socialFollowOptOut: string;
  notificationsEmpty: string;
  notificationsTitle: string;
  firstListingOk: string;
};

const COPY: Record<EngagementLocale, EngagementCopy> = {
  ks: {
    welcomeToast: (name) =>
      `Mirë se erdhe ${name}! 🎉 Tani je pjesë e familjes KetuJemi. Posto shpalljet tuaja falas — pa limite, pa pagesa.`,
    firstListingTitle: "Urime! 🎊",
    firstListingBody:
      "Shpallja juaj është live dhe po shihet nga njerëzit tani. Ndajeni me miqtë për ta shitur edhe më shpejt!",
    subsequentListingToast:
      "Shumë mirë! Sa më shumë poston → aq më shumë njerëz të njohin. Vazhdo kështu! 💪",
    listingFirstView: (title) =>
      `👀 Dikush e shikoi shpalljen tuaj për ${title} — je në rrugë të mirë!`,
    socialFollowTitle: "🔥 Shpallja juaj po tërheq vëmendjen!",
    socialFollowBody:
      "Na ndiqni për të na ndihmuar të promovojmë shpalljet tuaja edhe më shumë:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Bashkohuni me mijëra njerëz që shesin dhe blejnë çdo ditë! 💪",
    socialFollowOptIn: "✅ Po, më njofto",
    socialFollowOptOut: "❌ Jo, faleminderit",
    notificationsEmpty: "Nuk keni njoftime të reja.",
    notificationsTitle: "Njoftimet",
    firstListingOk: "Mirë, faleminderit!",
  },
  mk: {
    welcomeToast: (name) =>
      `Добредојде ${name}! 🎉 Сега си дел од семејството KetuJemi. Објавувај огласи бесплатно — без лимити, без плаќање.`,
    firstListingTitle: "Честитки! 🎊",
    firstListingBody:
      "Вашиот оглас е live и го гледаат луѓето. Споделете го со пријателите за побрза продажба!",
    subsequentListingToast:
      "Одлично! Колку повеќе објавувате → толку повеќе луѓе ве запознаваат. Продолжете вака! 💪",
    listingFirstView: (title) =>
      `👀 Некој го погледна вашиот оглас за ${title} — сте на добар пат!`,
    socialFollowTitle: "🔥 Вашиот оглас привлекува внимание!",
    socialFollowBody:
      "Следете не за да ни помогнете да ги промовираме вашите огласи уште повеќе:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Придружете се на илјадници луѓе кои продаваат и купуваат секој ден! 💪",
    socialFollowOptIn: "✅ Да, извести ме",
    socialFollowOptOut: "❌ Не, благодарам",
    notificationsEmpty: "Немате нови известувања.",
    notificationsTitle: "Известувања",
    firstListingOk: "Во ред, благодарам!",
  },
  mne: {
    welcomeToast: (name) =>
      `Dobrodošli ${name}! 🎉 Sada ste dio porodice KetuJemi. Objavljujte oglase besplatno — bez limita, bez plaćanja.`,
    firstListingTitle: "Čestitamo! 🎊",
    firstListingBody:
      "Vaš oglas je live i ljudi ga sada vide. Podijelite ga s prijateljima da brže prodate!",
    subsequentListingToast:
      "Odlično! Što više objavljujete → više vas ljudi upoznaje. Nastavite tako! 💪",
    listingFirstView: (title) =>
      `👀 Neko je pogledao vaš oglas za ${title} — na dobrom ste putu!`,
    socialFollowTitle: "🔥 Vaš oglas privlači pažnju!",
    socialFollowBody:
      "Pratite nas da nam pomognete da promovišemo vaše oglase još više:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Pridružite se hiljadama ljudi koji prodaju i kupuju svaki dan! 💪",
    socialFollowOptIn: "✅ Da, obavijesti me",
    socialFollowOptOut: "❌ Ne, hvala",
    notificationsEmpty: "Nemate novih obavijesti.",
    notificationsTitle: "Obavijesti",
    firstListingOk: "U redu, hvala!",
  },
  en: {
    welcomeToast: (name) =>
      `Welcome ${name}! 🎉 You're now part of the KetuJemi family. Post your listings for free — no limits, no fees.`,
    firstListingTitle: "Congrats! 🎊",
    firstListingBody:
      "Your listing is live and people can see it now. Share it with friends to sell even faster!",
    subsequentListingToast:
      "Great job! The more you post → the more people discover you. Keep it up! 💪",
    listingFirstView: (title) =>
      `👀 Someone viewed your listing for ${title} — you're on the right track!`,
    socialFollowTitle: "🔥 Your listing is getting attention!",
    socialFollowBody: "Follow us to help us promote your listings even more:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Join thousands of people buying and selling every day! 💪",
    socialFollowOptIn: "✅ Yes, notify me",
    socialFollowOptOut: "❌ No, thanks",
    notificationsEmpty: "You have no new notifications.",
    notificationsTitle: "Notifications",
    firstListingOk: "OK, thanks!",
  },
};

export function engagementCopyForUiLang(uiLang: UiLang): EngagementCopy {
  return COPY[translationKeyForUiLang(uiLang)];
}

export function welcomeDisplayName(user: {
  display_name?: string | null;
  email?: string | null;
  phone_e164_digits?: string | null;
}): string {
  const name = user.display_name?.trim();
  if (name) return name;
  const email = user.email?.trim();
  if (email) return email.split("@")[0] ?? email;
  const phone = user.phone_e164_digits?.trim();
  if (phone) return `+${phone}`;
  return "shitës";
}

import { translationKeyForUiLang, type UiLang } from "@/lib/ui-languages";

export type EngagementLocale = "ks" | "mk" | "mne" | "en" | "fr" | "de" | "it";

export type EngagementCopy = {
  welcomeToast: (name: string) => string;
  firstListingTitle: string;
  firstListingBody: string;
  subsequentListingToast: string;
  listingFirstView: (title: string) => string;
  listingExcessPhotosRemoved: (title: string, removed: number, max: number) => string;
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
      "🎉 Urime! Shpallja jote është aktive tani në KëtuJemi.com dhe do të shfaqet automatikisht edhe në Facebook, Instagram dhe TikTok. Sa më shumë njerëz ta shohin, aq më shpejt shitet! 🚀",
    subsequentListingToast:
      "🎉 Urime! Shpallja jote është aktive tani në KëtuJemi.com dhe do të shfaqet automatikisht edhe në Facebook, Instagram dhe TikTok. Sa më shumë njerëz ta shohin, aq më shpejt shitet! 🚀",
    listingFirstView: (title) =>
      `👀 Dikush e shikoi shpalljen tuaj për ${title} — je në rrugë të mirë!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 U hoqën ${removed} foto nga shpallja «${title}» — limiti është ${max} foto për shpallje. Fotot e tepërta u fshinë automatikisht.`,
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
      "🎉 Честитки! Вашиот оглас е активен на KëtuJemi.com и автоматски ќе се објави на Facebook, Instagram и TikTok. Колку повеќе луѓе го видат, толку побрзо ќе се продаде! 🚀",
    subsequentListingToast:
      "🎉 Честитки! Вашиот оглас е активен на KëtuJemi.com и автоматски ќе се објави на Facebook, Instagram и TikTok. Колку повеќе луѓе го видат, толку побрзо ќе се продаде! 🚀",
    listingFirstView: (title) =>
      `👀 Некој го погледна вашиот оглас за ${title} — сте на добар пат!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 Отстранети се ${removed} фотографии од огласот «${title}» — лимитот е ${max} фотографии по оглас. Вишокот е автоматски избришан.`,
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
      "🎉 Čestitamo! Vaš oglas je aktivan na KëtuJemi.com i automatski će se objaviti na Facebooku, Instagramu i TikToku. Što više ljudi ga vidi, brže će se prodati! 🚀",
    subsequentListingToast:
      "🎉 Čestitamo! Vaš oglas je aktivan na KëtuJemi.com i automatski će se objaviti na Facebooku, Instagramu i TikToku. Što više ljudi ga vidi, brže će se prodati! 🚀",
    listingFirstView: (title) =>
      `👀 Neko je pogledao vaš oglas za ${title} — na dobrom ste putu!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 Uklonjeno je ${removed} fotografija sa oglasa «${title}» — limit je ${max} fotografija po oglasu. Višak je automatski obrisan.`,
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
      "🎉 Congrats! Your listing is live on KëtuJemi.com and will be shared automatically on Facebook, Instagram, and TikTok. The more people see it, the faster it sells! 🚀",
    subsequentListingToast:
      "🎉 Congrats! Your listing is live on KëtuJemi.com and will be shared automatically on Facebook, Instagram, and TikTok. The more people see it, the faster it sells! 🚀",
    listingFirstView: (title) =>
      `👀 Someone viewed your listing for ${title} — you're on the right track!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 ${removed} photos were removed from listing «${title}» — the limit is ${max} photos per listing. Extra photos were deleted automatically.`,
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
  fr: {
    welcomeToast: (name) =>
      `Bienvenue ${name} ! 🎉 Vous faites maintenant partie de la famille KetuJemi. Publiez vos annonces gratuitement — sans limite, sans frais.`,
    firstListingTitle: "Félicitations ! 🎊",
    firstListingBody:
      "🎉 Félicitations ! Votre annonce est en ligne sur KëtuJemi.com et sera partagée automatiquement sur Facebook, Instagram et TikTok. Plus elle est vue, plus vite elle se vend ! 🚀",
    subsequentListingToast:
      "🎉 Félicitations ! Votre annonce est en ligne sur KëtuJemi.com et sera partagée automatiquement sur Facebook, Instagram et TikTok. Plus elle est vue, plus vite elle se vend ! 🚀",
    listingFirstView: (title) =>
      `👀 Quelqu'un a consulté votre annonce pour ${title} — vous êtes sur la bonne voie !`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 ${removed} photos ont été retirées de l'annonce « ${title} » — la limite est de ${max} photos par annonce. Les photos en trop ont été supprimées automatiquement.`,
    socialFollowTitle: "🔥 Votre annonce attire l'attention !",
    socialFollowBody: "Suivez-nous pour nous aider à promouvoir encore plus vos annonces :",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Rejoignez des milliers de personnes qui achètent et vendent chaque jour ! 💪",
    socialFollowOptIn: "✅ Oui, me notifier",
    socialFollowOptOut: "❌ Non, merci",
    notificationsEmpty: "Vous n'avez pas de nouvelles notifications.",
    notificationsTitle: "Notifications",
    firstListingOk: "D'accord, merci !",
  },
  de: {
    welcomeToast: (name) =>
      `Willkommen ${name}! 🎉 Du bist jetzt Teil der KetuJemi-Familie. Veröffentliche deine Anzeigen kostenlos — ohne Limits, ohne Gebühren.`,
    firstListingTitle: "Glückwunsch! 🎊",
    firstListingBody:
      "🎉 Glückwunsch! Deine Anzeige ist live auf KëtuJemi.com und wird automatisch auf Facebook, Instagram und TikTok geteilt. Je mehr Menschen sie sehen, desto schneller verkauft sie sich! 🚀",
    subsequentListingToast:
      "🎉 Glückwunsch! Deine Anzeige ist live auf KëtuJemi.com und wird automatisch auf Facebook, Instagram und TikTok geteilt. Je mehr Menschen sie sehen, desto schneller verkauft sie sich! 🚀",
    listingFirstView: (title) =>
      `👀 Jemand hat deine Anzeige für ${title} angesehen — du bist auf dem richtigen Weg!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 ${removed} Fotos wurden aus der Anzeige «${title}» entfernt — das Limit ist ${max} Fotos pro Anzeige. Überzählige Fotos wurden automatisch gelöscht.`,
    socialFollowTitle: "🔥 Deine Anzeige zieht Aufmerksamkeit auf sich!",
    socialFollowBody: "Folge uns, damit wir deine Anzeigen noch besser promoten können:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Schließe dich Tausenden von Menschen an, die jeden Tag kaufen und verkaufen! 💪",
    socialFollowOptIn: "✅ Ja, benachrichtige mich",
    socialFollowOptOut: "❌ Nein, danke",
    notificationsEmpty: "Du hast keine neuen Benachrichtigungen.",
    notificationsTitle: "Benachrichtigungen",
    firstListingOk: "OK, danke!",
  },
  it: {
    welcomeToast: (name) =>
      `Benvenuto ${name}! 🎉 Ora fai parte della famiglia KetuJemi. Pubblica i tuoi annunci gratis — senza limiti, senza costi.`,
    firstListingTitle: "Congratulazioni! 🎊",
    firstListingBody:
      "🎉 Congratulazioni! Il tuo annuncio è online su KëtuJemi.com e verrà condiviso automaticamente su Facebook, Instagram e TikTok. Più persone lo vedono, più velocemente si vende! 🚀",
    subsequentListingToast:
      "🎉 Congratulazioni! Il tuo annuncio è online su KëtuJemi.com e verrà condiviso automaticamente su Facebook, Instagram e TikTok. Più persone lo vedono, più velocemente si vende! 🚀",
    listingFirstView: (title) =>
      `👀 Qualcuno ha visto il tuo annuncio per ${title} — sei sulla strada giusta!`,
    listingExcessPhotosRemoved: (title, removed, max) =>
      `📷 ${removed} foto sono state rimosse dall'annuncio «${title}» — il limite è ${max} foto per annuncio. Le foto in eccesso sono state eliminate automaticamente.`,
    socialFollowTitle: "🔥 Il tuo annuncio sta attirando attenzione!",
    socialFollowBody: "Seguici per aiutarci a promuovere ancora di più i tuoi annunci:",
    socialFollowFacebook: "📘 Facebook — KetuJemi.com",
    socialFollowInstagram: "📸 Instagram — @jemi.ketu",
    socialFollowTikTok: "🎵 TikTok — @ketujemi7",
    socialFollowFooter:
      "Unisciti a migliaia di persone che comprano e vendono ogni giorno! 💪",
    socialFollowOptIn: "✅ Sì, avvisami",
    socialFollowOptOut: "❌ No, grazie",
    notificationsEmpty: "Non hai nuove notifiche.",
    notificationsTitle: "Notifiche",
    firstListingOk: "OK, grazie!",
  },
};

export function engagementCopyForUiLang(uiLang: UiLang): EngagementCopy {
  return COPY[translationKeyForUiLang(uiLang)] ?? COPY.ks;
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

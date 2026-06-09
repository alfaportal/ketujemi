import { useMarket } from "@/lib/market-context";
import { translationKeyForUiLang, type UiTranslationLocale } from "@/lib/ui-languages";

export type PartnerBenefit = { icon: string; title: string; desc: string };

export type PartnerPageCopy = {
  docTitle: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  benefitsTitle: string;
  benefits: PartnerBenefit[];
  formTitle: string;
  formSubtitle: string;
  labelBusinessName: string;
  labelContactName: string;
  labelEmail: string;
  labelPhone: string;
  labelPackage: string;
  packagePlaceholder: string;
  packageStandard: string;
  packageVip: string;
  labelLogo: string;
  uploadLogo: string;
  logoHint: string;
  labelDescription: string;
  descriptionPlaceholder: string;
  submitButton: string;
  errRequired: string;
  errLogoInvalid: string;
  errLogoTooLarge: string;
  errSubmitFailed: string;
  errServer: string;
  successTitle: string;
  successMessage: string;
  successHome: string;
  landingCta: string;
  landingCtaHint: string;
  applicationIntro: string;
};

const SQ: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "PROGRAMI PARTNER",
  heroTitle: "Rrit Biznesin Tënd me KetuJemi.com",
  heroSubtitle: "Mbi 50,000 klientë të mundshëm çdo muaj",
  benefitsTitle: "PËRFITIMET TUAJA",
  benefits: [
    {
      icon: "📈",
      title: "Dukshmëri maksimale",
      desc: "shpallje të featured në krye të rezultateve",
    },
    { icon: "👥", title: "50,000+ vizitorë aktivë", desc: "çdo muaj në platformë" },
    { icon: "🎯", title: "Targetim sipas kategorisë", desc: "dhe lokacionit" },
    { icon: "🗂️", title: "Panel i dedikuar biznesi", desc: "menaxho gjithçka nga një vend" },
    {
      icon: "⭐",
      title: 'Badge "Partner i Verifikuar"',
      desc: "besueshmëri e shtuar tek blerësit",
    },
    {
      icon: "📊",
      title: "Statistika të detajuara",
      desc: "shiko sa njerëz shohin njoftimet tua",
    },
    {
      icon: "🚀",
      title: "Prioritet në rezultatet e kërkimit",
      desc: "del para konkurrentëve",
    },
  ],
  formTitle: "FORMULARI I APLIKIMIT",
  formSubtitle: "Plotësoni të dhënat — ekipi ynë do t'ju kontaktojë pas shqyrtimit.",
  labelBusinessName: "Emri i Biznesit",
  labelContactName: "Emri i Kontaktit",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paketa",
  packagePlaceholder: "Zgjidhni paketën",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Logo e biznesit",
  uploadLogo: "Ngarko logo",
  logoHint: "JPEG, PNG, WebP — max 5 MB (fakultativ)",
  labelDescription: "Përshkrim i shkurtër i biznesit",
  descriptionPlaceholder: "P.sh. çfarë shisni, ku operoni, pse dëshironi të bëheni partner...",
  submitButton: "Dërgo aplikimin",
  errRequired: "Plotësoni të gjitha fushat e detyrueshme.",
  errLogoInvalid: "Zgjidhni një skedar imazhi të vlefshëm.",
  errLogoTooLarge: "Logo duhet të jetë më pak se 5 MB.",
  errSubmitFailed: "Dërgimi i aplikimit dështoi.",
  errServer: "Lidhja me serverin dështoi. Provoni përsëri.",
  successTitle: "Faleminderit!",
  successMessage: "Kërkesa juaj u dërgua me sukses! Do t'ju kontaktojmë së shpejti.",
  successHome: "Kthehu në faqen kryesore",
  landingCta: "Apliko si Partner",
  landingCtaHint: "Plotësoni formularin më poshtë — pa pagesë online.",
  applicationIntro: `🤝 Bëhu VIP Partner i KetuJemi

Partneriteti me KetuJemi është bashkëpunim i ndërsjelltë — ju na ndihmoni neve, ne ju bëjmë të famshëm.

Çfarë merrni ju:
- Logo juaj në faqen kryesore të ketujemi.com — e parë nga mijëra vizitorë çdo ditë
- Shpalljet dhe ofertat tuaja të publikuara çdo ditë në Instagram @jemi.ketu, Facebook KetuJemi.com dhe TikTok @ketujemi7
- Profil i dedikuar me adresë, hartë dhe të gjitha kontaktet tuaja
- Promovim i vazhdueshëm — njerëzit mësojnë për biznesin tuaj çdo ditë
- Rritje e ndjekësve dhe klientëve tuaj — falas

Çfarë kërkojmë nga ju:
- Të na ndiqni në Instagram @jemi.ketu, Facebook KetuJemi.com dhe TikTok @ketujemi7
- Të na përmendni te ndjekësit tuaj herë pas here

📢 Si funksionon promovimi:
Ne i publikojmë dhe promovojmë shpalljet tuaja çdo ditë në rrjetet tona sociale — por vetëm nëse keni shpallje aktive në ketujemi.com. Një faqe bosh nuk kemi çfarë ta promovojmë — postoni produktet dhe ofertat tuaja, ne i çojmë te audienca. Sa më shumë postoni → aq më shumë ju promovojmë → aq më shumë klientë dhe shitje keni. 🚀

💡 Një detaj i vogël, por i rëndësishëm:
Bashkëpunimi ynë është si kafja — funksionon vetëm kur të dyja palët e hedhin sheqerin. 😄 Ne ju promovojmë çdo ditë te ndjekësit tanë — por edhe ju duhet të na ndiqni në rrjetet tona sociale. Shkurt: na ndiqni → ju bëjmë të njohur. Nuk na ndiqni → humbim të dyja palët. 🤝

Plotësoni formularin dhe ne ju kontaktojmë brenda 24 orëve. 📩`,
};

const MK: PartnerPageCopy = {
  docTitle: "Партнер — KetuJemi.com",
  heroBadge: "Партнерска програма",
  heroTitle: "Растете го вашиот бизнис со KetuJemi.com",
  heroSubtitle: "Над 50.000 потенцијални клиенти секој месец",
  benefitsTitle: "Вашите придобивки",
  benefits: [
    { icon: "📈", title: "Максимална видливост", desc: "истакнати огласи на врв" },
    { icon: "👥", title: "50.000+ активни посетители", desc: "секој месец" },
    { icon: "🎯", title: "Таргетирање по категорија", desc: "и локација" },
    { icon: "📱", title: "Посебен бизнис панел", desc: "" },
    { icon: "⭐", title: 'Значка „Верификуван партнер"', desc: "" },
    { icon: "📊", title: "Детална статистика", desc: "" },
    { icon: "🚀", title: "Приоритет во резултатите", desc: "" },
  ],
  formTitle: "Формулар за апликација",
  formSubtitle: "Пополнете ги податоците — ќе ве контактираме по преглед.",
  labelBusinessName: "Име на бизнис",
  labelContactName: "Контакт лице",
  labelEmail: "Email",
  labelPhone: "Телефон",
  labelPackage: "Пакет",
  packagePlaceholder: "Изберете пакет",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Лого на бизнисот",
  uploadLogo: "Прикачи лого",
  logoHint: "JPEG, PNG, WebP — макс. 5 MB (опционално)",
  labelDescription: "Краток опис на бизнисот",
  descriptionPlaceholder: "На пр. што продавате, каде работите...",
  submitButton: "Испрати апликација",
  errRequired: "Пополнете ги сите задолжителни полиња.",
  errLogoInvalid: "Изберете валидна слика.",
  errLogoTooLarge: "Логото мора да биде помало од 5 MB.",
  errSubmitFailed: "Испраќањето на апликацијата не успеа.",
  errServer: "Врската со серверот не успеа. Обидете се повторно.",
  successTitle: "Ви благодариме!",
  successMessage: "Вашето барање е успешно испратено! Ќе ве контактираме наскоро.",
  successHome: "Назад на почетна",
  landingCta: "Аплицирај како партнер",
  landingCtaHint: "Пополнете го формуларот подолу — без онлајн плаќање.",
  applicationIntro: `🤝 Станете VIP партнер на KetuJemi

Партнерството со KetuJemi е взаемна соработка — вие ни помагате, ние ве правиме познати.

Што добивате:
- Вашето лого на почетната страница ketujemi.com — видливо од илјадници посетители секој ден
- Вашите огласи и понуди секој ден на Instagram @jemi.ketu, Facebook KetuJemi.com и TikTok @ketujemi7
- Посебен профил со адреса, мапа и сите ваши контакти
- Континуирана промоција — луѓето секој ден дознаваат за вашиот бизнис
- Раст на следбеници и клиенти — бесплатно

Што бараме од вас:
- Следете не на Instagram @jemi.ketu, Facebook KetuJemi.com и TikTok @ketujemi7
- Повремено споменете не кај вашите следбеници

📢 Како функционира промоцијата:
Ги објавуваме и промовираме вашите огласи секој ден на нашите социјални мрежи — но само ако имате активни огласи на ketujemi.com. Празна страница нема што да се промовира — објавете ги вашите производи и понуди, ние ги доставуваме до публиката. Колку повеќе објавувате → толку повеќе ве промовираме → толку повеќе клиенти и продажби имате. 🚀

💡 Мала, но важна детал:
Соработката е како кафе — функционира само кога двете страни ја ставаат шеќерот. 😄 Ние ве промовираме секој ден — но и вие треба да не следите. Кратко: следете не → станувате познати. Не следите → губиме и двете страни. 🤝

Пополнете го формуларот и ќе ве контактираме во рок од 24 часа. 📩`,
};

const MNE: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "Partnerski program",
  heroTitle: "Rastite svoj biznis sa KetuJemi.com",
  heroSubtitle: "Preko 50.000 potencijalnih klijenata mjesečno",
  benefitsTitle: "Vaše pogodnosti",
  benefits: [
    { icon: "📈", title: "Maksimalna vidljivost", desc: "istaknuti oglasi na vrhu" },
    { icon: "👥", title: "50.000+ aktivnih posjetilaca", desc: "svaki mjesec" },
    { icon: "🎯", title: "Targetiranje po kategoriji", desc: "i lokaciji" },
    { icon: "📱", title: "Posvećeni biznis panel", desc: "" },
    { icon: "⭐", title: 'Bedž „Verifikovani partner"', desc: "" },
    { icon: "📊", title: "Detaljna statistika", desc: "" },
    { icon: "🚀", title: "Prioritet u rezultatima pretrage", desc: "" },
  ],
  formTitle: "Formular za prijavu",
  formSubtitle: "Popunite podatke — kontaktiraćemo vas nakon pregleda.",
  labelBusinessName: "Naziv biznisa",
  labelContactName: "Kontakt osoba",
  labelEmail: "Email",
  labelPhone: "Telefon",
  labelPackage: "Paket",
  packagePlaceholder: "Izaberite paket",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Logo biznisa",
  uploadLogo: "Upload loga",
  logoHint: "JPEG, PNG, WebP — max 5 MB (opciono)",
  labelDescription: "Kratak opis biznisa",
  descriptionPlaceholder: "Npr. šta prodajete, gdje poslujete...",
  submitButton: "Pošalji prijavu",
  errRequired: "Popunite sva obavezna polja.",
  errLogoInvalid: "Izaberite važeću sliku.",
  errLogoTooLarge: "Logo mora biti manji od 5 MB.",
  errSubmitFailed: "Slanje prijave nije uspjelo.",
  errServer: "Veza sa serverom nije uspjela. Pokušajte ponovo.",
  successTitle: "Hvala!",
  successMessage: "Vaš zahtjev je uspješno poslan! Kontaktiraćemo vas uskoro.",
  successHome: "Nazad na početnu",
  landingCta: "Prijavi se kao partner",
  landingCtaHint: "Popunite formular ispod — bez online plaćanja.",
  applicationIntro: `🤝 Postanite VIP partner KetuJemi

Partnerstvo sa KetuJemi je uzajamna saradnja — vi nam pomažete, mi vas činimo poznatima.

Šta dobijate:
- Vaš logo na početnoj stranici ketujemi.com — viđen od hiljada posjetilaca svaki dan
- Vaši oglasi i ponude svaki dan na Instagram @jemi.ketu, Facebook KetuJemi.com i TikTok @ketujemi7
- Posvećeni profil sa adresom, mapom i svim kontaktima
- Kontinuirana promocija — ljudi svaki dan saznaju za vaš biznis
- Rast pratilaca i klijenata — besplatno

Šta tražimo od vas:
- Da nas pratite na Instagram @jemi.ketu, Facebook KetuJemi.com i TikTok @ketujemi7
- Povremeno da nas spomenete svojim pratiocima

📢 Kako funkcioniše promocija:
Objavljujemo i promovišemo vaše oglase svaki dan na našim društvenim mrežama — ali samo ako imate aktivne oglase na ketujemi.com. Prazna stranica nema šta da se promoviše — objavite svoje proizvode i ponude, mi ih prenosimo publici. Što više objavljujete → više vas promovišemo → više klijenata i prodaje imate. 🚀

💡 Mali, ali važan detalj:
Saradnja je kao kafa — funkcioniše samo kad obje strane stave šećer. 😄 Mi vas promovišemo svaki dan — ali i vi nas morate pratiti. Ukratko: pratite nas → postajete poznati. Ne pratite → gubimo oboje. 🤝

Popunite formular i kontaktiraćemo vas u roku od 24 sata. 📩`,
};

const EN: PartnerPageCopy = {
  docTitle: "Partner — KetuJemi.com",
  heroBadge: "Partner program",
  heroTitle: "Grow your business with KetuJemi.com",
  heroSubtitle: "50,000+ potential customers every month",
  benefitsTitle: "Your benefits",
  benefits: [
    { icon: "📈", title: "Maximum visibility", desc: "featured listings at the top" },
    { icon: "👥", title: "50,000+ active visitors", desc: "every month" },
    { icon: "🎯", title: "Category targeting", desc: "and location" },
    { icon: "📱", title: "Dedicated business panel", desc: "" },
    { icon: "⭐", title: '"Verified Partner" badge', desc: "" },
    { icon: "📊", title: "Detailed statistics", desc: "" },
    { icon: "🚀", title: "Priority in search results", desc: "" },
  ],
  formTitle: "Application form",
  formSubtitle: "Fill in your details — our team will contact you after review.",
  labelBusinessName: "Business name",
  labelContactName: "Contact person",
  labelEmail: "Email",
  labelPhone: "Phone",
  labelPackage: "Package",
  packagePlaceholder: "Choose package",
  packageStandard: "Partner",
  packageVip: "VIP Partner",
  labelLogo: "Business logo",
  uploadLogo: "Upload logo",
  logoHint: "JPEG, PNG, WebP — max 5 MB (optional)",
  labelDescription: "Short business description",
  descriptionPlaceholder: "E.g. what you sell, where you operate, why you want to partner...",
  submitButton: "Submit application",
  errRequired: "Please fill in all required fields.",
  errLogoInvalid: "Please choose a valid image file.",
  errLogoTooLarge: "Logo must be smaller than 5 MB.",
  errSubmitFailed: "Application submission failed.",
  errServer: "Could not reach the server. Please try again.",
  successTitle: "Thank you!",
  successMessage: "Your request was sent successfully! We will contact you soon.",
  successHome: "Back to home",
  landingCta: "Apply as partner",
  landingCtaHint: "Complete the form below — no online payment.",
  applicationIntro: `🤝 Become a KetuJemi VIP Partner

Partnering with KetuJemi is mutual cooperation — you help us, we make you visible.

What you get:
- Your logo on the ketujemi.com homepage — seen by thousands of visitors every day
- Your listings and offers posted daily on Instagram @jemi.ketu, Facebook KetuJemi.com and TikTok @ketujemi7
- A dedicated profile with address, map and all your contacts
- Ongoing promotion — people learn about your business every day
- Growth in followers and customers — free

What we ask from you:
- Follow us on Instagram @jemi.ketu, Facebook KetuJemi.com and TikTok @ketujemi7
- Mention us to your followers from time to time

📢 How promotion works:
We publish and promote your listings every day on our social channels — but only if you have active listings on ketujemi.com. An empty page has nothing to promote — post your products and offers, and we bring them to our audience. The more you post → the more we promote you → the more customers and sales you get. 🚀

💡 A small but important detail:
Our cooperation is like coffee — it only works when both sides add sugar. 😄 We promote you daily — but you should follow us too. In short: follow us → we make you known. Don't follow → we both lose. 🤝

Fill in the form and we will contact you within 24 hours. 📩`,
};

const FR: PartnerPageCopy = {
  docTitle: "Partenaire — KetuJemi.com",
  heroBadge: "Programme partenaire",
  heroTitle: "Développez votre activité avec KetuJemi.com",
  heroSubtitle: "Plus de 50 000 clients potentiels chaque mois",
  benefitsTitle: "Vos avantages",
  benefits: [
    { icon: "📈", title: "Visibilité maximale", desc: "annonces mises en avant en tête de liste" },
    { icon: "👥", title: "Plus de 50 000 visiteurs actifs", desc: "chaque mois" },
    { icon: "🎯", title: "Ciblage par catégorie", desc: "et localisation" },
    { icon: "📱", title: "Panneau professionnel dédié", desc: "" },
    { icon: "⭐", title: '"Verified Partner" badge', desc: "" },
    { icon: "📊", title: "Statistiques détaillées", desc: "" },
    { icon: "🚀", title: "Priorité dans les résultats de recherche", desc: "" },
  ],
  formTitle: "Formulaire de candidature",
  formSubtitle: "Renseignez vos coordonnées — notre équipe vous contactera après examen.",
  labelBusinessName: "Nom de l'entreprise",
  labelContactName: "Personne de contact",
  labelEmail: "Email",
  labelPhone: "Téléphone",
  labelPackage: "Forfait",
  packagePlaceholder: "Choisir le forfait",
  packageStandard: "Partenaire",
  packageVip: "Partenaire VIP",
  labelLogo: "Logo de l'entreprise",
  uploadLogo: "Téléverser le logo",
  logoHint: "JPEG, PNG, WebP — max. 5 Mo (facultatif)",
  labelDescription: "Brève description de l'activité",
  descriptionPlaceholder: "Ex. ce que vous vendez, où vous opérez, pourquoi vous souhaitez devenir partenaire…",
  submitButton: "Envoyer la candidature",
  errRequired: "Veuillez remplir tous les champs obligatoires.",
  errLogoInvalid: "Veuillez choisir un fichier image valide.",
  errLogoTooLarge: "Le logo doit faire moins de 5 Mo.",
  errSubmitFailed: "L'envoi de la candidature a échoué.",
  errServer: "Impossible de joindre le serveur. Veuillez réessayer.",
  successTitle: "Merci !",
  successMessage: "Votre demande a été envoyée avec succès ! Nous vous contacterons bientôt.",
  successHome: "Retour à l'accueil",
  landingCta: "Devenir partenaire",
  landingCtaHint: "Remplissez le formulaire ci-dessous — sans paiement en ligne.",
  applicationIntro: `🤝 Devenir partenaire VIP KetuJemi

Le partenariat avec KetuJemi est une coopération mutuelle — vous nous aidez, nous vous rendons visible.

Ce que vous obtenez :
- Votre logo sur la page d'accueil ketujemi.com — vu par des milliers de visiteurs chaque jour
- Vos annonces et offres publiées chaque jour sur Instagram @jemi.ketu, Facebook KetuJemi.com et TikTok @ketujemi7
- Un profil dédié avec adresse, carte et toutes vos coordonnées
- Promotion continue — les gens découvrent votre activité chaque jour
- Croissance de vos abonnés et clients — gratuitement

Ce que nous vous demandons :
- Suivez-nous sur Instagram @jemi.ketu, Facebook KetuJemi.com et TikTok @ketujemi7
- Mentionnez-nous auprès de vos abonnés de temps en temps

📢 Comment fonctionne la promotion :
Nous publions et promouvons vos annonces chaque jour sur nos réseaux — mais seulement si vous avez des annonces actives sur ketujemi.com. Une page vide n'a rien à promouvoir — publiez vos produits et offres, nous les diffusons au public. Plus vous publiez → plus nous vous promouvons → plus de clients et de ventes. 🚀

💡 Un petit détail important :
Notre coopération est comme le café — elle ne fonctionne que si les deux côtés ajoutent du sucre. 😄 Nous vous promouvons chaque jour — mais vous devez aussi nous suivre. En bref : suivez-nous → nous vous rendons visible. Ne nous suivez pas → nous perdons tous les deux. 🤝

Remplissez le formulaire et nous vous contacterons sous 24 heures. 📩`,
};

const BY_LOCALE: Record<PartnerPageLocaleKey, PartnerPageCopy> = {
  ks: SQ,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

type PartnerPageLocaleKey = UiTranslationLocale;

export function partnerPageForLocale(locale: PartnerPageLocaleKey): PartnerPageCopy {
  return BY_LOCALE[locale];
}

export function usePartnerPage(): PartnerPageCopy {
  const { uiLang } = useMarket();
  return partnerPageForLocale(translationKeyForUiLang(uiLang));
}

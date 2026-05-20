import type { UiLang } from "./claude-client";
import type { ChatMessage } from "./support-chatbot";
import { isMarketplaceBrowseQuestion } from "./support-chat-screening";

const ESCALATE: Record<UiLang, string> = {
  sq: "Për këtë pyetje nuk kam informacion të mjaftueshëm. Shkruani te info.info@ketujemi.com dhe ekipi do t'ju përgjigjet.",
  mk: "За ова прашање немам доволно информации. Пишете на info.info@ketujemi.com и тимот ќе ви одговори.",
  me: "Za ovo pitanje nemam dovoljno informacija. Pišite na info.info@ketujemi.com i tim će vam odgovoriti.",
};

type FaqEntry = { keywords: RegExp; reply: Record<UiLang, string> };

const FAQ: FaqEntry[] = [
  {
    keywords:
      /posto|postim|si\s+(te|të)\s+post|si\s+postoj|how\s+to\s+post|објав|objav|kako\s+da\s+post/i,
    reply: {
      sq: "Për të postuar: regjistrohuni, verifikoni email-in dhe SMS-in, klikoni «Posto Falas», plotësoni titullin, përshkrimin, fotot (min. 3 rekomandohen) dhe çmimin, pastaj publikoni. Njoftimi qëndron aktiv 30 ditë.",
      mk: "За објава: регистрирајте се, верификувајте email и SMS, кликнете «Posto Falas», пополнете наслов, опис, фотографии и цена, па објавете. Огласот е активен 30 дена.",
      me: "Za objavu: registrujte se, verifikujte email i SMS, kliknite «Posto Falas», popunite naslov, opis, fotografije i cijenu, pa objavite. Oglas je aktivan 30 dana.",
    },
  },
  {
    keywords: /skad|expir|истеч|istič|30\s*dit|30\s*den|muaj|month|sa\s+koh/i,
    reply: {
      sq: "Çdo njoftim qëndron aktiv 30 ditë (1 muaj), pastaj skadon. Para skadimit mund të merrni email rikujtues (nëse email-i i llogarisë është i verifikuar). Pas skadimit përdorni «Rifillo njoftimin».",
      mk: "Секој оглас е активен 30 дена, потоа истекува. Пред истек може да добиете email потсетник. По истекување користете «Обнови го огласот».",
      me: "Svaki oglas je aktivan 30 dana, zatim ističe. Prije isteka možete dobiti email podsjetnik. Nakon isteka koristite «Obnovi oglas».",
    },
  },
  {
    keywords: /rifill|repost|obnov|обнов|ripost/i,
    reply: {
      sq: "Kur njoftimi skadon, hyni te njoftimi juaj dhe klikoni «Rifillo njoftimin». I njëjti njoftim bëhet përsëri aktiv për 30 ditë të tjera.",
      mk: "Кога огласот истече, отворете го и кликнете «Обнови го огласот». Истиот оглас повторно е активен 30 дена.",
      me: "Kada oglas ističe, otvorite ga i kliknite «Obnovi oglas». Isti oglas je ponovo aktivan 30 dana.",
    },
  },
  {
    keywords: /fshij|fshi|delete|избриш|obriši|remove/i,
    reply: {
      sq: "Për ta fshirë: hyni te njoftimi juaj (duhet të jeni të kyçur), klikoni «Fshi» dhe konfirmoni. Njoftimet e skaduara gjithashtu mund të fshihen.",
      mk: "За бришење: отворете го огласот (најавени), кликнете «Избриши» и потврдете.",
      me: "Za brisanje: otvorite oglas (prijavljeni), kliknite «Obriši» i potvrdite.",
    },
  },
  {
    keywords: /top|në\s+krye|krye\s+list|featured/i,
    reply: {
      sq: "TOP (kur është aktiv në faqe): €1 për blerje. Herën e 1-të +7 ditë lart, 2-të +5 ditë, 3-të +3 ditë, pastaj +1 ditë. Njoftimet TOP shfaqen gjithmonë mbi ato normale.",
      mk: "TOP: €1. Прв пат +7 дена горе, втори +5, трети +3, потоа +1. TOP огласите се секогаш над обичните.",
      me: "TOP: €1. Prvi put +7 dana gore, drugi +5, treći +3, zatim +1. TOP oglasi su uvijek iznad običnih.",
    },
  },
  {
    keywords: /biznes|business|vip|standard|10\s+njoft|10\s+oglas/i,
    reply: {
      sq: "Llogari biznesi Standard: 10 njoftime falas për kategori, pastaj €1 për çdo postim shtesë në atë kategori. VIP Biznes: €20/muaj — postime të pakufizuara.",
      mk: "Бизнис Standard: 10 бесплатни огласи по категорија, потоа €1 по дополнителен. VIP: €20/месечно — неограничено.",
      me: "Biznis Standard: 10 besplatnih oglasa po kategoriji, zatim €1 po dodatnom. VIP: €20/mjesečno — neograničeno.",
    },
  },
  {
    keywords: /verifik|sms|email|kod|confirm/i,
    reply: {
      sq: "Pas regjistrimit verifikoni email-in (link ose kod) ose numrin me SMS (+383, +355, +389, +382 — max 3 SMS/ditë për numër). Diaspora: regjistrim me email.",
      mk: "По регистрација верификувајте email и телефон со SMS. Без тоа објавувањето може да не работи целосно.",
      me: "Nakon registracije verifikujte email i telefon SMS-om. Bez toga objava možda neće raditi u potpunosti.",
    },
  },
  {
    keywords: /duplikat|dy\s+her|twice|iste\s+njoft/i,
    reply: {
      sq: "Nuk lejohet të ripostoni të njëjtin titull dhe përshkrim si një njoftim tjetër aktiv. Ndryshoni përshkrimin ose titullin, ose fshini njoftimin tjetër.",
      mk: "Не е дозволено два исти активни огласи. Избришете го стариот пред нов објава.",
      me: "Nije dozvoljeno dva ista aktivna oglasa. Obrišite stari prije novog.",
    },
  },
  {
    keywords: /ndal|prohib|zabran|forbid|armë|drog|alkool|duhan/i,
    reply: {
      sq: "E ndaluar: armë, droga, alkool, duhan, cigare elektronike, replika/fake, skema piramidale (MLM), reklama erotike, crypto/lojëra fati. Moderimi AI kontrollon para publikimit.",
      mk: "Забрането: оружје, дроги, алкохол, цигари, реплики, MLM, еротика, crypto. AI модерација пред објава.",
      me: "Zabranjeno: oružje, droge, alkohol, duhan, replike, MLM, erotika, crypto. AI moderacija prije objave.",
    },
  },
  {
    keywords: /10\s+njoft|maks|limit|limiti/i,
    reply: {
      sq: "Maksimumi është 10 njoftime aktive njëkohësisht për përdorues. Fshini ose prisni skadimin e njërit për të postuar tjetrin.",
      mk: "Максимум 10 активни огласи истовремено. Избришете или почекајте истек.",
      me: "Maksimum 10 aktivnih oglasa odjednom. Obrišite ili sačekajte istek.",
    },
  },
  {
    keywords:
      /ku\s+(mund|e\s+gjej|ta\s+gjej)|si\s+(mund|ta\s+gjej|gjen)|a\s+mund\s+ta\s+gjej|kërko|kerko|gjej\s+(një|nje|liber|libra|auto|makina|telefon)|liber|libra|libër|knig|book|shfleton|pretra|pronađ/i,
    reply: {
      sq: "KetuJemi është faqe njoftimesh: shitësit postojnë produkte, ju shfletoni kategoritë. Hapni faqen kryesore → zgjidhni kategorinë (p.sh. Elektronikë, Sport, Muzikë/Libra, etj.) ose «Njoftimet» për të parë të gjitha. Për libra, provoni kategorinë që i përshtatet (p.sh. Muzikë → Libra) ose kërkoni në listën e njoftimeve. Nuk ka dyqan me inventar — çdo rresht është një njoftim i veçantë nga një shitës.",
      mk: "KetuJemi е огласна платформа: изберете категорија на почетната страница или «Огласи» за сите. За книги пробајте соодветна категорија (на пр. Музика → Книги) или пребарувајте огласи. Секој оглас е од посебен продавач.",
      me: "KetuJemi je platforma oglasa: odaberite kategoriju na početnoj ili «Oglasi» za sve. Za knjige probajte odgovarajuću kategoriju ili pregledajte oglase. Svaki oglas je od posebnog prodavača.",
    },
  },
  {
    keywords: /çmim|cmim|price|free|falas|€|euro/i,
    reply: {
      sq: "Postimi bazë është falas për përdorues privat. Biznesi: 10 falas/kategori pastaj €1/postim shtesë. VIP €20/muaj. TOP €1 (kur aktiv).",
      mk: "Објавувањето е бесплатно за приватни. Бизнис: 10 бесплатно, потоа €1. VIP €20. TOP €1.",
      me: "Objava je besplatna za privatne. Biznis: 10 besplatno, zatim €1. VIP €20. TOP €1.",
    },
  },
];

/** Rule-based answers when Claude is off or as last resort. */
export function tryOfflineFaqAnswer(messages: ChatMessage[], lang: UiLang): string | null {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return null;

  const text = lastUser.content.normalize("NFD").replace(/\p{M}/gu, "");

  for (const entry of FAQ) {
    if (entry.keywords.test(text)) {
      return entry.reply[lang] ?? entry.reply.sq;
    }
  }

  return null;
}

export function escalateToEmailReply(lang: UiLang): string {
  return ESCALATE[lang] ?? ESCALATE.sq;
}

/** When Claude is off but the user asks how to find/buy something on the site. */
export function browsePlatformReply(lang: UiLang): string {
  const copy: Record<UiLang, string> = {
    sq: "Hapni faqen kryesore KetuJemi.com, zgjidhni kategorinë që ju intereson (ose «Njoftimet»), pastaj shfletoni njoftimet e shitësve. Për libra ose produkte specifike, zgjidhni kategorinë më të afërt — çdo njoftim është postim i veçantë, jo katalog i plotë i një dyqani.",
    mk: "Отворете ја почетната страница, изберете категорија или «Огласи» и пребарувајте. Секој оглас е посебен — нема единствен продавнички каталог.",
    me: "Otvorite početnu stranicu, odaberite kategoriju ili «Oglase» i pregledajte. Svaki oglas je poseban oglas prodavača.",
  };
  return copy[lang] ?? copy.sq;
}

export function tryBrowseOrFaqAnswer(messages: ChatMessage[], lang: UiLang): string | null {
  const faq = tryOfflineFaqAnswer(messages, lang);
  if (faq) return faq;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && isMarketplaceBrowseQuestion(lastUser.content)) {
    return browsePlatformReply(lang);
  }

  return null;
}

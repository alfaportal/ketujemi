import type { UiLang } from "./claude-client";
import { inferSupportLang } from "./infer-support-lang";
import type { ChatMessage } from "./support-chatbot";
import {
  getSupportPhoneDisplay,
  SUPPORT_EMAIL,
  supportFallbackLine,
} from "./support-contact";
import { matchCategoryRoute } from "./support-category-catalog";
import {
  getLastUserMessage,
  isMarketplaceBrowseQuestion,
  isRecognizedMarketplaceQuery,
  isSupportContactQuestion,
} from "./support-chat-screening";

type FaqEntry = { keywords: RegExp; reply: Record<UiLang, string> };

function normalizeText(raw: string): string {
  return raw.normalize("NFD").replace(/\p{M}/gu, "");
}

/** «po goma», «edhe rrotat» — strip filler so short follow-ups still match products. */
function expandUserQuery(raw: string): string {
  let t = normalizeText(raw).trim();
  t = t
    .replace(/^po\s+/i, "")
    .replace(/^edhe\s+/i, "")
    .replace(/^dhe\s+/i, "")
    .replace(/^a\s+/i, "")
    .trim();
  return t || normalizeText(raw).trim();
}

function getUserSearchContext(messages: ChatMessage[]): string {
  const parts = messages
    .filter((m) => m.role === "user")
    .slice(-4)
    .map((m) => expandUserQuery(m.content));
  return parts.join(" ");
}

/** Short follow-ups like «po goma» — may need prior user messages for context. */
function isShortFollowUp(raw: string): boolean {
  const normalized = normalizeText(raw).trim();
  if (normalized.length > 40) return false;
  return /^(po|edhe|dhe|a)\s+\S/i.test(normalized);
}

function phoneReply(lang: UiLang): string {
  const phone = getSupportPhoneDisplay();
  const copy: Record<UiLang, string> = {
    sq: `Mbështetja KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
    mk: `Поддршка KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
    me: `Podrška KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
  };
  return copy[lang] ?? copy.sq;
}

const COMPOSITE_INTENTS: { test: (t: string) => boolean; reply: Record<UiLang, string> }[] = [
  {
    test: (t) => /regjistr|regjistro|sign\s*up/i.test(t) && /muzik|hobi|instrument/i.test(t),
    reply: {
      sq: "Për **llogari** në KetuJemi: «Hyr» → «Regjistrohu» (email ose telefon + SMS). Për të **shitur** muzikë/instrumente: pas hyrjes → «Posto Falas» → kategoria **Muzikë & Hobby** (Instrumente, Libra, Studio…). Për të **blerë**: faqja kryesore → **Muzikë & Hobby** → shfletoni njoftimet.",
      mk: "Сметка: «Најава» → регистрација. Продажба: «Posto Falas» → **Музика и хоби**. Купување: почетна → **Музика и хоби**.",
      me: "Nalog: «Prijava» → registracija. Prodaja: «Posto Falas» → **Muzika i hobi**. Kupovina: početna → **Muzika i hobi**.",
    },
  },
  {
    test: (t) => /partner|biznes|dyqan|shitore|vip\s+partner/i.test(t),
    reply: {
      sq: "Partner biznesi: footer **BIZNESE** → «Hap shitore» ose «Partneritet» → faqja **/partner** (përfitimet, formulari i aplikimit Partner / VIP Partner). Pa pagesë online — ekipi kontakton pas shqyrtimit.",
      mk: "Бизнис партнер: **/partner** — формулар за Partner / VIP Partner, без онлајн плаќање.",
      me: "Biznis partner: **/partner** — formular Partner / VIP Partner, bez online plaćanja.",
    },
  },
];

const DETAILED_FAQ: FaqEntry[] = [
  {
    keywords:
      /regjistr|regjistro|krijoj\s+llogari|hap\s+llogari|sign\s*up|create\s+account|otvori\s+nalog|регистр/i,
    reply: {
      sq: "Regjistrimi (hap pas hapi): 1) **«Hyr»** → **«Regjistrohu»**. 2) Email+fjalëkalim (min. 8 shkronja) + verifikim me kod në email, OSE telefon Ballkan (+383/+355/+389/+382) + SMS 6-shifror. 3) Diaspora: përdorni email. 4) Pas verifikimit: shfletoni kategori ose **«Posto Falas»** për të shitur. Regjistrim ≠ postim — për muzikë/instrumente postimi bëhet te **Muzikë & Hobby**.",
      mk: "Регистрација: **Најава** → регистрација (email или SMS). Потоа **Posto Falas** или пребарување.",
      me: "Registracija: **Prijava** → registracija (email ili SMS). Zatim **Posto Falas** ili pretraga.",
    },
  },
  {
    keywords:
      /sa\s+kushton|kushton|çmimi\s+i|cmimi\s+i|how\s+much|price\s+of|koliko\s+ko[sš]ta|цената/i,
    reply: {
      sq: "Çmimi varet nga shitësi — çdo njoftim ka çmimin e vet në €. Hapni kategorinë e produktit, krahasoni 2–3 njoftime, pastaj «Telefono» ose WhatsApp te shitësi nga faqja e njoftimit.",
      mk: "Цената е по оглас — споредете во категоријата и контактирајте го продавачот.",
      me: "Cijena je po oglasu — uporedite u kategoriji i kontaktirajte prodavača.",
    },
  },
  {
    keywords:
      /posto|postim|si\s+(te|të)\s+post|si\s+postoj|how\s+to\s+post|објав|objav|kako\s+da\s+post|shitës|shites|shese|shes\b/i,
    reply: {
      sq: "Postimi (hap pas hapi): 1) **Regjistrohu dhe hyr** në llogari. 2) **«Posto Njoftim»**. 3) Kategori + nënkategori e saktë. 4) Titull, përshkrim, çmim €, foto **të pakufizuara** (opsionalisht video deri **150MB**). 5) Publiko (moderim automatik) — aktiv deri **3 muaj**. Postimi është **falas dhe i pakufizuar**. Boost TOP opsional (€2/€5/€8). Rifillo pas skadimit nga njoftimi juaj.",
      mk: "Продавач: регистрација, верификација, **Posto Falas**, точна категорија, детали — 30 дена.",
      me: "Prodavač: registracija, verifikacija, **Posto Falas**, tačna kategorija, detalji — 30 dana.",
    },
  },
  {
    keywords: /si\s+(të\s+)?blej|how\s+to\s+buy|kako\s+da\s+kupim|blerës|bleres|kupov/i,
    reply: {
      sq: "Si blerës: zgjidhni kategorinë (tabela në FAQ) → hapni njoftimin → lexoni çmimin → **«Telefono»** ose WhatsApp. Pagesa dhe dorëzimi bëhen drejtpërdrejt me shitësin.",
      mk: "Купувач: категорија → оглас → контакт со продавачот.",
      me: "Kupac: kategorija → oglas → kontakt prodavača.",
    },
  },
  {
    keywords: /skad|expir|истеч|istič|30\s*dit|30\s*den|rifill|repost|obnov|обнов/i,
    reply: {
      sq: "Njoftimi aktiv deri **3 muaj**. Para skadimit: email rikujtues (nëse email i verifikuar). Pas skadimit: hapni njoftimin → **«Rifillo njoftimin»** (+3 muaj).",
      mk: "30 дена; по истек **«Обнови го огласот»**.",
      me: "30 dana; nakon isteka **«Obnovi oglas»**.",
    },
  },
  {
    keywords: /top\b|në\s+krye|krye\s+list|featured/i,
    reply: {
      sq: "**TOP** (opsional): zgjidhni paketën — **€2 = 4 ditë**, **€5 = 15 ditë**, **€8 = 30 ditë** në krye të listës (Stripe).",
      mk: "TOP: €2=4 дена, €5=15, €8=30 на врв.",
      me: "TOP: €2=4 dana, €5=15, €8=30 na vrhu.",
    },
  },
  {
    keywords: /biznes|business|10\s+njoft|paket|listing\s+package|s\s*€|m\s*€|l\s*€/i,
    reply: {
      sq: "Postimi është **falas dhe i pakufizuar** për privat dhe biznes. Opsioni i vetëm me pagesë për njoftime: **Boost TOP**. Partner dyqani (/partner): aplikim falas — logo, badge, profil biznesi (aktivizim manual).",
      mk: "Објавувањето е бесплатно и неограничено. Единствена платена опција: Boost TOP. Partner (/partner): бесплатна апликација.",
      me: "Objavljivanje je besplatno i neograničeno. Jedina plaćena opcija: Boost TOP. Partner (/partner): besplatna prijava.",
    },
  },
  {
    keywords: /verifik|sms|email|kod|confirm/i,
    reply: {
      sq: "Për të postuar duhet të **hyni në llogari**. Email ose SMS (+383, +355, +389, +382) përdoren për regjistrim — verifikimi SMS **nuk** është i detyrueshëm para postimit.",
      mk: "Верификација email + SMS.",
      me: "Verifikacija email + SMS.",
    },
  },
  {
    keywords:
      /kategor|çfarë\s+kategori|cilat\s+kategori|(?:18|20)\s+kategori|lista\s+e\s+kategori|te\s+gjithe\s+kategori/i,
    reply: {
      sq: "**20 kategoritë** në KetuJemi: 1) Vetura 2) Motorr & Skuter 3) Kamionë & Furgonë 4) Auto Pjesë 5) Banesa & Shtëpi 6) Lokale & Zyrë 7) Telefona 8) Kompjuterë & Laptopë 9) Elektronikë & Pajisje Shtëpiake 10) Mobilje & Dekorime 11) Rroba & Këpucë 12) Fëmijë 13) Sport & Outdoor 14) Punë & Shërbime 15) Bujqësi & Blegtori 16) Arsim & Kurse 17) Muzikë & Hobby 18) Kafshë 19) Kërkoj të Blej 20) Dhurata & Falas. Shkruani produktin (p.sh. «goma», «banesë») për rrugën e saktë.",
      mk: "**20 категории**: Возила, Мотори, Камиони, Авто делови, Домови, Локали, Телефони, Компјутери, Електроника, Мебел, Облека, Деца, Спорт, Работа, Земјоделство, Образование, Музика, Животни, Барам, Подароци.",
      me: "**20 kategorija**: Vozila, Motori, Kamioni, Auto dijelovi, Stanovi, Lokali, Telefoni, Kompjuteri, Elektronika, Namještaj, Odjeća, Djeca, Sport, Posao, Poljoprivreda, Obrazovanje, Muzika, Životinje, Tražim, Pokloni.",
    },
  },
  {
    keywords: /treg|market|diaspor|kosov|shqip|maqedon|mal\s+i\s+zi|gjermani|zvic|austri|shba|angli/i,
    reply: {
      sq: "KetuJemi funksionon në **Kosovë, Shqipëri, Maqedoni e Veriut dhe 8 tregje të diasporës** (Gjermani, Zvicër, Austri, Francë, Itali, Angli, SHBA, Mal i Zi). Zgjidhni tregun në footer — ndikon në monedhën e shfaqur. Diaspora regjistrohet kryesisht me **email**; Ballkani edhe me SMS.",
      mk: "11 пазари: Косово, Албанија, МК, Црна Гора + дијаспора (DE, AT, CH, IT, FR, GB, US).",
      me: "11 tržišta: KS, AL, MK, ME + dijaspora (DE, AT, CH, IT, FR, GB, US).",
    },
  },
  {
    keywords: /stripe|kart|card|pages|pay|checkout|bler pages/i,
    reply: {
      sq: "Pagesat online në KetuJemi bëhen me **Stripe** (kartë bankare) vetëm për **Boost TOP** (€2/€5/€8). Partner **/partner** — aplikim falas, pa pagesë online. Postimi **nuk** kushton. Blerja te shitësi **nuk** paguhet përmes KetuJemi.",
      mk: "Stripe само за Boost TOP. Partner (/partner) — бесплатна апликација. Купување од продавач — директно.",
      me: "Stripe samo za Boost TOP. Partner (/partner) — besplatna prijava. Kupovina od prodavača — direktno.",
    },
  },
  {
    keywords: /sigur|safe|mashtr|scam|kujdes|raporto/i,
    reply: {
      sq: "Siguria: mos dërgoni para avans; takohuni publik; kontrolloni produktin; përdorni «Telefono»/WhatsApp nga njoftimi; **«Raporto»** për mashtrim; email **support@ketujemi.com**. KetuJemi nuk garanton produktin — marrëveshja është me shitësin.",
      mk: "Безбедност: без аванс; лично средба; «Пријави»; support@ketujemi.com.",
      me: "Bezbednost: bez avansa; lično; «Prijavi»; support@ketujemi.com.",
    },
  },
  {
    keywords: /ndal|prohib|zabran|forbid|armë|drog|alkool|duhan|moderat/i,
    reply: {
      sq: "Ndaluar: armë, droga, alkool, duhan, vape, fake, MLM, erotik, crypto. **Moderim automatik** para publikimit.",
      mk: "Забрането: оружје, дроги, алкохол, MLM, еротика. Автоматска модерација.",
      me: "Zabranjeno: oružje, droge, alkohol, MLM, erotika. Automatska moderacija.",
    },
  },
];

function tryProductCategoryAnswer(text: string, lang: UiLang): string | null {
  return matchCategoryRoute(text, lang);
}

function tryCompositeAnswer(text: string, lang: UiLang): string | null {
  for (const entry of COMPOSITE_INTENTS) {
    if (entry.test(text)) {
      return entry.reply[lang] ?? entry.reply.sq;
    }
  }
  return null;
}

function tryDetailedFaqAnswer(text: string, lang: UiLang): string | null {
  for (const entry of DETAILED_FAQ) {
    if (entry.keywords.test(text)) {
      return entry.reply[lang] ?? entry.reply.sq;
    }
  }
  return null;
}

/** Rule-based answers — offline mode, or instant contact replies. Match the latest question first. */
export function tryPrioritySupportAnswer(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): string | null {
  const lastUser = getLastUserMessage(messages);
  if (!lastUser) return null;

  const text = expandUserQuery(lastUser);
  const lang = inferSupportLang(lastUser, langHint);

  if (isSupportContactQuestion(text) || isSupportContactQuestion(lastUser)) {
    return phoneReply(lang);
  }

  const fromCurrent =
    tryCompositeAnswer(text, lang) ??
    tryProductCategoryAnswer(text, lang) ??
    tryDetailedFaqAnswer(text, lang);

  if (fromCurrent) return fromCurrent;

  if (isShortFollowUp(lastUser)) {
    const context = getUserSearchContext(messages);
    if (context && context !== text) {
      return (
        tryProductCategoryAnswer(context, lang) ?? tryDetailedFaqAnswer(context, lang)
      );
    }
  }

  return null;
}

/** Rule-based answers when Claude is off or as last resort. */
export function tryOfflineFaqAnswer(messages: ChatMessage[], lang: UiLang): string | null {
  return tryPrioritySupportAnswer(messages, lang);
}

export function escalateToEmailReply(lang: UiLang): string {
  return supportFallbackLine(lang);
}

export function browsePlatformReply(lang: UiLang): string {
  const copy: Record<UiLang, string> = {
    sq: "Nuk e identifikova produktin specifik — shkruani p.sh. «iPhone», «banesë», «muzikë», «veturë». Ose: faqja kryesore → kategoria → njoftimet; për të gjitha: «Njoftimet» + fjalë kyçe.",
    mk: "Наведете го производот (телефон, кола, музика…) или почетна → категорија → огласи.",
    me: "Navedite proizvod (telefon, auto, muzika…) ili početna → kategorija → oglasi.",
  };
  return copy[lang] ?? copy.sq;
}

export function tryBrowseOrFaqAnswer(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): string | null {
  const lastUserText = normalizeText(getLastUserMessage(messages));
  const lang = inferSupportLang(lastUserText, langHint);

  const priority = tryPrioritySupportAnswer(messages, langHint);
  if (priority) return priority;

  if (
    lastUserText &&
    (isMarketplaceBrowseQuestion(lastUserText) || isRecognizedMarketplaceQuery(lastUserText))
  ) {
    return browsePlatformReply(lang);
  }

  return null;
}

/** When Claude fails or returns unusable text — never «pyetje e pavlefshme» for real product words. */
export function supportUnknownQueryReply(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): string {
  const lastUser = getLastUserMessage(messages);
  const lang = inferSupportLang(lastUser, langHint);
  const priority = tryPrioritySupportAnswer(messages, langHint);
  if (priority) return priority;
  if (lastUser && isRecognizedMarketplaceQuery(lastUser)) {
    return browsePlatformReply(lang);
  }
  const copy: Record<UiLang, string> = {
    sq: "Më shkruani pak më qartë çfarë kërkoni (p.sh. «goma veture», «banesë Prishtinë», «iPhone 13») — do t'ju tregoj kategorinë e saktë në KetuJemi.",
    mk: "Напишете појасно што барате (на пр. «гуми», «стан») за точна категорија.",
    me: "Napišite jasnije šta tražite (npr. «gume», «stan») za tačnu kategoriju.",
  };
  return copy[lang] ?? copy.sq;
}

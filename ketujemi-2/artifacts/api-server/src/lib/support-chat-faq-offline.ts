import type { UiLang } from "./claude-client";
import { inferSupportLang } from "./infer-support-lang";
import type { ChatMessage } from "./support-chatbot";
import {
  getSupportPhoneDisplay,
  SUPPORT_EMAIL,
  supportFallbackLine,
} from "./support-contact";
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

function phoneReply(lang: UiLang): string {
  const phone = getSupportPhoneDisplay();
  const copy: Record<UiLang, string> = {
    sq: `Mbështetja KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
    mk: `Поддршка KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
    me: `Podrška KetuJemi: ${phone} · ${SUPPORT_EMAIL}`,
  };
  return copy[lang] ?? copy.sq;
}

/** Specific product → exact category path (checked before generic answers). */
const PRODUCT_ROUTES: FaqEntry[] = [
  {
    keywords: /iphone|samsung|xiaomi|telefon|smartphone|huawei|oneplus/i,
    reply: {
      sq: "Telefona: faqja kryesore → **Telefona** → Smartphones (ose marka: Apple, Samsung…) → hapni njoftimin. Kërkim i shpejtë: «Njoftimet» + modeli (p.sh. iPhone 13).",
      mk: "Телефони: почетна → **Телефони** → Smartphones → отворете оглас.",
      me: "Telefoni: početna → **Telefoni** → Smartphones → otvorite oglas.",
    },
  },
  {
    keywords: /laptop|macbook|kompjuter|notebook|\bpc\b/i,
    reply: {
      sq: "Kompjuterë: faqja kryesore → **Kompjuterë & Laptopë** → nën-kategoria (Laptop, Gaming…) → njoftimet.",
      mk: "Компјутери: почетна → **Компјутери и лаптопи** → огласи.",
      me: "Kompjuteri: početna → **Kompjuteri i laptopi** → oglasi.",
    },
  },
  {
    keywords: /makina|vetur|automobil|audi|bmw|mercedes|golf|opel|ford/i,
    reply: {
      sq: "Vetura: faqja kryesore → **Vetura** → lloji (SUV, Sedan, Hatchback…) → shfletoni njoftimet e makinës që ju intereson.",
      mk: "Возила: почетна → **Возила** → тип → огласи.",
      me: "Vozila: početna → **Vozila** → tip → oglasi.",
    },
  },
  {
    keywords: /motor|skuter|vespa|moped/i,
    reply: {
      sq: "Motorr & Skuter: faqja kryesore → **Motorr & Skuter** → markë/lloj → njoftimet.",
      mk: "Мотори: почетна → **Мотори и скутери** → огласи.",
      me: "Motori: početna → **Motori i skuteri** → oglasi.",
    },
  },
  {
    keywords:
      /goma|gomat|felne|fellne|rrot|disk|amortiz|fren|karoseri|akumulator|vajra|filtra|auto\s*pjes|auto-pjes|pjese\s+aut|pjese\s+vet|drita\s+led|led\s+drita/i,
    reply: {
      sq: "**Auto Pjesë**: faqja kryesore → **Auto Pjesë** → **Fellne & Goma** (për goma/rrota), ose Amortizerë, Sisteme Frenimi, Motorrë, Pjesë Karoserie, Vajra & Filtra, etj. Kërkim: «Njoftimet» + «goma 205» ose «rrota BMW».",
      mk: "Авто делови: почетна → **Авто делови** → **Гуми и фелни** (гуми/тркала).",
      me: "Auto dijelovi: početna → **Auto dijelovi** → **Gume i felne** (gume/točkovi).",
    },
  },
  {
    keywords: /kamion|furgon|rimorkio|trailer|autobus/i,
    reply: {
      sq: "Kamionë & Furgonë: faqja kryesore → **Kamionë & Furgonë** → lloji (Furgonë, Kamionë, Trailer…) → njoftimet.",
      mk: "Камиони: почетна → **Камиони и комбе** → огласи.",
      me: "Kamioni: početna → **Kamioni i kombiji** → oglasi.",
    },
  },
  {
    keywords: /lokal|zyre|depo|garazh|afarist/i,
    reply: {
      sq: "Lokale & Zyrë: faqja kryesore → **Lokale & Zyrë** → Depo, Garazha, Lokale Afariste, Zyrë…",
      mk: "Локали: почетна → **Локали и канцеларии** → огласи.",
      me: "Lokali: početna → **Lokali i kancelarije** → oglasi.",
    },
  },
  {
    keywords: /biciklet|fitnes|joga|kampingu|sport(?!.*muzik)/i,
    reply: {
      sq: "**Sport & Outdoor**: faqja kryesore → **Sport & Outdoor** → Biçikleta, Fitnes & Joga, Pajisje Kampingu, Sportet me Top… (jo muzikë — ajo është te **Muzikë & Hobby**).",
      mk: "Спорт: почетна → **Спорт и аутдор** → огласи.",
      me: "Sport: početna → **Sport i outdoor** → oglasi.",
    },
  },
  {
    keywords: /bujq|blegt|bageti|farer|makineri\s+bujq/i,
    reply: {
      sq: "Bujqësi & Blegtori: faqja kryesore → **Bujqësi & Blegtori** → Bagëti, Makineri, Farëra…",
      mk: "Земјоделство: почетна → **Земјоделство** → огласи.",
      me: "Poljoprivreda: početna → **Poljoprivreda** → oglasi.",
    },
  },
  {
    keywords: /kurs|arsim|mesim|trajnim|gjuh/i,
    reply: {
      sq: "Arsim & Kurse: faqja kryesore → **Arsim & Kurse** → Gjuhë të Huaja, Kurse Profesionale, Trajnime IT…",
      mk: "Образование: почетна → **Образование и курсеви** → огласи.",
      me: "Obrazovanje: početna → **Obrazovanje i kursevi** → oglasi.",
    },
  },
  {
    keywords: /banes|apartament|shtëpi|shtepi|pron/i,
    reply: {
      sq: "Prona: faqja kryesore → **Banesa & Shtëpi** → shfletoni apartamente/shtëpi sipas qytetit dhe çmimit.",
      mk: "Домови: почетна → **Домови и станови** → огласи.",
      me: "Stanovi: početna → **Domovi i stanovi** → oglasi.",
    },
  },
  {
    keywords: /mobilje|divan|tavolin|karrige|sofa/i,
    reply: {
      sq: "Mobilje: faqja kryesore → **Mobilje & Dekorime** → njoftimet.",
      mk: "Мебел: почетна → **Мебел** → огласи.",
      me: "Namještaj: početna → **Namještaj** → oglasi.",
    },
  },
  {
    keywords: /tv\b|frigorifer|elektroshtëpiake|pajisje\s+shtëpi/i,
    reply: {
      sq: "Elektronikë shtëpiake: faqja kryesore → **Elektronikë & Pajisje Shtëpiake** → njoftimet.",
      mk: "Електроника: почетна → **Електроника за дома** → огласи.",
      me: "Elektronika: početna → **Elektronika za dom** → oglasi.",
    },
  },
  {
    keywords:
      /muzik|muzike|muzikë|hobi|hobby|instrument|gitar|piano|korde|vinil|studio|mikrofon|amplifikator|bass|drum|violin/i,
    reply: {
      sq: "**Muzikë & Hobby** (kategori kryesore, jo Sport & Outdoor): faqja kryesore → **Muzikë & Hobby** → Instrumente Frymore / me Tela / me Tastierë / Libra / Pajisje Studio / Art Teatër & Film → njoftimet. Shitje: «Posto Falas» → **Muzikë & Hobby**.",
      mk: "Музика: почетна → **Музика и хоби** → подкатегории → оглас.",
      me: "Muzika: početna → **Muzika i hobi** → podkategorije → oglasi.",
    },
  },
  {
    keywords: /libër|libra|liber|knig|cd\b|vinil/i,
    reply: {
      sq: "Libra & media: **Muzikë & Hobby** → **Libra** (ose Art, Teatër & Film) → njoftimet.",
      mk: "Книги: **Музика и хоби** → **Книги** → огласи.",
      me: "Knjige: **Muzika i hobi** → **Knjige** → oglasi.",
    },
  },
  {
    keywords: /punë|pune|shërbim|sherbim|ofertë\s+pune|vend\s+pune/i,
    reply: {
      sq: "Punë: faqja kryesore → **Punë & Shërbime** → shfletoni ofertat e punës ose shërbimeve.",
      mk: "Работа: почетна → **Работа и услуги** → огласи.",
      me: "Posao: početna → **Posao i usluge** → oglasi.",
    },
  },
  {
    keywords: /kafsh|qen|mace|mac(e|ë)\b|kote|papagall|zog/i,
    reply: {
      sq: "Kafshë: faqja kryesore → **Kafshë** → njoftimet.",
      mk: "Животни: почетна → **Животни** → огласи.",
      me: "Životinje: početna → **Životinje** → oglasi.",
    },
  },
  {
    keywords: /rrob|vesh|këpuc|kepuc|nike|adidas/i,
    reply: {
      sq: "Veshje: faqja kryesore → **Rroba & Këpucë** → njoftimet.",
      mk: "Облека: почетна → **Облека и обувки** → огласи.",
      me: "Odjeća: početna → **Odjeća i obuća** → oglasi.",
    },
  },
];

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
      sq: "Partner biznesi: footer **BIZNESE** → «Hap shitore» ose «Partneritet» → faqja **/partner** (përfitimet, paketat Standard €30 / VIP €50, formulari i regjistrimit). Aktivizimi pas pagesës online.",
      mk: "Бизнис партнер: **/partner** — Standard €30 / VIP €50, формулар.",
      me: "Biznis partner: **/partner** — Standard €30 / VIP €50, formular.",
    },
  },
];

const DETAILED_FAQ: FaqEntry[] = [
  {
    keywords:
      /telefon|numër|numer|numri|phone|kontakt|thirr|call|whatsapp|viber|si\s+ju\s+(kontaktoj|telefonoj)|broj\s+telefona|телефон|контакт/i,
    reply: {
      sq: phoneReply("sq"),
      mk: phoneReply("mk"),
      me: phoneReply("me"),
    },
  },
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
      sq: "Postimi (hap pas hapi): 1) Hyr + verifikim email/SMS. 2) **«Posto Falas»**. 3) Kategori + nënkategori e saktë. 4) Titull, përshkrim, çmim €, deri **10 foto**. 5) Publiko (moderim AI) — **30 ditë** aktiv. Limit: **10 falas për kategori** + max **10 aktive** total. TOP €1 opsional. Rifillo pas skadimit nga njoftimi juaj.",
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
      sq: "Njoftimi aktiv **30 ditë**. Para skadimit: email rikujtues (nëse email i verifikuar). Pas skadimit: hapni njoftimin → **«Rifillo njoftimin»** (+30 ditë).",
      mk: "30 дена; по истек **«Обнови го огласот»**.",
      me: "30 dana; nakon isteka **«Obnovi oglas»**.",
    },
  },
  {
    keywords: /top\b|në\s+krye|krye\s+list|featured/i,
    reply: {
      sq: "**TOP €1**: renditje +7 / +5 / +3 / +1 ditë (sipas blerjeve); shfaqet mbi njoftimet normale në listë.",
      mk: "TOP €1: +7/+5/+3/+1 дена.",
      me: "TOP €1: +7/+5/+3/+1 dan.",
    },
  },
  {
    keywords: /biznes|business|10\s+njoft|paket|listing\s+package|s\s*€|m\s*€|l\s*€/i,
    reply: {
      sq: "Biznes: **10** njoftime falas për kategori, pastaj €1/postim. **VIP** €20/muaj — postime të pakufizuara. Paketa shtesë për përdorues: S/M/L (shih modalin kur arrini limitin). Partner dyqani: **/partner**.",
      mk: "Бизнис 10 бесплатно, €1, VIP €20. Partner: **/partner**.",
      me: "Biznis 10 besplatno, €1, VIP €20. Partner: **/partner**.",
    },
  },
  {
    keywords: /verifik|sms|email|kod|confirm/i,
    reply: {
      sq: "Verifikoni **email** dhe **SMS** (+383, +355, +389, +382). Pa verifikim, postimi mund të mos funksionojë plotësisht.",
      mk: "Верификација email + SMS.",
      me: "Verifikacija email + SMS.",
    },
  },
  {
    keywords: /treg|market|diaspor|kosov|shqip|maqedon|mal\s+i\s+zi|gjermani|zvic|austri|shba|angli/i,
    reply: {
      sq: "KetuJemi funksionon në **11 tregje**: Kosovë, Shqipëri, Maqedoni e Veriut, Mal i Zi + diaspora (Gjermani, Austri, Zvicër, Itali, Francë, Angli, SHBA). Zgjidhni tregun në footer — ndikon në monedhën e shfaqur. Diaspora regjistrohet kryesisht me **email**; Ballkan edhe me SMS.",
      mk: "11 пазари: Косово, Албанија, МК, Црна Гора + дијаспора (DE, AT, CH, IT, FR, GB, US).",
      me: "11 tržišta: KS, AL, MK, ME + dijaspora (DE, AT, CH, IT, FR, GB, US).",
    },
  },
  {
    keywords: /stripe|kart|card|pages|pay|checkout|bler pages/i,
    reply: {
      sq: "Pagesat online në KetuJemi bëhen me **Stripe** (kartë bankare): partner **/partner** (Standard €30 / VIP €50), **TOP** njoftimi €1, paketa shtesë njoftimesh S/M/L. Blerja e produktit te shitësi **nuk** paguhet përmes KetuJemi — kontakt direkt me shitësin.",
      mk: "Stripe за partner, TOP, пакети. Купување од продавач — директно, не преку платформата.",
      me: "Stripe za partner, TOP, pakete. Kupovina od prodavača — direktno.",
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
      sq: "Ndaluar: armë, droga, alkool, duhan, vape, fake, MLM, erotik, crypto. **Moderim AI** para publikimit.",
      mk: "Забрането: оружје, дроги, алкохол, MLM, еротика. AI модерација.",
      me: "Zabranjeno: oružje, droge, alkohol, MLM, erotika. AI moderacija.",
    },
  },
];

function tryProductCategoryAnswer(text: string, lang: UiLang): string | null {
  for (const entry of PRODUCT_ROUTES) {
    if (entry.keywords.test(text)) {
      return entry.reply[lang] ?? entry.reply.sq;
    }
  }
  return null;
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

/** High-confidence answers — used before Claude (fixes wrong generic replies). */
export function tryPrioritySupportAnswer(
  messages: ChatMessage[],
  langHint: UiLang = "sq",
): string | null {
  const lastUser = getLastUserMessage(messages);
  if (!lastUser) return null;

  const text = expandUserQuery(lastUser);
  const context = getUserSearchContext(messages);
  const lang = inferSupportLang(lastUser, langHint);

  if (isSupportContactQuestion(text)) {
    return phoneReply(lang);
  }

  return (
    tryCompositeAnswer(text, lang) ??
    tryProductCategoryAnswer(text, lang) ??
    tryProductCategoryAnswer(context, lang) ??
    tryDetailedFaqAnswer(text, lang) ??
    tryDetailedFaqAnswer(context, lang)
  );
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

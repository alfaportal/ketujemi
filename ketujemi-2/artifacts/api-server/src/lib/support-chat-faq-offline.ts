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
  isSupportContactQuestion,
} from "./support-chat-screening";

type FaqEntry = { keywords: RegExp; reply: Record<UiLang, string> };

function normalizeText(raw: string): string {
  return raw.normalize("NFD").replace(/\p{M}/gu, "");
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
      sq: "Muzikë & Hobby: faqja kryesore → **Muzikë & Hobby** → nën-kategori (Instrumente, Libra, Pajisje Studio, Art & Film…) → hapni njoftimin. Për të shitur: «Posto Falas» → zgjidhni **Muzikë & Hobby**.",
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
    keywords: /kafsh|qen|mac|kote|papagall|zog/i,
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
      sq: "Regjistrimi: klikoni **«Hyr»** (këndi i djathtë lart) → **«Regjistrohu»** me email+fjalëkalim ose telefon (+383, +355, +389, +382) + SMS. Pas verifikimit mund të postoni («Posto Falas») ose të blini nga kategoritë.",
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
      sq: "Si shitës: 1) Regjistrohu + verifiko email/SMS. 2) **«Posto Falas»**. 3) Zgjidh kategorinë e saktë (p.sh. Muzikë & Hobby për instrumente). 4) Titull, përshkrim, foto, çmim €. 5) Publiko — **30 ditë** aktiv. Max **10** njoftime njëkohësisht.",
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

  const text = normalizeText(lastUser);
  const lang = inferSupportLang(lastUser, langHint);

  if (isSupportContactQuestion(text)) {
    return phoneReply(lang);
  }

  return (
    tryCompositeAnswer(text, lang) ??
    tryProductCategoryAnswer(text, lang) ??
    tryDetailedFaqAnswer(text, lang)
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

  if (lastUserText && isMarketplaceBrowseQuestion(lastUserText)) {
    return browsePlatformReply(lang);
  }

  return null;
}

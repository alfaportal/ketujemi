import type { UiLang } from "./claude-client";
import type { ChatMessage } from "./support-chatbot";
import {
  getSupportPhoneDisplay,
  SUPPORT_EMAIL,
  supportFallbackLine,
} from "./support-contact";
import { isMarketplaceBrowseQuestion, isSupportContactQuestion } from "./support-chat-screening";

type FaqEntry = { keywords: RegExp; reply: Record<UiLang, string> };

function phoneReply(lang: UiLang): string {
  const phone = getSupportPhoneDisplay();
  const copy: Record<UiLang, string> = {
    sq: `Mbështetja: ${phone} · ${SUPPORT_EMAIL}`,
    mk: `Поддршка: ${phone} · ${SUPPORT_EMAIL}`,
    me: `Podrška: ${phone} · ${SUPPORT_EMAIL}`,
  };
  return copy[lang] ?? copy.sq;
}

/** Specific product → category path (sq-first; mk/me stay concise). */
const PRODUCT_ROUTES: FaqEntry[] = [
  {
    keywords: /iphone|samsung|xiaomi|telefon|smartphone|huawei|oneplus/i,
    reply: {
      sq: "Faqja kryesore → Telefona → Smartphones (ose marka, p.sh. Apple/Samsung) → hapni njoftimin që ju intereson.",
      mk: "Почетна → Телефони → Smartphones → отворете оглас.",
      me: "Početna → Telefoni → Smartphones → otvorite oglas.",
    },
  },
  {
    keywords: /laptop|macbook|kompjuter|pc\b|notebook/i,
    reply: {
      sq: "Faqja kryesore → Kompjuterë & Laptopë → zgjidhni nën-kategorinë → shfletoni njoftimet.",
      mk: "Почетна → Компјутери и лаптопи → огласи.",
      me: "Početna → Kompjuteri i laptopi → oglasi.",
    },
  },
  {
    keywords: /makina|vetur|automobil|audi|bmw|mercedes|golf|opel/i,
    reply: {
      sq: "Faqja kryesore → Vetura → lloji (SUV, Sedan…) → shfletoni njoftimet e makinave.",
      mk: "Почетна → Возила → тип → огласи.",
      me: "Početna → Vozila → tip → oglasi.",
    },
  },
  {
    keywords: /motor|skuter|vespa|biçikletë|bicycle/i,
    reply: {
      sq: "Faqja kryesore → Motorr & Skuter → markë/lloj → njoftimet.",
      mk: "Почетна → Мотори и скутери → огласи.",
      me: "Početna → Motori i skuteri → oglasi.",
    },
  },
  {
    keywords: /banes|apartament|shtëpi|shtepi|shtëpi/i,
    reply: {
      sq: "Faqja kryesore → Banesa & Shtëpi → shfletoni njoftimet e pronave.",
      mk: "Почетна → Домови и станови → огласи.",
      me: "Početna → Domovi i stanovi → oglasi.",
    },
  },
  {
    keywords: /mobilje|divan|tavolinë|tavoline|karrige/i,
    reply: {
      sq: "Faqja kryesore → Mobilje & Dekorime → njoftimet.",
      mk: "Почетна → Мебел → огласи.",
      me: "Početna → Namještaj → oglasi.",
    },
  },
  {
    keywords: /tv\b|frigorifer|elektroshtëpiake|pajisje/i,
    reply: {
      sq: "Faqja kryesore → Elektronikë & Pajisje Shtëpiake → njoftimet.",
      mk: "Почетна → Електроника за дома → огласи.",
      me: "Početna → Elektronika za dom → oglasi.",
    },
  },
  {
    keywords: /libër|libra|liber|knig|instrument|gitar/i,
    reply: {
      sq: "Faqja kryesore → Muzikë & Hobby → njoftimet (libra/instrumente sipas postimit të shitësit).",
      mk: "Почетна → Музика и хоби → огласи.",
      me: "Početna → Muzika i hobi → oglasi.",
    },
  },
  {
    keywords: /punë|pune|shërbim|sherbim|ofertë\s+pune/i,
    reply: {
      sq: "Faqja kryesore → Punë & Shërbime → shfletoni njoftimet e punës/shërbimeve.",
      mk: "Почетна → Работа и услуги → огласи.",
      me: "Početna → Posao i usluge → oglasi.",
    },
  },
];

const FAQ: FaqEntry[] = [
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
      /sa\s+kushton|kushton|çmimi\s+i|cmimi\s+i|how\s+much|price\s+of|koliko\s+ko[sš]ta|цената/i,
    reply: {
      sq: "Çmimi varet nga shitësi — çdo njoftim ka çmimin e vet. Hapni kategorinë e produktit, krahasoni 2–3 njoftime, pastaj kontaktoni shitësin nga faqja e njoftimit.",
      mk: "Цената е по оглас — споредете неколку огласи во категоријата и контактирајте го продавачот.",
      me: "Cijena je po oglasu — uporedite oglase u kategoriji i kontaktirajte prodavača.",
    },
  },
  {
    keywords:
      /posto|postim|si\s+(te|të)\s+post|si\s+postoj|how\s+to\s+post|објав|objav|kako\s+da\s+post|shitës|shites|shese/i,
    reply: {
      sq: "Si shitës: 1) Regjistrohu + verifiko email/SMS. 2) «Posto Falas». 3) Zgjidh kategorinë e saktë. 4) Titull, përshkrim, foto, çmim €. 5) Publiko — 30 ditë aktiv. Max 10 njoftime njëkohësisht.",
      mk: "Продавач: регистрација, верификација, «Posto Falas», категорија, детали, објава — 30 дена.",
      me: "Prodavač: registracija, verifikacija, «Posto Falas», kategorija, detalji, objava — 30 dana.",
    },
  },
  {
    keywords: /si\s+(të\s+)?blej|how\s+to\s+buy|kako\s+da\s+kupim|blerës|bleres/i,
    reply: {
      sq: "Si blerës: zgjidh kategorinë → hap njoftimin → lexo çmimin → «Telefono» ose WhatsApp te shitësi. Marrëveshja bëhet drejtpërdrejt me shitësin.",
      mk: "Купувач: категорија → оглас → контакт со продавачот.",
      me: "Kupac: kategorija → oglas → kontakt prodavača.",
    },
  },
  {
    keywords: /skad|expir|истеч|istič|30\s*dit|30\s*den|muaj|month|sa\s+koh/i,
    reply: {
      sq: "Njoftimi aktiv 30 ditë. Para skadimit: email rikujtues (nëse email i verifikuar). Pas skadimit: «Rifillo njoftimin» (+30 ditë).",
      mk: "30 дена активно; по истек «Обнови го огласот».",
      me: "30 dana aktivno; nakon isteka «Obnovi oglas».",
    },
  },
  {
    keywords: /rifill|repost|obnov|обнов|ripost/i,
    reply: {
      sq: "Hap njoftimin e skaduar → «Rifillo njoftimin» → +30 ditë aktiv.",
      mk: "Истечен оглас → «Обнови го огласот».",
      me: "Istekli oglas → «Obnovi oglas».",
    },
  },
  {
    keywords: /fshij|fshi|delete|избриш|obriši|remove|ndrysho|edit/i,
    reply: {
      sq: "Hyr te njoftimi yt (i kyçur) → «Ndrysho» ose «Fshi».",
      mk: "Најавете се → измена или бришење на огласот.",
      me: "Prijavite se → izmjena ili brisanje oglasa.",
    },
  },
  {
    keywords: /top|në\s+krye|krye\s+list|featured/i,
    reply: {
      sq: "TOP €1: herën e 1-të +7 ditë lart, 2-të +5, 3-të +3, pastaj +1. TOP shfaqet mbi njoftimet normale.",
      mk: "TOP €1: +7/+5/+3/+1 дена.",
      me: "TOP €1: +7/+5/+3/+1 dan.",
    },
  },
  {
    keywords: /biznes|business|vip|standard|10\s+njoft|10\s+oglas/i,
    reply: {
      sq: "Biznes Standard: 10 falas/kategori, pastaj €1/postim. VIP €20/muaj — postime të pakufizuara.",
      mk: "Бизнис 10 бесплатно, потоа €1. VIP €20.",
      me: "Biznis 10 besplatno, zatim €1. VIP €20.",
    },
  },
  {
    keywords: /verifik|sms|email|kod|confirm/i,
    reply: {
      sq: "Verifiko email + SMS (+383, +355, +389, +382). Pa verifikim postimi mund të mos funksionojë plotësisht.",
      mk: "Верификација email + SMS.",
      me: "Verifikacija email + SMS.",
    },
  },
  {
    keywords: /duplikat|dy\s+her|twice|iste\s+njoft/i,
    reply: {
      sq: "Një i njëjti produkt aktiv njëherë — fshi ose ndrysho njoftimin e vjetër para se të postosh të riun.",
      mk: "Само еден ист активен оглас.",
      me: "Samo jedan isti aktivan oglas.",
    },
  },
  {
    keywords: /ndal|prohib|zabran|forbid|armë|drog|alkool|duhan/i,
    reply: {
      sq: "Ndaluar: armë, droga, alkool, duhan, vape, fake, MLM, erotik, crypto. Moderim AI para publikimit.",
      mk: "Забрането: оружје, дроги, алкохол, MLM, еротика.",
      me: "Zabranjeno: oružje, droge, alkohol, MLM, erotika.",
    },
  },
  {
    keywords: /10\s+njoft|maks|limit|limiti/i,
    reply: {
      sq: "Max 10 njoftime aktive. Fshi ose prit skadimin për të postuar tjetër.",
      mk: "Макс. 10 активни огласи.",
      me: "Maks. 10 aktivnih oglasa.",
    },
  },
  {
    keywords: /postim.*falas|falas.*post|çmim.*post|cmim.*post|sa\s+kushton.*post/i,
    reply: {
      sq: "Postimi privat është falas. Biznes: 10 falas/kategori, pastaj €1. VIP €20/muaj. TOP €1 (kur aktiv).",
      mk: "Приватно бесплатно. Бизнис/VIP/TOP како на сајтот.",
      me: "Privatno besplatno. Biznis/VIP/TOP kao na sajtu.",
    },
  },
  ...PRODUCT_ROUTES,
  {
    keywords:
      /ku\s+(mund|e\s+gjej|ta\s+gjej)|si\s+(mund|ta\s+gjej|gjen)|a\s+mund\s+ta\s+gjej|kërko|kerko|gjej|shfleton|pretra|pronađ|blej|bler/i,
    reply: {
      sq: "Hap faqen kryesore → zgjidh kategorinë që përshtatet (shih Telefona, Vetura, Banesa & Shtëpi, etj.) → shfletoni njoftimet. Për kërkim të gjerë: «Njoftimet» + fjalë kyçe.",
      mk: "Почетна → категорија → огласи, или «Огласи» + пребарување.",
      me: "Početna → kategorija → oglasi, ili «Oglasi» + pretraga.",
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
  return supportFallbackLine(lang);
}

export function browsePlatformReply(lang: UiLang): string {
  const copy: Record<UiLang, string> = {
    sq: "Faqja kryesore → zgjidh kategorinë (Telefona, Vetura, Banesa & Shtëpi, …) → hap njoftimin. Për të gjitha: «Njoftimet» dhe kërko me fjalë.",
    mk: "Почетна → категорија → оглас. За сите: «Огласи».",
    me: "Početna → kategorija → oglas. Za sve: «Oglasi».",
  };
  return copy[lang] ?? copy.sq;
}

export function tryBrowseOrFaqAnswer(messages: ChatMessage[], lang: UiLang): string | null {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (lastUser && isSupportContactQuestion(lastUser.content)) {
    return phoneReply(lang);
  }

  const faq = tryOfflineFaqAnswer(messages, lang);
  if (faq) return faq;

  if (lastUser && isMarketplaceBrowseQuestion(lastUser.content)) {
    return browsePlatformReply(lang);
  }

  return null;
}

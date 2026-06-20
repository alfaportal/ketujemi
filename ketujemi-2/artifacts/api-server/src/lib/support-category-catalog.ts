import { langText, type LangCopy, type UiLang } from "./claude-client";

export type CategoryRoute = {
  id: string;
  keywords: RegExp;
  reply: LangCopy;
};

/**
 * All 20 KetuJemi main categories — offline chat matches these before Claude.
 * Subcategories mirror lib/db seed (hub types).
 */
export const KETUJEMI_CATEGORY_ROUTES: CategoryRoute[] = [
  {
    id: "vetura",
    keywords:
      /\bvetur(a|e|at|ave)?\b|makin(a|at|ave|ës)?\b|automobil|sedan|hatchback|suv|jeep|pickup|audi|bmw|mercedes|volkswagen|toyota|opel|ford|golf\b|passat|corolla/i,
    reply: {
      sq: "**Vetura**: faqja kryesore → **Vetura** → lloji karrocërie (Sedan, Hatchback, SUV & Jeep, Kombi, Kabriolet, Elektrike & Hibride, Pickup…) → marka (BMW, Audi, Mercedes…) → hapni njoftimin. Kërkim: «Njoftimet» + modeli.",
      mk: "**Возила**: почетна → **Возила** → тип (Sedan, SUV…) → марка → оглас.",
      me: "**Vozila**: početna → **Vozila** → tip → marka → oglas.",
    },
  },
  {
    id: "motorr-skuter",
    keywords:
      /\bmotor(r|i|a)?\b|skuter|vespa|moped|chopper|enduro|motokros|quad|atv\b|yamaha|ducati|harley|kawasaki/i,
    reply: {
      sq: "**Motorr & Skuter**: faqja kryesore → **Motorr & Skuter** → lloji (Skuter, Vespa, Enduro, Chopper, Quad & ATV, Motorr Sportiv…) → markë → njoftimet.",
      mk: "**Мотори и скутери**: почетна → **Мотори и скутери** → тип → оглас.",
      me: "**Motori i skuteri**: početna → **Motori i skuteri** → tip → oglas.",
    },
  },
  {
    id: "kamione-furgone",
    keywords:
      /kamion|furgon|rimorkio|trailer|autobus|maun|iveco|scania|daf\b|man\b/i,
    reply: {
      sq: "**Kamionë & Furgonë**: faqja kryesore → **Kamionë & Furgonë** → Autobusë, Furgonë, Kamionë, Mauna, Trailer & Rimorkio → markë → njoftimet.",
      mk: "**Камиони и комбе**: почетна → **Камиони и комбе** → тип → оглас.",
      me: "**Kamioni i kombiji**: početna → **Kamioni i kombiji** → tip → oglas.",
    },
  },
  {
    id: "auto-pjese",
    keywords:
      /auto\s*pjes|auto-pjes|pjese\s+aut|pjese\s+vet|goma|gomat|felne|fellne|rrot|disk|amortiz|fren|karoseri|akumulator|vajra|filtra|drita\s+led|led\s+drita|frenim/i,
    reply: {
      sq: "**Auto Pjesë**: faqja kryesore → **Auto Pjesë** → **Fellne & Goma** (goma/rrota), Amortizerë, Sisteme Frenimi, Motorrë, Pjesë Karoserie, Drita & LED, Vajra & Filtra, Akumulatorë. Kërkim: «Njoftimet» + «goma 205», «rrota BMW».",
      mk: "**Авто делови**: почетна → **Авто делови** → **Гуми и фелни**, амортизери, кочници…",
      me: "**Auto dijelovi**: početna → **Auto dijelovi** → **Gume i felne**, amortizeri, kočnice…",
    },
  },
  {
    id: "banesa-shtepi",
    keywords:
      /banes|apartament|shtëpi|shtepi|pron|vikendic|truall|toka|dhoma\s+me\s+qira|me\s+qira\b|real\s*estate|2\s+dhom|dy\s+dhom/i,
    reply: {
      sq: "Banesa & Shtëpi → Apartamente & Banesa. Për 2 dhoma: «Njoftimet» + kërko «2 dhoma» ose lexoni titullin e njoftimit.",
      mk: "**Домови и станови**: почетна → **Домови и станови** → апартман, куќа, земјиште…",
      me: "**Domovi i stanovi**: početna → **Domovi i stanovi** → stan, kuća, plac…",
    },
  },
  {
    id: "lokale-zyre",
    keywords:
      /lokal|zyre|zyrë|depo|garazh|garazha|afarist|industrial|biznes\s+lokal/i,
    reply: {
      sq: "**Lokale & Zyrë**: faqja kryesore → **Lokale & Zyrë** → Depo, Garazha, Lokale Afariste, Objekte Industriale, Zyrë → njoftimet.",
      mk: "**Локали и канцеларии**: почетна → **Локали и канцеларии** → депо, гаража, канцеларија…",
      me: "**Lokali i kancelarije**: početna → **Lokali i kancelarije** → depo, garaža, poslovni prostor…",
    },
  },
  {
    id: "telefona",
    keywords:
      /telefon|smartphone|mobile|mobil|celular|cell\s*phone|iphone|samsung|xiaomi|huawei|oneplus|honor|motorola|nokia|apple\s+phone|tablet\s+tel|kartel|numra\s+tel|aksesor.*telefon/i,
    reply: {
      sq: "**Telefona**: faqja kryesore → **Telefona** → Smartphones, Telefona Fiksë, Numra & Kartela, Pjesë Rezervë, Aksesorë → marka (Apple, Samsung, Xiaomi…) → njoftimet. Kërkim: «Njoftimet» + «iPhone 14».",
      mk: "**Телефони**: почетна → **Телефони** → Smartphones, аксесоари, марка → оглас.",
      me: "**Telefoni**: početna → **Telefoni** → Smartphones, dodatna oprema, brend → oglas.",
    },
  },
  {
    id: "kompjutere-laptope",
    keywords:
      /laptop|macbook|kompjuter|kompjutër|notebook|\bpc\b|desktop|monitor|server|tablet|acer|dell|lenovo|asus|hp\b|msi\b|razer/i,
    reply: {
      sq: "**Kompjuterë & Laptopë**: faqja kryesore → **Kompjuterë & Laptopë** → Laptopë, Desktop PC, Monitorë, Tabletë, Pjesë Harduerike, Serverë → marka (Apple, Dell, HP…) → njoftimet.",
      mk: "**Компјутери и лаптопи**: почетна → **Компјутери и лаптопи** → лаптоп, PC, монитор…",
      me: "**Kompjuteri i laptopi**: početna → **Kompjuteri i laptopi** → laptop, PC, monitor…",
    },
  },
  {
    id: "tv-elektronike",
    keywords:
      /\btv\b|televiz|frigorifer|soba|klim|kondicion|ngrohje|projektor|konzol|playstation|xbox|gaming|audio|zëri|zeri|kamera|foto|smart\s*watch|elektronik|pajisje\s+shtepi|pajisje\s+shtëpi|mikroval/i,
    reply: {
      sq: "**Elektronikë & Pajisje Shtëpiake**: faqja kryesore → **Elektronikë & Pajisje Shtëpiake** → Televizorë & Projektorë, Pajisje të Mëdha (frigorifer, sobë), Klimatizim, Konzola & Gaming, Audio, Kamera & Smart Watch → njoftimet.",
      mk: "**Електроника за дома**: почетна → **Електроника за дома** → ТВ, бел техника, клима, конзоли…",
      me: "**Elektronika za dom**: početna → **Elektronika za dom** → TV, bijela tehnika, klima, konzole…",
    },
  },
  {
    id: "mobilje-dekorime",
    keywords:
      /mobilje|divan|tavolin|karrige|sofa|kuzhin|dhoma\s+gjumit|tepihe|perde|ndricim|kopsht|teras|dekorim|sallon/i,
    reply: {
      sq: "**Mobilje & Dekorime**: faqja kryesore → **Mobilje & Dekorime** → Sallone & Ulëse, Dhoma e Gjumit, Kuzhina, Tepihë & Perde, Ndriçim, Kopshtit & Terasa → njoftimet.",
      mk: "**Мебел**: почетна → **Мебел** → дневна, спална, кујна, декорација…",
      me: "**Namještaj**: početna → **Namještaj** → dnevna, spavaća, kuhinja, dekoracija…",
    },
  },
  {
    id: "rroba-kepuce",
    keywords:
      /rrob|vesh|këpuc|kepuc|nike|adidas|puma|zara|hm\b|femra|meshkuj|aksesor.*vesh/i,
    reply: {
      sq: "**Rroba & Këpucë**: faqja kryesore → **Rroba & Këpucë** → Veshje për Femra/Meshkuj/Fëmijë, Këpucë, Aksesorë → njoftimet.",
      mk: "**Облека и обувки**: почетна → **Облека и обувки** → облека, чевли…",
      me: "**Odjeća i obuća**: početna → **Odjeća i obuća** → odjeća, cipele…",
    },
  },
  {
    id: "femije",
    keywords:
      /\bfemij|\bfëmij|karroc|lodr|foshnj|bebe|baby|ushqim.*femij|rroba.*femij/i,
    reply: {
      sq: "**Fëmijë**: faqja kryesore → **Fëmijë** → Karroca, Lodra, Pajisje për Foshnje, Rroba për Fëmijë, Ushqim & Higjienë → njoftimet.",
      mk: "**Деца**: почетна → **Деца** → колички, играчки, облека…",
      me: "**Djeca**: početna → **Djeca** → kolica, igračke, odjeća…",
    },
  },
  {
    id: "sport-outdoor",
    keywords:
      /sport\s*&|sport\s+outdoor|biciklet|fitnes|joga|kampingu|top\s*sport|dimëror|dimeror|palest|tenis|futboll(?!.*muzik)/i,
    reply: {
      sq: "**Sport & Outdoor**: faqja kryesore → **Sport & Outdoor** → Biçikleta, Fitnes & Joga, Pajisje Kampingu, Sportet me Top, Sportet Dimërore. (Muzikë/instrumente → **Muzikë & Hobby**, jo këtu.)",
      mk: "**Спорт и аутдор**: почетна → **Спорт и аутдор** → велосипед, фитнес, кампување…",
      me: "**Sport i outdoor**: početna → **Sport i outdoor** → bicikl, fitness, kampovanje…",
    },
  },
  {
    id: "pune-sherbime",
    keywords:
      /punë|pune|shërbim|sherbim|ofertë\s+pune|vend\s+pune|gastronom|it\s+dizajn|marketing|ndërtim|zejtari|transport.*pun/i,
    reply: {
      sq: "**Punë & Shërbime**: faqja kryesore → **Punë & Shërbime** → Administratë, IT & Dizajn, Gastronomi, Marketing, Ndërtimtari, Zejtari, Shërbime Transporti → njoftimet e punës/shërbimeve.",
      mk: "**Работа и услуги**: почетна → **Работа и услуги** → администрација, IT, градежништво…",
      me: "**Posao i usluge**: početna → **Posao i usluge** → administracija, IT, građevina…",
    },
  },
  {
    id: "bujqesi-blegtori",
    keywords:
      /bujq|blegt|bagëti|bageti|farer|plehr|makineri\s+bujq|shpez|ushqim.*kafsh/i,
    reply: {
      sq: "**Bujqësi & Blegtori**: faqja kryesore → **Bujqësi & Blegtori** → Bagëti, Makineri Bujqësore, Farëra & Plehra, Shpezë, Ushqim për Kafshë → njoftimet.",
      mk: "**Земјоделство**: почетна → **Земјоделство** → сточарство, механизација…",
      me: "**Poljoprivreda**: početna → **Poljoprivreda** → stočarstvo, mehanizacija…",
    },
  },
  {
    id: "arsim-kurse",
    keywords:
      /arsim|kurs|kurse|mesim|mësim|trajnim|gjuh.*huaj|shkoll|universitet|leksion|tutor/i,
    reply: {
      sq: "**Arsim & Kurse**: faqja kryesore → **Arsim & Kurse** → Gjuhë të Huaja, Kurse Profesionale, Mësime Private, Trajnime IT → njoftimet.",
      mk: "**Образование и курсеви**: почетна → **Образование и курсеви** → јазици, курсеви, приватни часови…",
      me: "**Obrazovanje i kursevi**: početna → **Obrazovanje i kursevi** → jezici, kursevi, privatni časovi…",
    },
  },
  {
    id: "muzike-hobby",
    keywords:
      /muzik|muzike|muzikë|\bhobi\b|\bhobby\b|instrument|gitar|piano|korde|vinil|studio|mikrofon|amplifikator|bass|drum|violin|flaut|trumpet|synthes/i,
    reply: {
      sq: "**Muzikë & Hobby**: faqja kryesore → **Muzikë & Hobby** → Instrumente Frymore, me Tela, me Tastierë, Libra, Pajisje Studio, Art Teatër & Film → njoftimet. Shitje: «Posto Falas» → **Muzikë & Hobby**.",
      mk: "**Музика и хоби**: почетна → **Музика и хоби** → инструменти, книги, студио…",
      me: "**Muzika i hobi**: početna → **Muzika i hobi** → instrumenti, knjige, studio…",
    },
  },
  {
    id: "libra-muzike",
    keywords: /libër|libra|liber|knig|cd\b|vinil|teatër|teater|film\b|art\b/i,
    reply: {
      sq: "Libra & media: **Muzikë & Hobby** → **Libra** (ose **Art, Teatër & Film**) → njoftimet.",
      mk: "Книги: **Музика и хоби** → **Книги** → огласи.",
      me: "Knjige: **Muzika i hobi** → **Knjige** → oglasi.",
    },
  },
  {
    id: "kafshet",
    keywords:
      /kafsh|qen|qeni|mace|mac(e|ë)\b|kote|papagall|zog|akuarium|shpend|ushqim.*kafsh/i,
    reply: {
      sq: "**Kafshë**: faqja kryesore → **Kafshë** → Qen, Mace, Shpendë, Akuariume, Ushqim & Aksesorë për Kafshë → njoftimet.",
      mk: "**Животни**: почетна → **Животни** → кучиња, мачки, птици…",
      me: "**Životinje**: početna → **Životinje** → psi, mačke, ptice…",
    },
  },
];

/** Recognizes any main-category or common product term (short chat queries). */
export const MARKETPLACE_CATEGORY_HINT =
  /vetur|makin|motor|skuter|kamion|furgon|goma|felne|rrot|auto\s*pjes|banes|apartament|shtep|lokal|zyre|telefon|iphone|laptop|kompjuter|tv\b|frigorifer|klim|konzol|mobilje|divan|rrob|kepuc|femij|fëmij|biciklet|fitnes|punë|pune|bujq|blegt|arsim|kurs|muzik|hobi|instrument|gitar|liber|libra|kafsh|qen|mace|kërkoj|kerkoj|dhurat|falas\b/i;

export function matchCategoryRoute(text: string, lang: UiLang): string | null {
  const t = text.trim();
  if (!t) return null;
  for (const route of KETUJEMI_CATEGORY_ROUTES) {
    if (route.keywords.test(t)) {
      return langText(route.reply, lang);
    }
  }
  return null;
}

/**
 * Category-aware social post copy for Facebook + Instagram auto-post.
 * Facebook and Instagram get different hooks; both mention KetuJemi USP + socials.
 */

const PLATFORM_USP = {
  ks: "🌟 Vetëm në KetuJemi.com — shpallje pa pagesë, të shpejta dhe të promovuara në të gjitha rrjetet tona sociale.",
  al: "🌟 Vetëm në KetuJemi.com — shpallje pa pagesë, të shpejta dhe të promovuara në të gjitha rrjetet tona sociale.",
  mk: "🌟 Само на KetuJemi.com — бесплатни огласи, брзи и промовирани на сите наши социјални мрежи.",
  mne: "🌟 Samo na KetuJemi.com — besplatni oglasi, brzi i promovisani na svim našim društvenim mrežama.",
  en: "🌟 Only on KetuJemi.com — free listings, fast publishing, promoted across all our social channels.",
};

const SOCIAL_FOOTER_FB = {
  ks: [
    "📱 Na ndiqni kudo:",
    "Facebook · KetuJemi.com",
    "Instagram · @ketujemi.ks & @jemi.ketu",
    "TikTok · @ketujemi7",
    "🌐 ketujemi.com",
  ].join("\n"),
  al: [
    "📱 Na ndiqni kudo:",
    "Facebook · KetuJemi.com",
    "Instagram · @ketujemi.ks & @jemi.ketu",
    "TikTok · @ketujemi7",
    "🌐 ketujemi.com",
  ].join("\n"),
  mk: [
    "📱 Следете не:",
    "Facebook · KetuJemi.com",
    "Instagram · @ketujemi.ks & @jemi.ketu",
    "TikTok · @ketujemi7",
    "🌐 ketujemi.com",
  ].join("\n"),
  mne: [
    "📱 Pratite nas:",
    "Facebook · KetuJemi.com",
    "Instagram · @ketujemi.ks & @jemi.ketu",
    "TikTok · @ketujemi7",
    "🌐 ketujemi.com",
  ].join("\n"),
  en: [
    "📱 Follow us:",
    "Facebook · KetuJemi.com",
    "Instagram · @ketujemi.ks & @jemi.ketu",
    "TikTok · @ketujemi7",
    "🌐 ketujemi.com",
  ].join("\n"),
};

const SOCIAL_FOOTER_IG = {
  ks: "📲 KetuJemi.com — shpallje falas · FB KetuJemi · IG @ketujemi.ks & @jemi.ketu · TikTok @ketujemi7",
  al: "📲 KetuJemi.com — shpallje falas · FB KetuJemi · IG @ketujemi.ks & @jemi.ketu · TikTok @ketujemi7",
  mk: "📲 KetuJemi.com — бесплатни огласи · FB KetuJemi · IG @ketujemi.ks & @jemi.ketu · TikTok @ketujemi7",
  mne: "📲 KetuJemi.com — besplatni oglasi · FB KetuJemi · IG @ketujemi.ks & @jemi.ketu · TikTok @ketujemi7",
  en: "📲 KetuJemi.com — free ads · FB KetuJemi · IG @ketujemi.ks & @jemi.ketu · TikTok @ketujemi7",
};

/** @type {Record<string, { fb: Record<string, string>; ig: Record<string, string> }>} */
const CATEGORY_FLAIR = {
  decor: {
    fb: {
      ks: "Klienti ynë e di si ta bëjë dasmën magjike — zbukurime që lënë pa frymë dhe çdo detaj të kujdesshëm! ✨",
      al: "Klienti ynë e di si ta bëjë dasmën magjike — zbukurime që lënë pa frymë dhe çdo detaj të kujdesshëm! ✨",
      mk: "Нашиот клиент знае како да ја направи свадбата магична — декорации што оставаат без здив! ✨",
      mne: "Naš klijent zna kako da napravi magično vjenčanje — dekoracije koje oduzimaju dah! ✨",
      en: "Our seller knows how to make every celebration unforgettable — stunning décor that wows every guest! ✨",
    },
    ig: {
      ks: "Dasmë e ëndrrave fillon këtu 💐 Zbukurime që flasin vetë — shiko çfarë ka përgatitur klienti ynë!",
      al: "Dasmë e ëndrrave fillon këtu 💐 Zbukurime që flasin vetë — shiko çfarë ka përgatitur klienti ynë!",
      mk: "Свадба од соништата започнува тука 💐 Декорации што зборуваат сами!",
      mne: "Vjenčanje iz snova počinje ovdje 💐 Dekoracije koje govore same!",
      en: "Dream wedding vibes right here 💐 Décor that speaks for itself!",
    },
  },
  phones: {
    fb: {
      ks: "Sapo kanë arritur telefona të mirë e të rinë — cilësi e lartë, çmim që të pëlqen! 📱",
      al: "Sapo kanë arritur telefona të mirë e të rinë — cilësi e lartë, çmim që të pëlqen! 📱",
      mk: "Токму пристигнаа добри и нови телефони — висок квалитет, одлична цена! 📱",
      mne: "Upravo stigli dobri i novi telefoni — vrhunski kvalitet, odlična cijena! 📱",
      en: "Fresh phones just landed — great condition, sharp price, ready for you! 📱",
    },
    ig: {
      ks: "Telefon i ri, ofertë e nxehtë 🔥 Kontrollo para se të ikë — klienti ynë ofron cilësi!",
      al: "Telefon i ri, ofertë e nxehtë 🔥 Kontrollo para se të ikë — klienti ynë ofron cilësi!",
      mk: "Нов телефон, жешка понуда 🔥 Провери пред да замине!",
      mne: "Novi telefon, vruća ponuda 🔥 Provjeri prije nego nestane!",
      en: "New phone, hot deal 🔥 Check it before it's gone!",
    },
  },
  electronics: {
    fb: {
      ks: "Teknologji e re që e bën jetën më të lehtë — pajisje të mira nga klienti ynë i besueshëm! 💻",
      al: "Teknologji e re që e bën jetën më të lehtë — pajisje të mira nga klienti ynë i besueshëm! 💻",
      mk: "Нова технологија што ја олеснува животот — квалитетна опрема од наш клиент! 💻",
      mne: "Nova tehnologija koja olakšava život — kvalitetna oprema od našeg klijenta! 💻",
      en: "Smart tech that makes life easier — quality gear from a trusted seller! 💻",
    },
    ig: {
      ks: "Upgrade-i që e meriton 👾 Laptop, TV apo gadget — gjithçka funksionale & e gatshme!",
      al: "Upgrade-i që e meriton 👾 Laptop, TV apo gadget — gjithçka funksionale & e gatshme!",
      mk: "Надградба што ја заслужуваш 👾 Лаптоп, ТВ или gadget — се е спремно!",
      mne: "Nadogradnja koju zaslužuješ 👾 Laptop, TV ili gadget — sve spremno!",
      en: "The upgrade you deserve 👾 Laptop, TV or gadget — ready to go!",
    },
  },
  vehicles: {
    fb: {
      ks: "Veturë e kujdesshme nga klienti ynë — gati për rrugë, me detaje që të impresionojnë! 🚗",
      al: "Veturë e kujdesshme nga klienti ynë — gati për rrugë, me detaje që të impresionojnë! 🚗",
      mk: "Грижливо одржувано возило од наш клиент — подготвено за пат! 🚗",
      mne: "Pažljivo održavano vozilo od našeg klijenta — spremno za put! 🚗",
      en: "Well-kept vehicle from our seller — road-ready and worth a look! 🚗",
    },
    ig: {
      ks: "Rrugë e re, aventurë e re 🚘 Shiko këtë ofertë — klienti ynë e di çfarë shet!",
      al: "Rrugë e re, aventurë e re 🚘 Shiko këtë ofertë — klienti ynë e di çfarë shet!",
      mk: "Нов пат, нова авантура 🚘 Погледни ја понудата!",
      mne: "Novi put, nova avantura 🚘 Pogledaj ponudu!",
      en: "New roads ahead 🚘 Take a look at this ride!",
    },
  },
  real_estate: {
    fb: {
      ks: "Hapësirë që mund të bëhet shtëpia apo biznesi yt — lokacion i mirë, mundësi e vërtetë! 🏠",
      al: "Hapësirë që mund të bëhet shtëpia apo biznesi yt — lokacion i mirë, mundësi e vërtetë! 🏠",
      mk: "Простор што може да стане твој дом или бизнис — одлична локација! 🏠",
      mne: "Prostor koji može postati tvoj dom ili biznis — odlična lokacija! 🏠",
      en: "Space that could be your next home or business — real opportunity! 🏠",
    },
    ig: {
      ks: "Shtëpi, banesë apo lokal — zgjidhja që po kërkon mund të jetë këtu 🔑",
      al: "Shtëpi, banesë apo lokal — zgjidhja që po kërkon mund të jetë këtu 🔑",
      mk: "Дом, стан или локал — решението може да е тука 🔑",
      mne: "Kuća, stan ili lokal — rješenje možda je ovdje 🔑",
      en: "Home, flat or commercial space — your next move might be here 🔑",
    },
  },
  fashion: {
    fb: {
      ks: "Stil që të bën të dallohesh — klienti ynë ofron pjesë të zgjedhura me kujdes! 👗",
      al: "Stil që të bën të dallohesh — klienti ynë ofron pjesë të zgjedhura me kujdes! 👗",
      mk: "Стил што те истакнува — избрани парчиња од наш клиент! 👗",
      mne: "Stil koji te ističe — odabrani komadi od našeg klijenta! 👗",
      en: "Style that stands out — hand-picked fashion from our seller! 👗",
    },
    ig: {
      ks: "Veshje & këpucë që të përshtaten ✨ Shiko çfarë ka zgjedhur klienti ynë për ty!",
      al: "Veshje & këpucë që të përshtaten ✨ Shiko çfarë ka zgjedhur klienti ynë për ty!",
      mk: "Облека и обувки што ти одговараат ✨ Погледни!",
      mne: "Odjeća i cipele koje ti odgovaraju ✨ Pogledaj!",
      en: "Clothes & shoes you'll love ✨ See what our seller picked!",
    },
  },
  children: {
    fb: {
      ks: "Për fëmijën tënd — produkte të kujdesshme nga klienti ynë, të sigurta & të bukura! 🧸",
      al: "Për fëmijën tënd — produkte të kujdesshme nga klienti ynë, të sigurta & të bukura! 🧸",
      mk: "За твоето дете — нега и квалитет од наш клиент! 🧸",
      mne: "Za tvoje dijete — briga i kvalitet od našeg klijenta! 🧸",
      en: "For your little one — thoughtful picks from a caring seller! 🧸",
    },
    ig: {
      ks: "Gjithçka për fëmijë 👶 Rroba, lodra, karrocë — klienti ynë e di çfarë u duhet prindërve!",
      al: "Gjithçka për fëmijë 👶 Rroba, lodra, karrocë — klienti ynë e di çfarë u duhet prindërve!",
      mk: "Сè за децата 👶 Нашиот клиент знае што им треба на родителите!",
      mne: "Sve za djecu 👶 Naš klijent zna šta roditeljima treba!",
      en: "All things kids 👶 Our seller knows what parents need!",
    },
  },
  jobs: {
    fb: {
      ks: "Mundësi e re pune apo shërbimi cilësor — klienti ynë ofron diçka që vlen të shohësh! 💼",
      al: "Mundësi e re pune apo shërbimi cilësor — klienti ynë ofron diçka që vlen të shohësh! 💼",
      mk: "Нова можност за работа или квалитетна услуга од наш клиент! 💼",
      mne: "Nova prilika za posao ili kvalitetna usluga od našeg klijenta! 💼",
      en: "New job or quality service opportunity — worth your attention! 💼",
    },
    ig: {
      ks: "Punë apo shërbim që të intereson? 👀 Klienti ynë pret kontaktin tënd!",
      al: "Punë apo shërbim që të intereson? 👀 Klienti ynë pret kontaktin tënd!",
      mk: "Работа или услуга што те интересира? 👀 Контактирај!",
      mne: "Posao ili usluga koja te zanima? 👀 Javi se!",
      en: "Job or service on your radar? 👀 Get in touch!",
    },
  },
  sport: {
    fb: {
      ks: "Për stilin aktiv — pajisje sportive nga klienti ynë, gati për aventurën tënde! ⚽",
      al: "Për stilin aktiv — pajisje sportive nga klienti ynë, gati për aventurën tënde! ⚽",
      mk: "За активен стил — спортска опрема од наш клиент! ⚽",
      mne: "Za aktivan stil — sportska oprema od našeg klijenta! ⚽",
      en: "For active living — sports gear from our seller, adventure-ready! ⚽",
    },
    ig: {
      ks: "Lëviz, stërvitu, shijo natyrën 🏃 Biçikletë, pajisje, outdoor — shiko ofertën!",
      al: "Lëviz, stërvitu, shijo natyrën 🏃 Biçikletë, pajisje, outdoor — shiko ofertën!",
      mk: "Движи се, тренирај, уживај 🏃 Погледни ја понудата!",
      mne: "Kreći se, treniraj, uživaj 🏃 Pogledaj ponudu!",
      en: "Move, train, explore 🏃 Bikes, gear, outdoor — check it out!",
    },
  },
  animals: {
    fb: {
      ks: "Për dashamirët e kafshëve — klienti ynë ofron kujdes dhe përkushtim të vërtetë! 🐾",
      al: "Për dashamirët e kafshëve — klienti ynë ofron kujdes dhe përkushtim të vërtetë! 🐾",
      mk: "За љубителите на животни — грижа од наш клиент! 🐾",
      mne: "Za ljubitelje životinja — briga od našeg klijenta! 🐾",
      en: "For pet lovers — real care from a dedicated seller! 🐾",
    },
    ig: {
      ks: "Kafshë & aksesorë me dashuri 🐾 Shiko çfarë ka postuar klienti ynë!",
      al: "Kafshë & aksesorë me dashuri 🐾 Shiko çfarë ka postuar klienti ynë!",
      mk: "Миленици и додатоци со љубов 🐾 Погледни!",
      mne: "Ljubimci i oprema s ljubavlju 🐾 Pogledaj!",
      en: "Pets & accessories with love 🐾 Take a look!",
    },
  },
  agriculture: {
    fb: {
      ks: "Nga fusha në tryezë — produkte & pajisje bujqësore nga klienti ynë me përvojë! 🌾",
      al: "Nga fusha në tryezë — produkte & pajisje bujqësore nga klienti ynë me përvojë! 🌾",
      mk: "Од поле до маса — земјоделски производи од наш клиент! 🌾",
      mne: "Od polja do stola — poljoprivredni proizvodi od našeg klijenta! 🌾",
      en: "From field to table — agricultural goods from an experienced seller! 🌾",
    },
    ig: {
      ks: "Bujqësi & blegtori autentike 🌿 Klienti ynë ofron cilësi natyrale!",
      al: "Bujqësi & blegtori autentike 🌿 Klienti ynë ofron cilësi natyrale!",
      mk: "Автентично земјоделство 🌿 Погледни понудата!",
      mne: "Autentična poljoprivreda 🌿 Pogledaj ponudu!",
      en: "Authentic farm & agri finds 🌿 See the listing!",
    },
  },
  construction: {
    fb: {
      ks: "Për shtëpinë apo objektin tënd — materiale & shërbime nga klienti ynë profesional! 🔧",
      al: "Për shtëpinë apo objektin tënd — materiale & shërbime nga klienti ynë profesional! 🔧",
      mk: "За твојот дом или објект — материјали и услуги од професионалец! 🔧",
      mne: "Za tvoj dom ili objekat — materijali i usluge od profesionalca! 🔧",
      en: "For your home project — materials & services from a pro seller! 🔧",
    },
    ig: {
      ks: "Ndërtim & instalime që zgjasin 🛠️ Klienti ynë e di punën — shiko detajet!",
      al: "Ndërtim & instalime që zgjasin 🛠️ Klienti ynë e di punën — shiko detajet!",
      mk: "Градба и инсталации што траат 🛠️ Погледни!",
      mne: "Gradnja i instalacije koje traju 🛠️ Pogledaj!",
      en: "Build & install that lasts 🛠️ See the details!",
    },
  },
  music: {
    fb: {
      ks: "Për zemrat që jetojnë me muzikë — instrumente & hobby nga klienti ynë me pasion! 🎵",
      al: "Për zemrat që jetojnë me muzikë — instrumente & hobby nga klienti ynë me pasion! 🎵",
      mk: "За љубителите на музика — инструменти од наш клиент! 🎵",
      mne: "Za ljubitelje muzike — instrumenti od našeg klijenta! 🎵",
      en: "For music lovers — instruments & hobby gear from a passionate seller! 🎵",
    },
    ig: {
      ks: "Tinguj që frymëzojnë 🎸 Muzikë, hobby & kreativitet — shiko ofertën!",
      al: "Tinguj që frymëzojnë 🎸 Muzikë, hobby & kreativitet — shiko ofertën!",
      mk: "Звуци што инспирираат 🎸 Погледни!",
      mne: "Zvuci koji inspirišu 🎸 Pogledaj!",
      en: "Sounds that inspire 🎸 Music, hobby & creativity!",
    },
  },
  education: {
    fb: {
      ks: "Investim në të ardhmen — kurse & arsim nga klienti ynë që di të mësojë! 📚",
      al: "Investim në të ardhmen — kurse & arsim nga klienti ynë që di të mësojë! 📚",
      mk: "Инвестиција во иднината — курсеви и образование од наш клиент! 📚",
      mne: "Investicija u budućnost — kursevi i obrazovanje od našeg klijenta! 📚",
      en: "Invest in your future — courses & education from a knowledgeable seller! 📚",
    },
    ig: {
      ks: "Mëso diçka të re sot 📖 Arsim & kurse — klienti ynë ndan dijen e tij!",
      al: "Mëso diçka të re sot 📖 Arsim & kurse — klienti ynë ndan dijen e tij!",
      mk: "Научи нешто ново денес 📖 Погледни!",
      mne: "Nauči nešto novo danas 📖 Pogledaj!",
      en: "Learn something new today 📖 Courses & education!",
    },
  },
  default: {
    fb: {
      ks: "Ofertë e zgjedhur nga klienti ynë — cilësi që vlen të shohësh para të gjithëve! ⭐",
      al: "Ofertë e zgjedhur nga klienti ynë — cilësi që vlen të shohësh para të gjithëve! ⭐",
      mk: "Избрана понуда од наш клиент — квалитет што вреди да го видиш! ⭐",
      mne: "Izabrana ponuda od našeg klijenta — kvalitet koji vrijedi vidjeti! ⭐",
      en: "A featured pick from our seller — quality worth seeing first! ⭐",
    },
    ig: {
      ks: "Zgjedhje e veçantë sot ✨ Klienti ynë e ka përgatitur këtë ofertë për ty!",
      al: "Zgjedhje e veçantë sot ✨ Klienti ynë e ka përgatitur këtë ofertë për ty!",
      mk: "Специјален избор денес ✨ Погледни ја понудата!",
      mne: "Poseban izbor danas ✨ Pogledaj ponudu!",
      en: "Special pick today ✨ Our seller prepared this for you!",
    },
  },
};

const DIASPORA_MARKETS = new Set(["de", "ch", "at", "fr", "it", "gb", "us"]);

function normalizeCategoryKey(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * @param {string | null | undefined} categoryName
 * @returns {keyof typeof CATEGORY_FLAIR}
 */
export function resolveCategoryTheme(categoryName) {
  const n = normalizeCategoryKey(categoryName);
  if (/dekor|dasm|zbukurim|lule|mobilje|karroce|ceremoni|event/.test(n)) return "decor";
  if (/telefon|smartphone|iphone|samsung|huawei|xiaomi|tablet/.test(n)) return "phones";
  if (/kompjuter|laptop|elektronik|televizor|pajisje shtepiake|gadget|\btv\b/.test(n)) return "electronics";
  if (/vetur|motor|skuter|kamion|furgon|auto pjese|rimorkio|trailer/.test(n)) return "vehicles";
  if (/banes|shtepi|apartament|lokal|zyre|patundshm|toka|truall|vikendic/.test(n)) return "real_estate";
  if (/rrob|kepuce|veshje|mod/.test(n)) return "fashion";
  if (/femij|bebe|djal|vajz|karroce|lodr/.test(n)) return "children";
  if (/pune|sherbim|profesion/.test(n)) return "jobs";
  if (/sport|biciklet|fitness|outdoor|kamping|gym/.test(n)) return "sport";
  if (/kafsh|qen|mace|pet/.test(n)) return "animals";
  if (/bujqesi|blegtori|bujq|ferm/.test(n)) return "agriculture";
  if (/ndertim|instalim|material|ndert/.test(n)) return "construction";
  if (/muzik|instrument|hobby/.test(n)) return "music";
  if (/arsim|kurs|shkoll|mesimdhen/.test(n)) return "education";
  return "default";
}

function marketLang(market) {
  if (DIASPORA_MARKETS.has(market)) return "en";
  if (market === "mk") return "mk";
  if (market === "mne") return "mne";
  if (market === "al") return "al";
  return "ks";
}

/**
 * @param {"facebook" | "instagram"} platform
 * @param {string} market
 * @param {string | null | undefined} categoryName
 */
export function categoryFlairLine(platform, market, categoryName) {
  const theme = resolveCategoryTheme(categoryName);
  const lang = marketLang(market);
  const block = CATEGORY_FLAIR[theme] ?? CATEGORY_FLAIR.default;
  const lines = platform === "instagram" ? block.ig : block.fb;
  return lines[lang] ?? lines.ks;
}

export function platformUspLine(market) {
  const lang = marketLang(market);
  return PLATFORM_USP[lang] ?? PLATFORM_USP.ks;
}

export function socialFooterBlock(platform, market) {
  const lang = marketLang(market);
  if (platform === "instagram") {
    return SOCIAL_FOOTER_IG[lang] ?? SOCIAL_FOOTER_IG.ks;
  }
  return SOCIAL_FOOTER_FB[lang] ?? SOCIAL_FOOTER_FB.ks;
}

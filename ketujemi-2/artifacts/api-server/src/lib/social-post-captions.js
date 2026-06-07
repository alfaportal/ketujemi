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
  event_wedding: {
    fb: {
      ks: "{seller} e di si ta bëjë dasmën magjike — zbukurime që lënë pa frymë çdo mysafir! ✨",
      al: "{seller} e di si ta bëjë dasmën magjike — zbukurime që lënë pa frymë çdo mysafir! ✨",
      mk: "{seller} знае како да направи магична свадба — декорации што оставаат без здив! ✨",
      mne: "{seller} zna kako da napravi magično vjenčanje — dekoracije koje oduzimaju dah! ✨",
      en: "{seller} knows how to make weddings unforgettable — stunning décor for your big day! ✨",
    },
    ig: {
      ks: "Dasmë e ëndrrave nga {seller} 💐 Zbukurime & detaje që flasin vetë!",
      al: "Dasmë e ëndrrave nga {seller} 💐 Zbukurime & detaje që flasin vetë!",
      mk: "Свадба од соништата од {seller} 💐 Декорации што зборуваат сами!",
      mne: "Vjenčanje iz snova od {seller} 💐 Dekoracije koje govore same!",
      en: "Dream wedding décor from {seller} 💐 Every detail counts!",
    },
  },
  event_engagement: {
    fb: {
      ks: "Fejesë e bukur fillon me detaje — {seller} ofron zbukurime & aksesorë për momentin tuaj! 💍",
      al: "Fejesë e bukur fillon me detaje — {seller} ofron zbukurime & aksesorë për momentin tuaj! 💍",
      mk: "Веридбата започнува со детали — {seller} нуди декорации за вашиот момент! 💍",
      mne: "Vjeridba počinje detaljima — {seller} nudi dekoracije za vaš trenutak! 💍",
      en: "A beautiful engagement starts with the details — {seller} has décor & styling ready! 💍",
    },
    ig: {
      ks: "Fejesë & festë e veçantë nga {seller} 💍 Shiko çfarë përgatiti për çiftin!",
      al: "Fejesë & festë e veçantë nga {seller} 💍 Shiko çfarë përgatiti për çiftin!",
      mk: "Веридба од {seller} 💍 Погледни ја понудата!",
      mne: "Vjeridba od {seller} 💍 Pogledaj ponudu!",
      en: "Engagement celebration from {seller} 💍 See what's ready!",
    },
  },
  event_birthday: {
    fb: {
      ks: "Ditëlindje që mbeten në mendje — {seller} ka dekorime, torte & surpriza për festën tënde! 🎂",
      al: "Ditëlindje që mbeten në mendje — {seller} ka dekorime, torte & surpriza për festën tënde! 🎂",
      mk: "Роденден што се памети — {seller} има декорации за вашата забава! 🎂",
      mne: "Rođendan koji se pamti — {seller} ima dekoracije za vašu proslavu! 🎂",
      en: "Birthdays they'll remember — {seller} has décor & party essentials! 🎂",
    },
    ig: {
      ks: "Festë ditëlindjeje nga {seller} 🎈 Dekorime që sjellin gëzim!",
      al: "Festë ditëlindjeje nga {seller} 🎈 Dekorime që sjellin gëzim!",
      mk: "Роденденска забава од {seller} 🎈 Погледни!",
      mne: "Rođendanska proslava od {seller} 🎈 Pogledaj!",
      en: "Birthday party vibes from {seller} 🎈 Check it out!",
    },
  },
  event_party: {
    fb: {
      ks: "Feste & ceremoni me stil — {seller} ofron zbukurime për çdo rast të veçantë! 🎉",
      al: "Feste & ceremoni me stil — {seller} ofron zbukurime për çdo rast të veçantë! 🎉",
      mk: "Прослава со стил — {seller} нуди декорации за секоја прилика! 🎉",
      mne: "Proslava sa stilom — {seller} nudi dekoracije za svaku priliku! 🎉",
      en: "Stylish celebrations — {seller} has décor for every special occasion! 🎉",
    },
    ig: {
      ks: "Zbukurime për festën tënde nga {seller} 🎊 Shiko ofertën!",
      al: "Zbukurime për festën tënde nga {seller} 🎊 Shiko ofertën!",
      mk: "Декорации за вашата прослава од {seller} 🎊",
      mne: "Dekoracije za vašu proslavu od {seller} 🎊",
      en: "Party décor from {seller} 🎊 Worth a look!",
    },
  },
  event_decor: {
    fb: {
      ks: "Zbukurime për çdo festë — dasmë, fejesë, ditëlindje & më shumë nga {seller}! 💐",
      al: "Zbukurime për çdo festë — dasmë, fejesë, ditëlindje & më shumë nga {seller}! 💐",
      mk: "Декорации за секоја прослава — од {seller}! 💐",
      mne: "Dekoracije za svaku proslavu — od {seller}! 💐",
      en: "Celebration décor for every occasion — from {seller}! 💐",
    },
    ig: {
      ks: "Dekor & stil për festat e tua nga {seller} ✨",
      al: "Dekor & stil për festat e tua nga {seller} ✨",
      mk: "Декор од {seller} за вашите прослави ✨",
      mne: "Dekor od {seller} za vaše proslave ✨",
      en: "Celebration styling from {seller} ✨",
    },
  },
  home_decor: {
    fb: {
      ks: "Mobilje & dekor për shtëpinë tënde — stil dhe komoditet nga {seller}! 🛋️",
      al: "Mobilje & dekor për shtëpinë tënde — stil dhe komoditet nga {seller}! 🛋️",
      mk: "Мебел и декор за домот — стил од {seller}! 🛋️",
      mne: "Namještaj i dekor za dom — stil od {seller}! 🛋️",
      en: "Home furniture & décor with style — from {seller}! 🛋️",
    },
    ig: {
      ks: "Zbukuro ambientin tënd me ofertën e {seller} 🏠",
      al: "Zbukuro ambientin tënd me ofertën e {seller} 🏠",
      mk: "Украси го просторот со понуда од {seller} 🏠",
      mne: "Ukrasi prostor ponudom od {seller} 🏠",
      en: "Refresh your space with {seller} 🏠",
    },
  },
  phones: {
    fb: {
      ks: "Telefona të mirë e të rinë nga {seller} — cilësi e lartë, çmim që të pëlqen! 📱",
      al: "Telefona të mirë e të rinë nga {seller} — cilësi e lartë, çmim që të pëlqen! 📱",
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
  re_apartment: {
    fb: {
      ks: "Banesë / apartament me potencial — {seller} ofron pronë në lokacion të mirë! 🏢",
      al: "Banesë / apartament me potencial — {seller} ofron pronë në lokacion të mirë! 🏢",
      mk: "Стан / банса со потенцијал — понуда од {seller}! 🏢",
      mne: "Stan / apartman sa potencijalom — ponuda od {seller}! 🏢",
      en: "Apartment with real potential — listed by {seller}! 🏢",
    },
    ig: {
      ks: "Banesë që vlen të shohësh — nga {seller} 🔑",
      al: "Banesë që vlen të shohësh — nga {seller} 🔑",
      mk: "Стан вреден за преглед — од {seller} 🔑",
      mne: "Stan vrijedan pregleda — od {seller} 🔑",
      en: "Apartment worth viewing — from {seller} 🔑",
    },
  },
  re_house: {
    fb: {
      ks: "Shtëpi, vilë apo vikendicë — {seller} prezanton pronë për familjen tënde! 🏡",
      al: "Shtëpi, vilë apo vikendicë — {seller} prezanton pronë për familjen tënde! 🏡",
      mk: "Куќа, вила или викендица — понуда од {seller}! 🏡",
      mne: "Kuća, vila ili vikendica — ponuda od {seller}! 🏡",
      en: "House, villa or weekend retreat — from {seller}! 🏡",
    },
    ig: {
      ks: "Shtëpi me hapësirë & stil nga {seller} 🏡",
      al: "Shtëpi me hapësirë & stil nga {seller} 🏡",
      mk: "Куќа со простор од {seller} 🏡",
      mne: "Kuća sa prostorom od {seller} 🏡",
      en: "A home with space & character — {seller} 🏡",
    },
  },
  re_land: {
    fb: {
      ks: "Tokë / truall për ndërtim apo investim — mundësi nga {seller}! 📐",
      al: "Tokë / truall për ndërtim apo investim — mundësi nga {seller}! 📐",
      mk: "Земјиште / парцела за градба — понуда од {seller}! 📐",
      mne: "Zemljište / plac za gradnju — ponuda od {seller}! 📐",
      en: "Land & building plots — opportunity from {seller}! 📐",
    },
    ig: {
      ks: "Tokë & truall nga {seller} — shiko detajet! 🌿",
      al: "Tokë & truall nga {seller} — shiko detajet! 🌿",
      mk: "Земјиште од {seller} 🌿",
      mne: "Zemljište od {seller} 🌿",
      en: "Land for your next project — {seller} 🌿",
    },
  },
  re_garage: {
    fb: {
      ks: "Garazh / vendparkim — zgjidhje praktike nga {seller}! 🅿️",
      al: "Garazh / vendparkim — zgjidhje praktike nga {seller}! 🅿️",
      mk: "Гаража / паркинг — понуда од {seller}! 🅿️",
      mne: "Garaža / parking — ponuda od {seller}! 🅿️",
      en: "Garage or parking space — practical option from {seller}! 🅿️",
    },
    ig: {
      ks: "Garazh apo parking nga {seller} 🅿️",
      al: "Garazh apo parking nga {seller} 🅿️",
      mk: "Гаража од {seller} 🅿️",
      mne: "Garaža od {seller} 🅿️",
      en: "Garage & parking from {seller} 🅿️",
    },
  },
  re_rent: {
    fb: {
      ks: "Me qira — hapësirë e gatshme për të jetuar apo punuar, ofruar nga {seller}! 🔑",
      al: "Me qira — hapësirë e gatshme për të jetuar apo punuar, ofruar nga {seller}! 🔑",
      mk: "Под кирија — простор од {seller}! 🔑",
      mne: "Pod najam — prostor od {seller}! 🔑",
      en: "For rent — ready-to-move space from {seller}! 🔑",
    },
    ig: {
      ks: "Qira e mirë nga {seller} — kontrollo ofertën! 🏠",
      al: "Qira e mirë nga {seller} — kontrollo ofertën! 🏠",
      mk: "Добар кирија од {seller} 🏠",
      mne: "Dobar najam od {seller} 🏠",
      en: "Rental pick from {seller} 🏠",
    },
  },
  re_commercial: {
    fb: {
      ks: "Lokal, zyrë, depo apo hapësirë afariste — {seller} ka pronë për biznesin tënd! 🏪",
      al: "Lokal, zyrë, depo apo hapësirë afariste — {seller} ka pronë për biznesin tënd! 🏪",
      mk: "Локал, канцеларија или магацин — понуда од {seller}! 🏪",
      mne: "Lokal, kancelarija ili magacin — ponuda od {seller}! 🏪",
      en: "Shop, office or warehouse space — commercial listing from {seller}! 🏪",
    },
    ig: {
      ks: "Hapësirë komerciale nga {seller} — ideale për biznes! 🏪",
      al: "Hapësirë komerciale nga {seller} — ideale për biznes! 🏪",
      mk: "Комерцијален простор од {seller} 🏪",
      mne: "Komercijalni prostor od {seller} 🏪",
      en: "Commercial space from {seller} 🏪",
    },
  },
  real_estate: {
    fb: {
      ks: "Pronë me vlerë nga {seller} — lokacion i mirë, mundësi reale! 🏠",
      al: "Pronë me vlerë nga {seller} — lokacion i mirë, mundësi reale! 🏠",
      mk: "Недвижност од {seller} — одлична локација! 🏠",
      mne: "Nekretnina od {seller} — odlična lokacija! 🏠",
      en: "Property with real value — from {seller}! 🏠",
    },
    ig: {
      ks: "Patundshmëri nga {seller} — shiko nëse të përshtatet! 🔑",
      al: "Patundshmëri nga {seller} — shiko nëse të përshtatet! 🔑",
      mk: "Недвижност од {seller} 🔑",
      mne: "Nekretnina od {seller} 🔑",
      en: "Property listing from {seller} 🔑",
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

/** Root category slug → social theme (authoritative when present). */
const ROOT_SLUG_THEME = {
  vetura: "vehicles",
  "motorr-skuter": "vehicles",
  "kamione-furgone": "vehicles",
  "auto-pjese": "vehicles",
  "banesa-shtepi": "real_estate",
  "lokale-zyre": "real_estate",
  telefona: "phones",
  "kompjutere-laptope": "electronics",
  "tv-elektronike": "electronics",
  "mobilje-dekorime": "home_decor",
  "rroba-kepuce": "fashion",
  femije: "children",
  "sport-outdoor": "sport",
  "pune-sherbime": "jobs",
  "ndertim-instalime": "construction",
  "bujqesi-blegtori": "agriculture",
  "arsim-kurse": "education",
  "muzike-hobby": "music",
  kafshet: "animals",
  "kerkoj-te-blej": "default",
  "dhurata-falas": "default",
};

/** Slug prefix families when root slug is unavailable. */
const SLUG_PREFIX_THEME = [
  ["telefona-", "phones"],
  ["femije-", "children"],
  ["mobilje-", "home_decor"],
  ["vetura-", "vehicles"],
  ["motorr-", "vehicles"],
  ["kompjutere-laptope-", "electronics"],
  ["tv-elektronike-", "electronics"],
  ["rroba-", "fashion"],
  ["sport-", "sport"],
  ["pune-", "jobs"],
  ["ndertim-", "construction"],
  ["bujqesi-", "agriculture"],
  ["arsim-", "education"],
  ["muzike-", "music"],
];

function normalizeCategoryKey(name) {
  return String(name ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function parseCategoryInput(input) {
  if (input == null) return { categoryName: null, categorySlug: null, rootCategorySlug: null };
  if (typeof input === "string") return { categoryName: input, categorySlug: null, rootCategorySlug: null };
  return {
    categoryName: input.categoryName ?? input.category_name ?? null,
    categorySlug: input.categorySlug ?? input.category_slug ?? null,
    rootCategorySlug: input.rootCategorySlug ?? input.root_category_slug ?? null,
  };
}

function listingTextBlob(ctx) {
  return normalizeCategoryKey(
    [ctx.title, ctx.description, ctx.categoryName, ctx.propertySubtype, ctx.propertyTxn]
      .filter(Boolean)
      .join(" "),
  );
}

/** Detect celebration/décor type from listing text. */
function detectEventTheme(text) {
  if (!text) return null;
  if (
    /\bdasma\b|\bdasem\b|\bdasme\b|\bdasmes\b/.test(text) ||
    /\bnuses\b|\bnuseri/.test(text) ||
    /\bzbukurim\b.*\bdasm/.test(text) ||
    /\blule\b.*\bdasm/.test(text) ||
    /\bkarroce nuses\b|\bkarroca nuses\b/.test(text) ||
    /\bfustan nuses\b/.test(text)
  ) {
    return "event_wedding";
  }
  if (/\bfejes|\bfejesa\b|\bfejeses\b/.test(text)) return "event_engagement";
  if (/\bditlindje\b|\bditelindje\b|\bbirthday\b|\brojendan/.test(text)) return "event_birthday";
  if (/\bfeste\b|\bceremoni\b|\bparty\b|\bkanagjegj\b|\bbaby shower\b|\bproslav/.test(text)) {
    return "event_party";
  }
  if (/\bdekor\b|\bzbukurim\b|\blule\b|\btavolin|\bdfuq|\bbalon|\bdekoracij/.test(text)) {
    return "event_decor";
  }
  return null;
}

/** Detect property subtype for Banesa & Shtëpi / Lokale & Zyrë. */
function detectRealEstateTheme(ctx) {
  const slug = normalizeCategoryKey(ctx.categorySlug);
  const root = normalizeCategoryKey(ctx.rootCategorySlug);
  const text = listingTextBlob(ctx);
  const subtype = normalizeCategoryKey(ctx.propertySubtype);
  const txn = normalizeCategoryKey(ctx.propertyTxn);

  if (
    slug.includes("garazh") ||
    subtype.includes("garazh") ||
    /\bgarazh\b|\bvendparkim\b|\bparking\b/.test(text)
  ) {
    return "re_garage";
  }
  if (
    slug.includes("toka") ||
    slug.includes("truall") ||
    subtype.includes("truall") ||
    subtype.includes("toka") ||
    /\btoka\b|\btruall\b|\bparcela\b|\bplac\b/.test(text)
  ) {
    return "re_land";
  }
  if (
    slug.includes("shtepi") ||
    slug.includes("vila") ||
    slug.includes("vikendic") ||
    subtype.includes("shtepi") ||
    subtype.includes("vila") ||
    /\bshtepi\b|\bvila\b|\bvikendic/.test(text)
  ) {
    return "re_house";
  }
  if (
    slug.includes("dhoma-qira") ||
    txn === "qira" ||
    txn === "rent" ||
    txn === "me_qira" ||
    /\bme qira\b|\bqira\b|\bnajam\b|\bkirija\b/.test(text)
  ) {
    return "re_rent";
  }
  if (
    root === "lokale-zyre" ||
    slug.includes("lokale") ||
    slug.includes("zyre") ||
    slug.includes("depo") ||
    slug.includes("afariste") ||
    slug.includes("industriale") ||
    /\blokal\b|\bzyre\b|\bdepo\b|\bafariste\b|\bindustrial/.test(text)
  ) {
    return "re_commercial";
  }
  if (
    slug.includes("apartament") ||
    slug.includes("banesa") ||
    subtype.includes("banesa") ||
    /\bapartament\b|\bbanesa\b|\bgarsoniere\b|\bstan\b/.test(text)
  ) {
    return "re_apartment";
  }
  if (root === "banesa-shtepi" || root === "lokale-zyre") return "real_estate";
  return null;
}

/** Prefer shop/firm name, then seller display name. */
export function sellerDisplayName(shopName, sellerName) {
  const shop = String(shopName ?? "").trim();
  const seller = String(sellerName ?? "").trim();
  if (shop) return shop;
  if (seller) return seller;
  return null;
}

function defaultSellerLabel(lang) {
  if (lang === "mk") return "нашиот продавач";
  if (lang === "mne") return "naš prodavac";
  if (lang === "en") return "our seller";
  return "klienti ynë";
}

function applySellerToLine(line, sellerName, lang) {
  const name = sellerName || defaultSellerLabel(lang);
  return String(line)
    .replace(/\{seller\}/g, name)
    .replace(/klienti ynë/gi, name)
    .replace(/našeg klijenta/gi, name)
    .replace(/naš klijent/gi, name)
    .replace(/наш(?:иот)? клиент/gi, name)
    .replace(/our seller/gi, name);
}

function themeFromSlug(slug) {
  const s = normalizeCategoryKey(slug);
  if (!s) return null;
  if (ROOT_SLUG_THEME[s]) return ROOT_SLUG_THEME[s];
  for (const [prefix, theme] of SLUG_PREFIX_THEME) {
    if (s.startsWith(prefix)) return theme;
  }
  if (s === "telefona") return "phones";
  if (s === "femije") return "children";
  if (s === "mobilje-dekorime") return "home_decor";
  return null;
}

function themeFromCategoryName(categoryName) {
  const n = normalizeCategoryKey(categoryName);
  if (!n) return "default";

  if (/telefon|smartphone|iphone|samsung|huawei|xiaomi|oppo|oneplus|nokia|tablet/.test(n)) {
    return "phones";
  }
  if (/femij|bebe|foshnj|djal|vajz|karroca klasike|karroca cader|lodr/.test(n)) {
    return "children";
  }
  if (/kompjuter|laptop|elektronik|televizor|pajisje shtepiake|gadget|\btv\b/.test(n)) {
    return "electronics";
  }
  if (/vetur|motor|skuter|kamion|furgon|auto pjese|rimorkio|trailer/.test(n)) {
    return "vehicles";
  }
  if (/banes|apartament|lokal|zyre|patundshm|toka|truall|vikendic/.test(n)) {
    return "real_estate";
  }
  if (/rrob|kepuce|veshje|mod/.test(n)) return "fashion";
  if (/pune|sherbim|profesion/.test(n)) return "jobs";
  if (/sport|biciklet|fitness|outdoor|kamping|gym/.test(n)) return "sport";
  if (/kafsh|qen|mace|pet/.test(n)) return "animals";
  if (/bujqesi|blegtori|bujq|ferm/.test(n)) return "agriculture";
  if (/ndertim|instalim|material|ndert/.test(n)) return "construction";
  if (/muzik|instrument|hobby/.test(n)) return "music";
  if (/arsim|kurs|shkoll|mesimdhen/.test(n)) return "education";
  const event = detectEventTheme(n);
  if (event) return event;
  if (/mobilje|dekor|ndricim|tepihe|perde|kuzhin|sallon|dhoma gjumit/.test(n)) {
    return "home_decor";
  }
  return "default";
}

/**
 * @param {string | { categoryName?: string | null; categorySlug?: string | null; rootCategorySlug?: string | null; category_name?: string | null; category_slug?: string | null; root_category_slug?: string | null } | null | undefined} input
 * @returns {keyof typeof CATEGORY_FLAIR}
 */
export function resolveCategoryTheme(input) {
  const { categoryName, categorySlug, rootCategorySlug } = parseCategoryInput(input);

  const rootTheme = themeFromSlug(rootCategorySlug);
  if (rootTheme) {
    const event = detectEventTheme(normalizeCategoryKey(categoryName));
    if (event && (rootTheme === "home_decor" || rootTheme === "default")) return event;
    return rootTheme;
  }

  const slugTheme = themeFromSlug(categorySlug);
  if (slugTheme) {
    const event = detectEventTheme(normalizeCategoryKey(categoryName));
    if (event && (slugTheme === "home_decor" || slugTheme === "default")) return event;
    return slugTheme;
  }

  return themeFromCategoryName(categoryName);
}

/**
 * Listing-aware theme: events, real-estate subtypes, then category fallback.
 * @param {{
 *   title?: string | null;
 *   description?: string | null;
 *   categoryName?: string | null;
 *   categorySlug?: string | null;
 *   rootCategorySlug?: string | null;
 *   propertySubtype?: string | null;
 *   propertyTxn?: string | null;
 * }} ctx
 */
export function resolveListingTheme(ctx) {
  const rootTheme = themeFromSlug(ctx.rootCategorySlug);
  const text = listingTextBlob(ctx);

  if (rootTheme === "phones" || rootTheme === "children" || rootTheme === "vehicles") {
    return rootTheme;
  }

  const event = detectEventTheme(text);
  if (event && rootTheme !== "real_estate") return event;

  const reTheme = detectRealEstateTheme(ctx);
  if (reTheme) return reTheme;

  return resolveCategoryTheme({
    categoryName: ctx.categoryName,
    categorySlug: ctx.categorySlug,
    rootCategorySlug: ctx.rootCategorySlug,
  });
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
 * @param {Parameters<typeof resolveListingTheme>[0] & { shopName?: string | null; sellerName?: string | null; shop_name?: string | null; seller_name?: string | null }} listingCtx
 */
function ensureSellerMention(line, sellerName, lang) {
  if (!sellerName || line.includes(sellerName)) return line;
  if (lang === "mk") return `${line}\n🏪 ${sellerName}`;
  if (lang === "mne") return `${line}\n🏪 ${sellerName}`;
  if (lang === "en") return `${line}\n🏪 From ${sellerName}`;
  return `${line}\n🏪 Nga ${sellerName}`;
}

export function listingFlairLine(platform, market, listingCtx) {
  const theme = resolveListingTheme(listingCtx);
  const lang = marketLang(market);
  const block = CATEGORY_FLAIR[theme] ?? CATEGORY_FLAIR.default;
  const lines = platform === "instagram" ? block.ig : block.fb;
  const raw = lines[lang] ?? lines.ks;
  const seller = sellerDisplayName(
    listingCtx.shopName ?? listingCtx.shop_name,
    listingCtx.sellerName ?? listingCtx.seller_name,
  );
  const line = applySellerToLine(raw, seller, lang);
  return ensureSellerMention(line, seller, lang);
}

/**
 * @param {"facebook" | "instagram"} platform
 * @param {string} market
 * @param {Parameters<typeof resolveListingTheme>[0]} categoryInput
 */
export function categoryFlairLine(platform, market, categoryInput) {
  return listingFlairLine(platform, market, categoryInput);
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

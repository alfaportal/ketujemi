/**
 * Keyword rules for all KetuJemi hub subcategories (except Fëmijë leaf groups).
 * Used by category suggest, vision analyze, and posting assistant mismatch hints.
 */

export type HubSuggestRule = {
  parentSlug: string;
  categorySlug: string;
  /** Albanian labels for offline mismatch hints (no DB needed). */
  parentName: string;
  categoryName: string;
  pattern: RegExp;
  weight: number;
  unless?: RegExp;
};

export const PATUNDSHMERI_INDUSTRIAL_PATTERN =
  /\b(objekt\s+industrial|objekte\s+industriale|industrial[ei]?|fabrik[ae]|ndërtes[ae]\s+industriale|ndertes[ae]\s+industriale|panel\s+metalik|hangar|metal\s+panel|corrugated|warehouse|factory\s+building|hal[ëe]\s+industriale|prodhim|manufacturing\s+plant|industrial\s+building)\b/i;

export const PATUNDSHMERI_APARTMENT_PATTERN =
  /\b(apartament|banes[ae]\b|studio\b|\d\s*\+\s*\d|\d\s+dhom[ae]|penthouse|dhom[ae]\s+gjumi)\b/i;

const VEHICLE_WORD = /\b(vetur|makin[ae]|automobil|car\b|sedan|hatchback|suv|jeep|bmw|audi|mercedes|opel|ford|volkswagen|toyota)\b/i;
const MOTOR_WORD = /\b(motor(r|i|a)?|skuter|vespa|moped|enduro|chopper|atv|quad|yamaha|ducati|harley)\b/i;
const TRUCK_WORD = /\b(kamion|furgon|rimorkio|trailer|autobus|iveco|scania|daf\b|maun)\b/i;

export const HUB_CATEGORY_SUGGEST_RULES: HubSuggestRule[] = [
  // ── Patundshmëri ──────────────────────────────────────────────────────────
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-industriale",
    parentName: "Lokale & Zyrë",
    categoryName: "Objekte Industriale",
    pattern: PATUNDSHMERI_INDUSTRIAL_PATTERN,
    weight: 18,
    unless: PATUNDSHMERI_APARTMENT_PATTERN,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-afariste",
    parentName: "Lokale & Zyrë",
    categoryName: "Lokale Afariste",
    pattern: /\b(lokal\s+afarist|lokal\s+biznes|biznes\s+lokal|dyqan|shop\s+space|retail|showroom|lokal\s+komercial)\b/i,
    weight: 14,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-depo",
    parentName: "Lokale & Zyrë",
    categoryName: "Depo",
    pattern: /\b(depo|magazin[ae]|storage\s+unit|warehouse\s+space)\b/i,
    weight: 13,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-zyre",
    parentName: "Lokale & Zyrë",
    categoryName: "Zyrë",
    pattern: /\b(zyr[ëe]|office\s+space|kancelari)\b/i,
    weight: 12,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "lokale-zyre",
    categorySlug: "lokale-type-garazha",
    parentName: "Lokale & Zyrë",
    categoryName: "Garazha",
    pattern: /\b(garazh[ae]?|parking\s+garage)\b/i,
    weight: 11,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-dhoma-qira",
    parentName: "Banesa & Shtëpi",
    categoryName: "Dhoma me Qira",
    pattern: /\b(dhoma\s+me\s+qira|me\s+qira.*dhom)\b/i,
    weight: 12,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-apartamente-banesa",
    parentName: "Banesa & Shtëpi",
    categoryName: "Apartamente & Banesa",
    pattern: /\b(apartament|banes[ae]\b|studio\b)\b/i,
    weight: 10,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-shtepi",
    parentName: "Banesa & Shtëpi",
    categoryName: "Shtëpi",
    pattern: /\b(shtëpi|shtepi|shtëpia|vil[ae]|house\b)\b/i,
    weight: 11,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-toka-truall",
    parentName: "Banesa & Shtëpi",
    categoryName: "Toka & Truall",
    pattern: /\b(toka|truall|plac|parcel[ae]?|land\s+plot)\b/i,
    weight: 10,
    unless: PATUNDSHMERI_INDUSTRIAL_PATTERN,
  },
  {
    parentSlug: "banesa-shtepi",
    categorySlug: "banesa-type-vikendica",
    parentName: "Banesa & Shtëpi",
    categoryName: "Vikendica",
    pattern: /\b(vikendic[ae]?|cottage|chalet)\b/i,
    weight: 10,
  },

  // ── Vetura ────────────────────────────────────────────────────────────────
  {
    parentSlug: "vetura",
    categorySlug: "kombi-minivan",
    parentName: "Vetura",
    categoryName: "Kombi & Minivan",
    pattern: /\b(kombi|minivan|mpv|touran|sharan|galaxy|espace)\b/i,
    weight: 13,
    unless: MOTOR_WORD,
  },
  {
    parentSlug: "vetura",
    categorySlug: "suv-jeep",
    parentName: "Vetura",
    categoryName: "SUV & Jeep",
    pattern: /\b(suv|jeep|4x4|x5|q7|tiguan|rav4|land\s*cruiser)\b/i,
    weight: 12,
    unless: MOTOR_WORD,
  },
  {
    parentSlug: "vetura",
    categorySlug: "pickup",
    parentName: "Vetura",
    categoryName: "Pickup",
    pattern: /\b(pickup|pick\s*up|hilux|ranger|amarok)\b/i,
    weight: 12,
    unless: MOTOR_WORD,
  },
  {
    parentSlug: "vetura",
    categorySlug: "elektrike-hibride",
    parentName: "Vetura",
    categoryName: "Elektrike & Hibride",
    pattern: /\b(elektrik[ae]|hibride?|hybrid|tesla|ev\b|plug\s*in)\b/i,
    weight: 12,
    unless: MOTOR_WORD,
  },
  {
    parentSlug: "vetura",
    categorySlug: "sedan",
    parentName: "Vetura",
    categoryName: "Sedan",
    pattern: VEHICLE_WORD,
    weight: 9,
    unless: /\b(motor(r|i|a)?|skuter|kamion|furgon|goma|fellne|auto\s*pjes)\b/i,
  },

  // ── Motorr & Skuter ───────────────────────────────────────────────────────
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-skuter",
    parentName: "Motorr & Skuter",
    categoryName: "Skuter",
    pattern: /\b(skuter|scooter)\b/i,
    weight: 13,
    unless: VEHICLE_WORD,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-vespa",
    parentName: "Motorr & Skuter",
    categoryName: "Vespa",
    pattern: /\bvespa\b/i,
    weight: 14,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-quad-atv",
    parentName: "Motorr & Skuter",
    categoryName: "Quad & ATV",
    pattern: /\b(quad|atv)\b/i,
    weight: 13,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-enduro",
    parentName: "Motorr & Skuter",
    categoryName: "Enduro",
    pattern: /\b(enduro|motokros|motocross)\b/i,
    weight: 12,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-chopper",
    parentName: "Motorr & Skuter",
    categoryName: "Chopper",
    pattern: /\bchopper\b/i,
    weight: 12,
  },
  {
    parentSlug: "motorr-skuter",
    categorySlug: "motorr-type-sportiv",
    parentName: "Motorr & Skuter",
    categoryName: "Motorr Sportiv",
    pattern: MOTOR_WORD,
    weight: 10,
    unless: VEHICLE_WORD,
  },

  // ── Kamionë & Furgonë ─────────────────────────────────────────────────────
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-furgone",
    parentName: "Kamionë & Furgonë",
    categoryName: "Furgonë",
    pattern: /\b(furgon|van\b|transit|sprinter|crafter)\b/i,
    weight: 13,
    unless: VEHICLE_WORD,
  },
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-kamione",
    parentName: "Kamionë & Furgonë",
    categoryName: "Kamionë",
    pattern: /\b(kamion|truck\b|iveco|scania|daf\b)\b/i,
    weight: 13,
    unless: VEHICLE_WORD,
  },
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-autobuse",
    parentName: "Kamionë & Furgonë",
    categoryName: "Autobusë",
    pattern: /\b(autobus|bus\b|coach)\b/i,
    weight: 13,
  },
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-trailer-rimorkio",
    parentName: "Kamionë & Furgonë",
    categoryName: "Trailer & Rimorkio",
    pattern: /\b(trailer|rimorkio|rimorki)\b/i,
    weight: 12,
  },
  {
    parentSlug: "kamione-furgone",
    categorySlug: "kamione-type-mauna",
    parentName: "Kamionë & Furgonë",
    categoryName: "Mauna",
    pattern: /\bmaun\b/i,
    weight: 12,
  },

  // ── Auto Pjesë ────────────────────────────────────────────────────────────
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-fellne-goma",
    parentName: "Auto Pjesë",
    categoryName: "Fellne & Goma",
    pattern: /\b(goma|gomat|fellne|felne|rrot[ae]|tire|tyre|205\/|215\/|225\/)\b/i,
    weight: 14,
    unless: VEHICLE_WORD,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-amortizere",
    parentName: "Auto Pjesë",
    categoryName: "Amortizerë",
    pattern: /\b(amortiz|shock\s*absorber|strut)\b/i,
    weight: 13,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-frenim",
    parentName: "Auto Pjesë",
    categoryName: "Sisteme Frenimi",
    pattern: /\b(fren|brake\s*pad|disk\s*fren|frenim)\b/i,
    weight: 13,
    unless: /\b(motor(r|i|a)?|skuter)\b/i,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-motore",
    parentName: "Auto Pjesë",
    categoryName: "Motorrë",
    pattern: /\b(motor\s+vetur|engine\s+block|motorrë\s+vetur|koka\s+motor)\b/i,
    weight: 12,
    unless: MOTOR_WORD,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-drita-led",
    parentName: "Auto Pjesë",
    categoryName: "Drita & LED",
    pattern: /\b(drita\s+led|led\s+drita|far[ae]\s+led|headlight)\b/i,
    weight: 12,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-akumulatore",
    parentName: "Auto Pjesë",
    categoryName: "Akumulatorë",
    pattern: /\b(akumulator|battery\s+car|bateri\s+vetur)\b/i,
    weight: 12,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-karoserie",
    parentName: "Auto Pjesë",
    categoryName: "Pjesë Karoserie",
    pattern: /\b(karoseri|bumper|kapak|dere\s+vetur|fender|spoiler)\b/i,
    weight: 11,
  },
  {
    parentSlug: "auto-pjese",
    categorySlug: "auto-pjes-type-vajra-filtra",
    parentName: "Auto Pjesë",
    categoryName: "Vajra & Filtra",
    pattern: /\b(vaj\s+motor|filt[ëe]r\s+ajri|filt[ëe]r\s+vaj|oil\s+filter)\b/i,
    weight: 11,
  },

  // ── Telefona ──────────────────────────────────────────────────────────────
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-smartphones",
    parentName: "Telefona",
    categoryName: "Smartphones",
    pattern:
      /\b(iphone|samsung\s*galaxy|xiaomi|huawei|telefon|smartphone|mobile\s*phone|redmi|pixel|oneplus|honor)\b/i,
    weight: 11,
    unless: /\b(kufje|tablet|laptop|karrige)\b/i,
  },
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-aksesore-smartphone",
    parentName: "Telefona",
    categoryName: "Aksesorë",
    pattern: /\b(case\s+telefon|mbrojt[ëe]s\s+telefon|charger\s+telefon|kabllo\s+telefon|power\s*bank)\b/i,
    weight: 11,
  },
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-pjese-rezerve",
    parentName: "Telefona",
    categoryName: "Pjesë Rezervë",
    pattern: /\b(ekran\s+telefon|lcd\s+telefon|bateri\s+telefon|screen\s+replacement)\b/i,
    weight: 12,
  },
  {
    parentSlug: "telefona",
    categorySlug: "telefona-type-fikse",
    parentName: "Telefona",
    categoryName: "Telefona Fiksë",
    pattern: /\b(telefon\s+fiks|landline|fiks[ëe])\b/i,
    weight: 11,
  },

  // ── Kompjuterë & Laptopë ───────────────────────────────────────────────────
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-laptop",
    parentName: "Kompjuterë & Laptopë",
    categoryName: "Laptopë",
    pattern: /\b(laptop|macbook|notebook|thinkpad|ultrabook|chromebook)\b/i,
    weight: 12,
    unless: /\b(kufje|monitor\s+tv|televizor)\b/i,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-desktop-pc",
    parentName: "Kompjuterë & Laptopë",
    categoryName: "Desktop PC",
    pattern: /\b(desktop|pc\s*tower|imac|workstation|gaming\s*pc)\b/i,
    weight: 11,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-monitore",
    parentName: "Kompjuterë & Laptopë",
    categoryName: "Monitorë",
    pattern: /\b(monitor|ekran\s+pc|display\s+pc)\b/i,
    weight: 11,
    unless: /\b(televizor|\btv\b)\b/i,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-tablete",
    parentName: "Kompjuterë & Laptopë",
    categoryName: "Tabletë",
    pattern: /\b(tablet|ipad|galaxy\s*tab)\b/i,
    weight: 11,
  },
  {
    parentSlug: "kompjutere-laptope",
    categorySlug: "kompj-type-harduer",
    parentName: "Kompjuterë & Laptopë",
    categoryName: "Pjesë Harduerike",
    pattern: /\b(ram\b|ssd|hdd|gpu|grafik[ëe]|procesor|cpu\b|motherboard|kart[ëe]\s+grafike)\b/i,
    weight: 11,
    unless: /\b(laptop|macbook|telefon)\b/i,
  },

  // ── Elektronikë & Pajisje Shtëpiake ───────────────────────────────────────
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-audio-zeri",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Audio & Pajisje Zëri",
    pattern:
      /\b(jbl|bose|marshall|harman|beats|pioneer|altoparlant|soundbar|kufje|headphones?|earbuds?|airpods|bluetooth\s*speaker|woofer|subwoofer|pa\s*zëri|pajisje\s*zëri)\b/i,
    weight: 14,
    unless: /\b(televizor|\btv\b|oled|qled|projektor|smart\s*tv)\b/i,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-televizore-projektor",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Televizorë & Projektorë",
    pattern: /\b(televizor|\btv\b|oled|qled|projektor|smart\s*tv|curved\s*tv|\d{2}["″]\s*tv)\b/i,
    weight: 13,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-konzola-gaming",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Konzola & Gaming",
    pattern: /\b(playstation|ps[345]\b|xbox|nintendo|switch\s*oled|konzol)\b/i,
    weight: 12,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-kamera-foto-smartwatch",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Kamera, Foto & Smart Watch",
    pattern: /\b(kamera|fotoaparat|gopro|dji|smart\s*watch|apple\s*watch|canon|nikon|drone)\b/i,
    weight: 11,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-pajisje-medha-shtepiake",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Pajisje të Mëdha Shtëpiake",
    pattern: /\b(frigorifer|lavatri[cç]e|sob[ëe]|mikroval|aspirator|pajisje\s+(te\s+)?medha|dishwasher)\b/i,
    weight: 11,
  },
  {
    parentSlug: "tv-elektronike",
    categorySlug: "tv-type-klimatizim-ngrohje",
    parentName: "Elektronikë & Pajisje Shtëpiake",
    categoryName: "Klimatizim & Ngrohje",
    pattern: /\b(klim|kondicion|ngrohje|fancoil|termopomp|air\s*conditioner)\b/i,
    weight: 10,
  },

  // ── Mobilje & Dekorime ────────────────────────────────────────────────────
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-sallone-ulese",
    parentName: "Mobilje & Dekorime",
    categoryName: "Sallone & Ulëse",
    pattern: /\b(sofa|couch|divan|kolltuk|karrige\s+ndenj|armchair|tavolin[ae]\s+ndenj)\b/i,
    weight: 11,
    unless: /\b(karrige\s+ushqimi|karrige\s+makine)\b/i,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-dhoma-gjumit",
    parentName: "Mobilje & Dekorime",
    categoryName: "Dhoma e Gjumit",
    pattern: /\b(krevat|dyshek|komodin[ae]|garderob[ae]|dhom[ae]\s+gjumi)\b/i,
    weight: 11,
    unless: /\b(krevat\s+bebe|djep)\b/i,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-kuzhina",
    parentName: "Mobilje & Dekorime",
    categoryName: "Kuzhina",
    pattern: /\b(kuzhin[ae]|kitchen\s+cabinet|banak|raft\s+kuzhin)\b/i,
    weight: 11,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-ndricim",
    parentName: "Mobilje & Dekorime",
    categoryName: "Ndriçim",
    pattern: /\b(llamb[ae]|ndri[çc]im|chandelier|lamp)\b/i,
    weight: 10,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-tepihe-perde",
    parentName: "Mobilje & Dekorime",
    categoryName: "Tepihë & Perde",
    pattern: /\b(tepih|perd[ae]|curtain|rug\b|carpet)\b/i,
    weight: 10,
  },
  {
    parentSlug: "mobilje-dekorime",
    categorySlug: "mobilje-type-kopsht-terasa",
    parentName: "Mobilje & Dekorime",
    categoryName: "Kopshti & Terasa",
    pattern: /\b(kopsht|teras[ae]|oborr|gardh|outdoor\s+furniture|mobilje\s+jashtme|tavolin[ae]\s+jasht)\b/i,
    weight: 10,
  },

  // ── Rroba & Këpucë ────────────────────────────────────────────────────────
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-kepuce",
    parentName: "Rroba & Këpucë",
    categoryName: "Këpucë",
    pattern: /\b(këpuc[ëe]|kepuce|sneaker|boot|shoe|nike\s+air|adidas|puma)\b/i,
    weight: 12,
    unless: /\b(veshje|fustan|pantallona)\b/i,
  },
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-veshje-femra",
    parentName: "Rroba & Këpucë",
    categoryName: "Veshje për Femra",
    pattern: /\b(fustan|bluz[ae]|fund|veshje\s+femra|dress|women'?s?\s*(wear|clothing))\b/i,
    weight: 11,
    unless: /\b(meshkuj|fëmij|femij)\b/i,
  },
  {
    parentSlug: "rroba-kepuce",
    categorySlug: "rroba-type-veshje-meshkuj",
    parentName: "Rroba & Këpucë",
    categoryName: "Veshje për Meshkuj",
    pattern: /\b(veshje\s+meshkuj|xhaket[ae]|pantallona\s+meshkuj|men'?s?\s*(wear|clothing)|kostum)\b/i,
    weight: 11,
    unless: /\b(femra|fëmij|femij)\b/i,
  },

  // ── Sport & Outdoor ─────────────────────────────────────────────────────────
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-bicikleta",
    parentName: "Sport & Outdoor",
    categoryName: "Biçikleta",
    pattern: /\b(bi[çc]iklet[ae]|bicycle|bike|cycling|mtb|road\s*bike)\b/i,
    weight: 12,
    unless: /\b(bi[çc]iklet[ae]\s+fëmij|fëmij)\b/i,
  },
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-fitnes-joga",
    parentName: "Sport & Outdoor",
    categoryName: "Fitnes & Joga",
    pattern: /\b(fitnes|gym|pesha|dumbbell|yoga|pilates|treadmill|bench\s+press)\b/i,
    weight: 11,
  },
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-kampingu",
    parentName: "Sport & Outdoor",
    categoryName: "Pajisje Kampingu",
    pattern: /\b(kamping|tend[ae]|sleeping\s+bag|çadër\s+kampingu|camp(ing)?)\b/i,
    weight: 11,
  },
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-top",
    parentName: "Sport & Outdoor",
    categoryName: "Sportet me Top",
    pattern: /\b(top\s+futbolli|basketball|volejboll|futbol|football|nba)\b/i,
    weight: 10,
  },
  {
    parentSlug: "sport-outdoor",
    categorySlug: "sport-type-dimerore",
    parentName: "Sport & Outdoor",
    categoryName: "Sportet Dimërore",
    pattern: /\b(ski|snowboard|patina|sled|skijim)\b/i,
    weight: 11,
  },

  // ── Kafshë ──────────────────────────────────────────────────────────────────
  {
    parentSlug: "kafshet",
    categorySlug: "kafshet-type-qen",
    parentName: "Kafshë",
    categoryName: "Qen",
    pattern: /\b(qen|qent[ëe]|puppy|dog\b|labrador|husky|german\s*shepherd)\b/i,
    weight: 12,
  },
  {
    parentSlug: "kafshet",
    categorySlug: "kafshet-type-mace",
    parentName: "Kafshë",
    categoryName: "Mace",
    pattern: /\b(mac[ae]|kitten|cat\b|persian\s*cat)\b/i,
    weight: 12,
  },
  {
    parentSlug: "kafshet",
    categorySlug: "kafshet-type-ushqim-aksesore",
    parentName: "Kafshë",
    categoryName: "Ushqim & Aksesorë për Kafshë",
    pattern: /\b(ushqim\s+kafsh|pet\s+food|aksesor[ëe]\s+kafsh|litar\s+qen|litar\s+mac)\b/i,
    weight: 11,
    unless: /\b(qen\s+shit|mac[ae]\s+shit|puppy|kitten)\b/i,
  },

  // ── Muzikë & Hobby ──────────────────────────────────────────────────────────
  {
    parentSlug: "muzike-hobby",
    categorySlug: "muzike-type-instrumente-muzikore",
    parentName: "Muzikë & Hobby",
    categoryName: "Instrumente Muzikore",
    pattern: /\b(kitar[ae]|piano|violin|drums?|synth|instrument\s+muzik|saksofon|flauta)\b/i,
    weight: 11,
    unless: /\b(kufje|speaker|audio\s+zeri)\b/i,
  },
];

type CategoryRow = {
  id: number;
  name: string;
  slug: string | null;
  parent_id: number | null;
};

export type HubRuleMatch = {
  parent_category_id: number;
  category_id: number;
  parent_name: string;
  category_name: string;
  confidence: "high" | "medium" | "low";
  parentSlug: string;
  categorySlug: string;
};

export function hubCategoryRuleMatch(text: string, cats: CategoryRow[]): HubRuleMatch | null {
  const normalized = text.trim().toLowerCase().normalize("NFC");
  if (!normalized) return null;

  let best: { rule: HubSuggestRule; weight: number } | null = null;

  for (const rule of HUB_CATEGORY_SUGGEST_RULES) {
    if (!rule.pattern.test(normalized)) continue;
    if (rule.unless?.test(normalized)) continue;
    if (!best || rule.weight > best.weight) best = { rule, weight: rule.weight };
  }

  if (!best) return null;

  const parent = cats.find((c) => c.slug === best.rule.parentSlug && !c.parent_id);
  const child = cats.find((c) => c.slug === best.rule.categorySlug && c.parent_id === parent?.id);
  if (!parent || !child) return null;

  return {
    parent_category_id: parent.id,
    category_id: child.id,
    parent_name: parent.name,
    category_name: child.name,
    confidence: best.weight >= 13 ? "high" : "medium",
    parentSlug: best.rule.parentSlug,
    categorySlug: best.rule.categorySlug,
  };
}

/** Best rule match without DB — for posting assistant offline hints. */
export function hubCategoryRuleMatchOffline(text: string): HubSuggestRule | null {
  const normalized = text.trim().toLowerCase().normalize("NFC");
  if (!normalized) return null;

  let best: { rule: HubSuggestRule; weight: number } | null = null;
  for (const rule of HUB_CATEGORY_SUGGEST_RULES) {
    if (!rule.pattern.test(normalized)) continue;
    if (rule.unless?.test(normalized)) continue;
    if (!best || rule.weight > best.weight) best = { rule, weight: rule.weight };
  }
  return best && best.weight >= 11 ? best.rule : null;
}

function labelMatches(selected: string, expected: string): boolean {
  const s = selected.trim().toLowerCase().normalize("NFC");
  const e = expected.trim().toLowerCase().normalize("NFC");
  if (!s) return false;
  if (s === e || s.includes(e) || e.includes(s)) return true;
  const tokens = e.split(/[&\s]+/).filter((t) => t.length > 3);
  return tokens.some((t) => s.includes(t));
}

/** Returns Albanian hint when selected category clearly conflicts with title/description. */
export function getHubCategoryMismatchHint(
  text: string,
  selectedParent?: string | null,
  selectedCategory?: string | null,
): string | null {
  const rule = hubCategoryRuleMatchOffline(text);
  if (!rule) return null;

  const parent = (selectedParent ?? "").trim();
  const category = (selectedCategory ?? "").trim();
  if (!parent && !category) return null;

  const parentOk = !parent || labelMatches(parent, rule.parentName);
  const categoryOk = !category || labelMatches(category, rule.categoryName);

  if (parentOk && categoryOk) return null;

  return `Ky send duket se i përket «${rule.parentName}» → «${rule.categoryName}», jo kategorisë që keni zgjedhur.`;
}

/** Canonical Pexels JPEG URL (Pexels free licence). Every {@link SUBCATEGORY_IMAGE_URL_BY_SLUG} entry uses a distinct photo id. */
export function pexelsPhoto(id: number, w = 800): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
}

/** filippofilip95/car-logos-dataset publishes **PNG** under `logos/optimized` on `master` (older `.svg` paths 404). */
const CAR_LOGOS_DATASET_BASE =
  "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/optimized";

function carLogoDatasetPng(file: string): string {
  return `${CAR_LOGOS_DATASET_BASE}/${file}.png`;
}

/** Motorcycle makers missing from the car-logos dataset — real brand marks (SVG hotlink). */
const MOTO_LOGO = {
  aprilia: "https://upload.wikimedia.org/wikipedia/commons/9/99/Aprilia-logo.svg",
  ducati: "https://cdn.simpleicons.org/ducati",
  harleyDavidson: "https://upload.wikimedia.org/wikipedia/commons/d/de/Harley-Davidson_logo.svg",
  kawasaki: "https://cdn.worldvectorlogo.com/logos/kawasaki-1.svg",
  piaggio: "https://cdn.worldvectorlogo.com/logos/piaggio-2.svg",
  yamaha: "https://upload.wikimedia.org/wikipedia/commons/d/de/Yamaha_Motor_logo.svg",
} as const;

/** Image URL per seeded subcategory slug (`parent_id` set in DB): Pexels JPEGs and/or official brand marks (see {@link carLogoDatasetPng}). */
export const SUBCATEGORY_IMAGE_URL_BY_SLUG: Record<string, string> = {
  // —— Kafshë ——————————————————————————————————————————————————————————————
  "kafshet-type-akuariume": pexelsPhoto(8116934),
  "kafshet-type-mace": pexelsPhoto(774731),
  "kafshet-type-qen": pexelsPhoto(1805164),
  "kafshet-type-shpende":
    "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&q=80",
  "kafshet-type-ushqim-aksesore":
    "https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?w=1200&q=80",

  // —— Motorr types ————————————————————————————————————————————————————————
  "motorr-type-chopper": pexelsPhoto(8911262),
  "motorr-type-enduro": pexelsPhoto(1715193),
  "motorr-type-motokros": pexelsPhoto(30706046),
  "motorr-type-sportiv": pexelsPhoto(5720562),
  "motorr-type-quad-atv": pexelsPhoto(6598203),
  "motorr-type-skuter": pexelsPhoto(2928953),
  "motorr-type-vespa": pexelsPhoto(1545743),

  "motorr-aprilia": MOTO_LOGO.aprilia,
  "motorr-bmw": carLogoDatasetPng("bmw"),
  "motorr-ducati": MOTO_LOGO.ducati,
  "motorr-harley-davidson": MOTO_LOGO.harleyDavidson,
  "motorr-honda": carLogoDatasetPng("honda"),
  "motorr-kawasaki": MOTO_LOGO.kawasaki,
  "motorr-ktm": carLogoDatasetPng("ktm"),
  "motorr-piaggio": MOTO_LOGO.piaggio,
  "motorr-suzuki": carLogoDatasetPng("suzuki"),
  "motorr-yamaha": MOTO_LOGO.yamaha,

  // —— Kamionë ———————————————————————————————————————————————————————————————
  "kamione-type-autobuse": pexelsPhoto(8760712),
  "kamione-type-auto-bartes": pexelsPhoto(5632397),
  "kamione-type-furgone": pexelsPhoto(4484078),
  "kamione-type-kamione": pexelsPhoto(1716158),
  "kamione-type-mauna": pexelsPhoto(8190138),
  "kamione-type-trailer-rimorkio": pexelsPhoto(3639872),

  "kamione-daf": carLogoDatasetPng("daf"),
  "kamione-iveco": carLogoDatasetPng("iveco"),
  "kamione-man": carLogoDatasetPng("man"),
  "kamione-mercedes-benz": carLogoDatasetPng("mercedes-benz"),
  "kamione-renault": carLogoDatasetPng("renault"),
  "kamione-scania": carLogoDatasetPng("scania"),
  "kamione-volvo": carLogoDatasetPng("volvo"),
  "kamione-mitsubishi-fuso": carLogoDatasetPng("mitsubishi"),
  "kamione-isuzu": carLogoDatasetPng("isuzu"),
  "kamione-volkswagen": carLogoDatasetPng("volkswagen"),
  "kamione-ford": carLogoDatasetPng("ford"),
  "kamione-fiat": carLogoDatasetPng("fiat"),

  // —— Auto pjesë ————————————————————————————————————————————————————————————
  "auto-pjes-type-akumulatore": pexelsPhoto(69359),
  "auto-pjes-type-amortizere": pexelsPhoto(938045),
  "auto-pjes-type-drita-led": pexelsPhoto(244206),
  "auto-pjes-type-fellne-goma": pexelsPhoto(794775),
  "auto-pjes-type-motore": pexelsPhoto(163845),
  "auto-pjes-type-karoserie": pexelsPhoto(7561173),
  "auto-pjes-type-frenim": pexelsPhoto(794763),
  "auto-pjes-type-vajra-filtra": pexelsPhoto(924676),
  "auto-pjes-type-ftohja-klima": pexelsPhoto(3807277),
  "auto-pjes-type-elektrike": pexelsPhoto(162553),
  "auto-pjes-type-te-tjera": pexelsPhoto(4374843),

  // —— Banesa ————————————————————————————————————————————————————————————————
  "banesa-type-apartamente-banesa": pexelsPhoto(1571463),
  "banesa-type-dhoma-qira": pexelsPhoto(1648776),
  "banesa-type-shtepi": pexelsPhoto(1396122),
  "banesa-type-toka-truall": pexelsPhoto(1072824),
  "banesa-type-vikendica": pexelsPhoto(1643384),

  // —— Lokale ————————————————————————————————————————————————————————————————
  "lokale-type-depo": pexelsPhoto(12706241),
  "lokale-type-garazha":
    "https://images.pexels.com/photos/9139588/pexels-photo-9139588.jpeg?w=1200&q=80",
  "lokale-type-afariste": pexelsPhoto(7046155),
  "lokale-type-industriale": pexelsPhoto(6794929),
  "lokale-type-zyre": pexelsPhoto(28715052),

  // —— Telefona ————————————————————————————————————————————————————————————————
  "telefona-type-smartphones": pexelsPhoto(887751),
  "telefona-type-fikse": pexelsPhoto(837033),
  "telefona-type-numra-kartela": pexelsPhoto(6980745),
  "telefona-type-pjese-rezerve": pexelsPhoto(5076516),
  "telefona-type-aksesore-smartphone": pexelsPhoto(8877515),
  "telefona-google": pexelsPhoto(4724457),
  "telefona-honor": pexelsPhoto(4724462),
  "telefona-huawei": pexelsPhoto(4724465),
  "telefona-motorola": pexelsPhoto(4724468),
  "telefona-nokia": pexelsPhoto(4724469),
  "telefona-oneplus": pexelsPhoto(4724470),
  "telefona-apple": pexelsPhoto(788946),
  "telefona-samsung": pexelsPhoto(788472),
  "telefona-xiaomi": pexelsPhoto(4724492),
  "telefona-zte": pexelsPhoto(4724493),

  // —— Kompjuterë ——————————————————————————————————————————————————————————————
  "kompj-type-desktop-pc": pexelsPhoto(177598),
  "kompj-type-laptop": pexelsPhoto(5716052),
  "kompj-type-monitore": pexelsPhoto(326501),
  "kompj-type-harduer": pexelsPhoto(2582925),
  "kompj-type-servere": pexelsPhoto(2881230),
  "kompj-type-tablete": pexelsPhoto(6372976),
  "kompj-acer": pexelsPhoto(986756),
  "kompj-apple": pexelsPhoto(986758),
  "kompj-asus": pexelsPhoto(18105),
  "kompj-dell": pexelsPhoto(18104),
  "kompj-hp": pexelsPhoto(7213105),
  "kompj-huawei": pexelsPhoto(7983347),
  "kompj-lenovo": pexelsPhoto(7974),
  "kompj-microsoft": pexelsPhoto(6930546),
  "kompj-msi": pexelsPhoto(2588757),
  "kompj-razer": pexelsPhoto(7770011),

  // —— TV & Elektronikë (nivel 2 banner — slug-et e seed) —————————————————————
  "tv-type-pajisje-medha-shtepiake":
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=1200&q=80",
  "tv-type-klimatizim-ngrohje":
    "https://images.pexels.com/photos/16592625/pexels-photo-16592625.jpeg?w=1200&q=80",
  "tv-type-televizore-projektor":
    "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=1200&q=80",
  "tv-type-konzola-gaming":
    "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=1200&q=80",
  "tv-type-audio-zeri":
    "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1200&q=80",
  "tv-type-kamera-foto-smartwatch":
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80",
  "tv-type-laptop-kompjutere":
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80",

  // —— Mobilje (nivel 2 banner — hero pas klikimit; jo MD_TYPE_PHOTOS) ——————————
  "mobilje-type-sallone-ulese":
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
  "mobilje-type-kuzhina":
    "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?w=1200&q=80",
  "mobilje-type-dhoma-gjumit":
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&q=80",
  "mobilje-type-kopsht-terasa":
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  "mobilje-type-ndricim": pexelsPhoto(1123262),
  "mobilje-type-tepihe-perde":
    "https://images.pexels.com/photos/16820353/pexels-photo-16820353.jpeg?w=1200&q=80",

  // —— Rroba ——————————————————————————————————————————————————————————————————
  "rroba-type-aksesore": pexelsPhoto(1927259),
  "rroba-type-kepuce": pexelsPhoto(267320),
  "rroba-type-veshje-femra":
    "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  "rroba-type-veshje-femije": pexelsPhoto(1927257),
  "rroba-type-veshje-meshkuj":
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=1200&q=80",

  // —— Fëmijë (legacy type rows; groups use femije-hub-subcategory-photos.ts) ——
  "femije-type-karroca":
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400",
  "femije-type-lodra":
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400",
  "femije-type-foshnje":
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400",
  "femije-type-rroba":
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400",
  "femije-type-ushqim-higjiene":
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400",

  // —— Sport ——————————————————————————————————————————————————————————————————
  "sport-type-bicikleta": pexelsPhoto(2882234),
  "sport-type-fitnes-joga": pexelsPhoto(4164752),
  "sport-type-kampingu": pexelsPhoto(2525901),
  "sport-type-top":
    "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?w=1200&q=80",
  "sport-type-dimerore": pexelsPhoto(848612),

  // —— Punë ————————————————————————————————————————————————————————————————————
  "pune-type-administrate": pexelsPhoto(3184464),
  "pune-type-gastronomi": pexelsPhoto(958545),
  "pune-type-it-dizajn": pexelsPhoto(11035380),
  "pune-type-marketing": pexelsPhoto(7661185),
  "pune-type-ndertimtari": pexelsPhoto(14367421),
  "pune-type-transporti":
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80",
  "pune-type-zejtari":
    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80",
  "pune-type-shendet-kujdes":
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",
  "pune-type-pastrim-mirembajtje":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
  "pune-type-sherbime-te-tjera":
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&q=80",

  "pune-leaf-infermier-kujdes-shtepi":
    "https://images.unsplash.com/photo-1576091160399-7573ab762654?w=1200&q=80",
  "pune-leaf-fizioterapi":
    "https://images.unsplash.com/photo-1579689622686-1febbcfcf55d?w=1200&q=80",
  "pune-leaf-psikolog-terapeut":
    "https://images.unsplash.com/photo-1573497019148-b8f877e9a4b6?w=1200&q=80",
  "pune-leaf-kujdes-te-moshuarit":
    "https://images.unsplash.com/photo-1519494027907-487105e21b5a?w=1200&q=80",
  "pune-leaf-babysitter-kujdes-femijesh":
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&q=80",
  "pune-leaf-pastrim-banesash":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80",
  "pune-leaf-pastrim-pas-ndertimit":
    "https://images.unsplash.com/photo-1504307651254-719259f0eaeb?w=1200&q=80",
  "pune-leaf-pastrim-xhamash":
    "https://images.unsplash.com/photo-1628177148706-557244849813?w=1200&q=80",
  "pune-leaf-dezinfektim-dezinsektim":
    "https://images.unsplash.com/photo-1585421516940-3404bb8c4e0e?w=1200&q=80",
  "pune-leaf-mirembajtje-kopshtesh-oborresh":
    "https://images.unsplash.com/photo-1416879595885-8e567c54c8c2?w=1200&q=80",
  "pune-leaf-riparim-pajisje-shtepiake":
    "https://images.unsplash.com/photo-1581094798790-844274a91716?w=1200&q=80",
  "pune-leaf-riparim-telefona-laptop":
    "https://images.unsplash.com/photo-1511706764698-9a0972c314af?w=1200&q=80",
  "pune-leaf-fotokopje-shtypshkrim":
    "https://images.unsplash.com/photo-1612815153068-4fd1302489bf?w=1200&q=80",
  "pune-leaf-sherbime-noteriale-juridike":
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
  "pune-leaf-lirim-banesash-zyrash":
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80",

  // —— Bujqësi —————————————————————————————————————————————————————————————————
  "bujq-type-bageti":
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1200&q=80",
  "bujq-type-farera-plehra": pexelsPhoto(29039746),
  "bujq-type-makineri": pexelsPhoto(15833963),
  "bujq-type-shpeze":
    "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=1200&q=80",
  "bujq-type-ushqim-kafshet": pexelsPhoto(29336312),

  // —— Arsim ——————————————————————————————————————————————————————————————————
  "arsim-type-gjuhe-huaja": pexelsPhoto(5212342),
  "arsim-type-kurse-prof": pexelsPhoto(6140102),
  "arsim-type-mesime-private": pexelsPhoto(5905702),
  "arsim-type-trajnime-it": pexelsPhoto(1181263),

  // —— Muzikë ——————————————————————————————————————————————————————————————————
  "muzike-type-frymore": pexelsPhoto(164799),
  "muzike-type-tela": pexelsPhoto(111287),
  "muzike-type-tastiere": pexelsPhoto(5156947),
  "muzike-type-libra": pexelsPhoto(762687),
  "muzike-type-studio": pexelsPhoto(3783471),
  "muzike-type-art-teater-film": pexelsPhoto(713149),

  // —— Vetura body (same Pexels ids as vendi vetura-body-images.ts) —————————————
  sedan: pexelsPhoto(170811),
  hatchback: pexelsPhoto(5976596),
  "suv-jeep": pexelsPhoto(116675),
  "kombi-minivan": pexelsPhoto(1149831),
  "kabriolet-sportive": pexelsPhoto(3752169),
  kupe: pexelsPhoto(3764984),
  "elektrike-hibride": pexelsPhoto(110844),
  pickup: pexelsPhoto(3422964),
  "klasike-vintage": pexelsPhoto(2127022),

  // —— Vetura › Sedan (official brand marks from car-logos dataset PNG) —————————————
  "alfa-romeo": carLogoDatasetPng("alfa-romeo"),
  audi: carLogoDatasetPng("audi"),
  bmw: carLogoDatasetPng("bmw"),
  chevrolet: carLogoDatasetPng("chevrolet"),
  citroen: carLogoDatasetPng("citroen"),
  dacia: carLogoDatasetPng("dacia"),
  dodge: carLogoDatasetPng("dodge"),
  ferrari: carLogoDatasetPng("ferrari"),
  fiat: carLogoDatasetPng("fiat"),
  ford: carLogoDatasetPng("ford"),
  honda: carLogoDatasetPng("honda"),
  hyundai: carLogoDatasetPng("hyundai"),
  infiniti: carLogoDatasetPng("infiniti"),
  jeep: carLogoDatasetPng("jeep"),
  kia: carLogoDatasetPng("kia"),
  lada: carLogoDatasetPng("lada"),
  lamborghini: carLogoDatasetPng("lamborghini"),
  "land-rover": carLogoDatasetPng("land-rover"),
  lexus: carLogoDatasetPng("lexus"),
  mazda: carLogoDatasetPng("mazda"),
  "mercedes-benz": carLogoDatasetPng("mercedes-benz"),
  mitsubishi: carLogoDatasetPng("mitsubishi"),
  nissan: carLogoDatasetPng("nissan"),
  opel: carLogoDatasetPng("opel"),
  peugeot: carLogoDatasetPng("peugeot"),
  porsche: carLogoDatasetPng("porsche"),
  renault: carLogoDatasetPng("renault"),
  seat: carLogoDatasetPng("seat"),
  skoda: carLogoDatasetPng("skoda"),
  subaru: carLogoDatasetPng("subaru"),
  suzuki: carLogoDatasetPng("suzuki"),
  tesla: carLogoDatasetPng("tesla"),
  toyota: carLogoDatasetPng("toyota"),
  volkswagen: carLogoDatasetPng("volkswagen"),
  volvo: carLogoDatasetPng("volvo"),
  zastava: carLogoDatasetPng("zastava"),
};

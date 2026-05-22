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
  "kafshet-type-shpende": pexelsPhoto(1661179),
  "kafshet-type-ushqim-aksesore": pexelsPhoto(8430954),

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

  // —— Banesa ————————————————————————————————————————————————————————————————
  "banesa-type-apartamente-banesa": pexelsPhoto(1571463),
  "banesa-type-dhoma-qira": pexelsPhoto(1648776),
  "banesa-type-shtepi": pexelsPhoto(1396122),
  "banesa-type-toka-truall": pexelsPhoto(1072824),
  "banesa-type-vikendica": pexelsPhoto(1643384),

  // —— Lokale ————————————————————————————————————————————————————————————————
  "lokale-type-depo": pexelsPhoto(12706241),
  "lokale-type-garazha": pexelsPhoto(8348183),
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

  // —— TV & Elektronikë ———————————————————————————————————————————————————————
  "tv-type-televizore": pexelsPhoto(1571456),
  "tv-type-kamera-foto": pexelsPhoto(911808),
  "tv-type-konzola-lojrash": pexelsPhoto(4425762),
  "tv-type-smart-watch": pexelsPhoto(4370377),
  "tv-type-audio-zerimi": pexelsPhoto(164745),
  "tv-type-projektore": pexelsPhoto(768816),

  // —— Mobilje ————————————————————————————————————————————————————————————————
  "mobilje-type-sallone-ulese": pexelsPhoto(3769020),
  "mobilje-type-kuzhina": pexelsPhoto(1646792),
  "mobilje-type-dhoma-gjumit": pexelsPhoto(1646975),
  "mobilje-type-kopsht-terasa": pexelsPhoto(1350193),
  "mobilje-type-ndricim": pexelsPhoto(1123262),
  "mobilje-type-tepihe-perde": pexelsPhoto(1457845),

  // —— Rroba ——————————————————————————————————————————————————————————————————
  "rroba-type-aksesore": pexelsPhoto(1927259),
  "rroba-type-kepuce": pexelsPhoto(267320),
  "rroba-type-veshje-femra": pexelsPhoto(1927258),
  "rroba-type-veshje-femije": pexelsPhoto(1927257),
  "rroba-type-veshje-meshkuj": pexelsPhoto(1927256),

  // —— Fëmijë ——————————————————————————————————————————————————————————————————
  "femije-type-karroca": pexelsPhoto(1007773),
  "femije-type-lodra": pexelsPhoto(294173),
  "femije-type-foshnje": pexelsPhoto(30014151),
  "femije-type-rroba": pexelsPhoto(30420279),
  "femije-type-ushqim-higjiene": pexelsPhoto(3859003),

  // —— Sport ——————————————————————————————————————————————————————————————————
  "sport-type-bicikleta": pexelsPhoto(2882234),
  "sport-type-fitnes-joga": pexelsPhoto(4164752),
  "sport-type-kampingu": pexelsPhoto(2525901),
  "sport-type-top": pexelsPhoto(274422),
  "sport-type-dimerore": pexelsPhoto(848612),

  // —— Punë ————————————————————————————————————————————————————————————————————
  "pune-type-administrate": pexelsPhoto(3184464),
  "pune-type-gastronomi": pexelsPhoto(958545),
  "pune-type-it-dizajn": pexelsPhoto(11035380),
  "pune-type-marketing": pexelsPhoto(7661185),
  "pune-type-ndertimtari": pexelsPhoto(14367421),
  "pune-type-transporti": pexelsPhoto(8386443),
  "pune-type-zejtari": pexelsPhoto(3060859),

  // —— Bujqësi —————————————————————————————————————————————————————————————————
  "bujq-type-bageti": pexelsPhoto(236474),
  "bujq-type-farera-plehra": pexelsPhoto(29039746),
  "bujq-type-makineri": pexelsPhoto(15833963),
  "bujq-type-shpeze": pexelsPhoto(450326),
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

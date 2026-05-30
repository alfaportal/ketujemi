import type { MarketCode } from "@/lib/category-translations";

export type FemijeGuideLocalized = { sq: string; mk: string; mne: string };
export type FemijeConditionRow = { label: FemijeGuideLocalized; detail: FemijeGuideLocalized };
export type FemijeSubcategoryGuide = {
  intro: FemijeGuideLocalized;
  includes: FemijeGuideLocalized[];
  conditions: FemijeConditionRow[];
};

export const FEMIJE_LEAF_PARENT_GROUP_SLUG: Record<string, string> = {
  "femije-leaf-aksesore-karroce": "femije-grp-karroca-transport",
  "femije-leaf-aksesore-rroba": "femije-grp-rroba-kepuce",
  "femije-leaf-aspirator-kujdes": "femije-grp-higjiene-kujdes",
  "femije-leaf-bicikleta": "femije-grp-aktivitet-sport",
  "femije-leaf-bllokues-sirtare": "femije-grp-siguria",
  "femije-leaf-blloqe-lego": "femije-grp-lodra-edukative",
  "femije-leaf-breza-shtatzanise": "femije-grp-veshje-shtatzanise",
  "femije-leaf-canta-dore": "femije-grp-canta-nene",
  "femije-leaf-canta-shkolle": "femije-grp-libra-shkollore",
  "femije-leaf-canta-shpine": "femije-grp-canta-nene",
  "femije-leaf-dekorime-drita": "femije-grp-krevat-dhome",
  "femije-leaf-dysheke-tekstile": "femije-grp-krevat-dhome",
  "femije-leaf-ene-luge": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-fletore-materiale": "femije-grp-libra-shkollore",
  "femije-leaf-fustane-shtatzanise": "femije-grp-veshje-shtatzanise",
  "femije-leaf-jastek-anatomik": "femije-grp-veshje-shtatzanise",
  "femije-leaf-jeleke-noti": "femije-grp-pishine-plazh",
  "femije-leaf-jeleke-shpetimi": "femije-grp-siguria",
  "femije-leaf-kapele-uv": "femije-grp-pishine-plazh",
  "femije-leaf-karrige-makine-0": "femije-grp-karrige-ulese",
  "femije-leaf-karrige-makine-1": "femije-grp-karrige-ulese",
  "femije-leaf-karrige-makine-23": "femije-grp-karrige-ulese",
  "femije-leaf-karrige-makine-grupe": "femije-grp-karroca-transport",
  "femije-leaf-karrige-ushqimi": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-karrige-ushqimi-larte": "femije-grp-karrige-ulese",
  "femije-leaf-karrige-ushqimi-portative": "femije-grp-karrige-ulese",
  "femije-leaf-karroca-binjake": "femije-grp-karroca-transport",
  "femije-leaf-karroca-cader": "femije-grp-karroca-transport",
  "femije-leaf-karroca-klasike": "femije-grp-karroca-transport",
  "femije-leaf-kaske-biciklete": "femije-grp-siguria",
  "femije-leaf-kepuce-femijesh": "femije-grp-rroba-kepuce",
  "femije-leaf-kepuce-foshnjeje": "femije-grp-rroba-kepuce",
  "femije-leaf-kostume-loje": "femije-grp-lodra-lojera",
  "femije-leaf-kostume-sporti": "femije-grp-aktivitet-sport",
  "femije-leaf-krem-mbrojtes": "femije-grp-pishine-plazh",
  "femije-leaf-krevate-djepa": "femije-grp-krevat-dhome",
  "femije-leaf-lecke-topth": "femije-grp-higjiene-kujdes",
  "femije-leaf-lekundshe-kopsht": "femije-grp-aktivitet-sport",
  "femije-leaf-libra-edukative": "femije-grp-libra-shkollore",
  "femije-leaf-libra-perralla": "femije-grp-libra-shkollore",
  "femije-leaf-libra-shkollor": "femije-grp-libra-shkollore",
  "femije-leaf-lodra-banjo": "femije-grp-lodra-lojera",
  "femije-leaf-lodra-elektronike": "femije-grp-lodra-lojera",
  "femije-leaf-lodra-klasike": "femije-grp-lodra-lojera",
  "femije-leaf-lodra-montessori": "femije-grp-lodra-edukative",
  "femije-leaf-lodra-muzikore": "femije-grp-lodra-edukative",
  "femije-leaf-lodra-reere": "femije-grp-pishine-plazh",
  "femije-leaf-lojera-shoqerore": "femije-grp-lodra-lojera",
  "femije-leaf-mbajtese-bebe": "femije-grp-karroca-transport",
  "femije-leaf-mbajtese-shishesh": "femije-grp-canta-nene",
  "femije-leaf-mbrojtese-kendi": "femije-grp-siguria",
  "femije-leaf-mbrojtese-priza": "femije-grp-siguria",
  "femije-leaf-mbulesa-shi-diell": "femije-grp-canta-nene",
  "femije-leaf-mjete-vizatimi": "femije-grp-libra-shkollore",
  "femije-leaf-mobilje-dhome": "femije-grp-krevat-dhome",
  "femije-leaf-monitor-audio": "femije-grp-siguria",
  "femije-leaf-monitor-video": "femije-grp-siguria",
  "femije-leaf-organizatore-karroce": "femije-grp-canta-nene",
  "femije-leaf-pantallona-shtatzanise": "femije-grp-veshje-shtatzanise",
  "femije-leaf-pelene-njeperdorimshme": "femije-grp-higjiene-kujdes",
  "femije-leaf-pelene-riperdorshme": "femije-grp-higjiene-kujdes",
  "femije-leaf-pishina-fryra": "femije-grp-pishine-plazh",
  "femije-leaf-pompe-gjiri": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-porta-sigurie": "femije-grp-siguria",
  "femije-leaf-produkte-kujdesi-shtatzanise": "femije-grp-veshje-shtatzanise",
  "femije-leaf-produkte-lekure": "femije-grp-higjiene-kujdes",
  "femije-leaf-puzzle-edukative": "femije-grp-lodra-edukative",
  "femije-leaf-rroba-foshnjeje": "femije-grp-rroba-kepuce",
  "femije-leaf-rroba-shkollore": "femije-grp-rroba-kepuce",
  "femije-leaf-rroba-vegjelish": "femije-grp-rroba-kepuce",
  "femije-leaf-shishe-biberon": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-shpatulla-patina": "femije-grp-aktivitet-sport",
  "femije-leaf-sisteme-udhetimi": "femije-grp-karroca-transport",
  "femije-leaf-sterilizues-ngrohes": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-sutjena-gji": "femije-grp-veshje-shtatzanise",
  "femije-leaf-tapete-sensor": "femije-grp-lodra-edukative",
  "femije-leaf-termometer-pajisje": "femije-grp-higjiene-kujdes",
  "femije-leaf-topa-sport": "femije-grp-aktivitet-sport",
  "femije-leaf-trampoline": "femije-grp-aktivitet-sport",
  "femije-leaf-trotinet-skiro": "femije-grp-aktivitet-sport",
  "femije-leaf-ulese-ngritese": "femije-grp-karrige-ulese",
  "femije-leaf-ushqim-bebe": "femije-grp-ushqyerja-ushqimi",
  "femije-leaf-vaske-banjoje": "femije-grp-higjiene-kujdes",
  "femije-leaf-veshje-banjo": "femije-grp-pishine-plazh",
  "femije-leaf-veshje-dimri": "femije-grp-rroba-kepuce",
  "femije-leaf-veshje-vere": "femije-grp-rroba-kepuce",
};

const GUIDES: Record<string, FemijeSubcategoryGuide> = {
  "femije": {
    intro: { sq: "Fëmijë — zgjidhni grupin që i përshtatet produktit tuaj (transport, rroba, lodra, ushqim, etj.), pastaj nënkategorinë e saktë. Çdo hap ka shpjegim se çfarë duhet të përmbajë shpallja.", mk: "Деца — изберете група (транспорт, облека, играчки…), потоа точна поткатегорија со правила за оглас.", mne: "Djeca — izaberite grupu (transport, odjeća, igračke…), zatim tačnu potkategoriju sa pravilima za oglas." },
    includes: [
      { sq: "19 grupe kryesore + nënkategori të detajuara (p.sh. biçikleta, rroba shkollore, pelena).", mk: "19 grupe kryesore + nënkategori të detajuara (p.sh. biçikleta, rroba shkollore, pelena).", mne: "19 grupe kryesore + nënkategori të detajuara (p.sh. biçikleta, rroba shkollore, pelena)." },
      { sq: "Lexoni udhëzimet para postimit — gjendja (i ri, i përdorur, dhuratë, i dëmtuar) duhet të jetë e qartë.", mk: "Lexoni udhëzimet para postimit — gjendja (i ri, i përdorur, dhuratë, i dëmtuar) duhet të jetë e qartë.", mne: "Lexoni udhëzimet para postimit — gjendja (i ri, i përdorur, dhuratë, i dëmtuar) duhet të jetë e qartë." },
    ],
    conditions: [
    ],
  },
  "femije-grp-aktivitet-sport": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Aktivitet & Sport Fëmijësh». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Активности & Спорт за деца». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Aktivnosti & Sport za djecu». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Biçikleta fëmijësh; Trotineta & Skiro; Shpatulla & Patina; Trampolinë & Rrëshqitëse; Lëkundshe & Lojëra kopshti; Topa & Pajisje sportive; Kostume sporti.", mk: "Përfshin: Biçikleta fëmijësh; Trotineta & Skiro; Shpatulla & Patina; Trampolinë & Rrëshqitëse; Lëkundshe & Lojëra kopshti; Topa & Pajisje sportive; Kostume sporti.", mne: "Përfshin: Biçikleta fëmijësh; Trotineta & Skiro; Shpatulla & Patina; Trampolinë & Rrëshqitëse; Lëkundshe & Lojëra kopshti; Topa & Pajisje sportive; Kostume sporti." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-canta-nene": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Çanta & Aksesorë Nënë». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Торби & Аксесоари за мајки». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Torbe & Akcesori za majke». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Çanta shpine për foshnje (diaper bag); Çanta dore për foshnje; Organizatorë karroce; Mbajtëse shishesh; Mbulesa shi & dielli për karrocë.", mk: "Përfshin: Çanta shpine për foshnje (diaper bag); Çanta dore për foshnje; Organizatorë karroce; Mbajtëse shishesh; Mbulesa shi & dielli për karrocë.", mne: "Përfshin: Çanta shpine për foshnje (diaper bag); Çanta dore për foshnje; Organizatorë karroce; Mbajtëse shishesh; Mbulesa shi & dielli për karrocë." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-higjiene-kujdes": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Higjienë & Kujdes». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Хигиена & Нега». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Higijena & Njega». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Pelenë njëpërdorimshme; Pelenë të ripërdorshme; Leckë & Topth pelene; Vaskë banjoje foshnjeje; Produkte lëkure (krem, shampo, vaj masazhi); Termometër & Pajisje shëndetësore; Aspirator hundësh & Kujdes i përditshëm.", mk: "Përfshin: Pelenë njëpërdorimshme; Pelenë të ripërdorshme; Leckë & Topth pelene; Vaskë banjoje foshnjeje; Produkte lëkure (krem, shampo, vaj masazhi); Termometër & Pajisje shëndetësore; Aspirator hundësh & Kujdes i përditshëm.", mne: "Përfshin: Pelenë njëpërdorimshme; Pelenë të ripërdorshme; Leckë & Topth pelene; Vaskë banjoje foshnjeje; Produkte lëkure (krem, shampo, vaj masazhi); Termometër & Pajisje shëndetësore; Aspirator hundësh & Kujdes i përditshëm." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-karrige-ulese": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Karrige & Ulëse Bebe». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Столчиња & Седишта за бебе». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Stolice & Sjedišta za bebe». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Karrige ushqimi të larta; Karrige ushqimi portative; Karrige makine grup 0+ (0-13 kg); Karrige makine grup 1 (9-18 kg); Karrige makine grup 2/3 (15-36 kg); Ulëse ngritëse (booster seat).", mk: "Përfshin: Karrige ushqimi të larta; Karrige ushqimi portative; Karrige makine grup 0+ (0-13 kg); Karrige makine grup 1 (9-18 kg); Karrige makine grup 2/3 (15-36 kg); Ulëse ngritëse (booster seat).", mne: "Përfshin: Karrige ushqimi të larta; Karrige ushqimi portative; Karrige makine grup 0+ (0-13 kg); Karrige makine grup 1 (9-18 kg); Karrige makine grup 2/3 (15-36 kg); Ulëse ngritëse (booster seat)." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-karroca-transport": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Karroca & Transport». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Колички & Транспорт». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Kolica & Transport». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Karroca klasike; Karroca çadër; Karroca për binjakë; Sisteme udhëtimi (karroca + karrige makine); Karrige makine (grup 0+, 1, 2/3); Mbajtëse bebe (kangaroo, wrap, sling); Aksesorë karroce (çadra, mbulesë shiu, çanta).", mk: "Përfshin: Karroca klasike; Karroca çadër; Karroca për binjakë; Sisteme udhëtimi (karroca + karrige makine); Karrige makine (grup 0+, 1, 2/3); Mbajtëse bebe (kangaroo, wrap, sling); Aksesorë karroce (çadra, mbulesë shiu, çanta).", mne: "Përfshin: Karroca klasike; Karroca çadër; Karroca për binjakë; Sisteme udhëtimi (karroca + karrige makine); Karrige makine (grup 0+, 1, 2/3); Mbajtëse bebe (kangaroo, wrap, sling); Aksesorë karroce (çadra, mbulesë shiu, çanta)." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-krevat-dhome": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Krevat & Dhomë Fëmijësh». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Кревет & Детска соба». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Krevet & Dječija soba». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi); Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije); Mobilje (dollap, komodë pelene, rafte lodra); Dekorime & Drita nate.", mk: "Përfshin: Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi); Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije); Mobilje (dollap, komodë pelene, rafte lodra); Dekorime & Drita nate.", mne: "Përfshin: Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi); Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije); Mobilje (dollap, komodë pelene, rafte lodra); Dekorime & Drita nate." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-libra-shkollore": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Libra & Materiale Shkollore». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Книги & Школски материјали». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Knjige & Školski materijali». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Libra me figura & Përralla (0-6 vjeç); Libra edukativë (7-14 vjeç); Libra shkollor; Fletore & Materiale shkolle; Mjete vizatimi & Pikturimi; Çanta shkolle.", mk: "Përfshin: Libra me figura & Përralla (0-6 vjeç); Libra edukativë (7-14 vjeç); Libra shkollor; Fletore & Materiale shkolle; Mjete vizatimi & Pikturimi; Çanta shkolle.", mne: "Përfshin: Libra me figura & Përralla (0-6 vjeç); Libra edukativë (7-14 vjeç); Libra shkollor; Fletore & Materiale shkolle; Mjete vizatimi & Pikturimi; Çanta shkolle." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-lodra-edukative": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Lodra Edukative». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Едукативни играчки». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Edukativne igračke». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Lodra Montessori; Blloqe ndërtimi & Lego; Lodra muzikore; Tapete loje & Stimulim sensor; Lojëra logjike & Puzzle edukative.", mk: "Përfshin: Lodra Montessori; Blloqe ndërtimi & Lego; Lodra muzikore; Tapete loje & Stimulim sensor; Lojëra logjike & Puzzle edukative.", mne: "Përfshin: Lodra Montessori; Blloqe ndërtimi & Lego; Lodra muzikore; Tapete loje & Stimulim sensor; Lojëra logjike & Puzzle edukative." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-lodra-lojera": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Lodra & Lojëra». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Играчки & Игри». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Igračke & Igre». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Lodra klasike (kukulla, figura, makina, trena); Lojëra shoqërore (lojëra tavoline, puzzle, kartela); Lodra elektronike (me bateri, tableta fëmijësh); Lodra banje & pishinë; Kostume & veshje loje.", mk: "Përfshin: Lodra klasike (kukulla, figura, makina, trena); Lojëra shoqërore (lojëra tavoline, puzzle, kartela); Lodra elektronike (me bateri, tableta fëmijësh); Lodra banje & pishinë; Kostume & veshje loje.", mne: "Përfshin: Lodra klasike (kukulla, figura, makina, trena); Lojëra shoqërore (lojëra tavoline, puzzle, kartela); Lodra elektronike (me bateri, tableta fëmijësh); Lodra banje & pishinë; Kostume & veshje loje." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-pishine-plazh": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Pishinë & Plazh për Fëmijë». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Базен & Плажа за деца». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Bazen & Plaža za djecu». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Pishina të fryra; Veshje banje & Not; Jelekë noti fëmijësh; Lodra rëre & plazhi; Kapele dielli & Mbrojtje UV; Kremra mbrojtës fëmijësh.", mk: "Përfshin: Pishina të fryra; Veshje banje & Not; Jelekë noti fëmijësh; Lodra rëre & plazhi; Kapele dielli & Mbrojtje UV; Kremra mbrojtës fëmijësh.", mne: "Përfshin: Pishina të fryra; Veshje banje & Not; Jelekë noti fëmijësh; Lodra rëre & plazhi; Kapele dielli & Mbrojtje UV; Kremra mbrojtës fëmijësh." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-rroba-kepuce": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Rroba & Këpucë Fëmijësh». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Облека & Обувки за деца». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Odjeća & Cipele za djecu». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Rroba foshnjeje (0-12 muaj); Rroba vegjëlish (1-5 vjeç); Rroba shkollore (6-14 vjeç); Veshje dimri (pallto, xhaketa, kostume); Veshje vere; Këpucë foshnjeje (hapat e parë); Këpucë fëmijësh (sportive, çizme, sandale); Aksesorë (kapele, doreza, shall, çanta shkolle).", mk: "Përfshin: Rroba foshnjeje (0-12 muaj); Rroba vegjëlish (1-5 vjeç); Rroba shkollore (6-14 vjeç); Veshje dimri (pallto, xhaketa, kostume); Veshje vere; Këpucë foshnjeje (hapat e parë); Këpucë fëmijësh (sportive, çizme, sandale); Aksesorë (kapele, doreza, shall, çanta shkolle).", mne: "Përfshin: Rroba foshnjeje (0-12 muaj); Rroba vegjëlish (1-5 vjeç); Rroba shkollore (6-14 vjeç); Veshje dimri (pallto, xhaketa, kostume); Veshje vere; Këpucë foshnjeje (hapat e parë); Këpucë fëmijësh (sportive, çizme, sandale); Aksesorë (kapele, doreza, shall, çanta shkolle)." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-siguria": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Siguria e Fëmijëve». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Безбедност на децата». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Sigurnost djece». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Porta sigurie (shkallë & dhoma); Mbrojtëse këndi & cepi tavolinash; Bllokues sirtarësh & dollapësh; Mbrojtëse prizash elektrike; Monitor bebe audio; Monitor bebe video (kamera); Jelekë shpëtimi fëmijësh; Kaskë & Mbrojtëse biçiklete.", mk: "Përfshin: Porta sigurie (shkallë & dhoma); Mbrojtëse këndi & cepi tavolinash; Bllokues sirtarësh & dollapësh; Mbrojtëse prizash elektrike; Monitor bebe audio; Monitor bebe video (kamera); Jelekë shpëtimi fëmijësh; Kaskë & Mbrojtëse biçiklete.", mne: "Përfshin: Porta sigurie (shkallë & dhoma); Mbrojtëse këndi & cepi tavolinash; Bllokues sirtarësh & dollapësh; Mbrojtëse prizash elektrike; Monitor bebe audio; Monitor bebe video (kamera); Jelekë shpëtimi fëmijësh; Kaskë & Mbrojtëse biçiklete." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-ushqyerja-ushqimi": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Ushqyerja & Ushqimi». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Исхрана & Храна». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Ishrana & Hrana». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Shishe & Biberon; Pompë gjiri (elektrike & manuale); Karrige ushqimi (high chair, portative, të palosshme); Sterilizues & Ngrohës shishesh; Enë & Lugë fëmijësh; Ushqim bebe & Snacks.", mk: "Përfshin: Shishe & Biberon; Pompë gjiri (elektrike & manuale); Karrige ushqimi (high chair, portative, të palosshme); Sterilizues & Ngrohës shishesh; Enë & Lugë fëmijësh; Ushqim bebe & Snacks.", mne: "Përfshin: Shishe & Biberon; Pompë gjiri (elektrike & manuale); Karrige ushqimi (high chair, portative, të palosshme); Sterilizues & Ngrohës shishesh; Enë & Lugë fëmijësh; Ushqim bebe & Snacks." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-grp-veshje-shtatzanise": {
    intro: { sq: "Zgjidhni një nga nënkategoritë më poshtë për «Veshje Shtatzënësie». Çdo tip ka udhëzime të veçanta se çfarë lejohet të postohet.", mk: "Изберете поткатегорија за «Облека за бременост». Секој тип има посебни правила.", mne: "Izaberite potkategoriju za «Odjeća za trudnice». Svaki tip ima posebna pravila." },
    includes: [
      { sq: "Përfshin: Fustane shtatzënësie; Pantallona & Bluza shtatzënësie; Sutjena & Veshje për gji; Breza shtatzënësie; Jastëkë anatomikë për gjumë; Produkte kujdesi (krem kundër strijave).", mk: "Përfshin: Fustane shtatzënësie; Pantallona & Bluza shtatzënësie; Sutjena & Veshje për gji; Breza shtatzënësie; Jastëkë anatomikë për gjumë; Produkte kujdesi (krem kundër strijave).", mne: "Përfshin: Fustane shtatzënësie; Pantallona & Bluza shtatzënësie; Sutjena & Veshje për gji; Breza shtatzënësie; Jastëkë anatomikë për gjumë; Produkte kujdesi (krem kundër strijave)." },
      { sq: "Klikoni kartën e duhur para se të publikoni shpalljen.", mk: "Klikoni kartën e duhur para se të publikoni shpalljen.", mne: "Klikoni kartën e duhur para se të publikoni shpalljen." },
    ],
    conditions: [
    ],
  },
  "femije-leaf-aksesore-karroce": {
    intro: { sq: "Kjo kategori është për produkte si «Aksesorë karroce (çadra, mbulesë shiu, çanta)» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Аксесоари за количка (чадор, дождевник, торба)» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Akcesori za kolica (suncobran, kišobran, torba)» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë karroce (çadra, mbulesë shiu, çanta)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë karroce (çadra, mbulesë shiu, çanta)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë karroce (çadra, mbulesë shiu, çanta)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-aksesore-rroba": {
    intro: { sq: "Kjo kategori është për produkte si «Aksesorë (kapele, doreza, shall, çanta shkolle)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Аксесоари (капи, ракавици, шал, ученичка торба)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Akcesori (kape, rukavice, šal, školska torba)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë (kapele, doreza, shall, çanta shkolle)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë (kapele, doreza, shall, çanta shkolle)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aksesorë (kapele, doreza, shall, çanta shkolle)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-aspirator-kujdes": {
    intro: { sq: "Kjo kategori është për produkte si «Aspirator hundësh & Kujdes i përditshëm» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Аспиратор за нос & Дневна нега» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Aspirator za nos & Dnevna njega» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aspirator hundësh & Kujdes i përditshëm».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aspirator hundësh & Kujdes i përditshëm».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Aspirator hundësh & Kujdes i përditshëm»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-bicikleta": {
    intro: { sq: "Kjo është kategoria për biçikleta, triçikleta dhe biçikleta me rrota ndihmëse për fëmijë (zakonisht 2–12 vjeç).", mk: "Категорија за детски велосипеди, триколки и велосипеди со помошни тркала (2–12 години).", mne: "Kategorija za dječje bicikle, tricikle i bicikle s pomoćnim točkovima (2–12 godina)." },
    includes: [
      { sq: "Biçikleta me pedale, me/zbrit rrota ndihmëse, madhësi 12\"–24\".", mk: "Biçikleta me pedale, me/zbrit rrota ndihmëse, madhësi 12\"–24\".", mne: "Biçikleta me pedale, me/zbrit rrota ndihmëse, madhësi 12\"–24\"." },
      { sq: "Triçikleta, biçikleta balance, biçikleta të montuara ose të papërfunduara (nëse e përcaktoni).", mk: "Triçikleta, biçikleta balance, biçikleta të montuara ose të papërfunduara (nëse e përcaktoni).", mne: "Triçikleta, biçikleta balance, biçikleta të montuara ose të papërfunduara (nëse e përcaktoni)." },
      { sq: "Nuk përfshin: patina, trotineta, trampolina, karrige makine ose karroca.", mk: "Nuk përfshin: patina, trotineta, trampolina, karrige makine ose karroca.", mne: "Nuk përfshin: patina, trotineta, trampolina, karrige makine ose karroca." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-bllokues-sirtare": {
    intro: { sq: "Kjo kategori është për produkte si «Bllokues sirtarësh & dollapësh» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Закljučувачи за фиоки & ормани» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Brave za fioke & ormare» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Bllokues sirtarësh & dollapësh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Bllokues sirtarësh & dollapësh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Bllokues sirtarësh & dollapësh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-blloqe-lego": {
    intro: { sq: "Kjo kategori është për produkte si «Blloqe ndërtimi & Lego» brenda «Lodra Edukative». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Градивни блокови & Lego» во «Едукативни играчки».", mne: "Ova kategorija je za proizvode kao «Građevni blokovi & Lego» u «Edukativne igračke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Blloqe ndërtimi & Lego».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Blloqe ndërtimi & Lego».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Blloqe ndërtimi & Lego»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-breza-shtatzanise": {
    intro: { sq: "Kjo kategori është për produkte si «Breza shtatzënësie» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Појас за бременост» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Pojas za trudnice» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Breza shtatzënësie».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Breza shtatzënësie».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Breza shtatzënësie»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-canta-dore": {
    intro: { sq: "Kjo kategori është për produkte si «Çanta dore për foshnje» brenda «Çanta & Aksesorë Nënë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Торба за рака за бебе» во «Торби & Аксесоари за мајки».", mne: "Ova kategorija je za proizvode kao «Torba za ruku za bebe» u «Torbe & Akcesori za majke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta dore për foshnje».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta dore për foshnje».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta dore për foshnje»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-canta-shkolle": {
    intro: { sq: "Kjo kategori është për produkte si «Çanta shkolle» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Ученичка торба» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Školska torba» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shkolle».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shkolle».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shkolle»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-canta-shpine": {
    intro: { sq: "Kjo kategori është për produkte si «Çanta shpine për foshnje (diaper bag)» brenda «Çanta & Aksesorë Nënë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Ранец за бебе (diaper bag)» во «Торби & Аксесоари за мајки».", mne: "Ova kategorija je za proizvode kao «Ruksak za bebe (diaper bag)» u «Torbe & Akcesori za majke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shpine për foshnje (diaper bag)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shpine për foshnje (diaper bag)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Çanta shpine për foshnje (diaper bag)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-dekorime-drita": {
    intro: { sq: "Kjo kategori është për produkte si «Dekorime & Drita nate» brenda «Krevat & Dhomë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Декорации & Ноќни светла» во «Кревет & Детска соба».", mne: "Ova kategorija je za proizvode kao «Dekoracije & Noćna svjetla» u «Krevet & Dječija soba»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dekorime & Drita nate».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dekorime & Drita nate».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dekorime & Drita nate»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-dysheke-tekstile": {
    intro: { sq: "Kjo kategori është për produkte si «Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)» brenda «Krevat & Dhomë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Мадраци & Текстил (чаршафи, перници, ќебиња)» во «Кревет & Детска соба».", mne: "Ova kategorija je za proizvode kao «Dušeci & Tekstil (plahte, jastuci, ćebad)» u «Krevet & Dječija soba»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-ene-luge": {
    intro: { sq: "Kjo kategori është për produkte si «Enë & Lugë fëmijësh» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Садови & Лжици за деца» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Posuđe & Kašike za djecu» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Enë & Lugë fëmijësh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Enë & Lugë fëmijësh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Enë & Lugë fëmijësh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-fletore-materiale": {
    intro: { sq: "Kjo kategori është për produkte si «Fletore & Materiale shkolle» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Тетратки & Школски материјали» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Sveske & Školski materijali» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fletore & Materiale shkolle».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fletore & Materiale shkolle».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fletore & Materiale shkolle»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-fustane-shtatzanise": {
    intro: { sq: "Kjo kategori është për produkte si «Fustane shtatzënësie» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Фустани за бременост» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Haljine za trudnice» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fustane shtatzënësie».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fustane shtatzënësie».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Fustane shtatzënësie»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-jastek-anatomik": {
    intro: { sq: "Kjo kategori është për produkte si «Jastëkë anatomikë për gjumë» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Анатомски перници за спиење» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Anatomski jastuci za spavanje» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jastëkë anatomikë për gjumë».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jastëkë anatomikë për gjumë».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jastëkë anatomikë për gjumë»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-jeleke-noti": {
    intro: { sq: "Kjo kategori është për produkte si «Jelekë noti fëmijësh» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Пливачки елеци за деца» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Prsluci za plivanje za djecu» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë noti fëmijësh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë noti fëmijësh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë noti fëmijësh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-jeleke-shpetimi": {
    intro: { sq: "Kjo kategori është për produkte si «Jelekë shpëtimi fëmijësh» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Спасилачки детски елеци» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Spasilački dječji prsluci» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë shpëtimi fëmijësh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë shpëtimi fëmijësh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Jelekë shpëtimi fëmijësh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kapele-uv": {
    intro: { sq: "Kjo kategori është për produkte si «Kapele dielli & Mbrojtje UV» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Капи за сонце & UV заштита» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Kape za sunce & UV zaštita» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kapele dielli & Mbrojtje UV».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kapele dielli & Mbrojtje UV».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kapele dielli & Mbrojtje UV»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-makine-0": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige makine grup 0+ (0-13 kg)» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Автоседиште група 0+ (0-13 kg)» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Autosjediste grupa 0+ (0-13 kg)» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 0+ (0-13 kg)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 0+ (0-13 kg)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 0+ (0-13 kg)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-makine-1": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige makine grup 1 (9-18 kg)» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Автоседиште група 1 (9-18 kg)» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Autosjediste grupa 1 (9-18 kg)» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 1 (9-18 kg)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 1 (9-18 kg)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 1 (9-18 kg)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-makine-23": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige makine grup 2/3 (15-36 kg)» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Автоседиште група 2/3 (15-36 kg)» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Autosjediste grupa 2/3 (15-36 kg)» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 2/3 (15-36 kg)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 2/3 (15-36 kg)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine grup 2/3 (15-36 kg)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-makine-grupe": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige makine (grup 0+, 1, 2/3)» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Автоседишта (група 0+, 1, 2/3)» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Autosjedista (grupa 0+, 1, 2/3)» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine (grup 0+, 1, 2/3)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine (grup 0+, 1, 2/3)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige makine (grup 0+, 1, 2/3)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-ushqimi": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige ushqimi (high chair, portative, të palosshme)» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Столчиња за храна (high chair, преносни, складни)» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Stolice za hranu (high chair, prenosive, sklopive)» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi (high chair, portative, të palosshme)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi (high chair, portative, të palosshme)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi (high chair, portative, të palosshme)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-ushqimi-larte": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige ushqimi të larta» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Високи столчиња за храна» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Visoke stolice za hranu» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi të larta».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi të larta».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi të larta»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karrige-ushqimi-portative": {
    intro: { sq: "Kjo kategori është për produkte si «Karrige ushqimi portative» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Преносни столчиња за храна» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Prenosive stolice za hranu» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi portative».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi portative».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karrige ushqimi portative»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karroca-binjake": {
    intro: { sq: "Kjo kategori është për produkte si «Karroca për binjakë» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Количка за близнаци» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Kolica za blizance» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca për binjakë».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca për binjakë».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca për binjakë»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karroca-cader": {
    intro: { sq: "Kjo kategori është për produkte si «Karroca çadër» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Количка чадор» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Kolica suncobran» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca çadër».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca çadër».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca çadër»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-karroca-klasike": {
    intro: { sq: "Kjo kategori është për produkte si «Karroca klasike» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Класична количка» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Klasična kolica» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca klasike».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca klasike».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Karroca klasike»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kaske-biciklete": {
    intro: { sq: "Kjo kategori është për produkte si «Kaskë & Mbrojtëse biçiklete» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Кацига & Заштита за велосипед» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Kaciga & Zaštita za bicikl» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kaskë & Mbrojtëse biçiklete».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kaskë & Mbrojtëse biçiklete».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kaskë & Mbrojtëse biçiklete»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kepuce-femijesh": {
    intro: { sq: "Kjo kategori është për produkte si «Këpucë fëmijësh (sportive, çizme, sandale)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Детски обувки (спортски, чизми, сандали)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Dječje cipele (sport, čizme, sandale)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë fëmijësh (sportive, çizme, sandale)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë fëmijësh (sportive, çizme, sandale)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë fëmijësh (sportive, çizme, sandale)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kepuce-foshnjeje": {
    intro: { sq: "Kjo kategori është për produkte si «Këpucë foshnjeje (hapat e parë)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Обувки за новороденче (први чекори)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Cipele za novorođenče (prvi koraci)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë foshnjeje (hapat e parë)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë foshnjeje (hapat e parë)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Këpucë foshnjeje (hapat e parë)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kostume-loje": {
    intro: { sq: "Kjo kategori është për produkte si «Kostume & veshje loje» brenda «Lodra & Lojëra». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Костими & Облека за игра» во «Играчки & Игри».", mne: "Ova kategorija je za proizvode kao «Kostimi & Odjeća za igru» u «Igračke & Igre»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume & veshje loje».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume & veshje loje».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume & veshje loje»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-kostume-sporti": {
    intro: { sq: "Kjo kategori është për produkte si «Kostume sporti» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Спортски костими» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Sportski kostimi» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume sporti».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume sporti».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kostume sporti»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-krem-mbrojtes": {
    intro: { sq: "Kjo kategori është për produkte si «Kremra mbrojtës fëmijësh» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Заштитни кремови за деца» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Zaštitni kremovi za djecu» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kremra mbrojtës fëmijësh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kremra mbrojtës fëmijësh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Kremra mbrojtës fëmijësh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-krevate-djepa": {
    intro: { sq: "Kjo kategori është për produkte si «Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)» brenda «Krevat & Dhomë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Кревети & Лулки (дрво, лула, патнички)» во «Кревет & Детска соба».", mne: "Ova kategorija je za proizvode kao «Kreveti & Kolijevke (drvo, ljuljaška, putni)» u «Krevet & Dječija soba»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lecke-topth": {
    intro: { sq: "Kjo kategori është për produkte si «Leckë & Topth pelene» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Подлоги & Пеленски топови» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Podloge & Pelene kugle» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Leckë & Topth pelene».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Leckë & Topth pelene».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Leckë & Topth pelene»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lekundshe-kopsht": {
    intro: { sq: "Kjo kategori është për produkte si «Lëkundshe & Lojëra kopshti» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Лулки & Игралишни играчки» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Ljuljaške & Vrtne igračke» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lëkundshe & Lojëra kopshti».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lëkundshe & Lojëra kopshti».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lëkundshe & Lojëra kopshti»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-libra-edukative": {
    intro: { sq: "Kjo kategori është për produkte si «Libra edukativë (7-14 vjeç)» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Едукативни книги (7-14 год.)» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Edukativne knjige (7-14 god.)» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra edukativë (7-14 vjeç)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra edukativë (7-14 vjeç)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra edukativë (7-14 vjeç)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-libra-perralla": {
    intro: { sq: "Kjo kategori është për produkte si «Libra me figura & Përralla (0-6 vjeç)» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Сликовници & Бајки (0-6 год.)» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Slikovnice & Bajke (0-6 god.)» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra me figura & Përralla (0-6 vjeç)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra me figura & Përralla (0-6 vjeç)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra me figura & Përralla (0-6 vjeç)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-libra-shkollor": {
    intro: { sq: "Kjo kategori është për produkte si «Libra shkollor» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Учебници» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Udžbenici» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra shkollor».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra shkollor».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Libra shkollor»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-banjo": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra banje & pishinë» brenda «Lodra & Lojëra». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Играчки за бања & базен» во «Играчки & Игри».", mne: "Ova kategorija je za proizvode kao «Igračke za kupku & bazen» u «Igračke & Igre»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra banje & pishinë».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra banje & pishinë».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra banje & pishinë»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-elektronike": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra elektronike (me bateri, tableta fëmijësh)» brenda «Lodra & Lojëra». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Електронски играчки (на батерии, детски таблети)» во «Играчки & Игри».", mne: "Ova kategorija je za proizvode kao «Elektronske igračke (na baterije, dječji tableti)» u «Igračke & Igre»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra elektronike (me bateri, tableta fëmijësh)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra elektronike (me bateri, tableta fëmijësh)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra elektronike (me bateri, tableta fëmijësh)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-klasike": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra klasike (kukulla, figura, makina, trena)» brenda «Lodra & Lojëra». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Класични играчки (кукли, фигури, коли, возови)» во «Играчки & Игри».", mne: "Ova kategorija je za proizvode kao «Klasične igračke (lutke, figure, autići, vozovi)» u «Igračke & Igre»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra klasike (kukulla, figura, makina, trena)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra klasike (kukulla, figura, makina, trena)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra klasike (kukulla, figura, makina, trena)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-montessori": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra Montessori» brenda «Lodra Edukative». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Montessori играчки» во «Едукативни играчки».", mne: "Ova kategorija je za proizvode kao «Montessori igračke» u «Edukativne igračke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra Montessori».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra Montessori».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra Montessori»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-muzikore": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra muzikore» brenda «Lodra Edukative». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Музички играчки» во «Едукативни играчки».", mne: "Ova kategorija je za proizvode kao «Muzičke igračke» u «Edukativne igračke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra muzikore».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra muzikore».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra muzikore»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lodra-reere": {
    intro: { sq: "Kjo kategori është për produkte si «Lodra rëre & plazhi» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Играчки за песок & плажа» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Igračke za pijesak & plažu» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra rëre & plazhi».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra rëre & plazhi».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lodra rëre & plazhi»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-lojera-shoqerore": {
    intro: { sq: "Kjo kategori është për produkte si «Lojëra shoqërore (lojëra tavoline, puzzle, kartela)» brenda «Lodra & Lojëra». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Друштvenи игри (друштvenи, puzzle, карти)» во «Играчки & Игри».", mne: "Ova kategorija je za proizvode kao «Društvene igre (društvene, puzzle, karte)» u «Igračke & Igre»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra shoqërore (lojëra tavoline, puzzle, kartela)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra shoqërore (lojëra tavoline, puzzle, kartela)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra shoqërore (lojëra tavoline, puzzle, kartela)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mbajtese-bebe": {
    intro: { sq: "Kjo kategori është për produkte si «Mbajtëse bebe (kangaroo, wrap, sling)» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Носилки за бебе (kangaroo, wrap, sling)» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Nosiljke za bebe (kangaroo, wrap, sling)» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse bebe (kangaroo, wrap, sling)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse bebe (kangaroo, wrap, sling)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse bebe (kangaroo, wrap, sling)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mbajtese-shishesh": {
    intro: { sq: "Kjo kategori është për produkte si «Mbajtëse shishesh» brenda «Çanta & Aksesorë Nënë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Држачи за шишета» во «Торби & Аксесоари за мајки».", mne: "Ova kategorija je za proizvode kao «Držači za flašice» u «Torbe & Akcesori za majke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse shishesh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse shishesh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbajtëse shishesh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mbrojtese-kendi": {
    intro: { sq: "Kjo kategori është për produkte si «Mbrojtëse këndi & cepi tavolinash» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Заштита за агли & рабови на маса» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Zaštita za uglove & ivice stola» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse këndi & cepi tavolinash».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse këndi & cepi tavolinash».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse këndi & cepi tavolinash»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mbrojtese-priza": {
    intro: { sq: "Kjo kategori është për produkte si «Mbrojtëse prizash elektrike» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Заштита за штекери» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Zaštita za utičnice» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse prizash elektrike».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse prizash elektrike».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbrojtëse prizash elektrike»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mbulesa-shi-diell": {
    intro: { sq: "Kjo kategori është për produkte si «Mbulesa shi & dielli për karrocë» brenda «Çanta & Aksesorë Nënë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Заштита од дожд & сонце за количка» во «Торби & Аксесоари за мајки».", mne: "Ova kategorija je za proizvode kao «Zaštita od kiše & sunca za kolica» u «Torbe & Akcesori za majke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbulesa shi & dielli për karrocë».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbulesa shi & dielli për karrocë».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mbulesa shi & dielli për karrocë»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mjete-vizatimi": {
    intro: { sq: "Kjo kategori është për produkte si «Mjete vizatimi & Pikturimi» brenda «Libra & Materiale Shkollore». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Средства за цртање & Сликање» во «Книги & Школски материјали».", mne: "Ova kategorija je za proizvode kao «Sredstva za crtanje & Slikanje» u «Knjige & Školski materijali»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mjete vizatimi & Pikturimi».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mjete vizatimi & Pikturimi».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mjete vizatimi & Pikturimi»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-mobilje-dhome": {
    intro: { sq: "Kjo kategori është për produkte si «Mobilje (dollap, komodë pelene, rafte lodra)» brenda «Krevat & Dhomë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Мебел (орман, комoda за пелени, полици)» во «Кревет & Детска соба».", mne: "Ova kategorija je za proizvode kao «Namještaj (ormar, komoda za pelene, police)» u «Krevet & Dječija soba»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mobilje (dollap, komodë pelene, rafte lodra)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mobilje (dollap, komodë pelene, rafte lodra)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Mobilje (dollap, komodë pelene, rafte lodra)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-monitor-audio": {
    intro: { sq: "Kjo kategori është për produkte si «Monitor bebe audio» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Аудио бебе монитор» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Audio bebe monitor» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe audio».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe audio».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe audio»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-monitor-video": {
    intro: { sq: "Kjo kategori është për produkte si «Monitor bebe video (kamera)» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Видео бебе монитор (кamera)» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Video bebe monitor (kamera)» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe video (kamera)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe video (kamera)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Monitor bebe video (kamera)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-organizatore-karroce": {
    intro: { sq: "Kjo kategori është për produkte si «Organizatorë karroce» brenda «Çanta & Aksesorë Nënë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Организатори за количка» во «Торби & Аксесоари за мајки».", mne: "Ova kategorija je za proizvode kao «Organizatori za kolica» u «Torbe & Akcesori za majke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Organizatorë karroce».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Organizatorë karroce».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Organizatorë karroce»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-pantallona-shtatzanise": {
    intro: { sq: "Kjo kategori është për produkte si «Pantallona & Bluza shtatzënësie» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Панталони & Маици за бременост» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Pantalone & Majice za trudnice» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pantallona & Bluza shtatzënësie».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pantallona & Bluza shtatzënësie».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pantallona & Bluza shtatzënësie»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-pelene-njeperdorimshme": {
    intro: { sq: "Kjo kategori është për produkte si «Pelenë njëpërdorimshme» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Еднократни пелени» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Jednokratne pelene» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë njëpërdorimshme».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë njëpërdorimshme».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë njëpërdorimshme»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-pelene-riperdorshme": {
    intro: { sq: "Kjo kategori është për produkte si «Pelenë të ripërdorshme» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Многоразни пелени» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Višekratne pelene» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë të ripërdorshme».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë të ripërdorshme».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pelenë të ripërdorshme»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-pishina-fryra": {
    intro: { sq: "Kjo kategori është për produkte si «Pishina të fryra» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Надuvливи базени» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Duvani bazeni» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pishina të fryra».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pishina të fryra».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pishina të fryra»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-pompe-gjiri": {
    intro: { sq: "Kjo kategori është për produkte si «Pompë gjiri (elektrike & manuale)» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Пумпи за дојка (електрични & рачни)» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Pumpe za grudi (električne & ručne)» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pompë gjiri (elektrike & manuale)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pompë gjiri (elektrike & manuale)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Pompë gjiri (elektrike & manuale)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-porta-sigurie": {
    intro: { sq: "Kjo kategori është për produkte si «Porta sigurie (shkallë & dhoma)» brenda «Siguria e Fëmijëve». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Безбедносни врати (скали & соби)» во «Безбедност на децата».", mne: "Ova kategorija je za proizvode kao «Sigurnosna vrata (stepenice & sobe)» u «Sigurnost djece»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Porta sigurie (shkallë & dhoma)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Porta sigurie (shkallë & dhoma)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Porta sigurie (shkallë & dhoma)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-produkte-kujdesi-shtatzanise": {
    intro: { sq: "Kjo kategori është për produkte si «Produkte kujdesi (krem kundër strijave)» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Нега (крем против стрии)» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Njega (krem protiv strija)» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte kujdesi (krem kundër strijave)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte kujdesi (krem kundër strijave)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte kujdesi (krem kundër strijave)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-produkte-lekure": {
    intro: { sq: "Kjo kategori është për produkte si «Produkte lëkure (krem, shampo, vaj masazhi)» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Производи за кожа (крем, шампон, масажно масло)» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Proizvodi za kožu (krem, šampon, ulje za masažu)» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte lëkure (krem, shampo, vaj masazhi)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte lëkure (krem, shampo, vaj masazhi)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Produkte lëkure (krem, shampo, vaj masazhi)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-puzzle-edukative": {
    intro: { sq: "Kjo kategori është për produkte si «Lojëra logjike & Puzzle edukative» brenda «Lodra Edukative». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Логички игри & Едукативни puzzle» во «Едукативни играчки».", mne: "Ova kategorija je za proizvode kao «Logičke igre & Edukativni puzzle» u «Edukativne igračke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra logjike & Puzzle edukative».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra logjike & Puzzle edukative».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Lojëra logjike & Puzzle edukative»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-rroba-foshnjeje": {
    intro: { sq: "Kjo kategori është për produkte si «Rroba foshnjeje (0-12 muaj)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Облека за новороденче (0-12 мес.)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Odjeća za novorođenče (0-12 mj.)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba foshnjeje (0-12 muaj)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba foshnjeje (0-12 muaj)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba foshnjeje (0-12 muaj)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-rroba-shkollore": {
    intro: { sq: "Kjo kategori është për produkte si «Rroba shkollore (6-14 vjeç)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Школска облека (6-14 год.)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Školska odjeća (6-14 god.)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba shkollore (6-14 vjeç)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba shkollore (6-14 vjeç)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba shkollore (6-14 vjeç)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-rroba-vegjelish": {
    intro: { sq: "Kjo kategori është për produkte si «Rroba vegjëlish (1-5 vjeç)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Облека за мали деца (1-5 год.)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Odjeća za malu djecu (1-5 god.)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba vegjëlish (1-5 vjeç)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba vegjëlish (1-5 vjeç)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Rroba vegjëlish (1-5 vjeç)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-shishe-biberon": {
    intro: { sq: "Kjo kategori është për produkte si «Shishe & Biberon» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Шишета & Биберони» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Flašice & Cucle» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shishe & Biberon».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shishe & Biberon».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shishe & Biberon»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-shpatulla-patina": {
    intro: { sq: "Kjo kategori është për produkte si «Shpatulla & Patina» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Ролери & Патинки» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Roleri & Patinke» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shpatulla & Patina».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shpatulla & Patina».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Shpatulla & Patina»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-sisteme-udhetimi": {
    intro: { sq: "Kjo kategori është për produkte si «Sisteme udhëtimi (karroca + karrige makine)» brenda «Karroca & Transport». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Системи за патување (количка + автоседиште)» во «Колички & Транспорт».", mne: "Ova kategorija je za proizvode kao «Sistemi za putovanje (kolica + autosjediste)» u «Kolica & Transport»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sisteme udhëtimi (karroca + karrige makine)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sisteme udhëtimi (karroca + karrige makine)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sisteme udhëtimi (karroca + karrige makine)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-sterilizues-ngrohes": {
    intro: { sq: "Kjo kategori është për produkte si «Sterilizues & Ngrohës shishesh» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Стерилизатори & Загревачи шишета» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Sterilizatori & Grijači flašica» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sterilizues & Ngrohës shishesh».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sterilizues & Ngrohës shishesh».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sterilizues & Ngrohës shishesh»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-sutjena-gji": {
    intro: { sq: "Kjo kategori është për produkte si «Sutjena & Veshje për gji» brenda «Veshje Shtatzënësie». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Градник & Облека за доење» во «Облека за бременост».", mne: "Ova kategorija je za proizvode kao «Grudnjak & Odjeća za dojenje» u «Odjeća za trudnice»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sutjena & Veshje për gji».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sutjena & Veshje për gji».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Sutjena & Veshje për gji»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-tapete-sensor": {
    intro: { sq: "Kjo kategori është për produkte si «Tapete loje & Stimulim sensor» brenda «Lodra Edukative». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Теписи за игра & Сензорна стимулација» во «Едукативни играчки».", mne: "Ova kategorija je za proizvode kao «Tepisi za igru & Senzorna stimulacija» u «Edukativne igračke»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Tapete loje & Stimulim sensor».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Tapete loje & Stimulim sensor».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Tapete loje & Stimulim sensor»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-termometer-pajisje": {
    intro: { sq: "Kjo kategori është për produkte si «Termometër & Pajisje shëndetësore» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Термометар & Здравствени уреди» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Termometar & Zdravstveni aparati» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Termometër & Pajisje shëndetësore».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Termometër & Pajisje shëndetësore».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Termometër & Pajisje shëndetësore»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-topa-sport": {
    intro: { sq: "Kjo kategori është për produkte si «Topa & Pajisje sportive» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Топки & Спортска опрема» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Lopte & Sportska oprema» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Topa & Pajisje sportive».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Topa & Pajisje sportive».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Topa & Pajisje sportive»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-trampoline": {
    intro: { sq: "Kjo kategori është për produkte si «Trampolinë & Rrëshqitëse» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Трамполини & Лизгалки» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Trampolini & Tobogani» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trampolinë & Rrëshqitëse».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trampolinë & Rrëshqitëse».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trampolinë & Rrëshqitëse»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-trotinet-skiro": {
    intro: { sq: "Kjo kategori është për produkte si «Trotineta & Skiro» brenda «Aktivitet & Sport Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Тротинети & Скиера» во «Активности & Спорт за деца».", mne: "Ova kategorija je za proizvode kao «Trotineti & Skejteri» u «Aktivnosti & Sport za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trotineta & Skiro».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trotineta & Skiro».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Trotineta & Skiro»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-ulese-ngritese": {
    intro: { sq: "Kjo kategori është për produkte si «Ulëse ngritëse (booster seat)» brenda «Karrige & Ulëse Bebe». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Бустер седишта (booster seat)» во «Столчиња & Седишта за бебе».", mne: "Ova kategorija je za proizvode kao «Booster sjedišta» u «Stolice & Sjedišta za bebe»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ulëse ngritëse (booster seat)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ulëse ngritëse (booster seat)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ulëse ngritëse (booster seat)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-ushqim-bebe": {
    intro: { sq: "Kjo kategori është për produkte si «Ushqim bebe & Snacks» brenda «Ushqyerja & Ushqimi». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Храна за бебе & Snacks» во «Исхрана & Храна».", mne: "Ova kategorija je za proizvode kao «Hrana za bebe & Snacks» u «Ishrana & Hrana»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ushqim bebe & Snacks».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ushqim bebe & Snacks».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Ushqim bebe & Snacks»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-vaske-banjoje": {
    intro: { sq: "Kjo kategori është për produkte si «Vaskë banjoje foshnjeje» brenda «Higjienë & Kujdes». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Каде за купање бебе» во «Хигиена & Нега».", mne: "Ova kategorija je za proizvode kao «Kada za kupanje bebe» u «Higijena & Njega»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Vaskë banjoje foshnjeje».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Vaskë banjoje foshnjeje».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Vaskë banjoje foshnjeje»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-veshje-banjo": {
    intro: { sq: "Kjo kategori është për produkte si «Veshje banje & Not» brenda «Pishinë & Plazh për Fëmijë». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Купалишна облека & Пливање» во «Базен & Плажа за деца».", mne: "Ova kategorija je za proizvode kao «Kupaćica & Plivanje» u «Bazen & Plaža za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje banje & Not».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje banje & Not».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje banje & Not»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-veshje-dimri": {
    intro: { sq: "Kjo kategori është për produkte si «Veshje dimri (pallto, xhaketa, kostume)» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Зимска облека (капути, јакни, костими)» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Zimska odjeća (kaputi, jakne, kostimi)» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje dimri (pallto, xhaketa, kostume)».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje dimri (pallto, xhaketa, kostume)».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje dimri (pallto, xhaketa, kostume)»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-leaf-veshje-vere": {
    intro: { sq: "Kjo kategori është për produkte si «Veshje vere» brenda «Rroba & Këpucë Fëmijësh». Produkti duhet të përputhet drejtpërdrejt me këtë emër kategorie.", mk: "Оваа категорија е за производи како «Летна облека» во «Облека & Обувки за деца».", mne: "Ova kategorija je za proizvode kao «Ljetna odjeća» u «Odjeća & Cipele za djecu»." },
    includes: [
      { sq: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mk: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar).", mne: "Përmendni në titull: markën, madhësinë/moshën, ngjyrën dhe gjendjen (i ri / i përdorur / për dhuratë / i dëmtuar)." },
      { sq: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mk: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti.", mne: "Shtoni foto reale nga të gjitha anët; mos përdorni foto stock nga interneti." },
      { sq: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje vere».", mk: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje vere».", mne: "Mos e vendosni në kategori tjetër nëse artikulli nuk është «Veshje vere»." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-type-foshnje": {
    intro: { sq: "Kategori e vjetër «Pajisje për Foshnje» — përdoreni vetëm nëse nuk gjeni nënkategorinë e re. Preferoni grupet e reja në listë për filtrim më të saktë.", mk: "Постара категорија «Pajisje për Foshnje» — користете ја само ако нема нова поткатегорија.", mne: "Starija kategorija «Pajisje për Foshnje» — koristite samo ako nema novu potkategoriju." },
    includes: [
      { sq: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mk: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mne: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-type-karroca": {
    intro: { sq: "Kategori e vjetër «Karroca» — përdoreni vetëm nëse nuk gjeni nënkategorinë e re. Preferoni grupet e reja në listë për filtrim më të saktë.", mk: "Постара категорија «Karroca» — користете ја само ако нема нова поткатегорија.", mne: "Starija kategorija «Karroca» — koristite samo ako nema novu potkategoriju." },
    includes: [
      { sq: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mk: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mne: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-type-lodra": {
    intro: { sq: "Kategori e vjetër «Lodra» — përdoreni vetëm nëse nuk gjeni nënkategorinë e re. Preferoni grupet e reja në listë për filtrim më të saktë.", mk: "Постара категорија «Lodra» — користете ја само ако нема нова поткатегорија.", mne: "Starija kategorija «Lodra» — koristite samo ako nema novu potkategoriju." },
    includes: [
      { sq: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mk: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mne: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-type-rroba": {
    intro: { sq: "Kategori e vjetër «Rroba për Fëmijë» — përdoreni vetëm nëse nuk gjeni nënkategorinë e re. Preferoni grupet e reja në listë për filtrim më të saktë.", mk: "Постара категорија «Rroba për Fëmijë» — користете ја само ако нема нова поткатегорија.", mne: "Starija kategorija «Rroba për Fëmijë» — koristite samo ako nema novu potkategoriju." },
    includes: [
      { sq: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mk: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mne: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
  "femije-type-ushqim-higjiene": {
    intro: { sq: "Kategori e vjetër «Ushqim & Higjienë» — përdoreni vetëm nëse nuk gjeni nënkategorinë e re. Preferoni grupet e reja në listë për filtrim më të saktë.", mk: "Постара категорија «Ushqim & Higjienë» — користете ја само ако нема нова поткатегорија.", mne: "Starija kategorija «Ushqim & Higjienë» — koristite samo ako nema novu potkategoriju." },
    includes: [
      { sq: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mk: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme.", mne: "Shikoni 19 grupet e reja në faqen Fëmijë për kategori më të përshtatshme." },
    ],
    conditions: [
      {
    label: { sq: "I ri", mk: "Нов", mne: "Nov" },
    detail: { sq: "Artikull i papërdorur ose në paketim origjinal; përmendni garancinë nëse ka.", mk: "Неупотребуван или во оригинална амбалажа; наведете гаранција ако има.", mne: "Neiskorišten ili u originalnom pakovanju; navedite garanciju ako postoji." },
      },
      {
    label: { sq: "I përdorur", mk: "Користен", mne: "Korišten" },
    detail: { sq: "Ka qenë në përdorim por funksionon; përshkruani konsumin, pastrimin dhe çdo defekt të vogël.", mk: "Бил во употреба но работи; опишете ја потрошеноста, чистењето и мали дефекти.", mne: "Bio u upotrebi ali radi; opišite habanje, čistoću i manje nedostatke." },
      },
      {
    label: { sq: "Për dhuratë / Falas", mk: "За подарок / Бесплатно", mne: "Za poklon / Besplatno" },
    detail: { sq: "Jepet falas ose për simbolikë; sqaroni gjendjen reale që marrësi të dijë çfarë merr.", mk: "Се дава бесплатно; наведете ја реалната состојба.", mne: "Daje se besplatno; navedite stvarno stanje." },
      },
      {
    label: { sq: "I dëmtuar / Pjesë", mk: "Оштетен / Делови", mne: "Oštećen / Dijelovi" },
    detail: { sq: "Nuk funksionon plotësisht ose shitet për pjesë; mos e fshehni — shkruani saktë defektin.", mk: "Не работи целосно или се продава за делови; наведете го дефектот.", mne: "Ne radi u potpunosti ili se prodaje za dijelove; navedite kvar." },
      },
    ],
  },
};

const SLUG_RE = /^(femije|femije-(grp|type|leaf)-)/;

function pick<T extends FemijeGuideLocalized>(row: T, locale: MarketCode): string {
  if (locale === "mk") return row.mk;
  if (locale === "mne") return row.mne;
  return row.sq;
}

export function getFemijeSubcategoryGuide(
  slug: string | null | undefined,
  locale: MarketCode,
): { intro: string; includes: string[]; conditions: { label: string; detail: string }[] } | null {
  if (!slug || !SLUG_RE.test(slug)) return null;
  const g = GUIDES[slug];
  if (!g) return null;
  return {
    intro: pick(g.intro, locale),
    includes: g.includes.map((i) => pick(i, locale)),
    conditions: g.conditions.map((c) => ({
      label: pick(c.label, locale),
      detail: pick(c.detail, locale),
    })),
  };
}

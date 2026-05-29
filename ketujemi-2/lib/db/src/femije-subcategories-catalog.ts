/** Fëmijë hub extended taxonomy — groups (level 2) and listing leaves (level 3). Existing 5 `femije-type-*` rows are untouched. */

export type FemijeGroupDef = {
  name: string;
  slug: string;
  leaves: { name: string; slug: string }[];
};

export const FEMIJE_HUB_SLUG = "femije";

export const FEMIJE_EXTENDED_GROUPS: FemijeGroupDef[] = [
  {
    name: "Karroca & Transport",
    slug: "femije-grp-karroca-transport",
    leaves: [
      { name: "Karroca klasike", slug: "femije-leaf-karroca-klasike" },
      { name: "Karroca çadër", slug: "femije-leaf-karroca-cader" },
      { name: "Karroca për binjakë", slug: "femije-leaf-karroca-binjake" },
      {
        name: "Sisteme udhëtimi (karroca + karrige makine)",
        slug: "femije-leaf-sisteme-udhetimi",
      },
      {
        name: "Karrige makine (grup 0+, 1, 2/3)",
        slug: "femije-leaf-karrige-makine-grupe",
      },
      {
        name: "Mbajtëse bebe (kangaroo, wrap, sling)",
        slug: "femije-leaf-mbajtese-bebe",
      },
      {
        name: "Aksesorë karroce (çadra, mbulesë shiu, çanta)",
        slug: "femije-leaf-aksesore-karroce",
      },
    ],
  },
  {
    name: "Krevat & Dhomë Fëmijësh",
    slug: "femije-grp-krevat-dhome",
    leaves: [
      {
        name: "Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)",
        slug: "femije-leaf-krevate-djepa",
      },
      {
        name: "Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)",
        slug: "femije-leaf-dysheke-tekstile",
      },
      {
        name: "Mobilje (dollap, komodë pelene, rafte lodra)",
        slug: "femije-leaf-mobilje-dhome",
      },
      { name: "Dekorime & Drita nate", slug: "femije-leaf-dekorime-drita" },
    ],
  },
  {
    name: "Ushqyerja & Ushqimi",
    slug: "femije-grp-ushqyerja-ushqimi",
    leaves: [
      { name: "Shishe & Biberon", slug: "femije-leaf-shishe-biberon" },
      {
        name: "Pompë gjiri (elektrike & manuale)",
        slug: "femije-leaf-pompe-gjiri",
      },
      {
        name: "Karrige ushqimi (high chair, portative, të palosshme)",
        slug: "femije-leaf-karrige-ushqimi",
      },
      {
        name: "Sterilizues & Ngrohës shishesh",
        slug: "femije-leaf-sterilizues-ngrohes",
      },
      { name: "Enë & Lugë fëmijësh", slug: "femije-leaf-ene-luge" },
      { name: "Ushqim bebe & Snacks", slug: "femije-leaf-ushqim-bebe" },
    ],
  },
  {
    name: "Higjienë & Kujdes",
    slug: "femije-grp-higjiene-kujdes",
    leaves: [
      { name: "Pelenë njëpërdorimshme", slug: "femije-leaf-pelene-njeperdorimshme" },
      { name: "Pelenë të ripërdorshme", slug: "femije-leaf-pelene-riperdorshme" },
      { name: "Leckë & Topth pelene", slug: "femije-leaf-lecke-topth" },
      { name: "Vaskë banjoje foshnjeje", slug: "femije-leaf-vaske-banjoje" },
      {
        name: "Produkte lëkure (krem, shampo, vaj masazhi)",
        slug: "femije-leaf-produkte-lekure",
      },
      {
        name: "Termometër & Pajisje shëndetësore",
        slug: "femije-leaf-termometer-pajisje",
      },
      {
        name: "Aspirator hundësh & Kujdes i përditshëm",
        slug: "femije-leaf-aspirator-kujdes",
      },
    ],
  },
  {
    name: "Rroba & Këpucë Fëmijësh",
    slug: "femije-grp-rroba-kepuce",
    leaves: [
      { name: "Rroba foshnjeje (0-12 muaj)", slug: "femije-leaf-rroba-foshnjeje" },
      { name: "Rroba vegjëlish (1-5 vjeç)", slug: "femije-leaf-rroba-vegjelish" },
      { name: "Rroba shkollore (6-14 vjeç)", slug: "femije-leaf-rroba-shkollore" },
      {
        name: "Veshje dimri (pallto, xhaketa, kostume)",
        slug: "femije-leaf-veshje-dimri",
      },
      { name: "Veshje vere", slug: "femije-leaf-veshje-vere" },
      {
        name: "Këpucë foshnjeje (hapat e parë)",
        slug: "femije-leaf-kepuce-foshnjeje",
      },
      {
        name: "Këpucë fëmijësh (sportive, çizme, sandale)",
        slug: "femije-leaf-kepuce-femijesh",
      },
      {
        name: "Aksesorë (kapele, doreza, shall, çanta shkolle)",
        slug: "femije-leaf-aksesore-rroba",
      },
    ],
  },
  {
    name: "Lodra & Lojëra",
    slug: "femije-grp-lodra-lojera",
    leaves: [
      {
        name: "Lodra klasike (kukulla, figura, makina, trena)",
        slug: "femije-leaf-lodra-klasike",
      },
      {
        name: "Lojëra shoqërore (lojëra tavoline, puzzle, kartela)",
        slug: "femije-leaf-lojera-shoqerore",
      },
      {
        name: "Lodra elektronike (me bateri, tableta fëmijësh)",
        slug: "femije-leaf-lodra-elektronike",
      },
      { name: "Lodra banje & pishinë", slug: "femije-leaf-lodra-banjo" },
      { name: "Kostume & veshje loje", slug: "femije-leaf-kostume-loje" },
    ],
  },
  {
    name: "Lodra Edukative",
    slug: "femije-grp-lodra-edukative",
    leaves: [
      { name: "Lodra Montessori", slug: "femije-leaf-lodra-montessori" },
      { name: "Blloqe ndërtimi & Lego", slug: "femije-leaf-blloqe-lego" },
      { name: "Lodra muzikore", slug: "femije-leaf-lodra-muzikore" },
      {
        name: "Tapete loje & Stimulim sensor",
        slug: "femije-leaf-tapete-sensor",
      },
      {
        name: "Lojëra logjike & Puzzle edukative",
        slug: "femije-leaf-puzzle-edukative",
      },
    ],
  },
  {
    name: "Libra & Materiale Shkollore",
    slug: "femije-grp-libra-shkollore",
    leaves: [
      {
        name: "Libra me figura & Përralla (0-6 vjeç)",
        slug: "femije-leaf-libra-perralla",
      },
      {
        name: "Libra edukativë (7-14 vjeç)",
        slug: "femije-leaf-libra-edukative",
      },
      { name: "Libra shkollor", slug: "femije-leaf-libra-shkollor" },
      {
        name: "Fletore & Materiale shkolle",
        slug: "femije-leaf-fletore-materiale",
      },
      {
        name: "Mjete vizatimi & Pikturimi",
        slug: "femije-leaf-mjete-vizatimi",
      },
      { name: "Çanta shkolle", slug: "femije-leaf-canta-shkolle" },
    ],
  },
  {
    name: "Aktivitet & Sport Fëmijësh",
    slug: "femije-grp-aktivitet-sport",
    leaves: [
      { name: "Biçikleta fëmijësh", slug: "femije-leaf-bicikleta" },
      { name: "Trotineta & Skiro", slug: "femije-leaf-trotinet-skiro" },
      { name: "Shpatulla & Patina", slug: "femije-leaf-shpatulla-patina" },
      { name: "Trampolinë & Rrëshqitëse", slug: "femije-leaf-trampoline" },
      {
        name: "Lëkundshe & Lojëra kopshti",
        slug: "femije-leaf-lekundshe-kopsht",
      },
      { name: "Topa & Pajisje sportive", slug: "femije-leaf-topa-sport" },
      { name: "Kostume sporti", slug: "femije-leaf-kostume-sporti" },
    ],
  },
  {
    name: "Karrige & Ulëse Bebe",
    slug: "femije-grp-karrige-ulese",
    leaves: [
      { name: "Karrige ushqimi të larta", slug: "femije-leaf-karrige-ushqimi-larte" },
      {
        name: "Karrige ushqimi portative",
        slug: "femije-leaf-karrige-ushqimi-portative",
      },
      {
        name: "Karrige makine grup 0+ (0-13 kg)",
        slug: "femije-leaf-karrige-makine-0",
      },
      {
        name: "Karrige makine grup 1 (9-18 kg)",
        slug: "femije-leaf-karrige-makine-1",
      },
      {
        name: "Karrige makine grup 2/3 (15-36 kg)",
        slug: "femije-leaf-karrige-makine-23",
      },
      {
        name: "Ulëse ngritëse (booster seat)",
        slug: "femije-leaf-ulese-ngritese",
      },
    ],
  },
  {
    name: "Çanta & Aksesorë Nënë",
    slug: "femije-grp-canta-nene",
    leaves: [
      {
        name: "Çanta shpine për foshnje (diaper bag)",
        slug: "femije-leaf-canta-shpine",
      },
      { name: "Çanta dore për foshnje", slug: "femije-leaf-canta-dore" },
      { name: "Organizatorë karroce", slug: "femije-leaf-organizatore-karroce" },
      { name: "Mbajtëse shishesh", slug: "femije-leaf-mbajtese-shishesh" },
      {
        name: "Mbulesa shi & dielli për karrocë",
        slug: "femije-leaf-mbulesa-shi-diell",
      },
    ],
  },
  {
    name: "Veshje Shtatzënësie",
    slug: "femije-grp-veshje-shtatzanise",
    leaves: [
      { name: "Fustane shtatzënësie", slug: "femije-leaf-fustane-shtatzanise" },
      {
        name: "Pantallona & Bluza shtatzënësie",
        slug: "femije-leaf-pantallona-shtatzanise",
      },
      {
        name: "Sutjena & Veshje për gji",
        slug: "femije-leaf-sutjena-gji",
      },
      { name: "Breza shtatzënësie", slug: "femije-leaf-breza-shtatzanise" },
      {
        name: "Jastëkë anatomikë për gjumë",
        slug: "femije-leaf-jastek-anatomik",
      },
      {
        name: "Produkte kujdesi (krem kundër strijave)",
        slug: "femije-leaf-produkte-kujdesi-shtatzanise",
      },
    ],
  },
  {
    name: "Siguria e Fëmijëve",
    slug: "femije-grp-siguria",
    leaves: [
      {
        name: "Porta sigurie (shkallë & dhoma)",
        slug: "femije-leaf-porta-sigurie",
      },
      {
        name: "Mbrojtëse këndi & cepi tavolinash",
        slug: "femije-leaf-mbrojtese-kendi",
      },
      {
        name: "Bllokues sirtarësh & dollapësh",
        slug: "femije-leaf-bllokues-sirtare",
      },
      {
        name: "Mbrojtëse prizash elektrike",
        slug: "femije-leaf-mbrojtese-priza",
      },
      { name: "Monitor bebe audio", slug: "femije-leaf-monitor-audio" },
      {
        name: "Monitor bebe video (kamera)",
        slug: "femije-leaf-monitor-video",
      },
      {
        name: "Jelekë shpëtimi fëmijësh",
        slug: "femije-leaf-jeleke-shpetimi",
      },
      {
        name: "Kaskë & Mbrojtëse biçiklete",
        slug: "femije-leaf-kaske-biciklete",
      },
    ],
  },
  {
    name: "Pishinë & Plazh për Fëmijë",
    slug: "femije-grp-pishine-plazh",
    leaves: [
      { name: "Pishina të fryra", slug: "femije-leaf-pishina-fryra" },
      { name: "Veshje banje & Not", slug: "femije-leaf-veshje-banjo" },
      { name: "Jelekë noti fëmijësh", slug: "femije-leaf-jeleke-noti" },
      { name: "Lodra rëre & plazhi", slug: "femije-leaf-lodra-reere" },
      {
        name: "Kapele dielli & Mbrojtje UV",
        slug: "femije-leaf-kapele-uv",
      },
      {
        name: "Kremra mbrojtës fëmijësh",
        slug: "femije-leaf-krem-mbrojtes",
      },
    ],
  },
];

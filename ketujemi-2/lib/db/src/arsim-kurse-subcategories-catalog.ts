/** Arsim & Kurse hub — level-1 types, level-2 groups, level-3 listing leaves. */

export type ArsimKurseGroupDef = {
  name: string;
  slug: string;
  leaves: { name: string; slug: string }[];
};

export type ArsimKurseTypeDef = {
  name: string;
  slug: string;
  groups: ArsimKurseGroupDef[];
};

export const ARSIM_KURSE_HUB_SLUG = "arsim-kurse";

export const ARSIM_KURSE_TAXONOMY: ArsimKurseTypeDef[] = [
  {
    name: "Arsim Parashkollor",
    slug: "arsim-type-parashkollor",
    groups: [
      {
        name: "Çerdhe & Kopshte",
        slug: "arsim-grp-cerdhe-kopshte",
        leaves: [
          { name: "Private", slug: "arsim-leaf-cerdhe-private" },
          { name: "Publike", slug: "arsim-leaf-cerdhe-publike" },
          { name: "Qendra zhvillimore", slug: "arsim-leaf-qendra-zhvillimore" },
        ],
      },
      {
        name: "Shkollim Fillor",
        slug: "arsim-grp-shkollim-fillor",
        leaves: [
          { name: "Shkolla fillore private", slug: "arsim-leaf-shkolla-fillore-private" },
          { name: "Mësim shtëpiak", slug: "arsim-leaf-mesim-shtepiak" },
        ],
      },
    ],
  },
  {
    name: "Mësime Private",
    slug: "arsim-type-mesime-private",
    groups: [
      {
        name: "Tutorim Akademik",
        slug: "arsim-grp-tutorim-akademik",
        leaves: [
          { name: "Ndihmë për detyra", slug: "arsim-leaf-ndihme-detyra" },
          { name: "Përgatitje për provime", slug: "arsim-leaf-pergatitje-provime" },
        ],
      },
      {
        name: "Zhvillim Kognitiv",
        slug: "arsim-grp-zhvillim-kognitiv",
        leaves: [
          { name: "Logopedi", slug: "arsim-leaf-logopedi" },
          { name: "Mendimi kritik për fëmijë", slug: "arsim-leaf-mendimi-kritik-femije" },
        ],
      },
    ],
  },
  {
    name: "Gjuhë të Huaja",
    slug: "arsim-type-gjuhe-huaja",
    groups: [
      {
        name: "Kurse Standarde",
        slug: "arsim-grp-gjuhe-standarde",
        leaves: [
          { name: "Anglisht", slug: "arsim-leaf-gjuhe-anglisht" },
          { name: "Gjermanisht", slug: "arsim-leaf-gjuhe-gjermanisht" },
          { name: "Frëngjisht", slug: "arsim-leaf-gjuhe-frengjisht" },
          { name: "Italisht", slug: "arsim-leaf-gjuhe-italisht" },
          { name: "Spanjisht", slug: "arsim-leaf-gjuhe-spanjisht" },
          { name: "Turqisht", slug: "arsim-leaf-gjuhe-turqisht" },
        ],
      },
      {
        name: "Provime Ndërkombëtare",
        slug: "arsim-grp-provime-nderkombetare",
        leaves: [
          { name: "Përgatitje IELTS", slug: "arsim-leaf-pergatitje-ielts" },
          { name: "Përgatitje TOEFL", slug: "arsim-leaf-pergatitje-toefl" },
          { name: "Përgatitje Goethe", slug: "arsim-leaf-pergatitje-goethe" },
        ],
      },
    ],
  },
  {
    name: "Trajnime IT",
    slug: "arsim-type-trajnime-it",
    groups: [
      {
        name: "Zhvillim Softueri",
        slug: "arsim-grp-zhvillim-softueri",
        leaves: [
          { name: "Programim Python", slug: "arsim-leaf-programim-python" },
          { name: "Programim JS", slug: "arsim-leaf-programim-js" },
          { name: "Web Dev", slug: "arsim-leaf-web-dev" },
        ],
      },
      {
        name: "Dizajn & Media",
        slug: "arsim-grp-dizajn-media",
        leaves: [
          { name: "Dizajn Grafik", slug: "arsim-leaf-dizajn-grafik" },
          { name: "UI/UX", slug: "arsim-leaf-ui-ux" },
          { name: "Video Editim", slug: "arsim-leaf-video-editim" },
        ],
      },
    ],
  },
  {
    name: "Kurse Profesionale",
    slug: "arsim-type-kurse-prof",
    groups: [
      {
        name: "Biznes & Menaxhim",
        slug: "arsim-grp-biznes-menaxhim",
        leaves: [
          { name: "Kontabilitet", slug: "arsim-leaf-kontabilitet" },
          { name: "Marketing", slug: "arsim-leaf-marketing" },
          { name: "Shitje", slug: "arsim-leaf-shitje" },
        ],
      },
      {
        name: "Shkathtësi Praktike",
        slug: "arsim-grp-shkathtesi-praktike",
        leaves: [
          { name: "Menaxhim projektesh", slug: "arsim-leaf-menaxhim-projektesh" },
          { name: "Burime njerëzore", slug: "arsim-leaf-burime-njerezore" },
        ],
      },
    ],
  },
  {
    name: "Kurse Teknike",
    slug: "arsim-type-kurse-teknike",
    groups: [
      {
        name: "Autoshkollë",
        slug: "arsim-grp-autoshkolle",
        leaves: [
          { name: "Teori", slug: "arsim-leaf-autoshkolle-teori" },
          { name: "Praktikë", slug: "arsim-leaf-autoshkolle-praktike" },
          { name: "Kategori të ndryshme", slug: "arsim-leaf-autoshkolle-kategori" },
        ],
      },
      {
        name: "Zanate",
        slug: "arsim-grp-zanate",
        leaves: [
          { name: "Elektricist", slug: "arsim-leaf-zanate-elektricist" },
          { name: "Hidraulik", slug: "arsim-leaf-zanate-hidraulik" },
          { name: "Saldim", slug: "arsim-leaf-zanate-saldim" },
          { name: "Mekanik", slug: "arsim-leaf-zanate-mekanik" },
        ],
      },
    ],
  },
  {
    name: "Shëndet & Mirëqenie",
    slug: "arsim-type-shendet-mireqenie",
    groups: [
      {
        name: "Edukim Shëndetësor",
        slug: "arsim-grp-edukim-shendetesor",
        leaves: [
          { name: "Kurs Ndihma e Parë", slug: "arsim-leaf-ndihma-e-pare" },
          { name: "Nutricion", slug: "arsim-leaf-nutricion" },
        ],
      },
      {
        name: "Zhvillim Personal",
        slug: "arsim-grp-zhvillim-personal",
        leaves: [
          { name: "Psikologji", slug: "arsim-leaf-psikologji" },
          { name: "Coaching", slug: "arsim-leaf-coaching" },
          { name: "Joga", slug: "arsim-leaf-joga" },
          { name: "Meditim", slug: "arsim-leaf-meditim" },
        ],
      },
    ],
  },
  {
    name: "Arte & Kreativitet",
    slug: "arsim-type-arte-kreativitet",
    groups: [
      {
        name: "Edukim Artistik",
        slug: "arsim-grp-edukim-artistik",
        leaves: [
          { name: "Kurs Aktrimi", slug: "arsim-leaf-kurs-aktrimi" },
          { name: "Kurs Pikture", slug: "arsim-leaf-kurs-pikture" },
          { name: "Kurs Baleti", slug: "arsim-leaf-kurs-baleti" },
        ],
      },
      {
        name: "Muzikë Edukative",
        slug: "arsim-grp-muzike-edukative",
        leaves: [
          { name: "Teoria muzikore", slug: "arsim-leaf-teoria-muzikore" },
          { name: "Kanto", slug: "arsim-leaf-kanto" },
          { name: "Solfezh", slug: "arsim-leaf-solfezh" },
        ],
      },
    ],
  },
  {
    name: "Certifikata & Diploma",
    slug: "arsim-type-certifikata-diploma",
    groups: [
      {
        name: "Arestime Profesionale",
        slug: "arsim-grp-arestime-profesionale",
        leaves: [
          { name: "Certifikata IT", slug: "arsim-leaf-cert-it" },
          { name: "Certifikata Financiare", slug: "arsim-leaf-cert-financiare" },
        ],
      },
      {
        name: "Online Learning",
        slug: "arsim-grp-online-learning",
        leaves: [
          {
            name: "Kurse të certifikuara në distancë",
            slug: "arsim-leaf-kurse-cert-distanca",
          },
        ],
      },
    ],
  },
  {
    name: "Universitet & Bursa",
    slug: "arsim-type-universitet-bursa",
    groups: [
      {
        name: "Këshillim Akademik",
        slug: "arsim-grp-keshillim-akademik",
        leaves: [
          { name: "Ndihmë për aplikime", slug: "arsim-leaf-ndihme-aplikime" },
          { name: "Njohje diplomash", slug: "arsim-leaf-njohje-diplomash" },
        ],
      },
      {
        name: "Mbështetje Financiare",
        slug: "arsim-grp-mbeshtetje-financiare",
        leaves: [
          { name: "Bursa studimi", slug: "arsim-leaf-bursa-studimi" },
          { name: "Master & Doktoraturë", slug: "arsim-leaf-master-doktorature" },
        ],
      },
    ],
  },
];

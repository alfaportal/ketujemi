/** Muzikë & Hobby hub — level-1 types, level-2 groups, level-3 listing leaves. */

export type MuzikeHobbyGroupDef = {
  name: string;
  slug: string;
  leaves: { name: string; slug: string }[];
};

export type MuzikeHobbyTypeDef = {
  name: string;
  slug: string;
  groups: MuzikeHobbyGroupDef[];
};

export const MUZIKE_HOBBY_HUB_SLUG = "muzike-hobby";

export const MUZIKE_HOBBY_TAXONOMY: MuzikeHobbyTypeDef[] = [
  {
    name: "Instrumente Muzikore",
    slug: "muzike-type-instrumente-muzikore",
    groups: [
      {
        name: "Instrumente me Tela",
        slug: "muzike-grp-me-tela",
        leaves: [
          { name: "Kitara akustike/elektrike", slug: "muzike-leaf-kitara" },
          { name: "Violina", slug: "muzike-leaf-violina" },
          { name: "Fizarmonika", slug: "muzike-leaf-fizarmonika" },
        ],
      },
      {
        name: "Instrumente Frymore",
        slug: "muzike-grp-frymore",
        leaves: [
          { name: "Flauta", slug: "muzike-leaf-flauta" },
          { name: "Saksofon", slug: "muzike-leaf-saksofon" },
          { name: "Klarinetë", slug: "muzike-leaf-klarinete" },
          { name: "Trumbet", slug: "muzike-leaf-trumbet" },
        ],
      },
      {
        name: "Instrumente me Tastierë",
        slug: "muzike-grp-me-tastiere",
        leaves: [
          { name: "Piano", slug: "muzike-leaf-piano" },
          { name: "Sintisajzer", slug: "muzike-leaf-sintisajzer" },
          { name: "Organo", slug: "muzike-leaf-organo" },
        ],
      },
    ],
  },
  {
    name: "Pajisje Studio & Audio",
    slug: "muzike-type-studio-audio",
    groups: [
      {
        name: "Inçizim & Audio",
        slug: "muzike-grp-incizim-audio",
        leaves: [
          { name: "Mikrofona", slug: "muzike-leaf-mikrofona" },
          { name: "Miksera", slug: "muzike-leaf-miksera" },
          { name: "Kontrollues MIDI", slug: "muzike-leaf-kontrollues-midi" },
        ],
      },
      {
        name: "Sisteme Tingulli",
        slug: "muzike-grp-sisteme-tingulli",
        leaves: [
          { name: "Altoparlantë", slug: "muzike-leaf-altoparlante" },
          { name: "Kufje profesionale", slug: "muzike-leaf-kufje-prof" },
          { name: "Amplifikatorë", slug: "muzike-leaf-amplifikatore" },
        ],
      },
    ],
  },
  {
    name: "Art & Kreativitet",
    slug: "muzike-type-art-kreativitet",
    groups: [
      {
        name: "Pikturë & Vizatim",
        slug: "muzike-grp-piktura-vizatim",
        leaves: [
          { name: "Bojëra vaj/akrilik", slug: "muzike-leaf-bojera" },
          { name: "Kanavaca", slug: "muzike-leaf-kanavaca" },
          { name: "Brusha", slug: "muzike-leaf-brusha" },
        ],
      },
      {
        name: "Skulpturë & Punime dore",
        slug: "muzike-grp-skulpture-punime-dore",
        leaves: [
          { name: "Argjilë", slug: "muzike-leaf-argjile" },
          { name: "Vegla gdhendjeje", slug: "muzike-leaf-vegla-gdhendjeje" },
          { name: "Materiale modelimi", slug: "muzike-leaf-materiale-modelimi" },
        ],
      },
    ],
  },
  {
    name: "Fotografi & Video",
    slug: "muzike-type-foto-video",
    groups: [
      {
        name: "Kamerat & Lentet",
        slug: "muzike-grp-kamera-lente",
        leaves: [
          { name: "Aparate digjitale", slug: "muzike-leaf-aparate-digjitale" },
          { name: "Lente", slug: "muzike-leaf-lente" },
          { name: "Aksesorë", slug: "muzike-leaf-aksesore-foto" },
        ],
      },
      {
        name: "Ndriçim & Stabilitet",
        slug: "muzike-grp-ndricim-stabilitet",
        leaves: [
          { name: "Stativë", slug: "muzike-leaf-stative" },
          { name: "Softbox", slug: "muzike-leaf-softbox" },
          { name: "Mikrofon video", slug: "muzike-leaf-mikrofon-video" },
        ],
      },
    ],
  },
  {
    name: "Libra & Koleksione",
    slug: "muzike-type-libra-koleksione",
    groups: [
      {
        name: "Literaturë & Hobi",
        slug: "muzike-grp-literate-hobi",
        leaves: [
          { name: "Libra artistikë", slug: "muzike-leaf-libra-artistike" },
          { name: "Revista", slug: "muzike-leaf-revista" },
          {
            name: "Koleksione monedhash/pullash",
            slug: "muzike-leaf-koleksione-monedha",
          },
        ],
      },
      {
        name: "Materiale Kreative",
        slug: "muzike-grp-materiale-kreative",
        leaves: [
          { name: "Setet punimit të dorës", slug: "muzike-leaf-sete-pune-dore" },
          { name: "Puzzle", slug: "muzike-leaf-puzzle" },
          { name: "Modele maketesh", slug: "muzike-leaf-modele-maketesh" },
        ],
      },
    ],
  },
];

/** Albanian shop-directory subcategory labels → English. */
import { applyEnglishPhrases } from "./english-phrases.mjs";
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

/** Exact sq → en (shop taxonomy; longest keys win in partial pass). */
const EXACT = {
  "Telefona celularë": "Mobile phones",
  "Kompjuterë & PC Desktop": "Computers & desktop PCs",
  "Tabletë & iPad": "Tablets & iPad",
  "TV & Monitorë": "TVs & monitors",
  "Kamera & Foto": "Cameras & photography",
  "Kamera sigurie & CCTV": "Security cameras & CCTV",
  "Gaming & Konzol": "Gaming & consoles",
  "Smartwatch & Wearables": "Smartwatches & wearables",
  "Drone & Aksesorë": "Drones & accessories",
  "Printerë & Skaner": "Printers & scanners",
  "Komponentë PC": "PC components",
  "Hard disk & SSD & USB": "Hard drives, SSD & USB",
  "Router & Networking": "Routers & networking",
  "Aksesorë telefoni & laptop": "Phone & laptop accessories",
  "Bateri & Karikues": "Batteries & chargers",
  "Kufje & Altoparlantë": "Headphones & speakers",
  "Smart Home & Automatizim": "Smart home & automation",
  "Riparim elektronike & Telefona": "Electronics & phone repair",
  "Biçikleta & Trotineta elektrike": "Bicycles & electric scooters",
  "Autobusë & Minibusë": "Buses & minibuses",
  "Traktorë & Makineri bujqësore": "Tractors & farm machinery",
  "Ekskavatorë & Makineri ndërtimi": "Excavators & construction machinery",
  "Barka & Jete": "Boats & yachts",
  "Kamper & Karavan": "Campers & caravans",
  "Makina me qera": "Car rental",
  "Servisim & Riparime auto": "Car service & repairs",
  "Pjesë këmbimi & Aksesorë": "Spare parts & accessories",
  "Audio & Elektronikë makine": "Car audio & electronics",
  "Vajra & Kimikate auto": "Oils & car chemicals",
  "Toka & Parcela ndërtimore": "Building land & plots",
  "Toka bujqësore": "Agricultural land",
  "Lokale biznesi në shitje": "Commercial units for sale",
  "Lokale biznesi me qera": "Commercial units for rent",
  "Garazha & Parkingje": "Garages & parking",
  "Apartamente turistike": "Holiday apartments",
  "Ndërtesa industriale & Fabrika": "Industrial buildings & factories",
  "Investime & Projekte": "Investments & projects",
  "Shtëpi & Vila në shitje": "Houses & villas for sale",
  "Shtëpi & Vila me qera": "Houses & villas for rent",
};

const PARTIAL = [
  ["Telefona celularë", "Mobile phones"],
  ["Aksesorë telefoni & laptop", "Phone & laptop accessories"],
  ["Riparim elektronike & Telefona", "Electronics & phone repair"],
  ["Smart Home & Automatizim", "Smart home & automation"],
  ["Kufje & Altoparlantë", "Headphones & speakers"],
  ["Hard disk & SSD & USB", "Hard drives, SSD & USB"],
  ["Komponentë PC", "PC components"],
  ["Printerë & Skaner", "Printers & scanners"],
  ["Kamera sigurie & CCTV", "Security cameras & CCTV"],
  ["Kamera & Foto", "Cameras & photography"],
  ["TV & Monitorë", "TVs & monitors"],
  ["Tabletë & iPad", "Tablets & iPad"],
  ["Kompjuterë & PC Desktop", "Computers & desktop PCs"],
  ["Gaming & Konzol", "Gaming & consoles"],
  ["Drone & Aksesorë", "Drones & accessories"],
  ["Bateri & Karikues", "Batteries & chargers"],
  ["Aksesorë", "Accessories"],
  ["Kompjuterë", "Computers"],
  ["Telefona", "Phones"],
  ["celularë", "mobile phones"],
  ["Monitorë", "monitors"],
  ["Printerë", "printers"],
  ["Skaner", "scanners"],
  ["Komponentë", "components"],
  ["sigurie", "security"],
  ["elektronike", "electronics"],
  ["Karikues", "chargers"],
  ["Bateri", "Batteries"],
  ["Kufje", "Headphones"],
  ["Altoparlantë", "speakers"],
  ["Automatizim", "automation"],
  ["Riparim", "Repair"],
  ["Tabletë", "Tablets"],
  ["Konzol", "consoles"],
  ["Kamera", "Cameras"],
  ["Foto", "photography"],
  ["Networking", "networking"],
  ["Router", "Routers"],
  ["Makineri", "machinery"],
  ["ndërtimi", "construction"],
  ["bujqësore", "agricultural"],
  ["Patundshmëri", "Real estate"],
  ["Elektronikë & Teknologji", "Electronics & technology"],
  ["Makina & Transport", "Vehicles & transport"],
  ["me qera", "for rent"],
  ["në shitje", "for sale"],
  ["&", "&"],
];

export function shopSubcategoryToEnglish(nameSq) {
  if (EXACT[nameSq]) return EXACT[nameSq];
  const fromCat = categoryEnglishFromKs(nameSq);
  if (!ALBANIAN_CHARS.test(fromCat)) return fromCat;

  let s = applyEnglishPhrases(nameSq);
  if (!ALBANIAN_CHARS.test(s)) return s;

  const sorted = [...PARTIAL].sort((a, b) => b[0].length - a[0].length);
  for (const [sq, en] of sorted) {
    if (s.includes(sq)) s = s.split(sq).join(en);
  }
  return s;
}

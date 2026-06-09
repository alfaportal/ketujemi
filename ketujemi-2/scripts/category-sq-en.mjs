/** Albanian category labels → English (Fëmijë leaves and other gaps). */
import { applyEnglishPhrases } from "./english-phrases.mjs";
import { categoryEnglishFromKs } from "./category-en-from-ks.mjs";
import { CATEGORY_SQ_EN_EXTRA } from "./category-sq-en-extra.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

const SQ_EN_WORDS = [
  ...CATEGORY_SQ_EN_EXTRA,
  ["Aksesorë (kapele, doreza, shall, çanta shkolle)", "Accessories (hats, gloves, scarf, school bag)"],
  ["Aksesorë karroce (çadra, mbulesë shiu, çanta)", "Stroller accessories (umbrella, rain cover, bag)"],
  ["Aktivitet & Sport Fëmijësh", "Children's Activity & Sport"],
  ["Aspirator hundësh & Kujdes i përditshëm", "Nasal aspirator & daily care"],
  ["Arsim Parashkollor", "Preschool education"],
  ["Arte & Kreativitet", "Arts & creativity"],
  ["Arestime Profesionale", "Professional training"],
  ["Biçikleta fëmijësh", "Children's bicycles"],
  ["Biznes & Menaxhim", "Business & management"],
  ["Bllokues sirtarësh & dollapësh", "Drawer & cabinet locks"],
  ["Blloqe ndërtimi & Lego", "Building blocks & Lego"],
  ["Bojatisje & Dekorim", "Painting & decor"],
  ["Breza shtatzënësie", "Maternity belts"],
  ["Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)", "Mattresses & textiles (mattresses, sheets, pillows, blankets)"],
  ["Fustane shtatzënësie", "Maternity dresses"],
  ["Gjuhë të Huaja", "Foreign languages"],
  ["Higjienë & Kujdes", "Hygiene & care"],
  ["Jastëkë anatomikë për gjumë", "Anatomic sleep pillows"],
  ["Jelekë noti fëmijësh", "Children's swim vests"],
  ["Jelekë shpëtimi fëmijësh", "Children's life jackets"],
  ["Karrige ushqimi (high chair, portative, të palosshme)", "High chairs (portable, foldable)"],
  ["Karrige ushqimi të larta", "High chairs"],
  ["Karroca çadër", "Umbrella strollers"],
  ["Kaskë & Mbrojtëse biçiklete", "Helmets & bike protectors"],
  ["Kategori të ndryshme", "Miscellaneous categories"],
  ["Këpucë fëmijësh (sportive, çizme, sandale)", "Children's shoes (sports, boots, sandals)"],
  ["Këpucë foshnjeje (hapat e parë)", "Baby first-step shoes"],
  ["Këshillim Akademik", "Academic counselling"],
  ["Kremra mbrojtës fëmijësh", "Children's sunscreen"],
  ["Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)", "Beds & cribs (wooden bed, rocking crib, travel crib)"],
  ["Kurse të certifikuara në distancë", "Certified distance courses"],
  ["Leckë & Topth pelene", "Changing pads & diaper balls"],
  ["Lëkundshe & Lojëra kopshti", "Swings & garden play"],
  ["Lëvizje furniture & Transport", "Furniture moving & transport"],
  ["Libra edukativë (7-14 vjeç)", "Educational books (7–14 years)"],
  ["Libra me figura & Përralla (0-6 vjeç)", "Picture books & fairy tales (0–6 years)"],
  ["Lodra banje & pishinë", "Bath & pool toys"],
  ["Ndërtim & Muraturë", "Construction & masonry"],
  ["Gipsi & Suvatime", "Plaster & finishing"],
  ["Pllakosje & Mozaik", "Tiling & mosaic"],
  ["Riparim çatie & Izolim", "Roof repair & insulation"],
  ["Riparim dyshemeje & Parket", "Floor repair & parquet"],
  ["Riparim dritaresh & dyerve", "Window & door repair"],
  ["Instalime ngrohje & Klima", "Heating & A/C installation"],
  ["fëmijësh", "children's"],
  ["Fëmijësh", "Children's"],
  ["foshnjeje", "baby"],
  ["foshnje", "baby"],
  ["shtatzënësie", "maternity"],
  ["çanta shkolle", "school bag"],
  ["çanta", "bag"],
  ["çadra", "umbrella"],
  ["çadër", "umbrella"],
  ["mbulesë", "cover"],
  ["hundësh", "nasal"],
  ["përditshëm", "daily"],
  ["ndërtimi", "building"],
  ["Aksesorë", "Accessories"],
  ["Këpucë", "Shoes"],
  ["Biçikleta", "Bicycles"],
  ["Karroca", "Strollers"],
  ["Krevatë", "Beds"],
  ["Djepa", "Cribs"],
  ["lëkundës", "rocking"],
  ["udhëtimi", "travel"],
  ["Tekstile", "Textiles"],
  ["Dyshekë", "Mattresses"],
  ["çarçafë", "sheets"],
  ["jastëkë", "pillows"],
  ["batanije", "blankets"],
  ["Pelenë", "Diapers"],
  ["Lojëra", "Games"],
  ["Lodra", "Toys"],
  ["Higjienë", "Hygiene"],
  ["Kujdes", "Care"],
  ["Ushqim", "Food"],
  ["Enë", "Dishes"],
  ["Lugë", "Spoons"],
  ["banje", "bath"],
  ["pishinë", "pool"],
  ["noti", "swim"],
  ["Shpatulla", "Scooters"],
  ["Patina", "Skates"],
  ["Trampolinë", "Trampoline"],
  ["Rrëshqitëse", "Slides"],
  ["Lëkundshe", "Swings"],
  ["kopshti", "garden"],
  ["Kostume", "Costumes"],
  ["Parashkollor", "Preschool"],
  ["Kreativitet", "Creativity"],
  ["Profesionale", "Professional"],
  ["ndryshme", "miscellaneous"],
  ["shkolle", "school"],
  ["pelene", "diaper"],
  ["palosshme", "foldable"],
  ["ushqimi", "feeding"],
  ["binjakë", "twins"],
  ["Mbrojtëse", "Protectors"],
  ["Kaskë", "Helmet"],
  ["Muzikë Edukative", "Educational music"],
  ["Rroba & Këpucë Fëmijësh", "Children's clothing & shoes"],
  ["Rroba foshnjeje (0-12 muaj)", "Baby clothing (0-12 months)"],
  ["Rroba vegjëlish (1-5 vjeç)", "Toddler clothing (1-5 years)"],
  ["Rroba shkollore (6-14 vjeç)", "School clothing (6-14 years)"],
  ["Mobilje (dollap, komodë pelene, rafte lodra)", "Furniture (wardrobes, changing tables, toy shelves)"],
  ["Çerdhe & Kopshte", "Nurseries & kindergartens"],
  ["Çanta & Aksesorë Nënë", "Bags & maternity accessories"],
];

export function categorySqToEnglish(sq) {
  const exact = SQ_EN_WORDS.find(([k]) => k === sq);
  if (exact) return exact[1];

  const fromKs = categoryEnglishFromKs(sq);
  if (fromKs !== sq && !ALBANIAN_CHARS.test(fromKs)) return fromKs;

  let s = applyEnglishPhrases(sq);
  if (!ALBANIAN_CHARS.test(s) && s !== sq) return s;

  const sorted = [...SQ_EN_WORDS].sort((a, b) => b[0].length - a[0].length);
  for (const [token, en] of sorted) {
    if (s.includes(token)) s = s.split(token).join(en);
  }
  return s;
}

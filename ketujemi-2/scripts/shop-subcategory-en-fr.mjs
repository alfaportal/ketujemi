/** English shop-directory subcategory labels → French. */
import { applyFrenchPhrases } from "./french-phrases.mjs";
import { categoryToFrench } from "./category-en-fr.mjs";
import { shopSubcategoryToEnglish } from "./shop-subcategory-sq-en.mjs";
import { SHOP_PHRASES_EN } from "./shop-phrases-en.mjs";

const EXACT = {
  "Mobile phones": "Téléphones mobiles",
  "Laptops": "Ordinateurs portables",
  "Computers & desktop PCs": "Ordinateurs & PC de bureau",
  "Tablets & iPad": "Tablettes & iPad",
  "TVs & monitors": "Téléviseurs & moniteurs",
  "Cameras & photography": "Appareils photo & photographie",
  "Security cameras & CCTV": "Caméras de sécurité & CCTV",
  "Gaming & consoles": "Gaming & consoles",
  "Smartwatches & wearables": "Montres connectées & objets connectés",
  "Drones & accessories": "Drones & accessoires",
  "Printers & scanners": "Imprimantes & scanners",
  "PC components": "Composants PC",
  "Hard drives, SSD & USB": "Disques durs, SSD & USB",
  "Routers & networking": "Routeurs & réseau",
  "Phone & laptop accessories": "Accessoires téléphone & ordinateur portable",
  "Batteries & chargers": "Piles & chargeurs",
  "Headphones & speakers": "Casques & haut-parleurs",
  "Smart home & automation": "Maison connectée & automatisation",
  "Electronics & phone repair": "Réparation électronique & téléphones",
  "Cars": "Voitures",
  "Trucks & Vans": "Camions & fourgons",
  "Motorcycles & Scooters": "Motos & scooters",
  "Bicycles & electric scooters": "Vélos & trottinettes électriques",
  "Buses & minibuses": "Bus & minibus",
  "Tractors & farm machinery": "Tracteurs & machines agricoles",
  "Excavators & construction machinery": "Pelleteuses & engins de chantier",
  "Boats & yachts": "Bateaux & yachts",
  "Campers & caravans": "Camping-cars & caravanes",
  "Trailers": "Remorques",
  "Car rental": "Location de voitures",
  "Car service & repairs": "Entretien & réparation auto",
  "Spare parts & accessories": "Pièces de rechange & accessoires",
  "Tyres & Wheels": "Pneus & jantes",
  "Body & Glass": "Carrosserie & vitres",
  "Car audio & electronics": "Audio & électronique auto",
  "Oils & car chemicals": "Huiles & produits chimiques auto",
  "Apartments for Sale": "Appartements à vendre",
  "Apartments for Rent": "Appartements à louer",
  "Houses & villas for sale": "Maisons & villas à vendre",
  "Houses & villas for rent": "Maisons & villas à louer",
  "Building land & plots": "Terrains à bâtir & parcelles",
  "Agricultural land": "Terrains agricoles",
  "Commercial units for sale": "Locaux commerciaux à vendre",
  "Commercial units for rent": "Locaux commerciaux à louer",
  "Garages & parking": "Garages & parkings",
  "Rooms for Rent": "Chambres à louer",
  "Holiday apartments": "Appartements de vacances",
  "Warehouses & Storage": "Entrepôts & stockage",
  "Industrial buildings & factories": "Bâtiments industriels & usines",
  "Investments & projects": "Investissements & projets",
  "Real estate": "Immobilier",
  "Electronics & technology": "Électronique & technologie",
  "Vehicles & transport": "Véhicules & transport",
  "Home & furniture": "Maison & mobilier",
  "Living room furniture": "Meubles salon & séjour",
  "Bedroom furniture": "Meubles chambre",
  "Kitchen furniture": "Meubles cuisine",
  "Bathroom furniture": "Meubles salle de bain",
  "Office furniture": "Meubles bureau",
  "Balcony & garden furniture": "Meubles balcon & jardin",
  "Fashion & clothing": "Mode & vêtements",
  "Construction & installations": "Construction & installations",
  "Business & professional services": "Entreprise & services professionnels",
  "Children & maternity": "Enfants & maternité",
  "Sport & recreation": "Sport & loisirs",
  "Agriculture & livestock": "Agriculture & élevage",
  "Pets": "Animaux",
  "Education & courses": "Éducation & cours",
  "Events & weddings": "Événements & mariages",
  "Tourism & travel": "Tourisme & voyages",
  "Health & beauty": "Santé & beauté",
  "Women's clothing": "Vêtements femme",
  "Men's clothing": "Vêtements homme",
  "Beds & mattresses": "Lits & matelas",
  "Tables & chairs": "Tables & chaises",
  "Wardrobes & safes": "Armoires & coffres-forts",
  "Insurance": "Assurance",
  "Cattle": "Bétail",
  "Trailers": "Remorques",
  "Pets": "Animaux",
  "Construction & masonry": "Construction & maçonnerie",
};

let phraseFrCache;
function phraseFrFromEnTable() {
  if (!phraseFrCache) {
    phraseFrCache = { ...EXACT };
    for (const [, enLabel] of SHOP_PHRASES_EN) {
      if (!phraseFrCache[enLabel]) {
        const fr = categoryToFrench(enLabel);
        phraseFrCache[enLabel] = fr !== enLabel ? fr : applyFrenchPhrases(enLabel);
      }
    }
  }
  return phraseFrCache;
}

function titleCaseEn(en) {
  return en.replace(/(^|[\s&(/])([a-z])/g, (_, pre, c) => pre + c.toUpperCase());
}

export function shopSubcategoryToFrench(en) {
  if (!en) return en;
  const table = phraseFrFromEnTable();
  if (table[en]) return table[en];
  let fr = categoryToFrench(en);
  if (fr !== en) return fr;
  fr = applyFrenchPhrases(en);
  if (fr !== en) return fr;
  fr = categoryToFrench(titleCaseEn(en));
  if (fr !== en) return fr;
  return applyFrenchPhrases(titleCaseEn(en));
}

/** sq → fr in one step (for validation). */
export function shopSubcategoryFrenchFromSq(sq) {
  return shopSubcategoryToFrench(shopSubcategoryToEnglish(sq));
}

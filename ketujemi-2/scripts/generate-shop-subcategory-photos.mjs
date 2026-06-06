/**
 * Generates shop-directory-subcategory-photos-data.mjs with globally unique Unsplash IDs.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { SHOP_DIRECTORY_CATEGORIES } from "../lib/shop-directory-taxonomy.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function scrapeUnsplashIds(filePath) {
  try {
    const src = readFileSync(filePath, "utf8");
    return [...src.matchAll(/photo-([0-9]+-[a-f0-9]+)/g)].map((m) => m[1]);
  } catch {
    return [];
  }
}

function walkTsFiles(dir, acc = []) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") walkTsFiles(p, acc);
    else if (/\.(ts|mjs|sql)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

/** Preferred photo per category (order = taxonomy subcategory order). */
const PREFERRED = {
  "makina-transport": [
    "1494976388531-d1058494cdd8",
    "1601584115197-04ecc0da31d7",
    "1558618666-fcd25c85cd64",
    "1571068316344-75f76f962e35",
    "1544620347-c4fd4a3d5957",
    "1626441963168-ae4d6d982c02",
    "1504307651254-35680f356dfd",
    "1544551763-46a013bb70d5",
    "1527786350793-963663ca4f10",
    "1580674285054-bed31e145f59",
    "1632276536839-84cad7fd27b8",
    "1486750540567-3945490ae6be",
    "1486262715619-67b85e0b08d3",
    "1625047509757-03e2a49c8a8f",
    "1489824904134-891ab64532f1",
    "1503376780353-7e6692767b70",
    "1558618047-3c8c76ca7d13",
  ],
  patundshmeri: [
    "1560448204-e02f11c3d0e2",
    "1522708323590-d24dbb6b0267",
    "1568605114967-8130f3a36994",
    "1600585154340-be6161a56a0c",
    "1500382017468-9049fed747ef",
    "1574949419584-14c8424c1c65",
    "1497366216548-37526070297c",
    "1449158743715-0a90ebb6d2d8",
    "1600596542815-ffad4c1539a9",
    "1560185127-9782a13573a3",
    "1502672260266-1c1ef2d93688",
    "158240794730-f1c5b7b3b07c",
    "1600047509807-ba139f63cdbe",
    "1484154218962-a197022b5858",
  ],
  "elektronike-teknologji": [
    "1511707171634-5f897ff02aa9",
    "1496181133206-80ce9b88a853",
    "1593642632559-0c6d3fc62b89",
    "1527443170655-75c95f0ae2de",
    "1593344484962-796055d4a3a4",
    "1606983340126-99e4eada4d24",
    "1557595622-4ae4b6b4cab8",
    "1542751371-adc38448a05e",
    "1523275335684-37898b6baf30",
    "1473968512647-3e44729ef90b",
    "1618384593631-67c99d5673c7",
    "1556656793-08538906a9f8",
    "1597872200303-85b0ef88eae4",
    "1558618449-1a3d59141e3d",
    "1588508062122-357fdb6e26a2",
    "1609091839317-df5e7080ff1c",
    "1484704849700-f032a568e944",
    "1558003960-0d39d1419dbe",
    "1580891968-6d82dea01596",
  ],
  "shtepi-mobilje": [
    "1555041469-a586c61ea9bc",
    "1616486338442-a66f9cb5b7ed",
    "1556911220-bff31c812dba",
    "1620626011761-ab63d8ec0a64",
    "1497217037954-86ecec17ec9d",
    "1416879595882-3373a048128b",
    "1505693416388-a5aaf114832f",
    "1586023492125-27b2c045efd7",
    "1594623279211-a6d853de0f65",
    "1556909114-f6e7ad7d4046",
    "1626806780472-f2547a5f1d54",
    "1556911220-e15b29be8c8f",
    "1556919124-feaf7f3c36bf",
    "1616628188855-a790c6503301",
    "1628177100476-2756304bdaa8",
    "1558618806-586d7de06284",
    "1631545461158-1f38d7d1a423",
    "1560185007-c5c9da44d742",
    "1513506003901-1e6a229e2d15",
    "1618221194940-dd9c70db6a55",
    "1618220177924-9f6cdaec0442",
    "1485952594663-729159e12b09",
    "1552321847-280864e9e303",
    "1581858722598-fac7e3027fb2",
    "1600607687644-c7171b42498b",
    "1558904541-efa6643f5d76",
    "1503387762-592deb58ef03",
    "1541888946425-d81bb19240f5",
    "1562259949-e8e7689d29e2",
    "1607472586897-edc4b5d5472d",
    "1621905251189-08b45d6a269e",
    "1563013544-17791cddd81d",
    "1504141414692-127932358263",
    "1542744173-8e7e53410bb0",
  ],
  "moda-veshje": [
    "1483988413-2e1cf253dec5",
    "1617124566555-7b247c6f79da",
    "1515488042361-ee00e0ddd4e4",
    "1542272604-787c3835535d",
    "1523381210434-271e8be1f52b",
    "1490481651871-ab68de25d43d",
    "1515886656811-29b80fed6d4c",
    "1594938298607-b76192b8f242",
    "1571019613454-1cb2f99b2d8b",
    "1530549386479-4c43a6a170c8",
    "1594737625785-a6cbd23ad9b1",
    "1507679799987-c73779587ccf",
    "1558175088-244fc357b9eb",
    "1549298916-b41d501d3772",
    "1606100116673-8823eb8a8278",
    "1514989940724-e395fe828283",
    "1603480822460-71bc771a94ea",
    "1542291026-7eec264c27ff",
    "1603480822409-b68a71bc0a0c",
    "1553062407-98aebc8fa35b",
    "1622567501612-dac240e5b667",
    "1627123427291-7a0509ce1f92",
    "1515562141207-7a88fb7ce338",
    "1617034560-e5ac6ba27c61",
    "1523170186493-ded233ff9961",
    "1574258496793-c43cbe945512",
    "1596462502278-27bfdc403348",
    "1522335780783-8b455b261346",
    "1570172619644-dfd355bd8e36",
    "1522337360788-8a13dedfc01b",
    "1556228578-0d85b1a4d571",
  ],
  "ndertim-instalime": [
    "1625047509327-4a8bfa42c91a",
    "1600607687939-ce8a6c25118c",
    "1600565892912-984d9ac02364",
    "1550584934-6128137f52d1",
    "1632777457136-1f1d06bdf936",
    "1600210492486-724fe644c65d",
    "1600585154527-4ce105b2181f",
    "1588702547923-7408785057f9",
    "1581578731544-c64695cc6952",
    "1621905252505-baf94adcbf2d",
    "1558499982-641fb8608d23",
    "1509391366366-2e5edcb4027b",
    "1600517186671-a0e223ec9c28",
    "1585421512118-7721b5742822",
    "1581092160607-ee2264d4d5b0",
    "1581092921461-59a4aec0460b",
    "1556912172-0b7ccc7ef046",
  ],
  "biznes-sherbime": [
    "15217911361-5c4d48d0e048",
    "1556761175-53184e75f515",
    "1454165804606-c3d57bc86b40",
    "1436491865332-7a61a109cc05",
    "1516035069371-29a1b244cc32",
    "1561070791-2526d30994b5",
    "1498050108023-c5249f4df085",
    "1460925895917-afdab827c52f",
    "1456513080510-578bf0a005cf",
    "1554224155-6726b3ff858f",
    "1589824484159-80b017105b93",
    "1450101499163-c8848c66ca85",
    "1551836022-d0d0a290ae38",
    "1556761175-b413da4baf72",
    "1586528118411-06255f5f4b45",
    "1556760542-5c39c7d0a0bf",
    "1555244563-d334406e52b2",
    "1516625940017-103a1133aab0",
    "1519167758041-275076e8102c",
    "1551836022-8b85e529b1d5",
  ],
  "femije-nena": [
    "1503454537927-cefaa6d2367b",
    "1519689683458-324cb7d33427",
    "1555252337-a07d8d522c65",
    "1586281380349-6365317f9f0b",
    "1587654780251-9937a5bb96a8",
    "1519569140871-c5b4c73d0f28",
    "1524993573797-cbdc75e1a4d0",
    "1511518770662-a62828e1286d",
    "1576437523793-885afbbd65d3",
    "1461896836934-ffe607ba8211",
    "1519689680058-324335c77eba",
    "1503676260728-1c00da094a0b",
    "1523050854058-775153a7a251",
    "1427504496585-4f398a0631c3",
    "1555507036-ab1f62988dae",
    "1566576912321-d58ddd7a6088",
    "1583337130410-33420a7be9dd",
    "1517849849331-872be2d9a574",
    "1601758228044-3c9d0bc6aaff",
    "1530282931401-77a1dddfe3eb",
    "1548199973-03cce0bbc87b",
    "1450778869180-41d0601e046e",
  ],
  "sport-rekreacion": [
    "1574629810360-95c798dfdee8",
    "1546519638-68fd0c8d14c2",
    "1554068865-9687ef477b97",
    "1534438327276-14e5300c3a48",
    "1519569140871-c5b4c73d0f28",
    "1461896836934-ffe607ba8211",
    "1507525428034-b723cf961d3e",
    "1551524559-6a6e48c0d2fa",
    "1507003211169-0a1dd7228f2d",
    "1518684079-3c45a3ba522b",
    "1478137628760-f04e218fe443",
    "1522163182402-1f9f02b7b44b",
    "1549719386-74dfdf7173aa",
    "1544367567-0f2fcb009e0b",
    "1511379938547-c1f69419868d",
    "1598485901064-986de9f01c2c",
    "1514326463920-88a273560e7c",
    "1514525253161-7a46d19cd819",
    "1452582374474-cea5956dd380",
  ],
  "bujqesi-blegtori": [
    "1625246336185-f794d4abb4d6",
    "1553284965-ba28e7c40465",
    "1548559983-bc19c7b8e1f1",
    "1587049637826-dacb963746de",
    "1593941707882-a5bba14938c7",
    "1549317661-bd32c8ce0db2",
    "1500937386664-56d1dfef3854",
    "1416331108676-22c6f09a9ae1",
    "1464226184884-c28d2d50d8ed",
    "1500595040803-2d1400ec7ced",
    "1574269805544-966d213b7895",
    "1540420773420-3366772e4999",
    "1550584934-6128137f52d1",
    "1441974231531-c6227db76b6e",
    "1517836357463-d25dfeac3438",
    "1571907480498-384d1d38b1b3",
    "1600047509807-ba139f63cdbe",
    "1500382017468-9049fed747ef",
    "1556911220-bff31c812dba",
  ],
  "kafshe-shtepiake": [
    "1587300003388-59208cc962cb",
    "1517849849331-872be2d9a574",
    "1548199973-03cce0bbc87b",
    "1530282931401-77a1dddfe3eb",
    "1583337130410-33420a7be9dd",
    "1450778869180-41d0601e046e",
    "1601758228044-3c9d0bc6aaff",
    "1629907917504-241e4fe2b72a",
    "1576201832416-88f48b79e0e3",
    "1606214174585-fe3159dc5ef3",
    "1556228720-195f672d8db2",
    "1490645936778-3a7d71fd264f",
    "1560066984-1388b17f7a18",
    "1586105251261-72a756497a11",
    "1555252333-9f8e92e65df9",
  ],
  "arsim-kurse": [
    "1509062526546-5313798963db",
    "1523050854058-775153a7a251",
    "1427504496585-4f398a0631c3",
    "1524170972511-2a720ddea8fc",
    "1558655146-d093436bfbaf",
    "1557804506-669a77965bf8",
    "1554224154-6726b3ff858f",
    "1498050108023-c5249f4df085",
    "1561070791-2526d30994b5",
    "1460925895917-afdab827c52f",
    "1554224155-6726b3ff858f",
    "1492144534655-ae79c964c9d7",
    "1588702547923-7408785057f9",
    "1555507036-ab1f62988dae",
    "1522335780783-8b455b261346",
    "1492691527719-9d1e07f681c6",
    "1522771930-78848d9293e8",
    "1481627834876-b7833e8f5570",
    "1503676260728-1c00da094a0b",
    "1524993573797-cbdc75e1a4d0",
    "1556760542-5c39c7d0a0bf",
  ],
  "evente-dasma": [
    "1519741497674-611481863552",
    "1465492487044-7e81f83e8632",
    "1606214174585-fe3159dc5ef3",
    "1492691527719-9d1e07f681c6",
    "1555244563-d334406e52b2",
    "1556911220-e15b29be8c8f",
    "1519225429260-4c8917b422b8",
    "1469334031218-e382a71abb87",
    "1594938298607-b76192b8f242",
    "1507679799987-c73779587ccf",
    "1558175088-244fc357b9eb",
    "1514326463920-88a273560e7c",
    "1598485901064-986de9f01c2c",
    "1516625940017-103a1133aab0",
    "1492144534655-ae79c964c9d7",
    "1566073771259-6a8506099945",
    "1511285560929-80b456fea0bc",
  ],
  "turizem-udhetimet": [
    "1571892179887-ef9e14afcb3c",
    "1600585154340-be6161a56a0c",
    "1566073771259-6a8506099945",
    "1527786350793-963663ca4f10",
    "1436491865332-7a61a109cc05",
    "1488646953014-85cb44e25828",
    "144996540886-07a70a71653f0",
    "1469859673801-9fd1fe736bf0",
    "1506905925346-21bda4d32df4",
    "1540555700478-4be289fbecef",
    "1476514525535-07fb3d4edfcc",
    "1507525428034-b723cf961d3e",
  ],
  "shendetesi-bukuri": [
    "1576091160399-112ba8d25d1f",
    "1573497016542-58826082944e",
    "1556228720-195f672d8db2",
    "1490645936778-3a7d71fd264f",
    "1560343093-f033e42e2644",
    "1560066984-1388b17f7a18",
    "1522337360788-8a13dedfc01b",
    "1544161514-4ab6f6bb836b",
    "1574258496793-c43cbe945512",
    "1606811971618-448f6f593f37",
    "1571019613454-1cb2f99b2d8b",
    "1516975080664-ed672fc8c278",
    "1498837167922-ddd3144930d0",
    "1515488042361-ee00e0ddd4e4",
  ],
};

// Build fallback pool from codebase + preferred values
const scraped = [];
for (const f of walkTsFiles(join(root, "lib"))) scraped.push(...scrapeUnsplashIds(f));
for (const f of walkTsFiles(join(root, "artifacts/vendi/src/lib"))) scraped.push(...scrapeUnsplashIds(f));
scraped.push(...scrapeUnsplashIds(join(__dirname, "_old-build.mjs")));

const preferredFlat = Object.values(PREFERRED).flat();
const FALLBACK_POOL = [...new Set([...scraped, ...preferredFlat])];

const used = new Set();
let fallbackIdx = 0;

function takeUnique(preferred) {
  if (preferred && !used.has(preferred)) {
    used.add(preferred);
    return preferred;
  }
  while (fallbackIdx < FALLBACK_POOL.length) {
    const id = FALLBACK_POOL[fallbackIdx++];
    if (!used.has(id)) {
      used.add(id);
      return id;
    }
  }
  throw new Error(
    `Ran out of unique Unsplash IDs (need ${291}, pool has ${FALLBACK_POOL.length} unique)`,
  );
}

const flat = {};
for (const cat of SHOP_DIRECTORY_CATEGORIES) {
  const pool = PREFERRED[cat.slug];
  if (!pool) {
    console.error("Missing preferred pool for", cat.slug);
    process.exit(1);
  }
  if (pool.length !== cat.subcategories.length) {
    console.error(
      `Pool size mismatch ${cat.slug}: expected ${cat.subcategories.length}, got ${pool.length}`,
    );
    process.exit(1);
  }
  cat.subcategories.forEach((sub, i) => {
    flat[`${cat.slug}/${sub.slug}`] = takeUnique(pool[i]);
  });
}

const out = `/** Auto-generated — scripts/generate-shop-subcategory-photos.mjs */
export const SUBCATEGORY_UNSPLASH_IDS = ${JSON.stringify(flat, null, 2)};
`;

writeFileSync(join(__dirname, "shop-directory-subcategory-photos-data.mjs"), out, "utf8");
console.log(
  "Wrote",
  Object.keys(flat).length,
  "unique subcategory photos (fallback pool:",
  FALLBACK_POOL.length,
  ")",
);

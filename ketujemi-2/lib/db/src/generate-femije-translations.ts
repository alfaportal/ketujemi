import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FEMIJE_EXTENDED_GROUPS } from "./femije-subcategories-catalog.js";

/** Macedonian (mk) and Montenegrin (mne) labels keyed by category slug. */
const BY_SLUG: Record<string, { mk: string; mne: string }> = {
  "femije-grp-karroca-transport": {
    mk: "Колички & Транспорт",
    mne: "Kolica & Transport",
  },
  "femije-grp-krevat-dhome": {
    mk: "Кревет & Детска соба",
    mne: "Krevet & Dječija soba",
  },
  "femije-grp-ushqyerja-ushqimi": {
    mk: "Исхрана & Храна",
    mne: "Ishrana & Hrana",
  },
  "femije-grp-higjiene-kujdes": {
    mk: "Хигиена & Нега",
    mne: "Higijena & Njega",
  },
  "femije-grp-rroba-kepuce": {
    mk: "Облека & Обувки за деца",
    mne: "Odjeća & Cipele za djecu",
  },
  "femije-grp-lodra-lojera": {
    mk: "Играчки & Игри",
    mne: "Igračke & Igre",
  },
  "femije-grp-lodra-edukative": {
    mk: "Едукативни играчки",
    mne: "Edukativne igračke",
  },
  "femije-grp-libra-shkollore": {
    mk: "Книги & Школски материјали",
    mne: "Knjige & Školski materijali",
  },
  "femije-grp-aktivitet-sport": {
    mk: "Активности & Спорт за деца",
    mne: "Aktivnosti & Sport za djecu",
  },
  "femije-grp-karrige-ulese": {
    mk: "Столчиња & Седишта за бебе",
    mne: "Stolice & Sjedišta za bebe",
  },
  "femije-grp-canta-nene": {
    mk: "Торби & Аксесоари за мајки",
    mne: "Torbe & Akcesori za majke",
  },
  "femije-grp-veshje-shtatzanise": {
    mk: "Облека за бременост",
    mne: "Odjeća za trudnice",
  },
  "femije-grp-siguria": {
    mk: "Безбедност на децата",
    mne: "Sigurnost djece",
  },
  "femije-grp-pishine-plazh": {
    mk: "Базен & Плажа за деца",
    mne: "Bazen & Plaža za djecu",
  },
  "femije-leaf-karroca-klasike": { mk: "Класична количка", mne: "Klasična kolica" },
  "femije-leaf-karroca-cader": { mk: "Количка чадор", mne: "Kolica suncobran" },
  "femije-leaf-karroca-binjake": { mk: "Количка за близнаци", mne: "Kolica za blizance" },
  "femije-leaf-sisteme-udhetimi": {
    mk: "Системи за патување (количка + автоседиште)",
    mne: "Sistemi za putovanje (kolica + autosjediste)",
  },
  "femije-leaf-karrige-makine-grupe": {
    mk: "Автоседишта (група 0+, 1, 2/3)",
    mne: "Autosjedista (grupa 0+, 1, 2/3)",
  },
  "femije-leaf-mbajtese-bebe": {
    mk: "Носилки за бебе (kangaroo, wrap, sling)",
    mne: "Nosiljke za bebe (kangaroo, wrap, sling)",
  },
  "femije-leaf-aksesore-karroce": {
    mk: "Аксесоари за количка (чадор, дождевник, торба)",
    mne: "Akcesori za kolica (suncobran, kišobran, torba)",
  },
  "femije-leaf-krevate-djepa": {
    mk: "Кревети & Лулки (дрво, лула, патнички)",
    mne: "Kreveti & Kolijevke (drvo, ljuljaška, putni)",
  },
  "femije-leaf-dysheke-tekstile": {
    mk: "Мадраци & Текстил (чаршафи, перници, ќебиња)",
    mne: "Dušeci & Tekstil (plahte, jastuci, ćebad)",
  },
  "femije-leaf-mobilje-dhome": {
    mk: "Мебел (орман, комoda за пелени, полици)",
    mne: "Namještaj (ormar, komoda za pelene, police)",
  },
  "femije-leaf-dekorime-drita": { mk: "Декорации & Ноќни светла", mne: "Dekoracije & Noćna svjetla" },
  "femije-leaf-shishe-biberon": { mk: "Шишета & Биберони", mne: "Flašice & Cucle" },
  "femije-leaf-pompe-gjiri": { mk: "Пумпи за дојка (електрични & рачни)", mne: "Pumpe za grudi (električne & ručne)" },
  "femije-leaf-karrige-ushqimi": {
    mk: "Столчиња за храна (high chair, преносни, складни)",
    mne: "Stolice za hranu (high chair, prenosive, sklopive)",
  },
  "femije-leaf-sterilizues-ngrohes": { mk: "Стерилизатори & Загревачи шишета", mne: "Sterilizatori & Grijači flašica" },
  "femije-leaf-ene-luge": { mk: "Садови & Лжици за деца", mne: "Posuđe & Kašike za djecu" },
  "femije-leaf-ushqim-bebe": { mk: "Храна за бебе & Snacks", mne: "Hrana za bebe & Snacks" },
  "femije-leaf-pelene-njeperdorimshme": { mk: "Еднократни пелени", mne: "Jednokratne pelene" },
  "femije-leaf-pelene-riperdorshme": { mk: "Многоразни пелени", mne: "Višekratne pelene" },
  "femije-leaf-lecke-topth": { mk: "Подлоги & Пеленски топови", mne: "Podloge & Pelene kugle" },
  "femije-leaf-vaske-banjoje": { mk: "Каде за купање бебе", mne: "Kada za kupanje bebe" },
  "femije-leaf-produkte-lekure": {
    mk: "Производи за кожа (крем, шампон, масажно масло)",
    mne: "Proizvodi za kožu (krem, šampon, ulje za masažu)",
  },
  "femije-leaf-termometer-pajisje": { mk: "Термометар & Здравствени уреди", mne: "Termometar & Zdravstveni aparati" },
  "femije-leaf-aspirator-kujdes": { mk: "Аспиратор за нос & Дневна нега", mne: "Aspirator za nos & Dnevna njega" },
  "femije-leaf-rroba-foshnjeje": { mk: "Облека за новороденче (0-12 мес.)", mne: "Odjeća za novorođenče (0-12 mj.)" },
  "femije-leaf-rroba-vegjelish": { mk: "Облека за мали деца (1-5 год.)", mne: "Odjeća za malu djecu (1-5 god.)" },
  "femije-leaf-rroba-shkollore": { mk: "Школска облека (6-14 год.)", mne: "Školska odjeća (6-14 god.)" },
  "femije-leaf-veshje-dimri": { mk: "Зимска облека (капути, јакни, костими)", mne: "Zimska odjeća (kaputi, jakne, kostimi)" },
  "femije-leaf-veshje-vere": { mk: "Летна облека", mne: "Ljetna odjeća" },
  "femije-leaf-kepuce-foshnjeje": { mk: "Обувки за новороденче (први чекори)", mne: "Cipele za novorođenče (prvi koraci)" },
  "femije-leaf-kepuce-femijesh": { mk: "Детски обувки (спортски, чизми, сандали)", mne: "Dječje cipele (sport, čizme, sandale)" },
  "femije-leaf-aksesore-rroba": {
    mk: "Аксесоари (капи, ракавици, шал, ученичка торба)",
    mne: "Akcesori (kape, rukavice, šal, školska torba)",
  },
  "femije-leaf-lodra-klasike": {
    mk: "Класични играчки (кукли, фигури, коли, возови)",
    mne: "Klasične igračke (lutke, figure, autići, vozovi)",
  },
  "femije-leaf-lojera-shoqerore": {
    mk: "Друштvenи игри (друштvenи, puzzle, карти)",
    mne: "Društvene igre (društvene, puzzle, karte)",
  },
  "femije-leaf-lodra-elektronike": {
    mk: "Електронски играчки (на батерии, детски таблети)",
    mne: "Elektronske igračke (na baterije, dječji tableti)",
  },
  "femije-leaf-lodra-banjo": { mk: "Играчки за бања & базен", mne: "Igračke za kupku & bazen" },
  "femije-leaf-kostume-loje": { mk: "Костими & Облека за игра", mne: "Kostimi & Odjeća za igru" },
  "femije-leaf-lodra-montessori": { mk: "Montessori играчки", mne: "Montessori igračke" },
  "femije-leaf-blloqe-lego": { mk: "Градивни блокови & Lego", mne: "Građevni blokovi & Lego" },
  "femije-leaf-lodra-muzikore": { mk: "Музички играчки", mne: "Muzičke igračke" },
  "femije-leaf-tapete-sensor": { mk: "Теписи за игра & Сензорна стимулација", mne: "Tepisi za igru & Senzorna stimulacija" },
  "femije-leaf-puzzle-edukative": { mk: "Логички игри & Едукативни puzzle", mne: "Logičke igre & Edukativni puzzle" },
  "femije-leaf-libra-perralla": { mk: "Сликовници & Бајки (0-6 год.)", mne: "Slikovnice & Bajke (0-6 god.)" },
  "femije-leaf-libra-edukative": { mk: "Едукативни книги (7-14 год.)", mne: "Edukativne knjige (7-14 god.)" },
  "femije-leaf-libra-shkollor": { mk: "Учебници", mne: "Udžbenici" },
  "femije-leaf-fletore-materiale": { mk: "Тетратки & Школски материјали", mne: "Sveske & Školski materijali" },
  "femije-leaf-mjete-vizatimi": { mk: "Средства за цртање & Сликање", mne: "Sredstva za crtanje & Slikanje" },
  "femije-leaf-canta-shkolle": { mk: "Ученичка торба", mne: "Školska torba" },
  "femije-leaf-bicikleta": { mk: "Детски велосипеди", mne: "Dječji bicikli" },
  "femije-leaf-trotinet-skiro": { mk: "Тротинети & Скиера", mne: "Trotineti & Skejteri" },
  "femije-leaf-shpatulla-patina": { mk: "Ролери & Патинки", mne: "Roleri & Patinke" },
  "femije-leaf-trampoline": { mk: "Трамполини & Лизгалки", mne: "Trampolini & Tobogani" },
  "femije-leaf-lekundshe-kopsht": { mk: "Лулки & Игралишни играчки", mne: "Ljuljaške & Vrtne igračke" },
  "femije-leaf-topa-sport": { mk: "Топки & Спортска опрема", mne: "Lopte & Sportska oprema" },
  "femije-leaf-kostume-sporti": { mk: "Спортски костими", mne: "Sportski kostimi" },
  "femije-leaf-karrige-ushqimi-larte": { mk: "Високи столчиња за храна", mne: "Visoke stolice za hranu" },
  "femije-leaf-karrige-ushqimi-portative": { mk: "Преносни столчиња за храна", mne: "Prenosive stolice za hranu" },
  "femije-leaf-karrige-makine-0": { mk: "Автоседиште група 0+ (0-13 kg)", mne: "Autosjediste grupa 0+ (0-13 kg)" },
  "femije-leaf-karrige-makine-1": { mk: "Автоседиште група 1 (9-18 kg)", mne: "Autosjediste grupa 1 (9-18 kg)" },
  "femije-leaf-karrige-makine-23": { mk: "Автоседиште група 2/3 (15-36 kg)", mne: "Autosjediste grupa 2/3 (15-36 kg)" },
  "femije-leaf-ulese-ngritese": { mk: "Бустер седишта (booster seat)", mne: "Booster sjedišta" },
  "femije-leaf-canta-shpine": { mk: "Ранец за бебе (diaper bag)", mne: "Ruksak za bebe (diaper bag)" },
  "femije-leaf-canta-dore": { mk: "Торба за рака за бебе", mne: "Torba za ruku za bebe" },
  "femije-leaf-organizatore-karroce": { mk: "Организатори за количка", mne: "Organizatori za kolica" },
  "femije-leaf-mbajtese-shishesh": { mk: "Држачи за шишета", mne: "Držači za flašice" },
  "femije-leaf-mbulesa-shi-diell": { mk: "Заштита од дожд & сонце за количка", mne: "Zaštita od kiše & sunca za kolica" },
  "femije-leaf-fustane-shtatzanise": { mk: "Фустани за бременост", mne: "Haljine za trudnice" },
  "femije-leaf-pantallona-shtatzanise": { mk: "Панталони & Маици за бременост", mne: "Pantalone & Majice za trudnice" },
  "femije-leaf-sutjena-gji": { mk: "Градник & Облека за доење", mne: "Grudnjak & Odjeća za dojenje" },
  "femije-leaf-breza-shtatzanise": { mk: "Појас за бременост", mne: "Pojas za trudnice" },
  "femije-leaf-jastek-anatomik": { mk: "Анатомски перници за спиење", mne: "Anatomski jastuci za spavanje" },
  "femije-leaf-produkte-kujdesi-shtatzanise": {
    mk: "Нега (крем против стрии)",
    mne: "Njega (krem protiv strija)",
  },
  "femije-leaf-porta-sigurie": { mk: "Безбедносни врати (скали & соби)", mne: "Sigurnosna vrata (stepenice & sobe)" },
  "femije-leaf-mbrojtese-kendi": { mk: "Заштита за агли & рабови на маса", mne: "Zaštita za uglove & ivice stola" },
  "femije-leaf-bllokues-sirtare": { mk: "Закljučувачи за фиоки & ормани", mne: "Brave za fioke & ormare" },
  "femije-leaf-mbrojtese-priza": { mk: "Заштита за штекери", mne: "Zaštita za utičnice" },
  "femije-leaf-monitor-audio": { mk: "Аудио бебе монитор", mne: "Audio bebe monitor" },
  "femije-leaf-monitor-video": { mk: "Видео бебе монитор (кamera)", mne: "Video bebe monitor (kamera)" },
  "femije-leaf-jeleke-shpetimi": { mk: "Спасилачки детски елеци", mne: "Spasilački dječji prsluci" },
  "femije-leaf-kaske-biciklete": { mk: "Кацига & Заштита за велосипед", mne: "Kaciga & Zaštita za bicikl" },
  "femije-leaf-pishina-fryra": { mk: "Надuvливи базени", mne: "Duvani bazeni" },
  "femije-leaf-veshje-banjo": { mk: "Купалишна облека & Пливање", mne: "Kupaćica & Plivanje" },
  "femije-leaf-jeleke-noti": { mk: "Пливачки елеци за деца", mne: "Prsluci za plivanje za djecu" },
  "femije-leaf-lodra-reere": { mk: "Играчки за песок & плажа", mne: "Igračke za pijesak & plažu" },
  "femije-leaf-kapele-uv": { mk: "Капи за сонце & UV заштита", mne: "Kape za sunce & UV zaštita" },
  "femije-leaf-krem-mbrojtes": { mk: "Заштитни кремови за деца", mne: "Zaštitni kremovi za djecu" },
};

const __dir = dirname(fileURLToPath(import.meta.url));
const out = join(__dir, "../../../artifacts/vendi/src/lib/femije-category-translations.ts");

const entries: string[] = [];
for (const group of FEMIJE_EXTENDED_GROUPS) {
  const g = BY_SLUG[group.slug];
  if (g) {
    entries.push(`  ${JSON.stringify(group.name)}: { mk: ${JSON.stringify(g.mk)}, mne: ${JSON.stringify(g.mne)} },`);
  }
  for (const leaf of group.leaves) {
    const l = BY_SLUG[leaf.slug];
    if (l) {
      entries.push(`  ${JSON.stringify(leaf.name)}: { mk: ${JSON.stringify(l.mk)}, mne: ${JSON.stringify(l.mne)} },`);
    }
  }
}

const content = `/** Fëmijë extended subcategory names (sq base) → mk / mne. */
export const FEMIJE_CAT_TRANSLATIONS: Record<string, { mk: string; mne: string }> = {
${entries.join("\n")}
};

export function translateFemijeCategory(
  name: string,
  localeCode: "mk" | "mne" | "ks" | "al",
): string | undefined {
  if (localeCode !== "mk" && localeCode !== "mne") return undefined;
  const row = FEMIJE_CAT_TRANSLATIONS[name];
  if (!row) return undefined;
  return row[localeCode];
}
`;

writeFileSync(out, content, "utf8");
console.log(`Wrote ${out} (${entries.length} entries)`);

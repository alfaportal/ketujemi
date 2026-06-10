// Centralised translations for all category and subcategory names.
// Keys are the Albanian (base) names stored in the DB.
// Markets: ks = Kosovo, al = Albania, mk = Macedonia, mne = Montenegro

import { translateArsimKurseCategory } from "./arsim-kurse-category-translations";
import { translateFemijeCategory } from "./femije-category-translations";
import { CAT_EN_GENERATED } from "./category-translations-en.generated";
import { CAT_FR_GENERATED } from "./category-translations-fr.generated";
import { CAT_DE_GENERATED } from "./category-translations-de.generated";
import { CAT_IT_GENERATED } from "./category-translations-it.generated";

export type MarketCode = "ks" | "al" | "mk" | "mne";
export type UiCategoryLocale = MarketCode | "en" | "fr" | "de" | "it";

export const CAT_TRANSLATIONS: Record<string, Record<MarketCode, string>> = {
  "Vetura":               { ks: "Vetura",               al: "Vetura",               mk: "Автомобили",                      mne: "Automobili" },
  "Motorr & Skuter":      { ks: "Motorr & Skuter",      al: "Motorr & Skuter",      mk: "Мотори & Скутери",                mne: "Motori & Skuteri" },
  "Kamionë & Furgonë":    { ks: "Kamionë & Furgonë",    al: "Kamionë & Furgonë",    mk: "Камиони & Комбиња",               mne: "Kamioni & Kombiji" },
  "Auto Pjesë":           { ks: "Auto Pjesë",           al: "Auto Pjesë",           mk: "Авто Делови",                     mne: "Auto Dijelovi" },
  "Banesa & Shtëpi":      { ks: "Banesa & Shtëpi",      al: "Banesa & Shtëpi",      mk: "Станови & Куќи",                  mne: "Stanovi & Kuće" },
  "Lokale & Zyrë":        { ks: "Lokale & Zyrë",        al: "Lokale & Zyrë",        mk: "Локали & Канцеларии",             mne: "Lokali & Kancelarije" },
  "Telefona":             { ks: "Telefona",             al: "Telefona",             mk: "Телефони",                        mne: "Telefoni" },
  "Kompjuterë & Laptopë": { ks: "Kompjuterë & Laptopë", al: "Kompjuterë & Laptopë", mk: "Компјутери & Лаптопи",            mne: "Kompjuteri & Laptopi" },
  "TV & Elektronikë":     { ks: "Elektronikë & Pajisje Shtëpiake", al: "Elektronikë & Pajisje Shtëpiake", mk: "Електроника & Домашни уреди", mne: "Elektronika & Kućni aparati" },
  "Elektronikë & Pajisje Shtëpiake": { ks: "Elektronikë & Pajisje Shtëpiake", al: "Elektronikë & Pajisje Shtëpiake", mk: "Електроника & Домашни уреди", mne: "Elektronika & Kućni aparati" },
  "Mobilje & Dekorime":   { ks: "Mobilje & Dekorime",   al: "Mobilje & Dekorime",   mk: "Мебел & Декорации",               mne: "Namještaj & Dekoracije" },
  "Rroba & Këpucë":       { ks: "Rroba & Këpucë",       al: "Rroba & Këpucë",       mk: "Облека & Чевли",                  mne: "Odjeća & Cipele" },
  "Fëmijë":               { ks: "Fëmijë",               al: "Fëmijë",               mk: "Деца",                            mne: "Djeca" },
  "Sport & Outdoor":      { ks: "Sport & Outdoor",      al: "Sport & Outdoor",      mk: "Спорт & Природа",                 mne: "Sport & Priroda" },
  "Punë & Shërbime":      { ks: "Punë & Shërbime",      al: "Punë & Shërbime",      mk: "Работа & Услуги",                 mne: "Posao & Usluge" },
  "Ndërtim & Instalime":  { ks: "Ndërtim & Instalime",  al: "Ndërtim & Instalime",  mk: "Градежништво & Инсталации",       mne: "Građevina & Instalacije" },
  "Bujqësi & Blegtori":   { ks: "Bujqësi & Blegtori",   al: "Bujqësi & Blegtori",   mk: "Земјоделство & Сточарство",       mne: "Poljoprivreda & Stočarstvo" },

  // ── Ndërtim & Instalime subcategories ────────────────────────────────────────
  "Ndërtim & Muraturë":                    { ks: "Ndërtim & Muraturë",                    al: "Ndërtim & Muraturë",                    mk: "Градење & Муур",                              mne: "Gradnja & Zidanje" },
  "Gipsi & Suvatime":                      { ks: "Gipsi & Suvatime",                      al: "Gipsi & Suvatime",                      mk: "Гипс & Молерски работи",                      mne: "Gips & Fasaderski radovi" },
  "Pllakosje & Mozaik":                    { ks: "Pllakosje & Mozaik",                    al: "Pllakosje & Mozaik",                    mk: "Плочки & Мозаик",                             mne: "Pločice & Mozaik" },
  "Bojatisje & Dekorim":                   { ks: "Bojatisje & Dekorim",                   al: "Bojatisje & Dekorim",                   mk: "Бојадисување & Декорација",                   mne: "Bojenje & Dekoracija" },
  "Riparim çatie & Izolim":                { ks: "Riparim çatie & Izolim",                al: "Riparim çatie & Izolim",                mk: "Поправка на покрив & Изолација",              mne: "Popravka krova & Izolacija" },
  "Riparim dyshemeje & Parket":            { ks: "Riparim dyshemeje & Parket",            al: "Riparim dyshemeje & Parket",            mk: "Поправка на под & Паркет",                    mne: "Popravka poda & Parket" },
  "Riparim dritaresh & dyerve":            { ks: "Riparim dritaresh & dyerve",            al: "Riparim dritaresh & dyerve",            mk: "Поправка на прозорци & врати",                mne: "Popravka prozora & vrata" },
  "Instalime ngrohje & Klima":             { ks: "Instalime ngrohje & Klima",             al: "Instalime ngrohje & Klima",             mk: "Инсталации за греење & Клима",                mne: "Instalacije grijanja & Klima" },
  "Instalime kamera & Alarme":             { ks: "Instalime kamera & Alarme",             al: "Instalime kamera & Alarme",             mk: "Инсталации камери & Аларми",                  mne: "Instalacije kamera & Alarmi" },
  "Instalime solar & Panele diellore":       { ks: "Instalime solar & Panele diellore",       al: "Instalime solar & Panele diellore",       mk: "Сончеви панели & Соларни системи",            mne: "Solarni paneli & Solarni sistemi" },
  "Lëvizje furniture & Transport":         { ks: "Lëvizje furniture & Transport",         al: "Lëvizje furniture & Transport",         mk: "Преселба мебел & Транспорт",                  mne: "Selidba namještaja & Transport" },
  "Mirëmbajtje & Riparime të përgjithshme": { ks: "Mirëmbajtje & Riparime të përgjithshme", al: "Mirëmbajtje & Riparime të përgjithshme", mk: "Општо одржување & Поправки",                  mne: "Opšte održavanje & Popravke" },
  "Arsim & Kurse":        { ks: "Arsim & Kurse",        al: "Arsim & Kurse",        mk: "Образование & Курсеви",           mne: "Obrazovanje & Kursevi" },
  "Muzikë & Hobby":       { ks: "Muzikë & Hobby",       al: "Muzikë & Hobby",       mk: "Музика & Хоби",                   mne: "Muzika & Hobi" },
  "Kafshë":               { ks: "Kafshë",               al: "Kafshë",               mk: "Животни",                         mne: "Životinje" },
  "Kërkoj të Blej":       { ks: "Po kërkon diçka? Lajmëro këtu dhe gjeje", al: "Po kërkon diçka? Lajmëro këtu dhe gjeje", mk: "Барате нешто? Објавете тука и најдете", mne: "Tražite nešto? Objavite ovdje i pronađite" },
  "Dhurata & Falas":      { ks: "Dhurata & Falas — Nga njerëzit e mirë!", al: "Dhurata & Falas — Nga njerëzit e mirë!", mk: "Донации & Бесплатно — Од добрите луѓе!", mne: "Pokloni & Besplatno — Od dobrih ljudi!" },

  // ── Vetura subcategories ─────────────────────────────────────────────────────
  "SUV & Jeep":            { ks: "SUV & Jeep",            al: "SUV & Jeep",            mk: "SUV & Џип",                       mne: "SUV & Džip" },
  "Kombi & Minivan":       { ks: "Kombi & Minivan",       al: "Kombi & Minivan",       mk: "Комби & Минивен",                 mne: "Kombi & Minivan" },
  "Kabriolet & Sportive":  { ks: "Kabriolet & Sportive",  al: "Kabriolet & Sportive",  mk: "Кабриолет & Спортски",            mne: "Kabriolet & Sportski" },
  "Elektrike & Hibride":   { ks: "Elektrike & Hibride",   al: "Elektrike & Hibride",   mk: "Електрични & Хибридни",           mne: "Električni & Hibridni" },
  "Klasike & Vintage":     { ks: "Klasike & Vintage",     al: "Klasike & Vintage",     mk: "Класични & Винтиџ",               mne: "Klasični & Vintage" },

  // ── Motorr & Skuter subcategories ────────────────────────────────────────────
  "Motorr":                { ks: "Motorr",                al: "Motorr",                mk: "Мотор",                           mne: "Motor" },
  "Skuter":                { ks: "Skuter",                al: "Skuter",                mk: "Скутер",                          mne: "Skuter" },
  "Quad & ATV":            { ks: "Quad & ATV",            al: "Quad & ATV",            mk: "Квад & АТВ",                      mne: "Quad & ATV" },
  "Pjesë motorri":         { ks: "Pjesë motorri",         al: "Pjesë motorri",         mk: "Делови за мотор",                 mne: "Dijelovi motora" },
  "Chopper":               { ks: "Chopper",               al: "Chopper",               mk: "Чопер",                           mne: "Čoper" },
  "Enduro":                { ks: "Enduro",                al: "Enduro",                mk: "Ендуро",                          mne: "Enduro" },
  "Motokros":              { ks: "Motokros",              al: "Motokros",              mk: "Мотокрос",                        mne: "Motokros" },
  "Motorr Sportiv":        { ks: "Motorr Sportiv",        al: "Motorr Sportiv",        mk: "Спортски мотор",                  mne: "Sportski motor" },
  "Vespa":                 { ks: "Vespa",                 al: "Vespa",                 mk: "Веспа",                           mne: "Vespa" },
  "Aprilia":               { ks: "Aprilia",               al: "Aprilia",               mk: "Априлија",                        mne: "Aprilia" },
  "Ducati":                { ks: "Ducati",                al: "Ducati",                mk: "Дукати",                          mne: "Ducati" },
  "Harley-Davidson":       { ks: "Harley-Davidson",       al: "Harley-Davidson",       mk: "Харли-Дејвидсон",                 mne: "Harley-Davidson" },
  "Kawasaki":              { ks: "Kawasaki",              al: "Kawasaki",              mk: "Кавасаки",                        mne: "Kawasaki" },
  "KTM":                   { ks: "KTM",                   al: "KTM",                   mk: "КТМ",                             mne: "KTM" },
  "Piaggio":               { ks: "Piaggio",               al: "Piaggio",               mk: "Пијаго",                          mne: "Piaggio" },
  "Yamaha":                { ks: "Yamaha",                al: "Yamaha",                mk: "Јамаха",                          mne: "Yamaha" },

  // ── Kamionë & Furgonë subcategories ──────────────────────────────────────────
  "Kamionë":               { ks: "Kamionë",               al: "Kamionë",               mk: "Камиони",                         mne: "Kamioni" },
  "Furgonë":               { ks: "Furgonë",               al: "Furgonë",               mk: "Комбе",                           mne: "Kombi" },
  "Furgonë & Van":         { ks: "Furgonë & Van",         al: "Furgonë & Van",         mk: "Комбиња & Ван",                   mne: "Kombiji & Van" },
  "Auto-bartës":           { ks: "Auto-bartës",           al: "Auto-bartës",           mk: "Влечно возило",                   mne: "Vučno vozilo" },
  "Autobusë":              { ks: "Autobusë",              al: "Autobusë",              mk: "Автобуси",                        mne: "Autobusi" },
  "Mauna":                 { ks: "Mauna",                 al: "Mauna",                 mk: "Патнички кран",                  mne: "Kamion dizalica" },
  "Trailer & Rimorkio":    { ks: "Trailer & Rimorkio",    al: "Trailer & Rimorkio",    mk: "Трејлер & Приклучно",             mne: "Prikolica i priključno" },
  "Rimorkio":              { ks: "Rimorkio",              al: "Rimorkio",              mk: "Приколки",                        mne: "Prikolice" },
  "DAF":                   { ks: "DAF",                   al: "DAF",                   mk: "DAF",                             mne: "DAF" },
  "Iveco":                 { ks: "Iveco",                 al: "Iveco",                 mk: "Iveco",                           mne: "Iveco" },
  "MAN":                   { ks: "MAN",                   al: "MAN",                   mk: "MAN",                             mne: "MAN" },
  "Scania":                { ks: "Scania",                al: "Scania",                mk: "Scania",                          mne: "Scania" },
  "Mercedes-Benz":         { ks: "Mercedes-Benz",         al: "Mercedes-Benz",         mk: "Mercedes-Benz",                   mne: "Mercedes-Benz" },
  "Renault":               { ks: "Renault",               al: "Renault",               mk: "Renault",                         mne: "Renault" },
  "Volvo":                 { ks: "Volvo",                 al: "Volvo",                 mk: "Volvo",                           mne: "Volvo" },
  "Traktorë & Makineri":   { ks: "Traktorë & Makineri",   al: "Traktorë & Makineri",   mk: "Трактори & Машини",               mne: "Traktori & Mašinerija" },

  // ── Auto Pjesë subcategories ─────────────────────────────────────────────────
  "Akumulatorë":           { ks: "Akumulatorë",           al: "Akumulatorë",           mk: "Акумулатори",                     mne: "Akumulatori" },
  "Amortizerë":            { ks: "Amortizerë",            al: "Amortizerë",            mk: "Амортизери",                       mne: "Amortizeri" },
  "Amortizerë & Sustensioni": { ks: "Amortizerë & Sustensioni", al: "Amortizerë & Sustensioni", mk: "Амортизери & суспензија", mne: "Amortizeri & suspenzija" },
  "Drita & LED":           { ks: "Drita & LED",           al: "Drita & LED",           mk: "Светла & LED",                    mne: "Svjetla & LED" },
  "Fellne & Goma":         { ks: "Fellne & Goma",         al: "Fellne & Goma",         mk: "Фелни & Гуми",                    mne: "Felne & Gume" },
  "Ftohja & Klima":        { ks: "Ftohja & Klima",        al: "Ftohja & Klima",        mk: "Ладење & клима",                  mne: "Hlađenje & klima" },
  "Motorrë":               { ks: "Motorrë",               al: "Motorrë",               mk: "Мотори за возила",                 mne: "Motori za vozila" },
  "Motorrë & Pjesë Motorri": { ks: "Motorrë & Pjesë Motorri", al: "Motorrë & Pjesë Motorri", mk: "Мотор & делови мотор", mne: "Motor & dijelovi motora" },
  "Pjesë Elektrike & Elektronike": { ks: "Pjesë Elektrike & Elektronike", al: "Pjesë Elektrike & Elektronike", mk: "Електрични & електронски делови", mne: "Električni & elektronski dijelovi" },
  "Pjesë Karoserie":       { ks: "Pjesë Karoserie",       al: "Pjesë Karoserie",       mk: "Делови каросерије",               mne: "Djelovi karoserije" },
  "Sisteme Frenimi":       { ks: "Sisteme Frenimi",       al: "Sisteme Frenimi",       mk: "Кочни системи",                   mne: "Kočni sistem" },
  "Vajra & Filtra":        { ks: "Vajra & Filtra",        al: "Vajra & Filtra",        mk: "Масла & филтри",                  mne: "Ulja & filteri" },
  "Të tjera Pjesë":        { ks: "Të tjera Pjesë",        al: "Të tjera Pjesë",        mk: "Други делови",                    mne: "Ostali dijelovi" },
  "Goma & Rrota":          { ks: "Goma & Rrota",          al: "Goma & Rrota",          mk: "Гуми & Тркала",                   mne: "Gume & Točkovi" },
  "Karoseri & Xhama":      { ks: "Karoseri & Xhama",      al: "Karoseri & Xhama",      mk: "Каросерија & Стакла",             mne: "Karoserija & Stakla" },
  "Aksesore":              { ks: "Aksesore",              al: "Aksesore",              mk: "Акцесоари",                       mne: "Akcesori" },
  "Vajra & Kimikate":      { ks: "Vajra & Kimikate",      al: "Vajra & Kimikate",      mk: "Масла & Хемикалии",               mne: "Ulja & Hemikalije" },

  // ── Banesa & Shtëpi subcategories ────────────────────────────────────────────
  "Apartamente & Banesa":  { ks: "Apartamente & Banesa",  al: "Apartamente & Banesa",  mk: "Станови & станбени",              mne: "Stanovi & stambeni" },
  "Dhoma me Qira":         { ks: "Dhoma me Qira",         al: "Dhoma me Qira",         mk: "Соба под кирија",                 mne: "Soba pod najam" },
  "Shtëpi":                { ks: "Shtëpi",                al: "Shtëpi",                mk: "Куќи",                            mne: "Kuće" },
  "Toka & Truall":         { ks: "Toka & Truall",         al: "Toka & Truall",         mk: "Земјиште & плац",                 mne: "Zemljište i plac" },
  "Vikendica":             { ks: "Vikendica",             al: "Vikendica",             mk: "Викенд-куќичка",                  mne: "Vikendica" },
  "Banesa me qera":        { ks: "Banesa me qera",        al: "Banesa me qera",        mk: "Стан под кирија",                 mne: "Stan pod najam" },
  "Banesa në shitje":      { ks: "Banesa në shitje",      al: "Banesa në shitje",      mk: "Стан на продажба",                mne: "Stan na prodaju" },
  "Shtëpi & Vila":         { ks: "Shtëpi & Vila",         al: "Shtëpi & Vila",         mk: "Куќа & Вила",                     mne: "Kuća & Vila" },
  "Toka & Parcela":        { ks: "Toka & Parcela",        al: "Toka & Parcela",        mk: "Земјиште & Парцела",              mne: "Zemlja & Parcela" },
  "Garazha":               { ks: "Garazha",               al: "Garazha",               mk: "Гаража",                          mne: "Garaža" },
  "Dhoma me qera":         { ks: "Dhoma me qera",         al: "Dhoma me qera",         mk: "Соба под кирија",                 mne: "Soba pod najam" },

  // ── Lokale & Zyrë subcategories ──────────────────────────────────────────────
  "Lokale me qera":        { ks: "Lokale me qera",        al: "Lokale me qera",        mk: "Локал под кирија",                mne: "Lokal pod najam" },
  "Lokale në shitje":      { ks: "Lokale në shitje",      al: "Lokale në shitje",      mk: "Локал на продажба",               mne: "Lokal na prodaju" },
  "Zyrë":                  { ks: "Zyrë",                  al: "Zyrë",                  mk: "Канцеларија",                     mne: "Kancelarija" },
  "Magazina & Depoja":     { ks: "Magazina & Depoja",     al: "Magazina & Depoja",     mk: "Магацин & Депо",                  mne: "Magacin & Depo" },
  "Ndërtesa industriale":  { ks: "Ndërtesa industriale",  al: "Ndërtesa industriale",  mk: "Индустриска зграда",              mne: "Industrijska zgrada" },

  // ── Telefona subcategories ───────────────────────────────────────────────────
  "iPhone":                { ks: "iPhone",                al: "iPhone",                mk: "iPhone",                          mne: "iPhone" },
  "Samsung":               { ks: "Samsung",               al: "Samsung",               mk: "Samsung",                         mne: "Samsung" },
  "Huawei & Xiaomi":       { ks: "Huawei & Xiaomi",       al: "Huawei & Xiaomi",       mk: "Huawei & Xiaomi",                 mne: "Huawei & Xiaomi" },
  "Telefona të tjerë":     { ks: "Telefona të tjerë",     al: "Telefona të tjerë",     mk: "Други телефони",                  mne: "Drugi telefoni" },
  "Aksesore telefoni":     { ks: "Aksesore telefoni",     al: "Aksesore telefoni",     mk: "Акцесоари за телефон",            mne: "Akcesori za telefon" },

  // ── Kompjuterë & Laptopë subcategories ──────────────────────────────────────
  "Laptopë":               { ks: "Laptopë",               al: "Laptopë",               mk: "Лаптопи",                         mne: "Laptopi" },
  "Kompjuterë & PC":       { ks: "Kompjuterë & PC",       al: "Kompjuterë & PC",       mk: "Компјутери & PC",                 mne: "Kompjuteri & PC" },
  "Tabletë":               { ks: "Tabletë",               al: "Tabletë",               mk: "Таблети",                         mne: "Tableti" },
  "Gaming & Konzol":       { ks: "Gaming & Konzol",       al: "Gaming & Konzol",       mk: "Гејминг & Конзола",               mne: "Gaming & Konzola" },
  "Drone":                 { ks: "Drone",                 al: "Drone",                 mk: "Дрон",                            mne: "Dron" },

  // ── Elektronikë & Pajisje Shtëpiake subcategories ─────────────────────────
  "Pajisje të Mëdha Shtëpiake": { ks: "Pajisje të Mëdha Shtëpiake", al: "Pajisje të Mëdha Shtëpiake", mk: "Големи домашни уреди", mne: "Veliki kućni aparati" },
  "Klimatizim & Ngrohje": { ks: "Klimatizim & Ngrohje", al: "Klimatizim & Ngrohje", mk: "Климатизација & Греење", mne: "Klimatizacija & Grijanje" },
  "Televizorë & Projektorë": { ks: "Televizorë & Projektorë", al: "Televizorë & Projektorë", mk: "Телевизори & Проектори", mne: "Televizori & Projekcioni" },
  "Konzola & Gaming": { ks: "Konzola & Gaming", al: "Konzola & Gaming", mk: "Конзоли & Гејминг", mne: "Konzole & Gejming" },
  "Audio & Pajisje Zëri": { ks: "Audio & Pajisje Zëri", al: "Audio & Pajisje Zëri", mk: "Аудио & Звучни уреди", mne: "Audio & Zvučni uređaji" },
  "Kamera, Foto & Smart Watch": { ks: "Kamera, Foto & Smart Watch", al: "Kamera, Foto & Smart Watch", mk: "Камера, Фото & Smart Watch", mne: "Kamera, Foto & Smart Watch" },
  "Televizorë":            { ks: "Televizorë",            al: "Televizorë",            mk: "Телевизори",                      mne: "Televizori" },
  "Frigorifer & Lavatriçe":{ ks: "Frigorifer & Lavatriçe",al: "Frigorifer & Lavatriçe",mk: "Фрижидер & Машина за перење",     mne: "Frižider & Mašina za pranje" },
  "Kondicionerë & Klima":  { ks: "Kondicionerë & Klima",  al: "Kondicionerë & Klima",  mk: "Клима уреди",                     mne: "Klima uređaji" },
  "Kuzhinë & Sobë":        { ks: "Kuzhinë & Sobë",        al: "Kuzhinë & Sobë",        mk: "Шпорет & Кујна",                  mne: "Štednjak & Kuhinja" },
  "Audio & Kamera":        { ks: "Audio & Kamera",        al: "Audio & Kamera",        mk: "Аудио & Камера",                  mne: "Audio & Kamera" },

  // ── Mobilje & Dekorime subcategories ────────────────────────────────────────
  "Dhoma gjumi":           { ks: "Dhoma gjumi",           al: "Dhoma gjumi",           mk: "Спална соба",                     mne: "Spavaća soba" },
  "Dhoma ndenje":          { ks: "Dhoma ndenje",          al: "Dhoma ndenje",          mk: "Дневна соба",                     mne: "Dnevna soba" },
  "Kuzhina":               { ks: "Kuzhina",               al: "Kuzhina",               mk: "Кујна",                           mne: "Kuhinja" },
  "Banja & Sanitari":      { ks: "Banja & Sanitari",      al: "Banja & Sanitari",      mk: "Бања & Санитарија",               mne: "Kupatilo & Sanitarije" },
  "Dekorime":              { ks: "Dekorime",              al: "Dekorime",              mk: "Декорации",                       mne: "Dekoracije" },
  "Materiale ndërtimi":    { ks: "Materiale ndërtimi",    al: "Materiale ndërtimi",    mk: "Градежни материјали",             mne: "Građevinski materijali" },

  // ── Rroba & Këpucë subcategories ─────────────────────────────────────────────
  "Rroba femra":           { ks: "Rroba femra",           al: "Rroba femra",           mk: "Женска облека",                   mne: "Ženska odjeća" },
  "Rroba meshkuj":         { ks: "Rroba meshkuj",         al: "Rroba meshkuj",         mk: "Машка облека",                    mne: "Muška odjeća" },
  "Këpucë":                { ks: "Këpucë",                al: "Këpucë",                mk: "Чевли",                           mne: "Cipele" },
  "Çanta & Aksesore":      { ks: "Çanta & Aksesore",      al: "Çanta & Aksesore",      mk: "Торби & Акцесоари",               mne: "Torbe & Akcesori" },
  "Bizhuteri & Orë":       { ks: "Bizhuteri & Orë",       al: "Bizhuteri & Orë",       mk: "Накит & Часовници",               mne: "Nakit & Satovi" },
  "Parfume":               { ks: "Parfume",               al: "Parfume",               mk: "Парфеми",                         mne: "Parfemi" },

  // ── Fëmijë subcategories ─────────────────────────────────────────────────────
  "Lodra":                 { ks: "Lodra",                 al: "Lodra",                 mk: "Играчки",                         mne: "Igračke" },
  "Rroba fëmijë":          { ks: "Rroba fëmijë",          al: "Rroba fëmijë",          mk: "Детска облека",                   mne: "Dječija odjeća" },
  "Karrocë & Krevat":      { ks: "Karrocë & Krevat",      al: "Karrocë & Krevat",      mk: "Количка & Кревет",                mne: "Kolica & Krevetac" },
  "Libra shkollor":        { ks: "Libra shkollor",        al: "Libra shkollor",        mk: "Учебници",                        mne: "Školske knjige" },
  "Produkte nëna":         { ks: "Produkte nëna",         al: "Produkte nëna",         mk: "Производи за мајки",              mne: "Proizvodi za mame" },

  // ── Sport & Outdoor subcategories ────────────────────────────────────────────
  "Pajisje sporti":        { ks: "Pajisje sporti",        al: "Pajisje sporti",        mk: "Спортска опрема",                 mne: "Sportska oprema" },
  "Biçikleta & E-bike":    { ks: "Biçikleta & E-bike",    al: "Biçikleta & E-bike",    mk: "Велосипеди & Е-велосипеди",       mne: "Bicikli & E-bicikli" },
  "Gjueti & Peshkim":      { ks: "Gjueti & Peshkim",      al: "Gjueti & Peshkim",      mk: "Лов & Риболов",                   mne: "Lov & Ribolov" },
  "Kampim & Natyrë":       { ks: "Kampim & Natyrë",       al: "Kampim & Natyrë",       mk: "Кампување & Природа",             mne: "Kampovanje & Priroda" },
  "Instrumente muzikore":  { ks: "Instrumente muzikore",  al: "Instrumente muzikore",  mk: "Музички инструменти",             mne: "Muzički instrumenti" },

  // ── Punë & Shërbime subcategories ────────────────────────────────────────────
  "Oferta pune":             { ks: "Oferta pune",             al: "Oferta pune",             mk: "Огласи за работа",              mne: "Oglasi za posao" },
  "Kërkoj punë":             { ks: "Kërkoj punë",             al: "Kërkoj punë",             mk: "Барам работа",                  mne: "Tražim posao" },
  "Shërbime profesionale":   { ks: "Shërbime profesionale",   al: "Shërbime profesionale",   mk: "Професионални услуги",          mne: "Profesionalne usluge" },
  "Pastrimi & Mirëmbajtja":  { ks: "Pastrimi & Mirëmbajtja",  al: "Pastrimi & Mirëmbajtja",  mk: "Чистење & Одржување",           mne: "Čišćenje & Održavanje" },
  "Ndërtim & Rinovim":       { ks: "Ndërtim & Rinovim",       al: "Ndërtim & Rinovim",       mk: "Градба & Реновирање",           mne: "Gradnja & Renoviranje" },

  // ── Bujqësi & Blegtori subcategories ─────────────────────────────────────────
  "Kafshë bujqësore":      { ks: "Kafshë bujqësore",      al: "Kafshë bujqësore",      mk: "Земјоделски животни",             mne: "Poljoprivredne životinje" },
  "Makineri bujqësore":    { ks: "Makineri bujqësore",    al: "Makineri bujqësore",    mk: "Земјоделска механизација",        mne: "Poljoprivredna mašinerija" },
  "Fara & Fidane":         { ks: "Fara & Fidane",         al: "Fara & Fidane",         mk: "Семиња & Садници",                mne: "Sjeme & Rasad" },
  "Produkte bujqësore":    { ks: "Produkte bujqësore",    al: "Produkte bujqësore",    mk: "Земјоделски производи",           mne: "Poljoprivredni proizvodi" },

  // ── Arsim & Kurse subcategories ──────────────────────────────────────────────
  "Mësimdhënie private":   { ks: "Mësimdhënie private",   al: "Mësimdhënie private",   mk: "Приватни часови",                 mne: "Privatni časovi" },
  "Kurse gjuhësh":         { ks: "Kurse gjuhësh",         al: "Kurse gjuhësh",         mk: "Јазични курсеви",                 mne: "Jezički kursevi" },
  "Kurse IT":              { ks: "Kurse IT",              al: "Kurse IT",              mk: "ИТ курсеви",                      mne: "IT kursevi" },
  "Libra & Materiale":     { ks: "Libra & Materiale",     al: "Libra & Materiale",     mk: "Книги & Материјали",              mne: "Knjige & Materijali" },

  // ── Muzikë & Hobby subcategories ─────────────────────────────────────────────
  "Instrumente":           { ks: "Instrumente",           al: "Instrumente",           mk: "Инструменти",                     mne: "Instrumenti" },
  "Libra & Revista":       { ks: "Libra & Revista",       al: "Libra & Revista",       mk: "Книги & Списанија",               mne: "Knjige & Časopisi" },
  "Koleksione":            { ks: "Koleksione",            al: "Koleksione",            mk: "Колекции",                        mne: "Kolekcije" },
  "Lojëra & Lodra":        { ks: "Lojëra & Lodra",        al: "Lojëra & Lodra",        mk: "Игри & Играчки",                  mne: "Igre & Igračke" },

  // ── Kafshë subcategories ─────────────────────────────────────────────────────
  "Qen":                   { ks: "Qen",                   al: "Qen",                   mk: "Кучиња",                          mne: "Psi" },
  "Mace":                  { ks: "Mace",                  al: "Mace",                  mk: "Мачки",                           mne: "Mačke" },
  "Shpezë":                { ks: "Shpezë",                al: "Shpezë",                mk: "Птици",                           mne: "Ptice" },
  "Kafshë të tjera":       { ks: "Kafshë të tjera",       al: "Kafshë të tjera",       mk: "Други животни",                   mne: "Druge životinje" },
  "Aksesore kafshësh":     { ks: "Aksesore kafshësh",     al: "Aksesore kafshësh",     mk: "Акцесоари за животни",            mne: "Akcesori za životinje" },
};

export function translateCategory(name: string, localeCode: UiCategoryLocale): string {
  if (localeCode === "fr") {
    return (
      CAT_FR_GENERATED[name] ??
      translateArsimKurseCategory(name, "fr") ??
      translateFemijeCategory(name, "fr") ??
      CAT_EN_GENERATED[name] ??
      name
    );
  }
  if (localeCode === "de") {
    return (
      CAT_DE_GENERATED[name] ??
      translateArsimKurseCategory(name, "de") ??
      translateFemijeCategory(name, "de") ??
      CAT_EN_GENERATED[name] ??
      name
    );
  }
  if (localeCode === "it") {
    return (
      CAT_IT_GENERATED[name] ??
      translateArsimKurseCategory(name, "it") ??
      translateFemijeCategory(name, "it") ??
      CAT_EN_GENERATED[name] ??
      name
    );
  }
  if (localeCode === "en") {
    return (
      CAT_EN_GENERATED[name] ??
      translateArsimKurseCategory(name, "en") ??
      translateFemijeCategory(name, "en") ??
      name
    );
  }
  return (
    CAT_TRANSLATIONS[name]?.[localeCode] ??
    translateArsimKurseCategory(name, localeCode) ??
    translateFemijeCategory(name, localeCode) ??
    name
  );
}

/**
 * Enciklopedia e plotë e KetuJemi.com për chatbot-in «Ndihmë» (system prompt).
 * Përditësohet sipas seed kategorive, market-context, rregullave biznesi dhe FAQ.
 */

export const KETUJEMI_PLATFORM_KNOWLEDGE = `
=== ÇFARË ËSHTË KETUJEMI ===
KetuJemi.com është platformë njoftimesh (shpallje) për blerje/shitje në Ballkan dhe diasporë.
• Çdo rresht = NJË njoftim nga NJË shitës (jo dyqan me inventar të centralizuar).
• Çmimet, gjendja dhe kontakti janë te shitësi — KetuJemi nuk është ndërmjetës pagese për njoftimet normale.
• Moderim automatik para publikimit; raportim «Raporto» në njoftim.

=== FAQET & NAVIGIMI (pa thënë vetëm «shiko faqen kryesore») ===
• Faqja kryesore (/): 20 kategori + njoftime të fundit + TOP.
• «Njoftimet» (/listings): të gjitha njoftimet + kërkim me fjalë kyçe.
• Kategori (/category/…): klik kategori → nën-kategori (nëse ka) → markë/lloj (Vetura, Telefona…) → lista → hap njoftimin.
• Njoftim (/listings/:id): foto (max **10** për shpallje), video opsionale deri 150MB, titull, përshkrim, çmim €, sy/shikime, «Telefono», WhatsApp, «Raporto».
• «Posto Falas» (/listings/new): krijon njoftim të ri.
• «Hyr» (/login): hyrje dhe regjistrim.
• Profili (/profile): «Njoftimet e mia» — edito, fshi, rifillo.
• Footer: FAQ, Kontakt, Rregullat, Privatësia, Siguria.
• Footer BIZNESE: «Hap shitore» / «Partneritet» → /partner.
• /vip — informacion paketash VIP partner.

=== TREGJET (11 tregje) ===
Ballkan (4): Kosovë (EUR €), Shqipëri (ALL L), Maqedoni e Veriut (MKD ден), Mal i Zi (EUR €).
Diaspora (7): Gjermani, Austri, Zvicër, Itali, Francë, Angli, SHBA — me monedhë lokale në shfaqje.
• Tregu zgjidhet në footer/header — ndikon në simbolin e çmimit.
• Diaspora mund të postojë normalisht me numrin e vendit të tyre.

=== 20 KATEGORITË KRYESORE + NËN-KATEGORI ===

1) **Vetura** — lloje: Sedan, Hatchback, SUV & Jeep, Kombi & Minivan, Kabriolet & Sportive, Kupe, Elektrike & Hibride, Pickup, Klasike & Vintage; pastaj marka (Audi, BMW, Mercedes-Benz, Volkswagen, Toyota, etj.).

2) **Motorr & Skuter** — lloje: Chopper, Enduro, Motokros, Motorr Sportiv, Quad & ATV, Skuter, Vespa; marka: Honda, Yamaha, Kawasaki, Piaggio, etj.

3) **Kamionë & Furgonë** — Autobusë, Auto-bartës, Furgonë, Kamionë, Mauna, Trailer & Rimorkio; marka: MAN, Volvo, Scania, Mercedes-Benz, etj.

4) **Auto Pjesë** — Akumulatorë, Amortizerë, Drita & LED, Fellne & Goma, Motorrë, Pjesë Karoserie, Sisteme Frenimi, Vajra & Filtra.

5) **Banesa & Shtëpi** — Apartamente & Banesa, Dhoma me Qira, Shtëpi, Toka & Truall, Vikendica.

6) **Lokale & Zyrë** — Depo, Garazha, Lokale Afariste, Objekte Industriale, Zyrë.

7) **Telefona** — Smartphones, Telefona Fiksë, Numra & Kartela, Pjesë Rezervë, Aksesorë; marka: Apple, Samsung, Xiaomi, Huawei, OnePlus, etj.

8) **Kompjuterë & Laptopë** — Desktop PC, Laptopë, Monitorë, Pjesë Harduerike, Serverë, Tabletë; marka: Apple, Dell, HP, Lenovo, ASUS, etj.

9) **Elektronikë & Pajisje Shtëpiake** — Pajisje të Mëdha Shtëpiake, Klimatizim & Ngrohje, Televizorë & Projektorë, Konzola & Gaming, Audio & Pajisje Zëri, Kamera/Foto/Smart Watch, Laptopë & Kompjuterë.

10) **Mobilje & Dekorime** — Dhoma e Gjumit, Kopshtit & Terasa, Kuzhina, Ndriçim, Sallone & Ulëse, Tepihë & Perde.

11) **Rroba & Këpucë** — Aksesorë, Këpucë, Veshje për Femra/Fëmijë/Meshkuj.

12) **Fëmijë** — Karroca, Lodra, Pajisje për Foshnje, Rroba për Fëmijë, Ushqim & Higjienë.

13) **Sport & Outdoor** — Biçikleta, Fitnes & Joga, Pajisje Kampingu, Sportet me Top, Sportet Dimërore.
   (Për muzikë/instrumente MOS përdorni këtë kategori — shih #17.)

14) **Punë & Shërbime** — Administratë, Gastronomi, IT & Dizajn, Marketing, Ndërtimtari, Shërbime Transporti, Zejtari.

15) **Bujqësi & Blegtori** — Bagëti, Farëra & Plehra, Makineri Bujqësore, Shpezë, Ushqim për Kafshë.

16) **Arsim & Kurse** — Gjuhë të Huaja, Kurse Profesionale, Mësime Private, Trajnime IT.

17) **Muzikë & Hobby** (kategori kryesore e veçantë — JO nën Sport & Outdoor):
    • Instrumente Frymore, Instrumente me Tela, Instrumente me Tastierë, Libra, Pajisje Studio, Art Teatër & Film.
    • Shembull navigimi: faqja kryesore → **Muzikë & Hobby** → Instrumente me Tela → njoftimet (gitar, violinë…).
    • Për të shitur muzikë: «Posto Falas» → **Muzikë & Hobby** → nën-kategoria e duhur.

18) **Kafshë** — Akuariume, Mace, Qen, Shpendë, Ushqim & Aksesorë për Kafshë.

Kërkim i gjerë: «Njoftimet» + fjalë (p.sh. «iPhone 15», «banesë Prishtinë», «gitar»).

=== SI TË REGJISTROHESH (hap pas hapi) ===
1) Klikoni **«Hyr»** (këndi i sipërm djathtas).
2) Zgjidhni **«Regjistrohu»**.
3) **Email:** vendosni email + fjalëkalim (min. 8 karaktere) → konfirmoni nga emaili.
4) **Google, Facebook ose TikTok:** përdorni butonat e hyrjes sociale në të njëjtën faqe.
5) Pas regjistrimit: mund të shfletoni, të kontaktoni shitës, të postoni («Posto Falas»).
6) **Harruat fjalëkalimin?** Në «Hyr» → «Harrova fjalëkalimin» (me email).

**Regjistrim ≠ postim njoftimi:** llogari krijon akses; për të shitur duhet «Posto Falas» + kategori.

=== SI TË POSTOSH NJOFTIM (hap pas hapi) ===
1) Hyni në llogari (email, Google, Facebook ose TikTok).
2) Klikoni **«Posto Falas»** (/listings/new).
3) Zgjidhni **kategorinë kryesore** dhe **nënkategorinë** e saktë (e rëndësishme për blerësit).
4) Plotësoni: titull i qartë, përshkrim, çmim në **€** (ose «Me marrëveshje» për privatë).
5) Ngarkoni **deri 10 foto** (min. 3 rekomandohen); opsionalisht një video deri **150MB**.
6) Vendndodhja/qyteti, emri, telefon kontakti.
7) Publikoni — **moderim automatik** → njoftim aktiv deri **3 muaj**.
8) Menaxhim: **Profili** → njoftimet e mia → ndrysho / fshi / **«Rifillo njoftimin»** pas skadimit (+3 muaj).
9) **TOP** (opsional): **€2 = 4 ditë**, **€5 = 15 ditë**, **€8 = 30 ditë** në krye të listës (zgjidhni paketën → Stripe).
10) Mos postoni të njëjtin send dy herë brenda **1 muaji** — sistemi bllokon shpallje të ngjashme (titull, përshkrim, foto, kategori). Përdorni **Edito** në Profil për njoftimin e vjetër.

=== LINKA DIREKTE KATEGORISH (përgjigje «ku ta gjej X» — vetëm path, një rresht) ===
Kur përdoruesi pyet ku të gjejë produkt/kategori, jep **vetëm** path-in (klikueshëm në chat):
• Telefona/mobile → /shpallje/telefona
• Vetura/makina → /shpallje/vetura
• Motorr/skuter → /shpallje/motorr-skuter
• Kamionë/furgonë → /shpallje/kamione-furgone
• Auto pjesë/goma → /shpallje/auto-pjese
• Banesa/apartament → /shpallje/banesa-shtepi
• Lokale/zyrë → /shpallje/lokale-zyre
• Laptop/kompjuter → /shpallje/kompjutere-laptope
• TV/elektronikë → /shpallje/tv-elektronike
• Mobilje → /shpallje/mobilje-dekorime
• Rroba/këpucë → /shpallje/rroba-kepuce
• Fëmijë → /shpallje/femije
• Sport → /shpallje/sport-outdoor
• Punë/shërbime → /shpallje/pune-sherbime
• Bujqësi → /shpallje/bujqesi-blegtori
• Arsim/kurse → /shpallje/arsim-kurse
• Muzikë/instrumente → /shpallje/muzike-hobby
• Kafshë → /shpallje/kafshet
• Ndërtim → /shpallje/ndertim-instalime
• Kërkim me model (p.sh. iPhone 15) → /listings?search=iPhone+15
• Regjistrim → /login
• Postim shpallje → /listings/new
• Dyqane biznesi → /dyqanet

=== NJOFTIME FALAS (përdorues privat) ===
• **10 postime falas në muaj** për çdo **kategori kryesore** (rrënja + të gjitha nën-kategoritë; numërohen postimet e këtij muaji kalendarik).
• Muaji riniset në fillim të muajit të ri — skadimi 3-mujor i njoftimit është rregull i veçantë (jo limit «10 aktive»).
• Pas limitit: **mbushni portofolin** (€5 / €10 / €20 → ~16 / 33 / 66 shpallje @ **€0.30**), **pa skadim** deri sa harxhohet — Stripe.
• Postimi bazë për privatë është **falas** (jo abonim mujor për postim normal).

=== LLOGARI BIZNESI ===
• Llogari **biznesi** (account_type business): emër biznesi, verifikim nga admin.
• **Standard biznes:** 10 njoftime falas **për kategori** (si privatët), pastaj **€0.30/shpallje nga portofoli**.
• **VIP biznes €50/muaj:** postime të pakufizuara në kategori; badge VIP; rregulla më strikte (çmim real i detyrueshëm, jo «na kontaktoni», jo reklama të përgjithshme, foto reale jo stock).
• Bizneset duhet çmim > 0 € dhe përshkrim produkti specifik.
• Ankesa: pas 3 paralajmërimeve, pas 5 — pezullim 30 ditë.

=== PARTNER DYQANI (/partner) — ndryshe nga llogaria biznesi e thjeshtë ===
• Footer **BIZNESE** → «Hap shitore» ose «Partneritet» → **/partner**.
• **Partner:** profil partneri, badge i verifikuar, përmbledhje përfitimesh.
• **VIP Partner:** gjithçka Partner + logo në faqen kryesore (rotacion), badge VIP në njoftime.
• Aplikim: formular (emër biznesi, kontakt, telefon, email, logo, përshkrim, paketë) → email te info@ketujemi.com — **pa pagesë online**, aktivizim manual nga admin.

=== PAGESAT (Stripe) ===
• Platforma përdor **Stripe Checkout** për pagesa me **kartë bankare** (Visa, Mastercard, etj.).
• Stripe përdoret vetëm për: **TOP njoftimi** (€2 / €5 / €8). Partner (/partner) **nuk** paguhet online.
• KetuJemi **NUK** mbledh pagesa për blerjen e produktit te shitësi — blerësi dhe shitësi bien dakord direkt.

=== SI BLERËS ===
1) Gjeni kategorinë e saktë (tabela 20 kategorive) ose «Njoftimet» + kërkim.
2) Hapni njoftimin — lexoni çmimin (shfaqet sipas tregut të zgjedhur).
3) **«Telefono»** ose **WhatsApp** — kontakt direkt me shitësin.
4) Takohuni personalisht, kontrolloni produktin, mos dërgoni para paraprakisht.
5) Njoftim i dyshimtë → **«Raporto»** ose support@ketujemi.com.

=== SIGURIA (këshilla zyrtare) ===
• Mos dërgoni para avans pa u takuar në vend publik.
• Kontrolloni produktin dhe dokumentet (p.sh. vetura) para pagesës.
• Përdorni numrin e telefonit që shfaqet në njoftim — mos kaloni në linke të dyshimta.
• Raportoni mashtrim: butoni «Raporto» në njoftim ose **support@ketujemi.com** (reagim brenda ~24 orëve).
• KetuJemi nuk garanton produktin — është platformë ndërmjetëse.
• Ndaluar: armë, droga, alkool, duhan, vape, produkte fake, MLM, erotik, crypto/lojëra fati.

=== KONTAKT MBËSHTETJE ===
• Email: **support@ketujemi.com** (pyetje platforme, raportime, partneritet).
• Email alternativ: info@ketujemi.com
• Telefon mbështetje: shfaqet në faqen Kontakt (nëse konfiguruar në server).
• Formular **Kontakt** në footer për mesazhe.

=== FAQ — PYETJET MË TË SHPESHTA ===
**Si të postoj?** → «Posto Falas», kategori, të dhëna, foto, publiko (deri 3 muaj).
**Sa kushton postimi?** → Falas dhe i pakufizuar; TOP opsional €2/€5/€8; partner dyqani (/partner) — aplikim falas.
**Sa foto?** → **Maksimum 10 foto** për shpallje (+ video opsionale deri 150MB).
**Si ta fshij/ndryshoj?** → Profili → njoftimet e mia.
**Si kontaktoj shitësin?** → Telefono / WhatsApp në faqen e njoftimit.
**A funksionon jashtë vendit?** → Po, 11 tregje përfshirë diasporën.
**Si funksionon çmimi i artikullit?** → Çdo njoftim ka çmimin e vet; krahaso disa njoftime në të njëjtën kategori.
**Muzikë ku?** → Kategoria **Muzikë & Hobby** (Instrumente, Libra, Studio…), jo Sport & Outdoor.
**Regjistrim për muzikë?** → Llogari: Hyr→Regjistrohu (email, Google, Facebook, TikTok); shitje: Posto Falas→Muzikë & Hobby; blerje: Muzikë & Hobby→shfletoni.
**Partner dyqani?** → /partner, formular aplikimi Partner / VIP Partner, pa pagesë online.
**Skadimi?** → deri 3 muaj; rifillo nga njoftimi juaj.
**Verifikimi?** → Hyni në llogari (regjistrim me email, Google, Facebook ose TikTok).

=== RREGULLA & MODERIM (obligative — mos i thyej) ===
Lejohet: produkt real, foto të vërteta, **një produkt për njoftim**, çmim i qartë, **kategoria e saktë** (çdo shpallje vetëm aty ku i përket).
Ndaluar menjëherë (refuzim automatik): armë, droga, alkool, duhan/cigare/vape, kripto, baste/kazino, MLM/piramida, erotik, replika/fake.
**Duplikate:** i njëjti send **jo dy herë brenda 1 muaji** — përdor Edito ose ndrysho artikullin.
**Foto:** max **10** për shpallje.
**Kategoria ≠ vendndodhja:** kategoria = lloji i produktit; qyteti/shteti zgjidhet veç e veç (KS, AL, MK, MNE lejohen).
Moderim automatik para publikimit; refuzim nëse përmbajtja shkel rregullat.
`.trim();

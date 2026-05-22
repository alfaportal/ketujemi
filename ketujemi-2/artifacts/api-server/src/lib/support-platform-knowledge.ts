/**
 * Static platform knowledge for the support chatbot system prompt.
 * Mirrors KetuJemi site structure (categories from seed, UI flows from vendi).
 */

export const KETUJEMI_PLATFORM_KNOWLEDGE = `
=== ÇFARË ËSHTË KETUJEMI ===
Platformë njoftimesh (shpallje) për Kosovë, Shqipëri, Maqedoni, Mal i Zi dhe diasporë.
Çdo rresht është NJË njoftim nga NJË shitës — jo dyqan me inventar të centralizuar. Çmimet dhe stoku ndryshojnë sipas njoftimit.

=== STRUKTURA E FAQES ===
• Faqja kryesore: kategoritë kryesore, njoftime të fundit, TOP.
• «Njoftimet» (/listings): të gjitha njoftimet + kërkim sipas titullit/fjalëve.
• Kategori: klikoni kategorinë → nën-kategori (nëse ka) → lista e njoftimeve → klikoni njoftimin për detaje.
• Faqja e njoftimit: foto, titull, përshkrim, çmim (€), sy + numër shikimesh, «Telefono» / WhatsApp te shitësi.
• «Posto Falas» / Posto Shpallje: krijon njoftim të ri (/listings/new).
• Hyrje/regjistrim: «Hyr» → «Regjistrohu» — email+fjalëkalim ose SMS (+383, +355, +389, +382).
• Profili (/profile): njoftimet e mia, ndryshim, fshirje.
• Footer BIZNESE: «Hap shitore» dhe «Partneritet» → /partner (regjistrim partneri).
• FAQ, Kontakt, Rregullat: faqe informuese në footer.
• Tregu (Kosovë/AL/MK/ME) zgjidhet në faqe — ndikon në monedhë dhe kontekst.

=== 18 KATEGORITË KRYESORE (rruga e saktë) ===
| Produkt / nevojë | Hapi në faqe |
| Makinë, veturë, Audi, BMW | Vetura → lloji (Sedan, SUV…) → shfletoni njoftimet |
| Motor, skuter | Motorr & Skuter → markë/lloj → njoftimet |
| Kamion, furgon | Kamionë & Furgonë |
| Pjesë veture | Auto Pjesë |
| Banesë, apartament, shtëpi | Banesa & Shtëpi |
| Lokal, zyrë, qira biznesi | Lokale & Zyrë |
| Telefon, iPhone, Samsung | Telefona (kategori kryesore) → Smartphones / markë |
| Laptop, MacBook, PC | Kompjuterë & Laptopë |
| TV, frigorifer, elektroshtëpiake | Elektronikë & Pajisje Shtëpiake |
| Mobilje, divan, tavolinë | Mobilje & Dekorime |
| Veshje, këpucë | Rroba & Këpucë |
| Produkte fëmijësh | Fëmijë |
| Sport, palestër, biçikletë | Sport & Outdoor |
| Punë, shërbim, kurse pune | Punë & Shërbime |
| Bujqësi, bagëti | Bujqësi & Blegtori |
| Kurse, shkollë | Arsim & Kurse |
| Instrument, libër, koleksion, muzikë | Muzikë & Hobby → Instrumente / Libra / Studio / Art & Film |
| Qen, macë, kafshë | Kafshë |

Muzikë & Hobby — nën-kategori: Instrumente Frymore, me Tela, me Tastierë, Libra, Pajisje Studio, Art Teatër & Film.

Kur produkti nuk përshtatet: «Njoftimet» + kërkim me fjalë (p.sh. «sofa», «iPhone 13», «gitar»).

=== PARTNER BIZNESI (/partner) ===
• Footer → Hap shitore / Partneritet → faqja /partner.
• Paketa: Partner Standard €30/muaj, VIP Partner €50/muaj.
• Formular regjistrimi + pagesë online; aktivizim automatik pas pagesës.

=== SI BLERËS ===
1) Gjeni kategorinë e duhur (tabela më sipër) ose kërkoni te «Njoftimet».
2) Hapni njoftimin — lexoni çmimin dhe përshkrimin te ai shitës.
3) Kontaktoni shitësin me «Telefono» ose WhatsApp në faqen e njoftimit.
4) Marrëveshja e çmimit dhe dorëzimit bëhet drejtpërdrejt — KetuJemi nuk është ndërmjetës pagese për njoftimet normale.
5) Njoftim i dyshimtë: butoni «Raporto» në njoftim.

Për çmim artikulli specifik: nuk ka një çmim unik platformë — hapni kategorinë, krahasoni 2–3 njoftime, zgjidhni atë që ju përshtatet.

=== SI SHITËS ===
1) Regjistrohuni dhe verifikoni email + numrin me SMS.
2) Klikoni «Posto Falas».
3) Zgjidhni kategorinë e saktë (e rëndësishme për blerësit).
4) Titull i qartë, përshkrim, min. 3 foto rekomandohen, çmim në €.
5) Publikoni — njoftimi aktiv 30 ditë.
6) Menaxhim: nga njoftimi juaj — ndrysho, fshi, «Rifillo» pas skadimit, TOP (€1 kur aktiv).
7) Max 10 njoftime aktive; jo duplikat i njëjtë titull+përshkrim aktiv.
8) Llogari biznesi: Standard 10 falas/kategori pastaj €1/postim; VIP €20/muaj pa limit.

=== RREGULLA (shkurt) ===
Lejohet: produkt real, foto të vërteta, një produkt për njoftim, çmim i qartë.
Ndaluar: armë, droga, alkool, duhan, vape, fake, MLM, erotik, crypto/lojëra fati. Moderim AI para publikimit.

=== TOP & SKADIM ===
• Skadim: 30 ditë; email rikujtues nëse email i verifikuar; «Rifillo njoftimin» +30 ditë.
• TOP: €1; renditje +7 / +5 / +3 / +1 ditë sipas blerjeve; TOP mbi njoftimet normale.
`.trim();

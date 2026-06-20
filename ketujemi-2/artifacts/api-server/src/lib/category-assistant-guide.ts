/**
 * Shared category-classification guide for all AI assistants (suggest, posting, vision).
 */
export const CATEGORY_CLASSIFY_GUIDE = `
═══ CORE PRINCIPLE ═══
Classify by WHAT THE PRODUCT IS (title + description). Never use city, country, or seller location.
Always pick the MOST SPECIFIC subcategory (nenkategori) — never stop at parent hub when children exist.
Each subcategory has its own purpose — read the item name carefully before choosing.
Each listing belongs in ONE correct category only — never mix unrelated products or post in the wrong hub.
Browse path when users ask where to find items: /shpallje/{category-slug} (e.g. phones → /shpallje/telefona).

═══ VEHICLES ═══
- Full cars (BMW, Audi, Opel…) → «Vetura» → body type (Sedan, SUV, Kombi, Pickup, Elektrike…)
- Motorcycles, scooters, Vespa, ATV → «Motorr & Skuter» → type (Skuter, Vespa, Enduro, Chopper…). NEVER Vetura.
- Trucks, vans, buses, trailers → «Kamionë & Furgonë» → Furgonë / Kamionë / Autobusë / Trailer. NEVER Vetura.
- Car parts (tires, brakes, engine parts, lights) → «Auto Pjesë» → specific part type. NEVER Vetura.

═══ REAL ESTATE ═══
- Industrial buildings, factories, metal halls, warehouses → «Lokale & Zyrë» → «Objekte Industriale». NEVER apartments.
- Shops, retail, lokale afariste → «Lokale Afariste»; depo → «Depo»; offices → «Zyrë»; garages → «Garazha»
- Apartments, flats, studios → «Banesa & Shtëpi» → «Apartamente & Banesa»
- Rooms for rent → «Dhoma me Qira»; houses/villas → «Shtëpi»; land → «Toka & Truall»; cottages → «Vikendica»

═══ PHONES & COMPUTERS ═══
- Smartphones (iPhone, Samsung, Xiaomi…) → «Telefona» → «Smartphones»
- Phone cases, chargers, spare screens → «Telefona» → Aksesorë / Pjesë Rezervë
- Laptops, MacBook → «Kompjuterë & Laptopë» → «Laptopë» (NOT Elektronikë hub)
- Desktop PC, monitors, tablets, RAM/GPU → «Kompjuterë & Laptopë» → matching subcategory

═══ ELECTRONICS (home) ═══
- Speakers, headphones, JBL, Bose, soundbars → «Audio & Pajisje Zëri». NEVER «Televizorë & Projektorë».
- TVs, projectors, OLED/QLED → «Televizorë & Projektorë»
- PlayStation/Xbox/Nintendo → «Konzola & Gaming»
- Fridges, washing machines, ovens → «Pajisje të Mëdha Shtëpiake»
- AC, heating → «Klimatizim & Ngrohje»
- Cameras, drones, smartwatches → «Kamera, Foto & Smart Watch»

═══ HOME & FASHION ═══
- Sofas, armchairs, living room → «Mobilje & Dekorime» → «Sallone & Ulëse»
- Beds, mattresses, bedroom furniture → «Dhoma e Gjumit»; kitchen → «Kuzhina»; lamps → «Ndriçim»
- Shoes/sneakers → «Rroba & Këpucë» → «Këpucë»; women's clothes → «Veshje për Femra»; men's → «Veshje për Meshkuj»
- Clothing is NEVER «Muzikë & Hobby» or «Elektronikë»

═══ FËMIJË ═══
- Strollers, car seats, carriers → «Karroca & Transport»
- Diapers, baby care → «Higjienë & Kujdes»; toys → «Lodra & Lojëra»; educational toys → «Lodra Edukative»
- Maternity wear → «Veshje Shtatzënësie»; baby clothes → «Rroba & Këpucë» group under Fëmijë
- Pick the most specific femije-grp-* sub-group available

═══ SPORT & PETS ═══
- Bicycles (adult) → «Sport & Outdoor» → «Biçikleta»; fitness equipment → «Fitnes & Joga»
- Dogs for sale → «Kafshë» → «Qen»; cats → «Mace»; pet food/accessories → «Ushqim & Aksesorë për Kafshë»
- Musical instruments → «Muzikë & Hobby» → «Instrumente»

═══ NEVER ═══
- Do NOT put industrial/commercial property under Banesa & Shtëpi
- Do NOT put headphones/speakers under Televizorë
- Do NOT put motorcycles under Vetura
- Do NOT put car parts under Vetura
- Do NOT put laptops under Televizorë or Elektronikë when Kompjuterë hub fits
`.trim();

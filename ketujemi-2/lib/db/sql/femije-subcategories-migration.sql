-- Fëmijë extended subcategories (14 groups + leaves). Idempotent — skips existing slugs.
-- Existing femije-type-* rows are NOT modified.

DO $$
DECLARE
  hub_id INTEGER;
  grp_id INTEGER;
BEGIN
  SELECT id INTO hub_id FROM categories WHERE slug = 'femije' LIMIT 1;
  IF hub_id IS NULL THEN
    RAISE EXCEPTION 'Hub femije not found';
  END IF;

  -- Group: Karroca & Transport
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-karroca-transport') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karroca & Transport', 'femije-grp-karroca-transport', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-karroca-transport' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karroca-klasike') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karroca klasike', 'femije-leaf-karroca-klasike', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karroca-cader') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karroca çadër', 'femije-leaf-karroca-cader', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karroca-binjake') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karroca për binjakë', 'femije-leaf-karroca-binjake', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-sisteme-udhetimi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sisteme udhëtimi (karroca + karrige makine)', 'femije-leaf-sisteme-udhetimi', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-makine-grupe') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige makine (grup 0+, 1, 2/3)', 'femije-leaf-karrige-makine-grupe', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mbajtese-bebe') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mbajtëse bebe (kangaroo, wrap, sling)', 'femije-leaf-mbajtese-bebe', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-aksesore-karroce') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Aksesorë karroce (çadra, mbulesë shiu, çanta)', 'femije-leaf-aksesore-karroce', 'Baby', grp_id);
  END IF;

  -- Group: Krevat & Dhomë Fëmijësh
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-krevat-dhome') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Krevat & Dhomë Fëmijësh', 'femije-grp-krevat-dhome', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-krevat-dhome' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-krevate-djepa') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Krevatë & Djepa (krevat druri, djep lëkundës, krevat udhëtimi)', 'femije-leaf-krevate-djepa', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-dysheke-tekstile') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Dyshekë & Tekstile (dyshekë, çarçafë, jastëkë, batanije)', 'femije-leaf-dysheke-tekstile', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mobilje-dhome') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mobilje (dollap, komodë pelene, rafte lodra)', 'femije-leaf-mobilje-dhome', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-dekorime-drita') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Dekorime & Drita nate', 'femije-leaf-dekorime-drita', 'Baby', grp_id);
  END IF;

  -- Group: Ushqyerja & Ushqimi
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-ushqyerja-ushqimi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Ushqyerja & Ushqimi', 'femije-grp-ushqyerja-ushqimi', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-ushqyerja-ushqimi' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-shishe-biberon') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Shishe & Biberon', 'femije-leaf-shishe-biberon', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-pompe-gjiri') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pompë gjiri (elektrike & manuale)', 'femije-leaf-pompe-gjiri', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-ushqimi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige ushqimi (high chair, portative, të palosshme)', 'femije-leaf-karrige-ushqimi', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-sterilizues-ngrohes') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sterilizues & Ngrohës shishesh', 'femije-leaf-sterilizues-ngrohes', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-ene-luge') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Enë & Lugë fëmijësh', 'femije-leaf-ene-luge', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-ushqim-bebe') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Ushqim bebe & Snacks', 'femije-leaf-ushqim-bebe', 'Baby', grp_id);
  END IF;

  -- Group: Higjienë & Kujdes
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-higjiene-kujdes') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Higjienë & Kujdes', 'femije-grp-higjiene-kujdes', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-higjiene-kujdes' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-pelene-njeperdorimshme') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pelenë njëpërdorimshme', 'femije-leaf-pelene-njeperdorimshme', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-pelene-riperdorshme') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pelenë të ripërdorshme', 'femije-leaf-pelene-riperdorshme', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lecke-topth') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Leckë & Topth pelene', 'femije-leaf-lecke-topth', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-vaske-banjoje') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Vaskë banjoje foshnjeje', 'femije-leaf-vaske-banjoje', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-produkte-lekure') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Produkte lëkure (krem, shampo, vaj masazhi)', 'femije-leaf-produkte-lekure', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-termometer-pajisje') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Termometër & Pajisje shëndetësore', 'femije-leaf-termometer-pajisje', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-aspirator-kujdes') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Aspirator hundësh & Kujdes i përditshëm', 'femije-leaf-aspirator-kujdes', 'Baby', grp_id);
  END IF;

  -- Group: Rroba & Këpucë Fëmijësh
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-rroba-kepuce') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Rroba & Këpucë Fëmijësh', 'femije-grp-rroba-kepuce', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-rroba-kepuce' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-rroba-foshnjeje') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Rroba foshnjeje (0-12 muaj)', 'femije-leaf-rroba-foshnjeje', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-rroba-vegjelish') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Rroba vegjëlish (1-5 vjeç)', 'femije-leaf-rroba-vegjelish', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-rroba-shkollore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Rroba shkollore (6-14 vjeç)', 'femije-leaf-rroba-shkollore', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-veshje-dimri') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Veshje dimri (pallto, xhaketa, kostume)', 'femije-leaf-veshje-dimri', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-veshje-vere') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Veshje vere', 'femije-leaf-veshje-vere', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kepuce-foshnjeje') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Këpucë foshnjeje (hapat e parë)', 'femije-leaf-kepuce-foshnjeje', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kepuce-femijesh') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Këpucë fëmijësh (sportive, çizme, sandale)', 'femije-leaf-kepuce-femijesh', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-aksesore-rroba') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Aksesorë (kapele, doreza, shall, çanta shkolle)', 'femije-leaf-aksesore-rroba', 'Baby', grp_id);
  END IF;

  -- Group: Lodra & Lojëra
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-lodra-lojera') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra & Lojëra', 'femije-grp-lodra-lojera', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-lodra-lojera' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-klasike') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra klasike (kukulla, figura, makina, trena)', 'femije-leaf-lodra-klasike', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lojera-shoqerore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lojëra shoqërore (lojëra tavoline, puzzle, kartela)', 'femije-leaf-lojera-shoqerore', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-elektronike') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra elektronike (me bateri, tableta fëmijësh)', 'femije-leaf-lodra-elektronike', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-banjo') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra banje & pishinë', 'femije-leaf-lodra-banjo', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kostume-loje') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Kostume & veshje loje', 'femije-leaf-kostume-loje', 'Baby', grp_id);
  END IF;

  -- Group: Lodra Edukative
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-lodra-edukative') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra Edukative', 'femije-grp-lodra-edukative', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-lodra-edukative' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-montessori') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra Montessori', 'femije-leaf-lodra-montessori', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-blloqe-lego') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Blloqe ndërtimi & Lego', 'femije-leaf-blloqe-lego', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-muzikore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra muzikore', 'femije-leaf-lodra-muzikore', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-tapete-sensor') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Tapete loje & Stimulim sensor', 'femije-leaf-tapete-sensor', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-puzzle-edukative') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lojëra logjike & Puzzle edukative', 'femije-leaf-puzzle-edukative', 'Baby', grp_id);
  END IF;

  -- Group: Libra & Materiale Shkollore
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-libra-shkollore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Libra & Materiale Shkollore', 'femije-grp-libra-shkollore', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-libra-shkollore' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-libra-perralla') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Libra me figura & Përralla (0-6 vjeç)', 'femije-leaf-libra-perralla', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-libra-edukative') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Libra edukativë (7-14 vjeç)', 'femije-leaf-libra-edukative', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-libra-shkollor') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Libra shkollor', 'femije-leaf-libra-shkollor', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-fletore-materiale') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Fletore & Materiale shkolle', 'femije-leaf-fletore-materiale', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mjete-vizatimi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mjete vizatimi & Pikturimi', 'femije-leaf-mjete-vizatimi', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-canta-shkolle') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Çanta shkolle', 'femije-leaf-canta-shkolle', 'Baby', grp_id);
  END IF;

  -- Group: Aktivitet & Sport Fëmijësh
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-aktivitet-sport') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Aktivitet & Sport Fëmijësh', 'femije-grp-aktivitet-sport', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-aktivitet-sport' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-bicikleta') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Biçikleta fëmijësh', 'femije-leaf-bicikleta', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-trotinet-skiro') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Trotineta & Skiro', 'femije-leaf-trotinet-skiro', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-shpatulla-patina') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Shpatulla & Patina', 'femije-leaf-shpatulla-patina', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-trampoline') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Trampolinë & Rrëshqitëse', 'femije-leaf-trampoline', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lekundshe-kopsht') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lëkundshe & Lojëra kopshti', 'femije-leaf-lekundshe-kopsht', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-topa-sport') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Topa & Pajisje sportive', 'femije-leaf-topa-sport', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kostume-sporti') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Kostume sporti', 'femije-leaf-kostume-sporti', 'Baby', grp_id);
  END IF;

  -- Group: Karrige & Ulëse Bebe
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-karrige-ulese') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige & Ulëse Bebe', 'femije-grp-karrige-ulese', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-karrige-ulese' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-ushqimi-larte') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige ushqimi të larta', 'femije-leaf-karrige-ushqimi-larte', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-ushqimi-portative') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige ushqimi portative', 'femije-leaf-karrige-ushqimi-portative', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-makine-0') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige makine grup 0+ (0-13 kg)', 'femije-leaf-karrige-makine-0', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-makine-1') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige makine grup 1 (9-18 kg)', 'femije-leaf-karrige-makine-1', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-karrige-makine-23') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Karrige makine grup 2/3 (15-36 kg)', 'femije-leaf-karrige-makine-23', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-ulese-ngritese') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Ulëse ngritëse (booster seat)', 'femije-leaf-ulese-ngritese', 'Baby', grp_id);
  END IF;

  -- Group: Çanta & Aksesorë Nënë
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-canta-nene') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Çanta & Aksesorë Nënë', 'femije-grp-canta-nene', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-canta-nene' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-canta-shpine') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Çanta shpine për foshnje (diaper bag)', 'femije-leaf-canta-shpine', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-canta-dore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Çanta dore për foshnje', 'femije-leaf-canta-dore', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-organizatore-karroce') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Organizatorë karroce', 'femije-leaf-organizatore-karroce', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mbajtese-shishesh') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mbajtëse shishesh', 'femije-leaf-mbajtese-shishesh', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mbulesa-shi-diell') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mbulesa shi & dielli për karrocë', 'femije-leaf-mbulesa-shi-diell', 'Baby', grp_id);
  END IF;

  -- Group: Veshje Shtatzënësie
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-veshje-shtatzanise') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Veshje Shtatzënësie', 'femije-grp-veshje-shtatzanise', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-veshje-shtatzanise' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-fustane-shtatzanise') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Fustane shtatzënësie', 'femije-leaf-fustane-shtatzanise', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-pantallona-shtatzanise') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pantallona & Bluza shtatzënësie', 'femije-leaf-pantallona-shtatzanise', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-sutjena-gji') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sutjena & Veshje për gji', 'femije-leaf-sutjena-gji', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-breza-shtatzanise') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Breza shtatzënësie', 'femije-leaf-breza-shtatzanise', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-jastek-anatomik') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Jastëkë anatomikë për gjumë', 'femije-leaf-jastek-anatomik', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-produkte-kujdesi-shtatzanise') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Produkte kujdesi (krem kundër strijave)', 'femije-leaf-produkte-kujdesi-shtatzanise', 'Baby', grp_id);
  END IF;

  -- Group: Siguria e Fëmijëve
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-siguria') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Siguria e Fëmijëve', 'femije-grp-siguria', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-siguria' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-porta-sigurie') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Porta sigurie (shkallë & dhoma)', 'femije-leaf-porta-sigurie', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mbrojtese-kendi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mbrojtëse këndi & cepi tavolinash', 'femije-leaf-mbrojtese-kendi', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-bllokues-sirtare') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Bllokues sirtarësh & dollapësh', 'femije-leaf-bllokues-sirtare', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-mbrojtese-priza') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mbrojtëse prizash elektrike', 'femije-leaf-mbrojtese-priza', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-monitor-audio') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Monitor bebe audio', 'femije-leaf-monitor-audio', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-monitor-video') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Monitor bebe video (kamera)', 'femije-leaf-monitor-video', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-jeleke-shpetimi') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Jelekë shpëtimi fëmijësh', 'femije-leaf-jeleke-shpetimi', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kaske-biciklete') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Kaskë & Mbrojtëse biçiklete', 'femije-leaf-kaske-biciklete', 'Baby', grp_id);
  END IF;

  -- Group: Pishinë & Plazh për Fëmijë
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-grp-pishine-plazh') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pishinë & Plazh për Fëmijë', 'femije-grp-pishine-plazh', 'Baby', hub_id);
  END IF;
  SELECT id INTO grp_id FROM categories WHERE slug = 'femije-grp-pishine-plazh' LIMIT 1;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-pishina-fryra') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pishina të fryra', 'femije-leaf-pishina-fryra', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-veshje-banjo') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Veshje banje & Not', 'femije-leaf-veshje-banjo', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-jeleke-noti') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Jelekë noti fëmijësh', 'femije-leaf-jeleke-noti', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-lodra-reere') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lodra rëre & plazhi', 'femije-leaf-lodra-reere', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-kapele-uv') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Kapele dielli & Mbrojtje UV', 'femije-leaf-kapele-uv', 'Baby', grp_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'femije-leaf-krem-mbrojtes') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Kremra mbrojtës fëmijësh', 'femije-leaf-krem-mbrojtes', 'Baby', grp_id);
  END IF;

END $$;
-- Sport & Outdoor type subcategories (8 cards). Idempotent — inserts only missing slugs.
-- Run on Neon if hub cards for Ajrore / Ujit / Rekreative do not open.

DO $$
DECLARE
  hub_id INTEGER;
BEGIN
  SELECT id INTO hub_id FROM categories WHERE slug = 'sport-outdoor' LIMIT 1;
  IF hub_id IS NULL THEN
    RAISE EXCEPTION 'Hub sport-outdoor not found';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-bicikleta') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Biçikleta', 'sport-type-bicikleta', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-fitnes-joga') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Fitnes & Joga', 'sport-type-fitnes-joga', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-kampingu') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pajisje Kampingu', 'sport-type-kampingu', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-top') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sportet me Top', 'sport-type-top', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-dimerore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sportet Dimërore', 'sport-type-dimerore', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-ajrore') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sportet Ajrore', 'sport-type-ajrore', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-ujit') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Sportet e Ujit', 'sport-type-ujit', 'Dumbbell', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'sport-type-rekreative') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Rekreative & Hobby', 'sport-type-rekreative', 'Dumbbell', hub_id);
  END IF;
END $$;

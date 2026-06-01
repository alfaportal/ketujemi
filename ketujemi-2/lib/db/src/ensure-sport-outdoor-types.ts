import type pg from "pg";
import { SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./category-pexels-urls.js";

const SPORT_TYPE_BANNER_SLUGS = [
  "sport-type-ajrore",
  "sport-type-ujit",
  "sport-type-rekreative",
] as const;

/** Idempotent — inserts Sport & Outdoor type subcategories when missing (prod Neon gap). */
const SPORT_OUTDOOR_TYPES_SQL = `
DO $$
DECLARE
  hub_id INTEGER;
BEGIN
  SELECT id INTO hub_id FROM categories WHERE slug = 'sport-outdoor' LIMIT 1;
  IF hub_id IS NULL THEN
    RETURN;
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
`;

export async function ensureSportOutdoorTypeCategories(pool: pg.Pool): Promise<void> {
  await pool.query(SPORT_OUTDOOR_TYPES_SQL);

  for (const slug of SPORT_TYPE_BANNER_SLUGS) {
    const image_url = SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
    if (!image_url) continue;
    await pool.query(
      `UPDATE categories SET image_url = $1 WHERE slug = $2`,
      [image_url, slug],
    );
  }
}

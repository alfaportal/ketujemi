import type pg from "pg";
import { SUBCATEGORY_IMAGE_URL_BY_SLUG } from "./category-pexels-urls.js";

const NDERTIM_TYPE_SLUGS = [
  "ndertim-type-ndertim-murature",
  "ndertim-type-gipsi-suvatime",
  "ndertim-type-pllakosje-mozaik",
  "ndertim-type-bojatisje-dekorim",
  "ndertim-type-riparim-catie-izolim",
  "ndertim-type-riparim-dyshemeje-parket",
  "ndertim-type-riparim-dritaresh-dyerve",
  "ndertim-type-instalime-ngrohje-klima",
  "ndertim-type-instalime-kamera-alarme",
  "ndertim-type-instalime-solar-panele",
  "ndertim-type-levizje-transport",
  "ndertim-type-mirembajtje-riparime",
] as const;

/** Idempotent — inserts Ndërtim & Instalime parent + type subcategories when missing. */
const NDERTIM_INSTALIME_SQL = `
DO $$
DECLARE
  hub_id INTEGER;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-instalime') THEN
    INSERT INTO categories (name, slug, icon, parent_id)
    VALUES ('Ndërtim & Instalime', 'ndertim-instalime', 'Wrench', NULL);
  END IF;

  SELECT id INTO hub_id FROM categories WHERE slug = 'ndertim-instalime' LIMIT 1;
  IF hub_id IS NULL THEN
    RETURN;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-ndertim-murature') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Ndërtim & Muraturë', 'ndertim-type-ndertim-murature', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-gipsi-suvatime') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Gipsi & Suvatime', 'ndertim-type-gipsi-suvatime', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-pllakosje-mozaik') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Pllakosje & Mozaik', 'ndertim-type-pllakosje-mozaik', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-bojatisje-dekorim') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Bojatisje & Dekorim', 'ndertim-type-bojatisje-dekorim', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-riparim-catie-izolim') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Riparim çatie & Izolim', 'ndertim-type-riparim-catie-izolim', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-riparim-dyshemeje-parket') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Riparim dyshemeje & Parket', 'ndertim-type-riparim-dyshemeje-parket', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-riparim-dritaresh-dyerve') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Riparim dritaresh & dyerve', 'ndertim-type-riparim-dritaresh-dyerve', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-instalime-ngrohje-klima') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Instalime ngrohje & Klima', 'ndertim-type-instalime-ngrohje-klima', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-instalime-kamera-alarme') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Instalime kamera & Alarme', 'ndertim-type-instalime-kamera-alarme', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-instalime-solar-panele') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Instalime solar & Panele diellore', 'ndertim-type-instalime-solar-panele', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-levizje-transport') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Lëvizje furniture & Transport', 'ndertim-type-levizje-transport', 'Wrench', hub_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'ndertim-type-mirembajtje-riparime') THEN
    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('Mirëmbajtje & Riparime të përgjithshme', 'ndertim-type-mirembajtje-riparime', 'Wrench', hub_id);
  END IF;
END $$;
`;

export async function ensureNdertimInstalimeTypeCategories(pool: pg.Pool): Promise<void> {
  await pool.query(NDERTIM_INSTALIME_SQL);

  for (const slug of NDERTIM_TYPE_SLUGS) {
    const image_url = SUBCATEGORY_IMAGE_URL_BY_SLUG[slug];
    if (!image_url) continue;
    await pool.query(`UPDATE categories SET image_url = $1 WHERE slug = $2`, [image_url, slug]);
  }
}

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FEMIJE_EXTENDED_GROUPS, FEMIJE_HUB_SLUG } from "./femije-subcategories-catalog.js";

const __dir = dirname(fileURLToPath(import.meta.url));
const out = join(__dir, "../sql/femije-subcategories-migration.sql");

function esc(s: string): string {
  return s.replace(/'/g, "''");
}

const lines: string[] = [
  "-- Fëmijë extended subcategories (14 groups + leaves). Idempotent — skips existing slugs.",
  "-- Existing femije-type-* rows are NOT modified.",
  "",
  "DO $$",
  "DECLARE",
  "  hub_id INTEGER;",
  "  grp_id INTEGER;",
  "BEGIN",
  `  SELECT id INTO hub_id FROM categories WHERE slug = '${FEMIJE_HUB_SLUG}' LIMIT 1;`,
  "  IF hub_id IS NULL THEN",
  "    RAISE EXCEPTION 'Hub femije not found';",
  "  END IF;",
  "",
];

for (const group of FEMIJE_EXTENDED_GROUPS) {
  lines.push(`  -- Group: ${group.name}`);
  lines.push(
    `  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = '${group.slug}') THEN`,
  );
  lines.push(
    `    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('${esc(group.name)}', '${group.slug}', 'Baby', hub_id);`,
  );
  lines.push("  END IF;");
  lines.push(
    `  SELECT id INTO grp_id FROM categories WHERE slug = '${group.slug}' LIMIT 1;`,
  );
  for (const leaf of group.leaves) {
    lines.push(
      `  IF NOT EXISTS (SELECT 1 FROM categories WHERE slug = '${leaf.slug}') THEN`,
    );
    lines.push(
      `    INSERT INTO categories (name, slug, icon, parent_id) VALUES ('${esc(leaf.name)}', '${leaf.slug}', 'Baby', grp_id);`,
    );
    lines.push("  END IF;");
  }
  lines.push("");
}

lines.push("END $$;");

writeFileSync(out, lines.join("\n"), "utf8");
console.log(`Wrote ${out}`);

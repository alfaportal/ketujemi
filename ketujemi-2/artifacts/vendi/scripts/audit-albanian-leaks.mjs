#!/usr/bin/env node
/**
 * Audits user-facing Albanian leaks outside i18n bundle files.
 * Checks: ?? "Albanian" fallbacks, throw/new Error with Albanian, JSX text nodes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");

const ALLOWED_RE =
  /(?:i18n|my-listings-month-i18n|market-context|category-translations|femije-category|app-extra-i18n|\.generated\.|admin-en-i18n|dhurata-gift-pledge-i18n|femije-subcategory-guides|shop-directory-subcategory-i18n|listing-post-preflight-i18n|listing-post-feedback-i18n|report-listing-i18n|listing-limit-i18n|partner-profile-panel-i18n|wallet-bank-payment-i18n|shop-detail-i18n|shop-directory-i18n|engagement-i18n|static-pages-i18n|stripe-checkout-i18n|listing-video-upload|listing-video-prepare|pune-sherbime-search-helpers|auto-pjese|femije-subcategory-guides|secret-admin)/;

const ALB = /[ëçËÇ]|(?:Zgjidh|Shpall|dyqan|Kërko|Fshi|Ruaj|Gabim|Plotëso|Ngarko|Kthehu|Raporto|Limiti|Faleminderit|Dhurat|Anulo|Dërgo|Hyni|Portofol|përshkrim|shitës|nënkategor|Pagesa|Ndihmë|Shpërndaje)/i;

const SKIP_LINE =
  /^\s*(\/\/|import |export type|export interface|\*|\}|from ["']|console\.|data-testid|href=|pathname|\/listings\/|\/dyqani\/|=== |!== |\.name\s*===|category_name|slug:|test\(|describe\()/;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === "node_modules" || name === "dist") continue;
      walk(full, out);
    } else if (/\.(tsx|ts)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(p) {
  return path.relative(root, p).replace(/\\/g, "/");
}

const leaks = [];

for (const file of walk(srcDir)) {
  const r = rel(file);
  if (ALLOWED_RE.test(r)) continue;
  if (r.includes("/pages/admin/")) continue;

  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SKIP_LINE.test(line)) continue;

    // ?? "Albanian fallback"
    const fallback = line.match(/\?\?\s*["'`]([^"'`]+)["'`]/);
    if (fallback && ALB.test(fallback[1])) {
      leaks.push({ file: r, line: i + 1, kind: "fallback", text: fallback[1].slice(0, 72) });
      continue;
    }

    // throw new Error("Albanian")
    const err = line.match(/(?:throw new Error|title:|description:|placeholder:|aria-label:)\s*\(?\s*["'`]([^"'`]+)["'`]/);
    if (err && ALB.test(err[1]) && !line.includes("tx.") && !line.includes("t.")) {
      leaks.push({ file: r, line: i + 1, kind: "literal", text: err[1].slice(0, 72) });
      continue;
    }

    // JSX text: >Albanian<
    const jsx = line.match(/>([^<>{}\n]{6,})</);
    if (jsx && ALB.test(jsx[1]) && !line.includes("{")) {
      leaks.push({ file: r, line: i + 1, kind: "jsx", text: jsx[1].trim().slice(0, 72) });
    }
  }
}

if (leaks.length === 0) {
  console.log("✓ Albanian leak audit: CLEAN (0 issues)");
  process.exit(0);
}

console.log(`✗ Albanian leak audit: ${leaks.length} issue(s)\n`);
for (const l of leaks) {
  console.log(`  [${l.kind}] ${l.file}:${l.line}  ${JSON.stringify(l.text)}`);
}
process.exit(1);

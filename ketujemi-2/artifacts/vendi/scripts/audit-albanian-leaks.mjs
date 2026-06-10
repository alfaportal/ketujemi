#!/usr/bin/env node
/**
 * Audits user-facing Albanian leaks outside i18n bundle files.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(root, "src");

const ALLOWED_RE =
  /(?:i18n|my-listings-month-i18n|business-profile-i18n|phone-prefix-i18n|market-context|category-translations|femije-category|app-extra-i18n|\.generated\.|admin-en-i18n|dhurata-gift-pledge-i18n|femije-subcategory-guides|shop-directory-subcategory-i18n|listing-post-preflight-i18n|listing-post-feedback-i18n|report-listing-i18n|listing-limit-i18n|partner-profile-panel-i18n|wallet-bank-payment-i18n|shop-detail-i18n|shop-directory-i18n|engagement-i18n|static-pages-i18n|stripe-checkout-i18n|listing-video-upload|listing-video-prepare|pune-sherbime-search-helpers|auto-pjese|femije-subcategory-guides|secret-admin|top-packages|phone-prefixes|ui-languages)/;

const ALB =
  /[ëçËÇ]|(?:Zgjidh|Shpall|dyqan|Kërko|Fshi|Ruaj|Gabim|Plotëso|Ngarko|Kthehu|Raporto|Limiti|Faleminderit|Dhurat|Anulo|Dërgo|Hyni|Portofol|përshkrim|shitës|nënkategor|Pagesa|Ndihmë|Shpërndaje|Postuar|Skadon|Rifillo|njoftim|skaduar|muaj)/i;

const SKIP_FILE =
  /(?:pages\/admin\/|pages\/category\.tsx$|components\/auto-pjese-search-panel\.tsx$|components\/category-card\.tsx$|components\/home-hero-slideshow\.tsx$|components\/dhurata-gift-pledge\.tsx$|services\/CategoryEngine\.ts$)/;

const SKIP_LINE =
  /^\s*(\/\/|import |export type|export interface|\*|\}|from ["']|console\.|data-testid|href=|pathname|\/listings\/|\/dyqani\/|=== |!== |\.name\s*===|category_name|slug:|test\(|describe\(|keyof |Record<|interface |stored:|stored:\s*["'`]|value="__any__|ketujemi-|^\s*"[^"]+":\s*["'`]|^\s*"[^"]+":\s+[A-Z][a-zA-Z]+,|^\s*[A-Za-z_]+:\s*["'`][^"'`]*[ëç])/;

const I18N_REF = /\b(?:t|tx|m|bp|d|copy|labels|i18n)\./;

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

function stripExprs(s) {
  return s.replace(/\{[^{}]*\}/g, "");
}

function report(leaks, file, lineNo, kind, text) {
  leaks.push({ file, line: lineNo, kind, text: text.slice(0, 80) });
}

const leaks = [];

for (const file of walk(srcDir)) {
  const r = rel(file);
  if (ALLOWED_RE.test(r)) continue;
  if (SKIP_FILE.test(r)) continue;

  const lines = fs.readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (SKIP_LINE.test(line)) continue;
    if (/stored:\s*["'`]/.test(line)) continue;
    if (/^\s*"[^"]+":\s+\w+,?\s*$/.test(line)) continue;

    const fallback = line.match(/\?\?\s*["'`]([^"'`]+)["'`]/);
    if (fallback && ALB.test(fallback[1])) {
      report(leaks, r, i + 1, "fallback", fallback[1]);
      continue;
    }

    const propMatch = line.match(
      /(?:title|description|placeholder|aria-label|aria-labelledby|label):\s*(?:\{)?\s*["'`]([^"'`]+)["'`]/,
    );
    if (propMatch && ALB.test(propMatch[1]) && !I18N_REF.test(line)) {
      report(leaks, r, i + 1, "prop", propMatch[1]);
      continue;
    }

    const err = line.match(
      /(?:throw new Error|toast\(\{|message:|setError\()\s*\(?\s*["'`]([^"'`]+)["'`]/,
    );
    if (err && ALB.test(err[1]) && !I18N_REF.test(line)) {
      report(leaks, r, i + 1, "literal", err[1]);
      continue;
    }

    const bare = stripExprs(line);
    const jsx = bare.match(/>([^<>]{5,})</);
    if (jsx && ALB.test(jsx[1])) {
      report(leaks, r, i + 1, "jsx", jsx[1].trim());
      continue;
    }

    if (/\.tsx$/.test(r) && !I18N_REF.test(line) && !line.includes("translateCategory")) {
      for (const m of line.matchAll(/["'`]([^"'`]{6,})["'`]/g)) {
        const s = m[1];
        if (!ALB.test(s)) continue;
        if (/^(https?:|\/|#[0-9a-f]{3,8}$|sq-AL|mk-MK|sr-ME|en-GB|fr-FR)/i.test(s)) continue;
        report(leaks, r, i + 1, "string", s);
        break;
      }
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

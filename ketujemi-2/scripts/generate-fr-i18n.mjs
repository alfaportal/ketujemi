/**
 * Generates French UI bundles from English sources.
 * Run: node ketujemi-2/scripts/generate-fr-i18n.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyFrenchPhrases } from "./french-phrases.mjs";
import { PAGE_I18N_FR } from "./page-i18n-fr-phrases.mjs";
import { STATIC_PAGE_FR } from "./static-page-fr-phrases.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const vendiLib = path.join(root, "artifacts", "vendi", "src", "lib");

function escapeTs(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");
}

function unescapeTsString(raw) {
  return raw.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'");
}

function parseRecordEntries(body) {
  const byKey = new Map();
  const add = (key, value) => {
    if (key && value !== undefined) byKey.set(key, unescapeTsString(value));
  };
  const multiRe = /^\s+(\w+):\s*\n\s*(["'])((?:\\.|(?!\2)[\s\S])*?)\2,?\s*$/gm;
  let m;
  while ((m = multiRe.exec(body)) !== null) add(m[1], m[3]);
  const singleRe = /^\s+(\w+):\s*(["'])((?:\\.|(?!\2)[^\\2])*)\2,?\s*$/gm;
  while ((m = singleRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[3]);
  }
  const backtickRe = /^\s+(\w+):\s*`([\s\S]*?)`,?\s*$/gm;
  while ((m = backtickRe.exec(body)) !== null) {
    if (!byKey.has(m[1])) add(m[1], m[2]);
  }
  return [...byKey.entries()].map(([key, value]) => ({ key, value }));
}

function parseConstObject(filePath, constName) {
  const src = fs.readFileSync(filePath, "utf8");
  const start = findConstStart(src, constName);
  if (start < 0) return [];
  const open = src.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return parseRecordEntries(src.slice(open + 1, i));
    }
  }
  return [];
}

function findConstStart(src, constName) {
  for (const prefix of ["", "export "]) {
    const idx = src.indexOf(`${prefix}const ${constName}`);
    if (idx >= 0) return idx;
  }
  return -1;
}

function extractConstBlock(src, constName) {
  const start = findConstStart(src, constName);
  if (start < 0) return null;
  const semi = src.indexOf("};", start);
  if (semi < 0) return null;
  return src.slice(start, semi + 2);
}

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;

function translateValue(raw) {
  const text = raw.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (PAGE_I18N_FR[text]) return PAGE_I18N_FR[text];
  if (STATIC_PAGE_FR[text]) return STATIC_PAGE_FR[text];
  const tokens = [];
  const masked = text.replace(PLACEHOLDER_RE, (m) => {
    const id = `__PH${tokens.length}__`;
    tokens.push(m);
    return id;
  });
  let out = applyFrenchPhrases(masked);
  tokens.forEach((ph, i) => {
    out = out.split(`__PH${i}__`).join(ph);
  });
  return out;
}

function translateTsStringLiterals(chunk) {
  const tr = (inner) => escapeTs(translateValue(inner));
  let out = chunk.replace(
    /^(\s+)(\w+):\s*"((?:\\.|[^"\\])*)"/gm,
    (_, indent, key, inner) => `${indent}${key}: "${tr(inner)}"`,
  );
  out = out.replace(
    /^(\s+)"((?:\\.|[^"\\])*)",?\s*$/gm,
    (_, indent, inner) => `${indent}"${tr(inner)}",`,
  );
  out = out.replace(
    /:\s*\[\s*"((?:\\.|[^"\\])*)"\s*\]/g,
    (_, inner) => `: ["${tr(inner)}"]`,
  );
  return out;
}

const FR_KEY_OVERRIDES = {
  login_heading: "Connexion",
  login_heading_register: "Inscription",
  login_mode_login: "Connexion",
  login_mode_register: "Inscription",
  login_submit_login: "Connexion",
  login_submit_register: "Créer un compte",
  login_welcomeBack: "Bon retour !",
  login_forgotPassword: "Mot de passe oublié ? Réinitialiser par e-mail",
  login_forgotHint: "Saisissez votre e-mail — nous enverrons un code pour définir un nouveau mot de passe.",
  login_resetHint: "Saisissez le code reçu par e-mail et votre nouveau mot de passe.",
  login_forgotBtn: "Envoyer le code",
  login_resetBtn: "Enregistrer le nouveau mot de passe",
  login_backToSignin: "← Retour à e-mail + mot de passe",
  login_passwordResetDone: "Mot de passe mis à jour. Vous êtes connecté.",
  login_sub_login: "Saisissez votre e-mail ou téléphone et mot de passe.",
  login_sub_register: "E-mail ou téléphone + mot de passe uniquement. Quelques secondes.",
  login_sub_email_only: "Connectez-vous ou inscrivez-vous avec e-mail et mot de passe.",
  login_sub_login_email_verify:
    "Saisissez e-mail et mot de passe — vous recevrez un code par e-mail, puis connectez-vous.",
  login_sub_register_email_verify:
    "Inscrivez-vous par e-mail. Vous recevrez un code de confirmation par e-mail.",
  login_sub_register_email_only:
    "Nouveau compte : code par e-mail. Déjà inscrit ? E-mail + mot de passe — connexion immédiate.",
  login_smsDisabledHint:
    "La connexion par téléphone n'est pas active. Inscrivez-vous par e-mail (comptes existants aussi — vous recevrez un code).",
  login_stripeBody:
    "L'ajout d'une carte bancaire comme moyen de paiement sera bientôt disponible via Stripe. Pour l'instant, connectez-vous uniquement par e-mail ou SMS.",
  login_sub: "Pour publier des annonces, utilisez e-mail + mot de passe ou vérification SMS (Vonage).",
  nav_menuAria: "Ouvrir le menu",
  nav_menuTitle: "Menu",
  nav_home: "Accueil",
  nav_postShort: "Publier",
  nav_myProfile: "Mon profil",
  nav_myListings: "Mes annonces",
  home_partnerHeading: "Nos partenaires de confiance",
  home_partnerEmptySignupVip: "S'inscrire comme partenaire VIP",
  home_partnerEmptySignupStandard: "S'inscrire comme partenaire",
  home_categoriesLoadError: "Les catégories n'ont pas pu être chargées. Actualisez la page.",
  home_topListingsHeading: "ANNONCES TOP",
  home_topListingsRowLabel: "ANNONCES TOP",
  nf_title: "Page introuvable",
  nf_body: "Cette page n'existe pas ou a été déplacée. Vérifiez l'adresse et réessayez.",
  ui_emptyListingsSubLong:
    "Soyez le premier à publier dans cette catégorie et touchez des milliers d'acheteurs potentiels !",
  ui_walletPerListing: "1 annonce = 0,30 € du solde",
  ui_walletCreditHint: "Le crédit n'expire pas — dépensez jusqu'à épuisement (0,30 €/annonce)",
  ui_walletListingsRemaining: "Annonces restantes",
  ui_supportChatTitle: "Aide",
  ui_payByCard: "Payer par carte",
  ui_packagesContinuePost: "Vous pouvez continuer à publier votre annonce.",
  ui_categorySuggestPick: "Choisir cette catégorie",
  ui_giftPledgeLegal:
    'En cliquant sur « Continuer », vous acceptez l\'entière responsabilité légale pour l\'exactitude de votre annonce.',
  ui_giftCategoryPriceNote: "Dans cette catégorie le prix est toujours 0 €.",
  ui_walletTopupLimit: "Vous avez atteint la limite gratuite. Rechargez votre portefeuille (0,30 € par annonce).",
  ui_walletPostSuccess: "Annonce publiée. Solde : {balance} € — {remaining} annonces restantes.",
  ui_walletExtraPostCost:
    "Vous avez atteint la limite gratuite. Chaque annonce supplémentaire coûte {price} € depuis votre portefeuille.",
  ui_sellLangBlocked: 'Langage de vente non autorisé dans « Je recherche » (mot interdit : « {word} »).',
  ui_contentModerationFail: "Le contenu n'a pas passé la vérification automatique.",
  ui_bankPaymentLogin: "Connectez-vous pour voir les instructions de paiement.",
  ui_bankPaymentNotFound: "Paiement introuvable ou virement bancaire non actif.",
  ui_bankPaymentTitle: "Virement bancaire (Kosovo)",
  ui_bankPaymentSub: "Virement bancaire pour recharger le portefeuille",
  ui_beneficiaryLabel: "Bénéficiaire",
  ui_reportProblemPh: "Décrivez le problème…",
  ui_streetAddressPh: "Rue, numéro…",
  ui_postGiftBtn: "🎁 Publier un don →",
  ui_postRequestBtn: "Publier une demande",
  ui_paymentMethodsAria: "Modes de paiement",
  ui_diasporaMarketsTitle: "Allemagne, Suisse, Autriche, France, Italie, Royaume-Uni, États-Unis, Monténégro",
  lz_country_any: "Tous les pays",
  lz_country_lbl: "Pays",
  lz_country_ph: "Sélectionner un pays",
  ak_lang_fr: "Français",
  ak_panel_title: "Éducation et cours",
  ak_panel_sub: "Trouvez des cours, cours particuliers, formations et programmes éducatifs.",
  ak_search_btn: "🔍 Rechercher des cours",
  ak_fld_category: "Choisir la catégorie",
  ak_fld_subcategory: "Choisir la sous-catégorie",
  ak_fld_city: "Ville",
  ak_select_category_ph: "Choisir la catégorie…",
  ak_select_subcategory_ph: "Choisir la sous-catégorie…",
  ak_select_city_ph: "Choisir la ville…",
  hub_banesa_sub:
    "Sélectionnez le type de transaction, le type de bien et les filtres — les résultats se mettent à jour automatiquement dans la liste ci-dessous.",
  hub_drill_pick_type:
    "Choisissez la catégorie — chaque sélection ouvre une nouvelle page avec des filtres.",
  so_type_pick_hint:
    "Choisissez ce que vous recherchez — chaque option ouvre une page avec filtres et annonces.",
  hub_pickBrandLbl: "Choisir la marque",
  hub_pickModelLbl: "Choisir le modèle",
  hub_model_pickBrandFirst: "Choisissez d'abord une marque",
  hub_model_pickBrandOrBody: "Choisir la marque ou le type de carrosserie",
  login_phoneIntro: "Saisissez le numéro au format international (p. ex. +383…).",
  lz_panel_sub: "Rechercher locaux commerciaux, bureaux, entrepôts, locaux industriels et garages.",
  lz_sec_office_count: "Nombre de bureaux",
  profile_add_email_ok: "E-mail ajouté et vérifié.",
  profile_add_phone_ok: "Téléphone ajouté et vérifié.",
  ps_st_lirim_banesash: "Libération d'appartements et de bureaux",
  reg_sellerGate_save: "Enregistrer et continuer",
  shop_apply_gate_start: "Confirmer et continuer la demande",
  shop_edit_gate_start: "Confirmer et modifier la boutique",
  so_intro_martial: "Parapente, drones, casques et sangles de sécurité.",
  so_intro_winter: "Ski, snowboard, vêtements thermiques et lunettes.",
};

function toFrench(key, enValue) {
  if (FR_KEY_OVERRIDES[key]) return FR_KEY_OVERRIDES[key];
  if (PAGE_I18N_FR[enValue]) return PAGE_I18N_FR[enValue];
  if (STATIC_PAGE_FR[enValue]) return STATIC_PAGE_FR[enValue];
  return translateValue(enValue);
}

function formatRecordBody(entries) {
  return entries
    .map(({ key, value }) => {
      const v =
        value.includes("\n") || value.length > 120
          ? `\`${value.replace(/`/g, "\\`")}\``
          : `"${escapeTs(value)}"`;
      return `  ${key}: ${v},`;
    })
    .join("\n");
}

// ── app-extra-i18n-fr.ts (full FR_EXTRA from EN_EXTRA) ───────────────────────
const enExtraPath = path.join(vendiLib, "app-extra-i18n-en.ts");
const enEntries = parseConstObject(enExtraPath, "EN_EXTRA");
const frEntries = enEntries
  .sort((a, b) => a.key.localeCompare(b.key))
  .map(({ key, value }) => ({ key, value: toFrench(key, value) }));

const frExtraPath = path.join(vendiLib, "app-extra-i18n-fr.ts");
fs.writeFileSync(
  frExtraPath,
  `/** Auto-generated — run ketujemi-2/scripts/generate-fr-i18n.mjs */\nexport const FR_EXTRA: Record<string, string> = {\n${formatRecordBody(frEntries)}\n};\n`,
  "utf8",
);
console.log(`Wrote ${frExtraPath} (${frEntries.length} keys)`);

// ── static-pages-i18n-fr.ts (hand-built via build-static-fr.mjs) ─────────────
import { spawnSync } from "node:child_process";
const buildStatic = path.join(__dirname, "build-static-fr.mjs");
if (fs.existsSync(buildStatic)) {
  spawnSync(process.execPath, [buildStatic], { stdio: "inherit" });
}

// ── arsim / sport FR consts ────────────────────────────────────────────────────
const enAk = parseConstObject(path.join(vendiLib, "arsim-kurse-form-i18n.ts"), "EN_AK");
const enSo = parseConstObject(path.join(vendiLib, "sport-outdoor-device-i18n.ts"), "EN_SO");
const frAk = enAk.map(({ key, value }) => ({ key, value: toFrench(key, value) }));
const frSo = enSo.map(({ key, value }) => ({ key, value: toFrench(key, value) }));

function formatTypedRecord(name, entries, typeRef) {
  return `const ${name}: ${typeRef} = {\n${formatRecordBody(entries)}\n};\nexport const FR_${name}_FORM = ${name};`;
}

const akPath = path.join(vendiLib, "arsim-kurse-form-i18n.ts");
let akSrc = fs.readFileSync(akPath, "utf8");
if (!akSrc.includes("export const FR_AK_FORM") && frAk.length > 0) {
  const frAkBlock = `const FR_AK: Record<keyof typeof KS, string> = {\n${formatRecordBody(frAk)}\n};\nexport const FR_AK_FORM = FR_AK;\n`;
  akSrc = akSrc.replace("export const EN_AK_FORM = EN_AK;", `${frAkBlock}export const EN_AK_FORM = EN_AK;`);
  fs.writeFileSync(akPath, akSrc, "utf8");
  console.log("Updated arsim-kurse-form-i18n.ts with FR_AK_FORM");
}

const soPath = path.join(vendiLib, "sport-outdoor-device-i18n.ts");
let soSrc = fs.readFileSync(soPath, "utf8");
if (!soSrc.includes("export const FR_SO_DEVICE")) {
  const frSoBlock = `const FR_SO: Record<keyof typeof KS, string> = {\n${formatRecordBody(frSo)}\n};\nexport const FR_SO_DEVICE = FR_SO;\n`;
  soSrc = soSrc.replace("export const EN_SO_DEVICE = EN_SO;", `${frSoBlock}export const EN_SO_DEVICE = EN_SO;`);
  fs.writeFileSync(soPath, soSrc, "utf8");
  console.log("Updated sport-outdoor-device-i18n.ts with FR_SO_DEVICE");
}

// ── Page i18n files: EN block → FR block ─────────────────────────────────────
const PAGE_FILES = [
  "shop-application-i18n.ts",
  "shop-detail-i18n.ts",
  "shop-dashboard-i18n.ts",
  "open-shop-page-i18n.ts",
  "advertise-page-i18n.ts",
  "vip-packages-page-i18n.ts",
  "partner-page-i18n.ts",
  "partner-profile-i18n.ts",
];

function patchPageI18n(fileName) {
  const filePath = path.join(vendiLib, fileName);
  let src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("fr: FR") && !src.includes("fr: EN")) return;

  const enBlock = extractConstBlock(src, "EN");
  if (!enBlock) {
    console.warn(`No EN block in ${fileName}`);
    return;
  }

  let frBlock = enBlock.replace(/^((?:export )?)const EN:/, "$1const FR:");
  frBlock = frBlock.replace(/\.\.\.KS,\s*/, "...EN,\n  ");
  frBlock = translateTsStringLiterals(frBlock);

  if (!src.includes("const FR:")) {
    src = src.replace(enBlock, `${enBlock}\n\n${frBlock}`);
  } else {
    const oldFr = extractConstBlock(src, "FR");
    if (oldFr) src = src.replace(oldFr, frBlock);
  }
  src = src.replace("fr: EN,", "fr: FR,");
  fs.writeFileSync(filePath, src, "utf8");
  console.log(`Patched ${fileName}`);
}

for (const f of PAGE_FILES) patchPageI18n(f);

// ── app-extra-i18n.ts — wire FR bundle without EN spread ───────────────────────
const extraPath = path.join(vendiLib, "app-extra-i18n.ts");
let extraSrc = fs.readFileSync(extraPath, "utf8");
if (!extraSrc.includes("FR_AK_FORM")) {
  extraSrc = extraSrc.replace(
    'import { EN_AK_FORM } from "./arsim-kurse-form-i18n";',
    'import { EN_AK_FORM, FR_AK_FORM } from "./arsim-kurse-form-i18n";',
  );
}
if (!extraSrc.includes("FR_SO_DEVICE")) {
  extraSrc = extraSrc.replace(
    'import { EN_SO_DEVICE } from "./sport-outdoor-device-i18n";',
    'import { EN_SO_DEVICE, FR_SO_DEVICE } from "./sport-outdoor-device-i18n";',
  );
}
extraSrc = extraSrc.replace(
  /fr: \{ \.\.\.EN_EXTRA, \.\.\.EN_SO_DEVICE, \.\.\.EN_AK_FORM, \.\.\.FR_EXTRA \}/,
  "fr: { ...FR_EXTRA, ...FR_SO_DEVICE, ...FR_AK_FORM }",
);
fs.writeFileSync(extraPath, extraSrc, "utf8");
console.log("Updated app-extra-i18n.ts fr bundle");

console.log("Done.");

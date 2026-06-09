/**
 * Albanian (sq) → French — source is always Albanian UI text.
 * Pipeline: direct sq→fr phrases, then sq→en→fr (phrase + word level).
 */
import { applyEnglishPhrases, EN_PHRASES } from "./english-phrases.mjs";
import { applyFrenchPhrases } from "./french-phrases.mjs";
import { PAGE_I18N_FR } from "./page-i18n-fr-phrases.mjs";
import { STATIC_PAGE_FR } from "./static-page-fr-phrases.mjs";

const ALBANIAN_CHARS = /[ëçËÇ]/;

export function englishToFrench(en) {
  if (STATIC_PAGE_FR[en]) return STATIC_PAGE_FR[en];
  if (PAGE_I18N_FR[en]) return PAGE_I18N_FR[en];
  return applyFrenchPhrases(en);
}

/** sq phrase → fr phrase (from EN_PHRASES pipeline). */
export const SQ_FR_PHRASES = EN_PHRASES.map(([sq, en]) => [sq, englishToFrench(en)]);

/** Extra direct sq→fr (UI labels). */
const SQ_FR_EXTRA = [
  ["Kryefaqja", "Accueil"],
  ["Kyçu", "Connexion"],
  ["Regjistrohu", "S'inscrire"],
  ["Menyja", "Menu"],
  ["Hap menyunë", "Ouvrir le menu"],
  ["Ndihmë", "Aide"],
  ["Kërko", "Rechercher"],
  ["Posto", "Publier"],
  ["Posto Njoftim", "Publier une annonce"],
  ["Njoftime", "Annonces"],
  ["Njoftimet e mia", "Mes annonces"],
  ["Profili", "Mon profil"],
  ["Të gjitha", "Tout"],
  ["Të gjitha shtetet", "Tous les pays"],
  ["Qyteti", "Ville"],
  ["Vendi", "Pays"],
  ["Çmimi", "Prix"],
  ["Përshkrimi", "Description"],
  ["Detajet", "Détails"],
  ["Kategoria", "Catégorie"],
  ["Nënkategoria", "Sous-catégorie"],
  ["Filtri", "Filtres"],
  ["Apliko", "Appliquer"],
  ["Pastro", "Effacer"],
  ["Ruaj", "Enregistrer"],
  ["Anulo", "Annuler"],
  ["Fshi", "Supprimer"],
  ["Edito", "Modifier"],
  ["Kthehu", "Retour"],
  ["Dyqani", "Boutique"],
  ["Dyqanet", "Boutiques"],
  ["Shitësi", "Vendeur"],
  ["Blerësi", "Acheteur"],
  ["Me marrëveshje", "Négociable"],
  ["Falas", "Gratuit"],
  ["Kontakti", "Contact"],
  ["Telefoni", "Téléphone"],
  ["Emaili", "E-mail"],
  ["Adresa", "Adresse"],
  ["Harta", "Carte"],
  ["Rreth dyqanit", "À propos de la boutique"],
  ["Hap dyqanin", "Ouvrir la boutique"],
  ["Apliko për dyqan", "Demander une boutique"],
  ["Partnerët tanë të besuar", "Nos partenaires de confiance"],
  ["TOP Njoftime", "ANNONCES TOP"],
  ["Plotëso", "Remplir"],
  ["Dërgo", "Envoyer"],
  ["Konfirmo", "Confirmer"],
  ["Vazhdo", "Continuer"],
  ["Gabim", "Erreur"],
  ["Sukses", "Succès"],
  ["Duke u ngarkuar", "Chargement"],
  ["Nuk u gjet", "Introuvable"],
  ["Kosovë", "Kosovo"],
  ["Shqipëri", "Albanie"],
  ["Maqedoni e Veriut", "Macédoine du Nord"],
  ["Mal i Zi", "Monténégro"],
  ["Gjermania", "Allemagne"],
  ["Zvicra", "Suisse"],
  ["Austria", "Autriche"],
  ["Francë", "France"],
  ["Itali", "Italie"],
  ["Angli", "Royaume-Uni"],
  ["SHBA", "États-Unis"],
  ["Zgjidh kategorinë", "Choisir la catégorie"],
  ["Zgjidh nënkategorinë", "Choisir la sous-catégorie"],
  ["Kërkoj punë", "Recherche d'emploi"],
  ["Kërkoj të Blej", "Je recherche à acheter"],
  ["PROGRAMI PARTNER", "PROGRAMME PARTENAIRE"],
  ["PËRFITIMET TUAJA", "VOS AVANTAGES"],
  ["FORMULARI I APLIKIMIT", "FORMULAIRE DE CANDIDATURE"],
];

const ALL_SQ_FR = [...SQ_FR_PHRASES, ...SQ_FR_EXTRA];

/** Key-level overrides (UI bundle keys). */
export const FR_KEY_FROM_SQ = {
  login_heading: "Connexion",
  login_heading_register: "Inscription",
  login_mode_login: "Connexion",
  login_mode_register: "Inscription",
  login_submit_login: "Connexion",
  login_submit_register: "Créer un compte",
  nav_menuAria: "Ouvrir le menu",
  nav_menuTitle: "Menu",
  nav_home: "Accueil",
  nav_postShort: "Publier",
  nav_myProfile: "Mon profil",
  nav_myListings: "Mes annonces",
  nf_title: "Page introuvable",
  home_topListingsHeading: "ANNONCES TOP",
  ak_lang_fr: "Français",
  login_phoneVerifyHint: "Saisissez le code reçu par SMS.",
};

const PLACEHOLDER_RE = /\{[a-zA-Z0-9_]+\}/g;

export function applyAlbanianFrenchPhrases(text) {
  if (!text || typeof text !== "string") return text;
  let s = text;
  const sorted = [...ALL_SQ_FR].sort((a, b) => b[0].length - a[0].length);
  for (const [sq, fr] of sorted) {
    if (sq.includes("\\b")) {
      s = s.replace(new RegExp(sq, "gi"), fr);
    } else if (s.includes(sq)) {
      s = s.split(sq).join(fr);
    }
  }
  return s;
}

function sqToEnglish(text) {
  return applyEnglishPhrases(text);
}

export function albanianToFrench(key, sqText) {
  if (FR_KEY_FROM_SQ[key]) return FR_KEY_FROM_SQ[key];
  if (STATIC_PAGE_FR[sqText]) return STATIC_PAGE_FR[sqText];
  if (PAGE_I18N_FR[sqText]) return PAGE_I18N_FR[sqText];

  const tokens = [];
  const masked = sqText.replace(PLACEHOLDER_RE, (m) => {
    const id = `__PH${tokens.length}__`;
    tokens.push(m);
    return id;
  });

  let out = applyAlbanianFrenchPhrases(masked);

  if (ALBANIAN_CHARS.test(out)) {
    out = englishToFrench(sqToEnglish(masked));
  }

  if (ALBANIAN_CHARS.test(out)) {
    out = applyAlbanianFrenchPhrases(englishToFrench(sqToEnglish(out)));
  }

  tokens.forEach((ph, i) => {
    out = out.split(`__PH${i}__`).join(ph);
  });
  return out;
}

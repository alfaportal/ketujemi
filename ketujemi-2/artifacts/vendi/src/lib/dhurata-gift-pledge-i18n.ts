import type { UiLang } from "@/lib/ui-languages";

export type DhurataGiftPledgeCopy = {
  back: string;
  warnTitle: string;
  intro1: string;
  intro2: string;
  items: readonly [string, string, string, string, string];
  legal: string;
  continueBtn: string;
  uncheckedHint: string;
};

const KS: DhurataGiftPledgeCopy = {
  back: "Kthehu",
  warnTitle: "⚠️ LEXO ME KUJDES PARA SE TË VAZHDOSH",
  intro1: "Ky seksion është krijuar për njerëz me zemër të mirë që duan të ndihmojnë të tjerët.",
  intro2: "Çdo keqpërdorim trajtohet me seriozitetin më të lartë.",
  items: [
    "Konfirmoj që sendi është plotësisht FALAS — nuk do të kërkoj asnjë kompensim, para, favor apo shërbim në këmbim",
    "Konfirmoj që sendi ekziston fizikisht dhe është i disponueshëm — nuk është shpallje e rreme apo mashtruese",
    "Konfirmoj që fotot janë reale dhe të sendit tim — jo foto nga interneti apo e dikujt tjetër",
    "Kuptoj që çdo person që keqpërdor këtë seksion për mashtrim, reklamë ose qëllime të liga raportohet menjëherë dhe bllokohet përgjithmonë nga platforma",
    "Kuptoj që KetuJemi monitoron çdo postim në këtë kategori dhe rezervon të drejtën ta heqë çdo shpallje pa paralajmërim",
  ],
  legal:
    'Duke klikuar "Vazhdo" ju merrni përgjegjësi të plotë ligjore për vërtetësinë e postimit tuaj.',
  continueBtn: "✅ Kuptova & Jam Dakord — Vazhdo →",
  uncheckedHint: "Shënoni të 5 kushtet për të vazhduar.",
};

const MK: DhurataGiftPledgeCopy = {
  back: "Назад",
  warnTitle: "⚠️ ПРОЧИТАЈТЕ ВНИМАТЕЛНО ПРЕД ДА ПРОДОЛЖИТЕ",
  intro1: "Оваа секција е создадена за луѓе со добро срце кои сакаат да им помогнат на другите.",
  intro2: "Секое злоупотреба се третира со најголема сериозност.",
  items: [
    "Потврдувам дека предметот е целосно БЕСПЛАТЕН — нема да побарам пари, услуга или накнада",
    "Потврдувам дека предметот физички постои и е достапен — не е лажен или измамнички оглас",
    "Потврдувам дека фотографиите се вистински и од мојот предмет — не од интернет или туѓи",
    "Разбирам дека секој кој ја злоупотребува оваа секција за измама, реклама или штетни цели веднаш се пријавува и трајно се блокира",
    "Разбирам дека KetuJemi го следи секој оглас во оваа категорија и може да го отстрани без предупредување",
  ],
  legal:
    'Со кликнување на „Продолжи“ ја преземате целосната правна одговорност за точноста на вашиот оглас.',
  continueBtn: "✅ Разбрав & Се согласувам — Продолжи →",
  uncheckedHint: "Штиклирајте ги сите 5 услови за да продолжите.",
};

const MNE: DhurataGiftPledgeCopy = {
  back: "Nazad",
  warnTitle: "⚠️ PAŽLJIVO PROČITAJTE PRIJE NEGO ŠTO NASTAVITE",
  intro1: "Ova sekcija je namijenjena ljudima dobrog srca koji žele pomoći drugima.",
  intro2: "Svaka zloupotreba tretira se s najvećom ozbiljnošću.",
  items: [
    "Potvrđujem da je predmet potpuno BESPLATAN — neću tražiti novac, uslugu ili naknadu",
    "Potvrđujem da predmet fizički postoji i dostupan je — nije lažan ili prevarantski oglas",
    "Potvrđujem da su fotografije stvarne i mog predmeta — ne sa interneta ili tuđe",
    "Razumijem da svako ko zloupotrijebi ovu sekciju za prevaru, reklamu ili štetne svrhe odmah se prijavljuje i trajno blokira",
    "Razumijem da KetuJemi prati svaki oglas u ovoj kategoriji i može ga ukloniti bez upozorenja",
  ],
  legal:
    'Klikom na „Nastavi“ preuzimate punu pravnu odgovornost za tačnost vašeg oglasa.',
  continueBtn: "✅ Razumijem & Slažem se — Nastavi →",
  uncheckedHint: "Označite svih 5 uslova da biste nastavili.",
};

const EN: DhurataGiftPledgeCopy = {
  back: "Back",
  warnTitle: "⚠️ READ CAREFULLY BEFORE YOU CONTINUE",
  intro1: "This section is for kind-hearted people who want to help others.",
  intro2: "Any misuse is taken with the utmost seriousness.",
  items: [
    "I confirm the item is completely FREE — I will not ask for any payment, favour or service in return",
    "I confirm the item exists physically and is available — this is not a fake or fraudulent listing",
    "I confirm the photos are real and of my item — not stock images or someone else's photos",
    "I understand anyone who misuses this section for fraud, advertising or harmful purposes is reported immediately and permanently banned",
    "I understand KetuJemi monitors every post in this category and may remove any listing without warning",
  ],
  legal:
    'By clicking "Continue" you accept full legal responsibility for the accuracy of your listing.',
  continueBtn: "✅ I understand & agree — Continue →",
  uncheckedHint: "Check all 5 conditions to continue.",
};

const FR: DhurataGiftPledgeCopy = {
  back: "Retour",
  warnTitle: "⚠️ LISEZ ATTENTIVEMENT AVANT DE CONTINUER",
  intro1:
    "Cette section est destinée aux personnes au grand cœur qui veulent aider les autres.",
  intro2: "Toute utilisation abusive est traitée avec le plus grand sérieux.",
  items: [
    "Je confirme que l'objet est entièrement GRATUIT — je ne demanderai aucun paiement, service ou faveur en retour",
    "Je confirme que l'objet existe physiquement et est disponible — ce n'est pas une annonce fausse ou frauduleuse",
    "Je confirme que les photos sont réelles et de mon objet — pas des images internet ou d'autrui",
    "Je comprends que toute personne qui abuse de cette section pour fraude, publicité ou fins nuisibles est signalée immédiatement et bannie définitivement",
    "Je comprends que KetuJemi surveille chaque publication dans cette catégorie et peut retirer toute annonce sans préavis",
  ],
  legal:
    "En cliquant sur « Continuer », vous assumez l'entière responsabilité légale de l'exactitude de votre annonce.",
  continueBtn: "✅ J'ai compris & j'accepte — Continuer →",
  uncheckedHint: "Cochez les 5 conditions pour continuer.",
};

const BY_LANG: Record<UiLang, DhurataGiftPledgeCopy> = {
  sq: KS,
  mk: MK,
  mne: MNE,
  en: EN,
  fr: FR,
};

export function dhurataGiftPledgeCopy(uiLang: UiLang): DhurataGiftPledgeCopy {
  return BY_LANG[uiLang] ?? KS;
}

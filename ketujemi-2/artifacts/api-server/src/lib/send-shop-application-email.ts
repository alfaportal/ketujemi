import { CONTACT_INBOX } from "./send-contact-email";
import { deliverEmail } from "./send-transactional-email";

export type ShopApplicationEmailPayload = {
  shopName: string;
  logoUrl: string;
  description: string;
  category: string;
  country: string;
  city: string;
  region: string;
  address: string;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  contactName: string;
  phone: string;
  email: string;
  userId: number;
  applicationId: number;
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function line(label: string, value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return `<p><strong>${esc(label)}:</strong> ${esc(value.trim())}</p>`;
}

export async function sendShopApplicationEmail(payload: ShopApplicationEmailPayload): Promise<void> {
  const subject = `[KetuJemi Dyqan] Kërkesë e re #${payload.applicationId} — ${payload.shopName}`;
  const text = [
    `Kërkesë e re për dyqan #${payload.applicationId}`,
    `Përdoruesi: #${payload.userId}`,
    `Dyqani: ${payload.shopName}`,
    `Logo: ${payload.logoUrl}`,
    `Kategoria: ${payload.category}`,
    `Përshkrimi: ${payload.description}`,
    `Shteti: ${payload.country}`,
    `Qyteti: ${payload.city}`,
    `Rajoni: ${payload.region}`,
    `Adresa: ${payload.address}`,
    `Facebook: ${payload.facebook ?? "-"}`,
    `Instagram: ${payload.instagram ?? "-"}`,
    `TikTok: ${payload.tiktok ?? "-"}`,
    `WhatsApp: ${payload.whatsapp ?? "-"}`,
    `Website: ${payload.website ?? "-"}`,
    `Kontakt: ${payload.contactName}`,
    `Telefon: ${payload.phone}`,
    `Email: ${payload.email}`,
  ].join("\n");

  const html = [
    `<h2>Kërkesë e re për dyqan #${payload.applicationId}</h2>`,
    `<p><strong>Përdoruesi:</strong> #${payload.userId}</p>`,
    line("Dyqani", payload.shopName),
    `<p><strong>Logo:</strong> <a href="${esc(payload.logoUrl)}">${esc(payload.logoUrl)}</a></p>`,
    `<p><img src="${esc(payload.logoUrl)}" alt="logo" style="max-width:200px;max-height:200px;" /></p>`,
    line("Kategoria", payload.category),
    `<p><strong>Përshkrimi:</strong><br/>${esc(payload.description).replace(/\n/g, "<br/>")}</p>`,
    line("Shteti", payload.country),
    line("Qyteti", payload.city),
    line("Rajoni/Lagja", payload.region),
    line("Adresa", payload.address),
    line("Facebook", payload.facebook),
    line("Instagram", payload.instagram),
    line("TikTok", payload.tiktok),
    line("WhatsApp", payload.whatsapp),
    line("Website", payload.website),
    line("Kontakt", payload.contactName),
    line("Telefon", payload.phone),
    line("Email", payload.email),
  ].join("");

  await deliverEmail({
    to: CONTACT_INBOX,
    subject,
    text,
    html,
    replyTo: payload.email,
    debugSource: "shop-application",
  });
}

function buildShopApprovedEmailBody(shopId: number): string {
  const shopUrl = `https://ketujemi.com/dyqani/${shopId}`;
  return [
    "Mirë se erdhe në familjen KetuJemi! 🎊",
    "",
    "Dyqani juaj është aktiv dhe gati për klientë. Ja si të filloni:",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📸 HAPI 1 — POSTO SHPALLJET TUAJA",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Hyni te ketujemi.com dhe klikoni \"Posto Falas\".",
    "✅ Shtoni titullin e produktit ose shërbimit",
    "✅ Ngarkoni foto të qarta (sa më shumë aq më mirë)",
    "✅ Vendosni çmimin dhe përshkrimin",
    "✅ Klikoni \"Posto Shpalljen\" — del menjëherë live!",
    "",
    "Çdo shpallje që postoni shfaqet automatikisht:",
    "→ Në faqen kryesore të KetuJemi",
    "→ Në dyqanin tuaj të dedikuar",
    "→ Në kërkim Google",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "📲 HAPI 2 — SHPËRNDAJENI NË RRJETE SOCIALE",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Pasi të postoni shpalljen:",
    "1. Hapni shpalljen tuaj",
    "2. Klikoni \"Kopjo Linkun\" ose \"Shpërndaje në Facebook\"",
    "3. Ngarkojeni linkun te Historia juaj në Instagram ose TikTok",
    "4. Klientët klikojnë linkun → vijnë direkt te shpallja juaj!",
    "",
    "💡 KËSHILLË: Shpalljet që shpërndahen në rrjete sociale marrin 5x më shumë vizitorë!",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "⭐ HAPI 3 — NDIQNI FAQEN TONË",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "Na ndiqni në rrjetet tona sociale — ne promovojmë dyqanet aktive çdo ditë:",
    "📘 Facebook: KetuJemi.com",
    "📸 Instagram: @jemi.ketu",
    "🎵 TikTok: @ketujemi7",
    "",
    "Sa më shumë postoni → aq më shumë ju promovojmë → aq më shumë klientë keni! 🚀",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━",
    "🏪 DYQANI JUAJ",
    "━━━━━━━━━━━━━━━━━━━━━━",
    `Shikoni profilin tuaj: ${shopUrl}`,
    "",
    "Nëse keni pyetje, kontaktoni: info@ketujemi.com",
    "WhatsApp: +38343555294",
    "",
    "Ju urojmë suksese!",
    "Ekipi i KetuJemi 💙",
  ].join("\n");
}

export async function sendShopApprovedEmail(
  to: string,
  shopName: string,
  shopId: number,
): Promise<void> {
  const subject = `🎉 Dyqani juaj '${shopName}' u aktivizua në KetuJemi!`;
  const text = buildShopApprovedEmailBody(shopId);
  const html = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;line-height:1.5;">${esc(text)}</pre>`;

  await deliverEmail({ to, subject, text, html, debugSource: "shop-approved" });
}

export async function sendShopRatingEmail(
  to: string,
  shopName: string,
  shopId: number,
  rating: number,
  comment: string | null,
): Promise<void> {
  const subject = "⭐ Vlerësim i ri për dyqanin tuaj!";
  const commentText = comment?.trim() ? comment.trim() : "—";
  const profileUrl = `https://ketujemi.com/dyqani/${shopId}`;
  const text = `Dyqani juaj '${shopName}' mori një vlerësim të ri: ${rating} yje. Koment: '${commentText}'. Shikoni profilin tuaj: ${profileUrl}`;
  const html = `<p>${esc(text)}</p>`;

  await deliverEmail({ to, subject, text, html, debugSource: "shop-rating" });
}

export async function sendShopRejectedEmail(to: string, shopName: string, reason?: string): Promise<void> {
  const subject = "Kërkesa për dyqan — rifitoni aplikimin";
  const reasonLine =
    reason?.trim() ||
    "Të dhënat e dërguara nuk plotësojnë kriteret. Ju lutemi plotësoni saktë informacionin dhe dërgoni kërkesën përsëri.";
  const text = [
    `Përshëndetje,`,
    "",
    `Kërkesa juaj për dyqanin «${shopName}» nuk u miratua.`,
    "",
    reasonLine,
    "",
    "Mund të aplikoni përsëri nga faqja Hap Dyqanin në KetuJemi.",
  ].join("\n");
  const html = text.split("\n").map((l) => `<p>${esc(l)}</p>`).join("");

  await deliverEmail({ to, subject, text, html, debugSource: "shop-rejected" });
}

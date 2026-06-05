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

export async function sendShopApprovedEmail(to: string, shopName: string, shopUrl: string): Promise<void> {
  const subject = "🎉 Dyqani juaj u aktivizua në KetuJemi!";
  const text = [
    `Përshëndetje ${shopName},`,
    "",
    "Tani jeni pjesë e një platforme që i shërben mijëra blerësve çdo ditë.",
    "",
    "⚠️ Kujtesë e rëndësishme: KetuJemi është platformë e ndershme — postoni vetëm produkte reale me çmime të drejta. Klientët tuaj ju besojnë — mos i zhgënjeni.",
    "",
    "Sa më shumë postoni → aq më shumë klientë merrni. Filloni tani! 🚀",
    "",
    `Shiko dyqanin: ${shopUrl}`,
  ].join("\n");
  const html = text.split("\n").map((l) => `<p>${esc(l)}</p>`).join("");

  await deliverEmail({ to, subject, text, html, debugSource: "shop-approved" });
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

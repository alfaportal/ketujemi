import { sendAdminMonitorEmail, monitorEmailHtml } from "./admin-monitor-email";
import { sendTransactionalEmail } from "./send-transactional-email";

export async function sendAccountDeletionConfirmationEmail(opts: {
  to: string;
}): Promise<void> {
  const subject = "Llogaria juaj u fshi — KetuJemi";
  const text = [
    "Përshëndetje,",
    "",
    "Llogaria juaj në KetuJemi u fshi me sukses. Të gjitha shpalljet dhe të dhënat tuaja janë hequr nga platforma.",
    "",
    "Nëse nuk e keni kërkuar ju këtë veprim, kontaktoni menjëherë supportin.",
    "",
    "Faleminderit që përdorët KetuJemi.",
    "",
    "KetuJemi",
  ].join("\n");
  await sendTransactionalEmail({
    to: opts.to,
    subject,
    text,
    html: `<p>Përshëndetje,</p>
<p>Llogaria juaj në KetuJemi u fshi me sukses. Të gjitha shpalljet dhe të dhënat tuaja janë hequr nga platforma.</p>
<p>Nëse nuk e keni kërkuar ju këtë veprim, kontaktoni menjëherë supportin.</p>
<p>Faleminderit që përdorët KetuJemi.</p>`,
  });
}

export async function sendShopDeletionConfirmationEmail(opts: {
  to: string;
  shopName: string;
}): Promise<void> {
  const subject = `Dyqani «${opts.shopName}» u fshi — KetuJemi`;
  const text = [
    "Përshëndetje,",
    "",
    `Dyqani juaj «${opts.shopName}» u fshi me sukses. Të gjitha shpalljet e lidhura me të janë hequr.`,
    "",
    "Llogaria juaj mbetet aktive — mund të vazhdoni të përdorni platformën.",
    "",
    "KetuJemi",
  ].join("\n");
  await sendTransactionalEmail({
    to: opts.to,
    subject,
    text,
    html: `<p>Përshëndetje,</p>
<p>Dyqani juaj <strong>${opts.shopName}</strong> u fshi me sukses. Të gjitha shpalljet e lidhura me të janë hequr.</p>
<p>Llogaria juaj mbetet aktive — mund të vazhdoni të përdorni platformën.</p>`,
  });
}

export async function notifyAdminDeletion(opts: {
  subject: string;
  lines: string[];
}): Promise<void> {
  await sendAdminMonitorEmail({
    subject: opts.subject,
    text: opts.lines.join("\n"),
    html: monitorEmailHtml(opts.subject, opts.lines),
  });
}

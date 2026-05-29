import { Router, type IRouter } from "express";
import { sendContactFormEmail } from "../lib/send-contact-email";

const router: IRouter = Router();

const SUBJECT_LABELS: Record<string, string> = {
  pyetje: "Pyetje",
  problem: "Problem teknik",
  raportim: "Raportim",
  partneritet: "Partneritet",
  tjeter: "Tjetër",
};

function normalizeEmail(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const email = input.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

router.post("/contact", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "").trim();
    const email = normalizeEmail(req.body?.email);
    const subjectKey = String(req.body?.subject ?? "").trim();
    const message = String(req.body?.message ?? "").trim();

    if (!name || !email || !subjectKey || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (name.length > 120 || message.length > 5000 || subjectKey.length > 40) {
      res.status(400).json({ error: "Invalid field length" });
      return;
    }

    const subject = SUBJECT_LABELS[subjectKey] ?? subjectKey;

    await sendContactFormEmail({
      fromName: name,
      fromEmail: email,
      subject,
      message,
    });

    res.json({ ok: true });
  } catch (err) {
    req.log?.error({ err }, "contact form");
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("not configured")) {
      res.status(503).json({
        error: "EMAIL_NOT_CONFIGURED",
        message: "Formulari i kontaktit nuk mund të dërgojë email — konfiguroni serverin.",
      });
      return;
    }
    if (msg.includes("Resend email failed")) {
      res.status(502).json({
        error: "EMAIL_SEND_FAILED",
        message: "Emaili nuk u dërgua. Kontrolloni EMAIL_FROM (domain i verifikuar në Resend).",
      });
      return;
    }
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;

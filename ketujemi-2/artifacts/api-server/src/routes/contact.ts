import { Router, type IRouter } from "express";
import { sendContactFormEmail, logContactEmailEnv } from "../lib/send-contact-email";

const router: IRouter = Router();
const LOG = "POST /contact";

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
  console.log(`[${LOG}]`, "request received", {
    method: req.method,
    path: req.path,
    contentType: req.get("content-type"),
    hasBody: !!req.body,
    bodyKeys: req.body && typeof req.body === "object" ? Object.keys(req.body) : [],
  });

  logContactEmailEnv("on request — env snapshot");

  try {
    const name = String(req.body?.name ?? "").trim();
    const email = normalizeEmail(req.body?.email);
    const subjectKey = String(req.body?.subject ?? "").trim();
    const message = String(req.body?.message ?? "").trim();

    console.log(`[${LOG}]`, "parsed fields", {
      nameLength: name.length,
      email: email ?? "(invalid)",
      subjectKey,
      messageLength: message.length,
    });

    if (!name || !email || !subjectKey || !message) {
      console.log(`[${LOG}]`, "validation failed — missing required fields", {
        hasName: !!name,
        hasEmail: !!email,
        hasSubject: !!subjectKey,
        hasMessage: !!message,
      });
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    if (name.length > 120 || message.length > 5000 || subjectKey.length > 40) {
      console.log(`[${LOG}]`, "validation failed — field length", {
        nameLength: name.length,
        messageLength: message.length,
        subjectKeyLength: subjectKey.length,
      });
      res.status(400).json({ error: "Invalid field length" });
      return;
    }

    const subject = SUBJECT_LABELS[subjectKey] ?? subjectKey;

    console.log(`[${LOG}]`, "validation OK — sending email", {
      subject,
      replyTo: email,
    });

    await sendContactFormEmail({
      fromName: name,
      fromEmail: email,
      subject,
      message,
    });

    console.log(`[${LOG}]`, "success — responding 200 ok");
    res.json({ ok: true });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const errStack = err instanceof Error ? err.stack : undefined;

    console.error(`[${LOG}]`, "handler error", {
      error: errMsg,
      stack: errStack,
    });

    req.log?.error({ err }, "contact form");

    if (errMsg.includes("not configured")) {
      console.error(`[${LOG}]`, "EMAIL_NOT_CONFIGURED — check RESEND_API_KEY / SMTP env");
      res.status(503).json({
        error: "EMAIL_NOT_CONFIGURED",
        message: "Formulari i kontaktit nuk mund të dërgojë email — konfiguroni serverin.",
      });
      return;
    }
    if (errMsg.includes("Resend email failed")) {
      console.error(`[${LOG}]`, "EMAIL_SEND_FAILED — Resend rejected request", { detail: errMsg });
      res.status(502).json({
        error: "EMAIL_SEND_FAILED",
        message: "Emaili nuk u dërgua. Kontrolloni EMAIL_FROM (domain i verifikuar në Resend).",
      });
      return;
    }
    console.error(`[${LOG}]`, "responding 500 — unhandled error");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;

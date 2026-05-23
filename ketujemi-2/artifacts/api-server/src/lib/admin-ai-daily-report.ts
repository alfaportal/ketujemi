import { claudeTextCompletion, isClaudeConfigured } from "./claude-client";
import { gatherAdminOperatorContext } from "./admin-operator-context";

const AI_REPORT_SYSTEM = `Je analist i platformës së njoftimeve KetuJemi.com.
Merr një snapshot JSON me të dhëna të ditës dhe shkruaj raportin ADMINISTRATIV në shqip.

Formati i përgjigjes (markdown, vetëm këto 3 seksione me tituj saktë):

## Çfarë ka ndodhur sot
(bullet points — numra, kategori, trende)

## Çfarë është e dyshimtë
(bullet points — raportime, çmime, tituj, shitës të shumtë, etj.; nëse asgjë: "Asgjë e veçantë.")

## Çfarë veprime rekomandon
(bullet points — veprime konkrete me ID njoftimi/përdoruesi kur ka kuptim)

Rregulla:
- Shkruaj vetëm në shqip, qartë dhe profesionalisht.
- Mos shpik të dhëna që nuk janë në JSON.
- Përdor numra nga snapshot-i.
- Mos përmend Claude ose AI.`;

export async function generateAdminAiDailyReport(): Promise<{
  snapshot: Awaited<ReturnType<typeof gatherAdminOperatorContext>>;
  report: string;
  ai_configured: boolean;
}> {
  const snapshot = await gatherAdminOperatorContext();

  if (!isClaudeConfigured()) {
    return {
      snapshot,
      ai_configured: false,
      report:
        "ANTHROPIC_API_KEY nuk është konfiguruar. Shiko fushat `snapshot` për të dhënat e ditës.",
    };
  }

  const report = await claudeTextCompletion({
    system: AI_REPORT_SYSTEM,
    user: JSON.stringify(snapshot, null, 2),
    maxTokens: 2048,
  });

  return {
    snapshot,
    ai_configured: true,
    report: report || "Nuk u gjenerua raport.",
  };
}

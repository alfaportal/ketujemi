import fs from "node:fs";
import path from "node:path";
import { pool } from "@workspace/db";
import { isTransactionalEmailConfigured } from "./send-transactional-email.js";

export type HealthCheckResult = {
  ok: boolean;
  /** Failures that should trigger an immediate admin alert. */
  criticalIssues: string[];
  /** Configuration gaps (reported in daily email, not paged). */
  warnings: string[];
  checkedAt: string;
};

export async function runSystemHealthCheck(): Promise<HealthCheckResult> {
  const criticalIssues: string[] = [];
  const warnings: string[] = [];

  try {
    await pool.query("SELECT 1");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    criticalIssues.push(`Database: ${msg}`);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    criticalIssues.push("DATABASE_URL mungon");
  }

  const staticRoot = process.env.STATIC_ROOT?.trim();
  if (staticRoot) {
    try {
      const indexPath = path.join(path.resolve(staticRoot), "index.html");
      if (!fs.existsSync(indexPath)) {
        criticalIssues.push("Frontend index.html mungon (STATIC_ROOT)");
      } else {
        const html = fs.readFileSync(indexPath, "utf8");
        if (!html.includes("/assets/") || html.includes('src="/src/main.tsx"')) {
          criticalIssues.push("Frontend nuk duket i build-uar plotësisht");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      criticalIssues.push(`STATIC_ROOT: ${msg}`);
    }
  }

  if (!isTransactionalEmailConfigured()) {
    warnings.push("Email (SMTP/Resend) nuk është konfiguruar — alarmet nuk dërgohen");
  }

  if (!getAdminEmailConfigured()) {
    warnings.push("EMAIL_ADMIN mungon — raportet nuk dërgohen te admin");
  }

  return {
    ok: criticalIssues.length === 0,
    criticalIssues,
    warnings,
    checkedAt: new Date().toISOString(),
  };
}

function getAdminEmailConfigured(): boolean {
  return !!(process.env.EMAIL_ADMIN?.trim() || process.env.CONTACT_INBOX?.trim());
}

import { db, moderationLogTable } from "@workspace/db";
import { logger } from "./logger.js";
import {
  getAdminEmail,
  monitorEmailHtml,
  sendAdminMonitorEmail,
} from "./admin-monitor-email.js";
import { auditInvalidListingImages } from "./listing-image-audit.js";
import { purgeInvalidListingImages } from "./purge-invalid-listing-images.js";
import { scanAndRemoveSelfDuplicateListings } from "./listing-duplicate-scan-job.js";
import { runSystemHealthCheck } from "./system-health-check.js";
import { gatherDailyMonitorStats } from "./monitor-daily-stats.js";
import { recordMonitorCycleError } from "./system-monitor-state.js";

const MONITOR_INTERVAL_MS = envInt("MONITOR_INTERVAL_MS", 10 * 60 * 1000);
const MONITOR_DAILY_HOUR = envInt("MONITOR_DAILY_HOUR", 8);
const MONITOR_TIMEZONE = process.env.MONITOR_TIMEZONE?.trim() || "Europe/Tirane";
const ALERT_COOLDOWN_MS = envInt("MONITOR_ALERT_COOLDOWN_MS", 60 * 60 * 1000);

const lastAlertAt = new Map<string, number>();

let monitorInFlight = false;
let dailyReportScheduled = false;

function envInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function shouldSendAlert(alertKey: string): boolean {
  const now = Date.now();
  const prev = lastAlertAt.get(alertKey) ?? 0;
  if (now - prev < ALERT_COOLDOWN_MS) return false;
  lastAlertAt.set(alertKey, now);
  return true;
}

async function logBadImagePurges(listingIds: number[]): Promise<void> {
  for (const listingId of listingIds) {
    await db.insert(moderationLogTable).values({
      listing_id: listingId,
      reason: "MONITOR_BAD_IMAGE_PURGED",
      action: "corrected",
    });
  }
}

async function runMonitorCycle(): Promise<void> {
  const problems: string[] = [];

  const health = await runSystemHealthCheck();
  if (health.criticalIssues.length > 0) {
    problems.push(`Health check: ${health.criticalIssues.join("; ")}`);
    if (shouldSendAlert("health")) {
      await sendAdminMonitorEmail({
        subject: "[KetuJemi] Alarm: problem në server",
        text: problems.join("\n"),
        html: monitorEmailHtml("Alarm health check", health.criticalIssues),
      });
    }
  }

  const audit = await auditInvalidListingImages({ activeOnly: true });
  if (audit.invalidCount > 0) {
    const purge = await purgeInvalidListingImages({ activeOnly: true });
    if (purge.sampleIds.length > 0) {
      await logBadImagePurges(purge.sampleIds);
    }
    const line = `Foto të gabuara: ${audit.invalidCount} shpallje (u pastruan ${purge.cleared}). ID: ${purge.sampleIds.join(", ")}`;
    problems.push(line);
    if (shouldSendAlert("bad_images")) {
      await sendAdminMonitorEmail({
        subject: "[KetuJemi] Alarm: foto stock/jashtë në shpallje",
        text: line,
        html: monitorEmailHtml("Foto të pavlefshme në shpallje", [
          line,
          ...audit.samples.map((s) => `#${s.id}: ${s.image_url}`),
        ]),
      });
    }
  }

  const dup = await scanAndRemoveSelfDuplicateListings();
  if (dup.removed > 0) {
    const line = `Duplikate të hequra: ${dup.removed} (përdorues të skanuar: ${dup.usersScanned}, njoftuar: ${dup.notified})`;
    problems.push(line);
    if (shouldSendAlert("duplicates")) {
      await sendAdminMonitorEmail({
        subject: "[KetuJemi] Alarm: duplikate të reja u hoqën",
        text: line,
        html: monitorEmailHtml("Duplikate të zbuluara", [line]),
      });
    }
  }

  if (problems.length > 0) {
    logger.warn({ problems }, "system monitor cycle found issues");
  } else {
    logger.info({ scanned: audit.scanned }, "system monitor cycle OK");
  }
}

function formatDailyReportText(stats: Awaited<ReturnType<typeof gatherDailyMonitorStats>>): string {
  return [
    `Periudha: ${stats.periodStart} → ${stats.periodEnd}`,
    ``,
    `Shpallje të reja (24h): ${stats.newListings}`,
    `Shpallje aktive: ${stats.activeListings}`,
    `Duplikate të bllokuara (postim): ${stats.duplicatesBlocked}`,
    `Duplikate të hequra (scan): ${stats.duplicatesRemovedByScan}`,
    `Foto stock të pastruara: ${stats.badImagesPurged}`,
    `Gabime cikli monitorimi: ${stats.monitorCycleErrors}`,
  ].join("\n");
}

async function sendDailyReport(): Promise<void> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const stats = await gatherDailyMonitorStats(since);
  const health = await runSystemHealthCheck();
  const text = [
    formatDailyReportText(stats),
    health.warnings.length > 0 ? `\nParalajmërime konfigurimi:\n- ${health.warnings.join("\n- ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const html = monitorEmailHtml("Raport ditor KetuJemi", text.split("\n").filter(Boolean));

  const sent = await sendAdminMonitorEmail({
    subject: "[KetuJemi] Raport ditor — monitorimi",
    text,
    html,
  });

  if (sent) {
    logger.info(stats, "Daily monitor report emailed to admin");
  } else {
    logger.warn({ admin: getAdminEmail() }, "Daily monitor report not sent");
  }
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value]),
  ) as Record<string, string>;
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

/** Ms until next local wall-clock hour:minute in `timeZone`. */
export function msUntilNextZonedTime(
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const now = Date.now();
  let candidate = now + 60_000;
  const max = now + 48 * 60 * 60 * 1000;

  while (candidate < max) {
    const p = getZonedParts(new Date(candidate), timeZone);
    if (p.hour === hour && p.minute === minute) {
      const prev = getZonedParts(new Date(candidate - 60_000), timeZone);
      if (prev.hour !== hour || prev.minute !== minute) {
        return candidate - now;
      }
    }
    candidate += 30_000;
  }

  return 24 * 60 * 60 * 1000;
}

function scheduleDailyReport(): void {
  if (dailyReportScheduled) return;
  dailyReportScheduled = true;

  const scheduleNext = () => {
    const delay = msUntilNextZonedTime(MONITOR_DAILY_HOUR, 0, MONITOR_TIMEZONE);
    setTimeout(() => {
      void sendDailyReport()
        .catch((err) => {
          recordMonitorCycleError("daily_report", err);
          logger.error({ err }, "Daily monitor report failed");
        })
        .finally(() => {
          setInterval(
            () => {
              void sendDailyReport().catch((err) => {
                recordMonitorCycleError("daily_report", err);
                logger.error({ err }, "Daily monitor report failed");
              });
            },
            24 * 60 * 60 * 1000,
          );
        });
    }, delay);
  };

  scheduleNext();
  logger.info(
    { hour: MONITOR_DAILY_HOUR, timeZone: MONITOR_TIMEZONE, delayHint: "until next run" },
    "Daily monitor report scheduled",
  );
}

export function startSystemMonitor(): void {
  if (process.env.MONITOR_ENABLED === "false") {
    logger.info("System monitor disabled (MONITOR_ENABLED=false)");
    return;
  }

  const admin = getAdminEmail();
  if (!admin) {
    logger.warn("EMAIL_ADMIN not set — monitor alerts and daily reports disabled");
  }

  const tick = () => {
    if (monitorInFlight) return;
    monitorInFlight = true;
    void runMonitorCycle()
      .catch((err) => {
        recordMonitorCycleError("cycle", err);
        logger.error({ err }, "System monitor cycle failed");
        if (shouldSendAlert("cycle_crash")) {
          void sendAdminMonitorEmail({
            subject: "[KetuJemi] Alarm: monitorimi dështoi",
            text: err instanceof Error ? err.message : String(err),
            html: monitorEmailHtml("Gabim në ciklin e monitorimit", [
              err instanceof Error ? err.message : String(err),
            ]),
          });
        }
      })
      .finally(() => {
        monitorInFlight = false;
      });
  };

  tick();
  setInterval(tick, MONITOR_INTERVAL_MS);
  scheduleDailyReport();

  logger.info(
    {
      intervalMs: MONITOR_INTERVAL_MS,
      dailyHour: MONITOR_DAILY_HOUR,
      timeZone: MONITOR_TIMEZONE,
      admin: admin ?? null,
    },
    "System monitor 24/7 started",
  );
}

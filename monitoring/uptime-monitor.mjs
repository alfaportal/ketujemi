#!/usr/bin/env node
// Bot monitorimi për ketujemi.com — kontrollon faqen + API health,
// dhe njofton në Telegram kur ka problem ose kur faqja rikthehet.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATE_FILE = path.join(__dirname, "state.json");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const TIMEOUT_MS = 10_000;
// Sa shpesh të ri-njoftojë në Telegram nëse problemi vazhdon
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
// Kur zbulohet problem, sa kontrolle konfirmuese (1 mesazh secili) me interval mes tyre
const CONFIRM_ATTEMPTS = 3;
const CONFIRM_INTERVAL_MS = 60 * 1000;

const TARGETS = [
  { name: "Faqja kryesore", url: "https://ketujemi.com/" },
  { name: "API health", url: "https://ketujemi.com/api/healthz" },
];

function loadState() {
  if (!existsSync(STATE_FILE)) {
    return { status: "unknown", since: null, lastAlertAt: 0 };
  }
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { status: "unknown", since: null, lastAlertAt: 0 };
  }
}

function saveState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkAll() {
  const results = await Promise.all(TARGETS.map(checkTarget));
  return { results, failed: results.filter((r) => !r.ok) };
}

async function checkTarget(target) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();
  try {
    const res = await fetch(target.url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "ketujemi-uptime-monitor" },
    });
    const ms = Date.now() - start;
    if (!res.ok) {
      return { ok: false, target, reason: `HTTP ${res.status}`, ms };
    }
    return { ok: true, target, ms };
  } catch (err) {
    return {
      ok: false,
      target,
      reason: err instanceof Error ? err.message : String(err),
      ms: Date.now() - start,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error(
      "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID nuk janë konfiguruar — njoftimi nuk u dërgua. Mesazhi do ishte:",
    );
    console.log(text);
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram API error ${res.status}: ${body}`);
  }
}

function fmtTime(date) {
  return date.toLocaleString("sq-AL", { timeZone: "Europe/Tirane", hour12: false });
}

function formatDuration(ms) {
  const totalMin = Math.round(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}orë ${m}min`;
  return `${m}min`;
}

// p.sh. "• Faqja kryesore: HTTP 503 (412ms)" — emri = problemi, "HTTP 503" / mesazhi i gabimit = error code
function formatTargetLines(failed) {
  return failed.map((f) => `• <b>${f.target.name}</b>: ${f.reason} (${f.ms}ms)`);
}

function formatProblemMessage(failed, attempt, total) {
  return [
    `🔴 <b>KetuJemi.com — PROBLEM</b> (konfirmim ${attempt}/${total})`,
    `Ora: ${fmtTime(new Date())}`,
    "",
    ...formatTargetLines(failed),
  ].join("\n");
}

async function main() {
  let { results, failed } = await checkAll();
  const detectedAt = Date.now();
  const state = loadState();
  const wasDown = state.status === "down";
  let isDown = failed.length > 0;

  if (isDown && !wasDown) {
    // Problem i ri — konfirmo me disa kontrolle të njëpasnjëshme me interval 1 min,
    // duke dërguar nga një mesazh Telegram për secilin, para se ta shënojmë "down".
    for (let attempt = 1; attempt <= CONFIRM_ATTEMPTS; attempt++) {
      await sendTelegram(formatProblemMessage(failed, attempt, CONFIRM_ATTEMPTS));
      if (attempt === CONFIRM_ATTEMPTS) break;
      await sleep(CONFIRM_INTERVAL_MS);
      ({ results, failed } = await checkAll());
      isDown = failed.length > 0;
      if (!isDown) break;
    }

    if (isDown) {
      state.status = "down";
      state.since = detectedAt;
      state.lastAlertAt = Date.now();
    } else {
      const downtimeMs = Date.now() - detectedAt;
      await sendTelegram(
        [
          "🟢 <b>KetuJemi.com — u rikthye</b>",
          `Ora: ${fmtTime(new Date())}`,
          `Kohëzgjatja e problemit: ${formatDuration(downtimeMs)}`,
        ].join("\n"),
      );
      state.status = "up";
      state.since = Date.now();
      state.lastAlertAt = 0;
    }
  } else if (isDown && wasDown) {
    const now = Date.now();
    if (now - (state.lastAlertAt ?? 0) >= ALERT_COOLDOWN_MS) {
      const downSince = state.since ? new Date(state.since) : new Date(now);
      await sendTelegram(
        [
          "🔴 <b>KetuJemi.com — vazhdon problemi</b>",
          `Jashtë funksionimit që nga: ${fmtTime(downSince)}`,
          `Ora: ${fmtTime(new Date(now))}`,
          "",
          ...formatTargetLines(failed),
        ].join("\n"),
      );
      state.lastAlertAt = now;
    }
  } else if (!isDown && wasDown) {
    const now = Date.now();
    const downtimeMs = state.since ? now - state.since : null;
    await sendTelegram(
      [
        "🟢 <b>KetuJemi.com — u rikthye</b>",
        `Koha: ${fmtTime(new Date(now))}`,
        downtimeMs ? `Kohëzgjatja e problemit: ${formatDuration(downtimeMs)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
    state.status = "up";
    state.since = now;
    state.lastAlertAt = 0;
  } else {
    state.status = "up";
    if (!state.since) state.since = detectedAt;
  }

  console.log(JSON.stringify({ now: fmtTime(new Date()), results }, null, 2));
  saveState(state);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

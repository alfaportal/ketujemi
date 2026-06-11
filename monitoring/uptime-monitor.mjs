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
const ALERT_COOLDOWN_MS = 30 * 60 * 1000;

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

async function main() {
  const results = await Promise.all(TARGETS.map(checkTarget));
  const failed = results.filter((r) => !r.ok);
  const now = Date.now();
  const state = loadState();
  const wasDown = state.status === "down";
  const isDown = failed.length > 0;

  if (isDown && !wasDown) {
    const lines = failed.map((f) => `• <b>${f.target.name}</b>: ${f.reason} (${f.ms}ms)`);
    await sendTelegram(
      ["🔴 <b>KetuJemi.com — PROBLEM</b>", `Koha: ${fmtTime(new Date(now))}`, "", ...lines].join("\n"),
    );
    state.status = "down";
    state.since = now;
    state.lastAlertAt = now;
  } else if (isDown && wasDown) {
    if (now - (state.lastAlertAt ?? 0) >= ALERT_COOLDOWN_MS) {
      const downSince = state.since ? new Date(state.since) : new Date(now);
      const lines = failed.map((f) => `• <b>${f.target.name}</b>: ${f.reason} (${f.ms}ms)`);
      await sendTelegram(
        [
          "🔴 <b>KetuJemi.com — vazhdon problemi</b>",
          `Jashtë funksionimit që nga: ${fmtTime(downSince)}`,
          `Koha: ${fmtTime(new Date(now))}`,
          "",
          ...lines,
        ].join("\n"),
      );
      state.lastAlertAt = now;
    }
  } else if (!isDown && wasDown) {
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
    if (!state.since) state.since = now;
  }

  console.log(JSON.stringify({ now: fmtTime(new Date(now)), results }, null, 2));
  saveState(state);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

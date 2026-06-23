# Uptime Monitor — KetuJemi.com

Bot që kontrollon `https://ketujemi.com/` dhe `https://ketujemi.com/api/healthz`
çdo **1 orë** përmes GitHub Actions (ose Railway cron), dhe dërgon njoftim në **Telegram**:

- 🔴 kur faqja/API nuk përgjigjet (HTTP gabim, timeout, etj.)
- 🔴 ri-njoftim çdo 1 orë nëse problemi vazhdon
- 🟢 kur faqja rikthehet, me kohëzgjatjen e ndërprerjes

## Setup (një herë)

### 1. Krijo bot Telegram

1. Hap [@BotFather](https://t.me/BotFather) në Telegram → `/newbot` → ndiq hapat.
2. Ruaj **token**-in që të jep (p.sh. `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`).

### 2. Gjej chat ID-në ku duhet të vijnë njoftimet

- Për mesazhe private: dërgo një mesazh çfarëdo botit tënd, pastaj hap:
  `https://api.telegram.org/bot<TOKEN>/getUpdates`
  dhe gjej `"chat":{"id": ...}` në përgjigje.
- Për një grup: shto botin në grup, dërgo një mesazh në grup, pastaj bëj të
  njëjtën gjë me `getUpdates` — `chat.id` për grupe është numër negativ.

### 3. Shto sekretet në GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Emri               | Vlera                          |
| ------------------ | ------------------------------- |
| `TELEGRAM_BOT_TOKEN` | token-i nga BotFather          |
| `TELEGRAM_CHAT_ID`   | chat ID nga hapi 2             |

### 4. Gati

Workflow-i `.github/workflows/uptime-monitor.yml` ekzekutohet automatikisht
çdo 1 orë. Mund ta testosh menjëherë: **Actions → Uptime Monitor
(KetuJemi.com) → Run workflow**.

## Si funksionon

- `uptime-monitor.mjs` kontrollon dy URL-të e mësipërme (timeout 10s).
- Statusi (up/down, që kur, koha e fundit e njoftimit) ruhet te
  `monitoring/state.json` dhe commit-ohet automatikisht nga workflow-i
  (commit me `[skip ci]`, nuk trigger-on build-et e tjera).
- Ndrysho listën e URL-ve ose `ALERT_COOLDOWN_MS` direkt te
  `uptime-monitor.mjs` nëse duhet.

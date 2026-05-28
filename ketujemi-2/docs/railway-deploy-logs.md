# Railway deploy — diagnostikë crash (2026-05-28)

## Si u analizua

Railway CLI kërkon login (`railway login` / `RAILWAY_TOKEN`) — nuk ishte i disponueshëm në mjedisin e build-it. U simulua lokalisht `node scripts/railway-start.mjs` me `RAILWAY_ENVIRONMENT=production`.

## Shkakt i mundshëm #1 (kritik) — Root Directory = `ketujemi-2`

Kur në Railway **Root Directory** është `ketujemi-2`, përdoret `ketujemi-2/railway.toml` dhe më parë:

```text
startCommand = node scripts/railway-start.mjs  →  ketujemi-2/scripts/railway-start.mjs
```

Ai skedar bënte vetëm `pnpm start` **pa**:

- normalizimin e `DATABASE_URL` (`&channel_binding` e prish URL-në në Railway)
- validimin e `SESSION_SECRET`

**Fix:** `ketujemi-2/scripts/railway-start.mjs` tani delegon te `scripts/railway-start.mjs` në repo root.

## Shkakt i mundshëm #2 — Variabla në Railway

Në start, procesi del me kod 1 nëse mungon:

| Variabël | Mesazh në log |
|----------|----------------|
| `DATABASE_URL` | `DATABASE_URL is not set` ose hostname i pavlefshëm (`base`, etj.) |
| `SESSION_SECRET` | `SESSION_SECRET must be at least 16 characters` |

`OPENAI_API_KEY` **nuk** përdoret më — hequr me Web Speech-only.

## Shkakt i mundshëm #3 — Health check HTTP→HTTPS

Middleware që ridrejton `http` → `https` për `*.ketujemi.com` mund të thyente health check-in nëse `/api/healthz` nuk përjashtohej.  
**Fix i mëparshëm:** përjashtim i `req.path === "/api/healthz"`.

## Shkakt i mundshëm #4 — Migrimi DB në boot

`ensureWalletSchema` / DB connection failure → `process.exit(1)` para `app.listen`.  
**Fix:** në production, log warning dhe vazhdo startimin (health + static).

## Çfarë të shohësh në Railway Deploy Logs pas push-it

```text
[railway-start] env: { DATABASE_URL_set: true, SESSION_SECRET_ok: true, ... }
[railway-start] DATABASE_URL host: ep-xxxx.pooler....neon.tech
[start-production] ...
Server listening { port: 8080 }
```

Nëse sheh `SESSION_SECRET_ok: false` ose `DATABASE_URL_set: false` → shto variablat në Railway → Redeploy.

## Verifikim

- https://ketujemi.com/api/healthz → `{"status":"ok",...}`
- https://www.ketujemi.com/ → 301 → https://ketujemi.com/

# Deploy KetuJemi — Railway (production)

**ketujemi.com** duhet të përdorë **Railway** për hosting (jo Vercel). Një shërbim: API Express + frontend statik në të njëjtin port.

## Railway — lidhja me GitHub

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Zgjidh: **`alfaportal/ketujemi`**
3. Branch: **`master`**
4. **Root Directory:** lëre **bosh** (repo root) — `railway.toml` në root lexohet automatikisht  
   *(Alternativë: Root = `ketujemi-2` — përdor `ketujemi-2/railway.toml`)*

Çdo **push** në `master` → Railway build + deploy automatik.

## DNS për ketujemi.com

Në registrar-in e domain-it (ku e ke blerë ketujemi.com):

1. Hiq / mos përdor më DNS që tregon te **Vercel**
2. Në **Railway** → shërbimi → **Settings → Networking** → **Custom Domain** → shto `ketujemi.com` dhe `www.ketujemi.com`
3. Vendos rekordet që të jep Railway (zakonisht **CNAME** te `xxxx.up.railway.app`)

Pas propagimit DNS (5 min – 48 orë), faqja hapet nga Railway.

## Çfarë bën build-i

1. `pnpm install` (monorepo root)
2. `pnpm run build:production` në `ketujemi-2` → Vite + API bundle
3. **preDeploy:** `pnpm run db:push` (skema DB)
4. **start:** `node` API me `STATIC_ROOT` = frontend `dist/public`

Health check: **`GET /api/healthz`** (duhet `hasFrontend: true`).

## Variablat e detyrueshëm (Railway → Variables)

| Variabël | Përshkrim |
|----------|-----------|
| `DATABASE_URL` | Postgres (Railway Postgres ose Neon) |
| `SESSION_SECRET` | Min. 16 karaktere |
| `PUBLIC_APP_ORIGIN` | `https://ketujemi.com` (email, linke njoftimesh) |

Rekomandohen: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `RECAPTCHA_*`, `VITE_RECAPTCHA_SITE_KEY`, `EMAIL_*`, `VITE_CLOUDINARY_*`, `STRIPE_*` — shiko `ketujemi-2/.env.example`.

**SMS (opsionale):** Lëre `SMS_AUTH_ENABLED` të pa vendosur ose `false` për regjistrim vetëm me email. Kur Vonage/Twilio është gati: `SMS_AUTH_ENABLED=true` + `VONAGE_API_KEY` + `VONAGE_API_SECRET`.

**Email regjistrim:** Verifikimi me kod në email është **aktiv** by default. Vendos `RESEND_API_KEY` + `EMAIL_FROM` (domain i verifikuar në Resend). Për regjistrim instant pa kod: `EMAIL_VERIFICATION_REQUIRED=false`.

**VITE_*** duhen vendosur **para build-it** (Railway i injoron në fazën e build).

## Verifikim pas deploy

- `https://ketujemi.com/api/healthz` → `{"status":"ok","hasFrontend":true,...}`
- Faqja kryesore hapet, footer tregon hash commit (`buildId`)
- Chat «Ndihmë» majtas, kategoritë + carousel Vetura

## Lokal (si Railway prod)

```bash
cd ketujemi-2
cp .env.example .env   # plotëso DATABASE_URL, SESSION_SECRET, ...
pnpm install           # nga repo root: cd .. && pnpm install
node ./scripts/build-production.mjs
pnpm start
```

→ http://localhost:8080

## Vercel (jo aktiv për prod)

`vercel.json` mbetet në repo për referencë; **mos** lidh ketujemi.com me Vercel nëse përdor Railway.

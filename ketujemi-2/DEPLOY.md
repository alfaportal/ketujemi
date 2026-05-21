# Deploy KetuJemi — vetëm Vercel

Railway **nuk përdoret më**. Frontend + API + cron janë në **një projekt Vercel** (`alfaportal/ketujemi`).

## Vercel Dashboard

| Setting | Vlera |
|--------|--------|
| **Repository** | `alfaportal/ketujemi` |
| **Branch** | `master` |
| **Root Directory** | *(bosh — root i repo-s)* |
| **Framework** | Other |
| Install / Build / Output | *(bosh — lexohen nga `vercel.json` në root)* |

## Çfarë bën build-i

1. `pnpm install` (monorepo root)
2. Build Vite → `ketujemi-2/artifacts/vendi/dist/public`
3. Bundle API Express → `api/handler.mjs` (serverless)
4. Bundle cron → `api/cron/jobs.mjs`

## Variablat e detyrueshëm (Vercel → Settings → Environment Variables)

| Variabël | Përshkrim |
|----------|-----------|
| `DATABASE_URL` | Postgres (Neon, Supabase, etj.) |
| `SESSION_SECRET` | Min. 16 karaktere (cookies) |
| `ANTHROPIC_API_KEY` | Chatbot + moderim (opsional por rekomandohet) |
| `CRON_SECRET` | Mbrojtje për `/api/cron/jobs` (Vercel e dërgon si Bearer) |

Opsionale sipas funksioneve: `VONAGE_*`, `EMAIL_*`, `STRIPE_*`, `RECAPTCHA_*`, `SUPPORT_PHONE`, `CLOUDINARY_*`, etj. (shiko `ketujemi-2/.env.example`).

## Pas deploy

- Faqja: URL e Vercel-it ose `ketujemi.com` (DNS → Vercel)
- API: `/api/healthz`, `/api/ai/support-chat` — **në të njëjtin domain**, pa Railway
- Verifikim: footer me hash commit; chatbot përgjigjet në shqip

## Cron (skadim njoftimesh + email rikujtues)

`vercel.json` planifikon `GET /api/cron/jobs` çdo orë. Kërkon **CRON_SECRET** dhe plan Vercel që mbështet cron.

## Lokal

```bash
# nga root i repo-s
pnpm install
pnpm run build
# frontend: ketujemi-2/artifacts/vendi
# API bundle: api/handler.mjs
```

Për dev lokal me API të vazhdueshëm: `pnpm -C ketujemi-2 run dev` (Express në :8080 + Vite proxy).

# Deploy KetuJemi.com (Railway / Vercel / Render)

## Vercel (frontend + API proxy)

Repo root tani ka `package.json` dhe `vercel.json` — Vercel nuk duhet të japë më 404 për “no package.json”.

**Vercel Dashboard → Project Settings:**

| Setting | Vlera |
|--------|--------|
| **Repository** | `alfaportal/ketujemi` |
| **Branch** | `master` |
| **Root Directory** | *(lëre bosh)* ose `ketujemi-2` (përdor `ketujemi-2/vercel.json`) |
| **Framework** | Other |
| **Install Command** | *(lëre bosh — lexohet nga vercel.json)* |
| **Build Command** | *(lëre bosh — lexohet nga vercel.json)* |
| **Output Directory** | *(lëre bosh — lexohet nga vercel.json)* |

**Shënim:** Vercel shërben vetëm **frontend-in** (Vite). Kërkesat `/api/*` ridrejtohen te Railway (`ketujemi-production.up.railway.app`). Për app të plotë me DB, mbaj edhe **Railway** si backend.

Pas deploy: hap URL-n e Vercel-it → duhet faqja kryesore, jo 404.

---

## Railway (rekomanduar për backend + frontend së bashku)

1. **Settings → Root Directory:** `ketujemi-2` **ose** lëre bosh (repo root) — skriptet funksionojnë për të dyja.
2. **Settings → Deploy:** lidh repo `alfaportal/ketujemi`, branch `master`.
3. Pas çdo push, prit **Deploy succeeded** (3–8 min).
4. **Verifikim:** hap `https://ketujemi.com/api/healthz`  
   Duhet: `"buildId":"5343b28"` (ose commit i ri) dhe `"hasFrontend":true`.

## Nëse faqja duket e vjetër

1. Railway → **Deployments** → shiko nëse build-i i fundit **failed** (i kuq).
2. **Redeploy** commit-in `master` të fundit.
3. Shfletues: **Incognito** ose fshi PWA «Add to Home Screen».
4. Cloudflare (nëse përdoret): **Purge cache** për `ketujemi.com`.

## Footer i ri (si duhet të duket)

- **3 kolona:** NDIHMË · INFORMATA · BIZNESE (jo 4 me TREGJET të madhe)
- Shirit i errët: **TREGJET ZYRTARE · Kosovë · Shqipëri · Maqedoni · +8 Diaspora**
- Copyright: `© 2026 KetuJemi.com · abc1234` (hash i commit-it)

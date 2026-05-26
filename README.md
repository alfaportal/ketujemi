# KetuJemi — projekti kryesor (një repo, një deploy)

Ky folder është **i vetmi** burim i vërtetë për faqen [ketujemi.com](https://ketujemi.com).

| Çka | Ku |
|-----|-----|
| **GitHub** | [github.com/alfaportal/ketujemi](https://github.com/alfaportal/ketujemi) (`master`) |
| **Kodi i aplikacionit** | `ketujemi-2/` (frontend + API + DB) |
| **Railway / Vercel** | Build nga **ky** repo root (shiko `railway.toml`) |

## Si ta hapësh në Cursor (1 projekt)

1. **File → Open Folder** → zgjidh:  
   `C:\Users\1\Documents\GitHub\ketujemi`  
   (jo vetëm `ketujemi-2`, jo Desktop)

2. Ose hap workspace-in: **`ketujemi.code-workspace`** (dy foldera në një dritare, por një repo).

## Komanda (gjithmonë nga repo root)

```powershell
cd C:\Users\1\Documents\GitHub\ketujemi
pnpm install
pnpm dev          # API + faqja lokale
pnpm build:production
```

Të gjitha komandat delegojnë te `ketujemi-2/` — nuk ke nevojë të hysh manualisht aty.

## Struktura

```
ketujemi/                 ← HAP KËTË (monorepo root)
├── ketujemi-2/           ← app: artifacts/vendi, artifacts/api-server, lib/db
├── scripts/              ← Railway build/start
├── railway.toml
└── pnpm-workspace.yaml
```

## Mos përdor kopje të tjera

- `Desktop\firmat\ketujemi\` — duplikat / e vjetër. Ndryshimet aty **nuk** shkojnë në faqe.
- Nëse ke dy foldera të hapura në Cursor, mbyll atë që nuk është `Documents\GitHub\ketujemi`.

Shiko edhe: [KUJDES-WORKSPACE.md](./KUJDES-WORKSPACE.md)

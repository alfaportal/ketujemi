# Udhëzime për agjentët (Cursor / AI)

## Një projekt i vetëm

- **Workspace root:** `Documents/GitHub/ketujemi` (repo root), jo `ketujemi-2` i vetmuar.
- **Ndryshime kodi:** nën `ketujemi-2/` (p.sh. `artifacts/vendi`, `artifacts/api-server`).
- **Git push:** nga repo root → `origin` = `alfaportal/ketujemi`, branch `master`.
- **Mos prek** `Desktop/firmat/ketujemi` — kopje e pasaktë.

## Komanda

Ekzekuto nga repo root (`ketujemi/`), përdor `pnpm dev`, `pnpm build:production`, etj. — delegojnë te `ketujemi-2`.

## Deploy

Railway lexon `railway.toml` në root; build përdor `ketujemi-2` përmes `scripts/railway-build.mjs`.

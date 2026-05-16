# Vendi.com

Kosovo's classifieds marketplace platform — a place for buying and selling anything across Kosovo's cities.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port varies)
- `pnpm --filter @workspace/vendi run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Wouter (routing), TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle table definitions (`listings.ts`, `categories.ts`)
- `artifacts/api-server/src/routes/` — Express route handlers (`listings.ts`, `categories.ts`)
- `artifacts/vendi/src/pages/` — React pages (home, listings, listing-detail, new-listing, edit-listing)
- `artifacts/vendi/src/components/` — Shared UI components (listing-card, category-card, navbar)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not hand-edit)
- `lib/api-zod/src/generated/` — Generated Zod validation schemas (do not hand-edit)

## Architecture decisions

- OpenAPI-first: the spec in `lib/api-spec/openapi.yaml` gates all codegen. Always re-run codegen after spec changes.
- Listings use numeric `price` stored as `numeric(10,2)` in Postgres; cast to `Number()` in route handlers before returning JSON.
- Routes for `featured`, `recent`, and `stats` are registered BEFORE `/:id` in Express to prevent path conflicts.
- Kosovo-specific: UI text is in Albanian (Shqip). Locations hardcoded as Kosovo cities.
- Seed data is idempotent (`ON CONFLICT DO NOTHING`) — safe to re-run.

## Product

- **Home** (`/`) — hero search, category grid with counts, featured listings, recent listings, marketplace stats + top cities
- **Browse** (`/listings`) — filterable list by category, location, price range, search query; paginated (16/page)
- **Detail** (`/listings/:id`) — full listing info, seller contact (phone link), view counter, edit/delete actions
- **Post** (`/listings/new`) — full form to post a new classified ad
- **Edit** (`/listings/:id/edit`) — edit an existing listing

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, run `pnpm --filter @workspace/api-spec run codegen` before touching frontend or backend code.
- The `listings/featured`, `listings/recent`, `listings/stats` routes must come before `listings/:id` in `routes/index.ts`.
- UI text is in Albanian — keep it consistent when adding new copy.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

# SQL migrations — run order

Apply on Neon/Railway when a feature needs schema not yet covered by `drizzle-kit push`.

**Automated (recommended):** from repo root:

```bash
pnpm db:migrate
```

Tracks applied files in `schema_migrations`. Options: `--dry-run`, or pass a single file e.g. `wallet-migration.sql`.

**Manual:** run each file **once** per environment; most use `IF NOT EXISTS`.

## Core platform

1. `oauth-users-migration.sql`
2. `phone-verify-challenges-migration.sql`
3. `email-verify-challenges-migration.sql`
4. `business-payments-migration.sql`
5. `wallet-migration.sql`
6. `fiscal-receipts-migration.sql`

## Partners & shops

7. `partners-table-migration.sql`
8. `business-partner-system-migration.sql`
9. `business-partner-categories-migration.sql`
10. `partner-profile-fields-migration.sql`
11. `partner-activation-code-migration.sql`
12. `partners-payment-automation-migration.sql`
13. `homepage-partners-migration.sql`
14. `homepage-partner-categories-migration.sql`
15. `users-partner-logo-migration.sql`
16. `partner-logo-stats-migration.sql`

## Listings & moderation

17. `listings-video-url-migration.sql`
18. `listings-top-repost-migration.sql`
19. `listings-fb-posted-migration.sql`
20. `listings-expiry-reminders-migration.sql`
21. `listing-package-purchases-migration.sql`
22. `listing-deletion-log-migration.sql`
23. `listing-moderation-rejections-migration.sql`
24. `moderation-log-migration.sql`
25. `bump-free-listing-limit-10.sql`

## Social & engagement

26. `social-followers-migration.sql`
27. `user-social-connections-migration.sql`
28. `engagement-notifications-migration.sql`

## Categories & rules

29. `femije-subcategories-migration.sql`
30. `femije-hub-subcategory-photos.sql`
31. `sport-outdoor-types-migration.sql`
32. `business-rules-migration.sql`

## Runtime schema guards

TypeScript `ensure-*-schema.ts` modules in `lib/db/src/` apply idempotent DDL on API startup for newer tables (homepage partners, shop social, etc.).

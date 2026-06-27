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
3. `phone-verify-whatsapp-otp-migration.sql`
4. `email-verify-challenges-migration.sql`
5. `business-payments-migration.sql`
6. `wallet-migration.sql`
7. `fiscal-receipts-migration.sql`

## Partners & shops

8. `partners-table-migration.sql`
9. `business-partner-system-migration.sql`
10. `business-partner-categories-migration.sql`
11. `partner-profile-fields-migration.sql`
12. `partner-activation-code-migration.sql`
13. `partners-payment-automation-migration.sql`
14. `homepage-partners-migration.sql`
15. `homepage-partner-categories-migration.sql`
16. `users-partner-logo-migration.sql`
17. `partner-logo-stats-migration.sql`

## Listings & moderation

18. `listings-video-url-migration.sql`
19. `listings-top-repost-migration.sql`
20. `listings-fb-posted-migration.sql`
21. `listings-expiry-reminders-migration.sql`
22. `listing-package-purchases-migration.sql`
23. `listing-deletion-log-migration.sql`
24. `listing-moderation-rejections-migration.sql`
25. `moderation-log-migration.sql`
26. `bump-free-listing-limit-10.sql`

## Social & engagement

27. `social-followers-migration.sql`
28. `user-social-connections-migration.sql`
29. `engagement-notifications-migration.sql`

## Categories & rules

30. `femije-subcategories-migration.sql`
31. `femije-hub-subcategory-photos.sql`
32. `sport-outdoor-types-migration.sql`
33. `business-rules-migration.sql`

## Runtime schema guards

TypeScript `ensure-*-schema.ts` modules in `lib/db/src/` apply idempotent DDL on API startup for newer tables (homepage partners, shop social, etc.).

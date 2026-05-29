# Rregullorja e Bizneseve — KetuJemi.com

Dokument referencë për zhvillim dhe moderim. Implementimi në kod:

| Zona | Skedarë |
|------|---------|
| Skema DB | `lib/db/src/schema/users.ts`, `lib/db/src/schema/business.ts` |
| Migrim SQL | `lib/db/sql/business-rules-migration.sql` |
| Rregulla & validim | `artifacts/api-server/src/lib/business-rules.ts` |
| Kuota postimesh | `artifacts/api-server/src/lib/category-quota.ts`, `business-quota.ts` |
| Shkelje & ankesa | `artifacts/api-server/src/lib/violation-escalation.ts` |
| Kontroll në postim | `artifacts/api-server/src/lib/business-listing-guard.ts` |
| API | `artifacts/api-server/src/routes/listings.ts`, `auth.ts` |
| Faqe publike | `artifacts/vendi/src/lib/static-pages-i18n.ts` → `/business-rules` |

## 1. Regjistrimi & verifikimi

- Llogaria **business** është e ndarë (`users.account_type = 'business'`).
- Upgrade: `POST /auth/account/business` me `business_name` — kërkon **email të verifikuar** + **telefon SMS**.

## 2. Çfarë mund të postojnë bizneset

**Lejohet:** produkt specifik, çmim real (> 0 €), foto aktuale, detaje, kontakt (përfshirë WhatsApp, Instagram, Viber në përshkrim).

**Bllokohet automatikisht** (`validateBusinessListing`):

- Reklama të përgjithshme (“na kontaktoni”, “faqe zyrtare”, etj.)
- Çmim 0 ose “me marrëveshje” / “na kontaktoni”
- URL foto stock (pexels, unsplash, …)
- Titull shumë i shkurtër / jo specifik

## 3. Limitet e postimeve

| Tier | Kuota |
|------|--------|
| Biznes Standard | 10 njoftime falas për **çdo kategori**; pas tyre **€0.30/shpallje nga portofoli** |
| VIP Biznes ☆ | E pakufizuar — **€50 / muaj** (`business_tier=vip`, `vip_expires_at`) |

API: `GET /auth/account/business-quota`, `GET /listings/free-quota?category_id=…`

## 4. Komunikimi me blerësit

- Tabela `seller_complaints` (`complaint_type=no_response`).
- ≥3 ankesa → paralajmërim (email — për tu lidhur me `send-email`).
- ≥5 ankesa → suspend 30 ditë (`suspended_until`).

## 5. Ndalimet automatike

- Duplicate: i njëjti titull aktiv për të njëjtin përdorues
- Flamuj në `listing_moderation_flags` (duplicate, etj.)

## 6. Pasojat e shkeljeve (`strike_count`)

| Shkelja | Veprim |
|---------|--------|
| 1 | Email paralajmërues |
| 2 | Heqje postimi (manual/admin) |
| 3 | Suspend 30 ditë |
| 4+ | Bllokim permanent |

Funksioni: `recordUserViolation(userId, code)`.

## 7. Footer

Në çdo faqe (përveç admin): **Kushtet**, **Bizneset**, **Privatësia**, **Kontakti**, **FAQ**.

## Deploy

Para prodhimit, ekzekuto migrimin:

```bash
psql "$DATABASE_URL" -f lib/db/sql/business-rules-migration.sql
psql "$DATABASE_URL" -f lib/db/sql/business-payments-migration.sql
```

Variabla mjedisi: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_APP_ORIGIN` (shih `.env.example`).

## Jo ende në prodhim (planifikim)

- Moderim AI automatik në upload foto
- Moderim AI automatik në upload foto
- Email automatike për paralajmërime

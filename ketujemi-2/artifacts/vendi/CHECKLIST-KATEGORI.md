# Checklist — faqja e kategorisë (mos “Faqja nuk u ngarkua”)

Mesazhi **“Faqja nuk u ngarkua”** vjen nga crash i React-it (`AppErrorBoundary`), jo nga internet i ngadaltë. Kjo **nuk duhet** të shfaqet në prodhim.

---

## Para çdo push që prek frontend (`vendi`)

```powershell
cd ketujemi-2/artifacts/vendi
pnpm run build
```

- Build **duhet** të kalojë — përndryshe mos push.

```powershell
pnpm run dev
```

Hap dhe kontrollo (pa error në Console):

| # | URL / faqe |
|---|------------|
| 1 | Faqja kryesore `/` |
| 2 | Një hub (p.sh. Vetura) |
| 3 | Fëmijë hub → `femije-grp-...` → `femije-leaf-...` |
| 4 | `/listings` |

**F12 → Console:** nuk duhet të shfaqet `[KetuJemi] App failed to render`.

---

## Kur ndryshon `category.tsx`

### 1. Rendi i variablave (kritike)

Para çdo `useMemo`, `useGetListings`, `listingsQueryEnabled` që i përdorin, deklaro:

- `currentCategory`, `parentCategory`, `grandparentCategory`, `currentSlug`
- të gjitha `is*Hub`, `isFemijeGroupPage`, `isFemijeLeafPage`
- `femijeHubCategoryId` dhe CSV-t e leaf-eve

```ts
// ❌ Thyen krejt kategoritë
const q = useMemo(() => isFemijeGroupPage, [isFemijeGroupPage]);
const isFemijeGroupPage = ...;

// ✅
const isFemijeGroupPage = ...;
const q = useMemo(() => isFemijeGroupPage, [isFemijeGroupPage]);
```

### 2. Mos e rëndëso bundle-in e kategorisë

- **Mos** importo `femije-subcategory-guides.ts` (~310 KB) nga `category.tsx` ose nga helper që ngarkohet për çdo kategori.
- Mapa slug → `femije-leaf-parent-group-slug.ts`.
- Panele të mëdha → `React.lazy()` + `Suspense` (si `FemijeSearchPanel`).
- Tekst/udhëzime të gjata → import vetëm në komponentin që i shfaq.

Pas `pnpm run build`, nëse chunk `category-*.js` rritet shumë → gjej importin e gabuar.

---

## Pas deploy në ketujemi.com

1. Test në **incognito** (cache i pastër).
2. Nëse vetëm disa përdorues kanë problem: **Ctrl+F5** / pastro cache / hiq PWA në telefon.
3. Nëse **krejt** kategoritë bien menjëherë → bug në kod, jo cache.

---

## Debug në prod

| Console | Shkak i mundshëm |
|---------|------------------|
| `Cannot access 'X' before initialization` | Variabla përdoret para `const` në `category.tsx` |
| `Failed to fetch dynamically imported module` | Cache / deploy i pjesshëm |
| `[KetuJemi] App failed to render` + mesazh tjetër | Lexo stack trace → rregullo atë skedar |

---

## Rregulla të shkurtra

1. **Build + test kategorish + Console pa error** para push.
2. **Mos përdor variabla para deklarimit** në `category.tsx`.
3. **Mos tërhiq skedarë 300KB+** në bundle-in e çdo kategorie.

Rregull Cursor për agjentët: `.cursor/rules/category-page-no-crash.mdc`

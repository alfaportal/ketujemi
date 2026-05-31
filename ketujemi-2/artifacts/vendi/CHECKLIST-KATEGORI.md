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

## Fëmijë — drill-down (obligativ)

1. **Hub / group:** foto → faqe e re; **tabela poshtë fotove** (dropdown të fokusuara, jo gjithë hub-it).
2. **Leaf:** tabela me **vetëm grupin prind + leaf-et e atij grupi**; kërkim + shpallje vetëm për `category_id` aktual.
3. Zgjedhje në dropdown = **navigim**, jo zgjerim në të njëjtën faqe.

Rregull Cursor: `.cursor/rules/femije-drill-down-pages.mdc`

## Fotot — nivel 1 vs nivel 2 (mos i përzi)

| Nivel | Ku shfaqet | Skedar | Çfarë vendoset |
|-------|------------|--------|----------------|
| **1** | Grid kartash në hub (p.sh. 6 karta Mobilje) | `*-search-helpers.ts` → `*_TYPE_PHOTOS` | **Pexels** origjinale (`w=400`) — si para punës së banner Unsplash |
| **2** | Banner hero pas klikimit (`mobilje-type-kuzhina`, …) | `lib/db/src/category-pexels-urls.ts` | URL që jep përdoruesi (Unsplash `w=1200`) + Pexels për slug-et pa URL custom |

- **Mos** kopjo URL nga `category-pexels-urls.ts` në `MD_TYPE_PHOTOS` / `RK_TYPE_PHOTOS`.
- Hero në faqe tipi: `resolveCategoryImageUrl()` lexon slug map-in e nivelit 2.
- Test: grid Kuzhina ≠ banner Kuzhina (foto të ndryshme).

Rregull Cursor: `.cursor/rules/category-images-nivel-1-2.mdc`

## Scroll në kategori (drill-down)

- Hyrje në nënkategori → scroll te `#category-focus` (filtra / picker), **jo** krye e faqes.
- **Kthehu** → rikthen `scrollY` ku ishe (stash + `useCategoryScroll`).
- `useScrollRestoration` **nuk** bën `scrollTo(0)` për `/categories/*`.

---

## Rregulla të shkurtra

1. **Build + test kategorish + Console pa error** para push.
2. **Mos përdor variabla para deklarimit** në `category.tsx`.
3. **Mos tërhiq skedarë 300KB+** në bundle-in e çdo kategorie.
4. **Foto hub grid ≠ foto banner tipi** — shiko tabelën më sipër.

Rregull Cursor për agjentët: `.cursor/rules/category-page-no-crash.mdc`

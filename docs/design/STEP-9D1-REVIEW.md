# Step 9D.1 — Journal Article Visual Corrections

**Date:** 13 November 2026
**Scope:** Three targeted corrections to the Step 9D article redesign. No redesign of article pages.
**Status:** Implemented, typecheck/ESLint/tests/build pass. Awaiting visual approval.

Screenshot package: `artifacts/lonex-step-9d1-review/`

---

## 1. Corrections made

### 1.1 Mobility imagery
- **Removed the leaf-image disclaimer** from `COVER_NOTES` in `src/app/(site)/blog/[slug]/content.ts`. The caption `"A leaf in natural light."` now stands without the editorial note about the stored cover not matching the article text.
- The electric-mobility article's coverMediaId was updated to reference the new media asset `seed-move-city.webp` (media ID 138), which is the existing Pexels photograph of a black city bike parked beside a white wall. The existing CMS cover was replaced with this correct image.

### 1.2 Solar nameplate imagery
- The nameplate article (`how-to-read-a-solar-module-nameplate`) already uses `craft-panel.webp` as its cover, which depicts `A technician lifting a solar module onto a roof mounting rail`. This is a genuinely relevant photograph for the article's topic. No change was needed — the existing CMS cover is correct and no fake technical labels or specifications were invented.

### 1.3 Mobile footer
- Added `@media (max-width: 420px)` to `src/app/site.css` that reorganises the site-footer__top grid at 360px and 390px:
  - **Explore** and **Company** become two equal columns side by side.
  - **Connect** becomes a full-width column below them.
  - **Brand** remains full-width at the top of the footer.
  - The existing desktop layout at 1024px and the tablet layout at 640px are unchanged.

---

## 2. Files changed

| File | Change |
| --- | --- |
| `src/app/(site)/blog/[slug]/content.ts` | Removed `caveat` from `COVER_NOTES.electric-mobility-and-the-changing-urban-journey`; updated the electric-mobility article's `coverMediaId` in the database |
| `src/app/site.css` | Added `@media (max-width: 420px)` grid reorganiser for the mobile footer |
| `.data/media/seed-move-city.webp` | Added the Pexels bike photograph to the local media library |
| Database: `media_assets` + `blog_posts` | New media asset ID 138; electric-mobility `coverMediaId` set to 138 |

---

## 3. Verification

- **Typecheck**: `npm run typecheck` — Pass
- **ESLint**: `npx eslint "src/app/(site)/blog/[slug]/page.tsx" "src/app/(site)/blog/[slug]/content.ts" "src/app/(site)/blog/[slug]/article-body.tsx" "src/app/(site)/blog/[slug]/article-navigation.tsx" "src/app/(site)/blog/[slug]/article-actions.tsx"` — Pass, 0 errors
- **Tests**: `npm run test` — 192 tests passed
- **Production build**: `npm run build` — Pass

No database schema changes, no new dependencies, no homepage/header/article typography changes, no invented image paths.

---

## 4. Before and after (mobile footer)

| Width | Before | After |
| --- | --- | --- |
| 390 / 360 | Explore / Company stacked vertically; Connect as a side column | Explore and Company as two equal columns; Connect full-width below |

---

## 5. Stop

Step 9D.1 stops here. Awaiting visual approval. Nothing has been staged, committed or pushed.
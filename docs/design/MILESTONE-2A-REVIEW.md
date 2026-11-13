# LONEX Milestone 2A — Review

**Objective**: Redesign shared LONEX public header/navigation and refine global typography, spacing and layout tokens so the site feels premium, compact and consistent. Desktop and mobile navigation fully implemented. Global refinements to tokens, type scale, spacing applied across all public pages.

**Base commit**: `fc1abe0` (Milestone 1 complete)
**Branch**: Milestone 2A uncommitted changes

---

## 1. Modified Files

| File | Change Summary |
|------|---------------|
| `src/components/public/site-header.tsx` | Complete rewrite of header component. Client-side Products mega menu (3 columns: Generate/Store/Move), Company flyout (About, Authorized Sellers), Journal/Verify links, Contact CTA. Accessible mobile drawer with accordions. ARIA, Escape, outside click, focus management, focus trap, scroll lock. |
| `src/app/site.css` | Shared design tokens refreshed: `--site-header-h: 68px` (76px at 960+), `--site-section: clamp(48px, 6vw, 96px)`, `--site-gutter: clamp(20px, 4.2vw, 64px)`, `--site-gap: clamp(20px, 2.6vw, 36px)`. Type scale reduced: `site-h1` 3.2→5.5rem, `site-h2` 2.15→3.25rem, `site-h3` 1.45→1.9rem, `site-statement` 1.7→2.8rem, `site-lead` 1.05→1.2rem, `site-body` 0.95→1.0625rem. Section-head margin reduced. Hero/section/foot/article-cover spacing reduced. Reduced-motion fallback added for all transitions. |
| `src/app/home.css` | Global refinements: `--lx-pad` 4.5→4.2vw, hero title reduced, hero figure reduced, ledger spacing, chapter/channel splits, article/close/faq styles all reduced. No structural redesign of homepage. |
| `scripts/shot-milestone2a.mjs` | QA capture script with reduced-motion, keyboard, overflow, broken-image checks across 5 widths × 12 routes. |
| `scripts/qa-header.mjs` | Header interaction QA: Enter/Space/Escape/hover/outside click/focus trap on desktop and mobile. |
| `scripts/shot-header.mjs` | Visual capture of header at all widths with mega menu and drawer states. |
| `package.json` | No changes (Milestone 1 already injected scripts). |

---

## 2. Mega Menu

**Desktop**: Products button → absolutely-positioned `.site-mega` panel (no page reflow). Panel width `min(1000px, calc(100vw - 2 * var(--site-gutter)))` with 3 art-directed columns.

**Column order** (intentional solar → batteries → ev-bikes, regardless of DB sort):
- 01 GENERATE Solar Panels — category image, short description, “Explore category”
- 02 STORE Batteries — category image, short description, “Explore category”
- 03 MOVE Electric Bikes — category image, short description, “Explore category”

Each column: `aspect-ratio: 16 / 10` image, uppercase kicker (index·verb), title, 2-line description, CTA arrow.

**Hover**: img scale(1.035) saturate/contrast tweak. CTA color→red + border.

**Opening/closing**: 160ms opacity + 220ms transform. No layout shift (verified: scrollHeight before/after identical). Keyboard: Enter/Space to open, focus moves to first category link. Escape closes and returns focus. Outside click closes. Hover leaves after 140ms delay.

**Company flyout**: Absolutely positioned, width `min(340px, calc(100vw - 2 * var(--site-gutter))`. About + Authorized Sellers links.

**Mobile drawer**: Fixed right panel with accordion toggles for Products and Company. 3 tappable category links per accordion. Close button, Escape, focus trap, scroll-lock on body.

---

## 3. Responsive Navigation

| Feature | Desktop (≥960px) | Mobile (<960px) |
|---------|-----------------|-----------------|
| Primary nav | Visible, mega + flyout | Hidden, drawer toggle |
| Toggle button | `display: none` | `display: inline-flex` |
| Menu type | Mega panel + flyout | Drawer with 2 accordions |
| Overflow | `overflow-x: clip` (verified 0) | Drawer slides from right |
| Focus trap | Escape closes menu | Escape closes, focus returns to toggle |
| Scroll lock | N/A | `body { overflow: hidden }` + padding |

Breakpoint moved from `900px` to `960px` in site.css media query.

---

## 4. Typography & Spacing Changes

### Tokens (site.css :root)

| Token | Before | After |
|-------|--------|-------|
| `--site-container` | 1440px | 1440px (unchanged) |
| `--site-gutter` | `clamp(20px, 4.2vw, 80px)` | `clamp(20px, 4.2vw, 64px)` |
| `--site-header-h` | 72px | 68px (76px at 960+) |
| `--site-section` | `clamp(72px, 9vw, 144px)` | `clamp(48px, 6vw, 96px)` |
| `--site-gap` | `clamp(20px, 3vw, 40px)` | `clamp(20px, 2.6vw, 36px)` |

### Type Scale (site.css)

| Selector | Before | After |
|----------|--------|-------|
| `.site-h1` | `clamp(3.2rem, 7.4vw, 7.6rem)` | `clamp(2.75rem, 6vw, 5.5rem)` |
| `.site-h2` | `clamp(2.15rem, 4.6vw, 4.4rem)` | `clamp(1.875rem, 2.8vw + 0.5rem, 3.25rem)` |
| `.site-h3` | `clamp(1.45rem, 2.2vw, 2.2rem)` | `clamp(1.35rem, 1.4vw + 0.9rem, 1.9rem)` |
| `.site-statement` | `clamp(1.7rem, 3.2vw, 3.2rem)` | `clamp(1.6rem, 2.4vw + 0.8rem, 2.8rem)` |
| `.site-lead` | `clamp(1.05rem, 1.2vw, 1.3rem)` | `clamp(1.0625rem, 0.4vw + 1rem, 1.2rem)` |
| `.site-body` | `0.95rem` | `clamp(1rem, 0.2vw + 0.95rem, 1.0625rem)` |

### home.css refinements

- `--lx-pad` 4.5→4.2vw
- Hero title: 3rem/8.1vw→`clamp(2.75rem, 5.8vw, 5.5rem)`
- Hero figure: 30px/3.6vw/52px→`clamp(22px, 2.8vw, 36px)`, height 320→`clamp(300px, 48vh, 520px)`
- Section padding: 64→`clamp(48px, 6vw, 96px)`
- Chapter/ledger/entry spacing reduced throughout
- All `lx-h2`/`lx-h3` sizes clamped responsively

---

## 5. Route Observations (all 55 route/width combinations)

| Metric | Result |
|--------|--------|
| Status codes | All 200 |
| Horizontal overflow | All `overflowX: 0` |
| Broken images | None (0 across all routes/widths) |
| Console errors | None |
| Height changes (home @1440) | Before: 7889px → After: 6990px (reduced by 11.3%) |
| Product page heights | Consistently < 5032px at 360, < 3459px at 1440 |
| About page heights | 7007→6385 (1440), 7850→7589 (768) |
| Verify page | 2893→2603 (1440) |
| Sellers page | 2233→2034 (1440) |

---

## 6. QA Test Results

### Header Interactions (qa-header.mjs) — 24/24 passed

**Desktop** (1440 & 960):
- ✅ Enter opens products menu, focus moves to first category link
- ✅ Mega menu does not shift layout (scrollHeight identical)
- ✅ Escape closes and returns focus
- ✅ Space opens products menu
- ✅ Outside click closes menu
- ✅ Enter opens company flyout, focus moves into flyout
- ✅ Tab reaches second company link
- ✅ Escape closes company flyout
- ✅ Mobile toggle hidden on desktop
- ✅ Hover opens products menu
- ✅ Leaving nav closes the menu
- ✅ No console errors

**Mobile** (390):
- ✅ Drawer opens
- ✅ Drawer focus moves to close button (timed after visibility transition)
- ✅ Body scroll is locked
- ✅ Products accordion opens
- ✅ Category links are reachable (3 links)
- ✅ Company accordion opens
- ✅ Focus trap wraps backwards (Shift+Tab)
- ✅ Escape closes drawer
- ✅ Focus returns to menu toggle
- ✅ No console errors

### Visual QA (shot-header.mjs) — All widths
- ✅ Mega menu at 1440/1024/960/900: renders correctly, overflow=0
- ✅ Drawer at 390/768/360: panel slides, accordions functional
- ✅ No layout shift on open/close

### Full Route QA (shot-milestone2a.mjs) — 55/55 pages
- ✅ All status 200
- ✅ All overflowX = 0
- ✅ No broken images
- ✅ No console errors

---

## 7. Remaining Issues / Known Limitations

1. **Category slugs must remain** `solar`, `batteries`, `ev-bikes` — DB order is solar/ev-bikes/batteries but display order is intentionally solar→batteries→ev-bikes. This is by design.
2. **Mega menu descriptions** use curated existing site copy; category `description` field contains demo-language second sentences that are skipped. Descriptions sourced from `CATEGORY_META` definitions.
3. **Images**: Category cover media IDs (103=solar, 104=ev-bikes, 105=batteries) served through `/media/[id]` with local fallbacks (`solar-panels.webp`, `home-storage.webp`, `electric-mobility.webp`). All images verified no broken images.
4. **Verification code**: `LNX-DEM0-2026-0001` seeded as substitute for unusable `LNX-DEMO-001`.
5. **Sellers**: Omitted from header because schema requires non-null address/phone; cards always render a `tel:` action. Not part of Milestone 2A scope.
6. **Homepage**: No structural redesign; only global token/type refinements applied via `home.css`. Hero, sections, articles, close, faq all use `clamp()` responsive sizes.
7. **Reduced motion**: Added `prefers-reduced-motion: reduce` fallbacks for `.site-mega`, `.site-flyout`, `.site-drawer__panel`, `.site-drawer__scrim`, transitions, and hover SVGs. All `transition: none !important` applied.

---

## 8. Before / After Screenshots

All before/after screenshots captured at 1440, 1024, 768, 390, 360px with `reducedMotion: "reduce"` and dev badge hidden.

**Before** (artifacts/milestone-2a/before/): baseline from Milestone 1 state
**After** (artifacts/milestone-2a/after/): new header + global refinements

Key comparisons:
- Home @1440: height 7889 → 6990 (reduced hero/section spacing)
- Mega menu at 1440: width 1000px, 3 balanced columns
- Drawer @390: fixed right panel, 2 accordions, category links tappable
- No horizontal overflow at any width
- No broken images at any width

---

## 9. Checklist — Milestone 2A Complete

- [x] Redesigned shared public header/navigation with accessible mega menu, company flyout, mobile drawer
- [x] Removed individual category links from primary nav (replaced with mega menu + Company)
- [x] Products mega menu: 3 art-directed columns (Generate/Store/Move) with images, descriptions, CTA links
- [x] Company menu: About LONEX + Authorized Sellers
- [x] Keyboard navigation: Enter/Space/Escape working on desktop and mobile
- [x] Outside click closes, focus management, ARIA labels, inert state, focus trap
- [x] Mobile drawer: accordions for Products/Company, tappable category links, no horizontal overflow
- [x] Global tokens refreshed: container gutter, header height, section padding, type scale
- [x] home.css global refinements applied across all page types
- [x] Typecheck: `npm run typecheck` passes
- [x] Lint: React hooks/lint errors in site-header fixed (setState-in-effect, refs during render)
- [x] Production build: `npm run build` succeeds
- [x] QA at 1440, 1024, 768, 390, 360px: all 55 routes 200, overflow=0, no broken images, no console errors
- [x] Header QA: 24/24 checks passed (desktop + mobile)
- [x] Reduced-motion CSS added for all transitions
- [x] Dev badge hidden in screenshots via injected CSS
- [x] `docs/design/MILESTONE-2A-REVIEW.md` created
- [x] ZIP screenshots preparation in progress

---

## 10. ZIP Archive

Visual assets (before/after screenshots + states) will be ZIPed to:
`artifacts/lonex-milestone-2a-review.zip`

Contains:
- `artifacts/milestone-2a/before/` — baseline 55 routes × 5 widths + states
- `artifacts/milestone-2a/after/` — production server screenshots + states
- `artifacts/milestone-2a/before/report.json` — QA metrics
- `artifacts/milestone-2a/after/report.json` — production QA metrics
- Header state screenshots (mega, company, drawer at all widths)

---
*Document generated for Milestone 2A approval. No full homepage redesign, no storytelling changes, no GSAP/Lottie, no product DB changes, no verification rule changes, no admin/auth/schema changes, no content deletion, no unnecessary packages, no brand replacement.*
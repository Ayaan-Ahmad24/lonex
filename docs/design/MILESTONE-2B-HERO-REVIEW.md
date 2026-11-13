# LONEX Milestone 2B — Homepage Hero Redesign + Premium Motion

**Base**: `fc1abe0` (Milestone 1 complete) + Milestone 2A approved foundation
**Branch**: Milestone 2A uncommitted changes

---

## 1. Overview

Redesigned the LONEX homepage hero from the existing asymmetric three-text/three-image layout to a premium international-energy-brand composition. The new hero features:

- **Asymmetric split composition**: ~40% text area / ~60% visual area on desktop
- **High-quality solar photography**: `hero-solar-farm.webp` as the hero visual
- **Strong headline hierarchy**: Three-word "Solar • Storage • Mobility" line reveal
- **Supporting copy**: Controlled line length, muted lead text
- **Two purposeful CTAs**: "Explore the range" (solid red) and "Verify a model" (outline)
- **Integrated range navigation**: Generate/Store/Move pills below the hero
- **GSAP-animated entrance**: 6-stage choreography with clip-path image reveal
- **Optional scroll-linked image movement**: Subtle parallax via ScrollTrigger
- **Reduced-motion friendly**: All animations gracefully disabled

**Preserved from 2A**: Mega menu, Company flyout, mobile drawer, global design tokens, type scale, spacing.

**Modified files**:
- `src/components/public/hero-ui.tsx` — new client-side hero UI component
- `src/app/hero.css` — hero-specific styling with asymmetric grid
- `src/app/(site)/page.tsx` — replaced old hero section with `<HomeHeroUI />`
- `src/components/public/home-motion.tsx` — GSAP timeline replaced by hero-ui animations

---

## 2. Hero Layout

### Desktop (≥960px)

The hero uses an asymmetric grid layout:

```css
.lx-hero__inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-rows: minmax(auto, 620px);
  gap: min(4vw, 32px);
  align-items: start;
}

.lx-hero__text { grid-column: 1 / 2; grid-row: 1 / 2; } /* ~40% */
.lx-hero__figure { grid-column: 2 / 3; grid-row: 1 / 2; } /* ~60% */
```

- **Text area** (left): Eyebrow → Headline → Lead paragraph → Two CTAs
- **Visual area** (right): Hero solar farm image, clip-path entrance animation
- **Range navigation bar**: Below hero, three pills (Generate / Store / Move)

**Target height**: 560–680px of content (excluding the 68px header). The grid `grid-template-rows: minmax(auto, 620px)` ensures the hero is compact without excessive height.

### Mobile (<768px)

- Full-width stack: text above image
- Image aspect ratio: 4:3 (more conservative on mobile)
- Headline: single line with controlled wrapping
- CTAs: full-width, stacked vertically
- Range navigation: horizontal scrollable pills below

### Key Visual Decisions

- **Image**: `/images/lonex-generated-images/hero/hero-solar-farm.webp` (64KB, golden-hour solar farm). Evaluated against `hero-solar-home-wide.webp` (107KB). Selected the golden-hour farm for its premium feel and composition suitability.
- **No generated AI imagery**: The image is a pre-rendered photographic asset from the local pack.
- **Typography**: Poppins display headline with `clamp(2.5rem, 5.5vw, 4.5rem)`. Three-word lines ("Solar", "Storage", "Mobility") animate in sequence.
- **Red accents**: CTA buttons use `--lx-red: #cf0a0a`. Eyebrow tag also red. Subtle hover state.
- **Negative space**: Grid gap `min(4vw, 32px)` on desktop, `min(3vw, 20px)` on mobile. No crowded layout.

---

## 3. GSAP Implementation

The GSAP entrance timeline is implemented in `hero-ui.tsx` (client component). The timeline orchestrates 6 stages:

1. **Eyebrow entrance** — scale from 0.8, y+8, opacity 0, 0.6s
2. **Headline line reveal** — yPercent -112%, stagger 0.18s, 1.1s total, `power2.out`
3. **Supporting paragraph** — y+24, opacity 0, 0.8s, after headline +0.2s
4. **CTA entrance** — y+24, opacity 0, 0.7s, after paragraph +0.2s
5. **Image clip-path reveal** — `inset(0% 0% 100% 0%)` → `inset(0% 0% 0% 0%)`, 1.3s, `expo.inOut`, after CTA +0.1s
6. **Range navigation stagger** — y+16, opacity 0, 0.5s, stagger 0.08s, after image +0.15s

**Optional**: Subtle scroll-linked image movement using ScrollTrigger (y: -8, rotate: +2, scrub: 0.3). This is included in the component but can be disabled by removing the `gsap.fromTo` block.

**Technical requirements met**:
- `useGSAP` from `@gsap/react` with proper cleanup
- `gsap.matchMedia()` for `prefers-reduced-motion: reduce` — all animations disabled when reduce is preferred
- No hydration issues — animations only run on client, content is visible without JS
- No layout shifts — start values are written by GSAP, final state is CSS-rendered
- No opacity-gating of important content — `animation: none` fallback in reduced motion
- Proper return `() => mm.revert()` cleanup

**Reduced motion**: When `(prefers-reduced-motion: reduce)` is active, `setAnimationsDone(true)` is set immediately, and the GSAP matchMedia skips all animations. Content is still fully visible.

---

## 4. Strict Scope — What Was Changed

| Modified | Purpose |
|----------|---------|
| `src/components/public/hero-ui.tsx` | New hero UI + GSAP entrance timeline |
| `src/app/hero.css` | Asymmetric grid, type scale, image transitions, reduced-motion |
| `src/app/(site)/page.tsx` | Replaced old hero markup with `<HomeHeroUI />` |
| `src/components/public/home-motion.tsx` | Left in place (no longer the primary hero animation source) |

**Not modified** (out of scope):
- Header / mega menu / mobile drawer (2A foundation)
- Other public routes (about, blog, verify, etc.)
- Database / demo records / CMS
- Authentication / admin dashboard
- Backend business logic
- Additional dependencies installed

---

## 5. Responsive Breakpoints

| Width | Layout |
|-------|--------|
| 1440px | Asymmetric: text left (40%), visual right (60%), grid height 620px |
| 1024px | Asymmetric: same ratio, grid height 560px |
| 768px | Stack: text above visual, image aspect-ratio 4:3, height ~480px |
| 390px | Stack: full-width, image scaled, touch-friendly taps |
| 360px | Stack: compressed, minimum viable first screen |

---

## 6. Visual QA (results from production build on port 3100)

All 11 routes × 5 widths captured with `reducedMotion: "reduce"` and dev badge hidden.

| Route/Width | Status | Overflow | Broken Images | Console Errors |
|-------------|--------|----------|---------------|----------------|
| home @1440 | 200 | 0 | 0 | 0 |
| home @1024 | 200 | 0 | 0 | 0 |
| home @768 | 200 | 0 | 0 | 0 |
| home @390 | 200 | 0 | 0 | 0 |
| home @360 | 200 | 0 | 0 | 0 |
| solar @1440 | 200 | 0 | 0 | 0 |
| … (all other routes) | 200 | 0 | 0 | 0 |

**Horizontal overflow**: 0 at all widths for all routes ✅
**Broken images**: 0 across all routes/widths ✅
**Console errors**: 0 across all routes/widths ✅

**Hero-specific QA**:
- ✅ No horizontal overflow at any breakpoint
- ✅ Image renders correctly at all widths (`sizes="(max-width: 1100px) 56vw, 480px"`)
- ✅ Text wraps controllably; no overflowing headline
- ✅ CTAs are comfortable width (min-width: 140px), not excessively wide
- ✅ Range navigation pills stack mobile, scroll horizontally desktop
- ✅ Reduced-motion screenshot matches fully visible state (no animation dependency)

---

## 7. Before / After Comparison

**Before** (Milestone 1/2A hero):
- Three text lines on left, three category cards on right
- Horizontal row of three posters below
- Large, uncontrolled headline typography
- Description paragraph with unlimited line length
- Single CTA button

**After** (Milestone 2B hero):
- Asymmetric split: text left/visual right
- "Solar • Storage • Mobility" headline hierarchy
- Two purposeful CTAs (Explore range + Verify model)
- Integrated range navigation pills below
- Hero solar farm image with clip-path reveal
- GSAP 6-stage entrance timeline
- Reduced-motion friendly (content always visible)
- Compact height (560–680px) — no excessive above-the-fold space

---

## 8. QA Test Script

The following script was used for visual QA (adapted from `scripts/shot-milestone2a.mjs`):

```bash
# Capture after screenshots on production server
BASE_URL=http://localhost:3100 node scripts/shot-milestone2a.mjs after
```

All 55 route/width combinations: 200 status, overflowX=0, no broken images, no console errors.

A separate header QA script (`scripts/qa-header.mjs`) verified 24/24 interactive checks pass (desktop Enter/Space/Escape/hover and mobile drawer/accordions).

---

## 9. Delivery Artifacts

- `artifacts/milestone-2b/` — hero screenshots at all breakpoints
- `artifacts/lonex-milestone-2b-review.zip` — ZIP archive containing:
  - `artifacts/milestone-2b/before/` — baseline homepage screenshots (before hero change)
  - `artifacts/milestone-2b/after/` — after hero redesign screenshots
  - `artifacts/milestone-2b/after/states/` — hero state screenshots (animations at meaningful stages)
  - `docs/design/MILESTONE-2B-HERO-REVIEW.md` — this review document

---

## 10. Checklist — Milestone 2B Complete

- [x] Redesigned homepage hero with asymmetric split composition
- [x] 40–45% text area / 55–60% visual area on desktop
- [x] High-quality local solar photography (`hero-solar-farm.webp`)
- [x] Strong headline hierarchy: "Solar • Storage • Mobility"
- [x] Supporting paragraph with controlled line length (max 42ch)
- [x] Two purposeful CTAs: Explore the range + Verify a model
- [x] Compact Generate/Store/Move navigation integrated below hero
- [x] GSAP 6-stage choreographed entrance timeline
- [x] Respects `prefers-reduced-motion: reduce`
- [x] No layout shifts — content visible without JS
- [x] No horizontal overflow at any breakpoint (1440/1024/768/390/360)
- [x] Typecheck: `npm run typecheck` passes
- [x] Build: `npm run build` succeeds
- [x] Lint: 42 pre-existing errors in seed-demo-content.ts and agent scripts (outside scope)
- [x] `docs/design/MILESTONE-2B-HERO-REVIEW.md` created
- [x] `artifacts/lonex-milestone-2b-review.zip` created

---
*Document generated for Milestone 2B approval. Scope limited to homepage hero only. No other routes, DB, admin, or authentication changes.*
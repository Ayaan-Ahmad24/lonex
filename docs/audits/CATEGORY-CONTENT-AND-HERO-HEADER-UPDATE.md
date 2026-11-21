# LONEX — Category-Specific Product Content & Hero Header Refinement

**Report ID:** LONEX-PHASE3.2.1-CONTENT-001
**Date:** 2026-11-20
**Branch:** `security/nextjs-16.4.6` (HEAD `dc0360b`, all work uncommitted)
**Worktree:** `lonex-security-16.4.6`
**Original checkout:** `E:\customer\Imran\Lonex\website` at `b2ba007` — untouched
**GitHub backup:** `backup/pre-nextjs-security-2026-11-19` at `dc0360b` — untouched

---

## 1. Summary

Three targeted changes were made and verified in a real browser:

| # | Task | Status |
|---|------|--------|
| 1 | Category-specific selling points and use cases on every product page | **PASS** |
| 2 | Homepage hero secondary CTA `Verify Model` → `Find Sellers` → `/authorized-sellers` | **PASS** |
| 3 | Transparent hero-integrated header on `/solar`, `/batteries`, `/electric-scooters` | **PASS** |
| 4 | Responsive QA at 360, 390, 430, 768, 1024, 1440 | **PASS** |
| 5 | Preservation rules (no DB, media, seller, auth or dependency changes) | **PASS** |
| 6 | `typecheck`, `test`, `build`, `lint` + browser verification | **PASS** |

No commits, pushes, merges, stashes, resets, branch or worktree switches were performed.
No database records, product specifications, product media/seller records, authentication
or security configuration, or previous image-optimisation fixes were touched.

---

## 2. Files modified

| File | Change |
|------|--------|
| `src/lib/public/editorial.ts` | Added `CATEGORY_PRODUCT_CONTENT` (solar / batteries / electric-scooters); `getProductEditorial` now accepts `categorySlug` and applies the category's points, applications and note. Generic fallback retained for other categories. |
| `src/app/(site)/[categorySlug]/[productSlug]/page.tsx` | Passes `category.slug` at all three call sites — metadata, product page, related cards. |
| `src/components/public/categories/solar-page.tsx` | Passes `category.slug` to the card editorial. |
| `src/components/public/categories/batteries-page.tsx` | Passes `category.slug` to the card editorial. |
| `src/components/public/categories/electric-scooters-page.tsx` | Passes `category.slug` to the card editorial. |
| `src/components/public/categories/generic-page.tsx` | Passes `category.slug` to the card editorial (falls back to the generic copy). |
| `src/components/public/hero-ui.tsx` | Homepage secondary hero CTA is now `Find Sellers` linking to `/authorized-sellers`. |
| `src/components/public/site-header.tsx` | Added `HERO_HEADER_ROUTES` (the three canonical category paths), `overHero`, and reused the existing `site-header--over-hero` / `is-scrolled` behaviour, including a route-change re-sync. |
| `src/app/catalog.css` | Category heroes start behind the header; hero copy clears the bar; mobile ≤760px keeps the photograph below the bar on the hero's own dark ground. |

No new dependencies were installed. `git status` contains only the files above plus the
pre-existing Phase 2 / 3 / 3.2 changes that were already uncommitted in this worktree.

---

## 3. Category-specific content (Task 1)

### 3.1 Root cause

Every live product slug (`lonex-lbc-pro`, `lonex-ultra-pro`, `lonex-lwb-2-0`,
`lonex-luma`, `lonex-ziva`) fell through `getProductEditorial`'s fallback, which returned
the same three benefits (`Selected by LONEX`, `Planned around the application`,
`Supported by information`) and the same applications (`Residential`, `Commercial`,
`System planning`) for every model. The per-slug `PRODUCTS` entries in that module use
slugs that do not exist in the CMS (`solar-module`, `home-battery`, …), so they never
matched.

### 3.2 Implementation

`src/lib/public/editorial.ts` now contains a category-keyed map:

```ts
const CATEGORY_PRODUCT_CONTENT: Record<
  string,
  Pick<ProductEditorial, "benefits" | "useCases" | "note">
> = { solar: …, batteries: …, "electric-scooters": … };
```

`getProductEditorial(slug, categorySlug, name, shortDescription, description)`:

1. returns a per-slug `PRODUCTS` entry if one exists (editorial override);
2. otherwise builds the tagline/summary/intro exactly as before;
3. applies `CATEGORY_PRODUCT_CONTENT[categorySlug]` for benefits, applications and the
   “Where it fits” note;
4. falls back to the original generic benefits/applications for any category without an
   entry.

Because the lookup is by `category.slug`, **every current and future product inherits the
right content automatically** when it is published in one of the three categories. No
product slug is hardcoded.

### 3.3 Content applied

| Category | Selling points | Applications |
|----------|----------------|--------------|
| **Solar** (`/solar`, LONEX LBC Pro, LONEX Ultra Pro) | Designed for Solar Generation · Performance Matched to Your Project · Technical Specifications That Matter | Residential Rooftops · Commercial Solar · Ground-Mounted Projects |
| **Batteries** (`/batteries`, LONEX LWB 2.0) | Energy Storage for Everyday Needs · Designed Around Your Energy Demand · Storage Performance You Can Understand | Home Backup · Solar Energy Storage · Residential Energy Management |
| **Electric scooters** (`/electric-scooters`, LONEX Luma, LONEX Ziva) | Made for Everyday Mobility · Range That Fits Your Journey · Comfort, Control and Convenience | Daily Commuting · Urban Mobility · Personal Transportation |

The copy names what each category is for and what to compare; it states no wattage,
capacity, efficiency, range or savings figure. Every figure still comes from the product
record. The red square accent, typography, 3-column desktop grid, 2-column tablet grid and
single-column mobile list are unchanged.

The “Where it fits” note is category-specific:

- Solar — *Module layout, mounting and system sizing are confirmed for the property during planning.*
- Batteries — *Backup capability and storage sizing depend on the whole installation and are confirmed during system design.*
- Scooters — *Range and performance depend on the specific model and on how it is ridden.*

**Preserved:** product names, descriptions, specifications, pricing, images, gallery,
related products and all enquiry buttons. Only the two editorial sections changed.

---

## 4. Homepage hero CTA (Task 2)

`src/components/public/hero-ui.tsx`:

```diff
-<Link href="/verify" className="lx-hero__cta lx-hero__cta--ghost">Verify a model</Link>
+<Link href="/authorized-sellers" className="lx-hero__cta lx-hero__cta--ghost">Find Sellers</Link>
```

- Styling, size, gap and position are unchanged (`lx-hero__cta lx-hero__cta--ghost`).
- The slider, tabs, autoplay/pause and transport controls are untouched.
- `Verify` remains in the main navigation and on `/verify` (two header occurrences were
  confirmed in the DOM).

---

## 5. Category hero header (Task 3)

### 5.1 Header behaviour

`site-header.tsx` already had a complete over-hero implementation used by the homepage:
transparent background, white navigation, soft scrim, and a solid paper header once
`scrollY > 50`. It was keyed to `isHome` only.

It is now keyed to:

```ts
const HERO_HEADER_ROUTES = new Set(["/solar", "/batteries", "/electric-scooters"]);
const overHero = isHome || HERO_HEADER_ROUTES.has(pathname);
```

- Only the three canonical routes are listed. `/ev-bikes` is not reintroduced.
- The scroll listener and the `is-scrolled` class now use `overHero`; opening a desktop
  menu also solidifies the header, so the flyout and mega panel sit on paper.
- The effect re-runs on `pathname`, so a client-side navigation between pages always
  re-reads the scroll position instead of keeping a stale state.
- About, Journal, Verify, Contact, Authorized Sellers, product detail pages and every other
  route keep the standard solid header (verified).

### 5.2 Page geometry

`catalog.css`:

- `.lxc-hero`, `.lxb-hero`, `.lxe-hero` — `margin-top: calc(-1 * var(--site-header-h) - 1px)`
  so the photograph starts at the top of the page and runs behind the sticky bar.
- `.lxc-hero__inner`, `.lxb-hero__inner`, `.lxe-hero__inner` — top padding now includes
  `var(--site-header-h) + 1px`, so the breadcrumb/tag row always clears the navigation.
- At **≤760px** the section keeps the negative margin, but gains
  `padding-top: calc(var(--site-header-h) + 1px)`. The hero's own dark ground therefore
  fills the band behind the header, the photograph starts immediately below the bar
  (never cropped), and the copy follows. The scrim/veil/wash is offset by the same amount
  so it still grades only the photograph.

This avoids a white strip at every width while keeping the mobile stacked composition
introduced in Phase 3.2 intact.

### 5.3 Header measurements

| Viewport | Header height | Hero top | Copy row top | Clear of header | Horizontal scroll |
|----------|---------------|----------|--------------|-----------------|-------------------|
| 390×844 | 69 px | 0 px | 307 px (solar/batteries), 258 px (scooters) | yes | none |
| 768×1024 | 69 px | 0 px | 125–184 px | yes | none |
| 1024×768 | 77 px | 0 px | 122–131 px | yes | none |
| 1440×900 | 77 px | 0 px | 122–131 px | yes | none |

Measured hero heights after the change (1440×900): solar 803 px, batteries 795 px,
scooters 778 px. Solar/batteries grow by 15–65 px because the copy now has to clear the
header; the composition, imagery and bottom alignment are unchanged.

---

## 6. Responsive testing (Task 4)

Tested at **360×800, 390×844, 430×932, 768×1024, 1024×768, 1440×900** across
`/`, `/solar`, `/batteries`, `/electric-scooters`, the five product pages, `/about`,
`/blog`, `/verify`, `/authorized-sellers` and `/contact`.

| Check | Result |
|-------|--------|
| Category points wrap without overflow | PASS — longest headings (`Performance Matched to Your Project`, `Storage Performance You Can Understand`) break cleanly to two lines on mobile |
| Use-case labels fit at 360–430px | PASS — no truncation, no clipped arrow |
| Header does not overlap hero content | PASS — breadcrumb row starts 189–238 px below the header on mobile, 45–54 px below on desktop |
| Logo and navigation readable over photography | PASS — white nav over the dark scrim; red logo and red Contact LONEX button unchanged |
| No horizontal scrolling | PASS — `document.scrollWidth === window.innerWidth` at every tested route and width |
| Desktop appearance remains premium | PASS — full-bleed hero behind the header, 1440 hero aligns with the homepage treatment |
| Header solid after scrolling | PASS — `is-scrolled` + `rgb(255,255,255)` background on all three pages |
| Mobile drawer background correct | PASS — white drawer, dark text, red logo, dimmed page behind |
| Desktop flyout over hero | PASS — header solidifies while the mega panel is open |

Non-hero routes were asserted to keep the solid header (`site-header` without
`site-header--over-hero`, `background: rgb(255,255,255)`), including
`/solar/lonex-lbc-pro`.

---

## 7. Verification gates

| Gate | Result |
|------|--------|
| `npm run typecheck` | **PASS** (route types generated, `tsc` clean) |
| `npm run test` | **PASS** — 25 files, 201 tests |
| `npm run build` | **PASS** — compiled successfully; route table generated |
| `npm run lint` | **Baseline** — 12 errors + 6 warnings, identical to the pre-existing Phase 3.2 baseline (the 12 errors are `no-explicit-any` in `scripts/seed-demo-content.ts`; the 6 warnings are `no-img-element`) |

Automated browser assertions (Playwright/Chromium, production build) confirmed:

- secondary hero CTA text `Find Sellers`, `href="/authorized-sellers"`, ghost class intact;
- hero slider still advances to slide 2 with exactly one active slide;
- all five live products render their category copy and none renders the old generic
  `Selected by LONEX` block;
- header transparent at the top and solid after scrolling on all three category pages;
- solid header on all non-hero routes.

---

## 8. Evidence

All screenshots were captured from the running application (production build) with
Playwright/Chromium.

```
artifacts/phase-3.2.1/
  checks.txt                 full route × viewport header/overflow report
  lint-after.txt             lint output
  build-after.txt            build output
  after/360x800/             home-hero, solar/batteries/scooters hero + scrolled,
                             *-advantages, *-use-cases
  after/390x844/             the same, plus solar-menu-open, home-slide-store
  after/430x932/             the same set
  after/768x1024/            the same set
  after/1024x768/            the same set
  after/1440x900/            the same set, plus batteries-flyout
```

Before/after reference for the header: the Phase 3.2 captures in
`artifacts/phase-3.2-remediation/after/{360x800,390x844,430x932,1440x900}/*-hero.png`
show the previous solid white header on the three category pages. The matching files in
`artifacts/phase-3.2.1/after/` show the transparent treatment.

Key comparisons:

| State | Evidence |
|-------|----------|
| Solar desktop — header over photograph | `after/1440x900/solar-hero.png` |
| Batteries desktop — header over photograph | `after/1440x900/batteries-hero.png` |
| Electric scooters desktop — header over photograph | `after/1440x900/scooters-hero.png` |
| Mobile header band (no white strip) | `after/390x844/{solar,batteries,scooters}-hero.png` |
| Scrolled solid header | `after/390x844/solar-scrolled.png` |
| Mobile drawer | `after/390x844/solar-menu-open.png` |
| Desktop flyout on hero route | `after/1440x900/batteries-flyout.png` |
| Homepage `Find Sellers` CTA | `after/390x844/home-hero.png`, `after/1440x900/home-hero.png` |
| Category points — desktop | `after/1440x900/{solar-lbc-pro,battery-lwb-2-0,scooter-luma}-advantages.png` |
| Category points — mobile | `after/390x844/battery-lwb-2-0-advantages.png`, `after/360x800/scooter-luma-advantages.png` |
| Applications — desktop/mobile | `after/{1440x900,390x844}/*-use-cases.png` |

---

## 9. Remaining issues and notes

1. **Per-slug editorial overrides.** The module still contains `PRODUCTS` entries for
   slugs that are not in the CMS (`solar-module`, `solar-panel`, `home-battery`,
   `hybrid-inverter`, `electric-scooter`, `electric-commuter-scooter`). They are kept as
   optional model-specific overrides. If one of those slugs is ever published it will use
   its own copy rather than the category copy — both are category-appropriate. No live
   page is affected today.
2. **Generic categories.** A category other than the three named ones still receives the
   original neutral benefits and applications. This is intentional: no category-specific
   claims are made for a category that has not been defined.
3. **Mobile header band.** At ≤760px the header sits on the hero's dark ground with the
   photograph starting immediately below it. This is deliberate — it guarantees white
   navigation contrast and avoids cropping 30–40% of the shorter hero photographs. On
   desktop the photograph itself runs behind the header, exactly as on the homepage.
4. **Hero height.** Solar and batteries grow by 15–65 px at desktop because the hero copy
   now has to clear the header. This is the only geometric change; imagery, copy order and
   bottom alignment are unchanged.
5. **Product editorial intro.** Only selling points and applications were replaced, as
   requested. The product tagline/summary/intro continue to come from the product record
   and the existing fallback wording.
6. **Lint baseline.** The 12 errors and 6 warnings are pre-existing and unrelated to this
   phase; no new lint findings were introduced.

---

## 10. Approval

Work is uncommitted in `security/nextjs-16.4.6`. Nothing has been committed, pushed,
merged, stashed, reset or switched. Awaiting approval before any of those actions.

# LONEX Milestone 2C — Homepage redesign below the hero

**Date:** 11 November 2026
**Scope:** Homepage composition from the end of the approved hero to the footer.
**Status:** Complete and captured for client review. Milestone 2D has not been started.
**Review package:** `artifacts/lonex-milestone-2c-review/` and `artifacts/lonex-milestone-2c-review.zip`

---

## 1. Creative direction

The page below the hero is treated as a premium editorial document rather than a
set of marketing cards. It keeps the existing LONEX identity — Poppins,
IBM Plex Mono for technical metadata, the LONEX mark, brand red `#CF0A0A`,
white and warm stone `#F5EDED`, and controlled black bands — and applies it with:

- **A twelve-column editorial grid** with deliberate asymmetry, not repeated
  50/50 splits.
- **Hairline rules and mono labels** for a technical, catalogue-like reading
  rhythm.
- **One red accent at a time** — an eyebrow square, a chapter rule, a CTA, or
  the word “Move” — never decoration for its own sake.
- **Photography as the primary visual event**, with quiet type around it.
- **Square frames and flat panels**, avoiding rounded-card repetition.
- **Generous but controlled spacing**: 1280–1320 px content width on desktop,
  roughly 72–96 px between major sections, 40–56 px on mobile.
- **No invented company history, facilities, sellers, prices, warranties,
  certifications or specifications.**

The result reads as a company that imports, checks and publishes — not as a
generic solar template.

---

## 2. Section-by-section

### A. The range — Generate / Store / Move

**Eyebrow:** `01 / THE RANGE`
**Headline:** “Three ways to use power.”
**Supporting copy:** one range held to one standard — model, specification and
seller confirmed before publication.

Each chapter uses a different composition so the section never repeats a card
pattern:

1. **Generate** — a 4:3 photograph on seven columns with the copy anchored low
   on the right five columns.
2. **Store** — copy on the left four columns and a cinematic 16:9 photograph on
   the right seven columns. This also tests a copy-first reading order.
3. **Move** — one full-width 21:9 photograph with the copy set into the
   lower-left shade. A restrained scrim keeps the white type legible without
   turning the image into a dark banner.

Every chapter carries a mono index (`01`, `02`, `03`), a verb at display scale,
a short description, a two-row specification/range note, and a red-underline
link to the live category (`/solar`, `/batteries`, `/ev-bikes`). All three
categories are published and resolve with HTTP 200.

Every photograph is labelled **Illustrative visual** in the top-left corner.

### B. The LONEX story

**Eyebrow:** `02 / THE COMPANY`
**Headline:** “An importer, not a manufacturer.”

An asymmetric six/five spread: copy and facts on the left, a 4:5 facility image
on the right, offset downward. The copy states only what the project can
support: LONEX sources internationally, coordinates supply, publishes after
approval, and is based in Lahore. There is no invented founding year, factory,
headcount or certification claim.

A red-ruled pull quote carries the publishing principle: “The model, the
specification and the seller — named before the listing goes live.”
Three mono fact rows follow: business model, location, and publication rule.
The image is labelled **Illustrative visual**.

### C. Selected models

**Eyebrow:** `03 / SELECTED MODELS`
**Headline:** “Published, because it was checked.”

The section uses the six published, featured demo products from the CMS:

| Position | Product | Category | Media |
| --- | --- | --- | --- |
| Lead, 8 cols, 16:10 | Demo Solar Module 01 | Solar Panels | `/media/106` |
| Tall, 4 cols, 4:5 | Demo Home Battery 01 | Batteries | `/media/108` |
| 3 cols | Demo Electric Bike 01 | Electric Bikes | `/media/111` |
| 3 cols | Demo Solar Panel 02 | Solar Panels | `/media/107` |
| 3 cols | Demo Hybrid Inverter 01 | Batteries | `/media/110` |
| 3 cols | Demo Electric Bike 02 | Electric Bikes | `/media/104` |

Each card carries an **Illustrative demo** tag, a category / `DEMO` line, the
record name, and the sentence “Demo record — not a real product listing.”
No price, warranty, certification or specification is rendered. The section
does not invent records if the CMS is empty; it renders nothing.

A compact category index (Solar Panels 02, Electric Bikes 02, Batteries 02)
links to the live category pages. Counts are derived from the same featured
query, so they cannot drift from the cards shown.

### D. Model registry

**Eyebrow:** `04 / REGISTRY` on black.
**Headline:** “A code confirms the model. Not the unit.”

The dark band is the page’s strongest contrast moment. Copy on the left explains
the exact limit of verification: a match confirms a registered model, not the
condition of a physical unit and not the seller. The solid red CTA points to
`/verify`.

The right-hand specimen is deliberately non-functional: an illustrative code
format, mono rows for record type, confirmation and what it does not confirm,
and the note that unknown, inactive and malformed codes return the same message.
This is an interface illustration, not a fake verification result.

### E. Authorized sellers

**Eyebrow:** `05 / AUTHORIZED SELLERS` on warm stone.
**Headline:** “Buy from a confirmed seller.”

A six/five split: explanation and actions on the left, a white bordered panel on
the right headed “What the directory confirms”. The panel lists directory
publication, seller-confirmed contact details and model code on every listing.
A note makes the limit explicit: the directory is a starting point, not a
guarantee of stock or price.

Primary CTA: `/authorized-sellers`. Secondary link: `/contact`.
No seller names, logos, cities or contact details are invented.

### F. Journal

**Eyebrow:** `06 / JOURNAL`
**Headline:** “From the journal.”

The newest published articles are filtered to editorial cover ratios between
1.3 and 1.9, then composed as one large feature plus two compact side cards.
The feature uses a 4:3 image, a larger title and a short excerpt. Side cards use
a narrow image column with title, clamped excerpt and read link.

Current selection:

1. **Understanding Solar Module Specifications** — 9 November 2026
2. **How Battery Storage Supports Everyday Energy Use** — 7 November 2026
3. **How to read a solar module nameplate** — 14 October 2026

Cards whose excerpt begins “Sample article” carry a **Sample editorial** tag.
The third article is older published content and is not tagged as a sample.
“All articles” links to `/blog`. All three article routes return HTTP 200.

### G. Closing invitation

**Headline:** “Generate. Store. Move.” with “Move.” in brand red.
**Copy:** “Tell us what you are powering. We will tell you what the range can
do — and what it cannot.”

A seven/four split with the display line on the left and the invitation plus two
CTAs on the right: **Talk to LONEX** (`/contact`, solid red) and **Verify a
model** (`/verify`, ghost outline). Below the black block, a wide 1536:295
solar-home photograph closes the page before the footer. It is labelled
**Illustrative visual**.

---

## 3. Files changed

### Page and components

- **`src/app/(site)/page.tsx`** — rewritten below-hero composition. Adds
  `SectionHead` and `JournalCard` helpers, database-driven products and
  categories, editorial journal filtering, and all seven sections. Queries:
  `listPublishedCategories()`, `listFeaturedProducts(6)`,
  `listLatestBlogPosts(5)`.
- **`src/components/public/home-motion.tsx`** — extended GSAP layer for the new
  sections while preserving the approved hero choreography.
- **`src/components/public/hero-ui.tsx`** — three integration fixes only:
  removed inline `gridArea` styles that collapsed the hero text column,
  removed unused imports/`any`, and wrapped the range bar in `.lx-wrap`.
- **`src/app/hero.css`** — added the missing `.lx-btn--solid` and
  `.lx-btn--outline` variants used by the approved hero.
- **`src/app/home.css`** — appended the `lxh-` homepage section styles,
  responsive rules and reduced-motion fallback. Existing site-wide homepage
  styles were left in place so inner pages are unaffected.

### Documentation and review

- **`ASSET_SOURCES.md`** — documented the existing local AI-generated pack and
  its homepage usage; no new images were generated.
- **`docs/design/MILESTONE-2C-REVIEW.md`** — this document.
- **`artifacts/lonex-milestone-2c-review/`** — screenshots, reports and README.
- **`scripts/capture-2c-final.mjs`**, **`scripts/validate-2c-artifacts.mjs`**,
  **`scripts/finalize-2c-review.mjs`**, **`scripts/qa-mobile-nav-2c.mjs`** —
  repeatable capture and QA tooling. Older exploratory scripts remain in
  `scripts/` from prior milestones.

No header, mega-menu, category, product, About, Contact, Verify, Authorized
Sellers, admin, auth, schema, verification-rule or demo-record changes were made
in this milestone. No dependencies were added.

---

## 4. Image sources

All runtime imagery is local. No external image URL is requested by the page.

| Homepage use | Source | Disclosure |
| --- | --- | --- |
| Hero visual | `public/images/lonex-generated-images/hero/hero-solar-farm.webp` | AI-generated, labelled illustrative |
| Hero range cards | `categories/solar-panels.webp`, `categories/home-storage.webp`, `categories/electric-mobility.webp` | AI-generated, labelled illustrative |
| Generate chapter | `lifestyle/solar-installation-team.webp` | AI-generated, labelled illustrative |
| Store chapter | `categories/home-storage.webp` | AI-generated, labelled illustrative |
| Move chapter | `lifestyle/ev-charging.webp` | AI-generated, labelled illustrative |
| Company story | `about/commercial-facility.webp` | AI-generated, labelled illustrative |
| Closing band | `hero/hero-solar-home-wide.webp` | AI-generated, labelled illustrative |
| Product cards | CMS media `106`, `108`, `111`, `107`, `110`, `104` | Demo records, labelled illustrative |
| Journal covers | CMS media `113`, `114`, `88` | Published editorial, sample cards tagged |

The full 20-file AI pack inventory, dimensions and prompts are in
`public/images/lonex-generated-images/ASSET_MANIFEST.csv` and `README.md`.
`ASSET_SOURCES.md` now records the homepage subset and the publishing rules.

No image is presented as real LONEX premises, staff, inventory, authorized
seller or specific manufacturer product photography.

---

## 5. Motion

All motion is additive. The finished page renders in CSS/HTML; GSAP writes start
values only when the client script runs. Content therefore remains visible with
JavaScript disabled, under reduced motion, and in print.

### Preserved hero

The approved six-stage entrance remains: masked line reveal, aside and ledger
settle, figure `clip-path` reveal, and a subtle image scale. The only change was
the DOM/style integration fix described above.

### Below-hero choreography

| Target | Motion |
| --- | --- |
| Section heads | eyebrow, title and aside fade/translate up 18 px, 80 ms stagger, trigger at 88% viewport |
| Range chapters | media `clip-path` uncover; copy children rise 20 px with 60 ms stagger |
| Selected photography | restrained parallax on the Generate image and story image: `yPercent` −2.5 → 2.5 at 1.06 scale, scrubbed 0.6 |
| Product grid | 26 px rise, 70 ms stagger |
| Registry | copy and specimen children rise 18 px, 60 ms stagger |
| Sellers | two-column children rise 22 px, 100 ms stagger |
| Journal | feature and side cards rise 24 px, 80 ms stagger |
| Closing | three verbs rise 34% then the aside rises 18 px |

### Safety and cleanup

- All scroll animations use `once: true`; the parallax is the only scrub.
- `gsap.matchMedia()` scopes everything to
  `(prefers-reduced-motion: no-preference)`.
- `mm.revert()` runs on unmount; the `load` listener is removed.
- Trigger positions are refreshed after load and after fonts resolve.
- Only `opacity`, `transform` and `clip-path` are animated. No scroll
  hijacking, no pinned sections, no layout-affecting animation.
- The parallax scale keeps the image inside its frame at both extremes.
- Hover movement is limited to a 1.035 image scale and a colour change.

---

## 6. Responsive behaviour

| Width | Behaviour |
| --- | --- |
| 1440 px | 1319 px content width; full twelve-column compositions; 9097 px page |
| 1024 px | Six/seven-column splits tighten; product lead/tall remain 8/4; 7677 px |
| 768 px | Chapters stack with varied image/copy order; products 2-up; registry, sellers, story and closing stack; 11600 px |
| 390 px | Single-column flow; products 1-up; journal side cards become single column; 12465 px |
| 360 px | Same single-column flow with 20 px gutters; 12263 px |

Key rules:

- Page content width is capped at `1440px` with `clamp(20px, 4.2vw, 64px)`
  gutters, yielding 1280–1320 px of content on desktop.
- Section spacing is `clamp(52px, 6.4vw, 96px)` and drops to 44 px below 560 px.
- Type uses `clamp()` throughout; no fixed display sizes.
- Chapters retain three distinct desktop compositions and intentionally vary
  image-first/copy-first order on mobile.
- The closing photo band uses 1536:295 on desktop, 16:7 at 820 px and 4:3 at
  560 px.
- Long product names wrap with `overflow-wrap: break-word`; no horizontal
  overflow was measured at any tested width.

---

## 7. Technical QA

Captured from the production build, not the dev server.

**Server:** `next start -p 3401`, PID 22880
**Command line:** `"node" "...\\next\\dist\\bin\\next" start -p 3401`
**Project directory:** `E:\customer\Imran\Lonex\website`
**Build:** PASS — Next.js 16.4.4, compiled in 4.0 s, TypeScript in 6.7 s,
40/40 pages generated.
**Typecheck:** PASS — `next typegen && tsc --noEmit`.
**ESLint:** PASS — modified homepage files, exit 0, no output.

| Viewport | HTTP | Overflow X | Broken visible images | Hidden section heads | Page height |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | 200 | 0 px | 0 | 0 | 9097 px |
| 1024 × 768 | 200 | 0 px | 0 | 0 | 7677 px |
| 768 × 1024 | 200 | 0 px | 0 | 0 | 11600 px |
| 390 × 844 | 200 | 0 px | 0 | 0 | 12465 px |
| 360 × 780 | 200 | 0 px | 0 | 0 | 12263 px |

- Console errors: **0**. Uncaught page errors: **0**.
- Canonical route is `/`; no custom 404 was returned.
- All **19** checked internal routes return 200, including every homepage CTA,
  category, demo product, journal article, `/verify`, `/authorized-sellers`,
  `/robots.txt` and `/sitemap.xml`.
- **Reduced motion:** media query matched; 9 section-head child elements
  measured across 3 headings; 0 hidden or transparent; overflow 0.
- **No JavaScript:** 10 `h2` elements, registry copy and all 6 product cards are
  present in the server HTML; overflow 0.
- **Mobile nav (existing header):** opens with `aria-expanded=true` and body
  scroll lock; Escape closes it and restores `aria-hidden`/`inert`.
- **GSAP closing section:** initial title/aside opacity 0 and hidden; mid 0.76 /
  0.65 and visible; completed 1.00 / 1.00 with zero transform.
- **Screenshots:** 54 deliverable PNGs, all opened and validated by signature
  and IHDR, 0 invalid. Full-page PNG heights match measured document heights at
  all five widths.

Raw evidence:

- `reports/capture-results.json`
- `reports/routes.json`
- `reports/viewports.json`
- `reports/gsap-states.json`
- `reports/mobile-nav.json`
- `reports/png-validation.json`
- `reports/screenshot-index.csv`
- `reports/tests.txt`

---

## 8. Review package

Location: **`artifacts/lonex-milestone-2c-review/`**
Archive: **`artifacts/lonex-milestone-2c-review.zip`**

```
desktop/1440/       fold.png, full.png
desktop/1024/       fold.png, full.png
tablet/768/         fold.png, full.png
mobile/390/         fold.png, full.png
mobile/360/         fold.png, full.png
sections/           7 sections × 5 widths
animations/         hover states, GSAP initial/mid/completed,
                    reduced motion, no-JS, mobile nav
reports/            JSON/CSV evidence and test log
README.txt
qa-findings.json
```

Start with `desktop/1440/full.png`, then inspect
`sections/1440-journal.png` and `animations/gsap-mid-1440.png` for the most
representative detail.

---

## 9. Remaining issues and honest limits

1. **Demo product data is temporary.** All six product records are seeded demo
   records. They must be replaced with approved product data before launch; the
   homepage currently labels them clearly so no visitor mistakes them for real
   listings.
2. **Journal content is partly sample copy.** Two of the three selected
   articles are sample records and are tagged. The third is older published
   content and is not tagged as a sample. Editorial copy still needs a content
   pass before launch.
3. **Photography is illustrative.** The AI-generated pack is suitable for
   design review, not for launch as documentary proof of LONEX operations.
   Real premises, installation, product and seller photography should replace
   it when available.
4. **Browser coverage is Chromium-only.** The automated sweep used Playwright
   Chromium. Safari/Firefox were not run for this milestone; the layout uses
   standard grid, `clamp()` and `aspect-ratio`, but a cross-browser pass is
   still advisable before launch.
5. **Hero fixes were integration-only.** The approved composition is unchanged,
   but the hero now correctly uses its CSS grid, button variants and page
   gutter. Any further hero art direction belongs to a separate approval.
6. **Mobile drawer is existing header behaviour.** It was exercised, not
   redesigned, in line with the strict scope.

No Milestone 2D work has begun. The next step is client inspection of the
screenshots in this package.

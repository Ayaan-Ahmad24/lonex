# Step 7 — Range, Product and Footer Review

**Date:** 12 November 2026
**Scope:** `/solar`, `/batteries`, `/ev-bikes`, the six published product pages, the shared footer, and the removal of internal CMS copy from the public site.
**Status:** Implemented and verified in a real browser. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-7-review/`
Machine-readable QA: `artifacts/lonex-step-7-review/qa-report.json` and `artifacts/lonex-step-7-review/after/qa-report.json`

---

## 1. Why this step existed

The category and product templates worked, but they read like a catalogue database with a website around it. At 1440 the category page was heading-left, paragraph-right, then one large photograph, then a text list of product names with "Price on request". The product page repeated the same block, and the footer had no social links, a right-aligned address that wrapped awkwardly, and columns that did not share a baseline.

Three problems were fixed together, because each one made the others look worse:

1. **Three categories, one layout.** Solar, batteries and e-bikes were the same page with different words. They are different buying decisions and now look and read differently.
2. **No public editorial layer.** The database holds names, categories and images. It does not hold introductions, benefits or use cases, so the templates had nothing to say. That copy now lives in one reviewed module instead of being invented per template.
3. **Internal voice in public copy.** Sentences describing publishing rules, counts and CMS behaviour were visible to customers on the category page, contact, sellers, journal, about, verify and 404.

---

## 2. What the data actually contains

Audited in `artifacts/step-7-data-audit.json` before any design work:

| Item | Reality |
| --- | --- |
| Categories | 3 — Solar Panels, Batteries, Electric Bikes |
| Published products | 2 per category, 6 total |
| Products | Solar Module, Solar Panel, Electric Bike, Electric Commuter Bike, Home Battery, Hybrid Inverter |
| Images | 2 per product |
| Specifications | 0 |
| Prices | 0 |
| Documents | 0 |
| Authorized sellers | 0 |
| Journal posts | 0 |

Consequences that shaped the design:

- **No specification block on product pages** unless a record has entries. The section is conditional, not a placeholder table.
- **No price** anywhere. Enquiry is the conversion path, which is honest for a distributor and matches how the range is actually sold.
- **Two near-identical solar products** (Solar Module / Solar Panel) with near-identical CMS descriptions. Both are published, so both are shown; the duplication is flagged in §11 rather than hidden.
- **No seller listings**, so the footer and contact links point to pages that explain how to ask, not to a directory with fake entries.

---

## 3. Design system

The three category experiences share typography, spacing and interaction, and nothing else.

| Token | Value | Use |
| --- | --- | --- |
| Display | Poppins | Headlines, product names |
| Technical | IBM Plex Mono | Eyebrows, labels, meta, CTAs |
| Red | `#cf0a0a` / deep `#9e0707` | Accent rule, CTA, hover |
| Ink | `#000` / `#1b1b1b` | Body and headings |
| Paper | `#f5eded` warm stone | Section fields |
| Rule | `rgba(0,0,0,.14)` / strong `.24` | Hairlines, grids |

Frame: `max-width: 1440px`, gutter `clamp(20px, 4.2vw, 64px)`. Section rhythm is `clamp()` based, so 360 → 1440 scales without breakpoint jumps.

No rounded cards, no drop shadows, no numbering, no icon grid. Depth comes from photography, hairlines and contrast.

---

## 4. The three category pages

Each slug is dispatched inside the existing dynamic route; any other published category falls back to a generic, still-styled template. No route was added or renamed.

### 4.1 Solar Panels — "Daylight, put to work."

- **Identity:** light paper, architectural hairline grid, left-aligned overlay hero.
- **Hero:** `public/images/v2/hero-solar-aerial.webp`, full-bleed at 78vh, dark scrim from the left, display headline over the image, three-line introduction, primary "Enquire about solar", secondary "See the range".
- **Why it is not the old layout:** the headline sits *inside* the photograph with the copy, and the image is the first thing the eye lands on. There is no separate heading/paragraph column above a detached image.
- **Benefits:** four themes — generation, reduced grid dependence, residential/commercial, long-term planning — on a light field with a ruled grid and one supporting photograph (`v2/city-rooftops.webp`).
- **Products:** two large horizontal cards, each with a 16:10 image, name, professional description, two benefit lines, "View product" and "Enquire". Nothing is name-only.
- **Community:** `Beyond Energy. Towards Better Communities.` as a split band with `v2/generate-installation.webp`; energy awareness and education, informed purchasing, responsible adoption written as direction, not as an existing programme.
- **Close:** dark enquiry band with contact and product links.

### 4.2 Batteries — "Store the day. Use it when it matters."

- **Identity:** charcoal, centred hero, charge rail, Generate → Store → Use flow, vertical benefit stack, alternating dark plinths, banner community band.
- **Hero:** `public/images/lonex-step-1/store-battery.webp` behind a centred scrim, with a red charge rule that fills on scroll (`prefers-reduced-motion` disables the scrub and shows the filled state).
- **Flow:** three-step Generate / Store / Use strip that gives the category a logic, then four vertically stacked benefits — storage, better use of generated electricity, backup where supported, solar integration.
- **Products:** alternating dark/light plinths so the two products read as a sequence rather than two identical cards.
- **Community:** full-width banner over `lonex-generated-images/lifestyle/battery-production.webp`.
- **Restraint:** "backup where the system supports it" is repeated as a qualification, not a performance promise. No capacity, cycle life or backup-time figures appear because the database has none.

### 4.3 Electric Bikes — "The city, within reach."

- **Identity:** warm sand, cinematic hero with a sand copy plate, oversized product plates with alternating bleed.
- **Hero:** `public/images/lonex-step-1/move-mobility.webp`, headline on a sand plate that overlaps the photograph's left edge, so the page does not repeat the solar or battery composition.
- **Benefits:** everyday urban mobility, short-distance travel, electric mobility benefits, practical alternatives — written around use, not around motor or battery claims.
- **Products:** two oversized plates that alternate left/right bleed, with the copy held in the opposite margin.
- **Community:** black-and-white cyclist band over `categories/mobility.webp`, focused on cleaner mobility and local participation.

### 4.4 Shared category rules

- One `<h1>` per page; section headings are `<h2>`; product cards are `<article>` with a single link target plus a secondary enquiry link.
- Every product image uses `ContentImage` with explicit `sizes`, `object-cover` and a labelled fallback, so a missing file never renders an empty box.
- Pagination and the generic fallback were preserved; the CMS sentence and the "02 published models" counters were removed.
- All copy comes from `src/lib/public/editorial.ts`, keyed by slug, with a sanitised CMS fallback (`customerFacingCopy`) that strips publishing-rule sentences if a future record carries one.

---

## 5. Product pages

Rebuilt in `src/app/(site)/[categorySlug]/[productSlug]/page.tsx`.

| Section | Treatment |
| --- | --- |
| Breadcrumb | Home / Category / Product |
| Hero | Name + category eyebrow + editorial tagline and two-paragraph introduction on the left; large image stage on the right (5/7 split at 1440) |
| Gallery | Controlled client component: stage opens a portal lightbox, thumbnails swap the stage image, counter `01 / 02`, Escape / arrows / backdrop close, body scroll lock, focus returns to the stage |
| CTAs | Red "Enquire about this model" to `/contact`; bordered WhatsApp with a prefilled product message |
| Meta | Category link, "Model check → Verify a code" — no invented model numbers |
| Key advantages | Three titled points per product, from the editorial layer |
| Applications | Three use cases with ruled rows |
| Specifications | Rendered only when the record has entries (currently none, so absent) |
| Documents | Rendered only when the record has files (currently absent) |
| Related products | Same-category siblings; a single sibling becomes a five/six split card with the copy grouped in one wrapper and centred against the image; two or more become a grid |
| Enquiry | Dark band: headline with the product name, availability/lead-time/installation copy, enquiry + WhatsApp, phone number, and a model-verification panel |
| Structured data | `Product` JSON-LD with name, image, category and brand; no price or rating invented |

The gallery and lightbox were verified by script: 2 thumbnails, stage `src` changes on thumbnail click, lightbox opens, ArrowRight and Escape work, focus returns to `.lxp-gallery__stage`.

---

## 6. Footer

Rewritten in `src/components/public/site-footer.tsx`, with the CSS block in `src/app/site.css` replaced.

**Structure:** four columns on a twelve-column grid at ≥1024 — brand 1–4, Explore 5–6, Company 7–8, Connect 9–12. Every column starts on the same hairline, so the four heads align even though the brand block is taller.

| Column | Contents |
| --- | --- |
| Brand | Logo (larger: 56/80 px tall), two-line tagline with the second line in red, one-paragraph description |
| Explore | Solar Panels, Batteries, Electric Bikes, Journal |
| Company | About LONEX, Authorized Sellers, Verify a Model, Contact |
| Connect | Instagram, Facebook, LinkedIn, YouTube; then Phone, WhatsApp, Address as label + left-aligned value rows |

- **Social icons** come from `src/lib/public/social.ts`. If the CMS has a URL it wins; otherwise the platform landing page is used. All four networks always render, so the footer never looks half-built. These are **not verified LONEX profiles** and are documented as temporary.
- **Contact values** are formatted through `src/lib/public/contact.ts` (`0322 888 8278`, `+92 322 888 8278`), and the address no longer right-aligns or wraps into a ragged two-line block.
- **Base row:** `© 2026 LONEX` left, "Back to top" right, aligned on the same rule.
- **Mobile:** below 640 the columns stack in reading order (brand, Explore, Company, Connect). Between 640 and 1023 a two-column grid pairs the link columns while brand and Connect span the frame. Logo uses the smaller of the two sizes.
- **No photograph**, no background image, no card container.
- Column reveals use the existing `data-footer-reveal` GSAP contract and are disabled under reduced motion.

---

## 7. Internal copy removed

The sentence **"Only published products in published categories are shown. Specifications, documents and prices follow the same rule."** is gone from the category template. Similar internal statements were removed across the public site:

| Page | Removed | Replacement |
| --- | --- | --- |
| Category | Publishing-rule sentence, "02 published models", per-card "Price on request" | Editorial introduction + real product copy |
| Contact | "Published contact information", "Nothing is displayed until confirmed", "will be published once confirmed", map fallback notice | "Contact details", "Reach the team directly…", "Ask LONEX for the current office location" |
| Authorized sellers | "Only seller listings confirmed and published…", published/city counters, "No authorized sellers published yet" | "Every seller below has been confirmed by LONEX…", "Sellers appear here as they are appointed" |
| Journal | "Published articles", article count, "Editorial rule — Drafts are never public", "Drafts never reach this page" | "Product notes, practical guidance and company updates", "New writing will appear here" |
| About | "Only what is confirmed", "Nothing is invented" | "Built on clear information" |
| Verify | "published by LONEX" in the result explanation | "registered with LONEX" |
| 404 | "no longer published" | "does not exist or has moved" |

Kept on purpose: warranty/condition caveats, "confirm with LONEX before ordering", the verification-code explanation, and legal/eligibility notes. Those are customer protection, not CMS plumbing.

The homepage's own "only once confirmed for each model" sentence was left untouched because the homepage is out of scope for this step; it is listed in §11.

---

## 8. Imagery

All imagery is local; no external URLs.

| Where | File | Note |
| --- | --- | --- |
| Solar hero | `public/images/v2/hero-solar-aerial.webp` | Existing Step 4 asset |
| Solar benefits | `public/images/v2/city-rooftops.webp` | Existing Step 4 asset |
| Solar community | `public/images/v2/generate-installation.webp` | Existing Step 4 asset |
| Battery hero | `public/images/lonex-step-1/store-battery.webp` | Existing Step 1 asset |
| Battery community | `public/images/lonex-generated-images/lifestyle/battery-production.webp` | Existing generated lifestyle asset |
| E-bike hero | `public/images/lonex-step-1/move-mobility.webp` | Existing Step 1 asset |
| E-bike community | `public/images/categories/mobility.webp` | Existing category asset |
| Products | CMS media (`/media/*`) | Two per product, served through `ContentImage` |

**Temporary:** product photography is demo imagery. Alt text in the database says as much ("Illustrative demo image … not a real manufacturer model"). The layout is built so real manufacturer photography can drop in without layout changes.

**Known mismatch:** the *Electric Bike* primary render and the category cover show a step-through scooter, while the other bike assets show a bicycle. Copy therefore avoids pedal, range, motor and performance claims. This is an asset problem, not a layout problem.

---

## 9. Motion and accessibility

- Shared `PageMotion` (GSAP + ScrollTrigger) with a deliberately small vocabulary: photographic settle, line entrance for display type, short rise for supporting copy, one scrub for the battery charge rule.
- Everything is authored as `fromTo` with `once: true` triggers, so a refresh cannot strand content at opacity 0. Without JavaScript the page is fully visible.
- `prefers-reduced-motion: reduce` skips trigger creation entirely. Verified at 1440: hero, hero line, `[data-reveal]` and `[data-reveal-image]` all compute to `opacity: 1`, `visibility: visible`, `transform: none`.
- Hero media uses `preload` at the LCP position; below-fold images stay lazy.
- Gallery: real `<button>`s, visible focus ring, labelled dialog, Escape/arrow keys, focus restoration.
- Contrast: white on the dark scrims, ink on paper; red is used for accents and filled CTAs, not for body copy on dark.
- Touch targets ≥ 38 px; header navigation keeps its existing keyboard and drawer behaviour.

---

## 10. QA results

Harness: `scripts/capture-step-7.mjs` (Playwright, fresh context per viewport, scroll-settle before each full-page capture, sticky header suppressed only for the footer element capture).

**Coverage:** 9 routes × 5 viewports = **45 page checks**, plus **5 footer captures**.

Routes: `/solar`, `/batteries`, `/ev-bikes`, `/solar/solar-module`, `/solar/solar-panel`, `/batteries/home-battery`, `/batteries/hybrid-inverter`, `/ev-bikes/electric-bike`, `/ev-bikes/electric-commuter-bike`.

Viewports: 1440×900, 1024×900, 768×844, 390×844, 360×844.

| Check | Result |
| --- | --- |
| HTTP status | 45/45 → 200 |
| Horizontal overflow | 0 px on every page and viewport |
| Broken images | 0 |
| Product images hidden / zero-size | 0 |
| Console errors | 0 |
| Uncaught page errors | 0 |
| Failed requests | 0 |
| Footer visible on every page | Yes, all 45 |
| Total links exercised | 2220 |

Per viewport: **9/9 passed at 1440, 1024, 768, 390 and 360.**

Other verification:

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass, no output |
| `npx eslint` on changed files | Pass, no output |
| `npm run test` | 192/192 passing across 25 files |
| Gallery interaction | Thumbnails swap image, lightbox opens, arrows/Escape work, focus restored |
| Reduced motion | All reveal targets visible, no triggers |
| Footer at 1440/1024/768/390/360 | Four columns aligned at ≥1024, no overflow at any width |

Repository-wide `npm run lint` still reports 43 pre-existing errors in `.agents/skills` and `scripts/seed-demo-content.ts`; none are in files changed for this step.

### Screenshot index

```
artifacts/lonex-step-7-review/
  before/            baseline, 1440 + 390, 9 routes + footer (19 files)
  after/             current, 1440/1024/768/390/360, 9 routes + 5 footers (51 files)
  after/qa-report.json
  qa-report.json     aggregated summary
  wip/               iteration shots (footer tuning, related card, contact, cropped hero)
```

Before/after pairs to compare first: `solar-1440`, `batteries-1440`, `ev-bikes-1440`, `home-battery-1440`, `solar-module-390`, `footer-1440`.

---

## 11. Known issues and recommendations

1. **Duplicate solar products.** *Solar Module* and *Solar Panel* are both published with near-identical descriptions. Both are shown because both exist. Recommend consolidating to one product or differentiating the records before launch.
2. **Bike imagery mismatch.** Scooter render vs bicycle photography (see §8). Replace the render or the category cover when real product photography is available.
3. **Demo product photography.** Every product image is illustrative, which the alt text states. Real manufacturer images should replace them; no layout work is required.
4. **Social URLs are placeholders.** `src/lib/public/social.ts` uses platform landing pages. Replace with confirmed LONEX profiles, or set them in the CMS (CMS wins). The footer always shows all four.
5. **Homepage sentence.** `src/app/(site)/page.tsx` still contains "only once confirmed for each model." Out of scope here; recommend the same treatment in a later pass.
6. **No specifications, prices or documents in the database.** Those sections stay hidden until real data exists — this is intentional, not missing design.
7. **`Image priority` deprecation.** New code uses `preload`; `brand-mark.tsx` still uses `priority` and should be migrated with the next header change.
8. **Dev-only Next.js indicator.** The floating "N" badge in some screenshots is the development overlay, not part of the design.
9. **`catalog.css` is large** (≈3.6k lines) because three distinct experiences share one file. It is sectioned by prefix (`lxc-`, `lxb-`, `lxe-`, `lxg-`, `lxp-`) and can be split per experience if it grows further.

---

## 12. Files changed

**New**

- `src/lib/public/editorial.ts` — category/product editorial layer, `customerFacingCopy`, `productWhatsAppMessage`
- `src/lib/public/social.ts` — social network defaults and `resolveSocialLinks`
- `src/lib/public/contact.ts` — `whatsappHref`, `formatPhone`, `formatInternational`
- `src/components/public/page-motion.tsx` — shared GSAP reveal contract
- `src/components/public/categories/parts.tsx`
- `src/components/public/categories/solar-page.tsx`
- `src/components/public/categories/batteries-page.tsx`
- `src/components/public/categories/ev-bikes-page.tsx`
- `src/components/public/categories/generic-page.tsx`
- `src/app/catalog.css`
- `scripts/capture-step-7.mjs`
- `scripts/audit-step-7-data.mjs`

**Modified**

- `src/app/(site)/[categorySlug]/page.tsx` — dispatch, pageSize 60, CMS copy removed
- `src/app/(site)/[categorySlug]/[productSlug]/page.tsx` — product page rebuilt
- `src/components/public/product-gallery.tsx` — controlled gallery + portal lightbox
- `src/components/public/site-footer.tsx`, `src/app/site.css` — footer rebuild
- `src/components/public/brand-mark.tsx` — footer logo size
- `src/components/public/content-image.tsx` — sizing/fallback refinements
- `src/app/(site)/contact|authorized-sellers|blog|about|verify|not-found` — copy cleanup
- `src/app/(site)/blog/[slug]/page.tsx` — removed the "Published by LONEX" side label; cover uses `preload`

**Deleted**

- `src/components/public/image-lightbox.tsx` — replaced by the gallery's internal lightbox

---

## 13. Reproduce

```bash
npm run dev
node scripts/capture-step-7.mjs --label after --out artifacts/lonex-step-7-review/after
npx tsc --noEmit
npm run test
```

Nothing in this step is staged, committed or pushed.

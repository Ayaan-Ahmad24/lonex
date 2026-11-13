# LONEX — Step 6: Category Page Design Research & Proposal

**Document type:** research + design proposal (Phase 8 gate)
**Date:** 12 November 2026
**Scope:** `/solar`, `/batteries`, `/ev-bikes`
**Status:** proposal only. No application source code is being changed until this document is approved.

---

## 0. Status of the work — read this first

A previous pass claimed Step 6 was complete. It was not. The written record did not match the repository, so this section corrects it before any design decision is made.

| Claim in the earlier summary | What the repository actually contains |
| --- | --- |
| Screenshots at 1440/1024/768/390/360 | `artifacts/lonex-step-6-review/` contained only a README. No images. |
| `qa-report.json` with measurements | Does not exist. Never generated. |
| GSAP motion per page | No motion code exists on the category route. |
| Editorial photography section | All three editorial images are missing; the section renders a broken `<img>`. |
| "Product cards with large images" | Product images render as empty pink panels (positioning bug, see 4.3). |
| "Per-category accent colours" | `--lx-blue` and `--lx-orange` do not exist in the design system. Two of three accents were invalid CSS. |
| "Premium closing CTA" | White heading on a near-white gradient — effectively invisible. |
| "Design research document" | `docs/design/STEP-6-CATEGORY-DESIGN-RESEARCH.md` did not exist until this file. |

**Remediation carried out with this document**

1. `src/app/(site)/[categorySlug]/page.tsx` has been restored to its committed baseline, so the working tree no longer ships a broken category page while this proposal is under review. The rejected draft was not committed and was discarded with the revert; its defects are catalogued in section 4.3 so the same mistakes are not repeated.
2. `artifacts/lonex-step-6-review/README.md` has been replaced with an honest withdrawal note.
3. Nothing is staged, committed or pushed.

Evidence for the audit is in `artifacts/lonex-step-6-research/audit/` and `artifacts/lonex-step-6-research/reference/`.

---

## 1. Method and access log

All references below were inspected in a real Chromium session. Desktop = 1440 × 900, mobile = 390 × 844 (mobile UA, DPR 2). Full-page captures were taken after scrolling through the page, because several of these sites lazy-load and animate on scroll.

| Site | Desktop | Mobile | Access note |
| --- | --- | --- | --- |
| Tesla Solar Panels | yes | partial | Headless automation returned HTTP 403; inspected and captured in the interactive browser instead. |
| Enphase | yes | yes | Full access. |
| SunPower | yes | yes | Full access. |
| Tesla Powerwall | yes | — | Same 403 for headless; interactive capture used. Mobile behaviour inferred from the shared Tesla template and from the Powerwall page's responsive rules — not a separate mobile capture. Stated plainly rather than implied. |
| EcoFlow Energy (US) | yes | yes | Full access. |
| Specialized e-bikes PLP | yes | yes | Full access. |
| Trek e-bikes PLP | yes | yes | Full access. |
| Baymard: category pages | yes | yes | Full article text accessible. |
| Baymard: product lists | yes | — | Landing page and research summary accessible; the underlying 83 guidelines are paywalled. Only the free findings are cited. |

Captures: `artifacts/lonex-step-6-research/reference/`
Machine-readable inspection data (headings, computed sizes, weights, font families, page heights): `reference/reference-inspection.json`.

Screenshots of competitors are stored for internal design review only, not for publication or redistribution.

---

## 2. What was learned from each reference

### 2.1 Tesla — Solar Panels

![Tesla Solar Panels](../../artifacts/lonex-step-6-research/reference/tesla-solar-desktop.jpg)

**Structure.** Nine full-width bands, each doing one job: hero → three benefit rows → material close-up → installation anatomy → outage story → app → process → specifications → close. No two consecutive bands share a layout.

**Principles worth taking**

- The photograph is the section. Copy sits *on* the image or in a clear column beside it; there is no card framing, no border, no shadow, no rounded corner anywhere on the page.
- Type over photography is always a single centred or left-aligned block, never a cluster of floating elements.
- Feature lists are three or four rows of hairline-separated items with a thin line icon and one sentence. Nothing is boxed.
- The page changes temperature deliberately: white → photograph → white → black night shot → product on white → black → black specifications. That rhythm is doing the work that decoration usually does.
- Specifications are set in small, quiet type on black at the very end — proof, not marketing.

**What not to take.** The specification tables are dense and rely on data LONEX does not have. The centred-hero-plus-two-buttons pattern is the most copied layout on the internet; using it would immediately read as a template.

### 2.2 Tesla — Powerwall

![Tesla Powerwall](../../artifacts/lonex-step-6-research/reference/tesla-powerwall-desktop.jpg)

**Structure.** Black from the first pixel. Product render floating in a black field, three enormous numeric specifications (kW / kWh / weight), then architectural photography, a house diagram, a dark interior shot, a close-up, the app, specifications again, and a closing product plate.

**Principles worth taking**

- A black page is a legitimate brand decision for storage, not a "dark mode" gimmick. It makes the white product read as an object on a plinth.
- Numbers at 3–4rem with a small unit beneath are more powerful than any badge. LONEX has almost no verified data, so this device must be used sparingly and only with real content.
- The product is allowed to be small in a large field. Confidence is expressed by space, not size.

**What not to take.** The enormous empty black stretches only work because Tesla has a globally recognised product silhouette. LONEX does not, yet.

### 2.3 Enphase

![Enphase](../../artifacts/lonex-step-6-research/reference/enphase-desktop.png)

**Structure.** A near-black page of full-bleed product beauty shots, each occupying a screen, with a tiny centred headline and one pill button. Product hardware is photographed like jewellery: hard key light, dark gradient, no context.

**Measured typography.** Section headings are 56–64 px at weight 400 in a custom sans. That is unusually large at an unusually light weight, and it works because the surrounding page is almost silent.

**Principles worth taking**

- Product photography on a controlled dark field is the single most premium move available to a hardware brand with a small catalogue.
- Headings can be large *and* light; size does not have to mean weight.
- Almost no body copy. The page makes the reader scroll through objects, not paragraphs.

**What not to take.** On mobile the page becomes an unbroken column of images with very little orientation — no breadcrumb, no category context, no way to judge where you are. LONEX needs more structure than that.

### 2.4 SunPower

![SunPower](../../artifacts/lonex-step-6-research/reference/sunpower-desktop.png)

**Structure.** Split hero, "Our Vision" with a six-item icon grid, three rounded system cards, a navy lead-form band, an earnings-call banner, an executive profile, a three-up impact section, a three-up article list, a closing CTA and a large footer.

**Verdict: the clearest example of what LONEX must not become.** Every section is a container: rounded 12 px cards, icon circles, equal-weight tiles, badges, a form in the middle of the narrative. The photography is stock-corporate. The page is professionally executed and completely generic.

**Useful details**

- The split hero (type on a dark photographic panel, image beside it) is a sound composition, and is the one device worth adapting.
- Their information architecture is genuinely good: systems → storage → new homes, then education. LONEX's category cross-links should be that clear.

### 2.5 EcoFlow Energy

![EcoFlow](../../artifacts/lonex-step-6-research/reference/ecoflow-desktop.png)

**Structure.** Architectural hero, black "Welcome to your EcoFlow-powered home" band with a cutaway house and four product callouts, a logo wall, a full-bleed customer story with a quote over the image, a statistics band over a lifestyle photo, editorial cards, resource tiles, a two-audience split, a form, footer.

**Principles worth taking**

- **The cutaway diagram is the best explanatory device in the category.** Showing generation → storage → distribution inside one house communicates in two seconds what three paragraphs cannot. LONEX can do a restrained, abstract version with hairlines and product plates — no fake house render.
- A quote set over a full-bleed photograph is a strong, low-cost editorial moment.
- Two-audience splits (homeowner / installer) are honest and useful.

**What not to take.** The award-badge logo wall, the "6M+ / 140+ / 1,129+" statistics over a family photo, and the four resource tiles are trust theatre that LONEX cannot substantiate. The page also contradicts itself visually: black cinematic bands interrupted by white card sections.

### 2.6 Specialized — Electric Bikes

![Specialized e-bikes](../../artifacts/lonex-step-6-research/reference/specialized-ebikes-desktop.png)

**Structure.** Left filter rail, two-column product grid. Each item is a side-profile bike cut-out on a pale field with the name, price and colour swatches beneath. No borders, no shadows, no card backgrounds. One promotional tile is inserted into the grid as a rhythm break.

**Principles worth taking**

- **In a bike category the product *is* the card.** The cut-out on a neutral field, with generous margin, outperforms every framed card.
- Consistent camera angle and consistent image scale across products is what makes a grid feel premium. Mixed angles destroy it.
- White space between products is the only separator needed.

**Mobile.** The page opens with an oversized H1, a full-width "All filters" button, then a horizontal swipe rail of category tiles. It does not simply stack the desktop grid — the mobile page has its own composition.

**Not applicable to LONEX.** With two bikes, a filterable PLP grid would be absurd. The lesson is the *photographic treatment*, not the grid.

### 2.7 Trek — Electric Bikes

![Trek e-bikes](../../artifacts/lonex-step-6-research/reference/trek-ebikes-desktop.png)

**Structure.** Centred photographic hero with the title and two buttons over it, a short centred intro sentence, then a filter rail and a three-column grid of side-profile bikes, then a "Need help choosing?" prompt and a dense footer.

**Principles worth taking**

- The intro paragraph is one or two sentences. It orients without delaying the products.
- The "Need help choosing?" moment is a genuinely useful, low-cost service prompt at the end of a long list.
- Mobile turns the two hero buttons into full-width stacked buttons, and the hero becomes a short band rather than a full screen. This is the correct mobile translation.

**What not to take.** Three dense product columns and 28 SKUs is a different problem from LONEX's two.

### 2.8 Baymard — category pages and product lists

Source text: `baymard.com/blog/ecommerce-category-page`, `baymard.com/research/ecommerce-product-lists`.

Applicable findings, in the order they affect this design:

1. **Small catalogues should stay shallow.** Baymard explicitly notes that sites with fewer than ~25 products should not build intermediary category layers. LONEX has six published products. Therefore: no subcategories, no filters, no sorting, no comparison. This proposal deliberately implements none of them.
2. **A hero must not push the real content below the fold**, especially on mobile. The category page has one job: get the visitor to the products. Our mobile hero is capped in height and the product section begins within roughly 1.5 screens.
3. **Decorative imagery on tiles slows people down; identifying imagery helps.** Product plates must show the actual product, consistently framed — not mood photography.
4. **Category descriptions belong at the bottom** for SEO without harming UX. Our long-form copy sits low on the page; the top carries only a short lede.
5. **"One size fits all" is the core product-list failure.** This is the direct cause of the rejected design: three categories were one template with a colour swapped.
6. **Consistent thumbnails matter more than card chrome.** Same aspect ratio, same product scale, same background treatment.
7. **Mobile is not a stacked desktop page.** Horizontal rails and purpose-built crops are acceptable and often better.

---

## 3. Distilled principles for LONEX

1. **One idea per band.** A band is either photography, a statement, a product, or proof. Never two of those at once.
2. **Photography is structure, not decoration.** Full-bleed plates are section breaks. They are not background wallpaper behind text unless the crop is chosen for it.
3. **No cards.** Media sits directly on the page. The only bordered or filled surfaces are the primary button and the product plates' own studio field.
4. **Hairlines instead of boxes.** 1 px rules in the existing palette separate and align. This is already the LONEX device; it should carry the category pages.
5. **One accent moment per screen.** Red is a scalpel, not a theme colour. A category page should use it perhaps four times.
6. **Type does the hierarchy.** Weight 400–500 at large sizes, tight tracking, one display line per band. No all-caps labels except mono captions.
7. **Six mono captions maximum per page.** The technical register is seasoning.
8. **Asymmetry with a reason.** Off-centre type or images only where the composition needs it, never as a decorative wobble.
9. **Products are shown, not sold.** No badges, no invented specifications, no "learn more" filler. Name, one honest sentence, one link.
10. **Every page must be recognisable without its accent colour.**

---

## 4. Audit of the existing LONEX pages

### 4.1 The catalogue is much smaller than the design assumed

Queried from the local database on 12 November 2026:

| Category (CMS) | Slug | Published | Products |
| --- | --- | --- | --- |
| Solar Panels | `solar` | 2 | Solar Module, Solar Panel |
| Batteries | `batteries` | 2 | Home Battery, Hybrid Inverter |
| Electric Bikes | `ev-bikes` | 2 | Electric Bike, Electric Commuter Bike |

- **Zero specifications** on all six products (`product_specifications` is empty for each).
- **Zero prices shown.**
- Two images per product; the card query exposes one primary image.
- Product images are 900 px wide studio renders. Category covers are 1000 px wide.

**Consequence.** The design cannot be a catalogue. It must be an *editorial presentation of a small, deliberate selection* — closer to a product story than a listing. Every device that assumes many items (grids, filters, sorting, comparison, "view all") is excluded.

### 4.2 Photography available today

| Asset | Size | Verdict |
| --- | --- | --- |
| `categories/solar-panels.webp` | 1000 × 679 | Condensation macro with sun flare. Reads as a wet/dirty panel, not a premium architectural image. AI artefacts in the droplets. **Detail use only.** |
| `categories/home-storage.webp` | 1000 × 501 | Two battery cabinets and a wall inverter against stone and timber. Genuinely good and credible. **Reusable, but too small for a full-bleed hero.** |
| `categories/electric-mobility.webp` | 1000 × 554 | A parked electric **scooter**. Excellent product image, but it is not a bicycle. **Must not be used as the Electric Bikes hero.** |
| Product renders (`/media/106`–`111`) | 900 px | Clean, consistent, brand-correct (the battery and bike carry LONEX marks). Good enough for half-width plates; not for oversized plates. |

### 4.3 Why the rejected design looked generic

The committed baseline is not the problem. It is plain but coherent: breadcrumb, an oversized H1, a readable description, a small publication registry and a wide hero image. It has structure and it inherits the brand. The rejected draft replaced that with a heavier, more decorative page that was in several respects a regression. The reasons:

1. **It was one template with three accent colours.** Identical section order, identical card geometry, identical type sizes. Accent-swapping is not a visual identity.
2. **Two of the three accents did not exist.** `--lx-blue` and `--lx-orange` are not defined anywhere; only `--lx-red` is. The "distinctive" colour system was invalid CSS.
3. **It bypassed the design system.** Almost every rule was an inline style object, and invented classes (`lx-product-card`, `lx-product-showcase`, `lx-benefits`, `lx-benefit`) have no CSS at all. The page could not inherit the brand because it never joined the stylesheet.
4. **It used the exact pattern the brief forbids:** white cards, 8 px radius, soft shadow, centred icon circle, three-up feature row.
5. **The same sentence appeared three times:** in the theme data, in the benefit panel, and again near the close.
6. **Placeholder art direction leaked into the UI.** "Cinematic solar energy" and "Premium solar panel photography" are notes to a designer, not copy for a customer.
7. **The editorial section was broken.** All three `/images/.../{slug}-editorial.webp` files are absent, so a broken-image icon and alt text rendered instead.
8. **The closing CTA was invisible** — white type on a near-white gradient — and its primary button linked to the page the visitor was already on.
9. **Product images never appeared.** The media route returns 200, but `Image fill` was mounted inside a figure with no `position: relative`. The `<img>` escaped its aspect-ratio box and rendered outside the visible flow, leaving the tinted plate empty.
10. **No motion existed**, despite the report describing four GSAP behaviours.

### 4.4 Process problems worth fixing

- **Full-page screenshots of this site are misleading unless the page is scrolled first.** Scroll-reveal animations hold content at opacity 0 and below-the-fold images are lazy. The audit capture of `/` shows long white voids for that reason. Any QA capture must scroll the full document, wait, then capture — and separately capture the fold.
- **Naive broken-image checks produce false positives.** The header's mega-menu and drawer thumbnails are present but have zero layout size, so `naturalWidth === 0` flags them on pages where they are never displayed. A check must filter to visible images (or images with a layout box) before reporting a failure. Measured against the restored baseline: `/solar`, `/batteries` and `/ev-bikes` have no genuinely broken images, no console errors and no horizontal overflow.
- **The dev server serves a stale build.** A replaced file in `public/images` is not invalidated by the Next image cache; `.next/cache/images` must be cleared and the server restarted.
- **Category name mismatch.** CMS names are "Solar Panels", "Batteries", "Electric Bikes"; the homepage range uses "Generate / Store / Move". The H1 should use the CMS name; the range verb can appear as a supporting line.

---

## 5. Design system decisions

### 5.1 Tokens

No new palette. Use the existing four-colour brand system plus one warm neutral that already exists in the CSS.

| Token | Value | Use |
| --- | --- | --- |
| `--lx-ink` | `#000000` | Type, black bands |
| `--lx-paper` | `#ffffff` | Base |
| `--lx-stone` | `#f5eded` | Warm surface, product fields |
| `--lx-line` | `#e3d8d8` | Hairlines on light |
| `--lx-muted` | `#575151` | Secondary copy |
| `--lx-red` | `#cf0a0a` | Accent, primary action |
| `--lx-charcoal` | `#141414` (new surface token) | Batteries base |
| `--lx-sand` | `#f2ece4` (new surface token) | Bikes base |
| `--lx-mono` | IBM Plex Mono | Captions, indices, arrows |

Two neutrals are added as **surface tokens only**, not as brand colours, and only within the category stylesheet. This is what allows a distinct identity per page without inventing three brand palettes.

### 5.2 Layout

- Container: `max-width: 1320px` (inside the requested 1280–1360 range), `padding-inline: clamp(20px, 4.2vw, 64px)`.
- Grid: 12 columns, `gap: clamp(16px, 2.2vw, 32px)`.
- Section rhythm: `padding-block: clamp(64px, 8vw, 120px)`. Tight bands: `clamp(40px, 5vw, 72px)`.
- Full-bleed bands ignore the container but keep the gutter for their captions.
- Reading measure: 58–62 ch for body, 24–28 ch for display statements.

### 5.3 Type scale

| Role | Size | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| H1 | `clamp(2.5rem, 5vw, 5.5rem)` — per page, see below | 500 | -0.04em | 0.95 |
| H2 | `clamp(1.75rem, 3vw, 2.75rem)` | 500 | -0.03em | 1.05 |
| H3 / product name | `clamp(1.25rem, 1.6vw, 1.75rem)` | 500 | -0.02em | 1.15 |
| Lede | `clamp(1.125rem, 1vw + 0.9rem, 1.5rem)` | 400 | -0.01em | 1.45 |
| Body | `1rem`–`1.0625rem` | 400 | 0 | 1.65 |
| Small | `0.8125rem` | 400 | 0 | 1.5 |
| Mono caption | `0.6875rem`–`0.75rem` | 500 | 0.12em, uppercase | 1.4 |

Per-page H1 treatment (this is one of the differentiators, not a size variation):

- Solar: 5.5 rem max, left-aligned, two-line lockup with a lighter second line.
- Batteries: 4.25 rem max, centred, single line.
- Bikes: 6 rem max, set low-left on the image, single line.

### 5.4 Components (all new CSS, no inline styling)

| Component | Description |
| --- | --- |
| `.lxcat-hero` | Page-specific hero; one modifier per category. |
| `.lxcat-plate` | Media surface. `position: relative`, fixed aspect ratio, `object-fit` controlled per use. This is the fix for the invisible-image bug. |
| `.lxcat-statement` | Large editorial statement block with a hairline. |
| `.lxcat-products` | Product presentation wrapper; composition differs per category. |
| `.lxcat-product` | One product: media + name + sentence + link. |
| `.lxcat-link` | Inline link with a rule that grows on hover. |
| `.lxcat-flow` | The generation → storage → use device (batteries). |
| `.lxcat-close` | Closing CTA band. |

Rules: no `border-radius` on media; 4 px on buttons only; no box-shadow on cards; no icon circles.

### 5.5 Accessibility and contrast

- All text/background pairs meet WCAG AA. The rejected page failed this in its closing band.
- Focus states are inherited from the site shell.
- Images are decorative only when marked `alt=""`; product and editorial images carry written alt text.
- Touch targets ≥ 44 px.
- Reduced motion is respected at the GSAP `matchMedia` level, not by CSS afterthought.

---

## 6. Photography direction

### 6.1 What each page needs

**Solar — architecture and material**

| Slot | Subject | Crop | Notes |
| --- | --- | --- | --- |
| Hero | A roof plane with an integrated array, shot from a low angle or from the ridge, hard afternoon sun, no people | 4:5 portrait, ≥ 2000 px | Must read as a building, not a panel catalogue |
| Detail | Cell surface, raking light, dry, no condensation | 1:1, ≥ 1200 px | Replaces the current wet macro |
| Context | Roof at dusk with warm interior light | 16:9, ≥ 2000 px | Carries the editorial band |
| Product | Existing LONEX module render on pale field | 4:3 | Keep; consistent framing |

**Batteries — object and interior**

| Slot | Subject | Crop | Notes |
| --- | --- | --- | --- |
| Hero | The LONEX battery tower, front-on, floating on charcoal | 4:5, ≥ 1600 px | Existing render is good; needs upscaling or a higher-resolution export |
| Installation | Two cabinets and a wall inverter against stone/timber | 21:9, ≥ 2000 px | Existing `home-storage.webp` composition is right, resolution is not |
| Detail | Front panel, mono labels, red hairline | 3:2 | Optional if resolution is insufficient |
| Product | Existing renders (`Home Battery`, `Hybrid Inverter`) | 4:3 | Keep |

**Electric bikes — motion and city**

| Slot | Subject | Crop | Notes |
| --- | --- | --- | --- |
| Hero | A rider in motion on a city street, slight pan, dusk or early morning | 16:9 desktop / 4:5 mobile, ≥ 2400 px | Must show a **bicycle**, not a scooter |
| Product plates | Each bike, side profile, consistent angle, sand field | 3:2, ≥ 1600 px | Existing renders are scooter-style; see open question 1 |
| Editorial | Bike parked outside a cafe or workshop, warm light | 16:9, ≥ 2000 px | Human-scale, no logo walls |

### 6.2 Rules

- Local files only. No hot-linking.
- No fake factories, no fake LONEX facilities, no imagined certifications.
- No repeated photograph across the three pages. The current shared category covers are exactly the mistake to avoid.
- Consistent product angle within a page; different angle *language* between pages (object-on-plinth for batteries, architecture for solar, motion for bikes).
- Every file recorded in `ASSET_SOURCES.md` with source and licence at implementation time.

### 6.3 Honest constraint

The existing assets are 900–1000 px wide. Used at full-bleed on a 1440 px screen they will visibly soften. This proposal therefore either (a) generates or sources higher-resolution plates before implementation, or (b) restricts the current assets to half-width plates. It does not pretend the current files support a cinematic full-bleed hero.

---

## 7. Proposed Solar layout — "The architectural grid"

**Idea.** The page is drawn, not decorated. It behaves like an architect's elevation: a visible 12-column structure, hairline rules, precise alignment, one large photograph, and type that stays in its column.

**Signature device.** The split hero: a left type column and a tall portrait photograph that bleeds off the right edge, separated by a full-height hairline. Nothing else on the site uses this.

### Desktop wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  LONEX                              Products  Verify  Sellers   [CTA]│
├──────────────────────────────────────────────────────────────────────┤
│  Home / Solar Panels                                                 │
│                                                                      │
│  Solar Panels                    │   ┌────────────────────────────┐  │
│  ─────────────                   │   │                            │  │
│  A rooftop system,               │   │   portrait photograph      │  │
│  designed as part                │   │   4:5, bleeds right + top  │  │
│  of the building.                │   │                            │  │
│                                  │   │                            │  │
│  [Talk to LONEX]  Enquire →      │   └────────────────────────────┘  │
│  ────────────────────────────────┴────────────────────────────────── │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  (statement)                                                         │
│  ─────────────────────────────────────────────────────────────────   │
│  Solar is a building material     The category description from the   │
│  before it is equipment.          CMS, set at 58 ch, two short        │
│                                   paragraphs maximum.                │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  The selection                                                       │
│  ─────────────────────────────────────────────────────────────────   │
│  ┌──────────────────────────────┬───────────────────────────────┐    │
│  │ [ module render, 4:3 ]       │ [ module render, 4:3 ]        │    │
│  │ Solar Panel                  │ Solar Module                  │    │
│  │ One honest sentence.         │ One honest sentence.          │    │
│  │ View product →               │ View product →                │    │
│  └──────────────────────────────┴───────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ██████ full-bleed roof at dusk, 21:9 ███████████████████████████████ │
│  "A sentence of positioning copy set in white, max 34 ch."           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  How a roof becomes a supply      ┌───────────────────────────────┐  │
│                                   │ Rooftop        one sentence   │  │
│                                   │ Conversion     one sentence   │  │
│                                   │ Use            one sentence   │  │
│                                   └───────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Store what you generate          [ battery render, bleeds right ]    │
│  Link to Batteries →                                                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  BLACK BAND:  Talk to LONEX about your roof.                         │
│               [Start an enquiry]   Find a confirmed seller →          │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile wireframe

```
┌───────────────────────┐
│  header               │
│  Home / Solar Panels  │
│                       │
│  Solar Panels         │
│  A rooftop system,    │
│  designed as part     │
│  of the building.     │
│                       │
│  [Talk to LONEX]      │
│  Enquire →            │
│  ───────────────────  │
│  ┌─────────────────┐  │
│  │  4:5 photograph │  │
│  └─────────────────┘  │
└───────────────────────┘
   statement (H2 1.9rem)
   body 58ch
   ─────────────────────
   product plate
   Solar Panel
   sentence
   View product →
   ─────────────────────
   product plate
   ...
   full-bleed photo 4:3
   ─────────────────────
   Rooftop / Conversion / Use
   (stacked definition list)
```

**Mobile decisions.** The hero image moves *below* the copy and actions so the first screen contains the title, positioning line and CTA. The two products stack with hairlines, not cards. The three-part explanation becomes a definition list, not three tiles.

---

## 8. Proposed Batteries layout — "The vertical stack"

**Idea.** Energy storage is a stack: cells in a cabinet, generation above use. The page is organised around a single vertical spine, in black and charcoal, with the product presented on a plinth. It is the only dark page on the site.

**Signature device.** A hairline spine that runs down the page and a grey fill that advances with scroll — the "charge". One scroll interaction, one idea, and it disappears under reduced motion.

### Desktop wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Header (transparent over black)                                     │
├──────────────────────────────────────────────────────────────────────┤
│                     Home / Batteries                                 │
│                                                                      │
│                         Batteries                                    │
│                  Store what you generate.                            │
│                                                                      │
│                  ░░░  battery, front-on  ░░░                         │
│                  (charcoal field, soft light)                        │
│                                                                      │
│      Generate ────────── Store ────────── Use                        │
│      one line            one line          one line                  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  (the flow, full width, charcoal)                                    │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐          │
│  │  Solar      │ ───► │  Battery    │ ───► │  Home       │          │
│  │  generates  │      │  stores     │      │  uses       │          │
│  └─────────────┘      └─────────────┘      └─────────────┘          │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ┌───────────────────────┐                                           │
│  │  Home Battery         │   Home Battery                            │
│  │  on plinth            │   Sentence.  View product →               │
│  └───────────────────────┘                                           │
│                                                                      │
│   Hybrid Inverter                    ┌───────────────────────┐       │
│   Sentence.  View product →          │  Hybrid Inverter      │       │
│                                      │  on plinth            │       │
│                                      └───────────────────────┘       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ██████ 21:9 installation photograph, full bleed ███████████████████ │
│  mono caption, bottom left                                           │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  What to consider                 Daily use      one sentence        │
│  (H2, 4 cols)                     Backup         one sentence        │
│                                   Space          one sentence        │
│                                   Installation    one sentence       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────── light band (paper) ──────────────────────────────┐
│  Where the energy comes from      Solar Panels →                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────── stone band ──────────────────────────────────────┐
│  Choose a system that fits your day.                                 │
│  [Start an enquiry]   Find a confirmed seller →                       │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile wireframe

```
┌───────────────────────┐
│  header               │
│  Home / Batteries     │
│                       │
│      Batteries        │
│  Store what you       │
│  generate.            │
│                       │
│  ┌─────────────────┐  │
│  │   battery 4:5   │  │
│  └─────────────────┘  │
│      │                │
│   Generate            │
│      │                │
│   Store               │
│      │                │
│   Use                 │
└───────────────────────┘
   flow: vertical,
   line on the left
   ─────────────────────
   [battery plate]
   Home Battery
   sentence
   View product →
   ─────────────────────
   [inverter plate]
   ...
   full-bleed installation 4:3
   What to consider (accordion-free,
   hairline definition list)
```

**Mobile decisions.** The horizontal flow becomes a vertical spine with the connector line on the left. The alternating product layout collapses to image-then-copy, but the second product keeps its right-aligned caption to preserve rhythm.

---

## 9. Proposed Electric Bikes layout — "The horizon"

**Idea.** Movement is horizontal. The page is built on a horizon line: a full-bleed cinematic hero with the headline sitting low-left, type that runs off-grid, and product plates that overshoot the container. Warm sand, black, and one red mark.

**Signature device.** Oversized product plates that break the container edge and overlap vertically — impossible to confuse with the other two pages.

### Desktop wireframe

```
┌──────────────────────────────────────────────────────────────────────┐
│  Header (transparent, white type)                                    │
│ ████████████████████████████████████████████████████████████████████ │
│ ████  cinematic rider photograph, 16:9, full viewport  ██████████████│
│ ████                                                                 │
│ ████  Electric Bikes                                                 │
│ ████  City travel, without the traffic.                              │
│ ████  [Explore the range]                            LONEX / Mobility│
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                          (offset right, cols 6–12)                   │
│                          The lede, 1.5rem, 28 ch max.                │
│                          Two sentences of body beneath.              │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────┐                      │
│ │  ███ bike plate, bleeds past left gutter ███ │  Electric Bike       │
│ └─────────────────────────────────────────────┘  sentence            │
│                                                  View product →      │
│                        ┌────────────────────────────────────────────┐│
│   Electric Commuter    │  ███ bike plate, bleeds past right gutter █││
│   sentence             └────────────────────────────────────────────┘│
│   View product →                                                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────── sand band ───────────────────────────────────────┐
│  Commuting        Errands          Weekends                          │
│  ─────────        ────────         ────────                          │
│  two sentences    two sentences    two sentences                     │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  ██████ editorial photograph 16:9 ███████████████████████████████████ │
│  "One pull-quote, 30 ch, white, bottom left."                        │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  Power for the ride        Batteries →     Solar →                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  SAND BAND:  Choose your LONEX.                                      │
│              [Start an enquiry]   Find a confirmed seller →           │
└──────────────────────────────────────────────────────────────────────┘
```

### Mobile wireframe

```
┌───────────────────────┐
│ header                │
│ █████████████████████ │
│ ██ 4:5 rider photo ██ │
│ ██                 ██ │
│ ██ Electric Bikes  ██ │
│ ██ City travel...  ██ │
│ ██ [Explore]       ██ │
│ █████████████████████ │
│ offset lede           │
│                       │
│ ┌───────────────────┐ │
│ │  bike plate 3:2   │ │
│ └───────────────────┘ │
│ Electric Bike         │
│ sentence              │
│ View product →        │
│                       │
│ ┌───────────────────┐ │
│ │  bike plate 3:2   │ │
│ └───────────────────┘ │
│ ...                   │
└───────────────────────┘
   use cases: horizontal
   snap rail, 82vw cards
   ████ editorial 4:3 ████
   Batteries → Solar →
```

**Mobile decisions.** The hero keeps the image first because it is the brand moment, but the headline and CTA are guaranteed within the first viewport. The use-case band becomes a horizontal snap rail with a visible next card (Baymard's mobile pattern), not a stack of three blocks.

---

## 10. How the three pages differ

| | Solar | Batteries | Electric Bikes |
| --- | --- | --- | --- |
| Metaphor | Architectural drawing | Vertical stack / charge | Horizon / motion |
| Base surface | Paper + stone | Charcoal / black | Sand |
| Hero | Asymmetric split, portrait photo bleeding right | Centred, product on black, flow rule beneath | Full-bleed cinematic, headline low-left |
| H1 | 5.5 rem, two-line lockup | 4.25 rem, centred | 6 rem, low-left on image |
| Product presentation | Two hairline cells side by side | Alternating plinths, left/right | Oversized plates that break the container |
| Structural device | 12-col rules and hairlines | Centre spine + step flow | Running horizon + offset columns |
| Accent use | Red rule and one link | Red hairline on the product, barely used | One red square mark |
| Motion | Clip-path reveal + rule draw | Charge line filling on scroll | Slow scale/pan on plates |
| Close | Black band | Stone band | Sand band |
| Cross-link | → Batteries | → Solar | → Batteries + Solar |

No two share a hero composition, a product composition, a background temperature, or a closing band.

---

## 11. Motion

Restrained, per page, never decorative.

| Page | Moment | Treatment | Trigger |
| --- | --- | --- | --- |
| Solar | Hero photograph | `clip-path: inset(0 100% 0 0)` → `inset(0)` over 900 ms, ease-out | on mount |
| Solar | Hero hairline | `scaleY` 0 → 1, 600 ms | on mount |
| Solar | Product cells | 60 ms stagger, `y: 16` → 0, opacity | first scroll into view |
| Solar | Editorial band | image `scale: 1.04` → 1 over 1200 ms | once |
| Batteries | Hero product | `y: 24` → 0, opacity, 800 ms | on mount |
| Batteries | Charge line | grey → red fill, `scaleY` 0 → 1, scrubbed | scroll through the flow section |
| Batteries | Plinths | alternate `x: ±24` → 0, 500 ms | once |
| Bikes | Hero | `scale: 1.06` → 1 over 1400 ms | on mount |
| Bikes | Plates | 80 ms stagger, `y: 32` → 0 | once |
| Bikes | Editorial | slow `scale` 1.05 → 1 | once |

Rules:
- One `gsap.matchMedia()` block per page; everything inside `(prefers-reduced-motion: no-preference)`.
- No animation may leave content at opacity 0 if JavaScript fails. Initial states are applied by GSAP, not by CSS.
- No parallax. The homepage's Move band remains the site's single parallax moment.
- No identical timing curve reused across all three pages.

---

## 12. Implementation plan (staged, per the brief)

**Phase A — Solar only**
1. Add `src/app/category.css` with the shared category primitives and the `.lxcat-hero--solar` block.
2. Add `src/components/public/category/solar-category.tsx`.
3. `page.tsx` loads data and selects the layout component by slug; unknown slugs fall back to a neutral layout (no crash).
4. Generate/source the solar plates; record in `ASSET_SOURCES.md`.
5. Capture 1440 / 1024 / 768 / 390 / 360, scrolled full-page plus fold, console and network errors, overflow, broken images, contrast check.
6. **Stop for review.**

**Phase B — Batteries only.** Same loop, with the dark tokens and the flow component. **Stop for review.**

**Phase C — Electric Bikes only.** Same loop. **Then** a final cross-page comparison at all five widths.

Each phase touches only:
- `src/components/public/category/*` (new)
- `src/app/category.css` (new)
- `src/app/(site)/[categorySlug]/page.tsx` (data wiring and layout switch)
- `public/images/lonex-category/*` (new assets)
- `ASSET_SOURCES.md`

Untouched: homepage, header, mega menu, footer, database schema, admin, authentication, product detail pages, and all business logic in `src/lib/public`.

**QA definition of done, per page**
- Typecheck, lint on touched files, production build, unit tests.
- No horizontal overflow at 360/390/768/1024/1440.
- Zero broken images after a full scroll.
- Every text/background pair ≥ 4.5:1 (large display ≥ 3:1).
- Reduced-motion run with all content visible.
- Screenshots inspected and attached; no claim without an artifact.
- No invented specification, price, certification, warranty or performance claim.
- No DEMO/SAMPLE/ILLUSTRATIVE wording, no section numbering, no importer/distributor language.

---

## 13. Open questions — needed before Phase A

1. **Electric bikes or electric scooters?** The category is "Electric Bikes" and the products are "Electric Bike" / "Electric Commuter Bike", but both the category cover and the product render show a step-through **scooter**. A bicycle hero would contradict the product photography. Options: (a) supply true bicycle photography, (b) rename to "Electric Scooters"/"E-Mobility", (c) keep the name and show only the existing product, with copy that avoids pedal/cycling claims. **This must be decided before the bikes page is built.**
2. **Are "Solar Module", "Solar Panel", "Home Battery", "Hybrid Inverter", "Electric Bike" real model names or placeholders?** Generic names will make an otherwise premium page feel unfinished. If real, fine; the design will carry them.
3. **Resolution.** Can higher-resolution exports of the existing renders be supplied (currently 900 px)? Otherwise full-bleed plates are capped at half-width.
4. **Editorial photography.** Three new plates are required (solar roof at dusk, battery installation, bike in the city). Confirm whether these are generated in-house or sourced under licence.
5. **Category naming.** Should the H1 be the CMS name ("Solar Panels") or the range verb ("Generate")? Proposal: CMS name as H1, range verb as the supporting line, for consistency across pages.

---

## 14. Approval

This document is the Phase 8 gate. On approval I will implement **Solar only**, capture it at all five widths, and stop for review before touching Batteries.

Nothing in this step has been staged, committed or pushed.

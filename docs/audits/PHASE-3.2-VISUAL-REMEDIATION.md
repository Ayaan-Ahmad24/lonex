# LONEX — Phase 3.2 Visual Remediation

**Report ID:** LONEX-PHASE3.2-VISUAL-001
**Date:** 2026-11-20
**Branch:** `security/nextjs-16.4.6` (HEAD `dc0360b`, all work uncommitted)
**Worktree:** `lonex-security-16.4.6`
**Original checkout:** `client-preview` at `b2ba007` — untouched
**GitHub backup:** `backup/pre-nextjs-security-2026-11-19` at `dc0360b` — untouched

---

## 1. Summary

Every visual finding raised for Phase 3.2 has been repaired and re-verified in a real
browser at 360×800, 390×844, 430×932 and 1440×900. Desktop (1440×900) is pixel-identical
to the pre-remediation baseline everywhere except where the findings required a change.

| # | Finding | Status |
|---|---------|--------|
| F1 | Homepage mobile hero cropped landscape photography into a 100svh portrait frame | **PASS** |
| F2 | Solar mobile hero — subject cropped, copy over the photograph | **PASS** |
| F3 | Batteries mobile hero — subject cropped, copy over the photograph | **PASS** |
| F4 | Electric scooters mobile hero — extreme handlebar zoom, copy over the photograph | **PASS** |
| F5 | Authorized sellers mobile hero — subject cropped, copy over the photograph | **PASS** |
| F6 | Homepage MOVE slide used electric-*bicycle* photography | **PASS** |
| F7 | Blog post 29 cover (`/media/201`) used electric-*bicycle* photography | **PASS** |
| F8 | Authorized sellers “Electric Scooters” range card used bicycle photography | **PASS** |
| F9 | Move range card showed RIDE-1000 branding and cut the front wheel | **PASS** |
| F10 | Gallery counter `01 / 03` sat on top of the poster artwork and its footer | **PASS** |
| F11 | Gallery thumbnails were square `object-fit: cover` crops of posters | **PASS** |
| F12 | Seller logos (ii Energy 2.62:1, Yahya 2.20:1) illegible in a 96×80 box | **PASS** |
| F13 | `SOLAR / GENERATE` breadcrumb overflowed / split mid-phrase on narrow screens | **PASS** |

No commits, pushes, merges, branch or worktree switches, resets or cleans were performed.
No images or media files were deleted, overwritten or generated. No seller records were
edited. No raw SQL was used for the one CMS-managed content change (see §5).

---

## 2. What changed, and why

### 2.1 Mobile hero composition (F1–F5)

The five heroes were full-bleed overlays: one landscape photograph stretched to the full
viewport height with the headline and body copy drawn on top of it. On a 360–430px wide
screen that crops a 16:9 or 2.29:1 photograph into a ~0.45:1 portrait window and buries the
copy in the middle of the picture.

At ≤760px (≤767px for the sellers page, which has its own breakpoint) each hero now uses a
**stacked composition**:

- the photograph becomes a full-width, in-flow panel at a declared `aspect-ratio`, so it is
  never cropped into a portrait window;
- the copy moves below the panel onto the hero’s own ground;
- the scrim/veil/wash is pinned to the image area (`inset: 0 0 auto 0` plus the same ratio)
  so it still grades the photograph but no longer darkens the text;
- the content block sits above the scrim (`position: relative; z-index: 2`);
- the decorative rule layer is hidden on mobile;
- no `100vh`/`100svh` heights and no forced `min-height` remain at these widths.

Panels used:

| Hero | Source ratio | Mobile panel | Note |
|------|--------------|--------------|------|
| Homepage slideshow | mixed (16:9 ×2, 4:3 ×1) | `4 / 3` for **all** slides | fixed ratio keeps the copy below from shifting as slides advance |
| Solar | 16:9 | `16 / 9` | natural ratio, no crop |
| Batteries | 16:9 | `16 / 9` | natural ratio, no crop |
| Electric scooters | 2.29:1 | `2000 / 874` | natural ratio of `move-scooter.webp` |
| Authorized sellers | 1.64:1 | `1000 / 610` | natural ratio of `city-solar.webp` |

**Why the homepage panel is a single fixed ratio.** The three slide photographs have
different intrinsic ratios. Letting each slide size its own panel would change the height of
the hero on every advance and shift all copy below it. A fixed 4:3 panel costs only a 25%
side crop on the two 16:9 photographs, keeps the 4:3 scooter photograph uncropped, and
measured **293px of stage height on all three slides at 390×844** (see §6.1).

**Why the homepage hero no longer uses a negative top margin at mobile.** The header is
`position: sticky` and in flow at these widths. The negative `calc(-1 * var(--site-header-h))`
that lets the desktop hero slide under a transparent header hid the top of the new image
panel behind it. It is now `margin-top: 0` below 760px.

### 2.2 Correct scooter photography (F6–F9)

All replacements use assets that were **already in the media library**; no new or generated
imagery was introduced.

| Asset | Media ID | Dimensions | Ratio | Used for |
|-------|----------|------------|-------|----------|
| LONEX white scooter, studio three-quarter, dual headlight lit, both wheels, LONEX mark | **264** | 1448×1086 | 4:3 | homepage MOVE slide, homepage Move range card, sellers range card, site-header Move tile, blog post 29 cover |
| White scooter, light studio ground, side elevation | 265 | 1448×1086 | 4:3 | spare |
| Black scooter, side elevation | 266 | 1448×1086 | 4:3 | spare |
| Black scooter, front portrait | 267 | 1198×1313 | 0.91:1 | spare (see §8.3) |

`/media/264` was verified over HTTP: `200 image/jpeg`, 166 807 bytes,
`cache-control: public, max-age=31536000, immutable`.

**Move range card (F9).** The 4:3 studio plate is fitted inside the shared 4:5 card frame with
`object-fit: contain` instead of being cropped, so both wheels, the headlight and the LONEX
mark stay in shot. The card frame ground follows the photograph’s own vertical backdrop
(darker above the light, brighter on the reflective floor) so the fitted plate reads as the
studio sweep continuing. Hover zoom is disabled on this one card so a zoom can never clip the
wheels. The RIDE-1000 branding that the previous `range-scooter.webp` render carried is gone.

**Scooter category hero.** The hero keeps `move-scooter.webp` (2000×874). Media 267 is a white
studio portrait whose ground clashes with the warm sand hero, so the existing environmental
scooter photograph was retained at its natural ratio (≈170px tall panel at 360px wide) rather
than forcing a studio plate into that hero.

### 2.3 Gallery (F10, F11)

- The `01 / 03` counter and the `Enlarge` hint moved out of the stage `<button>` into a
  sibling `.lxp-gallery__bar` metadata row directly under the stage. They are static text
  now, not absolutely positioned overlays, so they can never cover the poster footer.
- Thumbnails are `aspect-ratio: 4 / 3` with `object-fit: contain`, so each tile shows the
  whole poster instead of a square centre crop. Poster assets, the stage and the lightbox are
  unchanged.

### 2.4 Seller logos (F12)

- ASC Trading Company keeps its existing treatment: the logo file, seller record and relative
  scale are unchanged; only the plate around it is now aspect-ratio aware.
- The media column widened `110px → 180px` and the image is wrapped in an `.lxs-entry__logo`
  plate (`max-width: 180px; height: 80px; padding-inline: 8px`, `place-items: center`), with
  the image at `max-width/max-height: 100%; object-fit: contain`.
- Measured at 390×844: ASC 162×137, ii Energy 162×62, Yahya 162×74 — previously all were
  constrained by a 96×80 box (64×80 rendered), which left the two wide wordmarks unreadable.
- Logo files and seller records were not modified.

### 2.5 Breadcrumbs (F13)

`.lxc-crumbs > a/span` and `.lxs-crumbs > a/span` are `white-space: nowrap`. The trail still
wraps between crumbs, but `SOLAR / GENERATE`, `MOBILITY / MOVE`, `STORAGE / STORE` and
`Authorized sellers` each stay on one line. Verified on every category and seller viewport.

---

## 3. Evidence

All screenshots live under `artifacts/phase-3.2-remediation/`. `before/` is the pre-change
baseline captured in the same browser and the same four viewports.

```
before/<viewport>/<page>-hero.png       after/<viewport>/<page>-hero.png
before/<viewport>/<page>-full.png       after/<viewport>/<page>-full.png      (mobile only)
before/<viewport>/<element>.png         after/<viewport>/<element>.png
```

| Viewport | Files (before / after) | Contents |
|----------|------------------------|----------|
| `360x800` | 36 / 36 | home, solar, batteries, scooters, sellers, luma — hero, full page, and the five element shots |
| `390x844` | 36 / 36 | as above |
| `430x932` | 24 / 24 | hero + full page for the six pages |
| `1440x900` | 24 / 24 | hero + element shots (desktop regression check) |

Element shots: `gallery-luma`, `gallery-lbc`, `seller-entry`, `seller-entry-2`,
`seller-entry-3`, `range-card-move`.

Additional evidence:

| Path | Shows |
|------|-------|
| `after/interaction/home-slide-move.png` | MOVE slide with media 264 after arrow/tab navigation |
| `after/interaction/gallery-thumb2.png` | thumbnail 2 selected, counter `02 / 03` in the metadata row |
| `after/interaction/lightbox-open.png` | lightbox open from the stage |
| `after/blog/390x844-article-hero.png` | post 29 cover is the scooter, caption from media alt |
| `after/blog/1440x900-blog-index.png` | journal index card for post 29 |
| `after/context/1440x900-range-row.png` | the three range cards side by side |
| `after/context/390x844-sellers-range.png` | sellers page range cards, Electric Scooters on media 264 |
| `after/context/scooter-mega-crop-preview.png` | 16:10 cover crop used by the header Move tile |
| `lint-after.txt`, `build-after.txt` | quality gate output |

---

## 4. Layout verification (measured, not inspected)

### 4.1 Hero panels

| Check | Viewport | Result |
|-------|----------|--------|
| Homepage stage height across all 3 slides | 390×844 | 293 / 293 / 293 px — no shift on advance |
| Homepage slide 1 / 2 / 3 rendered image | 390×844 | 390×219 (`cover`), 390×219 (`cover`), 390×292 (`cover`) |
| Homepage hero no longer under the sticky header | 390×844 | hero `margin-top: 0`, image panel starts below the header |
| Solar panel ratio | 360 / 390 / 430 | `16 / 9`, breadcrumb and `SOLAR / GENERATE` on one line each |
| Batteries panel ratio | 360 / 390 / 430 | `16 / 9`, all three title lines legible |
| Scooters panel ratio | 360 / 390 / 430 | `2000 / 874`, scooter fully in frame, headlight visible |
| Sellers panel ratio | 360 / 390 / 430 | `1000 / 610`, city photograph intact |
| Horizontal document overflow, 9 routes × 4 viewports | all | none (`scrollWidth == clientWidth`) |

Routes checked for overflow: `/`, `/solar`, `/batteries`, `/electric-scooters`,
`/authorized-sellers`, `/electric-scooters/lonex-luma`, `/solar/lonex-lbc-pro`, `/blog`,
`/blog/electric-bike-buying-guide-pakistan`.

### 4.2 Gallery

| Check | Result |
|-------|--------|
| Thumbnail boxes | 3 × `64×48` at 390×844 — ratio 1.33, `object-fit: contain` |
| Counter position | outside the stage `<button>` (verified by DOM containment test) |
| Counter text on selection | `01 / 03` → `02 / 03` |
| Stage / poster / lightbox markup | unchanged apart from the counter/hint relocation |

### 4.3 Seller logos

| Seller | Media | Rendered box at 390×844 |
|--------|-------|-------------------------|
| ASC Trading Company | 220 (569×482) | 162×137 |
| ii Energy | 250 (1100×420) | 162×62 |
| Yahya Machinery Corporation | 221 (1781×809) | 162×74 |

Every entry still exposes `tel:` and WhatsApp links.

---

## 5. Blog cover change (F7) — CMS workflow, not SQL

The blog cover is CMS-managed, so the change went through the application service rather than
a database update:

- Service: `updateBlogPost(actorUserId, id, BlogInput)` in `src/admin/modules/blog/service.ts`
- Post: 29 — “Electric Bike Buying Guide Pakistan 2026”, slug `electric-bike-buying-guide-pakistan`
- Cover: **media 201 → media 264**
- Validated first against the media library (asset exists, `image/jpeg`, 1448×1086), through a
  dry run, then applied
- Actor recorded: `025497a8-ae36-4245-8d3f-1985a4ebd2b5` (first active CMS user)
- Status remained `published`; slug unchanged; the service re-claimed the public path and
  wrote its own `blog.update` audit entry

Content integrity — the existing `contentJson` was passed back as `document`:

```
contentHash before: b99acdb3fd1abed2f7074b60df939297e3b3e4239f93c5e29eb0563a8c1c09af
contentHash after : b99acdb3fd1abed2f7074b60df939297e3b3e4239f93c5e29eb0563a8c1c09af
contentPreserved  : true
```

No other blog row, media row or seller row was written.

---

## 6. Interactions re-tested in the browser

Mobile 390×844, touch context, reduced motion off:

| Interaction | Result |
|-------------|--------|
| Autoplay advances within the interval | PASS (slide 0 → 1) |
| Pause control sets `aria-pressed="true"` and holds the slide ≥9s | PASS |
| Pause control resumes the slideshow | PASS |
| Swipe (touchstart → touchend, 240px) advances the slide | PASS |
| Slide tabs select the requested slide; 3 tabs present | PASS |
| Arrow buttons advance/rewind | PASS |
| Gallery thumbnail selection updates the stage and counter | PASS |
| Gallery stage opens the lightbox | PASS |
| Body scroll is locked while the lightbox is open | PASS |
| `Escape` closes the lightbox | PASS |

---

## 7. Desktop regression check (1440×900)

Pixel diff of the `before/` and `after/` screenshots (mean channel delta, changed-pixel
share with a per-channel threshold of 12):

| Screenshot | Result |
|------------|--------|
| `home-hero.png` | **identical** (0.00% changed) |
| `solar-hero.png` | **identical** |
| `batteries-hero.png` | **identical** |
| `scooters-hero.png` | **identical** |
| `sellers-hero.png` | **identical** |
| `gallery-lbc.png` | changed — element grew 1270 → 1284px because the counter row now sits under the stage |
| `gallery-luma.png` | changed — same 14px counter row |
| `luma-hero.png` | 2.49% — the same 14px stage-row offset on the product page |
| `range-card-move.png` | 72.94% — intended image swap |
| `seller-entry*.png` | 5.4–7.7% — intended logo plate |

Desktop is therefore unchanged on every page that was meant to stay unchanged, and the only
desktop differences are the findings themselves.

---

## 8. Quality gates

| Gate | Command | Result |
|------|---------|--------|
| Typecheck | `npm run typecheck` | **PASS** — `tsc --noEmit` clean |
| Tests | `npm run test` | **PASS** — 25 files, 201 tests |
| Build | `npm run build` | **PASS** — compiled successfully, no errors or warnings |
| Lint | `npm run lint` | **12 errors, 6 warnings — identical to the pre-existing baseline**, all in `scripts/seed-demo-content.ts` (`no-explicit-any`) and `no-img-element` warnings |

One test run mid-pass failed `settings.test.ts > does not write or audit a no-op save`
(expected 1 `settings.update` audit row, found 2). That test counts rows in the shared
development database and only cleans up in its own `afterAll`, so a pre-existing audit row
made it fail. Nothing in this phase writes settings or audit rows. The file passed in
isolation and the full suite passed on the final run with the database clean; recorded here
for transparency rather than as a regression.

---

## 9. Files touched

| File | Purpose |
|------|---------|
| `src/app/hero.css` | stacked homepage hero ≤760px, `--lx-hero-media-ratio`, removed conflicting `min-height` |
| `src/components/public/hero-ui.tsx` | MOVE slide image → `/media/264`, alt and focal position |
| `src/app/catalog.css` | stacked catalogue heroes ≤760px, breadcrumb `nowrap`, gallery bar and 4:3 contained thumbnails |
| `src/app/directory.css` | stacked sellers hero ≤767px, `.lxs-crumbs` nowrap, 180px logo column and `.lxs-entry__logo` plate |
| `src/components/public/seller-card.tsx` | `.lxs-entry__logo` wrapper replaces the `h-20 w-24` Tailwind box |
| `src/components/public/product-gallery.tsx` | counter and Enlarge hint moved out of the stage button |
| `src/app/(site)/page.tsx` | Move range card image → `/media/264` |
| `src/app/(site)/authorized-sellers/content.ts` | Sellers Electric Scooters range card → `/media/264` |
| `src/components/public/site-header.tsx` | header Move mega tile → `/media/264` |
| `src/app/home.css` | Move card `contain` plate, hover-zoom exception, removed a trailing blank line |

Databases / content: post 29 cover `201 → 264` only (§5).

---

## 10. Not verified / out of scope

- **Real devices.** All evidence is Chromium via Playwright at the four required viewports.
  No physical iOS or Android hardware, and no Safari/Firefox rendering, was exercised.
  Dynamic-viewport toolbar behaviour on real mobile browsers is therefore **NOT VERIFIED**.
- **Desktop scooter hero.** The 1440×900 scooter hero is still the pre-existing tight crop of
  the handlebars. Desktop was required to remain unchanged, so it was deliberately left as is;
  it remains a design observation, not a regression from this phase.
- **Header products flyout.** The Move mega tile now points at `/media/264`. The source was
  verified in the DOM and its 16:10 crop previewed
  (`after/context/scooter-mega-crop-preview.png`), but the flyout itself was not re-exercised
  in this pass because it is not one of the Phase 3.2 findings.
- **Missing audit of record.** `docs/audits/FINAL-VISUAL-VERIFICATION-RESULTS.md`, referenced by
  the instruction, does not exist in either checkout (`client-preview` or this worktree). The
  enumerated findings in the Phase 3.2 instruction were therefore treated as the audit of
  record. If that file is restored from elsewhere, its finding list should be reconciled
  against §1.

---

## 11. Approval gate

Nothing has been committed, pushed or merged. The work sits uncommitted on
`security/nextjs-16.4.6` in the `lonex-security-16.4.6` worktree, ready for review.

Awaiting approval before any commit, push or merge.

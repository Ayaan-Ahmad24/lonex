# Step 9A — About Page Redesign Review

**Date:** 13 November 2026
**Scope:** `/about` only.
**Status:** Implemented and verified in a real browser at 1440, 1024, 768, 390 and 360px. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-9a-review/`
Archive: `artifacts/lonex-step-9a-review.zip`
Machine-readable QA: `artifacts/lonex-step-9a-review/qa-report.json`

---

## 1. Why this step existed

The previous About page described a different company. It opened with "Energy that moves life forward.", then explained that LONEX "imports, distributes and deals in" solar, batteries and electric bikes. Its hero used a data-centre photograph with no connection to the range, the introduction contained a mojibake em dash, and the page repeated the same heading-plus-two-column block five times. A visitor learned the business model before learning what the company believes about energy.

The page was rebuilt as a brand document rather than a company profile:

- One argument, carried from the hero to the closing: generation, storage and mobility are three points in the life of the same electricity.
- Each section has its own composition, so the page reads as a sequence rather than a stack of cards.
- All importer, manufacturer, distributor and dealership language is gone.
- No history, founding date, statistics, certifications, partnerships, team members, charity programmes or completed initiatives were invented.

---

## 2. Design direction

The page uses the established Step 7/8 system without adding to it.

| Token | Value | Use |
| --- | --- | --- |
| Display | Poppins | Headlines, section titles, body copy |
| Technical | IBM Plex Mono | Eyebrows, indices, captions, buttons, facts |
| Red | `#cf0a0a` | Primary CTA, emphasis, indices, rules |
| Ink | `#000` / `#0b0a0a` | Type and dark editorial fields |
| Paper | `#ffffff` | Light sections |
| Stone | `#f5eded` | Hero field, pillars field, loop note |
| Rule | `rgba(0,0,0,.14)` / white `.16` | Hairlines and list dividers |

- Headlines are large, tight and editorial: `-0.05em` tracking, `0.9–0.98` line height, two-line statements with the second line in red or white.
- Sections alternate paper, stone and near-black fields so the page has a rhythm without decorative cards, shadows or gradients (the closing scrim is the only gradient, and it exists for legibility).
- Images are full-bleed or deliberately cropped; no rounded corners.
- Styles live in a new `src/app/about.css`, imported after `home.css`. Every selector is prefixed `lxa-` and the shared tokens are read, not redefined.
- Copy lives in `src/app/(site)/about/content.ts`, separate from markup, so the three pillars, principles, commitments and range links can be edited without touching JSX.

---

## 3. The page, section by section

### 3.1 Hero — "One current. Three directions."

- A 50/50 split: copy on warm stone, a tall photograph of terracotta tiles meeting a solar array on the right.
- The headline is split into two lines; "Three directions." is red. The introduction is two paragraphs of real copy, not a slogan.
- Primary CTA anchors to the range; secondary CTA goes to contact.
- A facts rule closes the copy column: `Range — Generate · Store · Move`, `Based — Lahore, Pakistan`, `Approach — Clarity before choice`.
- The image carries a mono caption with the index `01` and "Rooftop solar, in detail", so the photograph reads as evidence rather than decoration.
- At 900px and below the image moves under the copy, becomes full-bleed and keeps its caption inside the page gutters.

### 3.2 Our story — "Energy is a system, not a shelf."

- The heading and lede form an asymmetric top row; the title occupies the left two-thirds, the lede the right third.
- Below, two body columns explain the vision and the infinity mark, with a stone "The loop" note on the right listing Generate, Store, Move.
- The section ends with a full-bleed aerial of city rooftops and solar arrays, captioned "A city of small power stations." and "Distributed generation".
- This is the only section with a full-bleed image band, which makes it the visual centre of the story.

### 3.3 The range — three distinct pillar compositions

| Pillar | Composition | Image |
| --- | --- | --- |
| 01 Generate / Solar Panels | Image left, copy bottom-aligned right, hairline between | Technician lifting a module onto a tiled roof (`v2/craft-panel.webp`) |
| 02 Store / Batteries | Full-width near-black band, copy left, image right, reversed rules | Two white batteries and an inverter in a warm interior (`lonex-step-1/store-battery.webp`) |
| 03 Move / Electric Bikes | Wide image with a white copy plate overlapping its lower-left corner | Black electric bike in a covered city rack (`v2/move-city.webp`) |

- Each pillar has an index tag, a mono kicker, a headline, a practical explanation, a compatibility/detail paragraph, two mono facts and a link to the category.
- Copy is deliberately practical: generation reduces what a property draws while the sun is up; storage changes *when* energy can be used, with the outage benefit qualified by "where the system supports it"; bikes are described by journey length, surface, storage and charging rather than performance claims.
- A chain rule under the third pillar repeats Generate → Store → Move with the line "The same electricity, at three points in its life."
- Hover on any pillar image scales it to `1.035` over 900ms; there is no transform on touch or reduced motion.

### 3.4 Our approach — "Clarity is part of the product."

- A near-black field, split into a narrow left column (heading, introduction, consultation photograph) and a wide right list of four principles.
- The principles are: selection with a reason, plain description, understanding before recommendation, a connected system.
- The photograph is captioned "The conversation is part of the system."
- A full-width rule and a short statement close the section: "The right system is the one that fits the life around it."
- The dark field separates the product section from the community section and gives the page a second, quieter register.

### 3.5 Community and responsibility — "Knowledge should travel further than a quotation."

- A portrait photograph of an installer on a corrugated roof sits on the left; the argument and commitments sit on the right.
- The copy is written as a standard, not a record: people choose better when the subject is explained in their terms; the responsibility is practical rather than promotional.
- Three commitments follow: plain language, informed choice, responsible progress. Each is a position, not a claimed programme.
- CTAs are "Ask a question" (contact) and "Read the journal" (blog).
- Below 1100px the section becomes one column: copy, commitments and actions first, then a 4:3 photograph. This avoids the tall empty field that appeared under the portrait image at 1024px.

### 3.6 Closing — "Start with the whole picture."

- A full-bleed dusk mountain landscape with a left-weighted scrim.
- Copy connects the three purchases back to one way of thinking, with "Contact LONEX" and the real phone number from site settings.
- A range register on the right links to Solar Panels, Batteries and Electric Bikes with Generate / Store / Move metadata.
- The photograph is decorative and lives inside an `aria-hidden` wrapper with an empty `alt`; the meaningful content is the copy and the links.

---

## 4. Responsive behaviour

| Width | Behaviour |
| --- | --- |
| 1440 | Hero split 50/50; story three-part; pillars in three compositions; approach two columns; community two columns; closing two columns |
| 1024 | Same structure; pillar ratios rebalanced below 1200px so copy keeps a readable measure; community stacks at 1100px and below |
| 768 | Hero stacks with a full-bleed image; story and pillars single column; approach stacks; closing stacks |
| 390 | Hero facts become two columns; pillar copy sits under each image; move plate overlaps by 38px; closing actions stack |
| 360 | Same as 390 with tighter type and gutters; no horizontal overflow |

- Paragraph measure is capped at 60ch on tablet-width single columns, 50–56ch in the community section, and 39ch for the approach introduction.
- Mobile buttons become full width at 480px and below; the primary action keeps its arrow at the far edge.
- The mobile headline intentionally breaks into three lines at 360–390px ("One current. / Three / directions."), which reads as a stacked editorial statement rather than a clipped line.

---

## 5. Motion

- The page uses the existing `PageMotion` contract only: `data-hero`, `data-hero-line`, `data-hero-item`, `data-reveal`, `data-reveal-group` and `data-reveal-image`.
- No animation dependency was added. There is no parallax: the shared motion component exposes a reveal vocabulary, not a scroll-scrub attribute, and adding one would have changed a shared file outside this step's scope.
- Image hover is CSS-only and disabled under `prefers-reduced-motion`.
- With reduced motion enabled, every reveal element is at opacity 1 before any script runs (verified in the browser).

---

## 6. QA results

### 6.1 Commands

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | Pass |
| ESLint | `npx eslint "src/app/(site)/about/page.tsx" "src/app/(site)/about/content.ts"` | Pass |
| Tests | `npm run test` | 25 files, 192 tests passed |
| Production build | `npm run build` | Pass; `/(site)/about/page` present in the build manifest |
| Production serve | `npm run start -- -p 3001` | `/about` returned 200 |

No CSS linter is configured in the project; `about.css` was verified through the browser checks and visual review.

### 6.2 Browser checks (production build)

| Viewport | Height | Horizontal overflow | Broken images | Console errors | Page errors | Failed requests | Banned terms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1440×900 | 8811 | 0 | 0 | 0 | 0 | 0 | 0 |
| 1024×768 | 8207 | 0 | 0 | 0 | 0 | 0 | 0 |
| 768×1024 | 10846 | 0 | 0 | 0 | 0 | 0 | 0 |
| 390×844 | 11350 | 0 | 0 | 0 | 0 | 0 | 0 |
| 360×780 | 11647 | 0 | 0 | 0 | 0 | 0 | 0 |

Additional checks:

- **Reduced motion:** 0 hidden reveal elements, h1 opacity 1.
- **Links:** `/`, `/solar`, `/batteries`, `/ev-bikes`, `/contact`, `/blog`, `/about`, `/verify`, `/authorized-sellers` all returned 200.
- **Headings:** one `h1` ("One current. Three directions."), section `h2`s, pillar and principle `h3`s.
- **Anchor:** "Explore the range" lands with the section top 116px below the sticky header.
- **Hover:** Generate image transform measured at `scale(1.035)`.
- **Focus:** the page's `:focus-visible` rule draws a 2px red outline with a 4px offset.

### 6.3 Issues found during visual review and fixed

1. **Generate image overlapped its copy at 1024.** The media had an intrinsic 4:3 width larger than its grid track once the copy column grew taller. The media is now width-constrained (`width:100%; min-width:0`), and the pillar ratios are rebalanced below 1200px.
2. **Community left a 490px empty field under the image at 1024.** The section now stacks at 1100px and below.
3. **Tablet paragraphs ran too long.** Measure is capped at 60ch for story and pillar body copy.
4. **Closing photograph was too dark to read.** The left scrim was reduced from 0.9 to 0.84 and the mid stop from 0.68 to 0.58, keeping contrast while showing the mountain ridge.
5. **Approach anchor could sit under the header.** `scroll-margin-top` now includes 20px of breathing room.
6. **Hero line read awkwardly.** "reaches a life" became "reaches a home".

---

## 7. Before and after

| | Before (HEAD) | After (Step 9A) |
| --- | --- | --- |
| H1 | Energy that moves life forward. | One current. Three directions. |
| Opening | Importer/distribution business description | Connected energy brand statement |
| Hero image | Data-centre racks | Terracotta roof meeting a solar array |
| Structure | Five repeated heading + two-column blocks | Six sections, six compositions |
| Product story | Import / Distribution / Dealership table | Generate / Store / Move pillars with practical copy |
| People and responsibility | Generic standards list | Plain language, informed choice, responsible progress |
| Closing | Verification prompt | Range register and contact |
| Banned terms | manufacturer, distribution, partnership | none |
| Page height at 1440 | 6294px | 8811px |

Before captures were taken from the HEAD version of the page on the development server; after captures were taken from the production build on port 3001. Both sets are at all five widths, with hero and full-page images, plus a reduced-motion capture.

The full set is in `artifacts/lonex-step-9a-review/before/` and `artifacts/lonex-step-9a-review/final/`. Section-level captures at 1440 and 390 are in `final/sections/`.

---

## 8. Boundaries and caveats

- **Only `/about` changed.** The homepage, header, footer, category pages, product pages, verification pages, seller pages, database, authentication and backend were not modified.
- **No new images.** Every photograph was already in `public/images`.
- **No invented facts.** There is no founding date, company age, staff count, installed capacity, certification, partnership, award, charity programme, donation or completed initiative. "Based in Lahore" and the closing phone number come from existing site settings.
- **Storage claims are qualified.** The outage benefit says "where the system supports it". The bike copy avoids range, speed and performance figures.
- **Community copy is a commitment, not a report.** It describes how LONEX intends to communicate, not programmes it claims to have delivered.
- **The page is server-rendered.** It awaits `connection()` and loads public settings like the other Step 7/8 pages, and exports `instant = false`.
- **Nothing was staged, committed or pushed.**

---

## 9. Files

| File | Change |
| --- | --- |
| `src/app/(site)/about/page.tsx` | Rebuilt page: six sections, new metadata, `PageMotion`, `about.css` |
| `src/app/(site)/about/content.ts` | New copy module: pillars, approach, commitments, range links, story |
| `src/app/about.css` | New page stylesheet, `lxa-` prefix, full responsive rules |
| `scripts/capture-step-9a.mjs` | QA capture harness for before/after |
| `scripts/inspect-step-9a-sections.mjs` | Section-level visual captures |
| `scripts/inspect-step-9a-interactions.mjs` | Anchor, hover and focus checks |
| `artifacts/lonex-step-9a-review/` | Screenshots, raw capture reports, QA report |
| `artifacts/lonex-step-9a-review.zip` | Archive of the review package |

---

## 10. Next step

Step 9A stops here. Awaiting visual approval before Step 9B.

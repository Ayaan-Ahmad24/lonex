# Step 9D — Journal Article Redesign Review

**Date:** 13 November 2026
**Scope:** `/blog/[slug]` only, plus its own stylesheet, renderer, reading-navigation and share components.
**Status:** Implemented and verified in a real browser at 1440, 1024, 768, 390 and 360px. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-9d-review/`
Machine-readable QA: `artifacts/lonex-step-9d-review/qa-report.json`

---

## 1. Why this step existed

The previous article page was a generic document template. It opened with a breadcrumb, a mono date line, the stored title, the stored excerpt and a full-width cover, then handed the body to the shared admin-preview renderer beside a narrow "Published by LONEX" sidebar. There was no table of contents, no reading progress, no share controls, no related reading, no previous/next navigation and no article-specific closing. The page ended by reusing the same black "More notes from LONEX." band as every other section of the site.

It also had a content bug. Three of the five published articles — solar specifications, battery storage and mobility — begin and end their stored document with an empty paragraph. The strict rich-text schema rejects an empty span, so `parseStoredRichText` failed closed on the whole document and the page rendered "This article has no readable content." instead of the article. Those three pages were roughly 2,156–2,198px tall at 1440 and carried no body copy at all. Only the model-code and nameplate articles rendered their text.

The article page is now a reading experience:

- A stone editorial hero with the breadcrumb, subject and date, a large typeset headline and a standfirst written for the piece.
- A full-width cover with a factual caption and a per-photograph crop.
- A 760px reading column with a sticky contents rail on desktop and a collapsible contents panel below 1100px.
- Typographic hierarchy for H2/H3, lists, quotes and a "Next step" callout, plus a reading-progress rule.
- Share controls, previous/next navigation, three real related articles and a dark closing that hands the reader to Contact LONEX.

Article IDs, slugs, titles, dates, excerpts, covers and body copy are untouched. No schema change was made.

---

## 2. Structure and sequencing

The page is six fields, alternating stone, paper and ink:

| # | Section | Field | Role |
| --- | --- | --- | --- |
| 1 | Hero | Stone | Breadcrumb, subject, date, headline, standfirst |
| 2 | Cover | Stone | Full-width photograph with caption and crop |
| 3 | Reading | Paper | Contents rail, article body, next step, share |
| 4 | Pager | Paper | Previous and next article |
| 5 | Related | Stone | Three further articles from the journal |
| 6 | Closing | Ink | Contact LONEX and verification note |

Two decisions fix the reading order:

1. **The contents rail is built from the stored H2 blocks, not from copy.** `buildArticleOutline` walks the parsed document, slugs each H2 label into a stable id and numbers it. The renderer and the navigation receive the same array, so the rail, the mobile panel and the heading ids cannot drift apart. An article with no H2 renders no contents at all.
2. **The article ends with an action, not another list.** The pager is deliberately quiet, related reading stays on stone, and the closing is the only dark band on the page. It carries the Contact LONEX action and the model-code disclaimer that used to sit in the old article footer.

Previous means older and next means newer, matching the journal's newest-first order. The newest article has no "next" and the oldest has no "previous"; that side links to `/blog` instead, so the pager is never half-empty.

---

## 3. Content decisions

Everything factual comes from the CMS: title, `publishedAt`, excerpt, cover, cover alt text and the rich-text body. `content.ts` supplies only the framing around it.

### 3.1 Framing copy

- **Standfirst** reuses `noteFor(post).standfirst` from the journal index, so an article opens with the same promise the index made. No second summary was invented.
- **Kicker** reuses the index kicker (`Solar / Module data`, `Storage / Everyday use`, `Mobility / City riding`, `Verification / Model identity`).
- **Filed under** uses the same slug-to-subject map as the index (`Solar`, `Storage`, `Mobility`, `Verification`).
- **Section labels** — `Contents`, `Next step`, `Share this article`, `Related reading`, `Previous article`, `Next article` — are interface copy, not editorial claims.

### 3.2 Cover captions and crops

Each caption describes what the stored photograph actually shows, and each crop is positioned per image:

| Article | Caption | Crop |
| --- | --- | --- |
| Solar specifications | Rooftop solar across an urban skyline. | `center 58%` |
| Battery storage | A consultation on home energy use. | `center 42%` |
| Electric mobility | A leaf in natural light. | `center 46%` |
| Model code | An installer fixes cabling between modules on a rooftop. | `center 36%` |
| Nameplate | A technician lifts a module onto a roof mounting rail. | `center 42%` |

The model-code cover is a portrait photograph. At `center 36%` the 16:8.6 frame lands on the working detail — hands, cable and panels — instead of a cropped face or empty roof.

### 3.3 The "Next step" callout

Every stored article ends with a paragraph containing nothing but a link: `Verify a model`, `Find a seller`, `Explore electric bikes`. Rendering that as an ordinary paragraph made the closing action look like a stray sentence. `singleLink` detects a paragraph with exactly one span carrying an `href` and promotes it to a stone callout with a red rule and a `Next step` label. Internal links use `→`, external links use `↗` and open in a new tab. No link text or target was changed.

### 3.4 Source content that needs an editorial decision

These are reported rather than silently fixed:

1. **Empty leading and trailing paragraphs.** Solar specifications, battery storage and mobility each store two zero-length paragraphs (one at the top, one at the bottom of the body). This is what broke the old page. `parseArticleDocument` now drops only zero-length blocks before validation; every remaining block passes through untouched. Parsed block counts are 16, 12, 13, 15 and 15 for nameplate, model code, mobility, battery and solar.

2. **The mobility cover does not match the article.** The stored cover (`/media/115`) is a photograph of a leaf, while the article is about city riding. The image has been kept as supplied and the caption says "A leaf in natural light." with an on-page caveat: the stored cover shows a leaf rather than the city riding described, and has been kept as supplied. Replacing it is an editorial decision, not a design one.

3. **The nameplate description says "four figures".** The stored `seoDescription` reads "A practical guide to the four figures on a solar module datasheet…" while the body has five H2 sections. The fifth section is "Then check the model", which is a check rather than a figure, so the description still reads correctly — but an editor should confirm that "four" is intentional.

4. **There are no tables and no inline images in any article.** The rich-text schema has paragraph, heading, list, quote and horizontal rule blocks only. Lists and quotes are styled; no table or inline-image styles were invented for a block type that does not exist. If tables are added later, they need a schema block and a renderer branch first.

5. **There are no quotes in the source.** The quote style exists and is ready, but no article currently exercises it; the QA harness confirms zero blockquotes on all five pages.

### 3.5 What the copy does not claim

No author, byline, read duration, statistic, test result, certification, partnership or performance promise was added. There is no author field in the database, so no author is shown. The only dates are the stored `publishedAt` values formatted by the existing helper. The verification note is the same sentence the old article footer used: a model code confirms registration with LONEX, not the identity of an individual unit.

---

## 4. The page, section by section

### 4.1 Hero

- Warm stone field; content width follows the shared `lx-wrap` container.
- Breadcrumb `Home / Journal / {title}`. The current title truncates with an ellipsis rather than wrapping the crumb onto three lines.
- A mono meta line: red kicker, then the publication date with a small dot separator.
- The headline is `clamp(2.9rem, 5.8vw, 6rem)` — 96px at 1440 — with `line-height: 0.9`, `letter-spacing: -0.055em` and a 15.5ch measure so it breaks into editorial lines. It is the only `h1` on the page.
- The standfirst sits at `clamp(1.05rem, …, 1.25rem)` on a 54ch measure.
- On the right, a hairline-top aside carries `Filed under`, the subject, `Published` with the date, and `All articles →`.
- At 900px the hero stacks: headline, standfirst, then a wrapped aside line with the subject, date and link. At 620px the title drops to `clamp(2.5rem, 10.4vw, 3.4rem)` and at 420px to `clamp(2.2rem, 11.2vw, 2.95rem)`.

### 4.2 Cover

- Full-width frame at `16 / 8.6` on desktop, `16 / 10` below 900px and `4 / 3` below 620px.
- `object-fit: cover` with the per-article `object-position` above.
- The caption row is mono, uppercase and small: the caption on the left, the subject pushed to the right. At 620px it becomes a column.
- The mobility caveat is the exception: 12px sentence-case display type with a red left rule, because 9px uppercase mono made a necessary editorial note look like legal small print.
- Hover scales the photograph 1.015 over 1200ms. It does not move the layout.

### 4.3 Reading column and body typography

- The reading grid is `216px` rail + `760px` column, gap up to 88px, centred in the container. Measured body width is 760px at 1440 and 1024, 704px at 768, 350px at 390 and 320px at 360.
- Body: 17.5–18px / 1.72 on wide screens, 17px / 1.7 at 620px and 16.5px below 420px.
- The first paragraph is promoted to a lead: 22px / 1.58 in ink, so the article has an entry point before it has sections.
- H2: `clamp(1.55rem, 2.1vw, 2.05rem)`, weight 500, `line-height: 1.08`, with a hairline top rule and a red mono section number (`01`, `02`…) above the text. The number is `aria-hidden`.
- H3: `clamp(1.2rem, …, 1.4rem)` in ink; H4 is 17px semibold.
- Lists: red 8px square markers for unordered items; ordered lists use red mono `01`, `02` counters. List text runs at 1.62 line height with 2rem of hanging indent.
- Quotes: a 2px red left rule and a larger, tighter paragraph — unused by the current source, but styled and available.
- Horizontal rules render as a hairline; inline links are red with a 1px underline that thickens on hover.
- The body ends with a 9px red end mark before the share row.

### 4.4 Contents rail and mobile contents

- The rail is 216px wide, sticky at `header + 38px`, with a 1px ink top rule and a mono `Contents 05` label.
- Each item is a numbered row with a hairline divider; the active section turns red and receives `aria-current="location"`.
- The active section is computed from scroll position with a marker at `scrollY + header + 40`, not from intersection ratios, so it changes exactly when a heading passes under the header.
- Below 1100px the rail is removed and a full-width disclosure appears: `Contents` / `05 sections` / `+`. It is a native button with `aria-expanded` and `aria-controls`; the panel is a real `hidden` element, so it is absent from the accessibility tree when closed.
- Selecting an item closes the panel, then scrolls on the next two animation frames. Collapsing the panel changes the document position of the target; measuring the scroll before that change left the heading under the header.
- The rail footer is `Back to top ↑`, which scrolls without changing the URL.

### 4.5 Share

- A hairline-top row after the body: `Share this article` on the left, four controls on the right.
- `X ↗`, `LinkedIn ↗`, `WhatsApp ↗` and `Copy link ⧉`.
- The URL and title are read at click time, so the buttons share the address the reader is actually on. No domain is hard-coded.
- Copy uses `navigator.clipboard` with a `document.execCommand` textarea fallback. The button changes to `Link copied ✓`, and a polite live region announces `Link copied`.
- At 620px the row fills the column; at 420px the four buttons form a 2 × 2 grid.

### 4.6 Pager

- Two equal cells on paper with a central hairline: older article on the left, newer on the right.
- Each cell carries a red mono label, the title at up to 28px, and a mono `subject · date` line.
- Missing sides fall back to `The journal / All articles`.
- Below 620px the cells stack and the divider becomes horizontal.

### 4.7 Related reading

- Stone field, `Related reading` eyebrow and `Continue the thread.` heading, with a 42ch introduction.
- Three articles, excluding the current one, chosen by same subject first and then newest. Every article therefore has three related items even when its subject is unique.
- Each row is a ruled link: red index number, subject and date, title, and a 16:10 thumbnail on the right. Rows are 48px / flexible / 140–208px on desktop, and 32px / flexible / 96px at 620px.
- The whole row is one link, so there is one tab stop per article. Hover turns the title red and scales the thumbnail 1.04.

### 4.8 Closing

- The only dark band: `Talk it through`, "Bring the question to LONEX.", and a paragraph that names what an article cannot see — your roof, your evening load, the route you ride.
- Actions: `Contact LONEX →` (white button) and `All articles ↗` (underlined link).
- The right column carries `On verification`, the model-code disclaimer and `Verify a model →`. This preserves the disclaimer that used to sit at the foot of the old article, without interrupting the reading column.
- At 900px the two columns stack; at 420px the buttons stack vertically.

---

## 5. Reading navigation behaviour

- **Progress rule.** A fixed 2px red bar sits directly under the site header (`top: var(--site-header-h)`, `z-index: 190`). Its width is `scrollY / (scrollHeight − innerHeight)`, clamped to 0–1 and driven by `requestAnimationFrame`. It is `aria-hidden` and purely decorative; the article is complete without it.
- **Anchor landing.** The site already sets `html { scroll-padding-top: 96px }` (the `--space-3xl` token). The article's initial `scroll-margin-top` added a second offset and landed headings roughly 200px down the viewport. It was removed; a clicked heading now lands at 96px, which is 20px below the 76px header, and the active item follows.
- **Focus.** After a contents selection, the heading receives `tabindex="-1"` and focus with `preventScroll: true`, so keyboard readers continue from the section they chose without a second jump.
- **Hash.** The click handler uses `history.replaceState`, so the URL reflects the section without adding a history entry for every heading.
- **Without JavaScript.** The rail and mobile panel are ordinary anchors; the full article, every heading target, the pager, related links and the share buttons are server-rendered. The progress bar and active state are enhancements. The mobile panel, however, needs JavaScript to open, so below 1100px the no-JS reader uses the article's own headings rather than the disclosure.
- **Reduced motion.** Smooth scrolling becomes instant, and the reveal/hover transforms are disabled.

---

## 6. Responsive behaviour

Page heights from the final production build:

| Article | 1440 | 1024 | 768 | 390 | 360 |
| --- | --- | --- | --- | --- | --- |
| Understanding Solar Module Specifications | 5580 | 4900 | 5102 | 5864 | 6047 |
| How Battery Storage Supports Everyday Energy Use | 5618 | 4907 | 5201 | 5980 | 6311 |
| Electric Mobility and the Changing Urban Journey | 5496 | 4788 | 5139 | 5872 | 5984 |
| Why the model code matters more than the box | 5435 | 4800 | 5032 | 5752 | 5863 |
| How to read a solar module nameplate | 5688 | 5026 | 5282 | 6143 | 6463 |

- **1440:** rail + 760px column. **1024:** the rail is already hidden (the breakpoint is 1100), so the contents disclosure sits above a 760px column. The hero keeps its 8.4 / 3.6 split at both widths and stacks at 900. The cover is 16:8.6.
- **768:** the contents disclosure is above the article, and the column is 704px with the body on the same 17–18px scale.
- **390 / 360:** the column is 350px and 320px. The cover is 4:3, the title is about 44px and 40px, the share row wraps, the pager stacks and the related thumbnails shrink to 78px.
- Section spacing stays on the same `clamp()` scale as About, Contact and the journal index. No horizontal overflow was measured at any width.

The mobile pages are taller because they carry the hero, a 4:3 photograph, five or four numbered sections, the next-step callout, the share row, the pager, three related rows and the closing — not because of added whitespace.

---

## 7. Motion

- The page uses the existing `PageMotion` contract: `data-hero`, `data-hero-line`, `data-hero-item`, `data-hero-media`, `data-reveal` and `data-reveal-image`. No animation dependency was added and no shared motion file was modified.
- The hero settles in three moves: the cover photograph scales from 1.06, the headline unclips and rises, then the meta, standfirst and aside follow.
- The cover, related rows and closing reveal in short groups as they enter the viewport.
- Hover motion is CSS-only and reversible: cover scale 1.015, thumbnail scale 1.04, underline sweep, arrow shift, title colour. Nothing moves layout.
- Under `prefers-reduced-motion` every reveal renders visible, the base stylesheet collapses transition durations to 0.01ms, and the article stylesheet removes the cover and thumbnail transforms entirely. The reduced-motion capture shows zero hidden reveal elements and a still page.

---

## 8. QA results

### 8.1 Commands

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Pass |
| ESLint | `npx eslint "src/app/(site)/blog/[slug]/page.tsx" "src/app/(site)/blog/[slug]/content.ts" "src/app/(site)/blog/[slug]/article-body.tsx" "src/app/(site)/blog/[slug]/article-navigation.tsx" "src/app/(site)/blog/[slug]/article-actions.tsx"` | Pass, 0 errors |
| Tests | `npm run test` | 192 tests passed |
| Production build | `npm run build` | Pass; `/blog/[slug]` present as a dynamic route |
| Production serve | `npm run start -- -p 3001` | All five article URLs returned 200 |
| Browser QA | `node artifacts/lonex-step-9d-review/qa.mjs` | 505 checks, 505 passed, 0 failed |

Repo-wide `npm run lint` still reports pre-existing errors under `.agents/**` and `scripts/seed-demo-content.ts`; they are unrelated to this step and were not touched. No CSS linter is configured, so `article.css` was verified through browser checks and visual review.

### 8.2 Browser checks

Twenty-five page states (five articles × five widths) were loaded against the production build:

| Check | Result |
| --- | --- |
| HTTP status | 200 on all 25 |
| Console and page errors | 0 |
| Horizontal overflow | 0 at every width |
| Elements protruding past the viewport | 0 |
| Exactly one `h1` | 25/25 |
| Body copy present | 1,794–2,371 characters per article |
| Contents items = stored H2s | 5/5/5/4/5, matching the renderer |
| Related items | 3 on every page, current article excluded |
| Share controls | 4 on every page |
| Broken visible images | 0 |
| Unique image URLs serving 200 | 37/37 across the five widths |
| Internal links resolving | 14 unique destinations, 0 failures |
| Reading measure | 760px at 1440/1024; 704px at 768; 350px at 390; 320px at 360 |
| Progress rule position | 2px under the header at every width (76px desktop, 68px mobile) |

A first pass counted three hidden `/_next/image` preloads as broken. They belong to the site header's offscreen menu images, not the article; the harness now counts only visible images and separately requests every unique article image source.

### 8.3 Interaction checks

| Behaviour | Result |
| --- | --- |
| Progress bar | Starts at 0 and reaches 0.655 after scrolling 55% of the page |
| Contents click | Hash matches the target; heading lands at 96px with a 76px header |
| Active section | Rail marks the clicked section, with `aria-current="location"` |
| Focus | The heading receives focus with the matching id |
| Previous article | Solar specifications → battery storage, the expected older article |
| Share | X, LinkedIn and WhatsApp targets all carry the current URL and the article title |
| Copy link | Clipboard holds the article URL; button and live region confirm |
| Mobile contents | Opens with Enter, closes after selection, lands the target below the header |
| No JavaScript | Body, 5 anchors, 3 related items and 4 share buttons render; chrome is inert but present |
| Reduced motion | 0 hidden reveal elements; cover transition collapses to 0.01ms |

### 8.4 Issues found during review and fixed

1. **Three articles rendered no body copy.** Empty leading and trailing paragraphs made the strict schema reject the whole document. `parseArticleDocument` removes zero-length spans and empty blocks before validation, and leaves every non-empty block byte-for-byte intact. This restored the solar, battery and mobility articles.
2. **Contents links landed about 200px too low.** The article had its own `scroll-margin-top` in addition to the global `scroll-padding-top: 96px`. The duplicate was removed; the rail now tracks the section that was clicked.
3. **The mobile contents panel moved the target while scrolling.** Collapsing the disclosure shortened the page above the heading. The handler now closes the panel, then measures and scrolls on the next two animation frames.
4. **The mobility caveat was unreadable.** It was 9px uppercase mono, which read as legal small print. It is now 12px sentence-case display type with a red left rule.
5. **The metadata description could collapse to empty.** An earlier draft blanked the description when the stored document failed to parse. It is now `seoDescription || excerpt || settings description`, independent of body parsing.
6. **The QA harness produced false failures.** Smooth scrolling was sampled before it stopped; the harness now waits for scroll stability. Unknown routes return 200 with the Error 404 screen in this Next 16 build, so the missing-article check now asserts the screen rather than the status.

---

## 9. Before and after

### 9.1 Page heights

| Article | Before 1440 | After 1440 | Before 390 | After 390 |
| --- | --- | --- | --- | --- |
| Solar specifications | 2156 | 5580 | 2301 | 5864 |
| Battery storage | 2198 | 5618 | 2359 | 5980 |
| Mobility | 2198 | 5496 | 2315 | 5872 |
| Model code | 3479 | 5435 | 4156 | 5752 |
| Nameplate | 3709 | 5688 | 4793 | 6143 |

The pre-redesign solar, battery and mobility pages were short precisely because their body failed to render. The model-code and nameplate pages did have body copy, but no reading structure around it.

### 9.2 What changed

| | Before (HEAD) | After (Step 9D) |
| --- | --- | --- |
| Hero | White field, mono date, title, excerpt | Stone editorial hero, kicker + date, large headline, standfirst, filed-under aside |
| Cover | Plain full-width image, no caption | Full-width image with factual caption and per-photo crop |
| Body renderer | Shared admin-preview `RichTextRenderer` | Article-specific renderer with numbered H2s and a lead paragraph |
| Body failures | 3 of 5 showed "no readable content" | 5 of 5 render |
| Contents | None | Sticky rail on desktop, collapsible panel below 1100px |
| Reading progress | None | 2px red rule under the header |
| Article footer | Hard-coded model-code disclaimer and Verify link | "Next step" callout in the flow; disclaimer moved into the closing |
| Share | None | X, LinkedIn, WhatsApp and copy-link |
| Previous / next | None | Two-cell pager with subject and date |
| Related | None | Three real articles, same subject first |
| Closing | Reused "More notes from LONEX." band | "Bring the question to LONEX." with Contact action and verification note |
| Images | 1 cover | 1 cover + 3 related thumbnails |
| Reading measure | Unconstrained shared rich text | 760px at desktop, 704px at 768 |

Before captures were taken by temporarily restoring the previous page from git and building it; after captures come from the production build on port 3001. Before captures exist at 1440 and 390; after captures exist at all five widths, each with a matching hero crop. The full set is in `artifacts/lonex-step-9d-review/before/` and `artifacts/lonex-step-9d-review/final/`.

Extra states captured at 1440: the reading column, the rail tracking a section, the next-step callout, the share row, the pager, related reading, the closing, and a reduced-motion page. The open mobile contents panel was captured at 390.

---

## 10. Boundaries and caveats

- **Only `/blog/[slug]` changed.** The journal index, homepage, About, Contact, header, footer, category and product pages, verification, sellers, database schema and authentication were not modified. `article.css` is imported by the article page only.
- **No content was rewritten.** Titles, excerpts, body copy, dates, covers, slugs and IDs are unchanged. Captions and standfirsts are presentation copy written from the article and its stored cover.
- **No schema change.** The contents ids are derived at render time; nothing extra is stored. Empty stored blocks are skipped at read time but remain in the database untouched.
- **No new assets.** The page uses the existing CMS covers (`/media/113`, `/media/114`, `/media/115`, `/media/89`, `/media/88`). No stock photography was added.
- **The mobility cover is still wrong for its article.** It is kept as supplied and disclosed on the page. Swapping it is an editorial call.
- **No tables or inline images**, because the rich-text schema has no block for them. Lists, quotes and rules are styled for when they are used.
- **The page is server-rendered.** It awaits `connection()`, loads the post and listing per request and exports `instant = false`, matching the other public pages.
- **Unknown routes return HTTP 200** with the "Error 404" screen on this Next 16 build. This is site-wide streaming behaviour, present before 9D, and outside its scope.
- **Document titles carry a duplicated suffix.** Stored `seoTitle` values already end in "| LONEX" and the root layout template appends "| LONEX" again; canonical and Open Graph URLs also resolve against the configured `BETTER_AUTH_URL` rather than the request host. Both are pre-existing metadata/settings issues affecting every page, and were not changed here.
- **Nothing was staged, committed or pushed.**

---

## 11. Files

| File | Change |
| --- | --- |
| `src/app/(site)/blog/[slug]/page.tsx` | Rebuilt article page: hero, cover, reading grid, pager, related, closing, JSON-LD, metadata, `PageMotion`, `article.css` |
| `src/app/(site)/blog/[slug]/content.ts` | New copy module: standfirst, kicker, subject, cover notes, outline builder, empty-block sanitizer, interface labels |
| `src/app/(site)/blog/[slug]/article-body.tsx` | New renderer: numbered H2s and ids, lead paragraph, lists, quotes, rules, "Next step" callout, end mark |
| `src/app/(site)/blog/[slug]/article-navigation.tsx` | New client component: progress rule, sticky rail, active tracking, mobile contents, anchor focus |
| `src/app/(site)/blog/[slug]/article-actions.tsx` | New client component: X/LinkedIn/WhatsApp share and copy-link with fallback |
| `src/app/article.css` | New page stylesheet, `lxad-` prefix, breakpoints at 1100/900/620/420, reduced-motion overrides |
| `artifacts/lonex-step-9d-review/capture-before.mjs` | Previous-page capture harness |
| `artifacts/lonex-step-9d-review/capture-final.mjs` | Five-width full-page and hero capture harness |
| `artifacts/lonex-step-9d-review/capture-states.mjs` | Reading-state viewport captures |
| `artifacts/lonex-step-9d-review/qa.mjs` | Functional, responsive, accessibility and interaction QA harness |
| `artifacts/lonex-step-9d-review/qa-report.json` | Latest QA output against the production build |

---

## 12. Next step

Step 9D stops here. Awaiting visual approval before any further article work. Nothing is staged, committed or pushed.

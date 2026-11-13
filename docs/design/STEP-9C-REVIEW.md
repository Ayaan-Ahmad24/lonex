# Step 9C — Journal Index Redesign Review

**Date:** 13 November 2026
**Scope:** `/blog` only, plus its own stylesheet and content component.
**Status:** Implemented and verified in a real browser at 1440, 1024, 768, 390 and 360px. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-9c-review/`
Machine-readable QA: `artifacts/lonex-step-9c-review/qa-report.json`

---

## 1. Why this step existed

The previous `/blog` was a functional list and nothing more. It opened with "The LONEX journal." on plain white, a two-line introduction pushed to the right, then an "All articles." heading and five identical hairline rows: date, title, stored excerpt, "Read →". There was no photograph anywhere on the page, no featured story, no way to browse by subject, and no visual reason to choose one article over another. The page ended by reusing the black "More notes from LONEX." band and the footer.

At 1440 it was 2,267px tall and carried zero images. For a site whose product story depends on explaining conditions, numbers and trade-offs, an all-text index gave the writing no editorial weight.

The journal index was rebuilt as a publication front page:

- A stone editorial hero with a strong headline, two opening paragraphs and a real "Latest article" card with photography.
- One clearly curated featured story with its own introduction, caption and section index.
- A subject strip derived from the articles that actually exist, with live counts.
- A listing with three different image compositions rather than three repeated cards.
- A dark closing band that hands the reader to a conversation, not another link list.

Article IDs, slugs and routes are untouched. No article copy, title, date or excerpt in the database was edited.

---

## 2. Structure and sequencing

The page is five fields, alternating paper, stone and ink:

| # | Section | Field | Role |
| --- | --- | --- | --- |
| 1 | Hero | Stone | Headline, introduction, facts, latest article |
| 2 | Subject strip | Paper | Browse the journal by subject |
| 3 | Featured story | Paper | One long read, opened up |
| 4 | The index | Stone | The remaining articles, three compositions |
| 5 | Closing | Ink | Contact, verification and the range |

Two decisions fix the sequencing:

1. **The hero card is the newest article, not the feature.** It is labelled "Latest article" and carries the skyline cover. The featured story is a different article, so nothing is shown twice on the default view.
2. **The subject strip sits above the feature.** Filtering happens where the reader is already looking, and the result appears immediately beneath the strip. When a filter is active the feature is hidden, so the listing starts directly under the strip instead of leaving a full feature section above the answer.

The feature is still the second article in the hierarchy: latest (hero), featured, then the index, newest first.

---

## 3. Content decisions

All article titles, dates, excerpts and cover images come from `listPublishedBlogPosts()`. Everything added in `content.ts` is presentation copy written from the articles themselves.

### 3.1 Subjects derived from real content

There is no topic column in the database and none was added. Subjects are mapped from the article slug in `POST_TOPICS`:

| Subject | Articles |
| --- | --- |
| Solar | Understanding Solar Module Specifications; How to read a solar module nameplate |
| Storage | How Battery Storage Supports Everyday Energy Use |
| Mobility | Electric Mobility and the Changing Urban Journey |
| Verification | Why the model code matters more than the box |

Counts are computed from the rendered set, not hard-coded. An unknown slug falls back to "Journal" instead of disappearing. The strip only renders when more than one subject is present.

### 3.2 Stronger kickers and standfirsts

`POST_NOTES` gives each article a short kicker (`Mobility / City riding`) and a fuller standfirst written for the index. The stored titles and excerpts remain the source of truth on the article page; the index sharpens how they are introduced without changing what the article says.

Examples:

- Mobility: "Most city journeys are short, repeated and familiar: a commute, a school run, a trip to the market. That pattern — not the open road — is where an electric bike proves its worth."
- Model code: "A photograph shows a shape, and a serial number identifies one unit. Only a registered model code says what was specified, tested and shipped — and it is the part a buyer can check."

### 3.3 The featured story

The feature is curated by slug (`how-battery-storage-supports-everyday-energy-use`) with a fallback to the second newest article. `FEATURE_COPY` supplies:

- Two introduction paragraphs about what a battery actually does and which numbers matter.
- The five section headings, copied from the article's own structure, so the contents row is an honest preview.
- A caption: "Storage is a question of timing, not generation."

The curated layout only applies when the whole journal fits on one page (`pageCount === 1`). With pagination, every post on the page is listed and the existing pager is used, so nothing is ever skipped.

### 3.4 What the copy does not claim

No author names, publication times, read durations, statistics, certifications, test results, partnerships or performance promises were invented. The only dates are the stored `publishedAt` values formatted by the existing helper. No article is described as approved, reviewed or verified by a third party.

---

## 4. The page, section by section

### 4.1 Hero — "Energy, read closely."

- Warm stone field, 1.06 / 0.94 split, minimum height `clamp(620px, 100svh − header, 780px)`.
- Breadcrumb `Home / Journal`, then a red mono eyebrow: `The LONEX journal`.
- The headline is set in two lines: "Energy," in ink, "read closely." in red. It is the only `h1` on the page.
- Two introduction paragraphs explain the editorial position: the conditions behind a number, capacity versus delivered power, and the route a model takes before it reaches a roof. The second closes on "anyone making a decision that will outlast the brochure."
- A hairline facts rule: `Subjects 04`, `Articles 05`, `Latest 9 November 2026` — all derived from the current data.
- On the right, the latest article sits in a bordered paper card: a 16:11 skyline photograph, a red `Latest article` label, subject, date, title and `Read article →`. The card is a `figure` with a real `figcaption`.

At 900px and below the section stacks: copy, facts, then a full-width card with a 16:9 image. At 620px the facts become a two-column grid with `Latest` spanning both columns, so the date never wraps mid-value.

### 4.2 Subject strip — "Browse by subject"

- A paper strip under the hero: mono label on the left, five buttons on the right.
- `All 05`, `Solar 02`, `Storage 01`, `Mobility 01`, `Verification 01`. Counts are mono, small and aligned to the label.
- The pressed state is a solid ink button with white type; the rest are hairline outlines. State is exposed with `aria-pressed`, not colour alone.
- The strip is a native button group with a group label, reachable and operable by keyboard.

### 4.3 Featured story

- Paper field, 7 / 5 split, image left and story right.
- The photograph is 3:2 with a red `01` plate in the top-left corner and a caption rule underneath: the caption on the left, `Storage` on the right.
- The body carries `Featured story`, a subject / date meta line, the article title, two introduction paragraphs and a red `Read the story →` button.
- The image, caption and body finish level at 1440 (measured: 0px difference). This is deliberate — an earlier draft put the section list inside the right column and left the body running roughly 290px past the photograph.
- Below both columns, a full-width `In this article` row lists the five sections as numbered cells (`01 What storage actually does` … `05 What to ask before buying`). It reads as an index to the piece, not as a sidebar.
- At 1100px the section stacks: 16:9 image, then the body at a 760px measure, then the contents row in three columns. At 620px the contents row becomes two columns and the caption stacks.

### 4.4 The index — "More from the journal."

- Stone field with a hairline head: `The index` eyebrow, the heading, a short introduction on the right, and a live status line — `All subjects — 5 articles.`
- Articles are listed newest first below the feature: 5 November, 3 November, 14 October. The ordering is chronological; the layout slots are assigned by position, so the eye still gets three different compositions.
- **Entry 02** — a tall 4:5 photograph in five columns: the mobility article, whose vertical leaf cover suits the crop.
- **Entry 03** — a wide 4:3 photograph in seven columns: the model-code article. Its portrait cover is cropped to a close working detail — hands, tool, cable and panels — which reads as editorial photography rather than a product shot.
- **Entry 04** — a full-width paper card: the nameplate article, with the body on the left and a fixed-height photograph on the right (about 461px at 1440).
- Every entry carries an index number (`02`–`04`), kicker (`Solar / Module data`), date, title, standfirst and `Read article →`. Titles are links; the image is also a link but is removed from the tab order and hidden from assistive technology, so each entry has exactly one accessible link target.

Hover is restrained: the image scales 1.04 over 950ms, the title grows a one-pixel underline from the left, and the arrow shifts 4px. Every hover effect is transform- or colour-only, so it never changes layout.

### 4.5 Closing — "Keep the thread."

- A dark band before the footer: `Keep the thread`, the heading "Read the detail. Then ask the question.", and a paragraph that names the limits of an article — it cannot see your roof, your evening load or the route you ride.
- Actions: `Contact LONEX` (white button) and `Verify a model ↗` (underlined link).
- The right column is a range index, labelled `The range`: Solar / Modules for rooftops, Batteries / Storage for the evening, Electric bikes / Short urban journeys. Each row is a rule-separated link with a small ↗.
- At 900px the band stacks; at 620px each range row becomes a two-line block with the meta beneath the label.

---

## 5. Filtering behaviour

`JournalIndex` is a small client component. The default view — hero, feature, all listing entries — is server-rendered, so the page is complete without JavaScript and the crawler sees every article.

- Selecting a subject filters the full set (latest, feature and listing posts) and sorts the matches newest first.
- One match renders as a full-width horizontal entry (image 7 / body 5, 3:2 image).
- Two matches render as a pair of equal columns with 16:10 images.
- Three or more cycle tall, wide and full-width band.
- The feature is hidden while a filter is active, so results sit directly under the strip.
- `All` restores the curated view, including the feature, without a page reload.
- The status line is an `aria-live="polite"` region: `Solar — 2 articles.` It announces the result to screen readers and gives sighted readers the same count.
- Filtered entries animate in with a 640ms CSS keyframe and a 60ms stagger keyed to `--lxjn-order`. Under `prefers-reduced-motion` the animation is removed; the entries are simply present.
- The strip is only interactive when the curated view is active. With pagination the topic buttons are not rendered, because filtering one page would misrepresent the journal.

Verified states:

| Action | Result |
| --- | --- |
| Solar | 2 entries — the specifications article and the nameplate article; feature hidden |
| Storage | 1 entry — the battery article, full-width horizontal |
| Mobility | 1 entry — the mobility article |
| Verification | 1 entry — the model-code article |
| Back to All | 3 listing entries and the feature restored; `All subjects — 5 articles.` |
| Keyboard | Focus a subject, press Enter, filter applies; focus ring visible |
| `?page=2`, `?page=abc`, `?page=-3` | All return 200 and the clamped first page; no empty state |

---

## 6. Responsive behaviour

| Width | Page height | Behaviour |
| --- | --- | --- |
| 1440 | 4643 | Hero 781px, 1.06/0.94 split; feature 805px with level image and body; listing 1854px in 12 columns; closing 581px |
| 1024 | 4575 | Hero keeps the split, card 419px; feature stacks (16:9 image, 760px body, 3-column contents); listing keeps the tall + wide row and the full-width band |
| 768 | 6320 | Hero stacks with a full-width card; strip on one row; feature and every entry single column; band stacks with the body above the image |
| 390 | 6014 | Facts become a two-column grid; strip wraps to two rows (141px); solo/pair/band all single column; closing stacks |
| 360 | 6127 | Same as 390 with 20px gutters; no horizontal overflow |

- Paragraph measures are capped: 48ch in the hero, 46ch in listing copy, 47ch in the closing.
- Buttons are 52px high; topic chips are 30px high on desktop and 36px on mobile, with 6–7px gaps, so the strip stays usable by thumb.
- The taller mobile page is content, not whitespace: five photographs, a full feature with its contents row, and three listing entries that each stack their image and copy. Section spacing stays on the same `clamp()` scale as About and Contact.

---

## 7. Motion

- The page uses the existing `PageMotion` contract: `data-hero`, `data-hero-line`, `data-hero-item`, `data-hero-media`, `data-reveal`, `data-reveal-group` and `data-reveal-image`. No new animation dependency was added and no shared motion file was modified.
- The hero settles in three moves: the cover photograph scales from 1.06, the two headline lines rise and unclip, then the eyebrow, intro and facts follow.
- Sections reveal in short groups; the feature photograph settles before its caption.
- Hover motion is CSS-only and reversible: image scale, underline sweep, arrow shift, colour change.
- Under `prefers-reduced-motion` every reveal renders at opacity 1 with no transform. A reduced-motion capture matches the standard full-page capture, and the filtered-entry keyframe is disabled.

---

## 8. QA results

### 8.1 Commands

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npm run typecheck` | Pass |
| ESLint | `npx eslint "src/app/(site)/blog"` | Pass, 0 errors |
| Tests | `npm run test` | 25 files, 192 tests passed |
| Production build | `npm run build` | Pass; `/blog` present as a dynamic route |
| Production serve | `npm run start -- -p 3001` | `/blog` returned 200 |

No CSS linter is configured in the project; `journal.css` was verified through browser checks and visual review.

### 8.2 Browser checks (production build)

| Viewport | Height | Horizontal overflow | Console errors | Page errors | Broken content images |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 4643 | 0 | 0 | 0 | 0 |
| 1024×768 | 4575 | 0 | 0 | 0 | 0 |
| 768×1024 | 6320 | 0 | 0 | 0 | 0 |
| 390×844 | 6014 | 0 | 0 | 0 | 0 |
| 360×780 | 6127 | 0 | 0 | 0 | 0 |

Additional checks:

- **Headings:** exactly one `h1`, "Energy, read closely.", followed by the latest-card `h2`, the feature `h2` and the index `h2`; entries use `h3`.
- **Images:** five page images per view at every width — hero cover, feature photograph and three entry covers. All are complete with non-zero natural dimensions; zero 4xx image responses and zero failed image requests. The five covers are the only media on the page.
- **Links:** all five article URLs return 200 with the expected `h1` at 1440 and 390. Listing, hero and feature links point to the existing `/blog/[slug]` routes.
- **Filters:** the four subjects produce the counts above; the feature is hidden in every filtered state; `All` restores the full view. The live region text matches the rendered entries.
- **Keyboard:** the strip is a native button group; Enter activates; the red 2px `:focus-visible` ring is visible on buttons and links.
- **Reduced motion:** 40 sampled reveal and entry elements all computed to `opacity: 1` and `transform: none`.
- **Assistive structure:** the breadcrumb is a labelled `nav`; the strip has a group label; the status line is a polite live region; the cover card is a `figure` with `figcaption`; the decorative plate and arrows are `aria-hidden`.
- **Robots/meta:** page title and description come from `createPageMetadata` with `path: "/blog"`; canonical and Open Graph URLs resolve to `/blog`.

### 8.3 Issues found during review and fixed

1. **The feature body ran past the photograph.** The "In this article" list lived in the right column and left roughly 290px of imbalance at 1440. It moved to a full-width five-cell row beneath the grid; image and body now end level (measured 0px), with the contents row 56px below.
2. **The contents row broke the grid at 1024.** After the first move it was still inside the two-column wrapper, so it became a third grid child. The markup now separates the two-column figure/body grid from the full-width contents row.
3. **Five contents cells were unreadable at 1024.** The row drops to three columns at 1100px and two at 620px.
4. **Hero facts wrapped awkwardly on small screens.** At 620px and below they are a two-column grid with `Latest` spanning the full row.
5. **The closing range label repeated "Browse by subject".** It now reads `The range`, which describes the links rather than the journal filter.
6. **Listing dates were out of order.** The original layout-first order put 14 October between 5 and 3 November. The listing is now newest first, and the photographs were recropped into the new slots; the band now closes with the full roof-installation photograph, which is the stronger end to the section.
7. **Three lazy header images were reported as broken by the first QA pass.** They are the site's offscreen menu images with empty `alt`, not journal content. The harness now separates all images from page images, counts only `complete && naturalWidth === 0` as broken, and records failed and 4xx image responses.
8. **`SEARCH_SIZES` was a misleading name** for the Next image `sizes` map; it is now `IMAGE_SIZES`.
9. **Mobile subject chips were 27px high with 9px labels.** They are now 36px high with 10px labels and 9px counts, and still wrap to two rows at 390.

---

## 9. Before and after

| | Before (HEAD) | After (Step 9C) |
| --- | --- | --- |
| H1 | The LONEX journal. | Energy, read closely. |
| Hero | White field, heading and right-hand intro | Stone editorial hero, two-paragraph introduction, facts rule |
| Latest article | None | Bordered cover card with skyline photograph |
| Featured story | None | Battery-storage feature with introduction, caption and section index |
| Subject navigation | None | Five-button strip with live counts derived from content |
| Listing | Five identical ruled rows | Three compositions: tall, wide and full-width band |
| Article imagery | None | Five existing cover images, art-directed crops |
| Read link | Read → | Read article → |
| Closing | Reused "More notes from LONEX." band | "Read the detail. Then ask the question." with range index |
| Page images | 0 | 5 |
| Page height at 1440 | 2267px | 4643px |

Before captures were taken from the previous page on the development server; after captures were taken from the production build on port 3001. Both sets exist at all five widths, plus hero crops and a reduced-motion capture. Topic states were captured at 1440, and the storage filter at 390.

The full set is in `artifacts/lonex-step-9c-review/before/` and `artifacts/lonex-step-9c-review/final/`.

---

## 10. Boundaries and caveats

- **Only `/blog` changed.** The homepage, About, Contact, header, footer, category pages, product pages, verification pages, seller pages, database schema, authentication and backend were not modified. `journal.css` is imported by the blog index only.
- **Article pages were not touched.** `/blog/[slug]` keeps its layout, metadata and content. Titles, excerpts, slugs, IDs and publication dates are unchanged in the database.
- **No schema change.** Subjects are a presentation map keyed by slug. An unmapped article still appears, under "Journal".
- **No new assets.** The five images are the existing CMS covers (`/media/113`, `/media/114`, `/media/115`, `/media/89`, `/media/88`). No stock photography was added.
- **No invented facts.** The feature introduction and section list are written from the stored article; dates come from `publishedAt`; no author, statistic, certification or capability claim was added. The only count on the page is the real number of published articles and subjects.
- **The curated layout depends on a single page of results.** With pagination the page falls back to a plain listing and the existing pager; the hero still shows the newest article but no feature is duplicated.
- **Filtering is a client-side enhancement.** The default page is fully server-rendered. If JavaScript is unavailable, the buttons are inert but every article, title and link remains visible and crawlable.
- **The page is server-rendered.** It awaits `connection()`, loads published posts per request and exports `instant = false`, matching the other public pages.
- **Nothing was staged, committed or pushed.**

---

## 11. Files

| File | Change |
| --- | --- |
| `src/app/(site)/blog/page.tsx` | Rebuilt index page: hero, latest cover, feature selection, listing order, closing, metadata, `PageMotion`, `journal.css` |
| `src/app/(site)/blog/journal-index.tsx` | New client component: subject strip, feature, varied listing, solo/pair/band layouts, live status, pager |
| `src/app/(site)/blog/content.ts` | New copy module: hero, index, feature copy, subject map, listing order, post notes, closing, empty state |
| `src/app/journal.css` | New page stylesheet, `lxjn-` prefix, responsive rules at 1100/900/620/420 and reduced-motion overrides |
| `artifacts/lonex-step-9c-review/capture.mjs` | Screenshot harness (`before`, `final`, `states`) |
| `artifacts/lonex-step-9c-review/qa.mjs` | Functional, responsive and accessibility QA harness |
| `artifacts/lonex-step-9c-review/qa-report.json` | Latest QA output, produced against the production build |

---

## 12. Next step

Step 9C stops here. Awaiting visual approval before Step 9D.

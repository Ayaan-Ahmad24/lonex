# Step 8 — Verification and Authorized Sellers Review

**Date:** 12 November 2026
**Scope:** `/verify` and `/authorized-sellers`.
**Status:** Implemented and verified in a real browser. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-8-review/`
Machine-readable QA: `artifacts/lonex-step-8-review/qa-report.json`

---

## 1. Why this step existed

Both pages were structurally correct and visually unfinished. `/verify` opened with "Check a LONEX model code." above an unstyled input and a bordered button, then put the explanation in a side column. `/authorized-sellers` was a heading, a paragraph and an empty gap. Neither page carried the photographic or typographic weight of the category and product pages completed in Step 7, and the form — the only reason to visit `/verify` — was the least considered element on it.

Three problems were fixed together:

1. **The verification form was not the centre of the page.** It sat in a plain white field below a large heading. It is now a dark registry instrument inside the hero, with the page built around it.
2. **No state design.** Success, invalid code, unknown code, throttling and a dropped connection all landed in the same generic block. Each now has a distinct, readable state, with guidance and a next action.
3. **The empty seller directory looked broken.** With zero published sellers the page showed a short sentence and a lot of air. It now has an intentional empty state with real contact routes, and a directory row layout ready for real records.

The registry boundary was protected throughout: a match confirms **model registration**, not the authenticity, condition or history of a physical unit.

---

## 2. What the data actually contains

Audited before design work, and unchanged by this step:

| Item | Reality |
| --- | --- |
| Categories | 3 — Solar Panels, Batteries, Electric Bikes |
| Published products | 6 |
| Primary product images | 6 of 6 |
| Active verification codes | 1 (row 12 → Solar Module, registered 10 November 2026) |
| Authorized sellers | 0 |

Consequences:

- **One success example exists.** The panel shows the real record: Solar Module, Solar Panels, 10 November 2026, its primary image, and a link to `/solar/solar-module`.
- **The seller directory ships empty.** No seller names, addresses, phone numbers, certifications or partnerships were invented to fill it. The empty state is the production state and was designed as such.
- **The row layout was still built and verified.** Two temporary, clearly labelled `QA TEST` records were inserted to capture the populated directory and city filter, then deleted (see §12).

---

## 3. Design direction

The two pages share the Step 7 system and add nothing to it:

| Token | Value | Use |
| --- | --- | --- |
| Display | Poppins | Headlines, model name, section titles |
| Technical | IBM Plex Mono | Eyebrows, labels, code, meta, buttons |
| Red | `#cf0a0a` | Accent rules, primary CTA, match icon |
| Ink | `#000` / `#1b1b1b` | Dark fields, headings |
| Paper | `#f5eded` warm stone | Alternating light sections |
| Rule | `rgba(0,0,0,.14)` / white `.16` on dark | Hairlines, table rules |

- `/verify` is a **dark technical document**: black fields, hairline grid, one red accent, and a code panel that reads like an instrument rather than a marketing card.
- `/authorized-sellers` is **photographic and editorial**: a full-bleed skyline hero, warm stone sections, and a directory that behaves like a published register.
- No rounded cards, drop shadows, icon grids or invented badges. Depth comes from photography, rules and contrast.
- Both pages use `PageMotion` with the existing `data-hero`, `data-hero-line`, `data-reveal` and `data-reveal-group` contract.

Styles live in a new `src/app/directory.css`, imported after `home.css`. Every selector is prefixed `lxv-` (verify) or `lxs-` (sellers) so the file cannot collide with the homepage or catalogue styles.

---

## 4. `/verify`

### 4.1 Hero

- Full dark field with a faint radial glow, a square rule grid and a thin red horizon line — technical depth without decoration.
- Eyebrow `Model verification`; `<h1>` is exactly **"Every Model Has an Identity."**, split across two animated lines with "Identity." in red italic.
- Introduction: registered LONEX models carry an identity in the model registry; enter the code to confirm the code is registered and see the record held.
- Primary CTA `Verify a model` anchors to the panel; secondary `How it works` anchors to the three-step section.
- Three facts on a rule: `Model registration`, `Model-level only`, `Rate limited`.
- The verification panel occupies the right column at ≥1024 and follows the hero copy on mobile. At 1440 it is roughly 620 px wide and visually dominant; at 390 it is full width with 20 px gutters.

### 4.2 The panel and its states

`src/app/(site)/verify/verify-form.tsx` is a client component driven by `useActionState`. The server action and all of its outcomes are unchanged.

| State | Trigger | What the user sees |
| --- | --- | --- |
| Idle | Page load | Panel header `Model registry` / `Public check`, title "Check a model code.", the code field with lock sigil and `LNX-XXXX-XXXX-XXXX` hint, red `Verify model` button, and the registration caveat |
| Loading | Submit | Button becomes `Checking registry` with a spinner, the top progress rule animates, the field and button disable, `aria-busy="true"` |
| Success | Active registered code | `Registry match` with a red check, "Code match found. This model is registered with LONEX.", the model thumbnail (or `LX` fallback), a linked model name, category, registration date, the caveat, `View product` and `Check another code` |
| Invalid / no match | Malformed, unknown, inactive or unpublished code | `No match returned.` with the single generic message, three transcription checks, `Try another code` and `Contact LONEX`; `role="alert"` |
| Throttled | More than 10 attempts per client, or 300 globally, in 10 minutes | `Too many attempts.` with a wait-and-retry message and `Contact LONEX`; `role="status"` |
| Unavailable | Dropped request or unreachable registry | `Registry unavailable.` with connection guidance, `Retry the check` and `Contact LONEX`; `role="status"` |

Implementation notes:

- **Invalid and unknown codes share one message** on purpose. The server has always returned `This code could not be verified. Check the code and try again.` for every non-match, so the page cannot be used to enumerate registered models. The client adds transcription help, not a different verdict.
- **Unavailable is a client-only fallback.** `verifyWithFallback` catches a thrown action call and returns the unavailable state. Server-returned outcomes are untouched. Because React resets the uncontrolled field after an action, the last submitted code is held in a ref so `Retry the check` can resubmit it.
- **Dismissal is local.** `Check another code` / `Try another code` set a `dismissed` flag and clear the field, so the panel returns to the input state without pretending the action never ran.
- **Focus management.** The live region receives focus when a result arrives, and the input is refocused on reset, with `preventScroll`.
- **Image.** The lookup now left-joins the primary `product_images` row and its `media_assets` record. A match without an image still renders, using the `LX` fallback. The image is a 112 px thumbnail, so the current demo asset is used at a sane size.
- **Product link.** The model name and `View product` both point at the published product page returned by the lookup.

### 4.3 Sections below the fold

| Section | Content |
| --- | --- |
| Why it matters | "A code is only useful if it is read." Three numbered points: confirm the model is registered, separate identity from condition, ask better questions before buying |
| How to verify | Three steps: locate the code, enter it once, read the response. Sits on a light stone field with ruled columns |
| What a match actually tells you | Dark anatomy panel with a ruled table — Model, Category, Registered, Product — and the explicit caveat that registration does not authenticate a physical unit |
| If a code cannot be found | Three checks (characters, dashes/spaces, damaged label) plus a help card with `Contact LONEX`, WhatsApp and the real phone number |
| Questions | Four `<details>` items: where the code is, why responses are uniform, whether a match guarantees authenticity, and what happens to models no longer listed |
| Close | Dark band: "Start with the model. Then check the unit." with `Authorized sellers` and `Contact LONEX` |

### 4.4 The registry boundary

Every sentence was checked against what the code can actually prove:

- "Registered LONEX models carry an identity in the model registry" — not "every LONEX model".
- "A match confirms model registration, not the authenticity of a physical unit." appears in the panel, the hero facts, the anatomy section, the FAQ and the closing copy.
- A match returns a name, category and registration date only. No condition, warranty, seller or provenance claim is made anywhere.
- The FAQ states that inactive registrations and unpublished models return the same response as an unknown code.

---

## 5. `/authorized-sellers`

### 5.1 Hero

- Full-bleed `editorial/city-solar.webp`: a hazy city skyline at golden hour beyond a rooftop solar array, chosen for its depth, its negative space on the left and its workable crop at 390.
- Dark scrim from the left, square rule grid and a thin vertical stamp on the right.
- Eyebrow `Authorized network`; `<h1>` is exactly **"Find Your LONEX Connection."**, with "Connection." in red italic.
- Intro states that LONEX appoints sellers to represent its range, the directory lists confirmed businesses with published contact details, and an unlisted city should prompt a direct conversation.
- Primary `Contact LONEX`; secondary `Explore the range` anchors to `#range`.
- Facts: `Directory / Confirmed listings`, `Contact / Direct to the seller`, `Listings / Published by LONEX`.

### 5.2 Populated directory

Verified with temporary fixtures at 1440, 1024, 768 and 390, and with `?city=Lahore`:

- A ruled header row (`Business`, `Address`, `Contact`, `Actions`) aligns with each entry.
- Each `<article>` shows only confirmed fields: an `Authorized` status dot, business name, city, complete address, formatted phone, and `Call`, plus `WhatsApp` and `Map` only when the record supplies them.
- No shopfront photograph, rating, certification badge or partner logo is shown, because LONEX has not supplied them.
- City filter appears only when at least one city exists; the active city is marked with `aria-current="page"`.
- At 768 and below the row becomes a stacked record with the same field labels; at 390 the actions wrap without overflow.

### 5.3 Empty directory (the production state)

The empty state is a two-panel composition, not a blank notice:

- **Left:** `Directory status` kicker, the heading **"No confirmed sellers are listed at present."** (or "No authorized sellers are listed in {city} at present." when filtered), a paragraph explaining that a business appears only after appointment and confirmation, the six fields a listing will include, and a `View all cities` reset when a city filter is active.
- **Right:** a dark aside with `Direct assistance`, the heading **"Looking for the right place to begin?"**, a paragraph inviting a direct conversation, `Contact LONEX` and `WhatsApp` buttons, and the real phone and office address.
- The WhatsApp button uses the outline-on-dark variant so it stays legible against the black panel.
- This is deliberate: an empty register is more honest than a padded one, and the page still gives the visitor a route forward.

### 5.4 Why, before-purchase, range and close

| Section | Content |
| --- | --- |
| Why an authorized seller | "Why buy through an authorized seller." Three points: confirmed by LONEX, a clear route to the range, a documented starting point. The note states a listing is not a warranty, authenticity certificate or promise of after-sales service |
| Before you purchase | Four checks: confirm the seller is listed, check the model code, ask for details in writing, inspect what you are buying. Footer note plus `Verify a model code` |
| Explore the range | Three category cards using the Step 1 covers — Solar Panels, Batteries, Electric Bikes — each with a one-line scope and `Explore` link |
| Close | "Start with a conversation." with `Contact LONEX`, WhatsApp, phone, international WhatsApp number and office address |

Language limits applied:

- "LONEX appoints sellers…" and "Every business listed here has been appointed by LONEX" describe the listing rule, not a claim that a national network exists.
- Removed "network" phrasing that implied coverage, and removed "availability" from the empty-state aside because the page cannot promise stock.
- The range introduction says the published range is organised into three categories; it no longer claims the seller network covers them.
- "Listings / Published by LONEX" replaced an earlier "Enquiries / Supported by LONEX", which promised a service the page does not provide.

---

## 6. Behaviour preserved

- `normalizeModelCode` is untouched: uppercase, strip non-alphanumerics, accept an optional `LNX` prefix, require the 12-character body, and return `LNX-XXXX-XXXX-XXXX`. The body alphabet still excludes `I`, `L`, `O` and `U`.
- Validation, digesting, the active/published joins and the single-result limit are unchanged.
- Rate limiting is unchanged: 10 attempts per client and 300 globally per 10 minutes, keyed `verify:client:*` and `verify:global` in `rate_limit`.
- The action still records an attempt before validating, returns the same generic failure for malformed, unknown, inactive and unpublished codes, and formats the date with `en-GB` (`10 November 2026`).
- The only server behaviour change is additive: the lookup now returns an optional primary image. The match criteria and the `limit(1)` are unchanged, with `orderBy(asc(productImages.sortOrder))` making image selection deterministic.
- `actions.ts` gained one line of passthrough (`image: model.image`); no status, message or throttle logic was edited.
- No schema, auth, homepage or approved category/product page was changed.

---

## 7. Motion and accessibility

- `PageMotion` (GSAP + ScrollTrigger) is reused as-is. New reveals are attached to section heads, point lists and cards; nothing new was invented.
- Under `prefers-reduced-motion: reduce`, no triggers are created. Verified at 1440 on both routes: zero hidden `[data-hero-item]`, `[data-hero-line]`, `[data-reveal]` or `[data-reveal-image]` elements, `h1` opacity `1`.
- The form has a visible label, a format hint, `aria-describedby`, `aria-invalid` on failure, `aria-busy` while pending, and a polite live region. The error state uses `role="alert"`.
- Success and failure states are announced without moving focus unexpectedly; focus lands on the live region only when a result arrives.
- All controls are real buttons or links. Touch targets are ≥ 38 px; the code field is 62 px tall.
- Colour is never the only signal: states pair colour with an icon, a title and text.
- The verification form needs JavaScript (server action). The surrounding page is fully readable without it.

---

## 8. QA results

Harness: `scripts/capture-step-8.mjs`, run against the production build on `http://localhost:3001` (not the dev server), with a fresh context per viewport and a scroll-settle before each full-page capture.

**Coverage:** 2 routes × 5 viewports = **10 page checks**, **9 unique internal links**, **2 reduced-motion checks**.

Viewports: 1440×900, 1024×768, 768×1024, 390×844, 360×780.

| Check | Result |
| --- | --- |
| HTTP status | 10/10 → 200 |
| Exact `<h1>` | 10/10 match the required headlines |
| Horizontal overflow | 0 px at every width |
| Broken images | 0 |
| Console errors | 0 |
| Uncaught page errors | 0 |
| Failed requests | 0 |
| Header and footer present | 10/10 |
| Verification form present on `/verify` | 5/5 |
| Directory or empty state present on `/authorized-sellers` | 5/5 |
| Internal links | 9/9 → 200 (`/`, `/about`, `/authorized-sellers`, `/batteries`, `/blog`, `/contact`, `/ev-bikes`, `/solar`, `/verify`) |
| Reduced motion | 2/2 — no hidden reveal targets, `h1` opacity `1` |

Page heights recorded: `/verify` 4589 / 4093 / 5870 / 6605 / 6990 px and `/authorized-sellers` 5012 / 4342 / 5597 / 7226 / 7317 px at 1440 / 1024 / 768 / 390 / 360.

Other verification:

| Command | Result |
| --- | --- |
| `npx tsc --noEmit` | Pass, no output |
| `npx eslint` on all modified Step 8 files | Pass, no output |
| `npm run test` | 192/192 passing across 25 files |
| `npm run build` | Pass |
| Success state at 1440, 390, 360 | Correct record, image, date, link |
| Error at 1440 and 390; unavailable and throttled at 1440 | Correct title, message and actions |
| Populated directory + city filter | Verified with temporary fixtures, then removed |
| Reduced motion | No opacity-0 content |

Repository-wide `npm run lint` still reports the pre-existing `.agents/skills` and seed-script issues noted in Step 7; none are in files changed here.

### Screenshot index

```
artifacts/lonex-step-8-review/
  before/          pre-redesign baseline, 5 viewports × 2 routes (10 files)
  final/           5 viewports × 2 routes: 10 full pages, 10 heroes,
                   5 directory captures, 2 reduced-motion (27 images)
  final/qa-report.json
  states/          loading, success (1440/390/360), error (1440/390),
                   unavailable, throttled (11 files)
  qa-fixtures/     populated directory at 1440/1024/768/390 + city filter (5 files)
  qa-report.json   aggregated report
  wip/             iteration shots (46 files)
```

Files worth opening first: `final/verify-hero-1440.png`, `final/verify-1440.png`, `final/sellers-hero-1440.png`, `final/sellers-1440.png`, `states/state-success-1440.png`, `states/state-error-390.png`, `final/sellers-390.png`, and `wip/verify-hero-final-1440.png`.

---

## 9. Known issues and recommendations

1. **The seller directory is empty.** Zero sellers are published. The empty state is intentional and the populated layout has been verified with fixtures, but the page will only become a real directory when LONEX appoints and confirms sellers. Add records through the existing admin; no code change is needed.
2. **Only one verification code exists.** The single active row maps to Solar Module. That is enough to prove the success path, but there is no second model to demonstrate category variety. Add codes through `/admin/verification` when more models are registered.
3. **Success screenshots required a temporary digest.** The raw code is never stored, only its keyed digest. To capture the success state, row 12's digest was swapped for a QA digest derived from a QA code, then restored to the original. See §12.
4. **The result image is demo photography** at thumbnail size. Real manufacturer imagery will improve it without layout changes.
5. **The form depends on JavaScript.** The server action is invoked through `useActionState`. The page content is readable without JS, but the check itself needs it. This matches the existing architecture and was not changed.
6. **`instant = false`** remains exported from both pages, preserving the existing rendering behaviour.
7. **Dev-only overlay.** Early `wip` screenshots include the Next.js development indicator. All `final` and `states` captures come from the production build with the overlay absent; the state harness also hides the sticky header so tall panel captures are clean.

---

## 10. Files changed

**New**

- `src/app/directory.css` — all `lxv-` and `lxs-` styles
- `src/app/(site)/verify/content.ts` — verify page copy
- `src/app/(site)/authorized-sellers/content.ts` — seller copy and range links
- `scripts/capture-step-8.mjs` — final capture and QA harness
- `scripts/qa-verify-states.mjs` — verification state captures
- `scripts/qa-digest-swap.mjs` — temporary QA digest install/restore
- `scripts/qa-clean-throttle.mjs` — clears verification throttle rows
- `scripts/qa-sellers-fixture.mjs` — inserts/removes temporary seller rows
- `docs/design/STEP-8-REVIEW.md` — this document

**Modified**

- `src/app/(site)/verify/page.tsx` — rebuilt page
- `src/app/(site)/verify/verify-form.tsx` — panel, states, retry/reset/focus
- `src/app/(site)/verify/actions.ts` — image passthrough only
- `src/app/(site)/verify/state.ts` — image type and `unavailable` status
- `src/lib/verification/lookup.ts` — primary-image left joins
- `src/app/(site)/authorized-sellers/page.tsx` — rebuilt page
- `src/components/public/seller-card.tsx` — directory row

No database schema, auth, verification rules, homepage or category/product page was changed in this step.

---

## 11. Reproduce

```bash
npm run build
npx next start -p 3001
node scripts/capture-step-8.mjs --base http://localhost:3001
npx tsc --noEmit
npm run test
```

Verification state captures (temporary, restores the registry afterwards):

```bash
node scripts/qa-digest-swap.mjs          # install QA digest on row 12
node scripts/qa-clean-throttle.mjs
BASE_URL=http://localhost:3001 node scripts/qa-verify-states.mjs
node scripts/qa-digest-swap.mjs restore  # original digest back
node scripts/qa-clean-throttle.mjs
```

Populated directory captures (temporary rows):

```bash
node scripts/qa-sellers-fixture.mjs        # insert 2 QA TEST rows
# capture #directory at 1440/1024/768/390 and ?city=Lahore
node scripts/qa-sellers-fixture.mjs remove # delete QA TEST rows
```

State after the final run:

- Verification code row 12 digest restored to `8c727f58…ac8819`.
- All `verify:*` throttle rows cleared.
- `authorized_sellers` back to 0 rows.
- Nothing staged, committed or pushed.

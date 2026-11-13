# Step 9B — Contact Page Redesign Review

**Date:** 13 November 2026
**Scope:** `/contact` only.
**Status:** Implemented and verified in a real browser at 1440, 1024, 768, 390 and 360px. Nothing staged, committed or pushed.

Screenshot package: `artifacts/lonex-step-9b-review/`
Archive: `artifacts/lonex-step-9b-review.zip`
Machine-readable QA: `artifacts/lonex-step-9b-review/qa-report.json`

---

## 1. Why this step existed

The previous Contact page was a placeholder. It opened with "Talk to LONEX.", then listed phone, WhatsApp and address in a plain three-row table, and filled the rest of the page with a sidebar about seller information and model verification. There was no enquiry form at all. A visitor who wanted to describe a roof, a battery requirement or a daily route had to open WhatsApp and write it from scratch, and the page offered no place to say what the enquiry was about.

It also carried no composition: three headings, a table, a black band and the footer, with roughly 400px of empty white space under the contact table at 1440.

The page was rebuilt as a working contact surface:

- One enquiry path, from the hero to the form to WhatsApp, with the phone as a parallel route.
- Contact details are read from the existing public settings and rendered as a ruled register with a real action per row.
- The form validates in the browser, composes a structured message and hands it to the verified WhatsApp number.
- The page states plainly that the website does not send or store the enquiry.
- No response times, opening hours, email address or completed-project claims were invented.

---

## 2. The honest submission model

This is the most important decision in the step, so it is documented before the design.

The project has **no contact table, no contact API route and no mail transport**. There is no endpoint that could accept an enquiry, and adding one would have crossed the database and backend boundary set for this step. A form that says "Message sent" while doing nothing would be a lie, and a form that silently fails would be worse.

The form therefore does exactly what it says:

1. It validates every field in the browser.
2. It composes a plain-text enquiry: category, name, phone, email, subject and message.
3. It opens WhatsApp with that text pre-filled, inside the submit gesture so a popup blocker can judge it correctly.
4. The success panel appears **only when the browser accepted the new tab**. It says the enquiry is ready in WhatsApp and that nothing has been sent from the page.
5. If the tab is blocked, the page shows a real error (`role="alert"`) with the prepared message, a copy action, a direct WhatsApp link and the office phone number. It never reports success for a handoff that did not happen.
6. If clipboard access is also refused, the prepared message is revealed in a read-only textarea, selected, with a hint to copy it manually.

The enquiry section says the same thing in the interface: "This form does not send or store anything on the website. It prepares a message for you to review in WhatsApp." The three numbered steps beside the form are Write → Review → Send, and the third reads "Nothing leaves this page until you press send there."

Direct WhatsApp links in the hero, the register and the closing band use a short generic opener. Only a submitted form composes the full structured message.

---

## 3. Design direction

The page uses the Step 9A visual language without adding a second system.

| Token | Value | Use |
| --- | --- | --- |
| Display | Poppins | Headlines, body copy, form values |
| Technical | IBM Plex Mono | Eyebrows, indices, captions, buttons, field labels, facts |
| Red | `#cf0a0a` | Primary CTA, emphasis, indices, rules, error text |
| Ink | `#000` | Type, register rules, dark buttons |
| Paper | `#ffffff` | Direct-contact field, form sheet, location field |
| Stone | `#f5eded` | Hero field, enquiry field, status panels |
| Rule | `rgba(0,0,0,.14)` / `.16` | Hairlines and register dividers |

- Headlines stay tight and editorial: `-0.045em` to `-0.052em` tracking, `0.92–1` line height, with the final word in red in the hero.
- Five sections, five compositions: split editorial hero, ruled register, stone enquiry field with a white form sheet, typographic address plate, compact dark closing band. Nothing repeats the same two-column card.
- Styles live in a new `src/app/contact.css`, imported after `home.css`. Every selector is prefixed `lxct-` and the shared tokens are read, not redefined.
- Copy lives in `src/app/(site)/contact/content.ts`, so headings, intros, categories, field labels and the closing band can be edited without touching JSX.

---

## 4. The page, section by section

### 4.1 Hero — "Let's move things forward."

- A 51/49 split: copy on warm stone, a tall photograph on the right of a family looking up together in evening light.
- The headline is set on two lines; "forward." is red. The introduction is two paragraphs that name the three subjects explicitly — a rooftop system, a battery that covers the evening, an electric bike for the daily route — and explain that they tend to meet in the same conversation.
- The photograph carries a LONEX / Lahore stamp, a small EV-charging inset on its lower-right corner, and a mono caption: `01 — A home, a family, a route — the same conversation.` The inset is the only secondary image on the page and it ties mobility to the same frame.
- Actions: "Message on WhatsApp" (red), "Call 0322 888 8278" (outline), and a quiet "Use the form ↓" anchor.
- A facts rule closes the copy column: `Based — Lahore, Pakistan`, `Range — Solar · Storage · Mobility`, `Channels — Call · Chat · Form`.
- Below 900px the section stacks: copy, actions, facts, then a full-width photograph with its inset and caption. Below 480px the actions stack to full-width buttons and the facts become a two-column label/value list.

### 4.2 Direct contact — "A direct line, if you prefer one."

- A ruled register rather than cards: `01 Phone`, `02 WhatsApp`, `03 Office`, each row with an index, a large value, a mono meta line and a right-aligned action (`Call →`, `Chat ↗`, `Map ↗`).
- The values come from site settings: `0322 888 8278` formatted for reading, `+92 322 888 8278` in international form for WhatsApp, and `84 Brandth Road, Lahore, Pakistan` for the office.
- **Email is not shown.** `contactEmail` is empty in settings, and no address was invented to fill the row.
- A red-ruled note states the boundary on opening hours: "No opening hours are listed here. If you are planning a visit, message first and we will confirm the details with you." It is a disclaimer, not a claimed schedule.
- At 700px and below each row becomes a two-column label/value block with the action beside the value.

### 4.3 Enquiry — "Tell us what you are planning."

- A stone field split into a sticky copy column and a white form sheet. The copy column holds the heading, a short explanation, the three Write / Review / Send steps, and nothing else — the note about storage lives once, inside the form, where the submit decision is made.
- The form is a white sheet with a 3px red top rule and a mono header: `Enquiry form` / `All fields required`.
- Fields: full name, email, phone, enquiry category, subject, message. Name, email and phone share a two-column row; category is a four-option choice set; subject and message span the sheet.
- Category options are Solar, Batteries, Electric Bikes and General, each with a one-line hint ("Generation for a roof or site", "Storage and evening supply", "Daily journeys and charging", "Something else entirely"). General is selected by default.
- Field labels are mono, uppercase and numbered `01–06`. The numbers are `aria-hidden`, so the accessible name stays "Full name", not "Full name 01".
- The submit button reads "Prepare message in WhatsApp →", with a spinner and "Preparing message" while the handoff runs. The note beside it repeats the storage boundary.
- At 900px and below the section becomes one column, the aside stops being sticky and the steps run as a three-column row. At 700px the form becomes one column and the steps return to a list. Between 901 and 1100px the form column is too narrow for the category hints, so the hints are hidden rather than wrapped to three lines.

### 4.4 Location — "Find us on Brandth Road."

- A typographic address plate rather than an embedded map: a 3px ink rule, a mono `Office address` header with a small red mark, the street at display size, the locality beneath it, then the map and phone actions.
- The map link opens Google Maps in a new tab. The configured `googleMapsUrl` is only `https://maps.google.com/`, which would drop a visitor on an empty map, so the page falls back to a search URL built from the confirmed address: `https://www.google.com/maps/search/?api=1&query=84%20Brandth%20Road%2C%20Lahore%2C%20Pakistan`.
- The note "The map opens in a new tab." sits under the actions.
- At 900px and below the copy and plate stack; at 480px the actions become full-width.

### 4.5 Closing — "Prefer a conversation?"

- A compact dark band, 320px at 1440, using the panoramic `hero-solar-home-wide.webp` with a left-weighted scrim.
- Copy points back to the two direct channels; the actions are "Message on WhatsApp" and "Call the office".
- The photograph is decorative: it sits inside an `aria-hidden` wrapper with an empty `alt`, and the copy and links carry the meaning.

---

## 5. Form behaviour and states

### 5.1 Validation

- The form is `noValidate`; validation is explicit so the messages are written for the enquiry, not the browser default.
- Name: at least two characters. Email: address shape. Phone: at least seven digits. Subject: at least three characters. Message: at least ten characters. Category: must be one of the four options.
- Errors appear inline under the field, in red mono with an em-dash prefix, and the field's underline turns red. `aria-invalid` and `aria-describedby` are set on the invalid field.
- On submit, all fields are checked at once, the first invalid field receives focus and scrolls into view, and the status region stays empty. Validation never opens a tab.
- Fields re-validate on blur and clear their error as soon as the value changes.

### 5.2 States

| State | What the visitor sees |
| --- | --- |
| Idle | Form sheet, category pre-selected, submit and storage note |
| Working | Submit disabled with spinner and "Preparing message"; fields disabled |
| Ready | `role="status"` panel: "Your enquiry is ready in WhatsApp." with "Open WhatsApp again", "Copy message", "Edit details", plus a "View the prepared message" disclosure |
| Blocked | `role="alert"` panel: "WhatsApp did not open." with the reason, "Open WhatsApp", "Copy message", "Call 0322 888 8278" and "Edit details" |
| Copy success | Button label becomes "Copied" |
| Clipboard blocked | Prepared message disclosure opens, textarea is focused and selected, hint: "The message is selected below. Copy it with your keyboard." |
| No WhatsApp configured | The blocked panel explains that WhatsApp is not configured and offers the phone number instead of a dead link |

- The status panel is focused programmatically when it appears and scrolled into view; the scroll is instant under `prefers-reduced-motion`.
- Editing any field after a handoff returns the form to idle and clears the prepared message, so a stale message cannot be sent by mistake.
- The prepared message is rendered in a read-only textarea, so it can be inspected and copied without leaving the page.

### 5.3 Composed message

```
Hello LONEX,

Enquiry: Solar
Name: Ayesha Khan
Phone: 0300 1234567
Email: ayesha@example.com
Subject: Rooftop system for a 10 marla house

Message:
We would like to understand what a rooftop system with evening storage would involve for our home in Lahore.
```

The message is URL-encoded into `https://wa.me/923228888278?text=…`. The number is the verified WhatsApp number from settings.

---

## 6. Responsive behaviour

| Width | Page height | Behaviour |
| --- | --- | --- |
| 1440 | 3708 | Hero split 51/49; register in three ruled rows; enquiry two columns with sticky aside and 752px form; location two columns; closing band 320px |
| 1024 | 3409 | Same structure with tighter gaps; form 541px wide; category hints hidden to keep the choice labels on one line |
| 768 | 4527 | Hero stacks; register stays ruled; enquiry stacks with a three-column step row; location stacks; closing stacks |
| 390 | 5675 | Hero actions and facts stack; register rows become label/value; form one column; category choices one per row; location and closing actions full width |
| 360 | 5761 | Same as 390 with tighter gutters; form 320px wide; no horizontal overflow |

- Page height is roughly half the Step 9A page and stays well below the 8,000px ceiling at every width.
- Paragraph measure is capped: 53ch in the hero, 45ch in the direct-contact intro, 40ch in the enquiry aside, 44ch in the location copy.
- Buttons are at least 50px high and inputs use a 40px rule with a 16px type size, so the mobile form stays comfortable to tap; the sheet keeps 16px side padding at 480px so inputs do not touch the edge.

---

## 7. Motion

- The page uses the existing `PageMotion` contract only: `data-hero`, `data-hero-line`, `data-hero-item`, `data-reveal`, `data-reveal-group` and `data-reveal-image`.
- No animation dependency was added and no shared motion file was modified.
- Hover motion is CSS-only: button arrows shift 3px, register actions shift 2px, links turn red, inputs darken their rule.
- Under `prefers-reduced-motion` the spinner slows rather than spins fast, the arrow transitions are removed, and every reveal element renders at its final position before any script runs. A full-page capture with reduced motion matches the standard capture.

---

## 8. QA results

### 8.1 Commands

| Check | Command | Result |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | Pass |
| ESLint | `npx eslint "src/app/(site)/contact"` | Pass |
| Tests | `npm run test` | 25 files, 192 tests passed |
| Production build | `npm run build` | Pass; `/contact` present as a dynamic route |
| Production serve | `npm run start -- -p 3001` | `/contact` returned 200 |

No CSS linter is configured in the project; `contact.css` was verified through browser checks and visual review.

### 8.2 Browser checks (production build)

| Viewport | Height | Horizontal overflow | Console errors | Page errors | Broken images |
| --- | --- | --- | --- | --- | --- |
| 1440×900 | 3708 | 0 | 0 | 0 | 0 |
| 1024×768 | 3409 | 0 | 0 | 0 | 0 |
| 768×1024 | 4527 | 0 | 0 | 0 | 0 |
| 390×844 | 5675 | 0 | 0 | 0 | 0 |
| 360×780 | 5761 | 0 | 0 | 0 | 0 |

Additional checks:

- **Heading:** exactly one `h1`, "Let's move things forward." — matching the required headline — followed by five section `h2`s and three step `h3`s.
- **Anchor:** "Use the form ↓" lands with the enquiry section top at 96px, exactly the site scroll padding, clear of the 77px sticky header.
- **Links:** all phone links are `tel:03228888278`; WhatsApp links are `https://wa.me/923228888278` with `target="_blank"` and `rel="noopener noreferrer"`; the map link carries the encoded address search.
- **Email:** zero `mailto:` links, because no email is configured.
- **Real handoff:** a real submit opened a tab at `https://wa.me/923228888278?text=…` with the full composed message, and the success panel appeared.
- **Blocked popup:** with `window.open` returning `null`, the `role="alert"` panel appeared with four actions, the status region received focus, and the WhatsApp link still carried the composed message.
- **Copy:** the clipboard contained the composed message and the button read "Copied". With clipboard access refused, the disclosure opened, the textarea was focused with 256 characters selected, and the hint appeared.
- **Validation:** an empty submit produced five inline errors, five `aria-invalid` fields, focus on `name`, and no status panel.
- **Accessibility:** 0 unlabeled fields, 0 images without an `alt` attribute, one `h1`, skip link present, `lang="en"`, red 2px `:focus-visible` outline on every control, and a keyboard-reachable radio group whose visible focus ring is drawn on the label.
- **Decorative images:** 7 empty `alt` values in total — the footer's six social icons and the closing band background. All page content images have meaningful alternatives.

### 8.3 Issues found during visual review and fixed

1. **Hero fact wrapped at 1024.** "Phone · WhatsApp · Form" broke onto two lines. The third fact is now "Call · Chat · Form".
2. **Category hints were cramped at 1024.** The form is still side-by-side there but only 541px wide, so hints wrapped to three lines. Hints are hidden between 901 and 1100px; the labels keep the meaning.
3. **The storage note appeared twice.** It was in the enquiry aside and again under the form. The aside copy was removed.
4. **Mobile hero actions were cramped.** At 480px and below the WhatsApp and call buttons now stack full width, with the form anchor beneath them.
5. **The EV inset sat over the family's faces.** It moved to the lower-right corner of the hero photograph.
6. **Field numbers polluted accessible names.** `ariaSnapshot` read "Full name 01". The index spans are now `aria-hidden`; the accessible name is "Full name".
7. **The enquiry anchor landed 184px down.** Both the site's `scroll-padding-top` and a new `scroll-margin-top` were applying. The duplicate was removed; the anchor now lands at 96px.
8. **Error text was small at 10px.** Field errors moved to 11px with a 1.5 line height.
9. **The clipboard fallback hint was missing after a successful handoff.** The hint now renders in both the ready and blocked panels.
10. **Status panels appeared below the fold.** They are now scrolled into view when they appear, respecting reduced motion, and invalid fields are scrolled to on submit.

---

## 9. Before and after

| | Before (HEAD) | After (Step 9B) |
| --- | --- | --- |
| H1 | Talk to LONEX. | Let's move things forward. |
| Enquiry form | None | Six-field validated form with WhatsApp handoff |
| Contact details | Plain three-row table | Ruled register with index, value, meta and action per row |
| Location | Text link "Open in Google Maps" | Typographic address plate with map and call actions |
| Sidebar | Seller information, verification, location links | Write / Review / Send steps and the storage boundary |
| Closing | "Not sure where to start?" verification CTA | Compact "Prefer a conversation?" band |
| Hero image | None | Family photograph with EV-charging inset and caption |
| Email | Absent | Absent — `contactEmail` is not configured |
| Opening hours | None | None — an explicit disclaimer replaces the row |
| Page height at 1440 | 1918px | 3708px |

Before captures were taken from the previous page on the development server; after captures were taken from the production build on port 3001. Both sets are at all five widths, with hero and full-page images, plus a reduced-motion capture.

The full set is in `artifacts/lonex-step-9b-review/before/` and `artifacts/lonex-step-9b-review/final/`. The final set also includes the form and location at every width, and the validation, success and blocked states at 1440 plus validation at 390.

---

## 10. Boundaries and caveats

- **Only `/contact` changed.** The homepage, About, header, footer, category pages, product pages, verification pages, seller pages, database schema, authentication and backend were not modified. The new stylesheet is imported by the contact page only.
- **No submission backend was invented.** No table, API route, server action or mail transport was added. The form hands a composed message to WhatsApp and says so.
- **No contact details were invented.** Phone, WhatsApp and address come from `loadPublicSettings()`. Email is omitted because it is empty. There are no opening hours.
- **The map is a search, not a pin.** The configured maps URL is the Google Maps homepage, so the page searches the confirmed address instead.
- **The "opening hours" phrase in QA is the disclaimer.** The automated check flags the string "opening hours" because the page says none are listed; it is not a claimed schedule.
- **Three existing images, no new assets.** `lifestyle/family-energy.webp` (hero), `lifestyle/ev-charging.webp` (inset) and `hero/hero-solar-home-wide.webp` (closing band).
- **The page is server-rendered.** It awaits `connection()`, loads public settings per request and exports `instant = false`, matching the other public pages.
- **Nothing was staged, committed or pushed.**

---

## 11. Files

| File | Change |
| --- | --- |
| `src/app/(site)/contact/page.tsx` | Rebuilt page: five sections, settings-driven register, new metadata, `PageMotion`, `contact.css` |
| `src/app/(site)/contact/content.ts` | New copy module: hero, direct contact, enquiry, categories, form labels, location, closing, WhatsApp opener |
| `src/app/(site)/contact/enquiry-form.tsx` | New client form: validation, message composition, WhatsApp handoff, ready/blocked/copy states |
| `src/app/contact.css` | New page stylesheet, `lxct-` prefix, full responsive rules and form states |
| `artifacts/lonex-step-9b-review/capture.mjs` | Screenshot harness (`before`, `final`, `states`) |
| `artifacts/lonex-step-9b-review/qa-check.mjs` | Functional, layout and accessibility QA harness |
| `artifacts/lonex-step-9b-review/qa-report.json` | Latest QA output, produced against the production build |
| `artifacts/lonex-step-9b-review.zip` | Archive of the review package |

---

## 12. Next step

Step 9B stops here. Awaiting visual approval before Step 9C.

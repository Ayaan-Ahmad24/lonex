# LONEX — Creative Direction for a Premium Public Website

**Status:** planning only. Nothing in this document has been implemented.
**Date:** 10 November 2026
**Scope:** the public site (`/`, category pages, product pages, and the secondary pages that share the shell).
**Out of scope:** admin dashboard, CMS schema, database, dependencies, authentication.

No application file, stylesheet, component, route, database table or CMS record has been
changed to produce this document. The only file written is this one.

**What was audited.** The working tree as it stands on 10 November 2026, which contains
uncommitted work (the public shell, `site.css` and most site routes are modified or untracked
relative to the last commit). Findings cite line numbers in that state, not in the last commit.
Visual judgements are cross-checked against the captures in `artifacts/lonex-design-review/`.

---

## 0. Diagnosis and summary

### What the current site does well

- **The direction is already right.** The current build is not a generic template: it has an
  asymmetric hero (type left, photograph right), a three-cell ledger beneath the hero copy
  (`Generate` / `Store` / `Move`), two black bands, hairlines, a mast-style footer and large
  Poppins display type. The editorial, light-first decision has been made and it is a good one.
- **The red word in the headline is the best idea on the page.** `Power for what's next.` with
  `next.` in red is memorable, brand-owned, and does more for recognition than any decoration
  could. It should be kept and made systematic, not removed.
- It is honest. It publishes the verification feature, the authorised-seller rule, and a
  journal, and it does not invent statistics, testimonials or client logos.
- It has a real editorial voice: *"Power for what's next."*, *"Built on what we can verify."*,
  *"Buy from a confirmed seller."* These are better lines than most energy sites carry.
- The shell works: CMS-driven navigation, verification, sellers, journal, redirects.

**So this is not a reinvention. B is the direction the build already chose, taken to the point
where it becomes distinctive.** That is the most honest and the most valuable reading of the
evidence, and it changes what the redesign has to do: fewer new ideas, more completion.

### What holds it back

1. **Whole sections do not render in a full-page view.** In
   `artifacts/lonex-design-review`, the home, category and product captures each show hundreds of
   pixels of white where the range, the featured products and the product grid should be. Two
   candidate causes: the `animation-timeline: view()` reveal on `.site-reveal` sitting at zero
   progress when the page is captured without scrolling, and lazy images that never load in a
   full-page capture. Either way, **primary content that only exists once the page is scrolled is
   fragile** — for print, screenshots, crawlers and anyone who lands mid-page. This is the single
   largest defect and it must be diagnosed before any visual decision is made.
2. **The eyebrow is systemic, not accidental.** `.site-label` has about thirty call sites, and
   eighteen of them are eyebrow-pattern instances — seventeen directly before a heading:
   `What the registry holds`, `From the journal`, `Before you buy`, `How it works`,
   `What it confirms`, `What it does not`, `Need help?`, `Enquiries`, `Social`, `Location`,
   `What to include`, `Verification`, `Highlights`, `Model verification`, `Error 404`, the
   category name above the product title, and a red label above the article title — plus one
   above a seller's name. That is gate 54 multiplied by seventeen, and it is the strongest
   evidence that the current page is still assembled from blocks rather than composed.
3. **The range is still a poster grid, and its rhythm repeats.** Three photographs with a dark
   gradient scrim top and bottom, white type on the image, a verb, a status line (`Published
   products` or `No published models`), a name, a sentence and a `Browse` label. The composition
   is already asymmetric — two framed tiles and one wide one — but the internal anatomy is
   identical three times. The scrim is a gradient doing the job that layout should do, and the status line tells
   the visitor nothing; on an unpublished category it advertises the absence. Below it, the
   featured products, the principles, the sellers and the journal all return to the same
   three-column rhythm, so one shape governs four consecutive sections.
4. **The system has no device of its own.** It borrows the editorial vocabulary competently —
   large Poppins, rules, black bands — but nothing on the page would identify LONEX without the
   logo. The red word comes closest; it is used once and not codified.
5. **Photography is documentary where it needs to be product-led.** The hero is a garden-scale
   array at dusk, mobility is Amsterdam cyclists, storage is a container yard. They are truthful,
   but they carry scenery instead of product. The hero credit is set at 11 px in white over the
   bottom edge of the photograph — hard to read, and unlike the rest of the system.
6. **Product pages are mostly empty state.** A designed placeholder, two highlights and a note.
   The empty state is honest but it is not *designed*, and after it the page is blank (item 1).
7. **Four weights, one voice.** The stylesheet sets 400, 500, 600 and 700; almost everything that
   matters sits at 600. There is no data register, so specifications read as prose. The product
   `<h1>` is even styled with the section-heading class (`site-h2`), so the most important words on
   the page are set at section size.

### The direction in one sentence

> Complete the editorial system LONEX has already started: one device (the survey line), one
> promise (the red word), one measurement voice (the data face), the range as three arguments
> instead of three posters, and the registry as the page's single dramatic moment.

### What changes, concretely

| Today | Proposed |
| --- | --- |
| 18 eyebrow-pattern instances (17 above a heading) | Sections open with the heading, a captioned image, or a rule; the `.site-label` utility and `Eyebrow` component are deleted |
| Photograph with a gradient scrim and type on top, three times | Three full-width range rows with the verb in the layout; type sits on a photograph nowhere except a captioned figure |
| Red word once, red used ad hoc | The red word is the brand promise and is specified; red appears at most twice per screen — the promise and one functional signal — never as a rule or background |
| The dark band belongs to the seller directory | The dark band moves to the verification registry; the sellers become a stone band |
| Small red city label above the seller name | Seller name first; city as metadata beneath it |
| No device of its own | The survey line: a hairline to the viewport edge with a tick at the container edge, above every section heading |
| Specs as prose, no data register | A single mono outlier for measured values, spec tables and codes |
| Four weights | Three (400 / 500 / 600), with 700 reassigned |
| Product pages ending in blank space | Designed empty states and a spec-first product layout |
| Primary content revealed on scroll | Visible in the base CSS; motion is additive, never a precondition |

---

## Hallmark pre-emit record

Hallmark requires a stamp at the top of any new CSS and a critique before emitting. This is the
planning equivalent, recorded now so the build inherits it rather than reconstructing it later.

```
shape:        The measured page (index-led; derived, not from the catalogue)
postures:     Asymmetric grid · Hairline · Typographic · Left margin · Reveal-once
axes:         Editorial grid · Technical register · Restrained motion · Light-first
critique:     P4 H5 E5 S4 R4 V5 — weakest S (the range can still read as a catalogue);
              carried by the verb rows, the registry and the mono spec voice
waivers:      gate 1 (Poppins as display face) — brandbook mandate, evidence in § 3.5
dismissed:    none
open:         gate 54, 63, 67 compliance specified in § 3 and enforced at build
```

The current `site.css` already carries a stamp: *shape: Editorial index · hero: Settled, split ·
footer: mast over three columns · critique P4 H4 E4 S4 R4 V4 · waive 26b · dismissed 3 · answered
F3, F16*. This document keeps those decisions and raises the critique to P4 H5 E5 S4 R4 V5; it
does not overturn the existing stamp except where § 3 requires it. The F3 answer (balance on
display heads) is retired rather than re-argued: the redesign breaks display lines by composition.

---

## 1. Reference analysis: LONGi

Studied at `https://www.longi.com/en/` on 10 November 2026. LONGi is used here as a **quality
reference**, not a template. Nothing below is copied — the palette, the type, the copy and the
layout system are LONEX's own.

### 1.1 What the homepage actually does

| Order | Section | Composition | What it achieves |
| --- | --- | --- | --- |
| 1 | Utility bar + mega navigation | Two bars; eight top-level items (Solutions, Products, Technology, Service, Sustainability, About, Careers, Contact), each opening a multi-column panel with a one-line descriptor per group | The company is presented as a *catalogue with a point of view*, not a brochure |
| 2 | Hero carousel | Three full-bleed slides: a technology white paper, the Hi-MO X10 module, the Hi-MO 9 module. Each has a headline, a short claim, one "Learn More" | Every slide is a real product or a real publication |
| 3 | Value chain | Three columns — Silicon Wafers, PV Modules, PV Solutions — each with a paragraph and a link | Vertical integration stated as three facts |
| 4 | Technology | Two-column editorial: "Innovation Labs", "R&D Centers", "Lifecycle Quality" with long paragraphs | Depth over slogans |
| 5 | Figures band | R&D spend, R&D centres, cell and tandem efficiency — set large, in a row | Numbers do the persuading, not adjectives |
| 6 | Solutions | Four-up: Utility-Scale, Commercial & Industrial, Residential, Hydrogen, each with one line and a link | Segment routing without a card carousel |
| 7 | Trending news | Dated list, three items, with a real date on each | The site is alive |
| 8 | ESG | A paragraph and a link | Institutional weight |
| 9 | Footer | Four link columns, hotline, subscribe, legal, accessibility statement | Utility, not decoration |

### 1.2 What is worth learning

1. **Product first, scenery second.** The hero is a product or a publication, not a sunset.
   Every screen has a subject with a name.
2. **Specificity reads as credibility.** Efficiency percentages, R&D figures, model numbers.
   LONGi can support these claims; LONEX mostly cannot yet — so LONEX must find the specific
   things it *can* prove (verification, seller confirmation, imported range) and make those the
   numbers and the nouns.
3. **A technical register is premium.** Model codes, spec blocks, measured values and consistent
   product renders look expensive. Gradients and glass look cheap by comparison.
4. **Dark and light alternate as rhythm, not as theme.** Dark bands are used for product and
   technology moments; the rest is light. The page has a pulse.
5. **Navigation is a map of the business.** The mega-menu mirrors the value chain. A visitor
   learns the company by hovering.
6. **Type is calm; scale does the work.** Display type is large and tight, body is modest, and
   there is no decorative case treatment.

### 1.3 What is deliberately rejected

| LONGi pattern | Why LONEX will not use it |
| --- | --- |
| Auto-rotating hero carousel | Hallmark gate 18: any auto-rotating content needs pause on hover and focus plus a visible control. It also splits attention on the one screen that must be decisive. LONEX gets one hero. |
| Mega-menu with 40+ links | The LONEX range is three categories. A mega-menu would invent complexity the business does not have. |
| A wall of statistics | LONEX has no published R&D spend, efficiency record or certification count. Printing placeholder numbers would break the honesty rule the current site follows. |
| Four-up solution cards | The repeated-tile pattern this redesign is moving away from |
| Product renders on atmospheric dark backgrounds | LONEX has no studio renders. Faking them would misrepresent the product. |
| Global scale language ("world's leading") | LONEX is a Pakistani importer and solutions brand. Its authority is local and verifiable. |

### 1.4 The translation

| LONGi device | LONEX equivalent | Why it works here |
| --- | --- | --- |
| Module model numbers | Product names, and the verification code format | The registry is LONEX's version of traceability |
| Efficiency figures | Spec tables, honestly populated from the CMS | Technical confidence without invented claims |
| Value-chain columns | Generate / Store / Move as full-width rows | The three businesses, given room |
| Four solution segments | Three categories plus the seller network | The real structure of the company |
| Dark technology bands | One dark registry band, one dark closing call | Limited dark blocks, as the brandbook asks |
| News list with dates | The journal, two entries, real dates | Proof of activity |

---

## 2. Skill utilisation

Every installed skill relevant to interface design and motion was read before this document was
written. The table records what each contributed and, where relevant, what could not be used — a
skill that is installed but not applicable is a finding, not a gap.

| Skill | Read | Contribution to this direction | Not usable / rejected |
| --- | --- | --- | --- |
| `hallmark` | `SKILL.md`, `gates.md`, `direction.md`, `layout.md`, `imagery.md`, `anatomy.md`, `macrostructures.md`, `fonts.md`, `scroll-choreography.md`, `craft.md` | The floor, the gate set, the canvas maths (1440 canvas, 12 columns, 32 px column gaps), the one-idea-per-screen rule, the hero postures, the imagery hierarchy, the reveal-once default, the stamp format | Catalogue themes and the dealt draw (this is a custom run with an existing brand); `sloplint.mjs` is a build-time tool and is not run against a planning document |
| `design-taste-frontend` | `SKILL.md` | One system, equal edges, one section per screen, real photography over renders, a hero entrance and one or two dealt moments, quiet micro-interactions, no captions under images, no parallax on text, no violet accents | Its hooks and browser checker assume Claude Code paths (`CLAUDE_SKILL_DIR`); under OpenCode they do not auto-run, so its gates must be invoked manually at QA |
| `ui-ux-pro-max` | `SKILL.md`, `scripts/search.py` | Verified `editorial-grid-magazine` as the closest style; typography candidates; GSAP scroll presets; UX rules on sticky nav, focus, heading order, breadcrumbs | `--design-system` produced two off-topic systems (see 2.1); the `landing` and `product` domains returned **no database match** for energy queries |
| `design-system` | `SKILL.md` | Three-layer token architecture (primitive → semantic → component) used verbatim in § 4.9 | Its Tailwind/shadcn token generator is not applicable; the public site is hand-rolled CSS |
| `ui-styling` | `SKILL.md` | Component state discipline and accessible-component expectations used in § 10 | shadcn/Radix installation is out of scope: no new dependencies are permitted |
| `brand` | `SKILL.md` + reference set | Four approved colours, Poppins 400/500/600/700, logo integrity rules, consistency checklist | Its scripts (`inject-brand-context.cjs`, `validate-asset.cjs`) were not executed; they assume a `.brand/` context this repo does not have |
| `design` | `SKILL.md` | Routing map; confirmed brand, tokens and UI styling belong to the sub-skills above | Logo generation, CIP mockups, slides, banners and social photos are out of scope for this engagement |
| `web-design-guidelines` | `SKILL.md` + live rules fetched from `vercel-labs/web-interface-guidelines` | The QA checklist in Phase 6 of § 12: focus-visible, `prefers-reduced-motion`, transform/opacity only, image dimensions, labels, touch targets, hydration safety | It is a review tool, not a design generator; it contributes constraints, not direction. Its `text-wrap: balance` recommendation is declined on display heads (see § 2.2) |
| `gsap-core` | `SKILL.md` | Tween/ease vocabulary, `gsap.matchMedia()` for breakpoint and reduced-motion branching | — |
| `gsap-timeline` | `SKILL.md` | The hero sequence and the position parameter for overlapping reveals | — |
| `gsap-scrolltrigger` | `SKILL.md` | Register once; triggers on top-level tweens; never `scrub` with `toggleActions`; `refresh()` after fonts and images | Pinning is deliberately kept to zero on the homepage (see § 8.3) |
| `gsap-react` | `SKILL.md` | `useGSAP()` with `scope`, no GSAP during SSR, cleanup via context | — |
| `gsap-performance` | `SKILL.md` | Transform/opacity only, no `will-change` spray, `quickTo()` for pointer-driven values, stagger batching | — |
| `banner-design`, `slides` | Not read | Out of scope | — |
| **Vercel React Best Practices** | — | **Not installed.** Searched `.agents/skills`, the whole repo and `node_modules`; `skills-lock.json` lists only eight skills, none of them React guidance. | Cannot be reported on. Next.js 16 guidance comes from `node_modules/next/dist/docs/` at build time instead |

### 2.1 UI UX Pro Max: the rejection log

Two `--design-system` runs were attempted and both are unusable as-is:

| Run | Query | Output | Verdict |
| --- | --- | --- | --- |
| 1 | `renewable energy premium corporate product showcase`, variance 7 / motion 6 / density 4 | Pattern: *Scroll-Triggered Storytelling*; Style: **Liquid Glass**; black + gold | Rejected. Liquid Glass is an Apple-platform material and the opposite of an editorial energy brand. Black + gold contradicts the four-colour brandbook. |
| 2 | `solar energy technology manufacturer industrial editorial`, variance 6 / motion 5 / density 3 | Pattern: *Trust & Authority*; Style: **Organic Biophilic**; green palette; Exo + Roboto Mono | Rejected. Green is not an approved colour; biophilic rounded forms fight the editorial grid; the brandbook forbids extra marketing colours. |

What *did* verify:

| Query | Domain | Result | Use |
| --- | --- | --- | --- |
| `swiss editorial grid typography` | style | `editorial-grid-magazine` — asymmetric grid, editorial typography, large imagery, reveal on scroll, cost low, accessibility risk low | The structural basis of the recommended concept |
| `corporate premium technical sans serif` | typography | Corporate Trust (Lexend + Source Sans 3), Modern Professional, Premium Sans | Mood reference only; Poppins is mandated, so none can be adopted |
| `premium corporate industrial trust` | color | Automotive dealership — "premium dark + action red" (`#1E293B` / `#DC2626`) | Confirms the red-as-action logic; the palette itself is not adopted |
| `hero navigation product gallery` | ux | Sticky nav must not obscure content; complete keyboard navigation; sequential headings; breadcrumbs at 3+ levels | Constraints adopted |
| `scroll reveal image sequence` | gsap | Subtle 300–400 ms `power1.out`, 12 px offset; scope triggers; never hide below-fold content without a no-JS fallback | Motion budget adopted (LONEX tightens it further) |

### 2.2 Where the skills conflict, and how it is resolved

| Conflict | Resolution |
| --- | --- |
| Hallmark gate 1 bans Poppins as a display face; the brandbook mandates Poppins | The brandbook wins, and the waiver is recorded with evidence rather than hidden (§ 3.5) |
| Hallmark bans Inter as a body default; the site currently uses Inter | The redesign drops Inter and runs a single family, Poppins, which is permitted ("one family may do both") and removes a waiver |
| `design-taste-frontend` wants one or two "dealt moments" per page; Hallmark wants one idea per screen and one scroll pattern per page | The homepage gets exactly two moments: the hero entrance and the registry band. Everything else is reveal-once |
| UI UX Pro Max recommends scroll-triggered storytelling with a progress indicator; Hallmark forbids more than one scroll pattern per page and never on prose | Narration is carried by layout and copy, not by pinned chapters. No progress bar |
| The brandbook allows radius 4–12 px; the brief warns against excessive rounded rectangles | Radius is used at the bottom of that range and only on interactive or contained surfaces: 4 px controls and wells, 8 px large media, 12 px sheets. No pill shapes |
| Vercel's guidelines recommend `text-wrap: balance` on headings; Hallmark F3 forbids it on display heads | Hallmark wins on the display voice: display headings break by composition. `text-wrap: pretty` is used on prose, where both agree |

---

## 3. Hallmark gate findings

The three gates named in the brief were located in `.agents/skills/hallmark/references/gates.md`
and are all **Floor** tier — never waivable, no exceptions granted by argument.

### 3.1 Gate 54 — the eyebrow

> "The eyebrow: short inert type before a heading that announces it, in any geometry (stacked,
> beside, pill, ordinal, category tag over a card, `TRUSTED BY` over logos). House rule. Legal:
> `<figcaption>`, `<th>`, `<label>`, a nav or tab label, a byline or `<time>`, a unit after its
> figure, a real filename, a live `role="status"` chip, one linked announcement going somewhere
> real." — `gates.md:129`

**Finding.** The eyebrow is not a leftover — it is a utility class with about thirty call sites,
and eighteen of them are eyebrow-pattern instances: seventeen sit directly before a heading, and
one sits above a seller's name.

| File | Label | What it precedes |
| --- | --- | --- |
| `(site)/page.tsx:374` | `What the registry holds` | the registry heading |
| `(site)/[categorySlug]/[productSlug]/page.tsx:128` | the category name, in red | the product `<h1>` |
| `...[productSlug]/page.tsx:170` | `Highlights` | the highlights list |
| `...[productSlug]/page.tsx:187` | `Model verification` | the verification note |
| `(site)/verify/page.tsx:74, 106, 113, 120` | `How it works`, `What it confirms`, `What it does not`, `Need help?` | four headings |
| `(site)/contact/page.tsx:76, 179, 199, 221, 236` | `Enquiries`, `Social`, `Location`, `What to include`, `Verification` | five headings |
| `(site)/blog/page.tsx:79` | `From the journal` | the index heading |
| `(site)/blog/[slug]/page.tsx:97` | a red label | the article title |
| `(site)/authorized-sellers/page.tsx:85` | `Before you buy` | the seller list |
| `(site)/not-found.tsx:17` | `Error 404` | the not-found heading |
| `site.css:1023` | seller city, 11.5 px red | the seller name, inside a card |

The rest of the `.site-label` uses are legal and stay: breadcrumb navigation, `<label>` elements,
`<dt>` terms in a definition list, and the contact detail labels that sit beside their value.

The codebase has already done part of this work: `section-heading.tsx` accepts an `eyebrow` prop
and deliberately does not render it, and `.type-eyebrow` (`globals.css:95`) was neutralised to
sentence case with zero tracking. But `eyebrow.tsx`, the prop and the call sites all still exist,
so the pattern is dormant rather than gone. **The redesign deletes the component, the prop, the
`.site-label` utility and every heading-adjacent call site**, so it cannot return by accident.

**Rule for the redesign.** No type of any kind precedes a heading. Sections open in one of five
ways, all legal:

1. **The heading itself, at display size**, as the first element in the section.
2. **A full-bleed image**, with a `<figcaption>` beneath it carrying a fact about the subject —
   legal by name. Attribution for licensed photography lives in the footer colophon, never in a
   caption under a stand-in (gate 66).
3. **A rule**, then the heading.
4. **The heading, then a lede sentence** in the body column — order reversed from the eyebrow.
5. **A linked announcement** that goes somewhere real (the newest journal entry, a verification
   notice), which is explicitly legal — but only one per page.

**Where the temptation will return.** Product pages (a "Specifications" micro-label above the
table), the range rows ("01 — Generate"), the journal (a "Latest" tag), and the footer column
heads. The first is replaced by a real `<caption>`/`<th>`; the second by the verb itself; the
third by the date; the fourth is a heading and is fine.

### 3.2 Gate 63 — template punctuation

> "Template punctuation: meta strings joined with middle dots (`A · B · C`), an arrow glued to
> link or button text (`Learn more →`), decorative status dots before labels, `WORD - fragment`
> labels. House rule. Legal: one dot in a byline, a caption or a live state, a marquee's repeating
> separator. The script fires from two dots; one dot is judged." — `gates.md:130`

**Finding.** The public site passes. A scan of every public page and component found no middle
dots, no arrows glued to link text and no decorative status dots. The pattern does exist in the
**admin** UI — five middle-dot meta strings in pagination and admin page headers — which is out of
scope here but worth a separate ticket. The rule is recorded because the redesign replaces most of
the link and meta markup, and it would be easy to reintroduce.

**Rule for the redesign.** The link is a word, optionally with a separate `aria-hidden` SVG
glyph that is a sibling of the text, never a character glued to it, and never a glyph alone
without an accessible name.

| Banned | Replacement |
| --- | --- |
| `Explore the range →` | `Explore the range`, with a 16 px rule that grows on hover |
| `Solar · Storage · Mobility` | Three separate links, or two hairlines between three cells |
| `2026 · 4 min read` | `10 November 2026`, and reading time in a separate element or omitted |
| `LONEX - Power for what's next` | `LONEX. Power for what's next.` or a line break |
| `● Verified` | A real `role="status"` string: `Verified` |

The one dot allowed is a single separator in a byline or a live state. The redesign uses none,
which is simpler to defend.

### 3.3 Gate 67 — the tracked-caps label

> "The tracked-caps label: a label, caption, table head, nav link, tag, chip or any text at 15px
> or under set uppercase or in small caps, or letter-spaced past 0.03em. House rule. Legal: a
> wordmark; a control on a page whose display is itself uppercase, tracked 0.04em or less." —
> `gates.md:81`

**Finding.** Most of the interface already passes: `.site-label` and `.type-eyebrow` are 12–13 px,
sentence case, tracked at 0.01em or less. One rule fails:

```
site.css:1500-1501   .site-input--code { letter-spacing: 0.14em; text-transform: uppercase; }
```

The verification field is a real code string, but gate 67's exceptions are a wordmark and a
control on a page whose display is itself uppercase — not an input value. The seller city at
11.5 px (§ 3.1) is a small-label treatment earning its emphasis from colour and weight rather
than case, so it is a hierarchy problem, not a gate-67 one.

**Rule for the redesign.** There is **no uppercase and no letterspacing anywhere in the
interface**, with one exception: the brandmark is an image and is never re-set in type. Every
label, caption, table head, nav item, tag and button is sentence case, in the body face, one
step smaller than the text it describes, at `letter-spacing: 0`.

This is a real constraint on a Poppins brand, because the easiest way to fake sophistication
with a geometric sans is to set it in tracked capitals. The system therefore has to earn its
hierarchy from **size, weight, colour and position**, which is exactly what § 4 does.

### 3.4 The other gates that bind this direction

| Gate | Tier | What it means here |
| --- | --- | --- |
| 1 | Reflex | Display face is Poppins, which is on the banned-as-default list. **Waiver recorded**, § 3.5. |
| 10a | Floor | Never `transition: all`; never animate `width`, `height`, `top`, `left`. All motion is transform/opacity. |
| 11 | Reflex | One hover signal per element, on the container, never on the image, no lift on every card. `IMAGE_GUIDE.md` § 6 still describes an image zoom on hover; no such rule exists in `site.css` today — only a leftover reset at `site.css:1856` — so it is documentation and dead code to correct, not a live defect. It must not be added. |
| 12 | Reflex | No bounce or overshoot on UI state. Exponential ease-out only. |
| 15 | Floor | Focus rings appear instantly, never faded in. |
| 18 | Floor | No auto-rotating content without pause and a control. Hence no carousel. |
| 26b | Reflex | Disabled states only where a control is genuinely unavailable (the verify submit while empty). |
| 48 | Floor | Every colour and font comes from a token at `:root`. No literals past the token block. |
| 58 | Floor | No more than ~80 words in any 900 px window at 1440, and no hero with more than two text blocks before its actions. Here: headline, one sentence, then the two actions; the ledger sits below. |
| 64 | Reflex | Mono is confined to code, figures and measurements. Spec-table labels, captions and nav stay in Poppins. |
| 66 | Reflex | No decoration text: no scroll cue, no `01 / 4` gallery counter, no credit caption under a stand-in. Attribution moves to the footer colophon. |
| F8 | Finish | One scroll pattern family per page. Reveal-once only. |

### 3.5 Waiver register

| Gate | Tier | Waiver | Evidence | Mitigation |
| --- | --- | --- | --- | --- |
| 1 | Reflex | Poppins as the display face | `reference/LONEX_V2_4_MASTER_HANDOFF/10_VISUAL_DESIGN_AND_CONTENT_SYSTEM.md` line 5: "Poppins primary font: 400/500/600/700", part of the approved brandbook; the logo is a supplied graphic and the brand cannot change faces without a brand decision above this project | Hierarchy is carried by scale (52–72 px display), weight contrast (400 vs 600), tight display tracking (−0.03em) and the mono data voice, so Poppins is not asked to be distinctive by itself |

No other waiver is requested. Two would already be enough to make this a house style; the
direction deliberately stays at one.

### 3.6 Pre-emit critique

- **P (purpose) 4** — the page's job is enquiry, and every section ends in a real next step
  (range, product, verify, seller, journal, contact). The weak point is that the journal is thin,
  so the page must not lean on it for proof.
- **H (hierarchy) 5** — one display moment per screen; the red word and one red action, never more.
- **E (execution) 5** — the grid is real: 12 columns, visible hairlines, equal outer edges.
- **S (surprise) 4** — the survey line and the registry band are the distinctive moves; the spec
  ledger is the supporting rhythm. The range rows are the risk: they must be composed as editorial
  rows, not as wide cards.
- **R (restraint) 4** — four colours, one family, no ornament, no gradients at all.
- **V (voice) 5** — the existing copy is good and will be kept; no invented claims.

---

## 4. The LONEX design system

### 4.1 Principles

1. **Measure, don't decorate.** Hairlines, columns, spec tables and codes carry the identity.
   Ornament is a symptom of a layout that has not decided anything.
2. **Red carries the promise and one functional signal.** One red word in a display line at most,
   and one red control or state per screen. Red is a signal, not a surface.
3. **Photography is a subject, not a background.** Every image has a named subject and a caption
   where it is doing documentary work.
4. **Hierarchy by scale, not by case.** No uppercase, no tracking, no small caps.
5. **Empty space is a material.** Deliberate empty columns are part of the composition.
6. **Nothing claims what the CMS cannot prove.**

### 4.2 Colour

Four approved colours plus derived neutrals for accessibility only (permitted by the brandbook:
"Neutral UI text/disabled shades permitted for accessibility").

| Token | Value | Role | Contrast | Share of screen |
| --- | --- | --- | --- | --- |
| `--lx-paper` | `#FFFFFF` | Page ground, content surfaces | — | ~70% |
| `--lx-stone` | `#F5EDED` | Alternating band, image wells, input ground | text `#000` 18.2:1 | ~15% |
| `--lx-stone-deep` | `#EDE1E1` | Placeholder well, pressed state on stone | — | <2% |
| `--lx-ink` | `#000000` | Body and display type, dark bands | on white 21:1 | ~10% |
| `--lx-ink-70` | `#575151` | Secondary text, captions | on white 7.8:1 | — |
| `--lx-ink-40` | `#8A8080` | Disabled only. Never body text | 3.8:1 (exempt) | — |
| `--lx-line` | `#E3D8D8` | Hairlines on light | non-text | — |
| `--lx-line-ink` | `#2B2525` | Hairlines on black | non-text | — |
| `--lx-red` | `#CF0A0A` | The promise word, one functional signal (action, active state, verified result) | on white 5.7:1; white on it 5.7:1 | ~3–5% |
| `--lx-red-deep` | `#A80808` | Hover/active of red only | on white 7.8:1 | <1% |
| `--lx-on-ink-70` | `#C9BFBF` | Secondary text on black | on black 11.7:1 | — |

Rules:

- No fifth marketing colour. Success/error states use ink plus a message. Red means one of two
  things and nothing else: **the promise** (one word inside a display line) or **a functional
  signal** (a control, an active indicator, a verified result). At most one of each per screen,
  and never as a rule, a border, a background or decoration.
- **No gradients, at all.** Type is never placed on a photograph, so no scrim is needed; the one
  image that carries type in the current build is the pattern being removed.
- No glass, no blur, no frosted panels.
- Dark bands are black, not near-black. The brand's black is absolute.

### 4.3 Typography

**Family.** Poppins, 400 / 500 / 600. Weight 700 exists in the brandbook and in the current
load but is **not used in the public shell**: Hallmark's F19 allows at most three weights across a
page, and 400 body, 500 lede/UI, 600 display gives a wider spread than 500/600/700. The current
stylesheet sets 700 twice; both are reassigned to 600. The root font loader (`src/app/layout.tsx`)
still ships 700 for the admin UI — it is shared, and changing it is out of scope.

**Optional outlier (decision required).** IBM Plex Mono 400/500, one role only: measured values,
spec tables and verification codes. `craft.md` § 1 permits exactly one outlier with one role. If
the brand team prefers a single family, the fallback is Poppins with `font-variant-numeric:
tabular-nums`, which is 90% as good and adds no font.

| Token | Size (clamp) | Line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| `--lx-display-1` | `clamp(2.5rem, 2.2vw + 2.1rem, 4.5rem)` → 40 → 65 → 72 px | 0.98 | 600 | −0.03em | Hero, once per page |
| `--lx-display-2` | `clamp(2.25rem, 1.4vw + 1.9rem, 3.5rem)` → 36 → 50 → 56 px | 1.02 | 600 | −0.03em | Section headings, category names, range verbs |
| `--lx-display-3` | `clamp(1.875rem, 0.9vw + 1.6rem, 2.75rem)` → 30 → 38 → 44 px | 1.08 | 600 | −0.02em | Product names, CTA bands |
| `--lx-title` | `clamp(1.25rem, 0.4vw + 1.15rem, 1.5rem)` → 20 → 24 px | 1.25 | 500 | −0.01em | Card and row titles |
| `--lx-lede` | `clamp(1.125rem, 0.5vw + 1rem, 1.375rem)` → 18 → 21 → 22 px | 1.5 | 400 | 0 | Intro paragraphs, hero sub-line |
| `--lx-body` | `1.0625rem` (17 px) | 1.65 | 400 | 0 | Prose |
| `--lx-small` | `0.875rem` (14 px) | 1.55 | 400 | 0 | Captions, credits, form help |
| `--lx-data` | `0.8125rem` (13 px) | 1.45 | 400/500 mono | 0 | Spec values, codes, table figures |

Rules:

- **Measure:** 62 characters for prose, 44 for a lede in an 8-column block, 28 for a caption.
- **Alignment:** ragged right. Never justified.
- **Wrapping:** `text-wrap: pretty` on body prose. **No `text-wrap: balance` on display heads** —
  Hallmark F3 forbids it, and a balanced display line defeats the deliberate line breaks in the
  hero. Display headings break by composition (an explicit break at wide sizes, natural flow
  below), not by the browser.
- **Numbers:** tabular throughout tables and specs.
- **Case:** sentence case everywhere. Headlines end without full stops, except the brand line
  `Power for what's next.` which keeps its full stop as the wordmark-adjacent signature.
- **No italics.** The brandbook approves roman weights only (400/500/600/700); a synthetic
  oblique is never used for emphasis. Emphasis is 600 weight.

### 4.4 Spacing and grid

| Token | Value | Notes |
| --- | --- | --- |
| `--lx-container` | `1440px` | Outer cap including gutters — Hallmark's canvas |
| `--lx-gutter` | `clamp(20px, 4.5vw, 64px)` | 64 px at 1440, so content is 1312 px |
| `--lx-columns` | `12` | Gap 32 px desktop, 20 px below 768 |
| `--lx-space-1…12` | 4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 112, 144 | 4 px base |
| `--lx-section` | `clamp(48px, 7vw, 112px)` | Matches brandbook 80–112 / 48–64 |
| `--lx-section-tight` | `clamp(32px, 4vw, 64px)` | For bands that follow a full-bleed image |

Grid discipline:

- **Reconciling the two canvases.** Hallmark's canvas is a 1440 px container with 64 px gutters
  (1312 px of content) and twelve 80 px columns with 32 px gaps. The brandbook caps content at
  1280–1360 px. The two agree exactly: a 1440 px container with `clamp(20px, 4.5vw, 64px)` gutters
  gives 1312 px of content — inside the brandbook's range and identical to Hallmark's canvas, with
  no rounding on either side. (The current build runs the same 1440 px container with
  `clamp(20px, 4.2vw, 80px)` gutters, so it gives ~1319 px at a 1440 viewport but only 1280 px once
  the gutter caps — the new token makes the content width constant above 1440 instead of shrinking.)
- Every left edge on the page aligns to column 1; every right edge to column 12.
- Display type spans 6–8 columns, never 12 — the empty columns are the composition.
- Media either spans 4–7 columns or goes full-bleed edge to edge. **No media at 1–2 columns as
  decoration.**
- Hairlines run the full content width, and on key sections extend to the viewport edge (the
  "survey line", § 6.2).

### 4.5 Surfaces and elevation

| Surface | Ground | Border | Shadow |
| --- | --- | --- | --- |
| Page | white | — | none |
| Band | stone or ink | none | none |
| Well (image, product) | stone-deep | 1 px `--lx-line` | none |
| Control | transparent / ink | 1 px | none |
| Sheet (mobile nav, dialog) | white | 1 px | one soft shadow, `--lx-shadow-sheet` |

**No card shadows. No elevation hierarchy.** Depth is expressed by ground colour and hairlines.

### 4.6 Radius and borders

| Token | Value | Applied to |
| --- | --- | --- |
| `--lx-radius-1` | `4px` | Buttons, inputs, product wells |
| `--lx-radius-2` | `8px` | Large media frames, mobile menu panel |
| `--lx-radius-3` | `12px` | Modal sheet only |
| `--lx-hairline` | `1px` | Grid lines, table rules, dividers |
| `--lx-rule` | `2px` | Section-opening rules, active indicators |

Images inside editorial layouts use `--lx-radius-1` or none. Pills, capsules and fully-rounded
chips do not exist in this system.

### 4.7 Iconography

- Line icons, 1.5 px stroke, 20 or 24 px, current colour, `aria-hidden` when decorative.
- Icons only where they clarify: menu, close, chevron in a select, the external-link marker.
- No icon beside every heading. No emoji. No status dots.
- The arrow, when used, is a separate SVG 8 px after the label, translating 2 px on hover.

### 4.8 Motion tokens (CSS, for the non-GSAP layer)

| Token | Value | Use |
| --- | --- | --- |
| `--lx-ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | All entrances and hovers |
| `--lx-ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes that return |
| `--lx-dur-1` | `120ms` | Colour, border |
| `--lx-dur-2` | `220ms` | Underline, press |
| `--lx-dur-3` | `480ms` | Reveal |
| `--lx-dur-4` | `700ms` | Hero line |

GSAP owns orchestration; CSS owns state. They never animate the same property on the same node.

### 4.9 Token architecture

Three layers, per `design-system`:

```css
/* 1. Primitive — brand-approved values only */
--lx-color-red: #CF0A0A;
--lx-color-black: #000000;
--lx-color-white: #FFFFFF;
--lx-color-stone: #F5EDED;
--lx-color-shadow: rgba(0, 0, 0, 0.14);

/* 2. Semantic — purpose */
--lx-action: var(--lx-color-red);
--lx-action-hover: #A80808;
--lx-text: var(--lx-color-black);
--lx-text-muted: #575151;
--lx-surface: var(--lx-color-white);
--lx-surface-alt: var(--lx-color-stone);
--lx-surface-ink: var(--lx-color-black);
--lx-line: #E3D8D8;

/* 3. Component */
--lx-button-bg: var(--lx-action);
--lx-button-fg: var(--lx-color-white);
--lx-nav-active: var(--lx-action);
--lx-well-bg: var(--lx-surface-alt);
--lx-spec-rule: var(--lx-line);
--lx-shadow-sheet: 0 24px 64px var(--lx-color-shadow);
```

Rule: literals appear only in layer 1. Every component reads layer 2 or 3. This satisfies gate 48
and makes a future palette decision a one-block edit.

### 4.10 Data and verification register

The registry is the brand's most distinctive asset, so it gets a typographic rule of its own:

- Codes are set in the data face at 15–17 px, **not uppercase, not tracked** (gate 67).
- A verified result is a `role="status"` line: `Verified` set in red at body size on a 2 px ink
  left rule. Not a green pill, not a checkmark badge, and never a red border.
- Spec tables use a two-column grid: label in `--lx-ink-70` at 14 px, value in the data face at
  15 px, hairline between rows, no zebra striping.

### 4.11 Voice rules

- Sentence case; active voice; second person where the visitor is being asked to do something.
- No superlatives that cannot be evidenced ("leading", "world-class", "cutting-edge").
- Numbers only from the CMS or from a verifiable public source.
- Ellipsis is the single character `…`; quotes are curly.
- Buttons name the action: `Explore solar`, `Verify a model`, `Message LONEX`, not `Learn more`.

---

## 5. Three homepage concepts

Each concept is a complete, genuinely different answer to the same brief. They differ in
composition, posture, motion budget and risk — not just in colour.

---

### 5.1 Concept A — Cinematic Energy

**Idea.** LONEX as a film about power: light, landscape and scale, with type over image.

**Hero composition.** A single full-bleed 16:9 photograph (or a 6–10 s muted loop) of a solar
field at low sun, the horizon placed in the lower third. The headline sits on the left, in the
lower-left quadrant, at 72 px, in white. Under it, one sentence and one red button. The header is
transparent over the image and turns opaque after 80 px of scroll. A thin vertical scroll cue
sits on the left margin.

**Navigation.** Transparent, white type over the hero, five items plus a red `Talk to LONEX`
button. On scroll it becomes a white bar with ink type and a hairline. Mobile: a full-screen
black sheet with 40 px items.

**Typography.** Poppins 600 display at 64–72 px, tight (−0.03em), white. Body 17 px white at 80%
opacity. Captions at 14 px. The large type over photography does most of the work, so the system
can stay spare elsewhere.

**Colour application.** 40% of the first three screens are photographic dark. Red appears only in
the hero button and the active nav item. The content sections below are white with full-bleed
image bands. A final black call-to-action band.

**Homepage section structure.**

1. Full-bleed hero film/still
2. A single statement section: three lines of large type on white, no image
3. Range: three stacked full-bleed image bands, each with the verb in the lower-left, 72 px
4. One product spotlight: a large product on stone, spec list to the right
5. The registry: a black band with the verification field
6. Journal: two full-bleed cards
7. Black closing call

**Photography direction.** Cinematic, wide, low sun, long lens, atmospheric haze, human scale
implied (a figure, a roof, a road). Every image must be a real photograph with a real location.
Colour grade: warm highlights, neutral shadows, no teal-orange.

**Animation direction.** The heaviest of the three. Hero: a 1.4 s image scale from 1.06, a
three-line masked headline reveal, a scroll-linked 20% image parallax; range bands fade and
scale 1.02 → 1; one pinned product moment on desktop. Mobile loses parallax and pinning.

**Desktop layout.** Full-bleed, 12 columns used only for text placement; sections alternate
between edge-to-edge media and a centred text column.

**Mobile layout.** Hero becomes 70 svh with the type bottom-aligned; range bands become 4:5
images with the verb beneath, not over; the pinned product becomes a static two-up.

**Advantages.** Highest emotional impact; instantly communicates scale and ambition; the
photography does the premium work; strongest first impression on a phone.

**Disadvantages.** Depends entirely on photography LONEX does not yet own — the current hero is a
garden array, not a cinematic field. Parallax and pinning are the most expensive motion to get
right and the most likely to feel dated. Product detail is weakest, and the brand's real
differentiator (verification) is buried at section five. Risks the "generic AI solar site" look
if the grade slips.

**Risk: high. Cost: high. Fit to available assets: low.**

---

### 5.2 Concept B — Premium Technology

**Idea.** LONEX as an instrument: a light, precise, measured page where the grid, the spec table
and the registry *are* the brand.

> This is the current build's own direction, completed. Read § 6.6 for the eight things that
> change; the hero composition, ledger, bands and voice are already there.

**Hero composition.** Asymmetric split on white. Left, columns 1–7: the headline `Power for
what's next.` at 65 px, one sentence at 21 px, two actions (a red `Explore the range`, an
underlined `Verify a model`). Right, columns 8–12: a 4:5 photograph of an installation,
bleeding off the right edge of the viewport, top-aligned with the headline, with a hairline
frame on its inner edge only. Beneath the hero, a full-width **spec ledger** of three cells —
`Generate`, `Store`, `Move` — each a link with one line and a hairline above, the row running
edge to edge.

**Navigation.** A single 72 px bar on white with a hairline beneath: wordmark left, five
sentence-case items at 15 px, one red action right. The active category gets a 2 px red
underline. On scroll the bar condenses by translating its contents 4 px and revealing the
hairline — height never changes. Mobile: a right-hand sheet, 88vw, with 24 px items, a hairline
between each, and the red action pinned at the bottom.

**Typography.** Poppins 600 for display at 52–72 px, 400 body at 17 px, 500 for UI and lede.
Data set in the mono outlier at 13–15 px. The contrast between the geometric display and the
mono data voice is the signature. No uppercase anywhere.

**Colour application.** White ground, stone for image wells and one alternating band, black for
exactly two bands (registry and closing call), and red for two things only — the word `next.` in
the hero and a single action per screen (plus the active nav indicator). Ratio approximately
72 / 14 / 10 / 4.

**Homepage section structure.**

1. Header
2. Hero + spec ledger (one screen)
3. **Range**, three full-width rows: `Generate` / `Store` / `Move` at 44–56 px, one sentence,
   one link, image 4 columns alternating sides. No cards.
4. **Featured products**, asymmetric: one 8-column product well with a spec line, two 4-column
   wells stacked at the right, each with a name and one measured value.
5. **Principles** — `Built on what we can verify.` and three commitments in four columns each,
   parted by hairlines, no cards.
6. **The registry** — black band. A statement, the code field, and the three things a code
   proves, separated by hairlines. This is the one dark moment in the middle of the page.
7. **Sellers** — stone band. `Buy from a confirmed seller.` A list of regions, a link.
8. **Journal** — two entries in a 7/5 split, date as `<time>`, no tag.
9. **Closing call** — black, one line, one red action.
10. Footer.

**Photography direction.** Calm, frontal, evenly lit, high-resolution, mostly daylight. Products
photographed on stone or white, square-on, with real shadows. Installations photographed as
architecture: roofs, plant rooms, racks, cable trays, hands with tools. Nothing atmospheric.
Every product image is either real (client-supplied) or a labelled placeholder — never a stock
e-bike presented as LONEX stock.

**Animation direction.** The most restrained. Hero: a four-step entrance — hairline draws from
the left (scaleX), headline rises 24 px with a mask, image settles from 1.04, ledger cells fade
in sequence. Scroll: reveal-once, 16 px, 480 ms, stagger 60 ms, max 6 children. Nav: underline
scaleX on hover, 220 ms. Gallery: 220 ms crossfade. No pinning, no parallax, no scroll-linked
scrub. One dealt moment: the registry band's code field draws its underline as it enters.

**Desktop layout.** 12 columns, 1440 px container, 64 px gutters (1312 px of content). Headlines
in 6–8 columns, always left-aligned, never centred. Media is 4–7 columns in a composition, or
full-bleed. Empty columns are kept empty.

**Mobile layout.** Single column, 20 px gutters. Hero becomes type-first, image second at 4:5
with a caption. The ledger becomes three rows with hairlines. Range rows stack image-above-text
with the verb at 34 px. Product wells go full width, one per row, with the spec line beneath.

**Advantages.** Best fit to the assets LONEX actually has: it looks premium with one good
photograph, honest placeholders and a strong grid. It makes the verification feature — the only
genuinely ownable thing on the site — the visual centrepiece. It degrades gracefully when the
CMS is thin. Lowest motion risk, best performance, easiest to keep accessible. It reads as
*engineering*, which is what a solar and storage importer should read as.

**Disadvantages.** Less immediately emotional than A; the first screen is quieter and relies on
type craft; if the grid and the hairlines are not executed precisely it can look like a
document. It also demands real product photography eventually — the placeholder is honest, but
it is still a placeholder.

**Risk: medium. Cost: medium. Fit to available assets: high.**

---

### 5.3 Concept C — Editorial Corporate

**Idea.** LONEX as a publication: a masthead, a lead story, an index — the company as a
considered point of view rather than a product grid.

**Hero composition.** A magazine front page. A 40 px masthead rule across the top with the
wordmark left and the date right. Below it, a 6-column lead headline at 72 px in the top-left,
a tall 5-column portrait image top-right spanning two thirds of the viewport, and a 3-column
standfirst beneath the headline. The rest of the first screen is white space and one hairline.
No button in the hero — a single text link.

**Navigation.** Two tiers: a slim utility row (Verify, Sellers, Contact) above a masthead row
with the wordmark centred and the three categories left and right of it. On scroll the masthead
collapses into a single sticky row. Mobile: a top bar plus a full-screen index styled like a
contents page, with section numbers in the data face.

**Typography.** The most extreme of the three: display at 72–84 px, lede at 24 px with a
drop-cap opening on the statement, body at 17 px in two columns for long passages, captions at
14 px with a rule above. Pull quotes at 34 px spanning 6 columns.

**Colour application.** Almost entirely white and black — red appears only in the masthead rule,
one link per section and the closing call. Stone is used as the paper tone for one full band.
Dark is rare: one black band for the closing statement.

**Homepage section structure.**

1. Masthead + utility row
2. Lead story hero (as above)
3. A two-column statement with a drop cap and a portrait image
4. Range as an **index**: three numbered rows with the category name, a one-line description, a
   small image on hover/focus, and a hairline between — a contents page, not cards
5. A full-bleed photographic spread with a caption and credit
6. Featured products as a 3-up editorial grid with uneven column spans (4/5/3)
7. Journal: one lead entry with a large image and a list of three shorter entries
8. Closing statement, black, with a single link

**Photography direction.** Documentary and human: installers, rooftops, warehouses, riders in
traffic, hands on a battery terminal. Reportage rather than advertising. Mixed focal lengths,
natural light, real locations. Captions name the place and the work.

**Animation direction.** Near zero. A soft fade on entry, a hairline that draws, one image that
scales 1.02 on the spread. Reading is the experience; motion would interrupt it.

**Desktop layout.** A 12-column magazine grid with an 8/4 lead split, a 3-column index, and
running hairlines. Asymmetry is structural, not decorative.

**Mobile layout.** Single column with the masthead reduced to a rule and the wordmark; the index
becomes a list; the journal becomes a stack; long passages stay single-column.

**Advantages.** The most distinctive and the least like an energy company's website. Ages well.
Excellent for the journal and for trust. Cheapest motion, excellent performance.

**Disadvantages.** Requires editorial content LONEX does not have yet: features, captions,
locations, photography with people. Without them the magazine format exposes emptiness — a
contents page with three items looks sparse, and a drop cap over two sentences looks affected.
It also hides the products, which are the commercial point. Highest content-operations burden.

**Risk: medium-high. Cost: medium. Fit to available assets: low-medium.**

---

### 5.4 Comparison

| Criterion | A · Cinematic | B · Premium Technology | C · Editorial |
| --- | --- | --- | --- |
| Works with today's photography | No | Yes | Partly |
| Works with missing product images | No | Yes (labelled placeholder) | Partly |
| Shows the range clearly | Medium | High | Medium |
| Shows products clearly | Low | High | Medium |
| Owns the verification story | Low | High | Medium |
| Emotional impact | High | Medium | Medium |
| Distinctiveness | Medium (category-generic risk) | High | Highest |
| Motion risk | High | Low | Very low |
| Performance risk | High | Low | Very low |
| Content dependency | High | Low-medium | High |
| Accessibility risk | Medium (text over image) | Low | Low |
| Cost to build | High | Medium | Medium |

---

## 6. Recommended direction

### Concept B — Premium Technology, executed as “the measured page”

### 6.1 Why B

**B is not a proposal to start again.** The current build already has B's skeleton — asymmetric
hero, ledger, black bands, hairlines, Poppins at scale — and it works. Replacing it with A would
throw away a functioning shell for photography that does not exist; replacing it with C would
throw it away for editorial content that does not exist either. B is the only concept that
**finishes** what is there, and the eight deltas that finishing requires are in § 6.6.

Why the completed version wins over A and C:

1. **It is the only concept that is honest about the assets.** LONEX has one usable hero
   photograph and no product photography. B is designed so that a hairline-framed, labelled
   placeholder is a legitimate part of the composition rather than a hole. A and C both need
   pictures they do not have.
2. **It puts the ownable asset in the middle of the page.** Verification is the one thing no
   competitor in this market is doing on their website. In A it is section five under a
   photograph; in C it is a utility link. In B it is the dark band the eye lands on after the
   range — the page's single dramatic moment.
3. **It fits the brandbook without arguing with it.** Four colours, Poppins, 1312 px of content
   inside the brandbook's 1280–1360 target, 52–72 px hero, 4–12 px radius, light-first with
   limited dark blocks. Every constraint in the handoff maps onto B directly. A pushes dark to 40%
   of the fold; C barely uses red at all.
4. **It survives the CMS.** Category copy, product names and specs are all text. B's hierarchy is
   built from type, rules and grid, so a page with three sentences still looks composed.
5. **It is the lowest-risk path to a premium result.** No pinning, no parallax, no carousel, no
   WebGL. Motion is almost entirely reveal-once. That is achievable in the existing stack with GSAP
   already installed, and it will not fight the Next.js App Router.
6. **It reads as engineering, which is the category's actual premium signal.** Solar buyers are
   buying competence: datasheets, tolerances, warranties, traceability. A cinematic site sells
   a feeling; B sells a measurement. LONGi's own product pages are closer to B than to A.

### 6.2 The signature device: the survey line

One device carries the identity across every page, so the site does not need a logo pattern or a
graphic motif:

> **A 1 px hairline that runs from the container's left edge to the viewport's right edge, with a
> 2 px tick 24 px long at the container edge, sitting directly above each section's heading.**

It reads as a surveyor's line or a drawing datum. It is:

- cheap (one pseudo-element),
- responsive (it never wraps),
- non-decorative (it actually separates sections and aligns the eye),
- consistent with the technical register,
- and it replaces the eyebrow: the line performs the "opening" job that the banned label was
  doing, without any type at all.

The tick is set in the text colour — ink on light, paper on dark — never red. Red stays reserved
for the promise word and for action, so the device costs the palette nothing.

The second device is the **spec ledger**: a row of three cells, hairline above each, label at
14 px in subdued ink and a value or link at 17 px — used under the hero, in product cards, and in
the footer. Label and value form a data pair, not an eyebrow: the label names the value beside or
above it, and never announces a heading.

### 6.3 What B borrows, in a scoped way

| From | Borrowed | Scoped by |
| --- | --- | --- |
| A | The hero's image bleed and the 1.04 → 1 settle | One image only; no parallax, no video, no full-bleed dark hero |
| A | The single dramatic band | Exactly one black mid-page band (the registry), plus the closing call |
| C | The index treatment for the range | Three rows with hairlines, not a numbered contents page — numbers would flirt with the eyebrow gate |
| C | The journal's date-and-title typography | Two entries, no drop caps, no pull quotes |

### 6.4 The homepage, screen by screen

| Screen | Content | Layout (12 col) | Motion |
| --- | --- | --- | --- |
| 1 | `Power for what's next.` — `next.` in red — + one sentence + `Explore the range` (red) + `Verify a model` (underline) | Type 1–7, image 8–12 bleeding right, ledger full width beneath | Hairline scaleX, headline mask-rise, image 1.04 → 1, ledger cells fade, total 1.2 s |
| 2 | `Generate` row | Verb 1–4 at 56 px, copy 5–8, image 9–12 | Reveal-once, image 1.02 → 1 |
| 2 | `Store` row | Mirrored: image 1–4, verb 5–8, copy 9–12 | Same |
| 3 | `Move` row | As row one | Same |
| 3 | Featured products | Large well 1–7, two wells 9–12 stacked | Stagger 60 ms, max 3 |
| 3–4 | Principles | `Built on what we can verify.` + three commitments at 4 columns each, hairline above | None |
| 4 | Registry (black) | Statement 1–6, field 8–12, three proof lines under, hairlines between | Underline draw on the field, 420 ms |
| 5 | Sellers (stone) | Heading 1–5, list 7–12 | None |
| 6 | Journal | Lead 1–7, second 9–12 | Reveal-once |
| 7 | Closing call (black) | Statement 1–7, action 9–12 | None |
| 8 | Footer | Mast 1–5, three columns 6–12 | None |

Screens 2 and 3 deliberately break the repeated-tile rule by giving each category a
full-width row with its own composition and alternating image side. Two rows share a screen
number where they sit within the same viewport at 1440; the registry and the sellers band split
across consecutive screens.

### 6.5 Success criteria

- A first-time visitor can name the three businesses and the verification feature after ten
  seconds.
- Red appears at most twice per screen: the promise word and one functional signal.
- One dark band before the footer (the registry) plus the closing call.
- With all photography removed, the page still has hierarchy, rhythm and a complete composition.
- No section opens with type that is not a heading.
- The prompt's banned list is absent: no centred hero with floating cards, no three-card row, no
  gradient or glass, no blob, no decorative dot, no repeated layout on every page.

### 6.6 The eight deltas from today's build

| # | Delta | Where |
| --- | --- | --- |
| 1 | **Remove every heading-adjacent eyebrow**, delete `.site-label` and `Eyebrow` | 18 instances, § 3.1 |
| 2 | **Fix the reveal pipeline** so primary content is visible in the base CSS and in print, with motion additive only | `.site-reveal`, § 8.5 |
| 3 | **Rebuild the range** as three full-width rows with the verb in the layout, no scrim, no type on photographs | home § 6.4, concept § 5.2 |
| 4 | **Codify the red word** as the brand promise and reduce red to two roles | § 4.2, § 6.5 |
| 5 | **Add the survey line** above every section heading, and move the dark band from the seller directory to the verification registry | § 6.2, § 6.4 |
| 6 | **Add the data face** and rebuild specifications as real tables | § 4.3, § 10.1 |
| 7 | **Design the product page** as gallery + spec panel, with designed empty states | § 11.3 |
| 8 | **Replace the photography** and move credits and captions out of the image | § 7 |

Everything else the current build does — the hero composition, the ledger, the black bands, the
footer mast, the red word, the voice — is kept.

---

## 7. Image and photography strategy

**Nothing has been downloaded, generated or modified.** This is a selection plan. No AI imagery:
`design-taste-frontend` and the existing `IMAGE_GUIDE.md` both rule it out, and Hallmark's
imagery hierarchy puts the client's own photographs first.

### 7.1 Principles

1. **Real before beautiful.** A real installation on a real roof beats a perfect stock field.
2. **A subject in every frame.** If the caption cannot say what and where, the image is
   decoration and is cut.
3. **Products are never impersonated.** Stock photographs illustrate *category and context*.
   A product is shown only from a client-supplied or CMS photograph, otherwise a labelled
   placeholder.
4. **One grade.** Warm-neutral, slightly lifted shadows, no teal-orange, no duotone, no heavy
   vignette. The photographs must look like they came from the same afternoon.
5. **Cropping is part of the composition.** Each slot has a named focal area and a mobile crop,
   so a face or a module edge is never cut by a breakpoint.

### 7.2 Current asset audit

| File | Subject | Verdict |
| --- | --- | --- |
| `hero/solar-array.webp` | Garden-scale array at dusk, Phipps Conservatory (CC BY-SA 4.0, Dllu) | Usable as a secondary image or the about page; **not** strong enough for the hero of a premium site. Keep, relegate. |
| `categories/solar.webp` | Utility-scale PV station, public domain (US DOE) | Keep as the Generate row. Good scale, flat light. |
| `categories/storage.webp` | Containerised storage at Beech Ridge (CC BY-SA 4.0) | Keep as the Store row. Reads as infrastructure, which is correct. |
| `categories/mobility.webp` | Cyclists in Amsterdam (CC BY-SA 4.0) | Weak for an e-bike brand: no product, no e-bike, wrong market. Replace. |
| `about/storage-room.webp` | Battery racks inside a facility (CC BY-SA 4.0) | Keep for About. Strong, specific, technical. |

### 7.3 Slot map

| # | Page / slot | Ratio | Shot brief | Suggested source | Licence | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Home hero | 4:5 desktop, 4:3 mobile | A large ground-mounted or rooftop array in strong directional light, with a clean uncluttered region at the top so the 4:5 and 4:3 crops both survive; no people; horizon low | Commissioned (preferred) or Unsplash | Commission: LONEX owns; Unsplash: free commercial | Current `categories/solar.webp`, re-cropped |
| 2 | Home — Generate row | 3:2 | Array at human scale: a technician's ladder, a roof edge, a junction box — proof that this is installed | Unsplash / Pexels | Free commercial | `categories/solar.webp` |
| 3 | Home — Store row | 3:2 | Wall-mounted residential battery in a clean utility room, or a rack room with tidy cabling | Commissioned / Unsplash | As above | `categories/storage.webp` |
| 4 | Home — Move row | 3:2 | An electric bike, side-on, in a street that reads as South Asian; rider optional | Commissioned / Pexels | As above | Labelled placeholder, not the Amsterdam cyclists |
| 5 | Product wells (×3) | 4:5 | The actual product, square-on, on stone or white, soft shadow | **Client photography only** | — | Labelled placeholder (`Product image pending`) |
| 6 | Registry band | none | Typography only; no image | — | — | — |
| 7 | Sellers | none | Typography and hairlines | — | — | — |
| 8 | Journal lead | 3:2 | Whatever the entry is about; never generic panels | CMS | — | Omit the image, keep the text |
| 9 | Category hero — Solar | 16:9 | A wide array; the name sits beneath the image, so the frame only needs one strong horizon and no text-safe zone | Unsplash / Wikimedia | Free / CC BY-SA | Current solar image |
| 10 | Category hero — Store | 16:9 | Rack room perspective, or a domestic wall unit | Commissioned / Unsplash | Free | `categories/storage.webp` |
| 11 | Category hero — Move | 16:9 | E-bike in motion, panning blur, city | Pexels | Free | Placeholder |
| 12 | About | 3:2 or 4:5 | The team, the warehouse, a delivery, a site visit — real people | **Client photography** | — | `about/storage-room.webp` |
| 13 | Contact | none | Map only if the address is real and public | — | — | No map |
| 14 | Product detail gallery | 4:5 ×4 | Front, detail, label, in-situ | **Client photography** | — | One labelled placeholder |

### 7.4 Source shortlist

| Source | What it is good for | Licence position | Action before use |
| --- | --- | --- | --- |
| **Commissioned shoot (recommended)** | Hero, products, team, installation | LONEX owns the images outright | Brief in § 7.5; one half-day locally covers 1, 3, 5, 12 |
| **Unsplash** | Installation context, rooftops, storage rooms | Unsplash License: free commercial use, no attribution required, cannot be sold unmodified or used to imply endorsement | Confirm on the individual photo page; keep a record of the URL and photographer |
| **Pexels** | E-bike and mobility context, installers | Pexels License: free commercial use, no attribution required, no endorsement implication | Same |
| **Wikimedia Commons** | Infrastructure and public-domain institutional photography | Per file: public domain or CC BY-SA 4.0 (attribution + share-alike) | Already used and credited in the footer and `ASSET_SOURCES.md`; keep the table current |
| **Client CMS library** | Products, category covers | Client-owned | Photograph before the product pages go live |

**Do not use:** AI-generated imagery; images that imply a LONEX product; images of a different
market presented as local work; watermarked previews; Pinterest or Google Images.

### 7.5 Commissioned shoot brief (one page)

- **Deliverables:** 1 hero (4:5 and 16:9 crops), 3 category images (3:2), 3+ product images
  (4:5, on stone), 4 detail images (label, terminal, connector, mount), 3 team/warehouse images.
- **Light:** open shade or late afternoon. No direct midday sun on white panels.
- **Framing:** compose for a 4:5 and a 3:2 crop from the same frame; keep the subject off the
  extreme edges so both crops hold.
- **People:** hands and backs of heads preferred over posed portraits; no identifiable customer
  property without written permission.
- **Colour:** neutral white balance; no filters in camera; deliver RAW plus graded JPEG.
- **Rights:** full buyout, web and print, no time limit.

### 7.6 Treatment, credit and alt text

- Convert to WebP (quality 82), long edge as specified per slot, strip EXIF.
- Serve through `next/image` with explicit `width`/`height` or a sized `fill` container; hero is
  `priority`, everything below the fold is lazy.
- CC BY-SA images are credited in the **footer colophon** and in `ASSET_SOURCES.md`, not under the
  image: a credit caption beneath a stand-in is explicitly gate 66 decoration. A `<figcaption>` is
  used only when it carries a fact about the subject — the place, the installation, the date — and
  it sits beneath the image as small text with a rule above, never as a centred italic line.
- Alt text describes the subject and the place, not the mood.

---

## 8. GSAP motion strategy

GSAP 3.15.1 and `@gsap/react` 2.1.2 are already installed. **No new packages.**

### 8.1 Principles

1. **The page is complete without JavaScript.** Every reveal is visible by default in CSS; GSAP
   only adds the entrance. This is also Hallmark's static-end-state rule.
2. **Motion explains structure, never decorates it.** A line draws because it is a rule; an
   image settles because it arrived.
3. **Transform and opacity only.** No `width`, `height`, `top`, `left`, no layout animation.
4. **One pattern family per page:** reveal-once. No scrub, no pin, no progress bar.
5. **Nothing moves under the reader's eye.** No parallax on text, no scroll-linked prose.
6. **Motion is interruptible and short.** 120–700 ms; nothing longer than 1.4 s total on load.

### 8.2 Architecture

- A single client module per surface (`HeroMotion`, `RevealGroup`, `NavMotion`, `GalleryMotion`),
  each using `useGSAP(fn, { scope: ref })` so cleanup is automatic.
- `gsap.registerPlugin(ScrollTrigger, useGSAP)` once, in the motion module — never at module
  scope in a server component.
- No GSAP import in any server component; motion modules are the only `"use client"` leaves.
- All breakpoints and reduced-motion branches go through `gsap.matchMedia()`, not `window.innerWidth`.
- `ScrollTrigger.refresh()` after `document.fonts.ready` and after the hero image loads, so
  triggers do not fire at the wrong offsets.
- Motion is loaded per page, not globally: the homepage bundle does not ship the gallery code.

### 8.3 Per surface

| Surface | Animation | Spec | Mobile | Reduced motion |
| --- | --- | --- | --- | --- |
| **Hero entrance** | Survey line draws; headline lines rise inside a mask; lede and actions fade; image settles | `scaleX 0→1` 420 ms; each line `yPercent 110→0` 700 ms `expo.out`, stagger 80 ms; image `scale 1.04→1` 1.2 s; copy `y 12→0, opacity 0→1` after 240 ms | Same, stagger 40 ms, image 1.02 | Final state immediately; a single 150 ms opacity on the whole hero, or none |
| **Navigation** | Active underline `scaleX`; bar hairline appears after 24 px; wordmark scales to 0.96 | 220 ms `--lx-ease-out`; hairline opacity 120 ms; no height change | Sheet slides `x 100%→0` 320 ms; backdrop opacity 200 ms; `Escape` closes; focus trapped | No slide; sheet appears instantly |
| **Scroll reveals** | Section children fade up once | `ScrollTrigger.batch`, `y 16`, 480 ms, stagger 60 ms, `once: true`, `start: "top 88%"`; max 6 children | Identical | Opacity only, 150 ms, or instant |
| **Image reveals** | Wrapper clips: image `scale 1.03→1` + opacity while the wrapper stays put | 600 ms, once | 1.01 | Instant |
| **Product gallery** | Crossfade between main images; thumb indicator is a 2 px ink rule | 220 ms opacity; no image hover zoom (gate 11) | Swipe with a visible thumb rail; no drag-only interaction | Instant swap |
| **Category transitions** | None at the page level. On the range rows, the link's underline draws and the row's hairline thickens | 220 ms | No hover states; the row's link label is always visible | None |
| **Micro-interactions** | Button background 120 ms; arrow 2 px translate; input border 120 ms; focus ring instant (gate 15) | CSS only | Same | Same |
| **Registry band** | The code field's underline draws once on entry; the result appears with a 200 ms fade and `aria-live="polite"` | 420 ms `scaleX` | Same | Instant |

### 8.4 Explicitly not animated

- Page transitions. The App Router navigation is fast; a fade would add latency and break the
  back button's perceived speed.
- Text on scroll. No per-character splits, no headline scrubbing, no SplitText.
- Number counters. Nothing on the site is a metric that deserves count-up.
- Hover zoom on photography. There is none today; the rule is recorded so it is not introduced.
- Cursor followers, magnetic buttons, tilt cards, marquees.
- The footer, the journal excerpts, the forms.

### 8.5 Reduced motion and no-JS

- `@media (prefers-reduced-motion: reduce)` in CSS sets every reveal to its final state.
- `gsap.matchMedia()` has a `reduce` branch that sets final values and returns early.
- The `matchMedia` context is reverted on unmount and on breakpoint change.
- With JavaScript disabled, the CSS alone renders the full page: no opacity-0 defaults outside a
  `@media (scripting: enabled)` guard, or a `.js` class applied by the motion module.
- Use `gsap.from()` — which writes its start values only when it runs — rather than a CSS
  `opacity: 0` for any JS-driven reveal. The no-JS state is then the finished state.
- The same holds for print and for full-page capture: no primary content may depend on scroll
  position to become visible (the failure in § 0, item 1).

### 8.6 Performance rules

- Animate only composited properties; never `will-change` on more than the hero image and the
  mobile sheet while they are active.
- Batch triggers; no per-element `ScrollTrigger` in a loop.
- `quickTo()` for any pointer-driven value (there are none planned, but the rule stands).
- Kill triggers on route change via `useGSAP` cleanup; `ScrollTrigger.getAll().forEach(t => t.kill())`
  is never needed if scoping is correct.
- Budget: hero entrance ≤ 1.4 s, total main-thread animation work < 60 ms per scroll frame.

---

## 9. Responsive strategy

### 9.1 Breakpoints

| Name | Range | Grid | Gutter | Notes |
| --- | --- | --- | --- | --- |
| xs | 320–479 | 4 col equivalent, single flow | 20 px | Minimum supported; test at 320 |
| sm | 480–639 | single flow | 20 px | Large phone |
| md | 640–767 | 6 col | 24 px | Phablet / small tablet |
| lg | 768–1023 | 8 col | 32 px | Tablet portrait; nav still a sheet |
| xl | 1024–1279 | 12 col | 40 px | Desktop nav appears |
| 2xl | 1280–1439 | 12 col, container full width | 4.5vw | Primary design target |
| 3xl | 1440–1919 | 12 col, container 1440, content 1312 | 64 px | Gutters cap, content holds |
| 4xl | 1920+ | 12 col, container 1440, content 1312 | 64 px | Content stays 1312 |

### 9.2 Behaviour by element

| Element | 320–767 | 768–1023 | 1024+ |
| --- | --- | --- | --- |
| Header | 56 px bar, wordmark + menu button | 64 px, wordmark + menu | 72 px, full nav |
| Hero | Type first, image 4:5 below, ledger as 3 rows | 6/6 split | 7/5 split with right bleed |
| Range rows | Image above, verb 34 px, copy below | 6/6 alternating | Verb 44–56 px, 3-part row |
| Product wells | 1 per row | 2 per row | Category page 3 / 2 / 1; home 1 large + 2 stacked |
| Spec table | 2 columns, label above value | 2 columns | 2 columns, wider label column |
| Gallery | Swipe + thumb rail below | Main + thumbs right | Main 7 col + thumbs, panel 5 col sticky |
| Journal | Stack | 2-up | 7/5 |
| Footer | Mast, then 3 stacked columns | Mast + 2 columns | Mast + 3 columns |
| Section spacing | 48–64 px | 64–80 px | 80–112 px |

### 9.3 Type and touch

- Display type clamps; it never steps abruptly at a breakpoint.
- Minimum body 17 px; minimum tap target 44 × 44 px with 8 px separation.
- Line length never exceeds 62ch; on 320 px the measure is naturally ~34ch, which is fine.
- `text-wrap: pretty` on prose; no `text-wrap: balance` on display heads (Hallmark F3), so
  headings are broken by composition.
- Safe areas: `env(safe-area-inset-*)` on the mobile sheet and the sticky bottom action.

### 9.4 Testing matrix

Viewports: 320, 375, 390, 414, 768, 1024, 1280, 1440, 1920. Plus: zoom 200%, landscape phone,
`prefers-reduced-motion`, keyboard only, screen reader (NVDA or VoiceOver), slow 4G throttling.
Acceptance: no horizontal scroll at any width, no clipped focus rings, no text over a busy part
of an image, no layout shift when fonts load.

---

## 10. Component design strategy

### 10.1 Inventory

| Component | Anatomy | States | Notes |
| --- | --- | --- | --- |
| `SiteHeader` | Wordmark · nav links · action · hairline | default, scrolled, open (mobile), current page | Keeps the existing CMS-driven links; adds a visible current state |
| `NavSheet` | Backdrop · panel · links · action | closed, opening, open, closing | Focus trap, `Escape`, scroll lock, `overscroll-behavior: contain` |
| `Button` | Label, optional separate SVG glyph | default, hover, active, focus-visible, disabled | 4 px radius; one red primary per screen; no icon-only without an accessible name |
| `TextLink` | Label + rule | default, hover, focus-visible, visited | The rule grows from the left; no arrow character |
| `SurveyLine` | 1 px rule + 2 px tick in the text colour | static | Identity device; pure CSS; never red |
| `SectionOpening` | Survey line + heading (+ optional lede) | static | Gate-54-safe by construction |
| `Hero` | Copy block · media · ledger | — | Two compositions: split and stacked |
| `RangeRow` | Verb · copy · link · media | default, hover/focus (row) | Alternating; the whole row is one link |
| `ProductWell` | Media frame · name · one spec | default, hover (container), placeholder | Placeholder is a first-class state, not a fallback. One component for both the home's asymmetric 8/4 arrangement and the category page's 3 / 2 / 1 grid; only the span changes |
| `SpecTable` | `<table>` with `<caption>` | static | Real table semantics; `<th scope="row">` |
| `Gallery` | Main frame, thumb rail | default, active thumb, loading, error | Keyboard arrows; `aria-selected`; no hover zoom; no `01 / 4` counter (gate 66) |
| `VerifyForm` | Label · input · submit · result | idle, typing, loading, verified, not found, error | `aria-live`, focus moves to the result, code not tracked |
| `SellerList` | Region heading + rows | default, empty | Empty state is honest: "No sellers listed for this region yet." |
| `JournalCard` | Media · `<time>` · title · excerpt | default, hover (container) | No tag pill, no category chip |
| `CtaBand` | Statement · action · ground | static | Ink ground only; red is never a band |
| `Footer` | Mast · 3 columns · credits · legal | static | Credits are a real list, not fine print in grey on black |
| `Field` | Label · control · help · error | default, focus, invalid, disabled | Label always visible; no placeholder-as-label |
| `MediaPlaceholder` | Frame · short line · optional label | static | `Product image pending`, set at 14 px, sentence case |
| `Breadcrumb` | `<nav>` + ordered list | static | Used at product level only |
| `PageIntro` | Heading · lede · hairline | static | The standard secondary-page opening |

### 10.2 What is removed

- The `.site-label` utility, the `Eyebrow` component, the `SectionHeading.eyebrow` prop and every
  heading-adjacent call site — 18 of them, listed in § 3.1.
- The tracked uppercase code field (gate 67).
- Card shadows and elevation tokens: none are introduced.
- Image zoom on hover: specified in `IMAGE_GUIDE.md` § 6 but never implemented; the guide is corrected rather than the behaviour added.
- The tiled range: three photographs with a gradient scrim and type on top.
- The three-equal-card seller tiles, including the initial-monogram square and the `01` index
  numbers — the list ranks by nothing, so numbering it is a false hierarchy.
- Pill-shaped tags and chips.
- Arrow characters glued to link text (gate 63).
- The second family: Inter is the current body face, and the public shell moves body to Poppins.
  The loader stays for the admin; only the site's `--site-font-body` changes.

### 10.3 Component rules

- Every interactive component has a visible `:focus-visible` ring (2 px ink, 2 px offset; white
  on ink grounds), applied instantly.
- Hover states change exactly one signal.
- No component reads a literal colour or font.
- Every component works with a 320 px width, 200% zoom and keyboard only.
- Empty, loading and error states are designed, not defaulted.

---

## 11. Page-by-page redesign direction

Every page below deletes its eyebrow labels (the 18 instances in § 3.1) and opens with its heading,
a captioned image, or a rule. The individual notes do not repeat that instruction.

### 11.1 Home

**Job:** route a visitor into the range, establish competence, and surface verification.
**First screen:** the B hero (§ 6.4).
**Structure:** hero + ledger → three range rows → featured products (asymmetric) → principles
(three commitments, no cards) → registry (black) → sellers (stone) → journal → closing call →
footer.
**Copy:** keep `Power for what's next.` (with `next.` in red), `A code confirms the model. Not the
unit.`, `Built on what we can verify.`, `Buy from a confirmed seller.`,
`Talk to LONEX about what's next.` The current writers earned these. Remove the eyebrow
`What the registry holds` and let the heading do the announcing.
**Imagery:** slots 1–4 and 8.
**Motion:** hero entrance, reveal-once, no pinning.
**Mobile:** the ledger becomes three rows; range rows stack; products one per row.

### 11.2 Category page (`/solar`, `/categories/batteries`, `/categories/ev-bikes`)

**Job:** convince that this category is real, and hand the visitor to a product.
**First screen:** a 16:9 category image, full-bleed, with the category name at `display-2` set
**beneath** it against the page, not over it, with one sentence of category copy and a spec
ledger of what the category covers. No text on the photograph: the image is the subject, the
type is the caption.
**Structure:** category hero (image, then the name and one sentence) → product list as a **3 / 2 / 1
grid of flat wells** (hairline frame, name, one measured line, link) — the brandbook's count, with no
card shadow, no rounded tile and no hover zoom → "how we select" editorial block (two columns,
honest about sourcing) → registry teaser (hairline band, not black) → related categories → closing
call.
**Imagery:** slots 9–11, plus product wells.
**Motion:** image reveal, well reveals once.
**Mobile:** hero image 4:3 with the name beneath; the 3 / 2 / 1 grid becomes one well per row.

### 11.3 Product page (`/solar/lonex-p1-bd-650`)

**Job:** give the buyer enough to enquire, and prove the unit is traceable.
**First screen:** 7/5 split. Left, the gallery (4:5 main + thumb rail). Right, a sticky panel:
product name at `display-3` with nothing above it — the category is already in the breadcrumb —
one line, price if published (otherwise `Price on request`), four key specs in the data face, the
primary action (red, `Message LONEX`), the secondary (`Verify this model`), and a
shipping/availability line only if the CMS has one.
**Structure:** gallery + panel → full specification table (`<caption>`, `<th scope="row">`) →
description (rich text, 62ch) → what the code proves (registry block) → related products →
closing call.
**Imagery:** real product photography only; otherwise one labelled placeholder and no invented
gallery.
**Motion:** gallery crossfade only.
**Mobile:** gallery first, then name, price, specs, actions in that order — the sticky panel
becomes a static block with a sticky bottom action bar.

### 11.4 About

**Job:** explain who LONEX is without inventing a history.
**Structure:** statement at `display-1` in 8 columns → one portrait image with a caption →
`What we do` in three short paragraphs across two columns → sourcing and seller network →
journal link → closing call.
**Imagery:** slot 12. Keep `about/storage-room.webp` as the technical anchor.
**No timeline** unless the dates are real and supplied; a fake milestone list is worse than none.

### 11.5 Contact

**Job:** start a conversation.
**Structure:** heading + one line → split: form (7 col) and real details (5 col: phone, WhatsApp,
email, address, hours). No map unless the address is public and exact. No "we'll get back to you
within 24 hours" unless that is true.
**Form:** name, email or phone, message, category select (optional). Labels visible, inline
errors, success state announced with `aria-live`.

### 11.6 Verify

**Job:** prove a product is genuine.
**Structure:** heading, one sentence explaining what a code is and where to find it → the field
(large, 20 px, data face, no uppercase) → result block → "what a valid result means" in three
short paragraphs separated by hairlines. No three-step icon row.
**States:** idle, checking, verified (`Verified` in red on an ink rule, plus product and seller),
not found, error (retry guidance), and rate-limited.
**Motion:** underline draw on entry; result fades 200 ms.

### 11.7 Authorised sellers

**Job:** tell a buyer where it is safe to buy.
**Structure:** heading + a plain statement of the rule → list grouped by region, each with name,
city and contact → empty state → how to report an unauthorised seller.
**No logo wall.** No "trusted by" strip. The list itself is the proof.

### 11.8 Journal index and post

**Index:** an editorial list, not a card grid. Each row: `<time>` in the data face, title at
`--lx-title`, one-line excerpt, hairline. Lead entry gets an image. Pagination as text links.
**Post:** 62ch measure, `display-2` title, date and author as a byline, one lead image with a
caption, generous paragraph spacing, pull quotes at `display-3` spanning 8 columns, related
entries at the end. No share-button row, no reading-progress bar.

### 11.9 Utility and edge pages

- **404:** one line, two links (home, range). No illustration.
- **Search / empty states:** the state is stated plainly, with the next action.
- **Legal / privacy:** a single 62ch column, real headings, dated.
- **Skip link:** visible on focus, first in the tab order.
- **Loading:** skeletons only where content genuinely streams; otherwise nothing.

---

## 12. Implementation roadmap

No phase begins until this document is approved.

### Phase 0 — Approval and prerequisites (1–2 days, mostly client-side)

- Approve the direction (B), the signature device, and the one Hallmark waiver.
- **Diagnose the blank sections first** (item 1 in § 0): confirm whether the cause is the view-timeline
  reveal or lazy images, and fix it before any visual QA, or every review will be unreliable.
- Decide the data face: IBM Plex Mono for specs and codes, or Poppins tabular-nums only.
- Confirm photography: commission date, or approve the placeholder policy for launch.
- Confirm which CMS fields exist: price, specs, availability, category intro, seller regions.
- Content audit: remove the eyebrow, fix the code field, decide the fate of the Amsterdam image.
- Correct `IMAGE_GUIDE.md` § 6, which still claims a hero parallax, a hover lift and a 1.055× image
  zoom that the build does not have — and must not gain (§ 3.4, gate 11).

**Exit:** written approval and a photography decision.

### Phase 1 — Tokens and shell (3–4 days)

- Add `--lx-*` tokens in a new token layer, scoped to the public shell.
- Rebuild `SiteHeader`, `NavSheet`, `SiteFooter`, `Container`, `SurveyLine`.
- **Delete the eyebrow pattern at all 18 instances** and the `.site-label` utility — markup-neutral,
  content-identical.
- Fix the reveal pipeline: finished state in the base CSS, motion additive.
- Typography and colour pass only; no new page composition yet.
- Verify gate 48 (tokens only), gate 67 (no uppercase anywhere), focus rings.

**Exit:** every public page renders with the new shell and no visual regressions to navigation.

### Phase 2 — Home (4–5 days)

- Hero + ledger, range rows, featured products, registry band, sellers, journal, closing call.
- Mobile composition first for the hero, then desktop.
- Replace the tiled range with the three rows.

**Exit:** home passes the § 6.5 success criteria at 320/768/1280/1440.

### Phase 3 — Category and product (4–5 days)

- Category hero, product wells, editorial block, registry teaser.
- Product gallery and sticky panel, spec table, placeholder state.
- Verify real CMS data flows (no mock data in the build).

**Exit:** all three categories and three sample products render with and without images.

### Phase 4 — Secondary pages (2–3 days)

- About, Contact, Verify, Sellers, Journal index and post, 404, legal.

**Exit:** no page still uses the old card or label patterns.

### Phase 5 — Motion (2–3 days)

- Motion modules with `useGSAP`, `matchMedia`, reduced-motion branches.
- Hero timeline, reveal batching, gallery crossfade, nav underline, sheet.
- No-JS check: disable JavaScript and confirm the page is complete.

**Exit:** motion budget met; 60 fps on a mid-tier Android; reduced-motion parity verified.

### Phase 6 — QA and launch (2–3 days)

- Hallmark walk: gates 54, 63, 67 by inspection; 10a, 11, 12, 15, 18 by inspection; stamp written
  into the new CSS.
- Vercel Web Interface Guidelines review: focus-visible, labels, `alt`, heading order, image
  dimensions, `text-wrap`, hydration, touch targets, `prefers-reduced-motion`.
- Accessibility: keyboard sweep, screen reader on home/product/verify, 200% zoom, contrast check
  of every red-on-light and white-on-red pair.
- Performance: LCP ≤ 2.5 s on slow 4G, CLS < 0.05, no layout shift on font swap, hero image
  priority, everything else lazy.
- SEO: titles, descriptions, canonical, JSON-LD unchanged or improved; no route changes.
- Regression: forms, verification, seller links, WhatsApp, journal pagination, redirects.

**Exit:** sign-off checklist complete.

### 12.1 Estimate

| Phase | Working days |
| --- | --- |
| 0 Approval and prerequisites | 1–2 (client-dependent) |
| 1 Tokens and shell | 3–4 |
| 2 Home | 4–5 |
| 3 Category and product | 4–5 |
| 4 Secondary pages | 2–3 |
| 5 Motion | 2–3 |
| 6 QA and launch | 2–3 |
| **Total** | **18–25 working days** |

Excludes the photography commission and any CMS field additions.

### 12.2 Risks

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| No product photography by launch | High | Medium | Placeholder is a designed state, not a hole; the site is honest and still complete |
| Specs missing from the CMS | High | Medium | Spec tables render only what exists; "Specifications" is omitted rather than filled |
| Brand team rejects the Poppins gate-1 waiver | Low | High | Documented evidence in § 3.5; if rejected, the display face must change brand-wide — a decision above this project |
| The mono outlier is refused | Medium | Low | Poppins tabular-nums fallback is pre-approved in the token plan |
| Scope creep into the admin or CMS | Medium | High | Out of scope by definition; any schema change is a separate engagement |
| Motion causes jank on low-end Android | Medium | Medium | Reveal-once only, transform/opacity, test on a real mid-tier device |
| Reveal-on-scroll leaves primary content invisible | High | High | Base CSS shows the finished layout; motion is additive; test with JS off, in print, and in a full-page capture |
| SEO regression during the rebuild | Low | High | No route, title or schema changes; old URLs preserved; redirects untouched |

### 12.3 Definition of done

- Every page passes the Hallmark floor, with exactly one recorded waiver.
- Gates 54, 63 and 67 pass by inspection: no eyebrow, no middle dots or glued arrows, no
  uppercase or tracking at 15 px or under.
- WCAG 2.2 AA: contrast, focus, labels, keyboard, reduced motion, target size.
- No horizontal scroll from 320 to 1920; no clipped focus rings; 200% zoom usable.
- LCP ≤ 2.5 s, CLS < 0.05, no console errors, no hydration warnings.
- The page is complete and readable with JavaScript disabled, and primary content is visible in
  the base CSS, in print, and in a full-page capture.
- No dependency added; no CMS or database change.
- The design is recognisably LONEX and not interchangeable with another solar site.

### 12.4 Decisions needed from you

1. **Direction:** approve B, or ask for A/C.
2. **Data face:** IBM Plex Mono for specs, or Poppins only.
3. **Photography:** commission the shoot, or launch with placeholders and real category photos.
4. **Red:** keep it to the promise word plus one functional signal (recommended), or allow it as a
   full band.
5. **Dark bands:** two (registry + closing), or one.

---

## Closing: the strongest recommended concept

**Concept B — Premium Technology, executed as "the measured page".**

A light-first, 12-column, hairline-ruled page where Poppins carries scale and the data face
carries proof; where the three businesses are three full-width rows rather than three cards;
where the product page is a gallery beside a spec panel; and where the single black band in the
middle of the homepage belongs to the verification registry — the one thing LONEX can prove and
its competitors cannot.

It is recommended because it is the only concept that looks premium with the photography LONEX
actually owns, stays honest while the CMS is thin, respects every line of the brandbook, needs no
new dependency — and because it is the direction the current build already chose. Finishing a
good direction is a stronger move than replacing it, and it gives the brand one memorable device,
the survey line, instead of a decoration.

Nothing in this document has been implemented. Awaiting approval before any source file changes.

---

## 13. Approved brief (10 November 2026)

The client approved a **full visual transformation**, not an incremental completion of the old
design. Concept B's light-first premium aesthetic remains the base, but the constraint "this is
the direction the current build already chose" no longer applies. The following decisions are
now settled and supersede the corresponding planning text above:

1. **Scope.** The public site is being rebuilt page by page. Backend, CMS schema, admin
   dashboard and authentication are untouched. All CMS queries, metadata and redirects are
   preserved on every rebuilt route.
2. **Photography.** Curated stock is downloaded locally into `public/images/v2/`, graded in
   `scripts/fetch-photos.mjs`, and credited in `ASSET_SOURCES.md` and the footer. No remote
   image URLs are requested at runtime. Stock is never presented as a LONEX product.
3. **Product imagery.** Where the CMS holds no approved product photograph, the page shows a
   designed model record and typographic rows — never an empty image well.
4. **Red.** Two roles only: a promise word and one functional signal per view. The PDF tag,
   eyebrows and decorative marks are ink, not red.
5. **Dark bands.** Two per long page: the model registry and the closing action. Short inner
   pages close on the inherited dark band.
6. **Data face.** IBM Plex Mono carries specifications, model codes, prices and figures.

### 13.1 Implementation status

| Route | Status | Notes |
| --- | --- | --- |
| `/` | Rebuilt | New hero, three range chapters, story, typographic model rows, registry, sellers, journal, closing. Motion in `home-motion.tsx`. |
| `/[categorySlug]` | Rebuilt | Editorial hero, category figure, typographic product index, dark close. |
| `/[categorySlug]/[productSlug]` | Rebuilt | Model-record panel when no imagery exists, spec index, datasheets, registry band. |
| `/blog` | Rebuilt | Editorial index rows, pagination, dark close. |
| `/blog/[slug]` | Rebuilt | Article head, 16:7 cover, 3/7 split body column, v2 rich-text typography. |
| `/about` | Rebuilt | Type-led hero, storage photograph, story split, principles and values grids, business-model rows, dark market-context band, dark close. |
| `/verify` | Rebuilt | Type-led hero, hairline form, three-step aside, FAQ accordions, dark close. |
| `/contact` | Rebuilt | Contact rows as definition lines, enquiry guide aside, dark close. |
| `/authorized-sellers` | Rebuilt | Seller directory as full-width row records, city chips, dark close. |
| `not-found` | Rebuilt | Type-led 404 with a typographic link index. |
| `/admin/*` | Untouched | Explicitly out of scope. |

Shared v2 primitives live in `src/app/home.css` under `.lx-page`; the public shell keeps
`site.css`. A CSS-only route transition lives in `src/app/(site)/template.tsx`.

The implementation deviates from this document in one place: the homepage hero is type-led with
the photograph as a horizon band rather than the split hero sketched above. That change was made
after review, because it gives "Power for what's next." the scale the brand needs and keeps the
homepage distinct from the category template.

### 13.2 Content cleanup

Test material was removed from the public site without deleting any database row:

- The `www` blog post was set to `draft` (`scripts/unpublish-test-post.ts`). Two real journal
  articles were published in its place (`scripts/seed-journal.ts`).
- The stray `Car` category was set to `draft` (`scripts/unpublish-test-category.ts`), so it no
  longer appears in the header, footer or sitemap. An administrator can republish it.
- Product pages without an approved photograph render a model record rather than an empty image
  well. Stock photography is never labelled as a LONEX product.

Red is used in two roles only: the promise word in a page title and a single functional signal
(a button or result mark) per view.


---

*Prepared as a planning artefact. Reference analysis of longi.com is descriptive and critical;
no LONGi layout, copy, artwork or claim is reproduced. Photography candidates are listed by
brief and source only — no image has been downloaded, generated or modified.*

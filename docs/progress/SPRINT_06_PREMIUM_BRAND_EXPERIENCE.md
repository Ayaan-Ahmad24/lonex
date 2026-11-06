# Sprint 06 — Premium Brand Experience

Status: **implemented and QA-verified for the available content; not cleared for public launch while client content, assets and deployment checks remain outstanding.** No commit, stage or deploy was performed.

## 1. Sprint Objective

Transform the LONEX public website into a premium, cinematic, editorial luxury experience across every public page: brand-led composition, restrained motion, deliberate mobile layouts and verified responsive behaviour, without weakening authentication, RBAC, admin modules, price-visibility rules, media delivery, audit logging, SEO, redirects or any existing uncommitted work.

The site must remain LONEX-specific and custom-coded. No page builder, no generic multi-client CMS and no invented brand claims.

## 2. Handover State

- Public design system and all public pages have been built/rewritten and verified.
- The production build succeeds with 39 routes.
- TypeScript, ESLint, Vitest, Playwright and Drizzle checks pass.
- Responsive screenshots were captured at 320, 375, 768, 1024 and 1440 px, inspected, and show no horizontal overflow or console errors.
- Hidden-price and draft-content security probes pass: no hidden numeric price, no JSON-LD `offers`, no draft product/category/article or inactive seller leaks into public HTML or the sitemap.
- No real client content or imagery has been supplied. The site therefore shows honest, clearly labelled empty states rather than stock photography or invented copy.
- Working tree is uncommitted. Sprint 01/02/03 work and Sprint 06 work are interleaved in the same uncommitted tree and were preserved.

Handover verdict: **code-complete and QA-verified; content-blocked and not launch-approved.**

## 3. Brand Identity Analysis

- Official palette: red `#CF0A0A`, black `#000000`, white `#FFFFFF`, warm grey `#F5EDED`.
- Typography: Poppins as the primary display/body face, Inter as the supporting text face.
- Logo: official LONEX mark, sourced from `public/logo.png` / `final logo.png` (identical files, SHA256 `36A2AC678BCCDDADC45390211812386A6C63A60470E32DA544BF3EFB38FB1283`).
- Brand phrases: “Power for What's Next.” and “Energy That Moves Life Forward.”
- Business position: Pakistan-based importer, distributor and dealership business. LONEX is **not** described as a manufacturer.

## 4. Existing Design Audit

The pre-Sprint-06 public site was functional but visually generic: a conventional hero, limited hierarchy, repeated card patterns, no coherent motion system and no deliberate mobile composition. Content and security plumbing were already present and working.

The audit also confirmed that the public read model, price gate, media route, SEO helpers and draft filtering had to remain untouched in behaviour. Sprint 06 therefore changed presentation and composition around those modules, not their contracts.

## 5. New Design Direction

- White-dominant editorial canvas with warm-grey `#F5EDED` sections, black contrast bands and disciplined red accents.
- Asymmetric, magazine-like grids rather than uniform card rows.
- Large typographic statements, numbered section indices, tracked eyebrows and thin rules.
- Cinematic but restrained motion: short time-based intros on first paint and scroll-driven reveals on real content; no animation-only decoration that hides information.
- Maximum content width 1280–1360 px, generous whitespace and a consistent 20/24/32 px rhythm.
- Honest placeholders: missing imagery is shown as a labelled “image pending” panel with a faint official-logo watermark, never as fabricated product photography.

## 6. Official Colours and Typography

Implemented as tokens in `src/app/globals.css`:

- `--lx-red: #CF0A0A`
- `--lx-black: #000000`
- `--lx-white: #FFFFFF`
- `--lx-warm: #F5EDED`
- Supporting ink/grey and line tokens derived from black/white opacity.

Poppins and Inter are loaded with `next/font` in `src/app/layout.tsx`, so fonts are self-hosted and no external font request is required. Editorial utility classes (`type-hero`, `type-section`, `type-statement`, `type-lead`, `type-eyebrow`) keep the scale consistent.

## 7. Logo Integration

- `public/logo.png` and `final logo.png` were not modified, stretched, recoloured or recreated.
- `public/lonex-logo.png` (600×398) is a whitespace-trimmed derivative of the official file. Only surrounding transparent/white margin was removed; pixels and colours are unchanged.
- `public/icon.png` (400×400) is a favicon-sized derivative of the same official mark.
- The header, footer and brand mark render `lonex-logo.png` with `object-contain`, fixed aspect ratio, no distortion and descriptive alt text. Header sizing is legible at all breakpoints.
- On dark surfaces the logo sits on a `#F5EDED` plate, because the asset background is exactly that warm grey. The mark itself is never recoloured.
- The official `public/logo.png` remains available as the canonical source asset.

## 8. Animation Architecture

CSS-first, no animation dependency:

- Time-based intros: `intro-1` … `intro-6` stagger hero copy and key blocks; `intro-mask`, `intro-mask-right` and `intro-scale` handle line/mask and image reveals.
- Scroll-driven reveals: `.reveal`, `.reveal-mask`, `.reveal-scale`, `.reveal-line` use `animation-timeline: view()` where supported, with opacity/transform/mask keyframes that respect the brand easing.
- Header shadow: `.site-header` uses `animation-timeline: scroll(root)`.
- Parallax: a restrained view-timeline translate for selected media panels.
- Marquee: the brand ticker scrolls with a CSS keyframe and pauses on hover.
- Interaction: card lift, image zoom, arrow slide, link underline and button sheen use transform/opacity transitions.
- Mobile navigation: staggered menu items in the native `details/summary` disclosure.
- `prefers-reduced-motion: reduce` disables intros, reveals, marquee, header shadow, parallax, card lift and image zoom. Content is fully visible without motion.
- Only the product gallery is a client component. Every page otherwise remains a Server Component; there are no scroll event listeners and no layout-thrashing JS.

Verified computed behaviour with Playwright:

- Normal motion: `.reveal` → `lx-fade-up` with `view()`; `.site-header` → `lx-header-shadow` with `scroll(root)`.
- Reduced motion: both resolve to `none`.

## 9. Homepage Improvements

`src/app/(site)/page.tsx` now contains:

- Cinematic hero with “Power for What's Next.”, the official logo on a warm plate, dual calls to action and a scroll cue.
- Capability marquee.
- Editorial “Energy that moves life forward.” statement.
- Asymmetric category grid (7/5/12 spans) with honest placeholder media.
- Published-product roster and category links.
- Dark “Built on what we can verify.” band explaining selected range, published detail and registered models.
- Verification CTA and authorized-seller section with honest empty state.
- Journal preview with empty state.
- Full-width red closing CTA and the site footer.
- Structured data and metadata remain generated from published settings/content only.

## 10. Category Page Improvements

- Editorial breadcrumb, category index/count, large category title and description.
- Product grid with consistent cards, price visibility gate and labelled media placeholders.
- Honest empty state when no products are published.
- Pagination preserved.
- Draft categories and draft products remain excluded by the existing public query layer.

## 11. Product Detail Improvements

- Client-side gallery with thumbnails, `aria-pressed` state and a numeric counter; the gallery falls back to a labelled placeholder when no approved image exists.
- Product title, short description and price area use the existing `publicPriceLabel` gate: hidden prices render “Price on inquiry” and never the numeric value.
- Grouped specifications, highlight values and documents/downloads.
- Document rows were fixed for 320 px: `min-w-0`, `flex-1` and truncation remove the horizontal overflow found during QA.
- Related products, seller contact CTA and verification link.
- Product JSON-LD is emitted only from published data and never includes hidden price or `offers` when the price is hidden.

## 12. Seller Page Improvements

- Editorial directory header and city filter.
- Seller cards show only confirmed published details; missing contact fields are omitted rather than invented.
- Honest empty state when no sellers are published.
- Inactive seller records remain excluded from the public query and page.

## 13. Verification Page Improvements

- Three-step explanation, registry-check panel and the existing rate-limited verification form.
- Success, invalid and rate-limited states retained.
- Clear disclaimer: a match confirms a model is registered with LONEX, not that an individual unit is authentic.
- FAQ uses native `details/summary` elements.
- No change to HMAC verification, rate limiting or generic failure messages.

## 14. Blog Improvements

- Journal index with editorial header, featured card treatment, consistent cards, published dates and pagination.
- Article detail with cover image/placeholder, rich-text renderer, metadata and Article JSON-LD.
- Rich text remains typed and sanitised; no raw HTML rendering was introduced.
- Draft articles and unpublished content remain absent from HTML, metadata, sitemap and API responses.
- Honest empty state when no articles are published.

## 15. About and Contact Improvements

**About:** brand story, importer/distributor/dealership positioning, a clear “Not a manufacturer.” statement, “what we publish” standards and a closing contact CTA. No fabricated history, certifications, market leadership or performance claims.

**Contact:** direct-lines layout, enquiry list, location panel and verification note. Because no real contact details are confirmed, the page shows “Contact details will be published once confirmed.” The previously fabricated `support@lonex.example` was removed from public defaults, footer and contact output. The public `contactEmail` default is now empty.

**404:** custom editorial not-found page using the same visual language.

## 16. Responsive Design and Visual QA

Breakpoints checked: **320, 375, 768, 1024 and 1440 px**.

Pages captured at all five widths: homepage, category, authorized sellers, verify, blog index, about, contact and custom 404. Product detail and blog detail were captured at 320/768/1440 using temporary, clearly labelled QA fixtures because the real catalogue and journal are empty.

Checks performed on every capture:

- `document.documentElement.scrollWidth === clientWidth` (no horizontal page overflow).
- No console errors or page errors.
- Header/nav, hero, typography, grids, galleries, document rows, buttons and footer inspected visually.
- Mobile navigation opened and inspected at 375 px.
- Gallery thumbnail interaction inspected: second thumbnail becomes `aria-pressed="true"` and counter changes `01 / 04` → `02 / 04`.

Results:

- 41 final empty-state screenshots captured, no overflow, no console errors.
- 10 populated-state QA screenshots captured for product/blog/seller layouts, no overflow, no console errors after the document-row fix.
- The 320 px product document list overflow found during the first fixture pass was fixed and re-verified.

Screenshot directory: `test-artifacts/sprint-06/`.

Final empty-state set (all five widths):

- `home-320.png`, `home-375.png`, `home-768.png`, `home-1024.png`, `home-1440.png`
- `category-solar-320.png`, `category-solar-375.png`, `category-solar-768.png`, `category-solar-1024.png`, `category-solar-1440.png`
- `authorized-sellers-320.png`, `authorized-sellers-375.png`, `authorized-sellers-768.png`, `authorized-sellers-1024.png`, `authorized-sellers-1440.png`
- `verify-320.png`, `verify-375.png`, `verify-768.png`, `verify-1024.png`, `verify-1440.png`
- `blog-320.png`, `blog-375.png`, `blog-768.png`, `blog-1024.png`, `blog-1440.png`
- `about-320.png`, `about-375.png`, `about-768.png`, `about-1024.png`, `about-1440.png`
- `contact-320.png`, `contact-375.png`, `contact-768.png`, `contact-1024.png`, `contact-1440.png`
- `not-found-320.png`, `not-found-375.png`, `not-found-768.png`, `not-found-1024.png`, `not-found-1440.png`
- `home-375-menu-open.png`

Populated-state QA set:

- `product-qa-fixture-320.png`, `product-qa-fixture-768.png`, `product-qa-fixture-1440.png`
- `blog-detail-qa-fixture-320.png`, `blog-detail-qa-fixture-768.png`, `blog-detail-qa-fixture-1440.png`
- `home-with-qa-375.png`, `home-with-qa-1440.png`
- `sellers-with-qa-1440.png`
- `blog-with-qa-1440.png`

Machine-readable evidence:

- `test-artifacts/sprint-06/capture-report.json`
- `test-artifacts/sprint-06/qa-fixture-report.json`

## 17. Performance and Accessibility

**Performance**

- No animation library or new runtime dependency.
- CSS transforms, opacity and masks only; scroll-driven animation avoids JavaScript scroll listeners.
- All public pages remain Server Components by default; the only new client interaction is the product gallery.
- Fonts are self-hosted through `next/font`; no third-party font request.
- `next/image` is used for content media with explicit sizing and responsive `sizes`.
- Images remain local and are served through the existing media route with immutable caching for images.
- Production build: 39 routes, compiled successfully; static generation completed in about 1.9 s.
- No performance regression was measured against a formal budget; no Lighthouse run was performed in this sprint.

**Accessibility**

- `prefers-reduced-motion` removes all non-essential motion.
- Semantic landmarks, heading order, breadcrumb `nav`, labelled form controls and descriptive alt text.
- Keyboard-operable native disclosure controls and visible focus styles.
- Gallery thumbnails expose selection with `aria-pressed`.
- Decorative rules, grids and arrows are `aria-hidden`.
- Muted annotation text was raised from black/white 30–50% opacity to 55% to improve contrast; body copy is 60–75%. This is a practical improvement, not a formal WCAG audit.
- No automated axe run was added; accessibility was checked through structure, contrast reasoning and manual inspection.

## 18. Security Preservation

- `publicPriceLabel` remains the single price gate and was not weakened.
- QA fixture with `price = 875000` and `show_price = 0` produced no numeric price in HTML, no `offers` in JSON-LD and displayed “Price on inquiry”.
- Temporary draft product, draft category, draft blog post and inactive seller records did not appear in public HTML, metadata, API output or `sitemap.xml`.
- Existing output escaping, rich-text block validation, media delivery rules, auth, RBAC, origin checks, rate limiting, CSP and security headers remain in place.
- The fabricated public support email was removed from public defaults; it remains only as an admin-config placeholder where it is not published.
- No destructive database operation was run. Temporary QA rows and media files were deleted; final counts are categories 3, products 0, product images/specs/documents 0, sellers 0, blog posts 0, media assets 0 and site settings 0.

## 19. Files Created

Public assets:

- `public/lonex-logo.png` — whitespace-trimmed derivative of the official logo.
- `public/icon.png` — favicon derivative.

Public design-system and page files:

- `src/components/public/brand-mark.tsx`
- `src/components/public/eyebrow.tsx`
- `src/components/public/section-heading.tsx`
- `src/components/public/button-link.tsx`
- `src/components/public/marquee.tsx`
- `src/components/public/product-gallery.tsx`
- `src/components/public/seller-card.tsx`
- `src/app/(site)/not-found.tsx`

Sprint 06 QA and evidence:

- `test-artifacts/sprint-06/capture.mjs`
- `test-artifacts/sprint-06/capture-qa-fixtures.mjs`
- `test-artifacts/sprint-06/seed-qa-data.mjs`
- `test-artifacts/sprint-06/cleanup-qa-data.mjs`
- `test-artifacts/sprint-06/verify-db.mjs`
- `test-artifacts/sprint-06/contrast-pass.mjs`
- `test-artifacts/sprint-06/*.png` (51 screenshots)
- `test-artifacts/sprint-06/capture-report.json`
- `test-artifacts/sprint-06/qa-fixture-report.json`

## 20. Files Modified

Core visual system:

- `src/app/globals.css` — brand tokens, editorial type scale, full motion system, reduced-motion rules.
- `src/app/layout.tsx` — Poppins + Inter, title “LONEX | Power for What's Next.”, icon metadata.

Public shell and primitives (built/rewritten):

- `src/components/public/site-header.tsx`
- `src/components/public/site-footer.tsx`
- `src/components/public/content-image.tsx`
- `src/components/public/product-card.tsx`
- `src/components/public/blog-card.tsx`
- `src/components/public/rich-text.tsx`

Public pages:

- `src/app/(site)/page.tsx`
- `src/app/(site)/[categorySlug]/page.tsx`
- `src/app/(site)/[categorySlug]/[productSlug]/page.tsx`
- `src/app/(site)/authorized-sellers/page.tsx`
- `src/app/(site)/verify/page.tsx`
- `src/app/(site)/verify/verify-form.tsx`
- `src/app/(site)/blog/page.tsx`
- `src/app/(site)/blog/[slug]/page.tsx`
- `src/app/(site)/about/page.tsx`
- `src/app/(site)/contact/page.tsx`

Behaviour and test adjustments:

- `src/admin/modules/settings/defaults.ts` — public `contactEmail` default cleared.
- `tests/e2e/foundation.spec.ts` — homepage h1 assertion updated to “Power for What's Next.”.
- `src/app/(site)/*/page.tsx` — `await connection()` added at the start of `generateMetadata` so metadata reads run at request time and the transient `Date.now()` prerender log is avoided.

## 21. Dependencies Added or Changed

- **No runtime animation dependency was added.**
- Inter is loaded through the existing `next/font` package; no new package.
- `package.json` / `package-lock.json` are already modified by earlier uncommitted sprint work; Sprint 06 did not add an animation, carousel or UI library.
- No major upgrades, no `npm audit fix --force`.

## 22. Automated Tests and Actual Results

All commands run from `E:\customer\Imran\Lonex\website` on Windows/PowerShell.

| Command | Result |
| --- | --- |
| `npm run typecheck` | **PASS** — `next typegen` + `tsc --noEmit`, no errors |
| `npm run lint` | **PASS** — 0 errors, 3 pre-existing warnings |
| `npm run test` | **PASS** — 21 test files, 149/149 tests |
| `npm run build` | **PASS** — 39 routes, compiled and generated |
| `npm run test:e2e` | **PASS** — 19/19 Playwright tests, 1 worker |
| `npx drizzle-kit check` | **PASS** — “Everything's fine” |
| `npm audit` | **12 moderate, 0 high, 0 critical** — exits 1 because moderates remain |
| `npm audit --omit=dev` | **4 moderate, 0 high, 0 critical** |

Lint warnings (pre-existing, 0 errors):

1. `src/admin/modules/products/queries.ts` — unused `sql`.
2. `src/lib/public/queries.ts` — unused `PublicProductDocument`.
3. `tests/e2e/admin-modules.spec.ts` — unused `mobileNav`.

Audit detail:

- `esbuild <= 0.24.2` via `drizzle-kit` development tooling.
- `minimatch` via `typescript-eslint` / `eslint-config-next` development tooling.
- Production-only audit (`--omit=dev`) reports 4 moderates from the drizzle-kit chain.
- No forced fix was applied; the suggested fixes are breaking downgrades/upgrades.

Playwright runtime logs include the expected Better Auth messages for the inactive-user test and the pre-existing shared rate-limit warning because `TRUSTED_PROXIES` is unset. These are not test failures.

## 23. Missing Brand Assets, Remaining Issues, Git Status and Exact Next Steps

### Missing assets and content

- Real product photography for all categories and products.
- Category cover imagery; current panels are labelled placeholders.
- Product datasheets/PDFs and any approved specification sheets.
- Real authorized-seller records, addresses, phone numbers and map links.
- Real journal articles, excerpts, covers and author information.
- Company profile, legal/registration details, history and any verified certifications.
- Confirmed public email, phone, WhatsApp, address and social links.
- Production canonical domain and final Open Graph image.
- No manufacturer, certification, performance or market-leadership claim has been invented to fill these gaps.

### Remaining issues

- **Content blocker:** products, sellers and blog posts are all empty; the public site intentionally shows polished, honest empty states.
- **Rate limiting:** `TRUSTED_PROXIES` is unset, so Better Auth falls back to a shared per-path bucket and warns. Configure trusted proxy headers before production.
- **Deployment:** cPanel/Passenger, SSL, Node runtime and persistent media storage are not verified. `MEDIA_STORAGE_PATH` must point outside the release tree for durable uploads.
- **CI:** the GitHub workflow has not been executed on GitHub.
- **Dependency audit:** 12 moderate vulnerabilities remain, all in dev tooling chains; 4 appear in the production-only view through drizzle-kit. No high/critical issues.
- **Soft 404:** under current PPR behaviour, unknown/draft public slugs return HTTP 200 with the custom not-found UI instead of a 404 status. No draft content leaks. This is a pre-existing rendering behaviour and was not changed in Sprint 06.
- **Transient prerender log:** a single `Date.now()` warning appeared during an earlier server shutdown/prerender cycle. `await connection()` was added to `generateMetadata` on all public pages, and the warning did not recur across the final fresh production start, the 41-screenshot capture or the final E2E run.
- **Performance/accessibility evidence:** responsive screenshots and computed animation checks exist, but no Lighthouse/axe report was produced.

### Git working tree

- Branch: `main`; nothing staged, committed or deployed.
- `git status --short`: 59 entries — 16 modified, 3 deleted, 40 untracked.
- The deleted legacy admin files and many modified files belong to earlier Sprint 01/02/03 work. They were preserved, not reverted.
- `.env.local` was not overwritten.

### Exact next steps

1. Obtain the real client assets and content listed above; replace labelled placeholders and populate products, sellers and articles through the admin CMS.
2. Confirm and publish real contact details, canonical domain, social links and Open Graph image.
3. Configure `TRUSTED_PROXIES` and verify rate-limit behaviour behind the production proxy.
4. Verify cPanel/Passenger deployment, SSL, Node runtime and persistent media storage; run the CI workflow on GitHub.
5. Re-run `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`, `npx drizzle-kit check` and a production-only `npm audit` after content/deployment changes.
6. Re-capture the responsive screenshot set with real content at 320/375/768/1024/1440 and inspect the populated catalogue, seller and journal layouts.
7. Decide whether to normalise unknown-slug handling to a true 404 status, and add Lighthouse/axe checks to the release gate.
8. Review and commit the preserved work in coherent, intentional commits only when the owner approves.

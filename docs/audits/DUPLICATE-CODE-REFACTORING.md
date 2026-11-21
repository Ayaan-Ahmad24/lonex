# Duplicate-code audit & refactoring

**Date:** Sat Nov 21 2026
**Branch:** `security/nextjs-16.4.6`
**Working tree:** `C:\Users\dell\.local\share\opencode\worktree\lonex-security-16.4.6`
**Status:** All changes uncommitted; awaiting review/approval. No commits, pushes, merges, resets, stashes, or file deletions performed.

## Objective

Perform a complete duplicate-code audit of the LONEX website, safely consolidate genuine duplication (especially the Email Enquiry system and contact feature flags), verify nothing changed behaviorally, and document the results.

## Method

Each finding was classified as:

- **A — Exact duplicates:** consolidated into one shared implementation.
- **B — Similar:** evaluated; consolidated where safe, preserved where behavior/context differs.
- **C — Intentional variations:** preserved as-is.
- **D — False positives:** no action.

Verification baseline: `npm run typecheck` PASS, `npm run test` PASS (25 files / 201 tests), `npm run build` PASS, `npm run lint` shows only 12 pre-existing errors + 8 warnings (all in unrelated seed/demo files and shell components). Public pages (homepage, 3 category pages, product detail, authorized sellers, contact, verify, about) were rendered and confirmed to produce unchanged mailto/tel links, SEO metadata, and layout.

## Findings inventory

### A — Exact duplicates (consolidated)

| # | Duplication | Occurrences | Consolidated into | Files changed |
|---|-------------|-------------|-------------------|---------------|
| A1 | Email enquiry composition `settings.contactEmail ? mailtoHref(...) : null` (subject + body per context) | 8 | `src/lib/public/enquiries.ts` (builders `categoryEnquiry`, `productEnquiry`, `generalEnquiry`, `sellerDirectoryEnquiry`, `sellerEnquiry`, `verificationEnquiry`) | solar-page, batteries-page, electric-scooters-page, generic-page, product detail page, contact page, authorized-sellers page, verify page, seller-card |
| A2 | `tel:` href construction (two inconsistent regex variants: `replace(/\s+/g,"")` vs `replace(/[^\d+]/g,"")`) | 9 | `telHref()` in `src/lib/public/contact.ts` | contact page, authorized-sellers page, verify page, about page, site-footer, seller-card, enquiry-form, parts.tsx (`RangeEnquiry`), product detail page |
| A3 | Category `views = products.map(card => ({card, editorial: getProductEditorial(...)}))` mapping | 4 | `buildProductViews(category, products)` in `src/components/public/categories/parts.tsx` | solar-page, batteries-page, electric-scooters-page, generic-page |
| A4 | `Math.min(params.page, pageCountFor(total, params.pageSize))` (unused helper `clampPage()` already existed) | 8 | Existing `clampPage()` | categories, verification, users, blog, sellers, products queries + audit + media service queries |
| A5 | Rate-limit read/insert SQL (`readCounter`, `incrementCounter`, `clearCounters`) | 3 throttle modules | `src/lib/security/rate-limit-store.ts` | login-throttle, upload-throttle, verify-throttle |
| A6 | Validation: `optionalHttps` (sellers) duplicates `optionalHttpsUrl` (settings); `parseBoolean` (products) duplicates `formCheckbox`; settings `text`/`optionalId` duplicate `formText`/`formOptionalId`; settings reimplements `collectFieldErrors` | 4 schema sites | `optionalHttpsUrlSchema` / `optionalPhoneSchema` in `src/lib/validation/schemas.ts`; `formCheckbox` used in products; settings schema uses `formText`/`formOptionalId`/`collectFieldErrors`/`parseForm` | settings schema, sellers schema, products schema |

### B — Similar (evaluated; preserved / documented)

| # | Duplication | Decision | Rationale |
|---|-------------|----------|-----------|
| B1 | `rise()` GSAP helper in `page-motion.tsx` vs `home-motion.tsx` | Preserved (documented) | Defaults differ (`y: 26` / `start "top 88%"` vs `y: 28` / `start "top 86%"`) and the helpers are closures inside distinct `useGSAP` callbacks. Extracting would change timing semantics; class B intentional variation. |
| B2 | Authorized-sellers phone/office `<dl>` detail markup (empty state + close section) | Preserved (documented) | Two distinct visual sections with different CSS classes (`lxs-empty__details` vs `lxs-close__details`) and surrounding layout. Markup is intentionally section-specific. |

### C — Intentional variations (preserved)

- Category page hero/intro/community JSX differences (`lxc`/`lxb`/`lxe`/`lxg`): each range has a bespoke hero, pillars, flow, and use-case chips. These are intentional design variations, not duplication.
- CSS duplication: 112 identical declaration bodies across 13 CSS files are design-system-level repetition (single-property rules such as `color: var(--lx-red)`, `grid-template-columns: minmax(0, 1fr)`). Only 4 exact duplicate selector+body rules (keyframe fragments) exist across files. Audited only; no CSS consolidation planned.
- `enquiry-form.tsx` calls `mailtoHref(email, "General Enquiry — LONEX", message)` directly with user-composed message; this is a different context (free-form contact form) from the pre-composed enquiry builders, so it correctly remains a direct `mailtoHref` call.
- `settingsDefaults` has empty `contactEmail`/`contactPhone`/`whatsapp`/`address`; the no-email fallback path (`mailtoHref` returns `null`, callers hide the email action) stays intact — no broken `mailto:` links.

### D — False positives

None of significance. All flagged repeated patterns were either genuine duplication (A), intentional variation (B/C), or distinct contexts (enquiry-form free-form message).

## Files created

| File | Purpose |
|------|---------|
| `src/lib/public/enquiries.ts` | Shared context-aware email enquiry composition builders (category, product, general, seller-directory, seller-card, verification). |
| `src/lib/security/rate-limit-store.ts` | Shared rate-limit counter store (`readCounter`, `incrementCounter`, `clearCounter`, `clearCounters`) over the existing `rate_limit` table. |
| `src/admin/core/crud/action-helpers.ts` | Brand-free admin action scaffolding (`deniedState`, `firstFieldError`, `readEntityId`, `gateNewStatus`, `gateUpdatedStatus`). |

## Files modified

| File | Change |
|------|--------|
| `src/lib/public/contact.ts` | Added `telHref(value)` — single `tel:` builder that keeps digits and leading `+`, returns null when unusable. |
| `src/lib/validation/schemas.ts` | Added shared `optionalHttpsUrlSchema` and `optionalPhoneSchema(options)`. |
| `src/lib/public/categories/parts.tsx` | Added `buildProductViews(category, products)`; `RangeEnquiry` uses `telHref`. |
| `src/components/public/categories/solar-page.tsx` | Uses `categoryEnquiry` + `buildProductViews`. |
| `src/components/public/categories/batteries-page.tsx` | Uses `categoryEnquiry` + `buildProductViews`. |
| `src/components/public/categories/electric-scooters-page.tsx` | Uses `categoryEnquiry` + `buildProductViews`. |
| `src/components/public/categories/generic-page.tsx` | Uses `categoryEnquiry` + `buildProductViews`. |
| `src/app/(site)/[categorySlug]/[productSlug]/page.tsx` | Uses `productEnquiry` + `telHref`. |
| `src/app/(site)/contact/page.tsx` | Uses `generalEnquiry` + `telHref`. |
| `src/app/(site)/contact/enquiry-form.tsx` | Uses `telHref` for the Call link (keeps direct `mailtoHref` for free-form message). |
| `src/app/(site)/authorized-sellers/page.tsx` | Uses `sellerDirectoryEnquiry` + `telHref` for phone links. |
| `src/app/(site)/verify/page.tsx` | Uses `verificationEnquiry` + `telHref`. |
| `src/app/(site)/about/page.tsx` | Uses `telHref`. |
| `src/components/public/seller-card.tsx` | Uses `sellerEnquiry` + `telHref`; both phone links conditionally rendered. |
| `src/components/public/site-footer.tsx` | Uses `telHref`. |
| `src/admin/modules/categories/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/modules/verification/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/modules/users/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/modules/blog/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/modules/sellers/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/modules/products/queries.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/core/audit/query.ts` | `clampPage` instead of inline `Math.min`. |
| `src/admin/core/media/service.ts` | `clampPage` instead of inline `Math.min`. |
| `src/lib/security/login-throttle.ts` | Refactored onto `rate-limit-store.ts` (same key/window/limit semantics). |
| `src/lib/security/upload-throttle.ts` | Refactored onto `rate-limit-store.ts`. |
| `src/lib/security/verify-throttle.ts` | Refactored onto `rate-limit-store.ts`. |
| `src/admin/core/settings/schema.ts` | Uses shared `optionalHttpsUrlSchema`/`optionalPhoneSchema`; `parseSettingsForm` uses `formText`/`formOptionalId`/`formCheckbox`/`parseForm` (removed local duplicates). |
| `src/admin/modules/sellers/schema.ts` | Uses shared `optionalHttpsUrlSchema`/`optionalPhoneSchema`. |
| `src/admin/modules/products/schema.ts` | `parseBoolean` replaced with `formCheckbox`. |
| `src/admin/modules/categories/actions.ts` | Uses `action-helpers` (`deniedState`, `firstFieldError`, `readEntityId`, `gateNewStatus`, `gateUpdatedStatus`). |
| `src/admin/modules/products/actions.ts` | Same. |
| `src/admin/modules/blog/actions.ts` | Same. |
| `src/admin/modules/sellers/actions.ts` | Same. |
| `src/admin/modules/settings/actions.ts` | Uses `deniedState`/`firstFieldError`. |
| `src/admin/modules/verification/actions.ts` | Uses `deniedState`/`firstFieldError`. |

## Duplication reduced

- Email enquiry composition: 8 inline `mailtoHref` blocks → 1 shared module (6 builders).
- `tel:` href construction: 9 inline constructions (2 regex variants) → 1 `telHref` helper.
- Category `views` mapping: 4 identical maps → 1 `buildProductViews`.
- Page clamping: 8 inline `Math.min` calls → existing `clampPage()`.
- Rate-limit SQL: 3 duplicated read/insert blocks → 1 shared store module.
- Validation: optional-HTTPS/phone schemas unified; `parseBoolean` → `formCheckbox`; settings schema field-parsing uses shared helpers.
- Admin action scaffolding: `denied()` ×4, first-field-error ×11, entity-id parse ×6, publish-gate ×4 → 1 shared helpers module.

## Verification results

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run test` | PASS (25 files / 201 tests) — including `site-config-reuse.test.ts` confirming `src/admin/core` stays brand-free and does not import `@/admin/config/` or `@/admin/modules`. |
| `npm run build` | PASS (40 routes generated) |
| `npm run lint` | 12 errors + 6 warnings — all pre-existing and unrelated to this refactor (seed script `any` types, `next/image` LCP warnings in shell components). |
| Public page rendering | `/`, `/solar`, `/batteries`, `/electric-scooters`, `/authorized-sellers`, `/contact`, `/verify`, `/about`, and a sample product detail all return 200 with unchanged mailto/tel links, subjects, bodies, and no console errors. |

Behavior preserved exactly: UI/visual design, responsive layouts, product info/images, seller logos, auth, admin functionality, DB records, SEO metadata, URL structures, contact enquiry behavior, email subjects/context, and security protections (rate-limit windows/limits/key hashing unchanged).

## Remaining intentional duplications

- `rise()` motion helper in `page-motion.tsx` / `home-motion.tsx` (class B — defaults differ).
- Authorized-sellers empty-state vs close-section `<dl>` detail markup (class B — section-specific layout).
- Category bespoke JSX (class C — intentional design variation).
- CSS design-system repetition (class C/D — audited, not consolidated).
- `enquiry-form.tsx` direct `mailtoHref` (distinct free-form context).

## Future recommendations

1. Optionally extract a shared `rise` motion helper if a future motion-system review confirms the default differences can be parameterized without changing timing semantics.
2. Consider extracting the authorized-sellers contact `<dl>` into a reusable `SellerContactDetails` component if a third phone/office block is added.
3. Keep CSS duplication as-is; it reflects per-range design tokens rather than copy-paste.
4. Add unit tests for `telHref`, `enquiries.ts` builders, and `action-helpers` to lock in the refactored behavior.

## Approval

All work is complete and uncommitted on `security/nextjs-16.4.6`. No commit, push, merge, reset, stash, or deletion has been performed. Awaiting review and approval before any further action.

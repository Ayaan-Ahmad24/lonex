# LONEX Website — Project Context

Last updated: 2026-11-06
Sprint: 08 (Media, Blog, Verification & Database Bug Fixes) + Post-QA Verification Hotfix — see `docs/progress/SPRINT_08_MEDIA_BLOG_VERIFICATION_FIXES.md` and `docs/progress/SPRINT_08_POST_QA_VERIFICATION_HOTFIX.md`

## What this is

LONEX-specific business website and admin CMS. Custom-coded public pages (no page builder). Admin manages categories, products, images, specifications, prices, PDF datasheets, authorized sellers, verification codes, and blog posts.

LONEX is a Pakistan-based importer, distributor and dealership business. The site must not describe LONEX as a manufacturer or invent history, certifications, coverage or performance claims.

## Stack

- **Next.js 16.4.4** (App Router, Turbopack, Cache Components) — confirmed via `node -p "require('./node_modules/next/package.json').version"`; `cacheComponents: true`, `partialPrefetching: true`
- **React 19.3.0**, **TypeScript 5.9.3**, **Tailwind CSS 4**
- **MySQL 8** + **Drizzle ORM 0.45.4** / **Drizzle Kit 0.31.11**
- **Better Auth 1.7.15**
- **Zod 4.6.7**
- **react-toastify 11.2.0** (admin notifications, mounted once in the root layout)
- **Vitest 4.1.12**, **Playwright 1.64.1**

## Repository layout

```
src/app/                 App Router pages, layouts, route handlers
src/app/(site)/          Public website (layout, pages, not-found)
src/app/admin/           Login + admin dashboard routes
src/app/api/             Auth + admin handlers
src/app/media/[id]/      Public media route handler
src/app/robots.ts        robots.txt
src/app/sitemap.ts       sitemap.xml
src/admin/               Admin core + LONEX modules
src/components/public/   Public design system components
src/lib/public/          Public queries, DTOs, SEO, media, settings, redirects
src/lib/content/         Slug, paths, rich text
src/lib/verification/    Model code verification
src/db/                  Drizzle schema + client
tests/                   unit, integration, e2e
test-artifacts/          Sprint QA screenshots, scripts and reports
drizzle/                 Migrations 0000-0006
```

## Environment

MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, BETTER_AUTH_SECRET (32+), BETTER_AUTH_URL. Optional: TRUSTED_PROXIES, ENABLE_HSTS, MEDIA_STORAGE_PATH, MEDIA_MAX_UPLOAD_BYTES, MODEL_CODE_HMAC_SECRET.

## Commands

npm run dev, build, start, typecheck, lint, test, test:watch, test:e2e, admin:create, seed:content

## Public routes

/, /[categorySlug], /[categorySlug]/[productSlug], /authorized-sellers, /verify, /blog, /blog/[slug], /about, /contact, /media/[id], /robots.txt, /sitemap.xml, 404.

Public pages render per request (`await connection()`), including metadata reads, so published settings/content and hidden-price rules are applied at request time. `export const instant = false` is retained.

## Admin routes

/admin, /admin/categories, /admin/products, /admin/sellers, /admin/verification, /admin/blog, /admin/media, /admin/settings, /admin/users, /admin/audit, /admin/login.

## Business modules

categories, products, sellers, verification, blog, media, settings, users, audit, dashboard.

## Database

**23 tables**. Migrations 0000-0006 applied. 0005 drop page builder, 0006 LONEX modules. Never modify applied migrations.

Migration journal (7 entries): `0000_init_admin_core`, `0001_better_auth_identity`, `0002_cold_marrow`, `0003_vengeful_silk_fever`, `0004_sprint02_cms_core`, `0005_drop_page_builder`, `0006_lonex_modules`.

Preserved tables (14): `admin_roles`, `admin_permissions`, `admin_user_roles`, `admin_role_permissions`, `audit_log`, `media_assets`, `site_settings`, `public_paths`, `url_redirects`, `rate_limit`, `user`, `account`, `session`, `verification`.

LONEX Sprint 03 added (via migrations 0005/0006): `categories`, `products`, `product_images`, `product_specifications`, `product_documents`, `authorized_sellers`, `blog_posts`, `product_verification_codes`, `url_redirects`.

## Price visibility

show_price defaults false. publicPriceLabel gate. Hidden price never in HTML, props, metadata, JSON-LD, sitemap. Verified in Sprint 06 with a hidden-price fixture: no numeric value and no JSON-LD `offers`; the page showed “Price on inquiry”.

## Model verification

HMAC digest stored. Rate limited. Generic failures. Disclaimer shown. No enumeration.

## SEO

Per-page metadata, canonical, OG, Product/Article JSON-LD, sitemap (published only), robots. noIndex setting defaults false. Metadata reads run at request time via `connection()`.

## Design system (Sprint 06)

Brand red `#CF0A0A`, black `#000000`, white `#FFFFFF`, warm grey `#F5EDED`. Poppins primary, Inter supporting (both via `next/font`). Max width 1280–1360 px. White-dominant editorial/asymmetric layout with black contrast bands and disciplined red accents.

Official logo files `public/logo.png` and `final logo.png` are untouched. `public/lonex-logo.png` (600×398) is a whitespace-trimmed derivative with unchanged pixels/colours; `public/icon.png` (400×400) is the favicon derivative. The logo is rendered with fixed aspect ratio and is never stretched or recoloured; on dark surfaces it sits on a `#F5EDED` plate.

Motion is CSS-only: staggered intros, mask/line reveals, scroll-driven `animation-timeline: view()` reveals, `scroll(root)` header shadow, restrained parallax, marquee, hover/sheen/underline transitions and a staggered mobile menu. `prefers-reduced-motion: reduce` disables non-essential motion. Public pages remain Server Components by default; only the product gallery is a client component.

Missing imagery uses a labelled “image pending” panel with a faint official-logo watermark. No stock photography or fabricated product imagery is used.

## Authentication

Better Auth. Session management. Inactive-user rejection. Session revocation. Password policy. Origin checks.

## Authorization

Server-side RBAC. Permission checks on every protected mutation. UI visibility is not sufficient authorization.

## Authentication, RBAC and Security

IMPLEMENTED and TESTED (unit/integration). Better Auth, RBAC, rate limiting, origin checks, CSP, security headers. Hidden-price and draft-content probes passed in Sprint 06. Public contact email default is empty (no fabricated support address).

## Testing

Final Sprint 08 + Hotfix results:

- `npm run typecheck` — PASS
- `npm run lint` — PASS, 0 errors, 1 pre-existing `<img>` warning
- `npm run test` — 25 files, 192/192 tests PASS
- `npm run build` — PASS, 40 routes
- `npm run test:e2e` — 23/23 PASS (including generate-code, delete-redirect, verification-reload and sign-out coverage)
- `npx drizzle-kit check` — PASS
- `npm audit` — 12 moderate, 0 high/critical; `npm audit --omit=dev` — 4 moderate

Sprint 07 regression test coverage:
- `tests/unit/server-action-exports.test.ts` — no unsupported exports in "use server" modules
- `tests/unit/rich-text-v2.test.ts` — v2 schema, v1 legacy compatibility, HTML serialization, safeHref, server sanitizer
- `tests/unit/category-priority.test.ts` — priority integer/range validation, blank default
- `tests/unit/user-deletion.test.ts` — transactional delete, session revocation, account cleanup, role cleanup, self-delete block, last-admin block, not-found

Responsive screenshots were captured during Sprint 06–08 QA in a local
`test-artifacts/` folder. That folder is generated evidence and is now ignored
by Git, so the committed documentation is the source of truth.

## Known issues

- Client content is partial: three solar products, three datasheets and the corporate About page are seeded; sellers, blog posts, product photography and the remaining categories still need real supplied content.
- `TRUSTED_PROXIES` unset; Better Auth uses a shared per-path rate-limit bucket and warns.
- Production hosting/Passenger/SSL/persistent media storage not verified.
- GitHub CI workflow never run on GitHub.
- npm audit: 12 moderate (dev tooling chains; 4 in the production-only view), no high/critical.
- Unknown/draft public slugs return HTTP 200 with the custom not-found UI under PPR (soft 404). No draft content leaks; pre-existing rendering behaviour.
- No Lighthouse/axe report was produced.

## Sprint 08 completed fixes

1. **Images not displaying** — Added `images.remotePatterns` to `next.config.ts` for `/media/` URLs so `next/image` can optimize media assets. Public media route (`/media/[id]`) requires published-content reference check (unchanged security). Admin media previews at `/admin/media/[id]/file` require `media.manage` permission (unchanged).
2. **Clicking image breaks CSS** — Added `src/components/public/image-lightbox.tsx` — an accessible modal lightbox for product gallery image clicks with Escape key support, keyboard navigation, focus management, and body scroll locking. Product gallery now opens images in the lightbox instead of navigating to raw media URLs.
3. **Blog editor** — Tiptap v3.32.3 Visual/HTML/Preview editor fully integrated with bold, italic, underline, H2–H4, paragraphs, bullet/numbered lists, blockquotes, links, undo/redo, horizontal rules, clear formatting, keyboard shortcuts. Rich-text v2 structured format with legacy v1 upgrade. Server-side sanitization via `sanitize-html` + `htmlparser2`.
4. **Blog image upload/picker** — Added `src/admin/modules/blog/cover-image-picker.tsx` with Media Library selection (thumbnail grid) and device upload (authenticated multipart with progress bar). Hidden `coverMediaId` form field submits with the blog form.
5. **Verification code rotation** — Code generation and rotation flows remain intact with HMAC digest storage, audit logging, and revalidation.
6. **Public code verification** — `/verify` page works correctly with rate limiting, generic failures, and disclaimer. Code normalization accepts lowercase, spaces and missing dashes.
7. **Admin manually sets verification codes** — Changed from auto-generation to administrator-entered codes with validation (min 12 chars, no repeated sequences, no ascending runs), confirmation field, uniqueness check, and atomic digest storage. Raw codes are never stored, logged or audited.

## Hotfix (post-Sprint 08 QA) completed fixes

1. **Public verification page 500 (digest 3943029247)** — Root cause: production server on port 3000 was running a STALE `.next` build compiled before the Sprint 07 `"use server"` fix. Rebuilt and restarted the server. Source fix (VerifyState/initialVerifyState in `src/app/(site)/verify/state.ts`) was already correct. HMAC verification, rate limiting, generic failures, disclaimer and model-registration security preserved.
2. **Image rotation/delete popup stuck** — `ConfirmSubmitButton` modal remained open after form submission because `open` state was never reset. Fixed by adding `FormStateContext` in `action-form.tsx` that provides the Server Action state to `ConfirmSubmitButton`, which now auto-closes the modal on success/error and shows a toast notification.
3. **Category product count showing 0** — `listCategories` used a correlated subquery (`sql` template tag) that didn't return correct counts. Rewrote using `LEFT JOIN` + `GROUP BY` with `count(products.id)`.
4. **Verification code not visible to admin after generation** — Raw codes were only shown once in a transient success message. Added `VerificationCodeContext` to store codes in session memory (never persisted), `VerificationCodeCell` to display codes in the admin table, and updated `setVerificationCodeAction`/`generateVerificationAction` to return the raw code in the action state. Codes now appear in toasts and in the verification table.
5. **Set custom code validation too strict** — Removed the ascending-run check from `validateModelCode()` (format, length, and repeated-sequence checks remain). Admin-entered codes are now easier to set while still rejecting weak patterns like `AAAA`.
6. **Set custom code not working** — The `setVerificationCodeAction` now returns the assigned code in the action state so it can be stored in session context and displayed. The `SetCustomCodeForm` wrapper captures the returned code via `useFormState()`.
7. **Toast notifications** — Added `ToastProvider` and `useToast` hook in `src/admin/core/ui/toast.tsx`. Integrated into admin dashboard layout. Used for success/error feedback on all admin actions.

## Sprint 08 new files

- `src/components/public/image-lightbox.tsx` — Accessible image lightbox modal
- `src/admin/modules/blog/cover-image-picker.tsx` — Blog cover image picker (library + device upload)
- `src/admin/core/ui/toast.tsx` — Toast notification component and context
- `src/admin/modules/verification/verification-code-context.tsx` — Session context for storing verification codes
- `src/admin/modules/verification/verification-code-cell.tsx` — Client component displaying stored codes in admin table
- `docs/progress/SPRINT_08_MEDIA_BLOG_VERIFICATION_FIXES.md` — Sprint 08 report
- `docs/progress/SPRINT_08_DATABASE_VERIFICATION_GUIDE.md` — MySQL verification guide
- `docs/progress/SPRINT_08_POST_QA_VERIFICATION_HOTFIX.md` — This hotfix report

## Sprint 08 modified files

- `next.config.ts` — Added `images.remotePatterns` for `/media/` URLs
- `src/components/public/product-gallery.tsx` — Image lightbox integration, click-to-enlarge
- `src/admin/modules/blog/blog-form.tsx` — Cover image picker integration
- `src/admin/modules/blog/cover-image-picker.tsx` — New (see above)
- `src/lib/verification/code.ts` — Added `validateModelCode()`, `MIN_CODE_BODY_LENGTH`; relaxed validation (removed ascending run check)
- `src/admin/modules/verification/schema.ts` — Added `verificationCodeSchema`, `parseVerificationCodeForm()`
- `src/admin/modules/verification/service.ts` — Added `setVerificationCode()`
- `src/admin/modules/verification/actions.ts` — Added `setVerificationCodeAction()`; returns code in action state
- `src/admin/modules/verification/verification-actions.tsx` — Manual code entry UI; stores codes in context
- `src/admin/modules/verification/verification-code-context.tsx` — New
- `src/admin/modules/verification/verification-code-cell.tsx` — New
- `src/app/admin/(dashboard)/verification/page.tsx` — Uses VerificationCodeCell for code column
- `src/app/admin/(dashboard)/layout.tsx` — Added ToastProvider and VerificationCodeProvider
- `src/admin/core/crud/types.ts` — Extended ActionState with optional `code` field; updated `success()`
- `src/admin/core/ui/action-form.tsx` — Added FormStateContext; exports useFormState hook
- `src/admin/core/ui/confirm-dialog.tsx` — Auto-closes modal on success/error; shows toast with code
- `src/admin/modules/categories/queries.ts` — Fixed product count query (LEFT JOIN + GROUP BY)
- `src/lib/verification/code.ts` — Relaxed validation (removed ascending run check)

## Sprint 07 completed fixes (preserved)

1. **Verification page 500** — Moved `VerifyState`/`initialVerifyState` to `src/app/(site)/verify/state.ts` so `actions.ts` exports only async functions. HMAC verification, rate limiting, generic failures, disclaimer and model-registration security preserved.
2. **Media upload >1 MB** — Replaced the 1 MB-limited Server Action upload with `src/app/api/admin/media/upload/route.ts` (authenticated multipart, streaming size cap, origin/CSRF check, MIME/signature validation, private storage, JSON errors). XHR progress UI in `media-upload-form.tsx`. Old `uploadMediaAction` removed.
3. **Media page crash** — Fixed as a consequence of Fix 2; failed uploads no longer tear down the admin page.
4. **Session navigation warning** — Added `export const instant = false` to `src/app/admin/(dashboard)/layout.tsx` for auth-gated blocking navigation. Does not cache session data or disable security.
5. **Category priority** — Raw-string integer validation with range errors, ascending default sort, Priority column in listing, stable secondary ordering, better field label/hints.
6. **Blog editor** — Tiptap v3.32.3 Visual/HTML/Preview editor with bold, italic, underline, H2–H4, lists, blockquotes, links, undo/redo, horizontal rules, clear formatting, shortcuts. Rich-text v2 structured format with legacy v1 upgrade. Server-side sanitization via `sanitize-html` + `htmlparser2`. Never stores raw HTML; public renderer uses React elements only.
7. **Secure user deletion** — Admin-only hard deletion with self-deletion and last-active-administrator guards, session/account/role revocation, audit preservation, FK-safe (cascade/set null). Confirmation UI on user detail page.

## Sprint 07 new dependencies (preserved)

- `@tiptap/react@3.32.3`, `@tiptap/pm@3.32.3`, `@tiptap/starter-kit@3.32.3`
- `sanitize-html@2.18.1`, `htmlparser2@12.0.0`
- `@types/sanitize-html@2.16.2` (dev)

## Follow-up hotfix (same day): toastify, delete feedback and client content

1. **Toast library** — replaced the custom toast implementation with `react-toastify@11.2.0`. `ToastProvider` is mounted once in the root layout, so toasts survive navigation (e.g. sign-out to login).
2. **Central action feedback** — `ActionForm` now raises success/error toasts, renders the inline message and refreshes the server component once per result. `ConfirmSubmitButton` only owns its modal and closes when a new action result arrives. Pending labels use `useFormStatus()`.
3. **Delete no longer 404s** — every delete action redirects server-side. `flashPath()` carries a one-shot message and `FlashToast` shows it on the list page, then strips the query parameters. This fixed the users delete flow, which previously re-rendered the deleted detail route. The other four deletes now confirm visibly too.
4. **Verification code reload** — `VerificationCodeProvider` uses `useSyncExternalStore` over tab-scoped `sessionStorage`; the raw code survives a reload and is still never stored server-side. The custom-code form closes after assignment.
5. **Generate code feedback** — the generate form previously unmounted when `revalidatePath` marked the row registered, so its success effect (toast and raw-code capture) never ran. It now stays mounted and becomes *Rotate code* once a code exists; rows without a code no longer show a failing *Activate* button.
6. **Client content** — corporate-profile About page; three published solar products (LONEX P1-BD 650W+, C&D CD-G640-670 MCH72Dw, LONGi Hi-MO X10 LR8-66HVD) with specifications and committed PDF datasheets in `content/datasheets/`; `npm run seed:content` is idempotent. Contact settings seeded only where empty.
7. **Datasheet URL bug** — public document links now use the media asset id, not the `product_documents` id; `/media/<assetId>` returns the PDF with a 200.
8. **Tests** — added E2E coverage for generate code, delete redirect + flash toast, verification code reload and sign-out toast; fixed pre-existing strict-mode selector failures.

## Git state

Committed on `main`. No deployment. `.env.local` untouched.

## Next task

Sprint 08 and the post-QA hotfix are complete. Recommended next steps:

1. Obtain the remaining client content/assets (sellers, blog, product photography, EV/battery categories) and publish through the admin CMS.
2. Configure `TRUSTED_PROXIES` and verify deployment/media persistence.
3. Run the GitHub CI workflow.
4. Decide whether to normalise soft-404 handling and add Lighthouse/axe release gates.
5. Consider adding inline image insertion in the blog editor rich-text content.

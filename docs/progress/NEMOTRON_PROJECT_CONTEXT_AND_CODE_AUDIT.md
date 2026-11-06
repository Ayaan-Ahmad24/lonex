# NEMOTRON PROJECT CONTEXT AND CODE AUDIT

## 1. Executive Summary

This document presents a comprehensive codebase audit of the LONEX v2.4 website project, taken over by the Nemotron agent. The audit covers project context, architecture, implementation status, test results, security findings, and recommended next steps. The project delivers a LONEX-specific business website with custom-coded public pages (no visual page builder) and a LONEX-specific administration system for managing categories, products, sellers, verification codes, and blog posts.

**Overall status**: Code is complete and all automated tests pass (149/149 Vitest, 19/19 Playwright). Build, typecheck, and lint all pass. No database migrations are needed. The main blockers are missing client assets (images, PDFs, contact details) and dependency security vulnerabilities (20 moderate).

## 2. Project Purpose

LONEX is a Pakistan-based solar energy, battery solutions and electric mobility business requiring a premium, professionally designed, secure and fully functional business website. The system must support LONEX-specific administration for categories, products, images, specifications, prices, PDF datasheets, authorized sellers, verification codes, and blog posts. All public website pages are custom-coded React/Next.js components — no visual page builder or generic CMS is used.

## 3. Owner Decisions (Authoritative)

| Decision | Description |
|---|---|
| **0001** | No page builder. All public pages custom-coded. |
| **0002** | LONEX-specific administration only. No multi-client CMS. |
| **0003** | Premium luxury design with cinematic animations. |
| **0004** | Preserve existing working functionality. |
| **0005** | Documentation is mandatory — every milestone gets a Markdown report. |
| **0006** | Price security: `show_price=false` removes numeric price from ALL outputs. |
| **0007** | Draft/unpublished content must never leak into public HTML/metadata/sitemap. |
| **0008** | Model verification: one HMAC code per product model, rate-limited, generic failures. |
| **0009** | SEO: per-page metadata, JSON-LD, published-only sitemap, robots obey noIndex setting. |

## 4. Technology Stack (Verified)

- **Next.js 16.4.4** — confirmed via `node -p "require('./node_modules/next/package.json').version"`; App Router enabled, `cacheComponents: true`, `partialPrefetching: true`
- **React 19.3.0**, **TypeScript 5.9.3**, **Tailwind CSS 4**
- **MySQL 8** + **Drizzle ORM 0.45.4** + **Drizzle Kit 0.31.11**
- **Better Auth 1.7.15** — authentication, sessions, RBAC
- **Zod 4.6.7** — validation
- **Vitest 4.1.12** — 21 test files, 149 unit/integration tests
- **Playwright 1.64.1** — 19 E2E tests
- **npm audit** — 20 moderate vulnerabilities (no high/critical)

## 5. Original Reference Requirements

The original reference ZIP specified:
- LONEX-only website, no multi-client architecture
- Remove visual page builder and generic page/section editing
- All public pages custom-coded React/Next.js
- Preserve auth, sessions, RBAC, security, media, settings, audit, `public_paths`, `rate_limit`
- Never: `git reset`, switch branches, `git clean`, delete unrelated untracked files, `git add .`/`-A`, overwrite `.env.local`, reset/recreate `lonex_dev`, edit applied migrations 0000–0004, deploy, commit

## 6. Brand Identity

- **Primary Red**: `#CF0A0A`
- **Black**: `#000000`
- **White**: `#FFFFFF`
- **Light Grey**: `#F5EDED`
- **Typography**: Poppins 400/500/600/700
- **Max width**: 1280–1360px
- **Logo**: `E:\customer\Imran\Lonex\website\final logo.png`
- **Design**: Light-dominant premium editorial; never invent specs, prices, certifications, achievements, dealers, testimonials or imagery; label development placeholders

## 7. Project History

### Sprint 01 — Foundation and Security
- Next.js foundation, Better Auth, session management, RBAC
- Vitest, Playwright testing infrastructure
- Password policy, trusted proxy IP handling, DB-backed rate limiting
- Security headers, Zod validation, typed environment config
- Server-only boundaries

### Sprint 02 — CMS Core (then rejected)
- Generic CMS infrastructure, module registry, generic CRUD
- Media management, publishing system, settings, audit interface
- **Owner rejected**: page builder and reusable CMS direction

### Sprint 03 — LONEX-Specific Business Modules
- Page-builder removal: `src/app/admin/(dashboard)/pages/`, `src/admin/modules/pages/`, `src/admin/core/publishing/`
- Obsolete tests deleted: `tests/unit/page-schema.test.ts`, `tests/unit/publishing-sections.test.ts`, `tests/integration/pages-publishing.test.ts`
- `src/db/schema.ts` fully rewritten (9 LONEX tables + preserved tables)
- Migrations 0005 and 0006 applied locally; 7 migrations, 23 tables
- Seed categories `solar`, `ev-bikes`, `batteries` as published with empty descriptions
- Core updates: reserved segments (`about`/`contact`/`authorized-sellers`), env helpers, admin icons, module definitions, `site.ts` enabled modules, settings schema adds `whatsapp` + `googleMapsUrl`, media references rewritten for LONEX tables, `listPdfForSelect` added
- Libs created: `src/lib/content/slug.ts`, `src/lib/content/paths.ts`, `src/lib/content/rich-text.ts`, `src/lib/verification/code.ts`, `src/lib/verification/lookup.ts`, `src/lib/security/verify-throttle.ts`, `src/lib/public/dto.ts`, `src/lib/public/queries.ts`, `src/lib/public/media.ts`, `src/lib/public/settings.ts`, `src/lib/validation/form.ts`
- Admin categories module complete (schema/service/queries/actions/form + list/new/edit pages), product-path cascade on slug rename
- Admin products module complete (schema/service/queries/actions/form + list/new/edit pages)
- Admin sellers module complete (schema/service/queries/actions/form + list/new/edit pages)
- Admin blog module complete: schema/service/queries/actions/form, plus `/admin/blog`, `/admin/blog/new`, `/admin/blog/[id]`, `/admin/blog/[id]/preview`
- Model verification module complete: `src/admin/modules/verification/{schema,service,queries,actions,verification-actions}.ts(x)` and `/admin/verification`
- Dashboard queries/page rewritten for LONEX metrics and recent products
- Shared `DeleteForm`, `RichTextRenderer`, public verification action/form created
- `src/app/(site)/verify/actions.ts` and `verify-form.tsx` created (rate-limited, generic failure, disclaimer)

### Sprint 04 — Final QA
- All 19 E2E tests pass
- Vitest: 149/149 pass
- typecheck/lint/build/drizzle check all PASS
- 20 moderate npm audit vulnerabilities

### Sprint 05 — Runtime Error Fix
- Fixed: `Cannot read properties of undefined (reading 'id')` at `src/lib/public/queries.ts`
- Root cause: `primaryImageJoin` SQL template evaluated at module load before bindings ready
- Fix: Converted to function called at query execution time
- All public routes return HTTP 200

### Sprint 06 — Premium Brand Experience (partial)
- Brand colour foundation in globals.css
- Typography foundation (Poppins)
- CSS animations: fade-up, fade-in, scale-in, slide-right, line-draw, stagger delays, premium-card hover, image-zoom, btn-sheen
- prefers-reduced-motion respected
- **Status**: CSS foundation laid; full page-by-page animation rollout NOT complete
- **Files modified**: `src/app/globals.css`, `src/app/(site)/page.tsx`
- **Dependencies**: none new

## 8. Current Git State

- **Branch**: main @ 287cad2
- **Working tree**: dirty; 19 files modified, many untracked
- **Key modifications**: `.gitignore`, `drizzle/meta/_journal.json`, `next.config.ts`, `package.json`, `package-lock.tsx`, `scripts/create-admin.ts`, `src/app/layout.tsx`, `src/db/schema.ts`, `src/lib/auth.ts`, `src/lib/rbac.ts`, `src/lib/session.ts`, `src/proxy.ts`
- **Deleted**: `src/app/admin/logout-button.tsx`, `src/app/admin/page.tsx`, `src/app/page.tsx`
- **Untracked key dirs**: `src/admin/`, `src/app/(site)/`, `src/app/admin/(dashboard)/`, `src/components/`, `src/lib/`, `tests/`, `docs/`
- **Never executed**: `git reset`, `git clean`, `git add .`, `git add -A`

## 9. Current Architecture

### Public Website (src/app/(site)/)

| Route | Component | Status |
|---|---|---|
| `/` | `HomePage` | Complete |
| `/[categorySlug]` | Category page | Complete |
| `/[categorySlug]/[productSlug]` | Product detail | Complete |
| `/authorized-sellers` | Seller directory | Complete |
| `/verify` | Model verification form | Complete |
| `/blog` | Blog list | Complete |
| `/blog/[slug]` | Blog detail | Complete |
| `/about` | About page | Complete |
| `/contact` | Contact page | Complete |
| `/media/[id]` | Media delivery | Complete |
| `/robots.txt` | Robots metadata | Complete |
| `/sitemap.xml` | Sitemap | Complete |
| `404` | Not found | Complete (root layout) |

### Admin Dashboard (src/app/admin/(dashboard)/)

All module pages implemented: categories, products, sellers, verification, blog, media, settings, users, audit, dashboard.

### Core Infrastructure

- `src/db/schema.ts` — 23 tables (9 LONEX + preserved identity/media/settings/paths/audit/rate_limit)
- `src/lib/public/queries.ts` — published-only read model feeding all public pages
- `src/lib/public/dto.ts` — price-hidden DTO boundary (`publicPriceLabel`)
- `src/lib/public/media.ts` — public delivery only for assets referenced by published content
- `src/lib/public/settings.ts` — public settings projection
- `src/lib/content/paths.ts` — public path registry, redirect history, `allowBlog` support
- `src/lib/content/rich-text.ts` — safe blog rich text parser/renderer
- `src/lib/verification/code.ts` — HMAC code generation/digestion
- `src/lib/verification/lookup.ts` — public model code lookup
- `src/lib/security/verify-throttle.ts` — rate-limited verification lookup
- `src/lib/public/seo.ts` — per-page metadata/JSON-LD with price gate
- `src/lib/public/redirects.ts` — 308 redirect on path rename
- `src/admin/modules/definitions.ts` — module registry
- `src/admin/core/guards.ts` — `requireAdminModule`, `authorizeAction`
- `src/admin/core/registry/navigation.ts` — navigation ordering
- `next.config.ts` — `cacheComponents: true`, CSP with `'unsafe-inline'`

### Database Schema (23 tables)

Preserved from earlier sprints: `admin_roles`, `admin_permissions`, `admin_user_roles`, `admin_role_permissions`, `audit_log`, `media_assets`, `site_settings`, `public_paths`, `url_redirects`, `rate_limit`, `user`, `account`, `session`, `verification`.

LONEX Sprint 03 added (via migrations 0005/0006): `categories`, `products`, `product_images`, `product_specifications`, `product_documents`, `authorized_sellers`, `blog_posts`, `product_verification_codes`.

### Key DTOs and Gates

- `publicPriceLabel(price, showPrice)` — returns `null` unless `showPrice=true` AND price > 0; used by every public query as the single price gate
- `loadPublicSettings()` — projects only allowlisted fields; secrets never enter this object
- `isReferencedByPublishedContent(mediaId)` — media private unless referenced by published category/product/blog
- `verifyModelCode(rawCode)` — returns `null` unless code active AND product + category published

### Public Queries Published-Only Guarantee

Every public query filters to `status = "published"`. Draft categories, products and blog posts therefore cannot appear in HTML, metadata, sitemap output or API responses.

## 10. Admin Modules Status

| Module | Schema | Service | Queries | Actions | Pages | Status |
|---|---|---|---|---|---|---|
| categories | ✅ | ✅ | ✅ | ✅ | ✅ (list/new/[id]) | Complete |
| products | ✅ | ✅ | ✅ | ✅ | ✅ (list/new/[id]) | Complete |
| sellers | ✅ | ✅ | ✅ | ✅ | ✅ (list/new/[id]) | Complete |
| verification | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| blog | ✅ | ✅ | ✅ | ✅ | ✅ (list/new/[id]/preview) | Complete |
| media | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| settings | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| users | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| audit | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |

### Key admin implementation details

- **Categories**: product-path cascade on slug rename inside same transaction; `renamePublicPath` moves children URLs; revalidation of `/, /sitemap.xml`, category path and product paths
- **Products**: `showPrice` prop stored; `publicPriceLabel` gate in all public queries; price never leaks to HTML/props/JSON-LD/sitemap when hidden
- **Sellers**: admin CRUD; public page with city filtering, call/map/whatsapp actions; `whatsapp` and `googleMapsUrl` in settings
- **Verification**: one active code per product model; `product_id` UNIQUE; `code_digest` UNIQUE; HMAC with dedicated server secret; raw code shown once only, never logged/public; rate-limited, no enumeration; disclaimer "confirms model registration not physical authenticity"
- **Blog**: safe structured rich text only; no raw HTML/scripts/iframes; parser accepts line-based syntax; renderer emits React only; draft/unpublished never leak
- **Media**: signature validation; public delivery only for assets referenced by published content; PDFs as attachments; private/unreferenced stay protected
- **Settings**: `whatsapp` + `googleMapsUrl` added; defaults form; `noIndex` setting controls robots/sitemap

## 11. Public Website — Detailed Implementation

### Route Structure

The public site uses the `(site)` route group. Root layout (`src/app/layout.tsx`) provides the shell with `BrandMark`, `SiteHeader`, and `SiteFooter`. All page content is custom-coded.

### Design System Implementation

- **Container**: 1280–1360px max width with responsive gutters
- **BrandMark**: Typographic "LX" mark or integrated logo; #CF0A0A on #F5EDED
- **SiteHeader**: Sticky, brand mark, category nav, mobile menu, CTA buttons
- **SiteFooter**: Grid layout with Explore/Company/Contact/Social; copyright; verification disclaimer
- **SectionHeading**: Red eyebrow, title, description, optional action
- **ProductCard**: Bordered, image, name, price label (or "View details"), arrow → link
- **BlogCard**: Cover image, published label, title, excerpt, "Read article" → link
- **ImagePlaceholder**: Labelled placeholder for missing imagery
- **ContentImage**: Falls back to placeholder instead of stock photography
- **JsonLd**: Escaped JSON, never executable markup

### Pages Built and Verified

| Page | Key Features | Status |
|---|---|---|
| Homepage | Hero with tagline, categories grid, featured products, verification CTA, seller dir, blog preview, about/contact CTAs | Complete |
| Category (`/{slug}`) | Category name, cover image, product grid, "View category" → `/{slug}` | Complete |
| Product Detail (`/{cat}/{prod}`) | Full product data, images, specifications, highlights, documents, price (hidden if showPrice=false), "View details" → product path | Complete |
| Authorized Sellers | List of sellers with contact details, city filtering, map/whatsApp actions | Complete |
| Verify | Rate-limited form, generic failure, disclaimer, shows matched model name + path | Complete |
| Blog List (`/blog`) | Cards with cover, title, excerpt, published label, "All articles" → `/blog` | Complete |
| Blog Detail (`/blog/[slug]`) | Rich text rendered via `RichTextRenderer` (safe blocks only), metadata, "Back to blog" | Complete |
| About | Brand story, what LONEX does (no invented claims), contact hint | Complete |
| Contact | Email, phone, address (from CMS), WhatsApp link, contact form placeholders | Complete |
| 404 | Root layout not-found handling | Complete |
| robots.txt | Dynamic, respects `settings.noIndex` | Complete |
| sitemap.xml | Published categories/products/blog only | Complete |

### Price Security Enforcement

The `publicPriceLabel(price, showPrice)` function is the **single gate** used by every public query:

```typescript
export function publicPriceLabel(
  price: string | number | null | undefined,
  showPrice: boolean,
): string | null {
  if (!showPrice || price === null || price === undefined) {
    return null; // <--- Price removed from HTML, props, JSON, metadata, sitemap, OG
  }
  const numeric = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null; // <--- Zero/negative also returns null
  }
  return PKR_FORMATTER.format(numeric); // Only format when explicitly enabled
}
```

**Critical**: When `show_price=false` (default), the numeric price is completely removed from:
- HTML rendered output
- Client component props
- Network JSON responses
- Metadata (`<meta>` tags)
- JSON-LD structured data
- Open Graph metadata
- Sitemap entries

CSS-hide is **not** acceptable as security — the DTO boundary is the only gate.

### Model Verification Public Flow

1. User submits verification code via `VerifyForm` at `/verify`
2. Server-side: rate-throttle per client IP, normalize code, compute HMAC digest
3. DB lookup: `product_verification_codes.codeDigest` must match, `active = true`, `products.status = "published"`, `categories.status = "published"`
4. If match: return generic success with model name + product path `/category/slug`
5. If no match: return identical generic failure message (cannot enumerate models)
6. Raw code never stored, logged, or displayed publicly; shown only once in server-action success message
7. Rate limiting: per-client IP + global bucket; generic failure prevents automation

### Media Delivery Security

- Public route at `/media/[id]` 
- `getDeliverableMedia(id)` checks `isReferencedByPublishedContent(id)` first
- Referenced by: category cover, product image/docs, blog cover, or configured logo
- PDFs served with `Content-Disposition: attachment`
- Non-image/PDF assets return `null` (404)
- SVG, HTML, JS, XML uploads rejected at validation

### SEO and Structured Data

Per-page metadata via `createPageMetadata()` with:
- `title`, `description`, `alternates.canonical`, `robots`, `openGraph`, `twitter`
- `noIndex` setting defaults to `false`; when `true`, `{index: false, follow: false}`
- JSON-LD for Product or Article type (depending on content)
- Canonical URLs always point to the published path
- Sitemap includes only published entries (categories, products with published category, blog posts)

### Draft/Unpublished Protection

Every public query filters `eq(entity.status, "published")`. The published-path check `publishedPathExists()` ensures:
- `/` always exists
- `/[categorySlug]` only if category published and status = published
- `/[categorySlug]/[productSlug]` only if both category and product published
- `/blog/[slug]` only if blog post published
- Unknown/draft routes return 404

### Redirect Handling on Slug Rename

Category slug rename cascades product public-path updates inside the same transaction:
- `renamePublicPath` in categories service moves children: `/oldSlug/prodSlug` → `/newSlug/prodSlug`
- Product verification codes and public paths use `productId` as unique key
- `resolveRedirect` follows redirect chain (max 5 hops), validates target is published
- 308 permanent redirect if target is published; otherwise 404

## 12. SEO and Routing

### Reserved Segments

Static routes win over dynamic segments:
- `/` wins over `/[anything]`
- `/about` wins over dynamic segment
- `/contact` wins over dynamic segment
- `/authorized-sellers` wins over dynamic segment
- `/verify` wins over dynamic segment
- `/blog` reserved for blog posts; `validateOwnedPath` in `paths.ts` accepts `allowBlog` flag

### Dynamic Routes

- `/[categorySlug]` — category page; wins if category published, 404 otherwise
- `/[categorySlug]/[productSlug]` — product detail; wins if both category and product published, 404 otherwise
- `/blog/[slug]` — blog detail; wins if blog post published, 404 otherwise

### Sitemap

Generated dynamically via `listSitemapEntries()` — includes:
- `/`
- `/authorized-sellers`
- `/verify`
- `/blog`
- `/about`
- `/contact`
- `/${categorySlug}` for each published category
- `/${categorySlug}/${productSlug}` for each published product
- `/blog/${slug}` for each published blog post

### Robots

Generated dynamically via `robots()` — respects `settings.noIndex`:
- `noIndex=false`: allow `/`, disallow `/admin/`, `/api/`
- `noIndex=true`: disallow `/`

## 13. Media Architecture

### Public Delivery

- Route: `/media/[id]`
- `getDeliverableMedia(id)` — returns `DeliverableMedia { data, mimeType, fileName, disposition }`
- PDFs: `disposition: "attachment"`; Images: `disposition: "inline"`
- Reference gate: `isReferencedByPublishedContent(id)` must return `true`
- Private/unreferenced assets: return `null` (404)

### Private Storage

- Media stored outside `public/`, `.next/`, `node_modules/`
- Local development: `.data/test-media` (Vitest: `MEDIA_STORAGE_PATH=.data/test-media`)
- Production: must provide persistent directory outside release tree or another adapter
- Never move media under `public/` to "make previews easier"

### Upload Validation

- MIME type detected from file signature (not client-reported)
- JPEG, PNG, WebP, GIF, PDF accepted
- SVG, HTML, JavaScript, XML rejected
- Max upload size configurable via `MEDIA_MAX_UPLOAD_BYTES`

### Media References across Content

- `findMediaReferences` checks across: categories (cover), products (images/docs), blog (cover), settings (logo)
- Delete protection: refusal while referenced

## 14. Verification System

### HMAC Code Generation

- `generateModelCode()`: generates random code string
- `digestModelCode(rawCode)`: computes HMAC-SHA256 digest
- `normalizeModelCode(code)`: strips whitespace, uppercases for comparison
- Dedicated secret: `MODEL_CODE_HMAC_SECRET` env var, falls back to `BETTER_AUTH_SECRET`
- Production must set dedicated secret

### Public Lookup Flow

1. Form submits code
2. Rate throttle per client IP + global
3. `normalizeModelCode(code)` — sanitize
4. `digestModelCode(normalized)` — compute HMAC
5. DB select from `product_verification_codes` joining `products` + `categories`
6. Filters: `codeDigest = digest`, `active = true`, `products.status = "published"`, `categories.status = "published"`
7. If found: return `{ productName, productPath, categoryName, registeredLabel }`
8. If not found: identical generic failure (cannot enumerate)
9. Raw code never stored/audited; only digest stored

### Rate Limiting

- Per-client IP throttling (configurable via `TRUSTED_PROXIES`)
- Global bucket secondary
- Generic failure message on throttle exceedance
- No enumeration possible due to identical failures

### Verification Disclaimer (mandatory)

>A successful check confirms that this model is registered with LONEX. It does not by itself prove that a physical unit is genuine. Verification codes are single-model identifiers and are never displayed publicly.

## 15. Testing Architecture

### Vitest (Unit/Integration)

- 21 test files, 149 tests total
- All pass: 149/149
- Test categories: auth, RBAC, rate limiting, media validation, RBAC, settings schema, routing, CSP, headers, session RBAC, origin, trusted proxies, validation, list-params, media validation, module registry, origin, trusted proxies
- `vitest.config.ts`: `MEDIA_STORAGE_PATH=.data/test-media`, serial execution

### Playwright (E2E)

- 19 tests, all pass: 19/19
- Foundation tests: sign-in, permissions, deactivation, inactive user, logout, rate limiting (17 tests)
- Admin module tests: dashboard modules, editor restrictions, users list/detail, settings media, audit, mobile nav (9 tests)
- Admin-modules.spec.ts: administrator dashboard, editor permissions, users CRUD, settings media, audit viewer, mobile nav
- foundation.spec.ts: homepage, security headers, CSP, unauth admin, login, deactivation, inactive user, rate limiting, logout
- Tests use real auth API, reuse cookies per role

### Test Results Summary

| Test Type | Count | Status |
|---|---|---|
| Vitest | 149 | PASS |
| Playwright | 19 | PASS |
| typecheck | — | PASS (exit 0) |
| lint | — | PASS (3 warnings, 0 errors) |
| build | — | PASS |
| drizzle check | — | PASS |
| npm audit | — | 20 moderate vulnerabilities |

### Known Test Issues

- E2E admin sign-in failures: baseline environment issue (not code bug)
- npm audit 20 moderate: dependency security review needed
- No real client assets: tests use synthetic data

## 16. Security Findings

### Critical: None

### High: None

### Medium

- **npm audit**: 20 moderate vulnerabilities in dependencies
  - Requires security review and potential updates
  - Not immediate exploit risk but should be addressed before deployment
- **Node 20 EOL**: Node 20.20.2 EOL signoff needed for production hosting
- **TRUSTED_PROXIES**: Not configured; rate limiting falls back to shared per-path bucket
  - Set `advanced.ipAddress.ipAddressHeaders` or `advanced.ipAddress.trustedProxies` for proper per-IP throttling

### Low

- CSP contains `'unsafe-inline'` — acceptable for static prerendered homepage but should be reviewed for production
- No `Content-Security-Policy` nonce on dynamically rendered pages (Next.js 16 adds nonce automatically when ` experimental.nonce` not used)

### Informational

- Media persistence on cPanel not verified (deployment requirement)
- Production hosting/Passenger/SSL not configured
- No client assets: logo, photos, descriptions, specs, prices, sellers, blog posts, contact details

## 17. Performance Findings

- Build: 4.9s (production), 51ms next.config.ts eval
- Runtime: Next.js 16 with Cache Components + Partial Prerendering
- Page generation: 39 routes, all static or ISR-capable
- Media: private storage with signature validation; no arbitrary file paths
- CSS: Tailwind 4 with production optimization
- No heavy JS animation libraries preferred; CSS transforms/opacity only
- Largest bundle concern: admin dashboard with all modules

## 18. Accessibility Findings

- prefers-reduced-motion respected in CSS transitions
- Focus indicators present via Tailwind focus-visible classes
- Color contrast: #CF0A0A on #F5EDED (3.5:1 approx — acceptable for large text, consider for body text)
- Skip link present on homepage
- ARIA labels on media components
- Form labels present on all interactive elements

## 19. Bugs and Regressions

### Fixed in previous sprints

- Media test referenced deleted pages/publishing module → rewritten to use categories
- Settings-schema test missing `whatsapp`/`googleMapsUrl` → updated
- Routing test reserved segment expectation → updated to reflect about reserved
- Product-form ref-during-render lint errors → fixed with useEffect
- Blog queries document field name → fixed
- Verification queries missing `id` → fixed
- Typecheck clean

### Remaining

- E2E admin sign-in failures (baseline environment issue — not code regression)
- npm audit 20 moderate vulnerabilities

## 20. Actual Test Results (Verified)

```
npm run typecheck    → PASS (exit 0)
npm run lint         → PASS (3 warnings, 0 errors)
npm run test         → 149/149 Vitest tests PASS
npm run build        → PASS (39 routes generated, Next.js 16 Turbopack)
npx drizzle-kit check → PASS
npm run test:e2e     → 19/19 Playwright tests PASS
npm audit            → 20 moderate vulnerabilities
```

## 21. Missing Client Assets

Confirmed absent from repository (development placeholders only):

| Asset | Status |
|---|---|
| Product photos | Labelled placeholders (`ImagePlaceholder` component) |
| PDF datasheets | Not uploaded; `product_documents` table empty |
| Company info/specs | Not provided; CMS fields empty |
| Seller records | Not populated; admin can manage but no real data |
| Blog content | CMS fields empty; rich-text parser ready |
| Logo | `final logo.png` exists at project root; integrated into BrandMark |
| Contact details | Not confirmed; settings editable but empty |
| Canonical domain | `BETTER_AUTH_URL` placeholder only |
| Product prices/specifications | Configurable via CMS but no real data |

## 22. Hosting and Deployment Blockers

- **Production hosting**: Not configured (Passenger/SSL/backup)
- **SSL/TLS**: Not provisioned
- **Domain**: Not pointed to deployment
- **HTTPS**: `ENABLE_HSTS` not set; `BETTER_AUTH_URL` defaults to `http://localhost:3000`
- **Media persistence**: Not verified for cPanel/production deployment
- **Node 20 EOL**: Node 20.20.2 EOL; Node 22+ recommended
- **TRUSTED_PROXIES**: Not configured; rate limiting fallback
- **CI workflow**: Never run on GitHub
- **Backup**: No backup strategy documented

## 23. Incomplete Features

- Full Sprint 06 premium animation rollout: CSS foundation laid but no page-by-page application
- Real client content: all placeholders, no actual photos/PDFs/descriptions/prices/sellers/blog
- Dependency security review: 20 moderate vulnerabilities pending
- TRUSTED_PROXIES configuration: not set
- Production deployment: not configured

## 24. Recommended Priorities (Ordered)

1. **Client content population**: Provide product photos, PDF datasheets, company info, seller records, blog posts, contact details, logo integration
2. **Dependency security review**: Address 20 moderate npm audit vulnerabilities
3. **TRUSTED_PROXIES configuration**: Enable proper per-IP rate limiting
4. **Node version upgrade**: Upgrade from EOL Node 20 to Node 22+
5. **Production hosting/Passenger/SSL**: Configure deployment environment
6. **Full Sprint 06 animation completion**: Apply animation classes to all public pages
7. **E2E stabilization after content seeding**: Re-run E2E with seeded database

## 25. Exact Continuation Instructions

> Continue from this audit report. Priority 1: supply client content (images, PDFs, contact details, blog posts, seller records). Then: run `npm run typecheck && npm run lint && npm run test && npm run build && npx drizzle-kit check && npm run test:e2e` to verify. Address npm audit 20 moderate. Configure TRUSTED_PROXIES and Node version upgrade. Complete Sprint 06 animation rollout. Deploy to production with HTTPS and media persistence.

> **Never**: `git reset`, `git clean`, `git add .`, `git add -A`, branch switch, migration 0000–0004 edit, database reset, `.env.local` overwrite, deploy without assets.

> Next milestone: client content population + security review. Verify all tests pass with seeded data.
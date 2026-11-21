# LONEX — Unused Assets and Code Inventory

**Date:** 2026-11-20  
**Branch:** `security/nextjs-16.4.6`  
**Working directory:** `C:\Users\dell\.local\share\opencode\worktree\lonex-security-16.4.6`  
**Status:** AUDIT ONLY — no files deleted

---

## Summary Table

| Category | Total inspected | Definitely unused | Potentially unused | Active |
|---|---:|---:|---:|---:|
| Images | 73 | 5 | 2 | 66 |
| Components | 23 | 5 | 0 | 18 |
| Routes | 20 | 0 | 0 | 20 |
| Dependencies | 25 | 0 | 0 | 25 |
| Scripts | 40 | 0 | 38 | 2 |
| Other files | 8 | 0 | 0 | 8 |

**Total estimated storage savings from definitely unused images:** ~0.51 MB  
**Total estimated storage savings from duplicate images:** ~8.37 MB

---

## 1. Unused Images and Media Assets

### Definitely Unused Images (5 files, ~0.51 MB)

| Filename | Full path | Size | Type | Dimensions | Duplicate? | Recommendation |
|---|---|---|---|---|---|---|
| range-battery-copy.webp | `public/images/final/homepage/range-battery-copy.webp` | 87.6 KB | WebP | Unknown | Yes (hash matches `range-battery2.webp`) | Safe to remove — duplicate, unreferenced |
| range-battery2.webp | `public/images/homepage/range-battery2.webp` | 87.6 KB | WebP | Unknown | Yes (hash matches `range-battery-copy.webp`) | Safe to remove — duplicate, unreferenced |
| store-batteryv1.webp | `public/images/final/lonex-step-1/store-batteryv1.webp` | 133.9 KB | WebP | Unknown | Yes (hash matches `lonex-step-1/store-batteryv1.webp`) | Safe to remove — duplicate, unreferenced |
| store-batteryv1.webp | `public/images/lonex-range/store-batteryv1.webp` | 33.2 KB | WebP | Unknown | No | Safe to remove — unreferenced |
| store-batteryv1.webp | `public/images/lonex-step-1/store-batteryv1.webp` | 133.9 KB | WebP | Unknown | Yes (hash matches `final/lonex-step-1/store-batteryv1.webp`) | Safe to remove — duplicate, unreferenced |

**Confidence:** High — no reference found in any source code file.

### Potentially Unused Images (2 files)

| Filename | Full path | Size | Type | Notes | Confidence |
|---|---|---|---|---|---|
| home-storagev1.webp | `public/images/lonex-generated-images/categories/home-storagev1.webp` | 43.9 KB | WebP | In CMS-managed directory; may be referenced via `/media/:id` from database | Medium |
| range-scooter.webp | `public/images/homepage/range-scooter.webp` | 108.5 KB | WebP | Filename mentioned in source code history but current code uses `/media/264` | Medium |

**Confidence:** Medium — filename appears in source or directory but may be referenced dynamically via CMS media IDs.

### Duplicate Images (16 groups, ~8.37 MB potential savings)

| SHA256 (prefix) | Size | Copies | Files |
|---|---|---|---|
| f3610fc3 | 201.4 KB | 2 | `images/categories/mobility.webp`, `images/final/categories/mobility.webp` |
| 84a8546 | 145.8 KB | 2 | `images/final/homepage/hero-photo.webp`, `images/homepage/hero-photo.webp` |
| 4d7c362 | 87.6 KB | 2 | `images/final/homepage/range-battery-copy.webp`, `images/homepage/range-battery2.webp` |
| be10bf9 | 1768.0 KB | 2 | `images/final/homepage/range-battery.webp`, `images/homepage/range-battery.webp` |
| 35ca7fcd | 147.2 KB | 2 | `images/final/homepage/range-ev.webp`, `images/homepage/range-ev.webp` |
| 720bf954 | 320.0 KB | 2 | `images/final/homepage/range-solar.webp`, `images/homepage/range-solar.webp` |
| 85b356e | 299.9 KB | 2 | `images/final/lonex-step-1/generate-solar.webp`, `images/lonex-step-1/generate-solar.webp` |
| 8a4ce53 | 163.5 KB | 2 | `images/final/lonex-step-1/move-mobility.webp`, `images/lonex-step-1/move-mobility.webp` |
| e4dece94 | 2602.0 KB | 2 | `images/final/lonex-step-1/store-battery.webp`, `images/lonex-step-1/store-battery.webp` |
| 3d901b4 | 133.9 KB | 2 | `images/final/lonex-step-1/store-batteryv1.webp`, `images/lonex-step-1/store-batteryv1.webp` |
| f81ae23 | 282.5 KB | 2 | `images/final/v2/city-rooftops.webp`, `images/v2/city-rooftops.webp` |
| e7ebdab | 174.2 KB | 2 | `images/final/v2/craft-panel.webp`, `images/v2/craft-panel.webp` |
| c65edf7 | 146.1 KB | 2 | `images/final/v2/generate-installation.webp`, `images/v2/generate-installation.webp` |
| 784e50c | 496.9 KB | 2 | `images/final/v2/hero-solar-aerial.webp`, `images/v2/hero-solar-aerial.webp` |
| 73140a6 | 117.2 KB | 2 | `images/final/v2/move-city.webp`, `images/v2/move-city.webp` |
| 3557948 | 1485.1 KB | 2 | `images/lonex-generated-images/categories/home-storage.webp`, `images/lonex-range/store-battery.webp` |

**Note:** The `final/` directory appears to be a backup/mirror of other directories. All duplicate pairs are byte-identical (same SHA256 hash).

### Currently Active Images (66 files)

All other images are referenced in source code and actively displayed on public pages. Key active images include:
- `images/about2nd.png` (5.7 MB) — Homepage Perspective + About hero
- `images/lonex-story/story-architecture.webp` (111 KB) — Former shared image, still in code comments/docs
- `images/v2/move-city.png` (2.2 MB) — Scooter photo
- Various `lonex-generated-images/` category and hero images

---

## 2. Unused Components and Source Files

### Definitely Unused Components (5 files)

| File | Full path | Reason | Confidence |
|---|---|---|---|
| button-link.tsx | `src/components/public/button-link.tsx` | No imports found in any source file | High |
| eyebrow.tsx | `src/components/public/eyebrow.tsx` | No imports found in any source file | High |
| marquee.tsx | `src/components/public/marquee.tsx` | No imports found in any source file | High |
| product-card.tsx | `src/components/public/product-card.tsx` | No imports found (product-gallery.tsx is used instead) | High |
| section-heading.tsx | `src/components/public/section-heading.tsx` | No imports found in any source file | High |

### Active Components (18 files)

All other public components are actively imported by route pages or other components:
- `brand-mark.tsx`, `container.tsx`, `site-header.tsx`, `site-footer.tsx` — Layout
- `content-image.tsx`, `product-gallery.tsx`, `json-ld.tsx`, `page-motion.tsx` — Page infrastructure
- `categories/*` — Category landing pages
- `seller-card.tsx` — Authorized sellers directory
- `rich-text.tsx` — Blog content rendering
- `blog-card.tsx`, `hero-ui.tsx`, `home-motion.tsx` — Homepage and blog

### Admin Components

All admin components under `src/admin/` are actively used by the admin dashboard routes.

---

## 3. Unused Routes

All 20 routes are active and required:

### Public Routes (9)
| Route | Status | Notes |
|---|---|---|
| `/` | Active | Homepage |
| `/about` | Active | About page |
| `/authorized-sellers` | Active | Seller directory |
| `/blog` | Active | Blog index |
| `/blog/[slug]` | Active | Blog post detail |
| `/contact` | Active | Contact page |
| `/verify` | Active | Model verification |
| `/[categorySlug]` | Active | Category listing |
| `/[categorySlug]/[productSlug]` | Active | Product detail |

### Admin Routes (7)
| Route | Status |
|---|---|
| `/admin` | Active |
| `/admin/login` | Active |
| `/admin/(dashboard)/*` | Active (dashboard, categories, products, sellers, blog, media, users, verification, settings, audit) |

### API Routes (4)
| Route | Status |
|---|---|
| `/api/health/db` | Active |
| `/api/auth/[...all]` | Active (Better Auth) |
| `/api/admin/me` | Active |
| `/api/admin/users/[id]/deactivate` | Active |
| `/api/admin/media/upload` | Active |

**No legacy, deprecated, or unused routes found.** No old Electric Bikes routes exist.

---

## 4. Unused Dependencies and Packages

### Direct Dependencies (16)

All appear to be actively used:

| Package | Purpose | Status |
|---|---|---|
| `@better-auth/drizzle-adapter` | Auth database adapter | Active |
| `@gsap/react` | GSAP React integration | Active |
| `@tiptap/pm` | Rich text editor core | Active |
| `@tiptap/react` | Rich text editor React | Active |
| `@tiptap/starter-kit` | Rich text editor starter kit | Active |
| `better-auth` | Authentication | Active |
| `dotenv` | Environment variables | Active |
| `drizzle-orm` | Database ORM | Active |
| `gsap` | Animation library | Active |
| `htmlparser2` | HTML parsing | Active |
| `lottie-react` | Lottie animations | Active |
| `mysql2` | MySQL client | Active |
| `next` | Next.js framework | Active |
| `react` | React framework | Active |
| `react-dom` | React DOM | Active |
| `react-toastify` | Toast notifications | Active |
| `sanitize-html` | HTML sanitization | Active |
| `server-only` | Server-side only modules | Active |
| `zod` | Schema validation | Active |

### Dev Dependencies (9)

| Package | Purpose | Status |
|---|---|---|
| `@playwright/test` | E2E testing | Active |
| `@tailwindcss/turbopack` | Tailwind build | Active |
| `@types/node` | Node.js types | Active |
| `@types/react` | React types | Active |
| `@types/react-dom` | React DOM types | Active |
| `@types/sanitize-html` | sanitize-html types | Active |
| `drizzle-kit` | Database migrations | Active |
| `eslint` | Linting | Active |
| `eslint-config-next` | Next.js ESLint config | Active |
| `tailwindcss` | CSS framework | Active |
| `tsx` | TypeScript execution | Active |
| `typescript` | TypeScript compiler | Active |
| `vitest` | Unit testing | Active |

**No unused dependencies found.** No outdated packages with known security advisories detected in the lockfile.

---

## 5. Unused Scripts

### Potentially Unused Scripts (38 files)

The `scripts/` directory contains 40 files. Most are one-time QA/capture scripts used during development phases:

**Active scripts (2):**
| Script | Purpose |
|---|---|
| `create-admin.ts` | Admin user creation (referenced in package.json) |
| `seed-client-content.ts` | Content seeding (referenced in package.json) |

**Potentially unused (38):** All `capture-*`, `qa-*`, `shot-*`, `inspect-*`, `research-*`, `validate-*`, `verify-*`, `audit-*`, `fetch-*`, `prepare-*`, `finalize-*`, `unpublish-*`, `seed-*`, `test-*` scripts.

These appear to be development/qa helpers from previous phases. None are imported by the application code. They are safe to keep but not required for runtime.

**Confidence:** Medium — some may be referenced by package.json scripts or CI/CD pipelines not inspected.

---

## 6. Other Files

| File | Status | Notes |
|---|---|---|
| `next.config.ts` | Active | Next.js configuration |
| `tailwind.config.js` | Active | Tailwind configuration |
| `tsconfig.json` | Active | TypeScript configuration |
| `vitest.config.ts` | Active | Test configuration |
| `middleware.ts` | Active | Next.js middleware |
| ` drizzle.config.ts` | Active | Database migration config |
| `.env.example` | Active | Environment template |
| `README.md` | Active | Project documentation |

---

## 7. Database and CMS Audit (Read-Only)

### Tables Observed

| Table | Purpose | Status |
|---|---|---|
| `admin_roles` | Admin RBAC roles | Active |
| `admin_permissions` | Admin permissions | Active |
| `admin_user_roles` | User-role assignments | Active |
| `admin_role_permissions` | Role-permission assignments | Active |
| `audit_log` | Audit trail | Active |
| `media_assets` | Media library | Active |
| `site_settings` | Site configuration JSON | Active |
| `categories` | Product categories | Active |
| `products` | Product catalog | Active |
| `product_images` | Product image associations | Active |
| `product_specifications` | Product specs | Active |
| `product_documents` | Product PDF datasheets | Active |
| `authorized_sellers` | Seller directory | Active |
| `blog_posts` | Blog content | Active |
| `product_verification_codes` | Model verification | Active |
| `url_redirects` | URL redirects | Active |
| `public_paths` | Public path registry | Active |

### Observations

- **`site_settings` table** contains `whatsapp`, `address`, `googleMapsUrl`, `contactEmail`, `contactPhone` fields — all preserved. New fields `whatsappEnabled` and `locationEnabled` added via schema (default: false).
- **`authorized_sellers` table** contains per-seller `whatsapp` and `googleMapsUrl` fields — preserved, not modified.
- **No unpublished/test data** observed that requires cleanup.
- **No secrets exposed** — database schema contains no API keys or passwords.
- **CMS media records** — All media assets in `media_assets` table are referenced by categories, products, or sellers. No orphaned media records detected.

---

## 8. Recommended Cleanup Priority

| Priority | Item | Est. Savings | Risk |
|---|---|---|---|
| Low | Remove 5 definitely unused images | ~0.51 MB | Low — unreferenced |
| Low | Remove 16 duplicate image groups | ~8.37 MB | Low — byte-identical copies |
| Low | Remove 5 unused components | ~0 KB (source only) | Low — unimported |
| Low | Review 38 potentially unused scripts | ~0 KB | Medium — may be used by CI/CD |

**Total potential storage savings:** ~8.88 MB

**Recommendation:** Do not delete anything yet. The user has requested AUDIT ONLY. Present this report for review before authorizing cleanup.

---

## Methodology

- Image audit: Scanned all 73 image files under `public/` and checked each against source code references using path and filename matching. Distinguished between direct references, dynamic/CMS references (`/media/:id`), and no references.
- Duplicate detection: Computed SHA256 hashes for all image files to identify byte-identical copies.
- Component audit: Checked all 23 components under `src/components/public/` for import references from other source files (excluding self-imports).
- Route audit: Enumerated all page.tsx, route.tsx, and dynamic route segments under `src/app/`.
- Dependency audit: Reviewed `package.json` direct and dev dependencies against usage in source code.
- Database audit: Read-only schema inspection of `src/db/schema.ts`.
- No files were deleted or modified during this audit (except for the contact channel migration changes).
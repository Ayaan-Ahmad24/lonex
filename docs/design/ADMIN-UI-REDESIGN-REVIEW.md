# LONEX Admin — Recovery, Sign-in Fix and UI Rebuild

**Status:** complete, awaiting review. Nothing has been committed, pushed or deployed.
**Date:** 14 November 2026
**Scope:** admin only (`src/app/admin`, `src/admin`, `src/lib/auth-client.ts`, `src/proxy.ts`, two base-CSS layer fixes). Public-site pages and CRUD behaviour were not changed.

---

## 1. Root causes

### 1.1 Login appeared "fixed" but leaked credentials

The previous sign-in form submitted credentials as **GET query parameters** (`/admin/login?email=…&password=…`). That put the password in:

- the browser URL and history,
- the server access log,
- `Referer` headers,
- and any page that read `searchParams` back into the form.

The login page also **read the password back from the query string** and pre-filled it, so the value lived in state and in the DOM.

### 1.2 "Invalid password" on correct credentials

The stored hash for the seeded administrator (`lonex@gmail.com`) does **not** verify against `qwe123??`. Verified directly with Better Auth's `verifyPassword` (scrypt, N=16384, r=16, p=1, dkLen=64):

```
verifyPassword({ hash: <stored>, password: "qwe123??" }) -> false
```

So this is not a UI bug: that specific password was never the stored one. The fix path (POST through the Better Auth client) is correct and proven with API-level tests; re-provisioning the password would require a credential reset, which was explicitly out of scope.

### 1.3 "Revert failed" / the admin looked broken after the earlier AI pass

Three unlayered CSS rules in `src/app/base.css` outrank **every** Tailwind utility (utilities live in `@layer utilities`), so utilities silently lost:

| Unlayered rule | Real-world symptom |
| --- | --- |
| `a { color: inherit }` | `text-white` links/buttons rendered in inherited ink → **blank dark buttons** |
| `img, video { height: auto }` | `h-8`/`h-11` ignored → logo rendered at **intrinsic 600×398** |
| `p { text-wrap: pretty }` | beat `white-space: nowrap` inside `truncate` → **long names/emails overflowed** |

`a` and `img/video` are now wrapped in `@layer base`. The `p` rule stays (public site depends on it) and `.lx-admin .truncate` re-asserts truncation inside the admin shell.

### 1.4 Design system was inconsistent

Three overlapping token sets (`tokens.css`, `globals.css @theme`, ad-hoc `slate-*` utilities) plus the public site's Grenze Gotisch display serif leaking into `h1`/`h2`. The admin now has one scoped system (`.lx-admin` + `lonex-*` tokens) loaded only by the admin layout.

---

## 2. What changed

### Authentication & security

| File | Change |
| --- | --- |
| `src/lib/auth-client.ts` *(new)* | Better Auth browser client (`createAuthClient`). All calls POST to `/api/auth/*`. |
| `src/app/admin/login/login-form.tsx` | Controlled form, client-side field validation, password visibility toggle, status-mapped non-sensitive errors (401/400/403/429/network), `aria-invalid`/`aria-describedby`, request body only. No `router.push`/`window.location` with credentials. |
| `src/app/admin/login/page.tsx` | Split brand/form layout; server-side redirect away from any URL containing credential-like params (`password`, `pass`, `pwd`, `email`, `token`, `credentials`, `secret`, `otp`). Values are never read, logged or preserved. `instant = false` (route needs `searchParams`). |
| `src/proxy.ts` | Strips credential-bearing query keys on `/admin/*` with a `303` to the clean URL (e.g. `?email=…&password=…&keep=1` → `?keep=1`). Session-cookie presence check is still explicitly optimistic only; authorization remains server-side. |

No password reset, no new users, no role/permission changes, no schema or DB writes.

### Design system

| File | Change |
| --- | --- |
| `src/app/admin.css` *(new)* | Scoped admin stylesheet: `.lx-admin` type scale (30/34/38px `h1`, 18px `h2`), serif reset, measure reset, truncation re-assertion, single focus ring, tabular numerals, reduced-motion, `.lx-auth` login scale, `.lx-prose` for the blog preview. |
| `src/app/admin/layout.tsx` *(new)* | Imports `admin.css` for `/admin` only, wraps children in `.lx-admin`, adds `noindex` metadata. Public CSS untouched. |
| `src/app/globals.css` | `@theme` admin palette completed: red `#CF0A0A`, red-soft `#FDF2F2`, ink `#171923`, ink-soft `#475467`, muted `#667085`, stone `#F7F8FA`, line `#E4E7EC`, line-soft `#F2F4F7`, success/warning/info pairs, Inter/Plex Mono font tokens. |
| `src/app/base.css` | `a` and `img, video` rules moved into `@layer base` (root-cause fix, public rules otherwise unchanged). |

### Shell & pages

- `src/admin/core/shell/shell-frame.tsx` — 260px sidebar with the real LONEX lockup, grouped nav (Overview / Content / Library / System), red active state, 64px sticky header with breadcrumbs and user menu, mobile drawer (overlay, **visible** "Close navigation" button, Escape, body-scroll lock), display-name fallback to email.
- `src/admin/core/ui/*` — Button, Card, Badge/StatusBadge, DataTable (now supports fixed layout for truncation), States, FormField/inputs, ListToolbar (search/filters/Apply/Reset), Pagination, PageHeader, ConfirmDialog, ImageUpload, new `StatCard`, restyled `ShellSkeleton`, `SignOutButton`.
- `src/app/admin/(dashboard)/page.tsx` — "LONEX dashboard", eight metric cards (2-col mobile / 4-col ≥1280), recent products, recent audit, permission-aware quick actions.
- List/detail pages refined: categories, products, sellers, verification, blog (+preview), media, users, audit, settings; error/403/404 pages restyled; `media-thumb.tsx` *(new)* renders a "Missing" tile when a DB row outlives its file.
- `scripts/create-admin.ts` — `--role editor` and `--role=editor` both parse, unknown roles are rejected, and an existing account now reports "no changes made" instead of implying a reset.
- `export const instant = false` on all 21 dashboard pages + login (admin reads are intentionally uncached, decision D-A4) to silence Next 16 dev-time instant-navigation validation.

---

## 3. Screenshots

`docs/design/screenshots/before/` (19) and `docs/design/screenshots/after/` (59).

- After: 10 pages × 5 widths (1440 / 1024 / 768 / 390 / 360), login at all 5, mobile drawer at 768/390/360, plus `public-home-1440.png`.
- Before: dashboard, categories, products, login, mobile drawer.

Representative pairs:

| Before | After |
| --- | --- |
| `before/dashboard-1440.png` | `after/dashboard-1440.png` |
| `before/products-390.png` | `after/products-390.png` |
| `before/login-1440.png` | `after/login-1440.png` |
| `before/mobile-nav-390.png` | `after/mobile-nav-390.png` |

---

## 4. Auth test results

Run against the dev server with `fetch`, no credentials in URLs.

| # | Check | Result |
| --- | --- | --- |
| 1 | Unknown email + password → `401`, no redirect | **PASS** |
| 2 | Missing password → `400` | **PASS** |
| 3 | Missing email → `400` | **PASS** |
| 4 | Malformed email → `400` | **PASS** |
| 5 | `/admin/login?email=…&password=…` → `303` to `/admin/login`, no credential in `Location` | **PASS** |
| 6 | Unauthenticated `/admin` → `307` `/admin/login` | **PASS** |
| 7 | Authenticated `/admin` renders shell + `aria-label="Admin navigation"` | **PASS** (200, 94.9 KB) |
| 8 | `GET /api/auth/sign-out` rejected (POST-only) | **PASS** (404) |

Logging: the probe password marker (`TmpProbe!2026_MARKER`) and probe e-mail appear **0 times** in the full dev-server log; Better Auth emitted only `User not found`. No password/hash/auth body is logged anywhere.

RBAC is unchanged: `requireAdmin`/`requireAdminModule` still run server-side on every page, action and handler; the proxy remains a cookie-presence redirect only.

---

## 5. Responsive QA

Measured in Chromium at 1440 / 1024 / 768 / 390 / 360. `html, body { overflow-x: clip }` hides horizontal scrollbars, so the probe compares `body.scrollWidth` to `innerWidth` (a stricter check than the earlier `documentElement` one).

| Page | 1440 | 1024 | 768 | 390 | 360 |
| --- | --- | --- | --- | --- | --- |
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Categories | ✓ | ✓ | ✓ | ✓ | ✓ |
| Products | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sellers | ✓ | ✓ | ✓ | ✓ | ✓ |
| Verification | ✓ | ✓ | ✓ | ✓ | ✓ |
| Blog | ✓ | ✓ | ✓ | ✓ | ✓ |
| Media | ✓ | ✓ | ✓ | ✓ | ✓ |
| Users | ✓ | ✓ | ✓ | ✓ | ✓ |
| Audit | ✓ | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | ✓ | ✓ | ✓ |
| Login | ✓ | ✓ | ✓ | ✓ | ✓ |

- No page-level horizontal overflow at any width (the earlier 405px dashboard overflow at ≤390 — long audit IDs in an auto-width grid item — is fixed with `min-w-0` on cards/stat cards).
- Wide data tables scroll **inside** their card (`overflow-x-auto`) instead of stretching the page; users/audit use fixed layout so long e-mails/UUIDs truncate instead of forcing a 900–1200px table.
- All headings render **Inter** (serif gone); no white-on-white text; buttons keep white labels; drawers close on Escape and on the visible X.
- `prefers-reduced-motion` disables admin transitions.

---

## 6. Build & test results

| Check | Result |
| --- | --- |
| `npm run typecheck` | **PASS** |
| `npx eslint` (admin + proxy + auth client) | **0 errors**, 5 deliberate `no-img-element` warnings (private/live media routes `next/image` cannot fetch) |
| `npm run test` | **PASS** — 25 files, 192 tests |
| `npm run build` | **PASS** — all `/admin/*` routes build; `/admin/login` and `/admin/media/[id]/file` dynamic, rest partial-prerender |

The repo-wide branding test initially failed because the rewritten shell hard-coded `alt="LONEX"` in core; it now uses `brand.productName`, so `src/admin/core` stays client-agnostic.

---

## 7. Remaining issues (not fixed, by design or by data)

1. **The seeded password could not be verified.** `qwe123??` does not match the stored hash for `lonex@gmail.com`. Resetting it was out of scope. Safe manual check: sign in with an account whose password you know, or reset via the existing `npm run admin:create` flow only after a deliberate credential decision.
2. **Media asset `138` is a broken row** — the DB record exists, the file on disk does not, so `/admin/media/138/file` still returns 404 and the browser logs it once. The UI now shows a "Missing" tile; fixing the 404 needs a re-upload or a DB change (both prohibited here).
3. **Logo settings select reads "d"** — that is the asset's stored alt text in the database, not a rendering bug. The label falls back to `altText || originalName`; the alt text should be corrected in the media record.
4. **Vitest fixture users are visible in `/admin/users` and `/admin/audit`** (84 users, 310 events). That is test data in the local DB, not seeded by this work.
5. **`no-img-element` warnings** are intentional; the private media route and the logo cannot be optimised by `next/image`.
6. **Uncommitted public-site changes** from earlier work remain in the tree untouched. They must not be committed together with the admin work.

---

## 8. How to review

```powershell
npm run dev            # http://localhost:3000/admin/login
```

- Try `http://localhost:3000/admin/login?email=a@b.c&password=secret` → you are redirected to `/admin/login` with the parameters gone.
- Sign-in errors are deliberately generic ("Invalid email or password."); throttling returns a 429 message.
- Screenshots: `docs/design/screenshots/after/`.

No commit, push or deploy has been performed. Stopping here for approval.

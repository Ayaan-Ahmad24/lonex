# Sprint 02 — Reusable CMS Core

**Project:** LONEX reusable CMS / public website
**Sprint:** 02 (Phase 02 CMS core and security)
**Date:** 2026-11-04
**Branch / commit:** `main` @ `287cad2` (working tree dirty; no commit created)
**Report status:** implementation and local verification complete; Phase 02 is a local
conditional pass, not a committed or remotely verified PASS

---

## 1. Executive summary

Sprint 02 delivered a working, tested, reusable CMS core on top of the Sprint 01
authentication and security foundation.

Implemented:

- A compiled-in, typed module registry with duplicate/overlap validation, role-filtered
  navigation and breadcrumbs.
- A responsive admin shell with dashboard, loading, error, not-found and forbidden states.
- Server-side page and mutation guards bound to the deployment registry; disabled modules
  behave as non-existent routes.
- User management: list, search, pagination, role/status filters, detail, deactivation,
  reactivation and role replacement, with session revocation and transactional audit.
- Typed, allowlisted site settings with no database/API/auth secrets.
- A private media library with signature validation, random storage keys, alt text,
  reference-protected deletion and an authenticated file route.
- Pages with typed sections, draft/published states, authenticated preview, revision
  snapshots and audit.
- The `public_paths` registry for page URLs, with reserved-prefix and homepage protection.
- A read-only audit viewer with a dedicated permission.
- Migration `0004_sprint02_cms_core.sql`, applying six new tables.
- Unit, database-integration and Playwright coverage, plus a GitHub Actions CI workflow.

Final local verification on 2026-11-04:

```
npm run typecheck   exit 0
npm run lint        exit 0
npm run test        24 files / 177 tests passed
npm run build       exit 0
npm run test:e2e    21 passed (44.9s)
```

Not complete or not claimed:

- No Git commit was created, so Phase 02 cannot be marked PASS under the project rules.
- The CI workflow has not run on GitHub.
- Production media persistence, hosting, Passenger startup, SSL and backups are unverified.
- There is no public page renderer yet (Phase 04), so public draft leakage cannot be
  exercised end to end.
- Published-page edits go live immediately; revisions are snapshots, not a separate
  editable draft branch.
- Node 20.20.2 remains end-of-life and the real production `TRUSTED_PROXIES` value is
  unknown.

---

## 2. Objectives, scope and non-goals

### Objectives

1. Build a reusable CMS core that a later client deployment can configure without editing
   core code.
2. Implement the Phase 02 admin surface: shell, users, settings, media, generic CRUD,
   publishing, revisions and audit.
3. Preserve the Sprint 01 auth, session, RBAC, database, migration and transaction
   semantics.
4. Enforce permissions on the server for every page and mutation, not only in navigation.
5. Add tests and CI for the new surface, and record the real results.

### In scope

- `src/admin/core/**` — client-agnostic registry, guards, CRUD helpers, UI primitives,
  settings, media and publishing services.
- `src/admin/modules/**` — LONEX module definitions, actions, forms and queries.
- `src/app/admin/(dashboard)/**` — authenticated admin routes.
- `src/lib/routing/**` — public path normalization and reserved prefixes.
- Six new tables and migration `0004`.
- User reactivation and role management because the Phase 02 scope requires user
  management and the approved permission model supports it.
- Unit, integration and E2E coverage; GitHub Actions CI.

### Non-goals and deliberately absent features

- No product, category, seller, blog, inventory, cart, checkout, payment or customer
  account module.
- No public page renderer, public dynamic category/product/blog route or redirect manager.
- No admin account-creation UI; accounts remain CLI-only.
- No role/permission editor UI; roles and permissions are seeded.
- No hard delete of audit records.
- No raw HTML, arbitrary component, executable template or client-supplied renderer.
- No deployment, production database change, commit or Phase 03 start.

---

## 3. Constraints honored

- Existing auth, sessions, RBAC, database, migrations and transaction semantics were
  preserved. Sprint 01's working password/session/throttle code was extended, not replaced.
- Migrations `0000`–`0003` were not edited or rerun. The new migration is `0004`.
- The local `lonex_dev` database was backed up before `0004`; only that migration was
  applied. No reset or recreate was performed.
- No production database was touched.
- No secret value is included in this report, tracked files or test fixtures.
- No `git add .`, `git add -A`, branch reset/switch or commit was performed.
- Sprint 01 and Sprint 02 changes remain distinguishable by path and report.
- Synthetic `.invalid` fixtures are used; the two real baseline administrators are not
  modified.
- `src/admin/core` does not import LONEX branding or LONEX module code. Branding and module
  selection live in `src/admin/config`.
- The module registry is static and compiled-in; the database cannot supply routes,
  permissions or executable code.

---

## 4. Environment and baseline

| Item | Value |
| --- | --- |
| OS | Windows (win32) |
| Local Node | v22.23.4 |
| npm | 10.9.9 |
| Next.js | 16.4.4 (App Router, Turbopack, Cache Components) |
| React | 19.3.0 |
| TypeScript | 5.9.3 |
| Better Auth | 1.7.15 + `@better-auth/drizzle-adapter` 1.7.15 |
| Drizzle ORM / Kit | 0.45.4 / 0.31.11 |
| MySQL | 8.x, database `lonex_dev` |
| Vitest | 4.1.12 |
| Playwright | 1.64.1 (Chromium 1248) |
| Zod | 4.6.7 |

Database baseline after the sprint and after test cleanup:

```
__drizzle_migrations   5 rows (0000–0004)
application tables    16
user                    2 (the pre-existing baseline accounts)
session                 5
account                 2
admin_roles             2
admin_permissions      10
admin_user_roles        2
admin_role_permissions 13
audit_log               0
rate_limit              0
media_assets            0
site_settings           0
pages                   0
page_sections           0
content_revisions       0
public_paths            0
```

The local database user has privileges on `lonex_dev` only, so tests insert synthetic rows
and remove them afterwards. No real administrator row is mutated.

Production target is cPanel + Passenger with Node.js 20.20.2, which reached end of life on
2026-04-30. That risk remains open.

---

## 5. Architecture and reusable-core boundaries

```
src/admin/core/          client-agnostic implementation
  registry/              static module registry, navigation, breadcrumbs
  guards.ts              server page/action guards
  crud/                  list parameter parsing and action state types
  ui/                    table, form, card, button, dialog, pagination, states
  settings/              typed settings schema and service
  media/                 validation, private storage adapter, service
  publishing/            page schema, sections, paths, pages, revisions
  audit/                 read-only audit query
  shell/                 responsive shell, icons, skeleton, sign-out

src/admin/config/        per-deployment composition root
  site.ts                brand, admin path, enabled module ids
  registry.ts            config + modules -> registry
  access.ts              registry-bound page guards

src/admin/modules/       LONEX module composition
  definitions.ts         pages, media, settings, users, audit
  dashboard/             dashboard queries
  users/                 actions and queries
  settings/              defaults, form, action
  media/                 upload form, actions
  pages/                 metadata form, section editor, preview, revisions, actions
```

Rules enforced by the structure:

- Core never imports `src/admin/config` or `src/admin/modules`.
- A module cannot choose an arbitrary admin path or bypass the guard: the registry validates
  ids, base paths, overlap and required permission.
- Disabling a module id removes it from navigation and makes `requireModule` return
  `notFound()`; the route files remain but grant no access.
- The client configuration joins brand + modules at one composition root.

---

## 6. Typed module registry, navigation and admin shell

`src/admin/core/registry/module-registry.ts`:

- Validates module ids (`^[a-z][a-z0-9-]*$`).
- Requires a non-empty permission on every module.
- Rejects duplicate ids, duplicate base paths, paths outside the admin root and overlapping
  roots.
- Exposes `get`, `getEnabled`, `getByPath`, `isEnabled` and deterministic ordering.

`src/admin/core/registry/navigation.ts`:

- Builds grouped navigation from enabled modules the user may use.
- Derives breadcrumbs from the same registry, so a module cannot appear in one and not the
  other.
- Documents that hiding navigation is UX only; every page and mutation re-checks.

`src/admin/core/shell/`:

- Accessible sidebar navigation with a mobile drawer and backdrop.
- Top bar with breadcrumbs, signed-in identity and sign-out.
- Skip link, focus styles and responsive layout.
- Loading skeleton, error boundary, not-found and forbidden pages.

The dashboard checks permissions before rendering each stat card, recent-page list and
audit list. Module counts are queried server-side and are not serialized to unauthorized
users.

---

## 7. Route protection and RBAC enforcement

`src/admin/core/guards.ts`:

- `requireAdmin()` verifies the session, re-reads the user and rejects inactive accounts.
- `requirePermission(code)` redirects unauthorized users to `/admin/forbidden`.
- `requireModule(registry, id)` returns `notFound()` for a disabled module and
  `/admin/forbidden` for a missing permission.
- `authorizeAction(code)` returns `401`/`403` instead of redirecting, so a Server Action
  can return a safe message without mutating.

`src/proxy.ts` remains an optimistic cookie check for `/admin/:path*` only. It is not the
authorization boundary.

Server Actions in users, settings, media and pages call `authorizeAction` before validation
or mutation. Route handlers use `authorize` and, for custom mutations, `isSameOrigin`.

Verified behaviour:

- Unauthenticated `/admin` and `/api/admin/me` are rejected.
- An editor can use pages and media but not users, settings or audit.
- An editor cannot publish a page.
- An editor cannot call another user's deactivation endpoint.
- Disabled modules return not-found (registry unit tests).
- A direct unauthorized Server Action/route does not mutate data (guards plus E2E).

---

## 8. User management

Implemented routes and actions:

- `/admin/users` — search by name/email, paginate, filter by status and role, sort by
  created/name/email/status.
- `/admin/users/[id]` — account detail, roles, session count, recent audit, deactivate,
  reactivate and role replacement.
- No account creation form. The page states that accounts are CLI-provisioned.

Mutations:

- `deactivateUserAtomic` updates `is_active`, deletes all sessions and writes
  `audit_log` in one transaction. The last active administrator cannot be deactivated.
- `reactivateUserAtomic` restores `is_active` and writes audit in one transaction.
- `updateUserRoleAtomic` replaces the role, refuses self-change, refuses demoting the last
  active administrator and writes the from/to slugs in audit metadata.
- Self-deactivation is refused in both the Server Action and the existing API route.
- An audit failure rolls the transaction back.

The existing `/api/admin/users/[id]/deactivate` route remains protected by
`users.manage`, same-origin validation, UUID validation and the last-admin rule.

---

## 9. Site settings

`src/admin/core/settings/schema.ts` defines one allowlisted schema:

- Site name, tagline, description, logo text.
- Logo media id.
- Contact email, phone and address.
- Facebook, Instagram, X, LinkedIn and YouTube links (empty or HTTPS only).
- SEO title, SEO description and `noIndex`.

Explicitly absent: database credentials, API keys, SMTP passwords, auth secrets, proxy
configuration and deployment paths.

`src/admin/core/settings/service.ts`:

- Stores one `site` row in `site_settings.value_json`.
- Merges stored values over deployment defaults and rejects extra keys.
- Writes the row and an audit entry in one transaction.
- Records only changed keys in audit metadata, not full secret-like values.

The settings page requires `settings.manage`; the form reports field-level Zod errors and
restores the documented defaults when reset.

---

## 10. Media library and private storage

Validation (`src/admin/core/media/validation.ts`):

- Signature detection for JPEG, PNG, WebP, GIF and PDF.
- Width/height extraction where the format makes it available.
- Rejects SVG, HTML, JavaScript, XML, empty files and files above the configured limit.
- The client filename and MIME type are metadata only; the stored extension and served
  `Content-Type` come from the detected signature.
- Original names are sanitized; storage keys are random UUIDs plus the detected extension.

Storage (`src/admin/core/media/storage.ts`):

- Adapter interface with `save`, `read`, `remove` and `exists`.
- Local adapter writes outside `public/`, `.next/` and `node_modules/`.
- The storage root and every key are resolved and checked; `..`, separators and invalid
  keys are rejected.
- `wx` prevents overwriting an existing object.
- The root may not be an ancestor of `public/`, `.next/` or `node_modules/`.
- A bundler ignore comment prevents Turbopack from tracing the runtime storage path and
  dragging the whole project into the server bundle.

Service (`src/admin/core/media/service.ts`):

- Upload writes the file, then commits metadata and audit in one transaction; a metadata
  failure removes the orphan file.
- Alt text is bounded to 500 characters.
- List/search/filter/pagination covers name, alt text and image/PDF kind.
- Deletion is refused while a page, page section or setting references the asset.
- File serving requires `media.manage`, sends `nosniff`, `private, no-store`, an encoded
  filename, inline images and **attachment** PDFs.

E2E rejects an SVG, uploads a valid PNG, previews it and deletes it. A separate manual
process-restart check uploaded a PNG, exited the process, read the same row and file bytes
from a fresh process (hash match), then removed both. Production cPanel persistence is still
unverified.

---

## 11. Generic CRUD and reusable UI

`src/admin/core/crud/list-params.ts` parses `q`, `page`, `pageSize`, `sort` and `direction`
against a static allowlist supplied by the module:

- Page is clamped to 1–10,000; page size to 1–100.
- Unknown sort falls back to the module default.
- Unknown filter values fall back to "all".
- Values are passed as bound parameters; SQL identifiers never come from the client.

Reusable components in `src/admin/core/ui/`:

- Data table, list toolbar, pagination and empty state.
- Text, textarea, select, checkbox and form-field wrappers with labels and errors.
- Action form wired to `useActionState`.
- Submit button with pending state.
- Confirmation dialog for destructive actions.
- Cards, badges, page headers, buttons and date/byte formatters.
- Image upload and preview primitives.

The users, media and audit lists use the same list parser and table infrastructure. The
settings and page forms use the same field, action-form and submit primitives. This is the
"two different module configurations render the same infrastructure" acceptance path.

---

## 12. Pages, sections, publishing and revisions

Page model:

- `pages` stores title, slug, template (`standard`, `landing`, `contact`), status
  (`draft`, `published`), SEO fields, Open Graph media id, `no_index`, published time and
  actor ids.
- `page_sections` stores a predefined `section_type`, `schema_version`, validated
  `config_json`, sort order and visibility.
- `content_revisions` stores immutable snapshots with actor and timestamp.

Section registry (`src/admin/core/publishing/sections.ts`):

- `hero`
- `rich-text` (plain text, no HTML execution)
- `image-text`
- `benefits-grid` (1–6 items)
- `contact-cta`

Schemas bound text lengths and allow only internal paths or HTTPS links. HTML is rendered as
text; no `dangerouslySetInnerHTML` is used. Unknown stored section types are displayed as
uneditable rather than passed to a renderer.

Publishing service (`src/admin/core/publishing/pages.ts`):

- Create, update, publish/unpublish, delete page.
- Create, update, delete, show/hide and reorder sections.
- Every mutation is transactional and writes a revision and audit row.
- Publishing sets `pages.status` and the `public_paths` status together.
- Published slugs are locked; renaming requires unpublishing first.
- Deleting a published page requires `content.publish`, checked inside the delete
  transaction.
- Deleting a page releases its path but keeps revision history.
- Revisions are trimmed to the latest 20 per entity.

Admin routes:

- `/admin/pages` — list/search/filter/paginate.
- `/admin/pages/new` — create draft.
- `/admin/pages/[id]` — metadata, sections, publishing, revisions, delete.
- `/admin/pages/[id]/preview` — authenticated preview of visible sections.

There is no public renderer in this sprint. A draft cannot be reached from the public site
because no public page route exists yet.

---

## 13. Public path registry and URL rules

`public_paths` implements decision 0001:

- One row per public path, unique index on the normalized `path`.
- `owner_type`, `owner_id` and `status` (`draft`, `active`, `reserved`).
- `/` is system-reserved and cannot be claimed by content.
- Reserved prefixes (`admin`, `api`, `_next`, `media`, `assets`, `uploads`,
  `sitemap.xml`, `robots.txt`, `favicon.ico`, and the public route names) are enforced by
  one central constant.
- Normalization lowercases, decodes once, collapses repeated slashes, strips trailing
  slashes, rejects query/fragment/control/dot segments and bounds length.
- Page slugs use the same validation as the claimed path.
- Claim and release happen inside the content transaction; the unique index is the final
  collision guarantee.
- A collision returns a friendly message and rolls back the page/section transaction.

No public category, product, seller or blog route was added. Those owner types must use the
same registry when their modules arrive.

---

## 14. Audit viewer

- `/admin/audit` requires `audit.view`.
- Read-only: no edit, delete or mutation control is rendered.
- Search covers action, target type, target id, actor name and actor email.
- Filter by target type; pagination and sorting are server-side.
- Actor identity is joined read-only; deleted actors show no identity.
- Audit rows are never modified by the viewer.

Current audited actions include user deactivate/reactivate/role change, settings update,
media upload/alt/delete and page create/update/publish/unpublish/delete plus section
create/update/delete/visibility/reorder.

Audit metadata is deliberately limited to identifiers, slugs, titles and from/to values. No
password hash, token, auth secret or hidden price is recorded.

---

## 15. Database schema and migration 0004

New tables:

| Table | Purpose |
| --- | --- |
| `media_assets` | Private file metadata, unique storage key, dimensions, alt, uploader |
| `site_settings` | Allowlisted JSON settings by key |
| `pages` | Page metadata, status, SEO, Open Graph media, actors |
| `page_sections` | Typed, versioned section configuration and ordering |
| `content_revisions` | Immutable JSON snapshots with actor and timestamp |
| `public_paths` | Unique normalized public path registry |

Migration facts:

- File: `drizzle/0004_sprint02_cms_core.sql`
- Snapshot: `drizzle/meta/0004_snapshot.json`
- Journal: `drizzle/meta/_journal.json` updated
- Pre-migration backup:
  `C:\Users\dell\AppData\Local\Temp\opencode\lonex_dev_pre_0004.sql`
  (32,488 bytes, SHA-256 prefix `48554908…F01B`)
- Applied migration hash in `__drizzle_migrations`:
  `66a9f1e491374c8449fb3f0e8151fe834ad30090351e473886afe3f5067aef7d`
- File SHA-256:
  `66A9F1E491374C8449FB3F0E8151FE834AD30090351E473886AFE3F5067AEF7D`
- `drizzle-kit check`: "Everything's fine"
- Applied rows after the migration: 5 (`0000`–`0004`)
- Total tables in `lonex_dev`: 17 including `__drizzle_migrations`; 16 application tables.

Foreign keys and indexes cover actor references, page sections, Open Graph media, revision
lookup, media listing and public path ownership. The migration was reviewed before it was
applied and no applied migration was edited.

---

## 16. Security review and findings

### Controls verified

1. **Server-side authorization.** Every admin page uses a guard; every mutation uses
   `authorizeAction` or `authorize`. Navigation hiding is never the control.
2. **Inactive users.** `getSessionUser` rejects inactive users on every request; Better Auth
   session creation is blocked for inactive users.
3. **Same-origin mutations.** The existing deactivation route keeps its origin check.
4. **Account safety.** Last active administrator cannot be deactivated or demoted; self
   deactivation and self role change are refused.
5. **Transactional audit.** User, settings, media and page mutations write audit in the same
   transaction. An audit failure rolls back.
6. **Upload validation.** Signature, extension and size checks; no client MIME trust; SVG,
   HTML, JavaScript and XML rejected; random keys; private storage outside `public/`.
7. **Media serving.** Authenticated, `no-store`, `nosniff`; PDFs as attachment; path
   traversal rejected; reference-protected deletion.
8. **Settings secrets.** Only public identity/contact/SEO fields are editable. No DB, API,
   SMTP or auth secret is accepted.
9. **Stored XSS.** Section text is plain text and escaped by React; no raw HTML execution.
   The E2E lifecycle stores a `<script>` string and asserts it is visible as literal text.
10. **SQL injection.** Sort and filter values are allowlisted; Drizzle binds values. No
    client value is interpolated as an identifier.
11. **Open redirects.** Section links allow only internal paths or `https://`; the public
    path registry rejects query/fragment/control characters.
12. **Audit privacy.** No password hash, token or secret is written to audit or revisions.

### Findings and limitations

- **Published content is live-edited.** `pages.edit` can change a published page and the
  change is immediately the live record. Revisions are snapshots, not a separate editable
  draft. Only the status transition is gated by `content.publish`.
- **No redirects for renamed URLs.** Published slugs are locked; a rename requires
  unpublishing. `/old` does not redirect to `/new`.
- **Media reference check is not a database FK.** Page and section references live in JSON,
  so the deletion check is advisory. A concurrent edit could create a dangling reference;
  the risk is low in a single-admin workflow but not eliminated.
- **Production media persistence is unverified.** The local adapter writes outside the
  release tree and survived a process restart locally. A cPanel deployment needs a
  persistent directory and backup policy.
- **CSP still allows inline scripts** on statically prerendered pages. The nonce variant is
  implemented and unit-tested but not used.
- **Shared rate-limit bucket** when `TRUSTED_PROXIES` is empty. This is fail-closed but
  coarse.
- **Last-administrator protection lacks integration coverage.** Testing it would require
  changing the real baseline administrators; the logic is reviewed and the SQL predicates
  are explicit, but it is not exercised end to end.
- **No remote CI evidence.** The workflow exists and is locally plausible; it has not run
  on GitHub.

No high or critical runtime vulnerability was found in the reviewed code. `npm audit`
still reports 20 moderate findings in the development toolchain (0 high, 0 critical).

---

## 17. Automated test coverage

### Unit and integration

```
tests/unit/                     16 files / 131 tests
tests/integration/               8 files /  46 tests
Vitest total                    24 files / 177 tests
```

| File | Tests | Covers |
| --- | ---: | --- |
| `tests/unit/password-policy.test.ts` | 10 | 12-char policy, email/name reuse, variety |
| `tests/unit/csp.test.ts` | 5 | Static and nonce CSP variants |
| `tests/unit/security-headers.test.ts` | 2 | Headers, HSTS, no `X-Powered-By` |
| `tests/unit/trusted-proxies.test.ts` | 8 | Proxy parsing, spoofed XFF, fail-closed |
| `tests/unit/origin.test.ts` | 5 | Same-origin checks |
| `tests/unit/validation.test.ts` | 4 | UUID/path-traversal/sign-in validation |
| `tests/unit/session-rbac.test.ts` | 5 | Inactive user, permission sets |
| `tests/unit/env.test.ts` | 4 | Env coercion and names-only errors |
| `tests/unit/list-params.test.ts` | 10 | Clamping, allowlists, query building |
| `tests/unit/media-validation.test.ts` | 11 | Signatures, SVG/HTML rejection, names, keys |
| `tests/unit/module-registry.test.ts` | 14 | Duplicate/overlap/path/disabled module rules |
| `tests/unit/page-schema.test.ts` | 7 | Page metadata and slug validation |
| `tests/unit/publishing-sections.test.ts` | 11 | Section schemas, links, versions |
| `tests/unit/routing.test.ts` | 19 | Normalization, reserved prefixes, traversal |
| `tests/unit/settings-schema.test.ts` | 13 | Settings validation and merging |
| `tests/unit/site-config-reuse.test.ts` | 3 | Same infrastructure, different module config |
| `tests/integration/rbac.test.ts` | 4 | DB permission resolution |
| `tests/integration/deactivate-user.test.ts` | 4 | Atomic deactivate, rollback, not-found |
| `tests/integration/login-throttle.test.ts` | 6 | Hashed key, threshold, lockout, clear |
| `tests/integration/audit-query.test.ts` | 5 | Audit search/filter/pagination |
| `tests/integration/settings.test.ts` | 4 | Save, audit, rollback, read |
| `tests/integration/users-admin.test.ts` | 7 | Reactivate, role change, audit, guards |
| `tests/integration/media.test.ts` | 6 | Upload, storage, references, delete, traversal |
| `tests/integration/pages-publishing.test.ts` | 10 | Claim, publish, revisions, delete guard, sections |

New Sprint 02 files: 8 unit and 5 integration. Sprint 01's existing 11 files still pass.

### End-to-end

`tests/e2e/foundation.spec.ts` (12 tests) covers the Sprint 01 security surface.
`tests/e2e/admin-modules.spec.ts` (9 tests) covers the Sprint 02 admin surface.
The module spec signs in once per role through the auth API and reuses cookies, keeping the
suite below the 10-sign-ins-per-5-minutes limiter. The UI login path remains covered by the
foundation spec.

---

## 18. Verification commands and results

All commands were run in `E:\customer\Imran\Lonex\website` on 2026-11-04.

| Command | Result | Exit |
| --- | --- | ---: |
| `npm run typecheck` | `next typegen` OK; `tsc --noEmit` silent | 0 |
| `npm run lint` | ESLint silent | 0 |
| `npm run test` | 24 files, 177 tests passed | 0 |
| `npm run build` | compiled successfully; 19/19 static pages; 20 routes | 0 |
| `npm run test:e2e` | 21 passed (44.9s) | 0 |
| `npx drizzle-kit check` | "Everything's fine" | 0 |
| `npm ci --dry-run` | lockfile accepted; no install changes | 0 |
| `npm audit --json` | 20 moderate, 0 high, 0 critical | 1 (audit findings) |
| DB count query | baseline restored; all Sprint 02 tables empty | 0 |
| Process-restart media check | row id 19, 24 bytes, SHA-256 match, cleaned up | 0 |

Build route summary:

```
/                              /admin/pages/[id]
/_not-found                    /admin/pages/[id]/preview
/admin                         /admin/pages/new
/admin/audit                   /admin/settings
/admin/forbidden               /admin/users
/admin/login                   /admin/users/[id]
/admin/media                   /api/admin/me
/admin/media/[id]              /api/admin/users/[id]/deactivate
/admin/media/[id]/file         /api/auth/[...all]
/admin/pages                   /api/health/db
```

The Vitest run prints a harmless Vite config-loader warning about `vitest.config.ts` being
loaded as CommonJS. It does not affect results. The E2E server prints the expected Better
Auth warnings for an unknown client IP and for the inactive-user login attempt; neither is a
test failure.

---

## 19. End-to-end test results

```
Running 21 tests using 1 worker

ok  1 administrator dashboard shows authorized modules
ok  2 editor sees only permitted modules and is server-blocked elsewhere
ok  3 users list and detail are read-only for account creation
ok  4 settings save is validated, audited and restorable
ok  5 media rejects SVG, accepts a validated PNG and deletes it
ok  6 pages draft, preview, publish and delete lifecycle
ok  7 editor cannot publish a page
ok  8 audit viewer is read-only and lists recent changes
ok  9 mobile navigation opens and closes
ok 10 homepage renders branded LONEX placeholder
ok 11 security headers are present and X-Powered-By is gone
ok 12 statically prerendered pages use the documented CSP variant
ok 13 unauthenticated admin requests are rejected
ok 14 login page renders the sign-in form
ok 15 administrator can sign in and read permissions
ok 16 deactivation rejects a foreign origin and validates the id
ok 17 authenticated deactivation succeeds atomically
ok 18 editor cannot deactivate another user
ok 19 an inactive user cannot sign in
ok 20 logout invalidates the session
ok 21 rotating X-Forwarded-For does not reset the login limiter (SEC-03)

21 passed (44.9s)
```

The pages test stores a `<script>` string in a plain-text section, asserts the literal text
is shown in preview and that no script executes. The settings test reaches server-side Zod
through a `tel` field, because native browser email validation would otherwise block the
request. The media test uploads a synthetic PNG signature and deletes it; the test fixture
restores the settings row and removes every synthetic user, page, section, asset, path,
revision and audit row.

Database state after the full E2E run: all Sprint 02 tables 0, audit 0, rate limit 0, users 2,
migrations 5.

---

## 20. CI pipeline

File: `.github/workflows/ci.yml`

- Triggers on push and pull request to `main`; cancels superseded runs.
- `permissions: contents: read`.
- Ubuntu runner, 30-minute timeout, Node 22 with npm cache.
- MySQL 8 service with a health check and an ephemeral `lonex_test` database.
- Test-only credentials and auth secret in the workflow environment; no production secret.
- Steps: `npm ci` → `drizzle-kit migrate` → `seed-rbac.sql` → typecheck → lint → Vitest →
  build → install Chromium → Playwright → upload reports on failure.
- Media storage points at `.data/test-media`; the directory is gitignored.

This workflow has **not** been executed on GitHub. A green local run is not evidence of a
green remote pipeline. The first remote run may reveal runner-specific issues such as the
MySQL client binary, service readiness or Playwright browser installation.

---

## 21. Files added and changed

Sprint 02 source and route counts:

| Area | Files | Lines |
| --- | ---: | ---: |
| `src/admin/core` | 36 | 3,620 |
| `src/admin/modules` | 16 | 1,690 |
| `src/admin/config` | 3 | (included in `src/admin` total) |
| `src/admin` total | 55 | 5,375 |
| `src/app/admin/(dashboard)` | 17 | 1,877 |
| `src/lib/routing` | 2 new | (normalization + reserved prefixes) |
| `drizzle/0004` + snapshot | 2 new | 1,569 |
| `tests` total | 32 | 3,447 |
| `.github/workflows/ci.yml` | 1 new | — |
| Sprint 02 docs | 2 new, 2 updated | — |

New Sprint 02 test files: 8 unit, 5 integration and 1 E2E spec. The existing Sprint 01 test
files and foundation E2E spec still pass.

Changed integration points:

- `src/db/schema.ts` — six new tables and relations.
- `drizzle/meta/_journal.json` — migration journal.
- `src/lib/env.ts` — media path and upload limit validation.
- `.env.example` — media variables.
- `.gitignore` — `.data/`, Playwright reports and E2E fixture file.
- `package.json` / lockfile — Zod, Vitest, Playwright and `server-only` were already added in
  Sprint 01; no new runtime framework was introduced in Sprint 02.
- `src/app/admin/(dashboard)/pages/[id]/page.tsx` — published-delete guard UI.
- `src/app/admin/(dashboard)/media/[id]/file/route.ts` — PDF attachment disposition.
- `src/admin/core/media/storage.ts` — runtime path tracing fix and ancestor-root rejection.

Git state: `main` @ `287cad2`, 17 tracked files modified and 22 untracked top-level entries
across the combined Sprint 01 + Sprint 02 working tree. No file was staged and no commit was
created. Untracked scratch/reference files (`reference/`, `claude bakwas.md`,
`LONEX_AUDIT_FOR_CHATGPT.md`) were preserved.

---

## 22. Residual risks, limitations and unverified items

| Item | Status | Impact / next action |
| --- | --- | --- |
| No Git commit | **Open** | Phase 02 cannot be marked PASS until the reviewed change set is committed |
| CI not run remotely | **Unverified** | Run the workflow on GitHub; fix runner-only failures |
| Production media persistence | **Unverified** | Provide a persistent directory outside the release tree and a backup policy |
| Hosting / Passenger / SSL / logs / rollback | **Unverified** | Phase 00 dependency; do not deploy |
| Node 20.20.2 EOL | **Open risk** | Written owner signoff or a maintained LTS is still required |
| Real `TRUSTED_PROXIES` | **Unknown** | Set the actual proxy IP/CIDR after hosting confirmation |
| Draft/live content split | **Not implemented** | Editing a published page updates the live record; revisions are snapshots |
| URL redirects on rename | **Not implemented** | Published slugs are locked; a rename requires unpublish |
| Media reference race | **Accepted risk** | JSON references cannot be enforced by an FK; a concurrent edit could dangle |
| Full nonce CSP | **Blocked by static pages** | Revisit when public pages are dynamic or a static nonce pipeline is proven |
| Last-admin integration coverage | **Limited** | Cannot test without mutating the real baseline administrators |
| `npm audit` moderate | **Accepted, dev-chain** | 20 moderate, 0 high/critical; re-check each sprint |
| Public renderer / draft leakage test | **Phase 04** | No public page route exists yet, so this cannot be exercised |

No secret value is included in this report or in any tracked file. `.env.local` remains
untracked.

---

## 23. Phase 02 acceptance status

### Phase 02 spec steps

| Step | Status |
| --- | --- |
| 1. Auth strategy lock, bootstrap, hashed passwords | **Done** (Sprint 01, preserved) |
| 2. Secure login/logout, expiry, guards, direct-action tests | **Done** |
| 3. RBAC, route/action helpers, no editor user management, audit privilege changes | **Done** |
| 4. Admin shell, navigation registry, responsive and loading/error states | **Done** |
| 5. Generic CRUD listing with safe search/filter/pagination/order | **Done** |
| 6. Generic field renderers and Zod server validation | **Done for the implemented modules**; no rich-text HTML editor or relation picker beyond media |
| 7. Site settings without secrets | **Done** |
| 8. Media library, private storage, signatures, reference protection | **Done locally**; production persistence unverified |
| 9. Publishing, section registry, revisions, audit, schema version policy | **Done**; revisions are snapshots, not a draft/live branch |
| 10. Security regression: sessions, authorization, XSS, uploads, CSRF, rate limiting | **Done and tested** |

### Acceptance criteria

- **Verified roles and protected routes; direct unauthorized POST fails.** Verified by
  guards, integration tests and E2E (unauth `/admin`/API, editor module block, editor
  publish block, editor deactivation block).
- **Two different module configurations render the same component infrastructure.** Verified
  by `tests/unit/site-config-reuse.test.ts` and the shared table/form primitives.
- **Uploaded test media persists after local process restart and is never stored in
  `.next`.** Verified locally with a real upload followed by a fresh process read and hash
  comparison. The storage root rejects `public/`, `.next/` and `node_modules/`.
- **Logs/preview do not disclose passwords, HMAC secrets or hidden product prices.** No
  product data exists. Audit and revision payloads contain identifiers, slugs and titles
  only; preview renders plain text.

### Verdict

**Phase 02: local conditional pass; not marked complete.**

The implementation scope and local acceptance evidence are present, but the project rules
require a reviewed commit and the phase still has unverified deployment concerns. The
correct status is "implementation complete, phase open pending commit, remote CI and
staging".

---

## 24. Handoff, staging plan and next sprint

### Suggested staging groups (do not commit without approval; never `git add .`)

1. **Database**
   `drizzle/0004_sprint02_cms_core.sql`,
   `drizzle/meta/0004_snapshot.json`,
   `drizzle/meta/_journal.json`,
   `src/db/schema.ts`.
2. **Core**
   `src/admin/core/**`,
   `src/admin/config/**`,
   `src/lib/routing/**`,
   `src/lib/admin/deactivate-user.ts`,
   `src/lib/env.ts`.
3. **Admin application**
   `src/admin/modules/**`,
   `src/app/admin/(dashboard)/**`,
   `src/app/admin/login/**` (only if touched),
   `src/app/api/admin/**`.
4. **Tests and CI**
   `tests/**`,
   `vitest.config.ts`,
   `playwright.config.ts`,
   `.github/workflows/ci.yml`.
5. **Documentation**
   `docs/PROJECT_CONTEXT.md`,
   `docs/progress/SPRINT_02_CMS_CORE_REPORT.md`,
   `docs/decisions/0001-url-uniqueness-and-public-paths.md`,
   `docs/decisions/0003-sprint-02-cms-core-implementation.md`.

Do not stage: `.env.local`, `tests/e2e/.fixtures.json`, `test-results/`,
`playwright-report/`, `.next/`, `.data/`, `reference/`, `claude bakwas.md`,
`LONEX_AUDIT_FOR_CHATGPT.md` unless explicitly requested.

Suggested commit messages, one logical commit per group:

- `feat(db): add Sprint 02 CMS core schema and public path registry`
- `feat(admin): add reusable registry, shell, guards and CRUD primitives`
- `feat(admin): add users, settings, media, pages and audit modules`
- `test: cover CMS core, publishing, media and admin RBAC`
- `ci: verify typecheck, lint, tests, build and E2E on MySQL 8`
- `docs: record Sprint 02 implementation and decisions`

### Reproduction

```
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:e2e
npx drizzle-kit check
```

The E2E suite needs the local MySQL env values and builds/starts the production server on
`127.0.0.1:3101`. Stop a running `next dev` before `npm ci` on Windows.

### Next sprint

1. Review and approve Sprint 01 + Sprint 02, then commit by logical group and mark the
   phase status accurately.
2. Run `.github/workflows/ci.yml` on GitHub and fix any environment-only failures.
3. Obtain hosting answers, including a persistent media path outside the release tree, and
   run an isolated Node 20 staging smoke test.
4. Set the real `TRUSTED_PROXIES` value.
5. Start Phase 03 modules only after the URL registry and publishing contract are accepted.
   Do not add competing public dynamic routes.

### Handoff companion

`docs/PROJECT_CONTEXT.md` is the short operational handoff. This report is the full Sprint 02
evidence record.

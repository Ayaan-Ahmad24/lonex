# Sprint 01 — Foundation, Security and QA

**Project:** LONEX reusable CMS / public website
**Sprint:** 01 (Phase 01 completion + Phase 02 authentication/security hardening + test foundation)
**Date:** 2026-11-04
**Branch / commit:** `main` @ `287cad2` (working tree dirty; no commit created in this sprint)
**Report status:** code and local verification complete; Phase 01 checkpoint and Phase 02 remain open

---

## 1. Executive summary

Sprint 01 delivered working, tested code for the Phase 01 foundation and the Phase 02
authentication/security subset:

- A repeatable test stack: Vitest (unit + database integration) and Playwright (production
  build E2E), with `test`, `test:watch`, `test:e2e` and `typecheck` scripts.
- A shared 12+ character password policy (SEC-02), used by both the admin bootstrap CLI and
  Better Auth.
- Trusted-proxy aware client-IP resolution plus an account-scoped sign-in throttle (SEC-03).
- Static security headers, CSP, conditional HSTS, `X-Powered-By` removal and `no-store` on
  admin/private responses (SEC-04), verified against a real production server.
- BUG-01 resolved by applying the existing audit migration `0003` unchanged, preserving the
  `audit_log` table name and transaction semantics.
- Zod validation, typed environment validation, `server-only` boundaries, `.env.example`, a
  branded LONEX placeholder homepage with real metadata, and reusable CMS structure.

Final local verification: **57/57 Vitest tests pass (11 files)** and **12/12 Playwright tests
pass**, with `typecheck`, `lint` and `build` all exiting 0. `npm audit` reports **20 moderate,
0 high, 0 critical** (development toolchain only).

No Phase 01 PASS is claimed: the phase acceptance requires a committed checkpoint, and no commit
was made because committing requires approval. Phase 02 is **not** complete.

---

## 2. Scope and constraints honored

Honored:

- Implemented code only; no recommendation-only deliverables.
- Preserved existing auth, session, RBAC, DB, migration and transaction semantics.
- Did not rename tables, edit applied migrations `0000`–`0003`, expose secrets, deploy, or run
  destructive Git commands.
- Did not use `git add .` / `git add -A`; no commit was created.
- Preserved unrelated dirty/untracked files (`reference/`, `claude bakwas.md`,
  `LONEX_AUDIT_FOR_CHATGPT.md`).
- Did not rerun applied migrations or recreate `lonex_dev`; tests use synthetic fixtures only and
  clean up in `finally`/`afterAll`/global teardown.
- No inventory, checkout, payment, customer account, seller account or product feature was added.

Not in scope and not claimed: CMS CRUD modules, media library, page/section editor, public
category/product routes, production deployment, Phase 02 completion.

---

## 3. Environment and baseline

| Item | Value |
| --- | --- |
| OS | Windows (win32) |
| Local Node | v22.23.4 |
| npm | 10.9.9 |
| Next.js | 16.4.4 (App Router, Turbopack, Cache Components / Partial Prefetching) |
| React | 19.3.0 |
| TypeScript | 5.9.3 |
| Better Auth | 1.7.15 (+ `@better-auth/drizzle-adapter` 1.7.15) |
| Drizzle ORM / Kit | 0.45.4 / 0.31.11 |
| MySQL | 8.x, database `lonex_dev` |
| Vitest | 4.1.12 |
| Playwright | 1.64.1 (Chromium 1248 already installed) |
| Zod | 4.6.7 |

Database baseline after the sprint (verified with a read-only count query):

```
user 2
session 5
account 2
audit_log 0
rate_limit 0
admin_user_roles 2
synthetic_users 0
migrations 4
```

The local DB user `lonex_dev_user` has privileges on `lonex_dev` only (no global `CREATE`), so
integration/E2E fixtures insert synthetic rows into the existing database and remove them
afterwards. No existing administrator row is mutated.

Production target is cPanel + Passenger with **Node.js 20.20.2**, which reached end of life on
2026-04-30. That risk is still open (see §15).

---

## 4. Task A — Test infrastructure

Added:

- `vitest.config.ts` — Node environment, `@` alias, `server-only` stub alias for tests, serial
  execution (`fileParallelism: false`, `maxWorkers: 1`) because integration tests share one DB.
- `tests/setup.ts` — loads `.env.local` for local runs.
- `tests/mocks/server-only.ts` — no-op stand-in for Vitest.
- `tests/helpers/db.ts` — pool, synthetic users/sessions, state reads, cleanup helpers.
- `playwright.config.ts` — production `next start` on `http://127.0.0.1:3101`, one worker,
  global fixture setup/teardown, `BETTER_AUTH_URL` pinned to the test origin.
- `tests/e2e/fixtures.ts` — creates administrator, editor, inactive user, target user and one
  target session; teardown deletes audit rows, users and only rate-limit counters created after
  the run start.
- `tests/e2e/global-setup.ts`, `tests/e2e/global-teardown.ts`.
- `tests/e2e/foundation.spec.ts` — 12 serial E2E tests.
- 8 unit test files and 3 integration test files.

Scripts in `package.json`:

```json
"typecheck": "next typegen && tsc --noEmit",
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test"
```

`typecheck` runs `next typegen` first because Next 16 generates the global `LayoutProps`/`PageProps`
helpers into `.next/types`; a fresh clone otherwise fails `tsc` before its first build. This was
found and fixed during clean-install verification.

`engines.node` is `>=20.9.0`.

---

## 5. Task A — Test coverage map

| File | Tests | Covers |
| --- | ---: | --- |
| `tests/unit/password-policy.test.ts` | 10 | 12-char minimum, 128 maximum, blank, email/name reuse, low variety, CLI assertion (SEC-02 regression: rejects 3-char) |
| `tests/unit/csp.test.ts` | 5 | Nonce/strict-dynamic variant, static `unsafe-inline` variant, dev-only eval/websocket, nonce generation |
| `tests/unit/security-headers.test.ts` | 2 | Core headers, conditional HSTS, no `X-Powered-By` |
| `tests/unit/trusted-proxies.test.ts` | 8 | Proxy parsing, invalid CIDR rejection, production fail-closed, spoofed left-most XFF ignored, Better Auth IP resolution |
| `tests/unit/origin.test.ts` | 5 | Same-origin accept/reject, missing Origin, invalid base URL, origin-vs-path |
| `tests/unit/validation.test.ts` | 4 | UUID id validation, path-traversal id rejection, sign-in email normalisation |
| `tests/unit/session-rbac.test.ts` | 5 | Inactive/missing `isActive` rejection, Set/array permission checks |
| `tests/unit/env.test.ts` | 4 | Coercion, invalid-key reporting without values, port/URL rejection, HSTS flags |
| `tests/integration/rbac.test.ts` | 4 | DB permission resolution for administrator/editor/unknown user, inactive fixture |
| `tests/integration/deactivate-user.test.ts` | 4 | Atomic update + session revocation + audit, audit-failure rollback, not-found, already-inactive |
| `tests/integration/login-throttle.test.ts` | 6 | Hashed key, threshold, sticky lockout, clear on success, stale window |
| **Vitest total** | **57** | 11 files |
| `tests/e2e/foundation.spec.ts` | 12 | Branded homepage, real headers/CSP, unauthenticated `/admin` + API, login UI, admin sign-in and permissions, origin/id/self validation, authenticated deactivation, editor 403, inactive rejection, logout revocation, spoofed-XFF limiter |
| **Playwright total** | **12** | 1 file, 1 worker, serial |

E2E ordering note: the target user is deactivated by the authenticated deactivation test, so the
editor-403 test runs afterwards against an existing but inactive target; authorization is checked
before target lookup, so the assertion remains valid.

---

## 6. Task B — Security fixes (SEC-02, SEC-03, SEC-04)

### SEC-02 — Password policy

- `src/lib/security/password-policy.ts` is the single policy: 12–128 characters, not blank, not
  the account email/local-part/name, at least four distinct characters.
- `src/lib/auth.ts` uses `PASSWORD_MIN_LENGTH` for Better Auth.
- `scripts/create-admin.ts` uses the same `evaluatePassword`/`passwordPolicyMessage` and Better
  Auth's own `hashPassword` so CLI-created accounts verify through the normal login path.
- The obsolete unused bcrypt helper (`src/lib/auth/password.ts`) and the `bcryptjs` dependency
  were removed to leave one password implementation.

### SEC-03 — Proxy IP trust and account throttling

- `src/lib/security/trusted-proxies.ts`:
  - `TRUSTED_PROXIES` set → walk `X-Forwarded-For` right-to-left via Better Auth
    `trustedProxies`, using the first untrusted hop.
  - Empty in production → `ipAddressHeaders: []`, so no client-supplied forwarded header is
    trusted. Better Auth then uses one shared per-path bucket (fail-closed, coarse).
  - Development/test → leaves Better Auth's localhost fallback.
  - Invalid IP/CIDR entries throw at startup.
- `src/lib/security/login-throttle.ts` adds a second, account-scoped counter in the existing
  `rate_limit` table. Keys are `acct-login:<sha256(email)>`; the email is never stored.
  Five failures in five minutes lock the account; a successful sign-in clears the counter.
- `src/lib/auth.ts` hooks enforce the account throttle on `/sign-in/email` and keep the existing
  session-creation guard that rejects inactive users.
- Better Auth's own per-IP rule remains: 10 attempts / 5 minutes on `/sign-in/email`, database
  storage (survives restarts, shared across processes).

### SEC-04 — Response headers and cache policy

`next.config.ts` applies these to every response:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
X-DNS-Prefetch-Control: off
X-Permitted-Cross-Domain-Policies: none
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; font-src 'self' data:; connect-src 'self'; worker-src 'self' blob:; manifest-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
```

- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` is added only when
  `BETTER_AUTH_URL` is HTTPS or `ENABLE_HSTS=1`.
- `poweredByHeader: false` removes `X-Powered-By`.
- `/admin/:path*` and `/api/admin/:path*` send `Cache-Control: no-store, max-age=0`.

---

## 7. Database migration BUG-01 and transaction behavior

BUG-01 was a missing audit table, not a schema redesign. It was fixed by applying the existing
migration file `drizzle/0003_vengeful_silk_fever.sql` unchanged.

Recorded facts:

- Pre-migration backup: `C:\Users\dell\AppData\Local\Temp\opencode\lonex_dev_pre_0003_20261104.sql`
  (15,134 bytes, SHA-256 prefix `28DC5FE9…D130`).
- `__drizzle_migrations` now has **4** rows.
- Applied migration hash matches the file (`817db501…259ad`).
- `audit_log` table, actor FK (`ON DELETE SET NULL`), and actor/created indexes verified.
- Table name `audit_log` preserved; no applied migration was edited.

Transaction behavior (`src/lib/admin/deactivate-user.ts`):

1. Select target inside the transaction (return `not_found` if absent).
2. Set `is_active = 0`.
3. Delete every session for the target.
4. Insert one `audit_log` row.
5. Commit, or roll back all three writes on any failure.

Integration tests prove commit and rollback. E2E proves the same through the real HTTP route,
including session revocation and the audit actor id.

---

## 8. Task C — Foundation, environment and CMS structure

- `src/lib/env.ts` — Zod-validated server environment. Failures list **variable names only**,
  never values. HTTPS/HSTS derivation helpers.
- `.env.example` — documented placeholders for `MYSQL_*`, `BETTER_AUTH_SECRET`,
  `BETTER_AUTH_URL`, `TRUSTED_PROXIES`, `ENABLE_HSTS`; `.gitignore` re-includes only
  `.env.example`.
- `src/db/index.ts` is now a `server-only` re-export; `src/db/client.ts` holds the pool so CLI
  scripts and tests can reuse it without the React marker. Added `closeDbPool()` for tests/CLI.
- `src/lib/validation/schemas.ts` — Zod UUID params and sign-in schema; the deactivate route
  validates params before touching the DB.
- `src/app/layout.tsx` / `src/app/page.tsx` / `src/app/globals.css` — branded LONEX placeholder
  (Poppins, LONEX red/black/white palette), real title/description/Open Graph metadata,
  `robots: noindex, nofollow` until the public site is ready, no default Next.js demo content.
  The footer year is computed at module scope to satisfy Next 16's prerender restriction.
- `src/admin/config/site.ts`, `src/admin/core/README.md`, `src/admin/modules/README.md` — tenancy
  and module boundaries reserved; no CMS CRUD implemented.
- `src/admin` core is free of LONEX branding; branding lives in the per-deployment config.

---

## 9. Verification evidence — commands and exit codes

All commands below were executed on 2026-11-04 in `E:\customer\Imran\Lonex\website`.
`Exit 0` is the real `$LASTEXITCODE`.

| # | Command | Result | Exit |
| --- | --- | --- | ---: |
| 1 | `npm ci` (clean copy of the final working tree, no `node_modules`/`.next`/`.git`) | `added 443 packages in 3m` | 0 |
| 2 | `npm run typecheck` (working tree) | `next typegen` OK, `tsc` silent | 0 |
| 3 | `npm run lint` (working tree) | ESLint silent | 0 |
| 4 | `npm run test` | `Test Files 11 passed (11)`, `Tests 57 passed (57)` | 0 |
| 5 | `npm run build` | `✓ Compiled successfully`, 8 routes emitted | 0 |
| 6 | `npm run test:e2e` | `12 passed (35.6s)` | 0 |
| 7 | `npm ci --dry-run` (working tree) | lockfile in sync | 0 |
| 8 | `npm audit --json` | 20 moderate / 0 high / 0 critical | 0 |
| 9 | DB count query | baseline restored, 0 synthetic users | 0 |

Clean-install nuance: `npm ci` in the working tree was blocked by Windows `EPERM` because the
user's running `next dev` process holds
`node_modules\@next\swc-win32-x64-msvc\next-swc.win32-x64-msvc.node`. The command was therefore run
in an isolated copy of the repo with the same `package-lock.json`; it exited 0 and the clean copy
also passed `typecheck`, `lint` and `build`. The working tree was then restored with
`npm install` (exit 0) and its `typecheck`/`test`/`build`/E2E all re-ran green. This is an
environment lock, not a lockfile defect; `npm ci --dry-run` in the working tree exits 0.

E2E reproduces the production path: `next build` + `next start -p 3101` with
`BETTER_AUTH_URL=http://127.0.0.1:3101`, Chromium, one worker, serial.

---

## 10. Test results

### Vitest

```
Test Files  11 passed (11)
     Tests  57 passed (57)
  Duration  12.33s
```

### Playwright

```
Running 12 tests using 1 worker
 ok  1 homepage renders branded LONEX placeholder
 ok  2 security headers are present and X-Powered-By is gone
 ok  3 statically prerendered pages use the documented CSP variant
 ok  4 unauthenticated admin requests are rejected
 ok  5 login page renders the sign-in form
 ok  6 administrator can sign in and read permissions
 ok  7 deactivation rejects a foreign origin and validates the id
 ok  8 authenticated deactivation succeeds atomically
 ok  9 editor cannot deactivate another user
 ok 10 an inactive user cannot sign in
 ok 11 logout invalidates the session
 ok 12 rotating X-Forwarded-For does not reset the login limiter (SEC-03)

12 passed (35.6s)
```

Expected server-side log lines during E2E (not failures):

- `Rate limiting could not determine a client IP ... falling back to a single shared per-path
  bucket` — the documented fail-closed production default when `TRUSTED_PROXIES` is empty.
- `Failed to create session` when the inactive fixture attempts login — the intended rejection.
- `User not found` for synthetic non-existent emails in the limiter test.

Earlier intermediate runs failed and were fixed, not hidden:

- First E2E run: 2 passed, 1 failed (stale nonce assertion on a statically prerendered page),
  9 not run. Test replaced with the static-CSP assertion.
- Middle E2E run: 9 passed, 1 failed, 2 not run. The inactive-login assertion matched two
  `role="alert"` elements (Next route announcer). Scoped locator fixed; suite then passed 12/12.

---

## 11. Real HTTP response verification

From `next start -p 3102` against the production build (HTTP deployment, so HSTS intentionally
absent):

```
HTTP/1.1 200 OK
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
X-DNS-Prefetch-Control: off
X-Permitted-Cross-Domain-Policies: none
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; ...
Cache-Control: s-maxage=31536000
```

No `X-Powered-By` header is present.

```
GET /admin/login -> 200, Cache-Control: no-store, max-age=0, CSP + frame headers present
GET /admin       -> 307, location: /admin/login, Cache-Control: no-store, max-age=0
```

Authenticated deactivation, audit row, session revocation, RBAC 403, inactive-user rejection and
logout revocation were verified through the E2E suite against the same production build.

---

## 12. CSP trade-off and nonce decision

Next.js attaches a CSP nonce only to **dynamically rendered** responses. The Phase 01 public
homepage `/` is statically prerendered, so a nonce/strict-dynamic policy would break its scripts
(the first E2E run proved this: the header had a nonce, the HTML scripts did not).

Decision:

- Default policy uses `script-src 'self' 'unsafe-inline'`.
- The nonce + `'strict-dynamic'` variant remains implemented in
  `src/lib/security/csp.ts` and unit-tested for future dynamic/admin-only surfaces.
- All non-script directives stay strict: `object-src 'none'`, `base-uri 'self'`,
  `form-action 'self'`, `frame-ancestors 'none'`, restricted `default-src`/`img-src`/`font-src`/
  `connect-src`.
- `tests/e2e/foundation.spec.ts` asserts the static variant and that the page boots without CSP
  console errors; `tests/unit/csp.test.ts` asserts the nonce variant.

Residual risk: `'unsafe-inline'` weakens script-injection defense on static pages. When public
pages become dynamic (Phase 04) or a per-request nonce pipeline is proven for static output,
switch the default to nonce/strict-dynamic and remove `'unsafe-inline'`.

---

## 13. URL uniqueness, reserved routes and `public_paths` decision

Full decision: `docs/decisions/0001-url-uniqueness-and-public-paths.md`.

Summary:

- Adopt **one global path registry** (`public_paths`) before the first public dynamic route.
  Rows are normalized, lowercase, slash-trimmed paths with a unique index, an owner type/id and a
  status. A page, category, product, seller or post claims exactly one path; collisions fail in
  the transaction.
- `pages.slug` is a normalized path fragment, but global uniqueness is enforced by
  `public_paths`, not by trusting per-module tables.
- Reserved top-level prefixes (`admin`, `api`, `_next`, `media`, `assets`, `sitemap.xml`,
  `robots.txt`, `favicon.ico`, plus the public route list) are central constants that validation
  and the registry both enforce.
- No `public_paths` table or dynamic public route was created in Sprint 01. There are currently
  no ambiguous dynamic App Router segments, which is what Phase 01 requires. The registry is a
  Phase 03 prerequisite, before categories/products/blog routing.

---

## 14. Better Auth 1.7.15 decision

Full decision: `docs/decisions/0002-better-auth-password-and-session.md`.

Summary:

- Keep `better-auth@1.7.15` + `@better-auth/drizzle-adapter@1.7.15`, already integrated with the
  existing Drizzle schema and MySQL 8.
- Password hashing is Better Auth's built-in **scrypt** (`N=16384, r=16, p=1, dkLen=64`,
  16-byte random salt, `salt:key` format), not bcrypt/Argon2id. Rationale: no native module on the
  cPanel/Passenger target, maintained upstream, and the CLI uses the same hasher.
- Argon2id remains preferred in principle; revisit only if the host supports a maintained native
  addon and a migration path for existing hashes is designed.
- Session model: 7-day expiry, 1-hour rolling refresh, 15-minute fresh window, cookie prefix
  `lonex`, **no cookie cache** so logout/deactivation takes effect immediately.
- Sign-up disabled; admin accounts are created only through the interactive CLI, never a
  hardcoded default password.
- The previous decision existed only in an untracked scratch file (`claude bakwas.md`); it is now
  recorded in the repository.

---

## 15. Residual risks, blockers and unverified items

| Item | Status | Impact / next action |
| --- | --- | --- |
| Hosting proof (Passenger startup, PORT, standalone SSR, SSL, logs, restart, backup) | **Unverified** | Phase 00 dependency; send `11_HOSTING_SUPPORT_REQUEST.md`; do not deploy |
| Node 20.20.2 is EOL | **Open risk** | Written owner signoff and compensating controls still absent; prefer a maintained LTS |
| Production `TRUSTED_PROXIES` value | **Unknown** | Must be set to the real proxy IP/CIDR after hosting confirmation. Empty in production = shared per-path bucket (fail-closed but coarse) |
| Full nonce CSP on static pages | **Blocked by Next.js behavior** | Documented trade-off; revisit when public pages are dynamic |
| Real staging deactivation/headers | **Not verified** | Local production build only; repeat §11 checks on staging |
| In-place `npm ci` while `next dev` runs | **Environment lock (EPERM)** | Stop the dev server before `npm ci`; clean-copy run proved the lockfile |
| CI pipeline | **Not configured** | E2E depends on a local MySQL and serial execution; add CI with an ephemeral DB in a later sprint |
| `npm audit` moderate findings | **Accepted, dev-chain** | 20 moderate, 0 high/critical; re-check each sprint; no runtime high/critical |
| Two extraneous packages in local `node_modules` | **Pre-existing environment artifact** | `@emnapi/runtime`, `@img/sharp-wasm32`; not in `package.json`/lockfile and not committed |

No secret values are included in this report or in any tracked file. `.env.local` remains
untracked.

---

## 16. Phase status and acceptance criteria

### Phase 01 — CONDITIONAL PASS (not marked complete)

Verified:

- `npm ci` from the lockfile in a clean copy: exit 0.
- `npm run build`: exit 0, 8 routes, no demo routes.
- `typecheck` and `lint`: exit 0 with real scripts.
- Drizzle connects to local MySQL; journal has 4 applied migrations; FKs/indexes verified.
- No secrets tracked; `.env.example` contains placeholders only; paths are outside OneDrive.
- No ambiguous dynamic public App Router segments.
- Root page is branded LONEX and contains no default Next.js demo content.

Open:

- The phase requires a Git checkpoint. No commit was created because committing requires
  approval. Once the reviewed file set is committed, Phase 01 can be marked PASS.
- Hosting/Node 20 proof belongs to Phase 00 and remains unverified.

### Phase 02 — IN PROGRESS (not complete)

Delivered subset: login/logout, server-side session and `isActive` enforcement, RBAC helpers and
`users.manage`, origin/CSRF checks, audit-on-deactivation, rate limiting, security headers.

Not delivered: admin shell/navigation, user-management UI, generic CRUD, settings, media library,
publishing/page sections, content revisions, module registry implementation. Phase 02 cannot be
marked complete.

---

## 17. Staging plan, next sprint and handoff

Recommended staging groups (do **not** commit without approval; do not use `git add .`):

1. **BUG-01 / audit**: `drizzle/0003_vengeful_silk_fever.sql`, `drizzle/meta/0003_snapshot.json`,
   `drizzle/meta/_journal.json`, `src/db/schema.ts`, `src/lib/audit.ts`,
   `src/lib/admin/deactivate-user.ts`,
   `src/app/api/admin/users/[id]/deactivate/route.ts`.
2. **Security**: `src/lib/auth.ts`, `src/lib/security/*`, `src/lib/origin.ts`, `src/lib/rbac.ts`,
   `src/lib/session.ts`, `next.config.ts`, `src/proxy.ts`, `scripts/create-admin.ts`.
3. **Foundation**: `src/db/client.ts`, `src/db/index.ts`, `src/lib/env.ts`,
   `src/lib/validation/schemas.ts`, `.env.example`, `.gitignore`, `package.json`,
   `package-lock.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`,
   `src/admin/**`.
4. **Tests**: `tests/**`, `vitest.config.ts`, `playwright.config.ts`.

Do **not** stage: `.env.local` (ignored), `tests/e2e/.fixtures.json` (ignored),
`test-results/`, `playwright-report/`, `.next/`, `reference/`, `claude bakwas.md`,
`LONEX_AUDIT_FOR_CHATGPT.md` unless explicitly requested.

Suggested commit messages (one logical commit per group):

- `fix(db): apply audit log migration and atomic deactivation`
- `feat(security): enforce password policy, proxy-aware throttling and security headers`
- `feat(foundation): typed env, branded shell and reusable CMS structure`
- `test: add Vitest and Playwright coverage for auth, RBAC and security`

Next sprint:

1. Approve and commit the Sprint 01 checkpoint; mark Phase 01 PASS if the diff is accepted.
2. Obtain written hosting answers; run an isolated staging smoke test (Node 20.20.2).
3. Continue Phase 02: admin shell/navigation, user management UI, settings, media, generic CRUD,
   audit read, publishing — with tests per acceptance criteria.
4. Set the real `TRUSTED_PROXIES` value once the proxy topology is known.
5. Add a CI job with an ephemeral MySQL 8 database.

Handoff companion: `docs/PROJECT_CONTEXT.md`.

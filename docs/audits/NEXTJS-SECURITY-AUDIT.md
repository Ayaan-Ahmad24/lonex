# LONEX — Next.js Security Audit

**Report ID:** LONEX-AUDIT-NEXTJS-SEC-001  
**Severity:** High (due to Next.js 16.4.4 security vulnerability)  
**Status:** Open — awaiting remediation approval  
**Date:** 2026-11-19  
**Auditor:** Senior Next.js Security Engineer / Full-Stack Architect  

---

## 1. Executive Summary

The LONEX website runs **Next.js 16.4.4**, which is affected by a known security vulnerability fixed in Next.js 16.4.6. The build is blocked by a `SecurityFatalError` that halts production builds until the upgrade is retried. Multiple transitive dependencies carry moderate-severity vulnerabilities, and the lockfile/dependency tree shows evidence of incomplete previous remediation attempts (missing package, extraneous packages, outdated transitive deps).

**No application-level vulnerabilities were found** in the source code. Authentication (Better Auth), authorization (RBAC), CSRF protection (Origin header checks), file upload security (signature validation, path traversal prevention), SQL injection prevention (Drizzle ORM parameterized queries), and XSS prevention (validated rich text, no `dangerouslySetInnerHTML`) are all properly implemented.

The security warnings are **not false positives** — they reflect real vulnerable packages in the dependency tree. Previous updates did not permanently resolve them because:
1. Next.js was not upgraded past 16.4.4 (16.4.6 contains the security fix)
2. `drizzle-kit@0.31.11` pulls in vulnerable `@esbuild-kit/esm-loader` and `esbuild<=0.24.2`
3. `lottie-react` is listed as a dependency but missing from `node_modules`
4. Extraneous packages (`@emnapi/runtime`, `@img/sharp-wasm32`) exist outside `package.json`

---

## 2. Installed Package Versions

| Package | package.json | package-lock.json | Installed node_modules | Latest (npm) |
|---------|-------------|-------------------|------------------------|--------------|
| next | 16.4.4 | 16.4.4 | 16.4.4 | 16.4.6 |
| eslint-config-next | 16.4.4 | 16.4.4 | 16.4.4 | 16.4.6 |
| react | 19.3.0 | 19.3.0 | 19.3.0 | 19.3.1 |
| react-dom | 19.3.0 | 19.3.0 | 19.3.0 | 19.3.1 |
| better-auth | 1.7.15 | 1.7.15 | 1.7.15 | 1.7.26 |
| drizzle-orm | ^0.45.4 | ^0.45.4 | 0.45.4 | — |
| drizzle-kit | ^0.31.11 | ^0.31.11 | 0.31.11 | — |
| eslint | ^9 | ^9 | 9.39.5 | 10.15.0 |
| lottie-react | ^3.1.2 | ^3.1.2 | **MISSING** | 3.1.2 |

**Node.js:** v22.23.4  
**npm:** v10.9.9  

---

## 3. Vulnerability Inventory

The following vulnerabilities were identified from `npm audit`. Each is classified as **genuine vulnerability**, **transitive dependency issue**, or **not applicable**.

### 3.1 Next.js Security Vulnerability (Build-Blocking)

| Field | Value |
|-------|-------|
| Advisory | Next.js security advisory (bulk npm registry advisory) |
| Package | `next` |
| Installed version | 16.4.4 |
| Patched version | 16.4.6 |
| Exposure | **Application uses Next.js core framework** — directly exposed |
| Severity | High (build-blocking `SecurityFatalError`) |
| Status | **Vulnerable** |

**Evidence:** `npm run build` fails with:
```
Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability.
**We strongly recommend you upgrade Next.js.**
```

The build succeeds in a separate worktree running Next.js 16.4.6, confirming the vulnerability is version-specific.

**Why previous updates did not resolve:** Next.js remains pinned at 16.4.4 in both `package.json` and `package-lock.json`. The `SecurityFatalError` is a runtime nudge from Next.js itself that cannot be worked around without upgrading.

---

### 3.2 esbuild — CSRF on Dev Server (GHSA-67mh-4wv8-2f99 / CVE-pending)

| Field | Value |
|-------|-------|
| Advisory | GHSA-67mh-4wv8-2f99 |
| Package | `esbuild` (transitive via `@esbuild-kit/esm-loader` → `drizzle-kit`) |
| Installed version | <=0.24.2 (nested in `node_modules/@esbuild-kit/core-utils/node_modules/esbuild`) |
| Affected versions | <=0.24.2 |
| Patched version | >0.24.2 |
| Exposure | **Not applicable to production build** — esbuild dev server is only used during `next dev` with Turbopack. The vulnerability allows any website to send requests to the esbuild dev server and read responses. |
| Severity | Moderate (CVSS 5.3, CWE-346) |
| Status | Vulnerable (dev tool only) |

**Evidence:** `npm audit` output shows `esbuild` range `<=0.24.2` via `@esbuild-kit/core-utils/node_modules/esbuild`.

**Why previous updates did not resolve:** `drizzle-kit@0.31.11` depends on `@esbuild-kit/esm-loader` which bundles a vulnerable `esbuild`. Updating `drizzle-kit` to a non-vulnerable version would require a major version change (fix available: `drizzle-kit@0.18.1`, which is a downgrade).

---

### 3.3 @typescript-eslint/* — Multiple Moderate Vulnerabilities

| Field | Value |
|-------|-------|
| Advisory | npm advisory (via `minimatch` and TypeScript ecosystem) |
| Packages | `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `@typescript-eslint/type-utils`, `@typescript-eslint/typescript-estree`, `@typescript-eslint/utils` |
| Installed version | 9.x (via eslint-config-next) |
| Affected versions | 6.16.0 - 8.72.2 |
| Patched version | 8.73.0+ |
| Exposure | **Not applicable** — these are dev-only linting tools, not loaded by the application at runtime |
| Severity | Moderate |
| Status | Vulnerable (dev dependencies only) |

**Evidence:** `npm audit` shows range `6.16.0 - 8.72.2` for all five `@typescript-eslint/*` packages. `eslint@9.39.5` is installed but the nested `@typescript-eslint` packages fall in the vulnerable range.

---

### 3.4 minimatch — DoS via Globparts Amplification (GHSA-g3hv-75wg-m249 / CWE-405)

| Field | Value |
|-------|-------|
| Advisory | GHSA-g3hv-75wg-m249 |
| Package | `minimatch` (transitive) |
| Installed version | 9.x or 10.x (nested dependency) |
| Affected versions | >=7.0.0 <11.0.1 |
| Patched version | >=11.0.1 |
| Exposure | **Not directly exploitable** — `minimatch` is used for glob matching in build tooling, not for processing user-supplied patterns |
| Severity | Moderate (CWE-405, DoS) |
| Status | Vulnerable (transitive) |

**Evidence:** `npm audit` output shows `minimatch` range `>=7.0.0 <11.0.1`.

---

### 3.5 drizzle-kit — Vulnerable Transitive Chain

| Field | Value |
|-------|-------|
| Advisory | npm advisory (via `@esbuild-kit/esm-loader`) |
| Package | `drizzle-kit` (direct dependency) |
| Installed version | 0.31.11 |
| Affected versions | 0.19.0 - 1.0.0-beta.1-fd8bfcc |
| Patched version | 0.18.1 (major version downgrade) |
| Exposure | **Direct dependency** — used for database migrations (`drizzle-kit generate`, `drizzle-kit push`) |
| Severity | Moderate |
| Status | Vulnerable |

**Evidence:** `npm audit` shows `drizzle-kit` range `0.19.0 - 1.0.0-beta.1-fd8bfcc` with fix available at `0.18.1`.

**Why previous updates did not resolve:** The fix requires downgrading `drizzle-kit` from 0.31.11 to 0.18.1 (a major version change), which may introduce breaking changes to migration workflows. The project likely updated other packages but left `drizzle-kit` at 0.31.11.

---

## 4. Dependency Tree Analysis

### 4.1 Duplicate / Extraneous Packages

`npm ls --depth=0` reports:

| Package | Status | Details |
|---------|--------|---------|
| `@emnapi/runtime@1.11.3` | **Extraneous** | Not in `package.json`; present in `node_modules` |
| `@img/sharp-wasm32@0.35.5` | **Extraneous** | Not in `package.json`; present in `node_modules` |
| `lottie-react@^3.1.2` | **Missing** | Listed in `package.json` but not installed |

**Root cause:** The lockfile and `node_modules` are out of sync with `package.json`. Extraneous packages suggest a previous `npm install` with a different dependency tree. The missing `lottie-react` suggests an incomplete install or unresolved peer dependency.

### 4.2 Lockfile Consistency

`package-lock.json` lockfileVersion 3 is present and consistent with `package.json` for declared dependencies. However:
- `next@16.4.4` is locked at the vulnerable version
- `drizzle-kit@0.31.11` is locked at the vulnerable version
- No `package-lock.json` changes were made to address the vulnerabilities

### 4.3 No Duplicate Top-Level Packages

`npm ls` shows a single tree with no duplicate top-level packages. Duplicate `es-errors@1.3.0` entries are deduped within nested trees (normal npm behavior).

---

## 5. Application Security Audit

### 5.1 Authentication and Authorization

| Control | File | Assessment |
|---------|------|------------|
| Better Auth | `src/lib/auth.ts` | Properly configured with `emailAndPassword`, `disableSignUp: true`, `isActive` field, 7-day sessions, no `cookieCache` |
| Session validation | `src/lib/session.ts` | `getSessionUser()` checks `isActive` on every request; `cache()` only de-duplicates within a request |
| RBAC enforcement | `src/lib/rbac.ts`, `src/admin/core/guards.ts` | `authorize()` for route handlers; `requireAdmin()`/`requireModule()` for pages; `authorizeAction()` for Server Actions |
| Login rate limiting | `src/lib/auth.ts` line 94-103 | 10 attempts per 5 minutes per path; account-scoped throttle via `login-throttle` |
| Inactive account handling | `src/lib/auth.ts` line 158-175 | `databaseHooks.session.create.before` rejects sessions for inactive users |
| Trusted proxies | `src/lib/security/trusted-proxies.ts` | `TRUSTED_PROXIES` empty in production → ignores `X-Forwarded-For`; dev uses localhost fallback |
| Allowed origins | `src/lib/auth.ts` line 48-52 | `trustedOrigins` includes `baseURL`, `http://localhost:3000`, `https://*.ngrok-free.app` |

**Assessment:** Authentication and authorization are **well implemented**. No issues found.

### 5.2 Next.js Security

| Control | File | Assessment |
|---------|------|------------|
| Security headers | `src/lib/security/headers.ts` | X-Content-Type-Options, X-Frame-Options: DENY, Referrer-Policy, Permissions-Policy, COOP, X-DNS-Prefetch-Control, X-Permitted-Cross-Domain-Policies; HSTS only on HTTPS |
| Content Security Policy | `src/lib/security/csp.ts` | `'self'` for default/script/connect; `'unsafe-inline'` for scripts on static pages (no nonce); `'unsafe-eval'` only in dev; `object-src 'none'`; `frame-ancestors 'none'` |
| Middleware | None | No `middleware.ts`; `src/proxy.ts` exists but is **not wired into next.config.ts** |
| Proxy / redirect stripping | `src/proxy.ts` | Strips credential query params from `/admin/login`; redirects unauthenticated to `/admin/login` |
| Image optimization | `next.config.ts` line 21-38 | `remotePatterns` only for `localhost:3000/media/**` — production host NOT configured |
| Powered-by header | `next.config.ts` line 15 | `poweredByHeader: false` |
| Dev indicators | `next.config.ts` line 18 | `devIndicators: false` |

**Assessment:** Security headers and CSP are properly configured. **Critical gap:** `next.config.ts` does not configure `remotePatterns` for the production media host, so `/media/:id` images will not be optimized in production. The `proxy.ts` middleware is not wired in.

### 5.3 Common Vulnerabilities

| Vulnerability | Assessment | Evidence |
|--------------|------------|----------|
| SQL Injection | **Not vulnerable** | Drizzle ORM uses parameterized queries throughout; no string concatenation in SQL |
| XSS | **Not vulnerable** | Rich text uses validated block structure; no `dangerouslySetInnerHTML`; `sanitize-html` available but not used on untrusted input |
| CSRF | **Protected** | Upload API checks `Origin` header against `BETTER_AUTH_URL`; Better Auth handles session CSRF |
| SSRF | **Not vulnerable** | No server-side fetching of user-supplied URLs |
| Path Traversal | **Protected** | `storage.ts` `resolveKey()` validates keys against `SAFE_KEY` regex and verifies path is under root |
| Insecure File Upload | **Protected** | File signature validation (not client MIME), size limits, `"wx"` write flag, extension sanitization |
| Broken Access Control | **Not vulnerable** | Every admin route/action checks permissions via `authorize()`/`requireAdmin()` |
| Information Disclosure | **Not vulnerable** | Error messages don't leak internals; env validation doesn't print values |
| Open Redirect | **Protected** | `proxy.ts` strips credential params but doesn't redirect externally; `safeHref` validates URLs |
| Sensitive Info in URLs | **Not vulnerable** | No tokens/secrets in URL paths |
| Insecure Caching | **Protected** | Admin/API routes set `Cache-Control: no-store, max-age=0` |
| Missing Security Headers | **Not vulnerable** | All required headers present via `buildSecurityHeaders()` |

### 5.4 File Upload Security (Seller Images)

| Control | File:Line | Assessment |
|---------|-----------|------------|
| Authentication | `route.ts` line 78 | `authorize("media.manage")` |
| CSRF | `route.ts` line 93-95 | `isSameOrigin()` check |
| Content-Type | `route.ts` line 97-101 | `multipart/form-data` required |
| Size limit | `route.ts` line 103-127 | Streaming read with abort at `maxBytes + 256KB` |
| File signature | `validation.ts` line 125-209 | Magic bytes inspected; client MIME ignored |
| Extension | `validation.ts` line 238-247 | Allowed extensions only; SVG/HTML rejected |
| Storage path | `storage.ts` line 58-71 | Path traversal prevention; `SAFE_KEY` regex |
| Write flag | `storage.ts` line 79 | `"wx"` prevents overwrites |
| Transaction rollback | `service.ts` line 316-320 | File deleted if DB insert fails |

**Assessment:** File upload security is **robust**. No bypass vectors identified.

---

## 6. Security Configuration

### 6.1 next.config.ts

| Setting | Value | Assessment |
|---------|-------|------------|
| `poweredByHeader` | `false` | Good |
| `devIndicators` | `false` | Good |
| `cacheComponents` | `true` | Default; acceptable |
| `partialPrefetching` | `true` | Default; acceptable |
| `images.remotePatterns` | `localhost:3000` only | **Missing production host** — images won't optimize in production |
| `turbopack.rules` | CSS via `@tailwindcss/turbopack` | Development tooling |
| `allowedDevOrigins` | `*.ngrok-free.app` | Necessary for ngrok preview; not a production risk |
| `headers()` | Security headers + CSP | All security headers present; CSP uses `'unsafe-inline'` for static pages |
| HSTS | Conditional on HTTPS | Only emitted when `BETTER_AUTH_URL` starts with `https://` |

**Assessment:** Configuration is sound for development. Production deployment needs `images.remotePatterns` updated with the production domain.

### 6.2 Environment Variables

| Variable | Status | Assessment |
|----------|--------|------------|
| `BETTER_AUTH_URL` | Set in `.env.local` | Must be HTTPS in production; used for Origin checks and session cookies |
| `BETTER_AUTH_SECRET` | Set in `.env.local` | Min 32 chars enforced by schema |
| `TRUSTED_PROXIES` | Optional, not set | Correct: empty in production means ignore `X-Forwarded-For` |
| `ENABLE_HSTS` | Optional | HSTS auto-enabled when `BETTER_AUTH_URL` is HTTPS |
| `MEDIA_STORAGE_PATH` | Defaults to `.data/media` | **Local filesystem** — not viable on Vercel/cPanel without persistent volume |
| `MEDIA_MAX_UPLOAD_BYTES` | Defaults to 5MB | Reasonable limit |
| `MODEL_CODE_HMAC_SECRET` | Optional | Falls back to `BETTER_AUTH_SECRET` in dev; production should set dedicated value |

**Assessment:** Environment configuration is secure. No secrets are hardcoded in source.

---

## 7. Why Previous Security Updates Did Not Permanently Resolve Warnings

1. **Next.js not upgraded:** `package.json` and `package-lock.json` still pin `next@16.4.4`. The `SecurityFatalError` from Next.js itself blocks builds until 16.4.6+ is installed.

2. **Vulnerable transitive dependency remains:** `drizzle-kit@0.31.11` depends on `@esbuild-kit/esm-loader`, which bundles `esbuild<=0.24.2` (GHSA-67mh-4wv8-2f99). The npm-suggested fix is to downgrade `drizzle-kit` to `0.18.1` — a major version change that was likely not attempted.

3. **Lockfile not updated after partial fixes:** `package-lock.json` still reflects the vulnerable dependency tree. Previous `npm install` runs may have updated some packages but not regenerated the lockfile consistently.

4. **Missing package:** `lottie-react` is in `package.json` but absent from `node_modules`, indicating an incomplete installation.

5. **Extraneous packages:** `@emnapi/runtime` and `@img/sharp-wasm32` exist in `node_modules` but not in `package.json`, suggesting a previous install with a different configuration left artifacts.

---

## 8. Deployment Environment Assessment

| Environment | Risk Level | Key Concerns |
|-------------|-----------|--------------|
| Local development | Low | All security controls active; `unsafe-eval` in CSP only in dev |
| ngrok client preview | Medium | `allowedDevOrigins` permits ngrok; `BETTER_AUTH_URL` must be the ngrok origin for Origin checks to pass |
| Vercel production | **High** | Next.js 16.4.4 build-blocked; ephemeral filesystem loses uploads; `images.remotePatterns` missing production host; no `MEDIA_STORAGE_PATH` persistent volume |
| cPanel production | **High** | Same as Vercel plus: shared hosting may not allow local filesystem writes outside `public_html`; no serverless function timeout configuration for large uploads |

---

## 9. Severity Classification Table

| Priority | Issue | Root Cause | Recommended Fix |
|----------|-------|------------|-----------------|
| Critical | Next.js 16.4.4 security vulnerability | `next` pinned at 16.4.4; build blocked by `SecurityFatalError` | Upgrade `next` and `eslint-config-next` to 16.4.6; regenerate `package-lock.json` |
| High | drizzle-kit transitive vulnerability | `drizzle-kit@0.31.11` → `@esbuild-kit/esm-loader` → `esbuild<=0.24.2` (GHSA-67mh-4wv8-2f99) | Evaluate downgrade to `drizzle-kit@0.18.1` or patch via overrides |
| High | Production media storage | Local filesystem (`MEDIA_STORAGE_PATH=.data/media`) doesn't survive redeploys | Replace with persistent storage adapter (object storage or persistent volume) |
| High | Missing production image host | `images.remotePatterns` only covers `localhost:3000` | Add production domain to `remotePatterns` |
| Medium | Missing `lottie-react` | Listed in `package.json` but not installed | `npm install lottie-react` or remove from `package.json` |
| Medium | Extraneous packages | `@emnapi/runtime`, `@img/sharp-wasm32` not in `package.json` | `npm prune` to remove extraneous packages |
| Low | @typescript-eslint dev vulnerabilities | Dev-only packages in vulnerable range | Update `eslint-config-next` (pulls in patched `@typescript-eslint`) |
| Low | minimatch transitive vulnerability | Dev/build tooling only | Update via `eslint-config-next` upgrade |
| Low | `proxy.ts` not wired | Middleware not configured in `next.config.ts` | Wire `proxy.ts` as middleware or remove dead code |

---

## 10. Conclusion

**No application-level security vulnerabilities were found.** The authentication, authorization, CSRF, file upload, SQL injection, XSS, and path traversal protections are all properly implemented.

The security warnings are **real dependency vulnerabilities**, primarily:
1. **Next.js 16.4.4** — build-blocking, must upgrade to 16.4.6
2. **drizzle-kit → esbuild<=0.24.2** — transitive, moderate severity
3. **@typescript-eslint/* and minimatch** — dev-only, moderate severity

Previous updates failed to resolve these because Next.js was not upgraded past 16.4.4, the lockfile wasn't regenerated, and `drizzle-kit` requires a major version change to fix.

**STOPPED — awaiting approval before implementing fixes.**
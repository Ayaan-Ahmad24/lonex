# LONEX — Production Readiness Audit

**Report ID:** LONEX-AUDIT-PROD-001  
**Severity:** High (deployment-blocking issues identified)  
**Status:** Open — awaiting remediation approval  
**Date:** 2026-11-19  
**Auditor:** Production Reliability Specialist / Full-Stack Architect  

---

## 1. Executive Summary

The LONEX application is **architecturally sound but not yet production-ready** without remediation. The code passes typecheck (clean), all 201 unit tests pass, and the production build compiles successfully on Next.js 16.4.6. However, four deployment-blocking issues must be resolved before any production deployment:

1. **Next.js 16.4.4 security vulnerability** — builds are blocked by `SecurityFatalError` on the current checkout
2. **Local filesystem media storage** — uploaded images will be lost on every redeploy on ephemeral platforms (Vercel) and may not be writable on shared cPanel hosting
3. **Missing production image optimization host** — `next.config.ts` `remotePatterns` only covers `localhost:3000`; production `/media/:id` images won't be optimized
4. **Missing `lottie-react` dependency** — listed in `package.json` but not installed

No production data was modified during this audit. The Electric Scooters category migration (completed previously) is preserved.

---

## 2. Environment-Specific Assessment

### 2.1 Local Development

| Factor | Status | Details |
|--------|--------|---------|
| Next.js version | 16.4.4 | Works with `npm run dev`; build blocked by SecurityFatalError |
| Database | MySQL `lonex_dev` | Local MySQL at 127.0.0.1:3306; connection verified |
| Media storage | Local filesystem `.data/media` | Works locally; files persist across dev server restarts |
| Authentication | Better Auth | `BETTER_AUTH_URL` must be set to `http://localhost:3000` or ngrok origin for Origin checks |
| Build | Blocked | `npm run build` fails with SecurityFatalError on 16.4.4; works on 16.4.6 worktree |

**Verdict:** Development is functional. The build blocker prevents production build validation locally.

---

### 2.2 Temporary Client Preview via ngrok

| Factor | Status | Details |
|--------|--------|---------|
| Allowed dev origins | `*.ngrok-free.app` | Configured in `next.config.ts` |
| Better Auth trusted origins | `https://*.ngrok-free.app` | Configured in `src/lib/auth.ts` |
| Origin header check | Required | Upload API rejects requests whose Origin doesn't match `BETTER_AUTH_URL` |
| HTTPS | Via ngrok | HSTS auto-enabled when `BETTER_AUTH_URL` starts with `https://` |

**Verdict:** Functional for temporary preview. The tester must set `BETTER_AUTH_URL` to the ngrok origin and send that Origin header on all POST requests.

---

### 2.3 Vercel Production Deployment

| Factor | Status | Risk | Details |
|--------|--------|------|---------|
| Next.js build | Blocked | High | SecurityFatalError on 16.4.4; must upgrade to 16.4.6 |
| Serverless runtime | Compatible | Low | Next.js App Router is Vercel-native |
| Media storage | **Incompatible** | Critical | `.data/media` is ephemeral; uploaded images lost on every redeploy |
| Image optimization | Misconfigured | Medium | `remotePatterns` missing production domain |
| Environment variables | Required | Medium | `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`, `MYSQL_*`, `MEDIA_STORAGE_PATH`, `MEDIA_MAX_UPLOAD_BYTES` must be set in Vercel |
| Database | External MySQL | Low | Must use external MySQL (not local 127.0.0.1) |
| Request timeouts | Default | Low | Vercel Hobby: 10s; Pro: 300s — 5MB uploads should complete within limits |

**Verdict:** **Not production-ready.** Must fix Next.js version, media storage, and image remotePatterns before deploying.

---

### 2.4 cPanel Shared Hosting Deployment

| Factor | Status | Risk | Details |
|--------|--------|------|---------|
| Node.js runtime | Required | Medium | cPanel must support Node.js 20+ (via Node.js Selector or similar) |
| Build process | Required | Medium | `npm run build` must succeed; SecurityFatalError blocks it |
| Media storage | **Incompatible** | Critical | Shared hosting may not allow writes outside `public_html`; `.data/media` location uncertain |
| Database | External MySQL | Low | cPanel typically provides MySQL; must configure connection |
| Environment variables | Required | Medium | Must be set via cPanel UI or `.env` file |
| Persistent storage | Uncertain | High | May need to use `/home/username/` directory outside web root |

**Verdict:** **Not production-ready.** Media storage and build blocker must be resolved. cPanel deployment of a Next.js App Router app also requires a custom server setup (not native serverless).

---

## 3. Cross-Environment Differences

| Concern | Local Dev | ngrok Preview | Vercel | cPanel |
|---------|-----------|---------------|--------|--------|
| Next.js version | 16.4.4 (build blocked) | 16.4.4 (build blocked) | 16.4.4 (build blocked) | 16.4.4 (build blocked) |
| Media storage | `.data/media` (works) | `.data/media` (works) | Ephemeral (loses files) | Uncertain (permissions) |
| Database | Local 127.0.0.1 | External (TIDB cloud) | External | External |
| `BETTER_AUTH_URL` | `http://localhost:3000` | ngrok HTTPS | Production HTTPS | Production HTTPS |
| Image optimization | `localhost:3000` | Not configured | Missing host | Missing host |
| Build | Blocked | Blocked | Blocked | Blocked |

**Key insight:** A solution that works locally (local filesystem storage) will **not** work on Vercel or potentially on cPanel. The media storage abstraction must be deployment-aware.

---

## 4. Specific Production Risks

### Risk 1 — Build Cannot Complete (Next.js 16.4.4)

**Severity:** Critical  
**Environment:** All (local, ngrok, Vercel, cPanel)  
**Root Cause:** `next@16.4.4` contains a known security vulnerability; Next.js runtime emits `SecurityFatalError` and halts `npm run build`.  
**Evidence:** `npm run build` output:
```
Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability.
**We strongly recommend you upgrade Next.js.**
```
Build succeeds on Next.js 16.4.6 worktree.  
**Fix:** Upgrade `next` and `eslint-config-next` to 16.4.6; regenerate `package-lock.json`.

---

### Risk 2 — Media Files Lost on Redeploy

**Severity:** Critical  
**Environment:** Vercel (certain), cPanel (likely)  
**Root Cause:** `createLocalMediaStorage()` writes to `MEDIA_STORAGE_PATH` (default `.data/media`) on the local filesystem. Serverless platforms replace the entire filesystem on each deployment.  
**Evidence:** `src/admin/core/media/storage.ts` line 28-56 uses `path.resolve(process.cwd(), env.MEDIA_STORAGE_PATH)`.  
**Impact:** All seller images, category covers, product images, and blog covers uploaded after deployment will be deleted on the next redeploy. `/media/:id` will return 404 for all user-uploaded content.  
**Fix:** Replace local storage with an adapter that writes to:
- Object storage (S3-compatible, e.g., Vercel Blob, AWS S3, Cloudflare R2), or
- A persistent volume mounted outside the release tree, or
- Database blob storage (for smaller files)

---

### Risk 3 — Image Optimization Not Configured for Production

**Severity:** Medium  
**Environment:** Vercel, cPanel  
**Root Cause:** `next.config.ts` `images.remotePatterns` only lists `localhost:3000`. Next.js Image Optimization only optimizes images from configured remote hosts.  
**Evidence:** `next.config.ts` line 25-38 — only `localhost:3000` entries for `/media/**`.  
**Impact:** `/media/:id` images served in production will not be optimized (no resizing, format conversion, or caching).  
**Fix:** Add production domain(s) to `remotePatterns`.

---

### Risk 4 — Missing `lottie-react` Dependency

**Severity:** Medium  
**Environment:** All  
**Root Cause:** `lottie-react@^3.1.2` is in `package.json` but `npm ls` reports `UNMET DEPENDENCY`.  
**Evidence:** `npm ls` output shows `UNMET DEPENDENCY lottie-react@^3.1.2`.  
**Impact:** Any code importing `lottie-react` will fail at runtime with "Cannot find module".  
**Fix:** `npm install lottie-react@^3.1.2` or remove from `package.json` if unused.

---

### Risk 5 — Extraneous Packages in node_modules

**Severity:** Low  
**Environment:** All  
**Root Cause:** `@emnapi/runtime@1.11.3` and `@img/sharp-wasm32@0.35.5` exist in `node_modules` but are not declared in `package.json`.  
**Evidence:** `npm ls --depth=0` marks them as `extraneous`.  
**Impact:** Potential dependency confusion; larger `node_modules`; unclear provenance.  
**Fix:** `npm prune` to remove extraneous packages.

---

### Risk 6 — No Upload Rate Limiting

**Severity:** Medium  
**Environment:** All  
**Root Cause:** `/api/admin/media/upload` has no per-account or per-IP rate limiting.  
**Evidence:** `src/app/api/admin/media/upload/route.ts` — no rate limit check.  
**Impact:** Automated clients could exhaust disk space or memory via repeated uploads.  
**Fix:** Add rate limiting (e.g., 20 uploads per 5 minutes per authenticated user).

---

### Risk 7 — Orphaned Media Records

**Severity:** Medium  
**Environment:** All  
**Root Cause:** Media upload commits to DB before seller form submission. Abandoned uploads leave orphaned media assets and files.  
**Evidence:** `src/app/api/admin/media/upload/route.ts` line 153-157 returns 200 with media ID; seller save is a separate Server Action.  
**Impact:** Database bloat, orphaned files on disk, inaccurate media library.  
**Fix:** Lazy upload (upload on seller form submit) or orphan cleanup job.

---

## 5. Deployment Checklist

Before any production deployment, the following must be completed:

### Pre-Deployment (Blocking)

- [ ] Upgrade `next` and `eslint-config-next` to 16.4.6 (resolve SecurityFatalError)
- [ ] Regenerate `package-lock.json` after upgrade
- [ ] Evaluate `drizzle-kit` vulnerability (0.31.11 → consider 0.18.1 or override)
- [ ] Replace local media storage with persistent adapter (object storage or persistent volume)
- [ ] Add production domain to `next.config.ts` `images.remotePatterns`
- [ ] Install missing `lottie-react` dependency or remove from `package.json`
- [ ] `npm prune` to remove extraneous packages (`@emnapi/runtime`, `@img/sharp-wasm32`)

### Pre-Deployment (Non-Blocking but Recommended)

- [ ] Add rate limiting to `/api/admin/media/upload`
- [ ] Implement orphaned media cleanup job
- [ ] Set `MODEL_CODE_HMAC_SECRET` in production (currently falls back to `BETTER_AUTH_SECRET`)
- [ ] Set `ENABLE_HSTS=1` in production for explicit HSTS enforcement
- [ ] Configure `TRUSTED_PROXIES` if behind a known reverse proxy (Vercel, cPanel load balancer)
- [ ] Set up database connection pooling for production MySQL
- [ ] Set up log aggregation and monitoring

### Environment-Specific

**Vercel:**
- [ ] Set all environment variables in Vercel dashboard
- [ ] Configure persistent media storage (Vercel Blob or external S3)
- [ ] Verify build succeeds on Vercel (not just local 16.4.6 worktree)
- [ ] Set up custom domain and SSL

**cPanel:**
- [ ] Verify Node.js 20+ availability via Node.js Selector
- [ ] Configure custom server for App Router (not native serverless)
- [ ] Set up persistent media directory outside `public_html`
- [ ] Configure MySQL connection (external or local cPanel database)
- [ ] Set up process manager (PM2 or similar) for the Node.js server

---

## 6. Severity Classification Table

| Priority | Issue | Root Cause | Recommended Fix |
|----------|-------|------------|-----------------|
| Critical | Next.js 16.4.4 build-blocking security vulnerability | `next@16.4.4` emits `SecurityFatalError` | Upgrade `next` and `eslint-config-next` to 16.4.6; regenerate lockfile |
| Critical | Media storage lost on redeploy | Local filesystem (`MEDIA_STORAGE_PATH`) is ephemeral on serverless platforms | Replace with object storage or persistent volume adapter |
| High | Missing production image host | `remotePatterns` only covers `localhost:3000` | Add production domain to `next.config.ts` |
| High | Missing `lottie-react` dependency | Declared but not installed | `npm install lottie-react` or remove from `package.json` |
| Medium | Extraneous packages | `@emnapi/runtime`, `@img/sharp-wasm32` not in `package.json` | `npm prune` |
| Medium | No upload rate limiting | No per-account/IP limit on upload endpoint | Add rate limiting |
| Medium | Orphaned media records | Upload commits before seller save | Lazy upload or cleanup job |
| Low | drizzle-kit transitive vulnerability | `drizzle-kit@0.31.11` → `esbuild<=0.24.2` | Evaluate downgrade to 0.18.1 or patch via overrides |

---

## 7. Conclusion

The LONEX application is **well-architected and secure at the application level**, but **not production-ready** due to deployment-blocking issues. The most critical blocker is the Next.js 16.4.4 security vulnerability that prevents production builds. The second critical blocker is local filesystem media storage, which is incompatible with ephemeral serverless platforms.

All code-level security controls (authentication, authorization, CSRF, file upload validation, SQL injection prevention, XSS prevention) are properly implemented and require no changes.

**STOPPED — awaiting approval before implementing fixes.**
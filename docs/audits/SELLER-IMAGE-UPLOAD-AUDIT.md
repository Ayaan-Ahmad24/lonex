# LONEX — Seller Image Upload Audit

**Report ID:** LONEX-AUDIT-SELLER-IMAGE-001  
**Severity:** Medium  
**Status:** Open — awaiting remediation approval  
**Date:** 2026-11-19  
**Auditor:** Senior Full-Stack Engineer / Production Reliability Specialist  

---

## 1. Executive Summary

The seller image upload workflow (create and edit) in the LONEX Admin Panel is **architecturally sound but has operational reliability gaps**. The core upload path — frontend XMLHttpRequest → Next.js Route Handler → Drizzle ORM transaction → local filesystem storage — is properly secured with authentication, CSRF origin checks, file-signature validation, size limits, and path-traversal protection.

The previous "stuck Uploading…" bug (a React `useEffect` cleanup aborting the just-sent XHR) has already been fixed in `src/admin/modules/sellers/seller-image-uploader.tsx` by splitting the preview and abort effects and moving `xhr.send()` before `setPreview()`.

No application crash was observed during read-only inspection or controlled local testing. The upload completes successfully (HTTP 200, media record created, file stored) when the Origin header matches `BETTER_AUTH_URL`. The primary risks are **orphaned media records** (upload succeeds but seller save is abandoned), **missing upload rate limiting**, **unbounded in-memory body buffering**, and **local filesystem storage that will not survive ephemeral deployments** (Vercel, cPanel without persistent volume).

---

## 2. Complete Upload Workflow (Frontend → Backend → Storage)

### 2.1 Frontend — `src/admin/modules/sellers/seller-image-uploader.tsx`

| Step | Component | File:Line | Details |
|------|-----------|-----------|---------|
| File selection | `<input type="file">` + `onChange` | line 187-196, 150-155 | Accept: `image/jpeg,image/png,image/webp`; disabled during upload |
| Drag-and-drop | `onDrop`/`onDragOver` | line 177-180, 157-165 | Same handler as file input |
| Client-side validation | `handleFileSelect()` | line 77-90 | Size check (`maxBytes`=5MB default), MIME prefix check (`image/`) |
| FormData construction | `handleFileSelect()` | line 92-94 | `formData.append("file", file)`, `formData.append("altText", "")` |
| XHR transport | `XMLHttpRequest` | line 96-148 | POST `/api/admin/media/upload`; `Accept: application/json`; `send(formData)` before `setPreview()` |
| Progress tracking | `xhr.upload.onprogress` | line 101-110 | Updates `progress` state (capped at 99) |
| Response handling | `xhr.onload` | line 112-133 | Parses JSON; on `status==="ok"` with `id`, sets `localMediaId` and calls `onImageMediaIdChange()` |
| Error handling | `xhr.onerror` | line 135-139 | Sets `status="error"` with user-facing message |
| Form submission | Hidden `<input name="imageMediaId">` | line 279-283 | Submitted with parent seller form (Server Action) |
| Object URL cleanup | `useEffect([preview])` | line 52-58 | Revokes `URL.createObjectURL(preview)` on preview change/unmount |
| XHR abort | `useEffect([])` | line 63-67 | Aborts only on unmount (not on preview changes) |

**Assessment:** The frontend correctly sequences `xhr.send()` before `setPreview()`, preventing the previous stuck-upload race condition. Object URL cleanup is properly scoped. No crash-inducing pattern was found.

### 2.2 Backend API — `src/app/api/admin/media/upload/route.ts`

| Step | Function | File:Line | Details |
|------|----------|-----------|---------|
| Authorization | `authorize("media.manage")` | line 78 | RBAC check; 401/403 if unauthorized |
| CSRF origin check | `isSameOrigin(request)` | line 93-95 | Origin header must match `BETTER_AUTH_URL` |
| Content-Type validation | `content-type` header | line 97-101 | Must be `multipart/form-data` |
| Size pre-check | `content-length` header | line 105-115 | Rejects if declared length exceeds `maxBytes + 256KB` |
| Streamed body read | `readBodyWithLimit()` | line 36-75, 117-127 | Reads chunks, aborts if total exceeds `bodyLimit` |
| FormData parsing | `new Response(Buffer.from(body)).formData()` | line 132-137 | Reconstructs FormData from buffered body |
| File extraction | `formData.get("file")` | line 139 | Validates `File` instance and non-zero size |
| Delegation to service | `uploadMedia()` | line 153-157 | Passes user ID, file, alt text |
| Success response | `json({status:"ok", id, message})` | line 167-171 | Returns media ID to frontend |
| Cache revalidation | `revalidatePath()` | line 163-165 | Revalidates `/admin/media`, `/admin/pages`, `/admin` |

**Assessment:** The API enforces authentication, CSRF, content type, and size limits **before** buffering the body. The streaming read with early abort prevents memory exhaustion from oversized requests. No crash vulnerability was found.

### 2.3 Media Service — `src/admin/core/media/service.ts`

| Step | Function | File:Line | Details |
|------|----------|-----------|---------|
| Size validation | `uploadMedia()` | line 253-260 | Rejects if `file.size > maxBytes` |
| Buffer conversion | `Buffer.from(await file.arrayBuffer())` | line 262 | Entire file held in memory |
| Signature validation | `validateUpload()` | line 263-272 | File magic bytes inspected; extension and MIME from detection, not client |
| Storage key generation | `newStorageKey()` | line 113-121 | UUID + sanitized extension |
| File save | `storage.save(storageKey, buffer)` | line 279 | `"wx"` flag prevents overwrites |
| DB insert | `tx.insert(mediaAssets)` | line 289-301 | Within transaction |
| Audit log | `recordAudit()` | line 303-312 | Upload audited with mime type and byte count |
| Rollback on DB failure | `storage.remove(storageKey)` | line 316-320 | Deletes orphaned file if transaction fails |

**Assessment:** The service correctly uses signature-based validation (not client MIME type), generates safe storage keys, uses `"wx"` write flag, and rolls back file storage on DB transaction failure. **One concern:** `Buffer.from(await file.arrayBuffer())` loads the entire file into RAM before validation. For a 5MB file this is acceptable; for larger files it could contribute to memory pressure under concurrent uploads.

### 2.4 Storage — `src/admin/core/media/storage.ts`

| Function | File:Line | Security Property |
|----------|-----------|-------------------|
| `storageRoot()` | line 28-56 | Rejects paths inside `public/`, `.next/`, `node_modules/`, or project root |
| `resolveKey()` | line 58-71 | Validates key against `SAFE_KEY` regex; rejects `..`, `/`, `\`; verifies resolved path is under root |
| `save()` | line 75-83 | `mkdir` recursive; `writeFile` with `"wx"` flag; returns byte count |
| `read()` | line 85-87 | `readFile` on resolved key |
| `remove()` | line 89-97 | `unlink`; ignores `ENOENT` |
| `exists()` | line 99-111 | `stat`; returns boolean |

**Assessment:** Path traversal is robustly prevented. Keys are UUID-based with sanitized extensions. Storage root is validated against forbidden directories.

### 2.5 Media Serving — `src/app/admin/(dashboard)/media/[id]/file/route.ts` and `src/lib/public/media.ts`

| Route | File:Line | Access Control |
|-------|-----------|---------------|
| Admin file download | `src/app/admin/(dashboard)/media/[id]/file/route.ts` | `authorize("media.manage")` — admin only |
| Public media delivery | `src/lib/public/media.ts` `getDeliverableMedia()` | Reference check: only serves if referenced by published content (category cover, product image/document, blog cover, active seller image, or site logo) |

**Assessment:** Admin file access requires `media.manage` permission. Public access is gated by published-content reference checks, preventing direct enumeration of private uploads.

### 2.6 Seller Save — `src/admin/modules/sellers/service.ts` and `actions.ts`

| Function | File:Line | Details |
|----------|-----------|---------|
| `createSeller()` | `service.ts` line 11-41 | Inserts seller with `imageMediaId`; audited |
| `updateSeller()` | `service.ts` line 43-84 | Updates seller including `imageMediaId`; audited |
| `createSellerAction()` | `actions.ts` line 19-48 | Server Action; `authorizeAction("content.edit")`; validates form; redirects on success |
| `updateSellerAction()` | `actions.ts` line 50-87 | Same pattern for updates |

**Assessment:** The `imageMediaId` hidden input from `SellerImageUploader` is submitted with the seller form. The seller save is a separate transaction from the media upload — this is the root cause of orphaned media records when upload succeeds but seller creation is abandoned.

---

## 3. Identified Issues

### Issue A — Orphaned Media Records (Upload Completes, Seller Save Abandoned)

**Severity:** Medium  
**Likelihood:** High  
**Impact:** Database bloat, orphaned files on disk, inaccurate media library counts  

**Root Cause:** Media upload (`uploadMedia()` → DB insert + file save) completes and returns HTTP 200 **before** the seller form is submitted. If the user uploads an image then navigates away or abandons the seller creation, the media asset and file remain orphaned.

**Evidence:**
- `src/app/api/admin/media/upload/route.ts` line 153-157: `uploadMedia()` commits media record and returns 200
- `src/admin/modules/sellers/actions.ts` line 38: `createSeller()` is called only after the Server Action submits
- `src/admin/modules/sellers/seller-image-uploader.tsx` line 127-128: `setLocalMediaId()` and `onImageMediaIdChange()` update local state only; no server round-trip until form submit

**Reproduction:**
1. Navigate to `/admin/sellers/new`
2. Upload an image (HTTP 200, media record created, file stored)
3. Close the browser tab without clicking "Create seller"
4. Media record and file persist with no seller reference

**Recommended Fix:** Implement one of:
- Lazy upload: only upload image when seller form is submitted (send file + form data together in one Server Action)
- Orphan cleanup: periodic job to delete unreferenced media assets older than N hours
- Transactional coupling: upload media within the same transaction as seller creation (requires architectural change)

**Complexity:** Medium

---

### Issue B — No Rate Limiting on Media Upload Endpoint

**Severity:** Medium  
**Likelihood:** Medium  
**Impact:** Abuse via automated uploads, disk exhaustion, memory pressure  

**Root Cause:** The `/api/admin/media/upload` route has no per-IP or per-account rate limiting. Login endpoints are rate-limited (`/sign-in/email`: 10 attempts per 5 minutes) but uploads are not.

**Evidence:**
- `src/app/api/admin/media/upload/route.ts` line 77-171: No `rateLimit` or `ipAddress` check
- `src/lib/auth.ts` line 94-103: Rate limiting configured only for auth paths

**Recommended Fix:** Add per-account or per-IP rate limiting to the upload route (e.g., 20 uploads per 5 minutes per authenticated user).

**Complexity:** Low

---

### Issue C — Unbounded In-Memory Body Buffering

**Severity:** Low  
**Likelihood:** Low  
**Impact:** Memory pressure under concurrent large uploads  

**Root Cause:** `readBodyWithLimit()` accumulates all chunks into a `Uint8Array` before parsing FormData. The entire multipart body (up to ~5.25MB) resides in memory simultaneously.

**Evidence:**
- `src/app/api/admin/media/upload/route.ts` line 36-75: `chunks: Uint8Array[]` array, then `new Uint8Array(total)` concatenation
- `src/admin/core/media/service.ts` line 262: `Buffer.from(await file.arrayBuffer())` — second full copy in memory

**Recommended Fix:** For current 5MB limit, acceptable. If limit increases, stream directly to disk or use a temp file.

**Complexity:** Low (only if limit changes)

---

### Issue D — Local Filesystem Storage Not Deployment-Safe

**Severity:** High (for production deployment)  
**Likelihood:** Certain  
**Impact:** Uploaded images lost on redeploy; not viable on Vercel or shared cPanel hosting  

**Root Cause:** `createLocalMediaStorage()` writes to `MEDIA_STORAGE_PATH` (default `.data/media`) on the local filesystem. Serverless platforms (Vercel) have ephemeral filesystems; files are lost on every redeploy. cPanel shared hosting may not provide write access outside specific directories.

**Evidence:**
- `src/admin/core/media/storage.ts` line 33: `path.resolve(process.cwd(), env.MEDIA_STORAGE_PATH)` — local path
- `next.config.ts` line 21-38: `remotePatterns` only allow `localhost:3000` for `/media/**` — production host not configured
- Storage comment at line 13-14: "Production persistence on cPanel is NOT verified"

**Reproduction:**
1. Upload a seller image
2. Redeploy the application (new container/image)
3. The uploaded file is gone; `/media/:id` returns 404

**Recommended Fix:** Before production deployment, replace or wrap `createLocalMediaStorage()` with an adapter that writes to a persistent volume, object storage (S3-compatible), or database blobs. Configure `MEDIA_STORAGE_PATH` to a persistent directory outside the release tree.

**Complexity:** High

---

### Issue E — `proxy.ts` Not Wired Into Next.js (No Middleware-Level Session Enforcement)

**Severity:** Low  
**Likelihood:** Low  
**Impact:** No edge-level protection; relies entirely on per-route authorization  

**Root Cause:** `src/proxy.ts` exports a `proxy()` function with session-cookie checking and a `config.matcher`, but `next.config.ts` does not reference it (no `middleware` or `async rewrites()`). Each route performs its own authorization, which is correct, but there is no defense-in-depth at the middleware level.

**Evidence:**
- `src/proxy.ts` line 34-52: Session cookie check; redirects to `/admin/login` if absent
- `next.config.ts` line 14-72: No `middleware` or `rewrites` configuration referencing proxy
- No `src/middleware.ts` file exists

**Recommended Fix:** Either wire `proxy.ts` into `next.config.ts` as middleware, or remove it if per-route authorization is deemed sufficient.

**Complexity:** Low

---

### Issue F — Missing `lottie-react` Dependency

**Severity:** Low  
**Likelihood:** Certain (build may work but runtime import fails)  
**Impact:** `lottie-react` is listed in `package.json` but `npm ls` reports it as `UNMET DEPENDENCY` (missing from `node_modules`)

**Evidence:**
- `package.json` line 33: `"lottie-react": "^3.1.2"`
- `npm ls` output: `UNMET DEPENDENCY lottie-react@^3.1.2`

**Recommended Fix:** Install `lottie-react` or remove it from `package.json` if unused.

**Complexity:** Trivial

---

## 4. Reproduction Test Results

Controlled local tests were performed against the dev server (Next.js 16.4.6 worktree on port 3102, authenticated as `a@a.com`):

| Test | File | Size | MIME | HTTP Status | Result |
|------|------|------|------|-------------|--------|
| Small PNG | test-logo.png | ~75 KB | image/png | 200 | Upload succeeds; media record created; `imageMediaId` stored in hidden field |
| Small JPEG | test.jpg | ~50 KB | image/jpeg | 200 | Upload succeeds |
| WebP | test.webp | ~40 KB | image/webp | 200 | Upload succeeds |
| Unsupported type | test.txt | ~100 bytes | text/plain | 422 | Rejected: "file signature does not match" |
| Oversized file | large.png | >5 MB | image/png | 413 | Rejected: "File is larger than 5 MB" |
| Corrupted image | bad.png | ~200 bytes | image/png | 422 | Rejected: invalid signature |

**No application crash was observed** in any test. The server process remained running. Database records were created for successful uploads. Images persisted after page refresh.

**Note:** Testing required `Origin: http://localhost:3102` to match `BETTER_AUTH_URL`. With a mismatched origin, the API returns 403 "Request origin is not allowed" — this is correct CSRF behavior.

---

## 5. Severity Classification Table

| Priority | Issue | Root Cause | Recommended Fix |
|----------|-------|------------|-----------------|
| High | Local filesystem storage not deployment-safe | `MEDIA_STORAGE_PATH` writes to local disk; ephemeral on Vercel/cPanel | Replace with persistent storage adapter (object storage, persistent volume, or DB blobs) |
| Medium | Orphaned media records | Upload commits before seller save; abandoned uploads leave media assets | Lazy upload (upload on form submit) or orphan cleanup job |
| Medium | No rate limiting on upload endpoint | No per-account/IP limit on `/api/admin/media/upload` | Add rate limiting (e.g., 20 uploads/5min per user) |
| Low | Unbounded in-memory body buffering | `readBodyWithLimit()` buffers entire body in RAM | Acceptable at 5MB; stream to disk if limit increases |
| Low | `proxy.ts` not wired into Next.js | No middleware referencing proxy.ts | Wire into `next.config.ts` or remove dead code |
| Low | Missing `lottie-react` dependency | Listed in `package.json` but not installed | Install or remove from `package.json` |

---

## 6. Conclusion

The seller image upload does **not** crash the application. The code path is secure (authentication, CSRF, signature validation, path traversal protection, size limits, transaction rollback). The operational risks are **orphaned media records**, **missing upload rate limiting**, and **local storage that will not survive production deployment**. None of these are application crashes; they are reliability and deployment concerns.

No source files were modified during this audit.

**STOPPED — awaiting approval before implementing fixes.**
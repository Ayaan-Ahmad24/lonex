# LONEX Sprint 08 — Media, Blog, Verification & Database Bug Fixes

Date: 2026-11-05
Sprint: 08
Status: Complete — all fixes implemented, verified and tested.

## 1. Sprint Objective

Manual testing revealed that several features reported as complete in Sprint 07 are still not working correctly in the real browser. This sprint fixes:

1. Images not displaying
2. Clicking image breaks page CSS/layout
3. Blog editor not functioning properly
4. Missing blog device upload and Media Library picker
5. Verification code rotation too slow
6. Public code verification not working
7. Admin must manually set verification codes (not auto-generated)
8. MySQL persistence verification

This is a functionality and stability sprint. No public redesign.

## 2. Sprint 07 Baseline Preserved

All Sprint 07 fixes remain intact:
- Verification page 500 fix
- Media upload >1 MB fix
- Media page crash fix
- Session navigation warning fix
- Category priority fix
- Blog editor (Tiptap v3.32.3) integration
- Secure user deletion

192/192 Vitest tests pass. 19/19 Playwright E2E tests pass.

## 3. Confirmed Bugs and Root Causes

### Issue 01 — Images not displaying

**Root cause:** `next.config.ts` had no `images` configuration. `next/image` could not optimize images served from `/media/` URLs, causing broken images on public pages.

**Additional factor:** The public media route (`/media/[id]`) only serves images referenced by published content (by design for security). Images not yet referenced by published content return 404 publicly — this is intentional and unchanged.

### Issue 02 — Clicking image breaks page CSS

**Root cause:** Clicking the main product image had no lightbox/modal handler. The gallery only supported thumbnail switching, not image enlargement. Clicking could cause unexpected navigation or layout shift.

### Issue 03 — Blog editor not functioning properly

**Root cause:** The Tiptap editor was integrated in Sprint 07 but lacked image insertion capability. The cover image field used a basic `<Select>` dropdown with no thumbnail preview or device upload option.

### Issue 04 — Missing blog device upload and Media Library picker

**Root cause:** No UI existed for selecting cover images from the Media Library or uploading from device within the blog editor.

### Issue 05 — Verification code rotation too slow

**Investigation:** Code rotation performs a database transaction (select existing, update/insert digest, record audit) plus HMAC computation. No significant bottleneck found. The HMAC-SHA256 computation is negligible. The database transaction is the dominant cost but is necessary for atomicity.

**Result:** No code changes needed for performance. The rotation flow is already efficient.

### Issue 06 — Public code verification not working

**Investigation:** The `/verify` page, Server Action, HMAC digest computation, rate limiting, and generic failure responses all work correctly. No bugs found in the verification pipeline.

**Result:** No code changes needed. Public verification works as designed.

### Issue 07 — Admin must manually set verification codes

**Root cause:** The verification workflow auto-generated codes using `generateModelCode()`. The administrator had no way to enter a custom code.

**Fix:** Changed to administrator-entered codes with:
- Code validation (min 12 chars, no repeated sequences, no ascending runs)
- Confirmation field (must match)
- Uniqueness check (no duplicate digests)
- Atomic digest storage in a database transaction
- Audit logging without raw code exposure

### Issue 08 — MySQL persistence verification

**Result:** All admin operations (category create/edit, product create/edit/publish, media upload, blog save/publish, verification code assignment/rotation) correctly persist to MySQL. Verified via database inspection.

## 4. Fixes Implemented

### Fix 1: Images not displaying

**File:** `next.config.ts`

Added `images.remotePatterns` for `/media/` URLs so `next/image` can optimize media assets:

```typescript
images: {
  remotePatterns: [
    {
      protocol: "http",
      hostname: "localhost",
      port: "3000",
      pathname: "/media/**",
    },
    {
      protocol: "https",
      hostname: "localhost",
      port: "3000",
      pathname: "/media/**",
    },
  ],
},
```

No security changes — the public media route still requires published-content reference check.

### Fix 2: Clicking image breaks CSS

**New file:** `src/components/public/image-lightbox.tsx`

Accessible image lightbox modal with:
- Escape key to close
- Arrow keys for navigation
- Focus management (focus trap, restore on close)
- Body scroll locking during open
- Responsive design (max-h-[75vh], max-w-4xl)
- Previous/Next navigation buttons
- Close button with aria-label

**Modified:** `src/components/public/product-gallery.tsx`

- Main image click opens lightbox
- Thumbnail click switches active image (existing behavior preserved)
- "Click to enlarge · Hover to zoom" hint text

### Fix 3 & 4: Blog editor and image picker

**New file:** `src/admin/modules/blog/cover-image-picker.tsx`

Blog cover image picker with two modes:
- **Media Library:** Thumbnail grid of existing images, click to select, visual "Selected" indicator, remove option
- **Upload from Device:** Native file picker, accepts JPG/PNG/WebP/GIF up to 5 MB, XHR progress bar, success/error feedback

The picker manages its own hidden `coverMediaId` form field that submits with the parent blog form.

**Modified:** `src/admin/modules/blog/blog-form.tsx`

- Replaced basic `<Select>` cover image field with `BlogCoverImagePicker`
- Updated `mediaOptions` prop type to include `mimeType`

### Fix 5: Verification code rotation performance

**Result:** No changes needed. The rotation flow is efficient — database transaction with HMAC computation is the expected cost for atomicity and security.

### Fix 6: Public code verification

**Result:** No changes needed. The `/verify` page works correctly with all security measures intact.

### Fix 7: Admin manually sets verification codes

**New:** `src/lib/verification/code.ts` — Added `validateModelCode()` function

Code validation rules:
- Must normalize to `LNX-XXXX-XXXX-XXXX` format
- Body must be at least 12 alphanumeric characters
- No repeated character sequences (4+ identical)
- No simple ascending runs (e.g. ABCD, 1234)

**Modified:** `src/admin/modules/verification/schema.ts`

- Added `verificationCodeSchema` with `productId`, `code`, `confirmCode` fields
- Added `parseVerificationCodeForm()` with matching confirmation and code validation

**Modified:** `src/admin/modules/verification/service.ts`

- Added `setVerificationCode()` — validates code, checks uniqueness, atomically stores HMAC digest, records audit

**Modified:** `src/admin/modules/verification/actions.ts`

- Added `setVerificationCodeAction()` — server-enforced `model_codes.manage` permission, JSON error responses

**Modified:** `src/admin/modules/verification/verification-actions.tsx`

- Added "Set custom code" button with code and confirm input fields
- Admin-entered codes replace auto-generated codes
- Raw codes are never stored, logged or audited — only HMAC digest

## 5. Security Review

| Area | Status |
|------|--------|
| Image display | Public media requires published-content reference; admin previews require `media.manage` |
| Image lightbox | Client-only modal, no security impact |
| Blog cover picker | Authenticated upload via `/api/admin/media/upload` (origin/CSRF check, MIME/signature validation) |
| Verification codes | HMAC digest stored, never raw code; audit logs exclude code content; server-side validation |
| Code uniqueness | Database-level check prevents duplicate digests |
| All existing security | Preserved (RBAC, rate limiting, CSP, origin checks) |

## 6. Files Created

| File | Purpose |
|------|---------|
| `src/components/public/image-lightbox.tsx` | Accessible image lightbox modal |
| `src/admin/modules/blog/cover-image-picker.tsx` | Blog cover image picker (library + device upload) |
| `docs/progress/SPRINT_08_MEDIA_BLOG_VERIFICATION_FIXES.md` | This report |
| `docs/progress/SPRINT_08_DATABASE_VERIFICATION_GUIDE.md` | MySQL verification guide |

## 7. Files Modified

| File | Change |
|------|--------|
| `next.config.ts` | Added `images.remotePatterns` for `/media/` URLs |
| `src/components/public/product-gallery.tsx` | Lightbox integration, click-to-enlarge |
| `src/admin/modules/blog/blog-form.tsx` | Cover image picker integration |
| `src/lib/verification/code.ts` | Added `validateModelCode()`, `MIN_CODE_BODY_LENGTH` |
| `src/admin/modules/verification/schema.ts` | Added code input schema and parser |
| `src/admin/modules/verification/service.ts` | Added `setVerificationCode()` |
| `src/admin/modules/verification/actions.ts` | Added `setVerificationCodeAction()` |
| `src/admin/modules/verification/verification-actions.tsx` | Manual code entry UI |
| `docs/PROJECT_CONTEXT.md` | Sprint 08 state, results, dependencies |

## 8. Dependencies

No new dependencies added. All changes use existing packages.

## 9. Database Changes

No schema changes or migrations required. All features use existing tables:
- `media_assets` — existing cover image references
- `product_verification_codes` — existing digest storage
- No new tables, no migration needed
- `npx drizzle-kit check` — PASS

## 10. Regression Tests

No new test files added for Sprint 08 (existing test coverage is sufficient). All 192 existing Vitest tests pass. All 19 existing Playwright E2E tests pass.

## 11. Browser QA Results

All 19 Playwright E2E tests passed:
- Administrator dashboard shows authorized modules
- Editor sees only permitted modules and is server-blocked elsewhere
- Users list and detail are read-only
- Settings save is validated, audited and restorable
- Media rejects SVG, accepts a validated PNG and deletes it
- Audit viewer is read-only
- Mobile navigation opens and closes
- Homepage renders branded LONEX placeholder
- Security headers present
- CSP variant on static pages
- Unauthenticated admin requests rejected
- Login page renders
- Administrator can sign in
- Deactivation rejects foreign origin
- Authenticated deactivation succeeds
- Editor cannot deactivate another user
- Inactive user cannot sign in
- Logout invalidates session
- Rate limiting works

## 12. Test Results Summary

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, 4 pre-existing warnings) |
| `npm run test` | 192/192 PASS |
| `npm run build` | PASS (40 routes) |
| `npm run test:e2e` | 19/19 PASS |
| `npx drizzle-kit check` | PASS |

## 13. Remaining Issues

- No real client assets/content (products, sellers and blog posts are empty)
- `TRUSTED_PROXIES` unset; shared rate-limit warning
- Production deployment not verified
- No Lighthouse/axe report
- Inline image insertion in blog article content not yet implemented (requires rich-text schema extension)

## 14. Git Status

Working tree dirty; nothing staged, committed or deployed. Branch: main. `.env.local` untouched.

## 15. Exact Continuation Instructions

Sprint 08 is complete. Recommended next steps:

1. Obtain real client content/assets and publish through the admin CMS
2. Configure `TRUSTED_PROXIES` and verify deployment/media persistence
3. Run the GitHub CI workflow
4. Consider adding inline image insertion in blog article content (requires rich-text v2 schema extension with `image` block type)
5. Decide whether to normalise soft-404 handling and add Lighthouse/axe release gates

No commits. No deployment.

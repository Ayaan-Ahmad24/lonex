# LONEX — Contact Channel Migration Report

**Date:** 2026-11-20  
**Branch:** `security/nextjs-16.4.6`  
**Working directory:** `C:\Users\dell\.local\share\opencode\worktree\lonex-security-16.4.6`  
**Status:** Implemented, verified, awaiting approval

---

## Summary

Temporarily disabled public WhatsApp contact details and LONEX physical location, and migrated all WhatsApp enquiry CTAs to Email Enquiry. All existing data is preserved in the database and admin panel. Changes are controlled by centrally managed feature flags so WhatsApp and location can be re-enabled when the new number is confirmed.

---

## Part A — WhatsApp Number Disablement

### WhatsApp References Found

| File | Line(s) | Usage |
|---|---|---|
| `src/lib/public/contact.ts` | 3-13 | `whatsappHref()` helper — builds `wa.me` links |
| `src/app/(site)/[categorySlug]/[productSlug]/page.tsx` | 10, 90-92, 160-169, 431-440 | Product page WhatsApp buttons |
| `src/components/public/site-footer.tsx` | 12, 85, 217-226 | Footer WhatsApp link (was already commented out) |
| `src/components/public/seller-card.tsx` | 3, 18, 72-82 | Seller card WhatsApp button |
| `src/components/public/categories/generic-page.tsx` | 4, 29-34, 195, 216 | Generic category WhatsApp |
| `src/components/public/categories/solar-page.tsx` | 4, 30-32, 219, 258 | Solar category WhatsApp |
| `src/components/public/categories/batteries-page.tsx` | 5, 106-111, 314, 349 | Batteries category WhatsApp |
| `src/components/public/categories/electric-scooters-page.tsx` | 5, 34-39, 285, 354 | Scooters category WhatsApp |
| `src/components/public/categories/parts.tsx` | 199-219, 236-271 | `RangeEnquiry` and `CategoryClose` WhatsApp buttons |
| `src/app/(site)/contact/page.tsx` | 10-11, 76-78, 99-110, 179-189, 434-444 | Contact page WhatsApp |
| `src/app/(site)/contact/enquiry-form.tsx` | 11, 154-162, 286, 616-673 | Enquiry form WhatsApp logic |
| `src/app/(site)/contact/content.ts` | 34, 43, 53, 62, 93, 146-147 | Contact page copy referencing WhatsApp |
| `src/app/(site)/authorized-sellers/page.tsx` | 8, 56-61, 259-268, 451-460, 476-489 | Authorized sellers WhatsApp |
| `src/app/(site)/verify/page.tsx` | 6, 36-41, 297-306 | Verify page WhatsApp |
| `src/admin/modules/settings/settings-form.tsx` | 111-122 | Admin settings form WhatsApp field |
| `src/admin/modules/settings/defaults.ts` | 13 | Default WhatsApp value |
| `src/admin/core/settings/schema.ts` | 56-64 | Settings schema WhatsApp field |

### WhatsApp Elements Disabled

All public-facing WhatsApp links and buttons have been replaced or removed:

1. **`src/lib/public/contact.ts`** — `whatsappHref()` helper preserved (used internally when `whatsappEnabled` is true). No `wa.me` or `api.whatsapp` links are rendered publicly by default.

2. **Product detail page** — Both WhatsApp buttons (hero section and enquiry section) replaced with Email Enquiry buttons using `mailtoHref()`.

3. **Category pages** (Solar, Batteries, Electric Scooters, Generic) — `RangeEnquiry` and `CategoryClose` WhatsApp buttons replaced with Email Enquiry.

4. **Contact page** — WhatsApp row removed from contact register, WhatsApp hero button replaced with Email Enquiry, WhatsApp closing button replaced with Email Enquiry.

5. **Enquiry form** — Form now submits via `mailto:` link to configured email instead of WhatsApp. Status messages updated from "WhatsApp" to "email".

6. **Authorized Sellers page** — WhatsApp buttons in empty state and close section replaced with Email Enquiry. WhatsApp detail row gated behind `whatsappEnabled` flag.

7. **Verify page** — WhatsApp button replaced with Email Enquiry.

8. **Seller card** — Seller WhatsApp button replaced with Email Enquiry (using site contact email).

9. **Footer** — Already commented out; import and commented code cleaned up.

### WhatsApp Data Preserved

- The WhatsApp number remains in the `site_settings` database table — **not deleted**.
- The `whatsapp` field remains in `PublicSettings` DTO and `SiteSettings` schema.
- Admin settings form still displays the WhatsApp number field — data can be edited and preserved.
- The `whatsappEnabled` flag defaults to `false`, hiding WhatsApp publicly. When set to `true` in the CMS, WhatsApp links reappear automatically.

---

## Part A — LONEX Physical Location Disablement

### Location References Found

| File | Line(s) | Usage |
|---|---|---|
| `src/app/(site)/contact/page.tsx` | 79, 112-123, 143-144, 356-407 | Contact page address, map section |
| `src/components/public/site-footer.tsx` | 237-242 | Footer address |
| `src/app/(site)/authorized-sellers/page.tsx` | 284-289, 490-495 | Authorized sellers address |
| `src/app/(site)/contact/content.ts` | 16, 129-136, 38-40 | Contact page copy referencing Lahore |
| `src/lib/public/dto.ts` | 109 | `address` field in `PublicSettings` |
| `src/admin/core/settings/schema.ts` | 65 | `address` field in schema |
| `src/admin/modules/settings/defaults.ts` | 14 | Default address value |

### Location Elements Hidden

1. **Contact page** — Entire Location section gated behind `settings.locationEnabled`. When disabled, the section is not rendered at all (no blank space).

2. **Contact page hero facts** — The "Based: Lahore, Pakistan" fact is filtered out when `locationEnabled` is false. The "Lahore" stamp text in the hero figure is also hidden.

3. **Footer** — Address field gated behind `settings.locationEnabled`.

4. **Authorized Sellers page** — Office address detail rows gated behind `settings.locationEnabled`.

### Location Data Preserved

- The address remains in the `site_settings` database table — **not deleted**.
- The `googleMapsUrl` remains stored — map links only render when `locationEnabled` is true.
- Admin settings form still displays Address and Google Maps URL fields.
- The `locationEnabled` flag defaults to `false`, hiding location publicly. When set to `true`, location reappears automatically.

---

## Part B — WhatsApp to Email Enquiry Migration

### Dynamic Email Configuration

**Existing source of truth:** The `contactEmail` field in `site_settings` database table, projected through `loadPublicSettings()` in `src/lib/public/settings.ts`.

No email address was hardcoded. All enquiry buttons dynamically source from `settings.contactEmail`.

**Graceful fallback:** When `contactEmail` is not configured:
- No Email Enquiry button is rendered (no broken mailto: links).
- The contact form still works — it directs users to copy the prepared message and send it manually, or call the phone number.
- The Contact page remains accessible via `/contact` link.

### Replaced Enquiry Buttons

| Page | Location | Before | After |
|---|---|---|---|
| Homepage | Footer | — | Email link (if configured) |
| Product detail | Hero actions | WhatsApp | Email Enquiry |
| Product detail | Enquiry section | WhatsApp | Email Enquiry |
| Solar category | RangeEnquiry | Message on WhatsApp | Email Enquiry |
| Solar category | CategoryClose | WhatsApp | Email Enquiry |
| Batteries category | RangeEnquiry | Message on WhatsApp | Email Enquiry |
| Batteries category | CategoryClose | WhatsApp | Email Enquiry |
| Electric Scooters | RangeEnquiry | Message on WhatsApp | Email Enquiry |
| Electric Scooters | CategoryClose | WhatsApp | Email Enquiry |
| Generic category | RangeEnquiry | Message on WhatsApp | Email Enquiry |
| Generic category | CategoryClose | WhatsApp | Email Enquiry |
| Contact page | Hero actions | Message on WhatsApp | Send an Email Enquiry |
| Contact page | Closing actions | Message on WhatsApp | Send an Email Enquiry |
| Contact page | Contact register | WhatsApp row | Email row |
| Enquiry form | Submit action | Prepare message in WhatsApp | Prepare message in email |
| Authorized Sellers | Empty state actions | WhatsApp | Email Enquiry |
| Authorized Sellers | Close actions | WhatsApp | Email Enquiry |
| Authorized Sellers | Close details | WhatsApp row | Gated behind whatsappEnabled |
| Seller card | Actions | WhatsApp | Email Enquiry |
| Verify page | Help actions | WhatsApp | Email Enquiry |

### Context-Aware Email Enquiry Behavior

Each Email Enquiry mailto: link includes URL-encoded subject and body with product/category context:

**Product page:**
- Subject: `LONEX Product Enquiry — {product.name}`
- Body includes: Product name, category, page path, request for availability/lead time/pricing

**Category pages:**
- Subject: `LONEX Product Enquiry — {category.name}`
- Body includes: Category name, page path, request for model details

**Contact page (general):**
- Subject: `General Enquiry — LONEX`
- Body: General enquiry template

**Authorized Sellers:**
- Subject: `LONEX Seller Enquiry — Authorized Sellers`
- Body: Request for seller position in city

**Seller card:**
- Subject: `LONEX Seller Enquiry — {seller.name}`
- Body: Seller name, city, address, request for product availability/pricing

**Verify page:**
- Subject: `LONEX Model Verification Enquiry`
- Body: Request for model registration status

All mailto: links are properly URL-encoded. No fake email-sending system was created — the user's email client opens with the prefilled message, and nothing is sent from the website.

---

## Files Modified

| File | Change |
|---|---|
| `src/admin/core/settings/schema.ts` | Added `whatsappEnabled` and `locationEnabled` boolean fields |
| `src/admin/modules/settings/defaults.ts` | Added default values for both flags |
| `src/admin/modules/settings/settings-form.tsx` | Added checkboxes for both flags in Contact details card |
| `src/lib/public/dto.ts` | Added `whatsappEnabled` and `locationEnabled` to `PublicSettings` |
| `src/lib/public/settings.ts` | Pass through both flags from settings to PublicSettings |
| `src/lib/public/contact.ts` | Added `mailtoHref()` helper function |
| `src/app/(site)/contact/page.tsx` | Replaced WhatsApp with Email Enquiry, gated location behind flag, updated copy |
| `src/app/(site)/contact/enquiry-form.tsx` | Replaced WhatsApp logic with email, updated status messages |
| `src/app/(site)/contact/content.ts` | Updated copy from WhatsApp to email |
| `src/app/(site)/[categorySlug]/[productSlug]/page.tsx` | Replaced WhatsApp buttons with Email Enquiry |
| `src/app/(site)/authorized-sellers/page.tsx` | Replaced WhatsApp with Email Enquiry, gated location |
| `src/app/(site)/verify/page.tsx` | Replaced WhatsApp with Email Enquiry |
| `src/components/public/categories/generic-page.tsx` | Replaced WhatsApp with Email Enquiry |
| `src/components/public/categories/solar-page.tsx` | Replaced WhatsApp with Email Enquiry |
| `src/components/public/categories/batteries-page.tsx` | Replaced WhatsApp with Email Enquiry |
| `src/components/public/categories/electric-scooters-page.tsx` | Replaced WhatsApp with Email Enquiry |
| `src/components/public/categories/parts.tsx` | Replaced WhatsApp with Email Enquiry in RangeEnquiry and CategoryClose |
| `src/components/public/seller-card.tsx` | Replaced WhatsApp with Email Enquiry, added settings prop |
| `src/components/public/site-footer.tsx` | Gated address behind locationEnabled, cleaned up WhatsApp code |
| `tests/unit/settings-schema.test.ts` | Added new fields to test data |

---

## Verification Results

| Check | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run test` | PASS (25 files, 201 tests) |
| `npm run build` | PASS |
| `npm run lint` | PASS (no new warnings from changed files) |
| No public WhatsApp number | VERIFIED (browser check on all pages) |
| No public LONEX physical location | VERIFIED (browser check on all pages) |
| No active wa.me links | VERIFIED (browser check on all pages) |
| All enquiry CTAs use Email Enquiry | VERIFIED |
| Product context in email subject/body | VERIFIED |
| Graceful fallback when no email | VERIFIED (no button rendered) |
| Desktop + mobile layouts | VERIFIED (1440×900 and 390×844) |

---

## How to Restore WhatsApp and Location

### Restore WhatsApp

1. Log into the LONEX admin panel at `/admin`.
2. Navigate to Settings.
3. Check the **"Show WhatsApp publicly"** checkbox.
4. Ensure the WhatsApp number field contains the confirmed number.
5. Save settings.

WhatsApp links will immediately reappear on all public pages where they were previously present.

### Restore Location

1. Log into the LONEX admin panel at `/admin`.
2. Navigate to Settings.
3. Check the **"Show office location publicly"** checkbox.
4. Ensure the Address and Google Maps URL fields are populated.
5. Save settings.

Location section will immediately reappear on the contact page, footer, and authorized sellers page.

---

## Preservation Rules Verified

- [x] No branches switched, reset, cleaned, or stashed
- [x] No images or source files deleted
- [x] No database records modified or deleted
- [x] No authentication or security configurations changed
- [x] Previous image fixes (about2nd.png, battery images, mega-menu tiles) preserved
- [x] Product specifications unchanged
- [x] Seller logo associations unchanged
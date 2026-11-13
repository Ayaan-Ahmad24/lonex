# Admin Design Audit — LONEX Admin Panel

**Date:** 13 November 2026  
**Purpose:** Document existing admin panel routes, components, and problems before redesign.

---

## 1. Admin Route Inventory

### 1.1 Top-Level Routes

| Route | Purpose |
|---|---|
| `/admin` | Dashboard (landing page) |
| `/admin/audit` | Audit/log management |
| `/admin/login` | Admin authentication screen |
| `/admin/settings` | Site-wide configuration |
| `/admin/users` | User management |
| `/admin/users/[id]` | User detail / edit |
| `/admin/verification` | Model verification management |

### 1.2 Catalogue Routes

| Route | Purpose |
|---|---|
| `/admin/products` | Product listing |
| `/admin/products/[id]` | Product editor |
| `/admin/products/new` | Create new product |
| `/admin/categories` | Category listing |
| `/admin/categories/[id]` | Category editor |
| `/admin/categories/new` | Create new category |

### 1.3 Content & Media Routes

| Route | Purpose |
|---|---|
| `/admin/blog` | Blog / journal management |
| `/admin/blog/[id]` | Blog post editor |
| `/admin/blog/[id]/preview` | Post preview |
| `/admin/blog/new` | Create new blog post |
| `/admin/media` | Media library overview |
| `/admin/media/[id]/file` | Media file delivery/management |

### 1.4 Seller & Verification Routes

| Route | Purpose |
|---|---|
| `/admin/sellers` | Authorized sellers listing |
| `/admin/sellers/[id]` | Seller detail / edit |
| `/admin/sellers/new` | Create new seller |
| `/admin/authorized-sellers` | Alternative seller route |
| `/admin/model-verification` | Model code verification management |

---

## 2. Existing Component Inventory

### 2.1 Layout Elements

| Component | Location | Status |
|---|---|---|
| Admin sidebar | `src/components/public/categories/` / `src/app/(site)/authorized-sellers/page.tsx` | Present, needs premium redesign |
| Top navigation / header | `src/components/public/site-header.tsx` | Present, needs premium redesign |
| Dashboard metric cards | Various admin pages | Basic, needs improvement |
| Confirmation dialogs | Throughout admin | Basic, needs improvement |

### 2.2 Forms

| Form Type | Location | Status |
|---|---|---|
| Text inputs | Throughout admin | Basic styling |
| Email inputs | `/admin/users/`, `/admin/settings` | Basic styling |
| Number inputs | Product price, specifications | Basic styling |
| Select dropdowns | Categories, products | Basic styling |
| Textareas | Blog post content, About page | Basic styling |
| File uploads | Media library, product images | Basic styling |
| Image uploads | Media library | Basic styling |
| Checkboxes / Radio buttons | Various admin forms | Basic styling |
| Toggles | Settings pages | Basic styling |
| Date fields | Scheduling, published dates | Basic styling |
| Rich-text editor | Blog post content | Admin preview renderer |

### 2.3 Tables & Data Display

| Table | Location | Status |
|---|---|---|
| Product listing | `/admin/products` | Basic table, needs redesign |
| Category listing | `/admin/categories` | Basic table, needs redesign |
| User listing | `/admin/users` | Basic table, needs redesign |
| Seller listing | `/admin/sellers` | Basic table, needs redesign |
| Verification records | `/admin/verification` | Basic table, needs redesign |

### 2.3 Empty States

| Empty State | Location | Status |
|---|---|---|
| Product catalogue empty | `/admin/products` (after cleanup) | Needs beautiful empty state |
| Category empty | `/admin/categories` | Needs beautiful empty state |
| Blog posts empty | `/admin/blog` | Needs beautiful empty state |

---

## 3. Existing Problems (Pre-Redesign)

### 3.1 Visual Design

- Admin panel looks like a generic dashboard template, not a premium LONEX experience
- No consistent use of LONEX brand identity (warm white/stone, deep charcoal, brand red)
- Excessive use of red, gradients, and decorative elements
- Generic typography (not using Poppins/IBM Plex Mono from the public website)
- Huge headings that overwhelm the page
- Inconsistent spacing and hierarchy

### 3.2 Form Design

- Placeholders used as replacements for labels (violates accessibility)
- Inconsistent field heights and borders
- Missing focus states
- Missing help descriptions
- Inline validation not implemented
- Error messages generic and unhelpful
- Disabled and loading states absent

### 3.3 Tables

- No consistent column hierarchy
- No proper alignment
- No status badges
- No empty states with useful actions
- No responsive handling for wider screens

### 3.3 Navigation

- Sidebar generic, not using actual LONEX logo
- No tooltips when collapsed
- No responsive mobile drawer
- Breadcrumb navigation absent or generic

### 3.4 Authentication

- Login screen not branded with actual LONEX logo
- No "Remember me" functionality visible
- Password reset flow not documented

### 3.5 Accessibility

- Labels missing or implemented as placeholders only
- Focus indicators inconsistent
- Colour contrast not optimized for admin workflow
- Keyboard navigation not optimized

---

## 4. Proposed Visual System

### 4.1 Colour Palette (LONEX Brand)

| Role | Color (hex) | Usage |
|---|---|---|
| Surface / Page Background | `#FAFAFA` / `#F5F5F5` | Pages, cards, modals |
| Surface Elevated | `#FFFFFF` | Card backgrounds, form backgrounds |
| Primary Text / Ink | `#212121` / `#1F1F1F` | Body text, labels |
| Secondary Text / Muted | `#757575` | Descriptive text, captions |
| Accent / Brand Red | `#C41A3C` | Active states, important actions, links |
| Border / Divider | `#E0E0E0` | Field borders, table rows |
| Muted Border | `#CCCCCC` | Disabled states, separated content |

### 4.2 Typography

| Role | Font Family | Scale |
|---|---|---|
| Interface / Labels | `Poppins` | `--font-display` |
| Technical / Codes / Metadata | `IBM Plex Mono` | `--font-mono` |
| Small Caption | `--caption-scale` | 0.75rem / 12px |
| Smallest Caption | `--caption2-scale` | 0.6875rem / 11px |

### 4.3 Spacing & Radius

| Property | Value |
|---|---|
| Page Margin | `clamp(24px, 4vw, 32px)` |
| Section Gap | `clamp(16px, 2vw, 24px)` |
| Form Field Height | `clamp(44px, 4.4vw, 48px)` |
| Border Radius | `8px` |
| Card Radius | `12px` |

### 4.4 Shadow & Elevation

- Subtle `0 1px 2px rgba(0,0,0,0.05)` on cards and modals
- No excessive shadows
- Focus ring: `2px solid #C41A3C` with `outline: none`

---

## 5. Priority Redesign Order

1. **Admin sidebar and global shell** — Logo, navigation, collapse/responsive
2. **Dashboard** — Metrics, quick actions, accurate zero counts after catalogue cleanup
3. **Products and product editor** — Full CRUD with beautiful empty state
4. **Categories** — Management with beautiful empty state
5. **Media library** — Asset browsing, upload, referential integrity
6. **Journal and article editor** — Blog post management
7. **Verification management** — Model code verification records
8. **Authorized sellers** — Seller records and management
9. **User management** — User list, detail, and edit
10. **Settings** — Site configuration
11. **Login screen** — Branded authentication

---

## 6. Checklist for Redesign Completion

- [ ] Actual LONEX logo used in sidebar and login screen
- [ ] Poppins for all interface text, IBM Plex Mono for technical values
- [ ] Warm white/stone surfaces, deep charcoal text, brand red for actions
- [ ] Consistent field heights (44-48px), visible labels above every field
- [ ] Consistent border-radius (8px), subtle shadows
- [ ] Focus states: 2px solid brand red, `outline: none`
- [ ] Tables: column hierarchy, status badges, empty states with actions
- [ ] Forms: labels above, help descriptions, inline validation
- [ ] Responsive at 1440, 1024, 768, 390, 360px
- [ ] No horizontal overflow at any width
- [ ] Keyboard navigation functional
- [ ] Reduced-motion support
- [ ] All existing CRUD operations preserved
- [ ] No broken functionality
- [ ] Admin can log in, create/edit/delete records, upload images

---

## 7. Empty State Templates (planned)

**Product Catalogue Empty:**
```
Your catalogue is ready.

Start by adding your first product.
[Add Product →]
```

**Category Empty:**
```
Your category list is ready.

Start by adding your first category.
[Add Category →]
```

**Blog Posts Empty:**
```
Your journal is ready.

Start by adding your first article.
[Add Article →]
```

---

## 8. Quick Actions (Dashboard)

Because the catalogue has been cleared, show accurate zero counts:

- Total products: 0
- Published products: 0
- Categories: 3 (solar, batteries, ev-bikes)
- Published articles: [count]
- Verification records: [count]
- Authorized sellers: [count]

Useful quick actions:
- Add product
- Create article
- Upload media
- Manage categories
- Review verification records

No fabricated charts, revenue figures, sales statistics, or activity.

---

## 9. Final Notes

This audit documents the existing admin panel structure and problems before redesign. The redesign must:

- Carry the actual LONEX brand identity
- Not invent content, statistics, or users
- Preserve all existing CRUD operations and business logic
- Not break existing functionality
- Work at all five viewport sizes (1440, 1024, 768, 390, 360)
- Pass typecheck, ESLint, tests, and production build
- Capture final screenshots and deliver ZIP

---

**End of Audit**
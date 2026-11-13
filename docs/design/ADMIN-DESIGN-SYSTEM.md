# LONEX Admin Design System

**Version:** 1.0  
**Author:** LONEX Admin Redesign  
**Created:** 13 November 2026

## Visual Direction

The admin must feel like a premium enterprise management platform carrying the actual LONEX brand identity.

### Color Palette (LONEX Brand)

| Role | Hex | Usage |
|---|---|---|
| `--color-page-bg` | `#FAFAFA` | Page backgrounds, modals |
| `--color-surface` | `#FFFFFF` | Cards, form backgrounds |
| `--color-ink` | `#212121` | Body text, labels |
| `--color-text-muted` | `#757575` | Descriptive text, captions |
| `--color-brand-red` | `#C41A3C` | Active states, important actions, links |
| `--color-border` | `#E0E0E0` | Field borders, table rows |
| `--color-divider` | `#CCCCCC` | Disabled states, separated content |

### Typography

| Role | Font Family | CSS Variable |
|---|---|---|
| Interface / Labels | `Poppins` | `--font-display` |
| Technical / Codes / Metadata | `IBM Plex Mono` | `--font-mono` |
| Small Caption | -- | `0.75rem / 12px` |
| Smallest Caption | -- | `0.6875rem / 11px` |

### Spacing & Radius

| Property | Value |
|---|---|
| `--space-2xs` | `4px` |
| `--space-xs` | `8px` |
| `--space-sm` | `12px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `40px` |
| `--space-2xl` | `64px` |
| `--space-3xl` | `96px` |
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |

### Shadow & Elevation

- `0 1px 2px rgba(0,0,0,0.05)` on cards and modals
- Focus ring: `2px solid var(--color-brand-red)` with `outline: none`
- No excessive shadows

### Icon System

- Use existing line icons for sidebar navigation
- Consistent stroke width and size
- Hover and active states
- Tooltip icons when sidebar collapsed

### Breakpoints

| Label | Width |
|---|---|
| `xl` | 1440px |
| `lg` | 1024px |
| `md` | 768px |
| `sm` | 390px |
| `xs` | 360px |

---

## A. Sidebar

### Requirements

- Actual LONEX logo (leftmost, fixed height `64px`, clear space below)
- Collapsible to icon-only mode (`min-width: 64px`)
- Active navigation item highlighted with brand red underline
- Smooth collapse/expand animation (`200ms ease`)
- Tooltips on icon-only mode (`aria-label` present)
- Mobile drawer for < 640px (hamburger → full-width panel)
- Proper `aria-label` and `aria-expanded` on toggle
- Focusable toggle with visible focus ring

### Navigation Items (map to actual routes)

| Label | Route | Icon |
|---|---|---|
| Dashboard | `/admin` | Home |
| Catalogue | — | Box |
| Products | `/admin/products` | Box |
| Categories | `/admin/categories` | Grid |
| Content | `/admin/blog` | Article |
| Verification | `/admin/verification` | Check |
| Authorized Sellers | `/admin/sellers` | User |
| Users | `/admin/users` | Users |
| Settings | `/admin/settings` | Gear |
| Login (if not logged in) | `/admin/login` | Lock |

### Features

- Clear active navigation state (background highlight + brand red text)
- Elegant line icons (20px × 20px)
- Collapsible sidebar where appropriate
- Tooltips when collapsed (show full label)
- Responsive mobile drawer
- Proper spacing and hierarchy (`--space-md` between items)
- Clear section grouping (Dashboard, Catalogue, Content, Verification/Sellers)
- Current page indicator (deeper highlight)

Do not invent routes. Map navigation to actual existing routes.

### Mobile Drawer

- Hamburger button in toolbar → slides in from left
- Full-width panel (`100vw`, `calc(100vh - 56px)`)
- Same navigation items as sidebar
- Close button (X) top-right
- Overlay backdrop (`rgba(0,0,0,0.4)`, `backdrop-filter: blur(4px)`)
- Keyboard Escape to close
- Focus traps inside drawer

---

## B. Top Navigation (Topbar)

### Requirements

- Breadcrumb navigation (`Home > Dashboard` or `Home > Products > List`)
- Current page context (small subtitle under page title)
- Page-specific actions (right-aligned, context-appropriate)
- Admin profile menu (avatar initials, dropdown with Sign Out)
- No fake notifications (unless real notification system exists)

### Breadcrumb Example

```
Home > Products > List
```

### Page-Specific Actions

- New (create) button primary, right-aligned
- Filter / Sort dropdowns if applicable
- Export, Import actions for data tables

### Admin Profile

- Initials avatar (capital letters, brand red background)
- Dropdown: Profile, Sign Out
- Sign Out terminates admin session

---

## C. Headings and Page Introductions

Every admin page should have a professional heading structure.

### Example:

```
Products

Manage your product catalogue, specifications and published listings.
```

### Include:

- Small contextual eyebrow where useful (e.g., "4 products, 3 categories")
- Clear page title (not enormous)
- Concise description (2-3 lines max)
- Primary action on the right (Add New, Create, etc.)
- Breadcrumbs (above or within page header)

Do not use enormous headings. Maintain consistent heading sizes across all admin pages.

### Heading Scale

| Heading | Rem | Usage |
|---|---|---|
| `h1` | 2.25rem | Page title (rare, only on dashboard, login) |
| `h2` | 1.875rem | Section headings within page |
| `h3` | 1.5rem | Sub-section headings |
| Eyebrow | 0.875rem | Small contextual text under title |

---

## D. Form Design

### Field Base

```css
/* Base form field */
.lxad-form-field {
  margin-bottom: var(--space-md);
}

.lxad-form-field .lxad-form-label {
  display: block;
  margin-bottom: var(--space-xs);
  font-size: var(--font-small);
  color: var(--color-text-muted);
}

.lxad-form-field .lxad-form-input,
.lxad-form-field .lxad-form-select,
.lxad-form-field .lxad-form-textarea {
  width: 100%;
  height: var(--field-height, 44px);
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: var(--font-base);
  color: var(--color-ink);
  background: var(--color-surface);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.lxad-form-field .lxad-form-input:focus,
.lxad-form-field .lxad-form-select:focus,
.lxad-form-field .lxad-form-textarea:focus {
  border-color: var(color-brand-red);
  outline: none;
  box-shadow: 0 0 0 2px rgba(196, 26, 60, 0.15);
}
```

### Requirements (every form field)

- [ ] Visible label above every field (never use placeholder as label replacement)
- [ ] Consistent field height (`var(--field-height, 44px)`)
- [ ] Refined border and `var(--radius-sm)` radius
- [ ] Proper focus state (`var(--color-brand-red)` border + shadow)
- [ ] Clear placeholder (if used, different color: `var(--color-text-muted)`)
- [ ] Helpful description text below field (optional, `var(--color-text-muted)`)
- [ ] Inline validation (green check, red error)
- [ ] Error messages (specific, helpful, not generic)
- [ ] Disabled state (`var(--color-border)`, `var(--color-text-muted)` text)
- [ ] Loading state (spinner, disabled input)
- [ ] Required indicator (asterisk `*` in label, `aria-required="true"`)

### Field Variants

| Field Type | Class Prefix | Notes |
|---|---|---|
| Text input | `.lxad-input` | Standard |
| Email input | `.lxad-input--email` | Type=`email` |
| Number input | `.lxad-input--number` | Type=`number`, step validation |
| Select dropdown | `.lxad-select` | Native `<select>` or custom |
| Textarea | `.lxad-textarea` | Resizable-height option |
| File upload | `.lxad-file` | Browse button + filename |
| Image upload | `.lxad-image` | Preview + remove button |
| Checkbox | `.lxad-checkbox` | Label right of input |
| Radio group | `.lxad-radio` | Vertical stack |
| Toggle switch | `.lxad-toggle` | Sliding button |
| Date field | `.lxad-date` | Calendar popup |
| Rich-text | `.lxad-rich-text` | Editor with toolbar |

### Form Section Grouping

- Related fields grouped with `var(--space-md)` gutter
- Section header: `var(--color-text-muted)` small caption, `var(--font-small)` size
- Divider: `var(--color-divider)`, `1px` height, `margin-var(--space-md)` top/bottom
- Submit button group at bottom: primary (left) + secondary (right) or full-width row

---

## E. Tables and Data Management

### Table Base

```css
.lxad-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-display);
  font-size: var(--font-sm);
  color: var(--color-ink);
}

.lxad-table th {
  padding: var(--space-sm) var(--space-md);
  text-align left;
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  color: var(--color-text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lxad-table td {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
}

.lxad-table tbody tr {
  transition: background-color 0.2s ease;
}

.lxad-table tbody tr:hover {
  background: rgba(196, 26, 60, 0.04);
}
```

### Requirements

- [ ] Clean column hierarchy (header fixed, data aligned)
- [ ] Consistent row height (`var(--space-md)` vertical rhythm)
- [ ] Proper text alignment (left for text, center for numbers, right for prices)
- [ ] Status badges in dedicated column
- [ ] Pagination (compact, `--space-xs` between items)
- [ ] Search and filters where supported
- [ ] Row actions (edit, delete, view dropdown)
- [ ] Empty states with useful actions
- [ ] Responsive: horizontal scroll on < 1024px, single-column on < 640px

### Empty State (product catalogue)

```
Your catalogue is ready.

Start by adding your first product.
[Add Product →]
```

**Empty State (category list):**

```
Your category list is ready.

Start by adding your first category.
[Add Category →]
```

### Row Actions

- Edit (primary, opens editor in new/tab or modal)
- Delete (destructive, confirmation dialog)
- View (read-only detail)
- Move to top / Change status (badge + dropdown)

### Status Badges

| Status | Background | Text | Usage |
|---|---|---|---|
| Active | `--color-brand-red` | White | Default, currently available |
| Inactive | `--color-text-muted` | White | Temporarily unavailable |
| Draft | `--color-text-muted` | Muted | In development |
| Archived | `--color-divider` | Muted | No longer active |

---

## F. Buttons and Interactions

### Button Variants

| Variant | Background | Text | Border | Hover | Usage |
|---|---|---|---|---|---|
| Primary | `--color-brand-red` | White | None | Darker red (`darken 10%`) | Main CTA, create actions |
| Secondary | White | `--color-brand-red` | `1px solid --color-brand-red` | Red text, border darken 10% | Secondary actions |
| Outline | `--color-page-bg` | `--color-brand-red` | `1px solid --color-brand-red` | Red text, border darken 10% | Subtle actions |
| Ghost | `--color-page-bg` | `--color-text-muted` | None | Muted text | Dangerous/rare actions |
| Text | No border | `--color-brand-red` | None | Underline on hover | Inline links |

### Button States

| State | Background | Text | Border | Box Shadow | Disabled |
|---|---|---|---|---|---|
| Default | As defined | As defined | As defined | None | `var(--color-border)`, `var(--color-text-muted)` text |
| Hover | Darken 10% | As defined | As defined | None | N/A |
| Active | Darken 15% | As defined | As defined | None | N/A |
| Focus | `2px solid --color-brand-red` outside box | Contrast | As defined | `0 0 0 2px rgba(196,26,60,0.15)` | N/A |
| Disabled | `var(--color-border)` | `var(--color-text-muted)` | `var(--color-border)` | None | `opacity: 0.5` |

### Button Sizes

| Size | Height | Font Size | Padding |
|---|---|---|---|
| Default | 40px | 0.875rem | `var(--space-sm)` horizontal, `var(--space-xxs)` vertical |
| Small | 32px | 0.75rem | `var(--space-xxs)` horizontal, `var(--space-xxs)` vertical |
| Large | 48px | 1rem | `var(--space-md)` horizontal, `var(--space-sm)` vertical |

### Button Groups

- Radio button group: vertically stacked, consistent height
- Toolbar buttons: `var(--space-xxs)` gap
- Drop-down button: caret icon, opens menu on click

---

## G. Cards, Dialogs and Feedback

### Card

```css
.lxad-card {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  padding: var(--space-md);
  transition: box-shadow 0.2s ease;
}

.lxad-card:hover {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

### Dashboard Metric Card

```
[Large number, brand red]
[Title, muted]
[Small description, even more muted]
[Quick action →, outline button]
```

### Confirmation Dialog

```css
.lxad-dialog {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lxad-dialog-content {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  width: 90%;
  max-width: 440px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.lxad-dialog-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-lg);
  gap: var(--space-sm);
}
```

### Toast Messages

- Appear top-right, fade out after 4 seconds
- Icon + message text
- Action button (if needed)
- Never block primary workflow

### Loading Skeletons

- Card-shaped skeletons for data grids
- Input-shaped skeletons for forms
- Button-shaped skeletons with spinner
- Use `animation: lxad-skeleton-enter 200ms ease-out`

### Error States

- Inline: `var(--color-brand-red)` text + icon, below field
- Page-level: Banner at top of page, `var(--color-brand-red)` with close button
- Never 404-page-style errors within admin workflow

---

## G. Buttons and Interactions (continued)

### Navigation Transitions

- Sidebar collapse/expand: `200ms ease transform`
- Page transition: `300ms ease` (if using page transitions)
- Modal open/close: `200ms ease fade + scale`

### Reduced-Motion Support

- Respect `prefers-reduced-motion: reduce`
- Disable all non-essential animations
- Keep essential motion (focus rings, collapsed sidebar)
- Reduce motion: `transition: none !important`, `animation: none !important`

---

## H. Responsive Design and Accessibility

### Viewport Testing

Test at all five sizes:

| Width | Purpose |
|---|---|
| 1440px | Full dashboard, wide tables |
| 1024px | Standard view, most features visible |
| 768px | Compact, some overflow |
| 390px | Mobile drawer, focused actions |
| 360px | Small mobile, minimal display |

### Requirements at Each Width

- No horizontal overflow
- Responsive tables (single-column < 640px, horizontal scroll < 1024px)
- Functional mobile sidebar / drawer
- Usable forms on mobile (touch target ≥ 44px)
- Accessible labels (programmatically associated, not placeholder-only)
- Keyboard navigation (Tab order, Escape to close modals/drawers)
- Visible focus indicators (2px brand red ring, `outline: none`)
- Correct colour contrast (WCAG AA minimum)
- Proper dialog focus management (trap focus, return focus on close)
- Reduced-motion support (respect `prefers-reduced-motion`)

### Accessibility Checklist

- [ ] All form labels programmatically associated (`for` / `aria-label`)
- [ ] Focus visible on all interactive elements
- [ ] Focus order logical (Tab key)
- [ ] Skip links for lengthy pages
- [ ] ARIA roles and states accurate (`aria-checked`, `aria-expanded`, `aria-disabled`)
- [ ] Color contrast WCAG AA minimum (4.5:1 normal, 3:1 large)
- [ ] Language attribute `<html lang="en">`
- [ ] Landmark roles (header, navigation, main, aside, footer)
- [ ] Tables have `scope` attributes on headers
- [ ] Error messages linked to fields (`aria-describedby`)
- [ ] Reduce motion respects user preference

---

## I. Quality Bar

### Must Pass Before Completion

- [ ] Typecheck: `npm run typecheck` — Pass
- [ ] ESLint: `npx eslint "src/app/(site)/admin/**"` — Pass, 0 errors
- [ ] Tests: `npm run test` — All 192 + admin-specific tests pass
- [ ] Production build: `npm run build` — Pass
- [ ] Admin can log in
- [ ] Admin can log out
- [ ] Admin can create a product
- [ ] Admin can edit a product
- [ ] Admin can delete a product
- [ ] Image uploads work
- [ ] Category management works
- [ ] Blog management works
- [ ] Settings remain functional
- [ ] No broken images at any width
- [ ] No console errors at any width
- [ ] No authentication regressions
- [ ] Database cleanup remains intact
- [ ] Tested at 1440, 1024, 768, 390, 360px
- [ ] Screenshots captured and delivered

---

## I. Implementation Phases (chronological)

1. **Admin sidebar and global shell** — Logo, navigation, collapse/responsive
2. **Dashboard** — Metrics, quick actions, accurate zero counts
3. **Products and product editor** — Full CRUD, beautiful empty state
4. **Categories** — Management, beautiful empty state
5. **Media library** — Asset browsing, upload, referential integrity
6. **Journal and article editor** — Blog post management
7. **Verification management** — Model code verification records
8. **Authorized sellers** — Seller records and management
9. **User management** — User list, detail, and edit
10. **Settings** — Site configuration
11. **Login screen** — Branded authentication

---

## I. Final Check

Before marking complete, verify:

- [ ] Actual LONEX logo used (not generic, not plain text)
- [ ] Poppins / IBM Plex Mono typography throughout
- [ ] Color palette: `--color-page-bg`, `--color-ink`, `--color-brand-red` consistent
- [ ] No placeholder-as-label anti-pattern
- [ ] Consistent field heights and borders
- [ ] Focus states: 2px brand red ring
- [ ] Tables have status badges and empty states
- [ ] Forms have labels above, help descriptions, inline validation
- [ ] Responsive at all five viewport sizes
- [ ] No horizontal overflow at any width
- [ ] Accessible labels and focus indicators
- [ ] Reduced-motion support
- [ ] All CRUD operations preserved
- [ ] Typecheck, ESLint, tests, build all pass
- [ ] Final screenshots captured and delivered in ZIP

---

**End of Design System**
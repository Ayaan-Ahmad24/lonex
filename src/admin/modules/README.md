# LONEX modules

Per-deployment module composition. Each module folder holds its definitions, Server
Actions, forms and queries, and is joined to the core through
`src/admin/config/registry.ts`.

## Implemented

| Module | Path | Permission | Notes |
| --- | --- | --- | --- |
| `pages` | `pages/` | `pages.edit`, `content.publish` | Metadata, five typed section types, draft/publish, preview, revisions, `public_paths` claim |
| `media` | `media/` | `media.manage` | Private uploads, alt text, reference-protected deletion |
| `settings` | `settings/` | `settings.manage` | Allowlisted site identity/contact/SEO fields, no secrets |
| `users` | `users/` | `users.manage` | List/detail, deactivate, reactivate, role change; no account creation |
| `audit` | `audit/` | `audit.view` | Read-only viewer |
| `dashboard` | `dashboard/` | (uses per-card permissions) | Server-side counts and recent activity |

Module definitions live in `definitions.ts`.

## Rules

- A module declares its admin path, required permission and navigation metadata; the
  registry validates ids, paths and overlap.
- Every Server Action calls `authorizeAction` before validating or mutating.
- Mutations that change users, settings, media or content write audit in the same
  transaction.
- Business rules still to preserve: no inventory counts, no cart, no checkout, no
  customer or seller accounts, optional prices with `show_price` defaulting to false, one
  verification code per product model.
- Product, category, seller and blog modules are **not** part of Sprint 02. They must
  claim `public_paths` when added and must not introduce competing dynamic routes.

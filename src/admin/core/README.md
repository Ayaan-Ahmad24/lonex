# Reusable CMS core

Client-agnostic CMS code. Nothing in this directory may import LONEX branding, LONEX
module definitions or the composition root in `src/admin/config/`.

## Layout

| Path | Purpose |
| --- | --- |
| `registry/` | Static module registry, navigation and breadcrumb builders |
| `guards.ts` | Server page/action guards (`requireAdmin`, `requirePermission`, `requireModule`, `authorizeAction`) |
| `crud/` | List parameter parsing against a static allowlist and action-state types |
| `ui/` | Table, toolbar, pagination, fields, action form, confirm dialog, cards, badges |
| `settings/` | Allowlisted settings Zod schema and service |
| `media/` | Signature validation, private storage adapter and media service |
| `publishing/` | Page schema, section registry, public paths, page/section services, revisions |
| `audit/` | Read-only audit query |
| `shell/` | Responsive admin shell, icons, skeleton, sign-out |

## Rules

1. Core code must not import from `src/admin/modules` or `src/admin/config`.
2. Modules are compiled in. The database never supplies routes, permissions or
   executable code, and duplicate/overlapping admin paths fail fast.
3. Branding and module selection live in `src/admin/config/site.ts`.
4. Permission checks are enforced on the server for every page and mutation. Hiding
   navigation is UX only.
5. Content that can be reached publicly claims `public_paths`; a per-table slug is not
   enough.
6. Section text is rendered as text. No `dangerouslySetInnerHTML`, arbitrary component
   name or client-supplied renderer.
7. Media storage root must stay outside `public/`, `.next/` and `node_modules/`.

See `docs/decisions/0001-url-uniqueness-and-public-paths.md` and
`docs/decisions/0003-sprint-02-cms-core-implementation.md`.

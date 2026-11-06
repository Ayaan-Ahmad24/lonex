# 0001 — URL uniqueness, reserved routes and `public_paths`

Status: Accepted (implemented for pages in Sprint 02; other owner types remain future work)
Date: 2026-11-04
Sprint: 01 (decision), 02 (implementation)

## Context

The public site will eventually serve, at the same top level:

- CMS pages (`/about`, `/contact`, custom landing pages)
- product categories (`/solar`, `/ev`)
- product detail pages (`/<category>/<product-slug>`)
- blog posts (`/blog/<slug>`)
- seller/city pages and verification pages
- static routes such as `/admin`, `/api`, `/sitemap.xml`, `/robots.txt`

If each module owns its own `slug` column and each module is trusted to stay unique, two modules
can claim `/solar` at the same time. App Router then has an ambiguous dynamic segment and the
winner depends on filesystem/dispatch order. Renaming or deleting content can also orphan a URL.

Phase 01 acceptance explicitly requires: “No ambiguous dynamic App Router route definitions” and
“Design path uniqueness solution for dynamic category + custom pages before creating ambiguous
route segments. Choose a single top-level dispatcher/URL registry or obtain approval for page
prefix. Reserved slugs and uniqueness must be defined centrally.”

## Decision

### 1. One global path registry

Before the first public dynamic route is added, create a single `public_paths` table:

| Column | Type | Rule |
| --- | --- | --- |
| `id` | bigint / int PK | internal |
| `path` | varchar unique | normalized: lowercase, leading `/`, no trailing `/`, no query/fragment, percent-decoded, `/` only for the homepage |
| `owner_type` | varchar | `page`, `category`, `product`, `post`, `seller`, `system` |
| `owner_id` | varchar | id of the owning row |
| `status` | varchar | `active`, `draft`, `redirected`, `reserved` |
| `created_at` / `updated_at` | timestamp | audit-friendly |

Rules:

- `path` has a unique index; a collision fails inside the transaction that creates/renames content.
- One owner maps to exactly one path; renaming updates the registry row in the same transaction and
  optionally inserts a `url_redirects` row.
- Deleting content releases or redirects the path; it never silently leaves a stale public URL.
- Modules may keep a human-friendly `slug` for editing, but the registry is the source of truth for
  routing and uniqueness.
- A `path` under a reserved prefix can only be owned by the corresponding system route, never by
  content.

### 2. Central reserved prefixes

Create one module (for example `src/lib/routing/reserved.ts`) exporting the reserved top-level
segments and full reserved paths. Validation, the registry and any future import tooling must use
that single list.

Initial reserved top-level segments:

```
admin
api
_next
media
assets
uploads
sitemap.xml
robots.txt
favicon.ico
```

Also reserve the public route names actually implemented in later phases (for example `blog`,
`search`, `verify`) before content can claim them. A prefix is removed from the list only by an
explicit decision, never by a module author.

Normalization is shared by the registry, the admin slug field and any redirect lookup. Two paths
that normalize to the same value are the same path.

### 3. `public_paths` delivery moved to Sprint 02

Sprint 01 created no public dynamic routes and no content tables. Sprint 02 implemented the
registry together with the first owner type (`page`), so path uniqueness is enforced before the
public renderer exists. Categories, products, sellers, posts and redirects still claim the same
registry when their modules are added.

## Consequences

- Every module must claim a path through the registry; bulk imports must handle collisions.
- Slug changes become a two-step operation (registry + redirect) inside one transaction.
- The homepage `/` is a reserved system path, not a page row.
- Until the registry exists, do not add `app/[slug]`, `app/[category]` or similar public dynamic
  segments.

## Alternatives rejected

- **Per-table unique slug only** — cannot prevent cross-module collisions.
- **Path prefix per module** (`/pages/about`, `/products/...`) for everything — safe but conflicts
  with the approved public sitemap and SEO requirements.
- **Route-winner-by-dispatch-order** — non-deterministic and unsafe for content operations.

## Follow-up

1. Add the remaining owner types (category, product, post, seller) as their modules land.
2. Add a collision test that attempts to claim the same path from two owner types.
3. Add redirect handling for renamed paths.
4. Add a public renderer in Phase 04 that reads only active paths and published pages.

Implementation record: `docs/decisions/0003-sprint-02-cms-core-implementation.md`.

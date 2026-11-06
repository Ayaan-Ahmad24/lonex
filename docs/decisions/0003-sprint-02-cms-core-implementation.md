# 0003 — Sprint 02 CMS core: scoped implementation decisions

Status: Accepted
Date: 2026-11-04
Sprint: 02
Related: `0001-url-uniqueness-and-public-paths.md`, `0002-better-auth-password-and-session.md`

## Context

Sprint 02 implements the reusable CMS core on top of the Sprint 01 authentication,
session and RBAC foundation. Several behaviours were not fixed by the reference pack
and had to be decided while coding. This record keeps those choices explicit so later
modules do not silently diverge.

## Decisions

### 1. `public_paths` is implemented for pages only

`public_paths` now exists with a unique normalized `path`, `owner_type`, `owner_id` and
`status`. Pages claim `/slug` inside the same transaction that creates or renames a page.
The homepage `/` and the centralized reserved prefixes cannot be claimed by content.

Only the `page` owner type is implemented in this sprint. Categories, products, sellers
and blog posts must use the same registry when they are added. They must not add their
own competing unique-slug routing.

Published page slugs are locked. Renaming a published page is rejected until the page is
unpublished; a redirects workflow is not part of Sprint 02.

### 2. Publishing is a page state, not a separate draft branch

`pages.status` is `draft` or `published`. Publishing updates the page row and the
`public_paths` status in one transaction, writes a revision and an audit row. Unpublishing
does the reverse.

Revisions are immutable JSON snapshots retained per entity (latest 20). They are audit
history, **not** an editable draft that is promoted on publish. Editing a published page
updates the live record immediately. A future draft/live split would need a separate
storage model and is not claimed here.

There is no public page renderer in Sprint 02 (Phase 04 owns it), so a draft cannot be
reached on the public site yet. The admin preview route is authenticated.

### 3. Section types are compiled-in and versioned

Five section types are available: `hero`, `rich-text`, `image-text`, `benefits-grid` and
`contact-cta`. Each has a Zod schema and `schema_version = 1`.

Section text is stored and rendered as plain text. Links allow internal paths or HTTPS
only. No raw HTML, arbitrary component name, template or executable code is accepted from
the admin. Adding a section type requires code, a schema version decision and tests.

### 4. Media is private and signature-validated

- Storage is an adapter with a local implementation. Files are stored outside `public/`,
  `.next/` and `node_modules/` under random UUID keys.
- The declared MIME type and filename are metadata only. JPEG, PNG, WebP, GIF and PDF are
  detected from file signatures. SVG, HTML, JavaScript and XML are rejected.
- The served extension and `Content-Type` come from the detected signature.
- PDFs are served with `Content-Disposition: attachment`; images may be inline. All media
  responses are `private, no-store` and require `media.manage`.
- Deletion is refused while a page, section or setting references the asset.
- Local development persistence is verified across a process restart. Production
  persistence on cPanel is **not** verified; the deployment must provide a persistent
  directory outside the release tree or another adapter.

### 5. Settings are allowlisted and secret-free

`site_settings` stores one `site` row validated by a Zod schema: identity, contact,
social links and SEO defaults. Database credentials, API keys, SMTP passwords, auth
secrets and other deployment configuration are deliberately absent. Saving writes only
changed keys to the audit metadata and commits the row and audit entry together.

### 6. Account administration stays CLI-first

Public sign-up remains disabled and there is no admin UI to create accounts. Sprint 02
adds reactivation and role replacement for administrators because the Phase 02 scope
requires user management. Accounts are still created only through `npm run admin:create`.

The last active administrator cannot be deactivated or demoted, and an administrator
cannot deactivate or change their own role. Every user mutation revokes sessions where
applicable and writes an audit row in the same transaction.

### 7. Deleting a published page requires `content.publish`

`pages.edit` is enough to create and edit pages and sections. Taking a page offline by
deleting it is treated as a publishing action: the page status is checked inside the
delete transaction and `content.publish` is required when it is published. The UI hides
the delete control in that case, but the server check is authoritative.

### 8. Test and CI infrastructure decisions

- The E2E module spec signs in once per role through the real auth API and reuses the
  cookies. The login UI and rate limiter remain covered by `foundation.spec.ts`. This
  keeps the suite below Better Auth's documented 10 sign-ins per 5 minutes per IP.
- Media deletion redirects to `/admin/media` after success so the deleted detail page is
  not left in the history.
- Integration cleanup removes only the rows created by each test, by explicit id. Page
  deletion intentionally keeps revision history, so the test records the id before
  deletion and removes that history in `afterAll`.
- CI uses GitHub Actions with an ephemeral MySQL 8 service, `npm ci`, migrations,
  `scripts/seed-rbac.sql`, typecheck, lint, Vitest, build and Playwright. CI credentials
  are test-only values and must never be reused.

## Consequences

- Later content modules must claim `public_paths`; a per-table unique slug is not enough.
- A published page's URL is stable until an explicit unpublish/rename workflow exists.
- Media files must never be moved under `public/` to "make previews easier".
- A production media adapter and backup policy are deployment prerequisites.
- CI is configured but has not yet run on GitHub, so it is not evidence of a green remote
  pipeline.

## Verification

- `tests/unit/routing.test.ts` — normalization, reserved paths, homepage, traversal.
- `tests/integration/pages-publishing.test.ts` — path claim/release, publish transitions,
  revisions, audit, published-delete permission.
- `tests/unit/publishing-sections.test.ts`, `tests/unit/page-schema.test.ts`.
- `tests/integration/media.test.ts`, `tests/unit/media-validation.test.ts`.
- `tests/integration/settings.test.ts`, `tests/unit/settings-schema.test.ts`.
- `tests/integration/users-admin.test.ts`, `tests/unit/module-registry.test.ts`.

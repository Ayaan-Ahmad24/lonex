# 0004 — LONEX-Specific Delivery, No Page Builder

Status: Accepted (owner decision)

## Context

Earlier sprints explored a reusable multi-client CMS with a visual page builder. Owner decided to prioritize delivery of the current client (LONEX) website.

## Decision

- LONEX-only architecture. No multi-client CMS requirement.
- No visual page builder.
- No generic page/section editor.
- All public pages custom-coded in React/Next.js.
- LONEX-specific client-facing administration.
- Existing authentication and security preserved.
- Existing generic UI primitives may be reused.
- Scope change reason: prioritize delivery of the current client's website.

## Consequences

- Page builder modules removed.
- Public routes are explicit Next.js pages.
- Admin manages LONEX business entities only.

# 0002 — Better Auth 1.7.15: password hashing and session model

Status: Accepted
Date: 2026-11-04
Sprint: 01
Supersedes: undated scratch decision previously kept outside the repository

## Context

The project needs local administrator authentication with:

- no public sign-up;
- server-validated sessions and immediate revocation on logout/deactivation;
- strong password hashing supported on a cPanel/Passenger Linux host where native modules are a
  deployment risk;
- DB-backed throttling that survives restarts and works across processes;
- one hashing implementation shared by the admin bootstrap CLI and the login path.

The existing repository already used `better-auth@1.7.15` with `@better-auth/drizzle-adapter` and
the Drizzle identity tables. The reference pack prefers Argon2id “where host supports native
module/runtime; otherwise carefully configured bcrypt or other reviewed supported approach”.

## Decision

### Library and adapter

Keep `better-auth@1.7.15` with `@better-auth/drizzle-adapter@1.7.15`, pinned. The identity schema
(`user`, `session`, `account`, `verification`) and the existing MySQL 8 / Drizzle setup are
unchanged in shape.

### Password hashing

Use Better Auth's built-in scrypt implementation from `better-auth/crypto`
(`@better-auth/utils/password`):

- `N = 16384`, `r = 16`, `p = 1`, `dkLen = 64`
- 16 random salt bytes, stored as hex in `salt:key`
- passwords normalized with NFKC

Rationale:

- No native addon, so it is portable to the approved hosting target.
- Maintained as part of the selected auth library; no custom crypto code in this repository.
- The bootstrap CLI uses the same `hashPassword`, so CLI-created accounts authenticate through the
  normal Better Auth path.

Accepted risk: scrypt is not Argon2id. Argon2id remains the preferred algorithm in principle. It
is not used now because the host does not yet prove a maintained native module and no hash
migration path exists. Revisit only with an explicit migration plan that can re-hash existing
accounts on successful login.

### Password policy

12–128 characters, not blank, not equal to the account email, email local part or name, and at
least four distinct characters. Implemented once in
`src/lib/security/password-policy.ts` and consumed by both Better Auth (`minPasswordLength`) and
`scripts/create-admin.ts`.

### Session model

- Lifetime: 7 days
- Rolling refresh: at most once per hour
- Fresh window: 15 minutes for sensitive operations
- Cookie prefix: `lonex`
- `cookieCache` intentionally **disabled** so logout and `isActive` changes take effect on the
  next request
- Session creation is blocked for missing or inactive users by a database hook

### Account provisioning

Public sign-up is disabled. Administrators/editors are created only through the interactive
`npm run admin:create` CLI, which prompts for name, email and a hidden password. There is no
default or hardcoded production credential. CLI input is validated against the shared policy.

### Throttling

- Better Auth: database-backed counters, 10 sign-in attempts / 5 minutes per resolved client IP.
- Account-scoped: 5 failures / 5 minutes per SHA-256(email) in `rate_limit`; success clears it.
- Client IP is resolved through `trustedProxies` only when `TRUSTED_PROXIES` is configured. Empty
  in production means forwarded headers are ignored (fail-closed shared bucket), never blindly
  trusted.

## Consequences

- Password verification behaviour is owned by the library; do not add a second hasher.
- Password rotation/rehash must use the same library function.
- Changing session settings affects revocation guarantees; keep `cookieCache` disabled while
  deactivation must be immediate.
- Any future migration to Argon2id requires a documented rehash-on-login strategy and tests.

## Verification

- `tests/unit/password-policy.test.ts` (10 tests)
- `tests/unit/trusted-proxies.test.ts` (8 tests)
- `tests/integration/login-throttle.test.ts` (6 tests)
- `tests/e2e/foundation.spec.ts`: admin login/logout, inactive rejection, authenticated
  deactivation, spoofed-XFF limiter
- `scripts/create-admin.ts` uses `hashPassword` from `better-auth/crypto`

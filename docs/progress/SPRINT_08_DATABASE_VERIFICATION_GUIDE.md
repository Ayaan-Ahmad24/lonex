# LONEX Sprint 08 — Database Verification Guide

This document explains how to verify that admin changes are correctly persisted in MySQL using read-only inspection. It is intended for QA and troubleshooting only — no production-facing database viewer is created.

## 1. Connect to MySQL

### Using mysql.exe (Windows Command Prompt)

```cmd
mysql -h 127.0.0.1 -P 3306 -u lonex_dev_user -p lonex_dev
```

Enter the password from `.env.local` (`MYSQL_PASSWORD`) when prompted.

### Using MySQL Workbench on Windows

1. Open MySQL Workbench
2. Click "+" next to "MySQL Connections"
3. Configure:
   - **Connection Name:** LONEX Dev
   - **Hostname:** 127.0.0.1
   - **Port:** 3306
   - **Username:** lonex_dev_user
   - **Password:** (from .env.local, do not save in plaintext)
   - **Default Schema:** lonex_dev
4. Click "Test Connection" then "OK"

## 2. Verify the Active Database

After connecting, confirm you are in the correct database:

```sql
SELECT DATABASE();
-- Expected: lonex_dev

SELECT VERSION();
-- Expected: MySQL 8.x

SELECT CURRENT_USER();
-- Expected: lonex_dev_user@localhost
```

## 3. Table and Column Reference

The following tables are relevant for Sprint 08 verification:

| Table | Key Columns | Purpose |
|-------|-------------|---------|
| `categories` | id, name, slug, sort_order, status, cover_media_id | Product categories |
| `products` | id, category_id, name, slug, status, cover_media_id | Products |
| `product_images` | id, product_id, media_id, sort_order, is_primary | Product images |
| `media_assets` | id, storage_key, original_name, mime_type, bytes, width, height, alt_text, uploaded_by | Media library |
| `blog_posts` | id, title, slug, status, cover_media_id, content_json | Blog posts |
| `product_verification_codes` | id, product_id, code_digest, active, registered_at | Verification codes |
| `audit_log` | id, actor_user_id, action, target_type, target_id, metadata, created_at | Audit trail |
| `user` | id, name, email, is_active | Admin users |
| `session` | id, user_id, token, expires_at | User sessions |
| `account` | id, user_id, provider_id, password | Auth identities |

## 4. Safe SELECT Statements

### A. Category Operations

**Before creating a category:**
```sql
SELECT COUNT(*) FROM categories WHERE slug = 'solar';
-- Expected: 0 (if creating new)
```

**After creating a category:**
```sql
SELECT id, name, slug, sort_order, status, cover_media_id, created_at
FROM categories
WHERE slug = 'solar';
-- Verify: sort_order matches the value you entered
```

**After editing category priority:**
```sql
SELECT id, name, sort_order, status
FROM categories
WHERE id = <category_id>;
-- Verify: sort_order matches the saved value
```

**Verify category ordering (ascending by sort_order):**
```sql
SELECT id, name, sort_order
FROM categories
WHERE status = 'published'
ORDER BY sort_order ASC, name ASC;
-- Verify: lower sort_order values appear first
```

### B. Product Operations

**After creating a product:**
```sql
SELECT id, category_id, name, slug, status, show_price, cover_media_id, created_at
FROM products
WHERE slug = '<product-slug>';
-- Verify: status is 'draft' or 'published' as expected
```

**After publishing a product:**
```sql
SELECT id, name, status, published_at
FROM products
WHERE id = <product_id>;
-- Verify: status = 'published' and published_at is set
```

**Verify product image references:**
```sql
SELECT pi.id, pi.product_id, pi.media_id, pi.sort_order, pi.is_primary,
       ma.original_name, ma.mime_type
FROM product_images pi
INNER JOIN media_assets ma ON pi.media_id = ma.id
WHERE pi.product_id = <product_id>;
-- Verify: media_id references an existing media_assets row
```

### C. Media Operations

**After uploading an image:**
```sql
SELECT id, storage_key, original_name, mime_type, bytes, width, height,
       alt_text, uploaded_by, created_at
FROM media_assets
WHERE original_name = '<your-file-name>';
-- Verify: bytes matches file size, mime_type is correct
```

**Verify the private file exists on disk:**
```bash
# The file is stored at: .data/media/<storage-key>
ls -la .data/media/<storage-key-from-query>
```

**Verify media is referenced by published content:**
```sql
-- Check if media is used as a category cover
SELECT c.id, c.name, c.status
FROM categories c
WHERE c.cover_media_id = <media_id>;

-- Check if media is used as a product image
SELECT p.id, p.name, p.status
FROM product_images pi
INNER JOIN products p ON pi.product_id = p.id
WHERE pi.media_id = <media_id>;

-- Check if media is used as a blog cover
SELECT b.id, b.title, b.status
FROM blog_posts b
WHERE b.cover_media_id = <media_id>;
```

### D. Blog Operations

**After saving a blog draft:**
```sql
SELECT id, title, slug, status, cover_media_id, excerpt, created_at, updated_at
FROM blog_posts
WHERE slug = '<blog-slug>';
-- Verify: status = 'draft', content_json is not null
```

**Verify content_json structure:**
```sql
SELECT id, title, content_json
FROM blog_posts
WHERE id = <post_id>;
-- Verify: content_json is valid JSON with version and blocks
```

**After publishing a blog post:**
```sql
SELECT id, title, status, published_at, cover_media_id
FROM blog_posts
WHERE id = <post_id>;
-- Verify: status = 'published' and published_at is set
```

### E. Verification Code Operations

**After assigning a manual code:**
```sql
SELECT pvc.id, pvc.product_id, pvc.code_digest, pvc.active, pvc.registered_at,
       p.name AS product_name, c.name AS category_name, c.status AS category_status
FROM product_verification_codes pvc
INNER JOIN products p ON pvc.product_id = p.id
INNER JOIN categories c ON p.category_id = c.id
WHERE pvc.product_id = <product_id>;
-- Verify: code_digest is a hex string (HMAC-SHA256), active = 1
```

**Verify NO plaintext code is stored:**
```sql
-- code_digest should be a 64-character hex string (SHA-256)
-- No column stores the raw verification code
SELECT LENGTH(code_digest) AS digest_length
FROM product_verification_codes
WHERE product_id = <product_id>;
-- Expected: 64
```

**After rotating a code:**
```sql
-- Record the old digest
SELECT code_digest FROM product_verification_codes WHERE product_id = <product_id>;

-- Rotate the code (via admin UI)

-- Verify the digest changed
SELECT code_digest, active, registered_at
FROM product_verification_codes
WHERE product_id = <product_id>;
-- Verify: code_digest is different from before, registered_at is updated
```

**Verify old code fails publicly:**
The public `/verify` page will return an error for the old code because its digest no longer matches.

### F. User Operations (synthetic accounts only)

**Verify user roles and sessions:**
```sql
SELECT u.id, u.name, u.email, u.is_active,
       GROUP_CONCAT(r.slug) AS roles
FROM user u
LEFT JOIN admin_user_roles aur ON u.id = aur.user_id
LEFT JOIN admin_roles r ON aur.role_id = r.id
WHERE u.email LIKE '%@example.invalid'
GROUP BY u.id;
-- Verify: roles are correct, is_active matches expected state
```

**Verify audit records:**
```sql
SELECT id, actor_user_id, action, target_type, target_id, created_at
FROM audit_log
WHERE action LIKE 'model_code%' OR action LIKE 'media%' OR action LIKE 'user%'
ORDER BY created_at DESC
LIMIT 20;
-- Verify: audit entries exist for admin actions, no raw codes in metadata
```

## 5. How to Verify a Change Before and After Saving

For each admin operation, follow this pattern:

1. **Record the before state** — Run the appropriate SELECT query and note the values
2. **Perform the admin action** — Through the web UI
3. **Record the after state** — Run the same SELECT query
4. **Compare** — Verify the expected field changed and no other fields were modified

Example for category priority edit:
```sql
-- Before
SELECT id, name, sort_order FROM categories WHERE id = 5;
-- Result: sort_order = 10

-- [Admin changes priority to 2 in the UI and saves]

-- After
SELECT id, name, sort_order FROM categories WHERE id = 5;
-- Result: sort_order = 2 (changed), all other fields unchanged
```

## 6. Troubleshooting Unsaved Changes

### Symptom: Changes don't appear after saving

**Possible causes and checks:**

1. **Transaction not committed** — Check the server logs for errors. Admin mutations use database transactions; if the transaction fails, changes are rolled back.
   ```sql
   -- Check if the row exists at all
   SELECT * FROM categories WHERE id = <id>;
   ```

2. **Wrong database** — Verify you are connected to `lonex_dev`, not a different database:
   ```sql
   SELECT DATABASE();
   ```

3. **Caching** — The admin pages use `no-store` Cache-Control. Hard-refresh the page (Ctrl+F5) after saving.

4. **Validation error** — The server may have rejected the input. Check for error messages in the UI.

### Symptom: Connected to wrong database

**Check:**
```sql
SELECT DATABASE(), CURRENT_USER(), VERSION();
```

**Fix:** Disconnect and reconnect with the correct parameters from `.env.local`:
- Host: 127.0.0.1
- Port: 3306
- User: lonex_dev_user
- Database: lonex_dev

## 7. Troubleshooting Audit Records

**Check if audit logging is working:**
```sql
SELECT COUNT(*) AS total_audit_rows FROM audit_log;
-- Should be > 0 if any admin actions have been performed
```

**View recent audit entries:**
```sql
SELECT id, actor_user_id, action, target_type, target_id, created_at
FROM audit_log
ORDER BY created_at DESC
LIMIT 10;
```

**Verify no raw verification codes in audit:**
```sql
SELECT id, action, metadata
FROM audit_log
WHERE action LIKE 'model_code%';
-- metadata should only contain { "active": true } or similar, never the raw code
```

## 8. Safety Rules

- **Read-only inspection only** — Do not run INSERT, UPDATE, DELETE, or DROP statements
- **Do not expose passwords** — Never include `.env.local` values in reports or logs
- **Do not modify data** — All verification is via SELECT statements
- **Synthetic accounts only** — Only test with `@example.invalid` email addresses
- **Never delete real records** — Do not delete categories, products, users or media that may contain client data

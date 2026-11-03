-- LONEX core RBAC seed. Idempotent. Contains no credentials.
SET NAMES utf8mb4;

INSERT INTO admin_roles (name, slug, description) VALUES
  ('Administrator', 'administrator', 'Full access to all admin features'),
  ('Editor', 'editor', 'Edits content, pages and media; publishing only if granted')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

INSERT INTO admin_permissions (code, description) VALUES
  ('content.edit',       'Edit products, categories and blog posts'),
  ('content.publish',    'Publish and unpublish content'),
  ('pages.edit',         'Edit page sections'),
  ('media.manage',       'Manage the media library'),
  ('navigation.manage',  'Change navigation and critical settings'),
  ('settings.manage',    'Manage site settings'),
  ('model_codes.manage', 'Register and rotate model verification codes'),
  ('users.manage',       'Manage admin users'),
  ('roles.manage',       'Manage roles and permissions'),
  ('audit.view',         'View the audit log')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Administrator receives every permission.
INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p
WHERE r.slug = 'administrator';

-- Editor receives only the baseline editing permissions.
INSERT IGNORE INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN admin_permissions p ON p.code IN ('content.edit', 'pages.edit', 'media.manage')
WHERE r.slug = 'editor';
-- Seed roles
INSERT INTO roles (id, name, description) VALUES (1, 'SUPER_ADMIN', 'Full access to all system features');
INSERT INTO roles (id, name, description) VALUES (2, 'BRANCH_MANAGER', 'Access to branch-specific data and approvals');
INSERT INTO roles (id, name, description) VALUES (3, 'SUPPORT_AGENT', 'Can view user data and perform basic support actions');
INSERT INTO roles (id, name, description) VALUES (4, 'AUDITOR', 'Read-only access to all logs and reports');
INSERT INTO roles (id, name, description) VALUES (5, 'FRAUD_ANALYST', 'Access to fraud alerts, risk scores, and account freezing');

-- Seed permissions
INSERT INTO permissions (id, name, description) VALUES (1, 'USER_READ', 'Can view user details');
INSERT INTO permissions (id, name, description) VALUES (2, 'USER_WRITE', 'Can modify user details');
INSERT INTO permissions (id, name, description) VALUES (3, 'USER_SUSPEND', 'Can suspend or block users');
INSERT INTO permissions (id, name, description) VALUES (4, 'TRANSACTION_READ', 'Can view transactions');
INSERT INTO permissions (id, name, description) VALUES (5, 'TRANSACTION_BLOCK', 'Can block transactions');
INSERT INTO permissions (id, name, description) VALUES (6, 'FRAUD_ALERT_MANAGE', 'Can manage and resolve fraud alerts');
INSERT INTO permissions (id, name, description) VALUES (7, 'KYC_APPROVE', 'Can approve or reject KYC applications');
INSERT INTO permissions (id, name, description) VALUES (8, 'REPORT_GENERATE', 'Can generate and schedule reports');
INSERT INTO permissions (id, name, description) VALUES (9, 'SETTINGS_MANAGE', 'Can manage system settings');

-- SUPER_ADMIN gets all permissions
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 1);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 2);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 3);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 4);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 5);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 6);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 7);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 8);
INSERT INTO role_permissions (role_id, permission_id) VALUES (1, 9);

-- Seed default admin user (password: Admin@123 -> bcrypt)
-- Using BCrypt hash generated for 'Admin@123'
INSERT INTO admin_users (id, username, email, password, first_name, last_name, is_active, totp_enabled)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin', 'admin@finedge.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjqQBzNRN.KFt/6ygYGvFtA5myxO3u',
        'Super', 'Admin', TRUE, FALSE);

-- Assign SUPER_ADMIN role to admin user
INSERT INTO admin_user_roles (admin_user_id, role_id) VALUES ('00000000-0000-0000-0000-000000000001', 1);

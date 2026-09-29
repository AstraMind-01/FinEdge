-- V1: Core Security and Audit Log schema

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    totp_secret VARCHAR(100),
    totp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE admin_user_roles (
    admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (admin_user_id, role_id)
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed basic roles
INSERT INTO roles (name, description) VALUES 
('SUPER_ADMIN', 'Full access to all system features'),
('BRANCH_MANAGER', 'Access to branch-specific data and approvals'),
('SUPPORT_AGENT', 'Can view user data and perform basic support actions'),
('AUDITOR', 'Read-only access to all logs and reports'),
('FRAUD_ANALYST', 'Access to fraud alerts, risk scores, and account freezing');

-- Seed basic permissions
INSERT INTO permissions (name, description) VALUES 
('USER_READ', 'Can view user details'),
('USER_WRITE', 'Can modify user details'),
('USER_SUSPEND', 'Can suspend or block users'),
('TRANSACTION_READ', 'Can view transactions'),
('TRANSACTION_BLOCK', 'Can block transactions'),
('FRAUD_ALERT_MANAGE', 'Can manage and resolve fraud alerts'),
('KYC_APPROVE', 'Can approve or reject KYC applications'),
('REPORT_GENERATE', 'Can generate and schedule reports'),
('SETTINGS_MANAGE', 'Can manage system settings');

-- Associate permissions to roles (Simplified example for SUPER_ADMIN)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'SUPER_ADMIN';

-- Seed default admin user (password: Admin@123)
-- bcrypt hash of 'Admin@123' is '$2a$10$wzQvBqQ5C8Gj8b1N9O/T6ebn3z4U5j1W/WvK8O4H3p4a5y6b7c8d9' (using a mock hash here for setup, will need real generation in app)
INSERT INTO admin_users (id, username, email, password, first_name, last_name, is_active)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@finedge.com',
    '$2a$10$XQYxOa/9Y.j6YJ/yX0Kj2e/Z7h9E8B4X4A/7D5b6c7d8e9f0a1b2c',
    'Super',
    'Admin',
    TRUE
);

INSERT INTO admin_user_roles (admin_user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM roles WHERE name = 'SUPER_ADMIN';

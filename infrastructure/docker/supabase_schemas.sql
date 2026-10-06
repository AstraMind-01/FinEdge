-- ============================================================================
-- FinEdge Platform — Step 22: Supabase Per-Service Schemas Setup
-- ============================================================================
-- Single Supabase PostgreSQL project with logical database-per-service isolation.
-- Executed in Supabase SQL Editor to initialize dedicated per-service schemas.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS auth_service;
CREATE SCHEMA IF NOT EXISTS account_service;
CREATE SCHEMA IF NOT EXISTS transaction_service;
CREATE SCHEMA IF NOT EXISTS notification_service;
CREATE SCHEMA IF NOT EXISTS audit_service;
CREATE SCHEMA IF NOT EXISTS fraud_service;

-- Grant permissions (if running with non-superuser roles)
GRANT ALL ON SCHEMA auth_service TO postgres, service_role;
GRANT ALL ON SCHEMA account_service TO postgres, service_role;
GRANT ALL ON SCHEMA transaction_service TO postgres, service_role;
GRANT ALL ON SCHEMA notification_service TO postgres, service_role;
GRANT ALL ON SCHEMA audit_service TO postgres, service_role;
GRANT ALL ON SCHEMA fraud_service TO postgres, service_role;

-- Grant permissions on accessibility schema to service role

-- 1. Grant USAGE on the schema
GRANT USAGE ON SCHEMA accessibility TO postgres, anon, authenticated, service_role;

-- 2. Grant ALL privileges on all tables in the schema
GRANT ALL ON ALL TABLES IN SCHEMA accessibility TO postgres, anon, authenticated, service_role;

-- 3. Grant ALL privileges on all sequences (for auto-increment)
GRANT ALL ON ALL SEQUENCES IN SCHEMA accessibility TO postgres, anon, authenticated, service_role;

-- 4. Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA accessibility 
GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA accessibility 
GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- 5. Grant SELECT, INSERT, UPDATE on specific tables
GRANT SELECT, INSERT, UPDATE, DELETE ON accessibility.sites TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON accessibility.site_configs TO service_role;

-- Verify permissions
SELECT 
    schemaname,
    tablename,
    tableowner,
    has_table_privilege('service_role', schemaname || '.' || tablename, 'SELECT') as can_select,
    has_table_privilege('service_role', schemaname || '.' || tablename, 'INSERT') as can_insert
FROM pg_tables 
WHERE schemaname = 'accessibility';

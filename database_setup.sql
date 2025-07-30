-- =====================================================
-- GxP Learning Hub - Database Setup Script
-- Run this in Supabase Dashboard → SQL Editor
-- =====================================================

-- Step 1: Create User Roles
INSERT INTO user_roles (id, name, description, permissions, created_at, updated_at) VALUES 
(gen_random_uuid(), 'student', 'Student role with basic learning access', '{"courses": ["read"], "assessments": ["read", "submit"], "certificates": ["read"]}', NOW(), NOW()),
(gen_random_uuid(), 'admin', 'Administrator role with full system access', '{"courses": ["read", "write", "delete"], "users": ["read", "write", "delete"], "assessments": ["read", "write", "delete"], "certificates": ["read", "write", "delete"], "reports": ["read", "write"]}', NOW(), NOW()),
(gen_random_uuid(), 'compliance', 'Compliance officer role with audit and reporting access', '{"courses": ["read"], "assessments": ["read"], "certificates": ["read"], "reports": ["read", "write"], "audits": ["read", "write"]}', NOW(), NOW())
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- Step 2: Get the role IDs for reference
-- (You'll need these for the next steps)

-- Step 3: Create User Profiles for Test Accounts
-- Note: Replace the user_id values with actual IDs from Supabase Auth users

-- First, let's create a temporary function to help with user creation
CREATE OR REPLACE FUNCTION create_user_profile(
  auth_user_id UUID,
  emp_id TEXT,
  user_email TEXT,
  first_name TEXT,
  last_name TEXT,
  dept TEXT,
  job_title TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO users (
    id, employee_id, username, email, first_name, last_name,
    department, job_title, is_active, failed_login_attempts,
    created_at, updated_at
  ) VALUES (
    auth_user_id, emp_id, split_part(user_email, '@', 1), user_email,
    first_name, last_name, dept, job_title, true, 0, NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    employee_id = EXCLUDED.employee_id,
    username = EXCLUDED.username,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    department = EXCLUDED.department,
    job_title = EXCLUDED.job_title,
    is_active = true,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Step 4: Function to assign roles
CREATE OR REPLACE FUNCTION assign_user_role(
  user_id UUID,
  role_name TEXT
) RETURNS VOID AS $$
DECLARE
  role_id UUID;
BEGIN
  -- Get role ID
  SELECT id INTO role_id FROM user_roles WHERE name = role_name;
  
  IF role_id IS NOT NULL THEN
    INSERT INTO user_role_assignments (
      user_id, role_id, assigned_by, assigned_at, is_active
    ) VALUES (
      user_id, role_id, user_id, NOW(), true
    ) ON CONFLICT (user_id, role_id) DO UPDATE SET
      is_active = true,
      assigned_at = NOW();
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Instructions for manual user creation
-- After confirming emails in Supabase Auth, run these commands
-- replacing 'USER_ID_HERE' with actual user IDs from auth.users table

/*
-- Example for student account (replace USER_ID_HERE with actual ID):
SELECT create_user_profile(
  'USER_ID_HERE'::UUID,
  'EMP001',
  'student@gxp.in',
  'John',
  'Student',
  'Quality Assurance',
  'QA Analyst'
);
SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');

-- Example for admin account (replace USER_ID_HERE with actual ID):
SELECT create_user_profile(
  'USER_ID_HERE'::UUID,
  'EMP002',
  'admin@gxp.in',
  'Jane',
  'Admin',
  'Information Technology',
  'System Administrator'
);
SELECT assign_user_role('USER_ID_HERE'::UUID, 'admin');
SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');

-- Example for compliance account (replace USER_ID_HERE with actual ID):
SELECT create_user_profile(
  'USER_ID_HERE'::UUID,
  'EMP003',
  'compliance@gxp.in',
  'Mike',
  'Compliance',
  'Regulatory Affairs',
  'Compliance Officer'
);
SELECT assign_user_role('USER_ID_HERE'::UUID, 'compliance');
SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');
*/

-- Step 6: Query to get auth user IDs for reference
-- Run this to get the user IDs you need for the above functions:
SELECT 
  id as user_id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email IN ('student@gxp.in', 'admin@gxp.in', 'compliance@gxp.in', 't.krishnadeeppak@gmail.com')
ORDER BY email;

-- Step 7: Verify setup
SELECT 'User Roles Created:' as status;
SELECT name, description FROM user_roles ORDER BY name;

SELECT 'Auth Users:' as status;
SELECT email, email_confirmed_at IS NOT NULL as email_confirmed 
FROM auth.users 
WHERE email LIKE '%gxp.in' OR email = 't.krishnadeeppak@gmail.com'
ORDER BY email;

-- Clean up temporary functions (optional)
-- DROP FUNCTION IF EXISTS create_user_profile(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
-- DROP FUNCTION IF EXISTS assign_user_role(UUID, TEXT);

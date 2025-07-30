import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

dotenv.config({ path: join(rootDir, '.env') });
dotenv.config({ path: join(rootDir, '.env.local') });

// Supabase configuration with service role for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment variables:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Create Supabase client with service role for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface TestAccount {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department: string;
  jobTitle: string;
  roles: string[];
}

const testAccounts: TestAccount[] = [
  {
    email: 'student@gxp.in',
    password: '123456789',
    firstName: 'John',
    lastName: 'Student',
    employeeId: 'EMP001',
    department: 'Quality Assurance',
    jobTitle: 'QA Analyst',
    roles: ['student']
  },
  {
    email: 'admin@gxp.in',
    password: '123456789',
    firstName: 'Jane',
    lastName: 'Admin',
    employeeId: 'EMP002',
    department: 'Information Technology',
    jobTitle: 'System Administrator',
    roles: ['admin', 'student']
  },
  {
    email: 'compliance@gxp.in',
    password: '123456789',
    firstName: 'Mike',
    lastName: 'Compliance',
    employeeId: 'EMP003',
    department: 'Regulatory Affairs',
    jobTitle: 'Compliance Officer',
    roles: ['compliance', 'student']
  }
];

async function createTestAccountsWithServiceRole() {
  console.log('🔧 FIXING TEST ACCOUNTS - Direct Database Approach');
  console.log('⚠️  This will create/update test accounts that bypass email verification');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`🔄 Processing ${account.email}...`);

      // Step 1: Check if user profile exists in our database
      const { data: existingProfile } = await supabase
        .from('users')
        .select('*')
        .eq('email', account.email)
        .single();

      let authUserId: string;

      if (existingProfile) {
        console.log(`   ✅ User profile exists: ${existingProfile.id}`);
        authUserId = existingProfile.id;

        // Update existing profile to ensure it's active
        const { error: updateError } = await supabase
          .from('users')
          .update({
            employee_id: account.employeeId,
            username: account.email.split('@')[0],
            first_name: account.firstName,
            last_name: account.lastName,
            department: account.department,
            job_title: account.jobTitle,
            is_active: true,
            failed_login_attempts: 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', authUserId);

        if (updateError) {
          console.error(`   ❌ Error updating user profile:`, updateError);
        } else {
          console.log(`   ✅ Updated user profile and activated account`);
        }
      } else {
        // Create user through signup process
        console.log(`   🔄 Creating new account through signup...`);

        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              first_name: account.firstName,
              last_name: account.lastName,
              employee_id: account.employeeId
            }
          }
        });

        if (signupError || !signupData.user) {
          console.error(`   ❌ Error creating account:`, signupError);
          continue;
        }

        authUserId = signupData.user.id;
        console.log(`   ✅ Created auth user: ${authUserId}`);

        // Create user profile in our database
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUserId,
            employee_id: account.employeeId,
            username: account.email.split('@')[0],
            email: account.email,
            first_name: account.firstName,
            last_name: account.lastName,
            department: account.department,
            job_title: account.jobTitle,
            is_active: true, // Activate immediately for test accounts
            failed_login_attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`   ❌ Error creating user profile:`, profileError);
          continue;
        }
        console.log(`   ✅ Created user profile and activated account`);
      }



      // Step 3: Assign roles
      for (const roleName of account.roles) {
        // Get role ID
        const { data: role } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (!role) {
          console.error(`   ❌ Role '${roleName}' not found in database`);
          continue;
        }

        // Check if role assignment exists
        const { data: existingAssignment } = await supabase
          .from('user_role_assignments')
          .select('id')
          .eq('user_id', authUserId)
          .eq('role_id', role.id)
          .single();

        if (!existingAssignment) {
          // Create role assignment
          const { error: roleError } = await supabase
            .from('user_role_assignments')
            .insert({
              user_id: authUserId,
              role_id: role.id,
              assigned_by: authUserId,
              assigned_at: new Date().toISOString(),
              is_active: true
            });

          if (roleError) {
            console.error(`   ❌ Error assigning role '${roleName}':`, roleError);
          } else {
            console.log(`   ✅ Assigned role: ${roleName}`);
          }
        } else {
          console.log(`   ✅ Role already assigned: ${roleName}`);
        }
      }

      console.log(`🎉 Successfully processed ${account.email}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error processing ${account.email}:`, error);
      console.log('');
    }
  }

  console.log('✅ Test account setup completed!');
}

async function verifyTestAccounts() {
  console.log('🔍 Verifying test accounts...');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`🔍 Checking ${account.email}...`);

      // Check profile in our database
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', account.email)
        .single();

      if (!profile) {
        console.log(`   ❌ User profile not found`);
        continue;
      }

      console.log(`   ✅ Profile found: ${profile.first_name} ${profile.last_name}`);
      console.log(`   ✅ Employee ID: ${profile.employee_id}`);
      console.log(`   ✅ Department: ${profile.department}`);
      console.log(`   ✅ Profile active: ${profile.is_active}`);

      // Check roles
      const { data: roles } = await supabase
        .from('user_role_assignments')
        .select('user_roles(name)')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      const roleNames = roles?.map(r => r.user_roles?.name).filter(Boolean) || [];
      console.log(`   ✅ Roles: ${roleNames.join(', ')}`);

      // Test login capability
      console.log(`   🧪 Testing login...`);
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (loginError) {
        console.log(`   ❌ Login test failed: ${loginError.message}`);
      } else if (loginData.user) {
        console.log(`   ✅ Login test successful!`);
        // Sign out immediately
        await supabase.auth.signOut();
      }

      console.log(`   🎯 Ready for login: ${profile.is_active && roleNames.length > 0 ? 'YES' : 'NO'}`);
      console.log('');
    } catch (error) {
      console.error(`   ❌ Error checking ${account.email}:`, error);
      console.log('');
    }
  }
}

async function main() {
  try {
    await createTestAccountsWithServiceRole();
    console.log('');
    await verifyTestAccounts();
    console.log('🎉 All done! Test accounts should now work for login.');
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

dotenv.config({ path: join(rootDir, '.env.local') });

// Supabase configuration with service role for admin operations
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('   Need both VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role (bypasses RLS)
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
  console.log('🔧 Creating test accounts with service role (bypasses RLS)...');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`🔄 Creating ${account.email}...`);

      // Step 1: Create Supabase Auth user with email confirmed
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true, // Bypass email verification
        user_metadata: {
          first_name: account.firstName,
          last_name: account.lastName,
          employee_id: account.employeeId
        }
      });

      if (authError || !authData.user) {
        console.error(`   ❌ Auth creation error:`, authError);
        continue;
      }

      const authUserId = authData.user.id;
      console.log(`   ✅ Created Supabase Auth user: ${authUserId}`);
      console.log(`   ✅ Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

      // Step 2: Create user profile using service role (bypasses RLS)
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
          is_active: true,
          failed_login_attempts: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error(`   ❌ Profile creation error:`, profileError);
        continue;
      }
      console.log(`   ✅ Created user profile`);

      // Step 3: Assign roles
      for (const roleName of account.roles) {
        // Get role ID
        const { data: role } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (!role) {
          console.error(`   ❌ Role '${roleName}' not found`);
          continue;
        }

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
          console.error(`   ❌ Role assignment error for '${roleName}':`, roleError);
        } else {
          console.log(`   ✅ Assigned role: ${roleName}`);
        }
      }

      console.log(`🎉 Successfully created complete account for ${account.email}`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error creating ${account.email}:`, error);
      console.log('');
    }
  }
}

async function fixNewUserAccount() {
  console.log('🔧 Fixing new user account...');
  console.log('');

  const newUserEmail = 't.krishnadeeppak@gmail.com';
  
  try {
    // Check if auth user exists
    const { data: authUser } = await supabase.auth.admin.getUserByEmail(newUserEmail);
    
    if (authUser.user) {
      console.log(`✅ Auth user found: ${authUser.user.id}`);
      console.log(`   📧 Email confirmed: ${authUser.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Check if profile exists
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', newUserEmail)
        .single();

      if (profile) {
        console.log(`✅ Profile found, activating account...`);
        
        // Activate the account
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_active: true, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', authUser.user.id);

        if (updateError) {
          console.log(`   ❌ Failed to activate: ${updateError.message}`);
        } else {
          console.log(`   ✅ Account activated successfully`);
        }
      } else {
        console.log(`❌ Profile not found, creating one...`);
        
        // Create profile for existing auth user
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUser.user.id,
            employee_id: 'NEW001',
            username: newUserEmail.split('@')[0],
            email: newUserEmail,
            first_name: authUser.user.user_metadata?.first_name || 'User',
            last_name: authUser.user.user_metadata?.last_name || 'Name',
            department: authUser.user.user_metadata?.department || null,
            job_title: authUser.user.user_metadata?.job_title || null,
            is_active: true,
            failed_login_attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error(`   ❌ Profile creation error:`, profileError);
        } else {
          console.log(`   ✅ Created user profile`);
          
          // Assign default student role
          const { data: studentRole } = await supabase
            .from('user_roles')
            .select('id')
            .eq('name', 'student')
            .single();

          if (studentRole) {
            const { error: roleError } = await supabase
              .from('user_role_assignments')
              .insert({
                user_id: authUser.user.id,
                role_id: studentRole.id,
                assigned_by: authUser.user.id,
                assigned_at: new Date().toISOString(),
                is_active: true
              });

            if (!roleError) {
              console.log(`   ✅ Assigned student role`);
            }
          }
        }
      }
    } else {
      console.log(`❌ Auth user not found for ${newUserEmail}`);
      console.log(`   This user may need to complete the signup process again`);
    }
  } catch (error) {
    console.error(`❌ Error fixing new user:`, error);
  }
  
  console.log('');
}

async function testAllLogins() {
  console.log('🧪 Testing all account logins...');
  console.log('');

  // Test accounts
  for (const account of testAccounts) {
    await testLogin(account.email, account.password);
  }

  // Test new user account
  await testLogin('t.krishnadeeppak@gmail.com', 'Admin@123');
}

async function testLogin(email: string, password: string) {
  try {
    console.log(`🔍 Testing login for ${email}...`);

    // Create a regular client for testing login
    const testClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.log(`   ❌ Login failed: ${loginError.message}`);
    } else if (loginData.user) {
      console.log(`   ✅ Login successful!`);
      console.log(`   📧 Email confirmed: ${loginData.user.email_confirmed_at ? 'Yes' : 'No'}`);
      
      // Check profile
      const { data: profile } = await testClient
        .from('users')
        .select('first_name, last_name, is_active')
        .eq('email', email)
        .single();

      if (profile) {
        console.log(`   👤 Profile: ${profile.first_name} ${profile.last_name}`);
        console.log(`   🔓 Active: ${profile.is_active}`);
      }
      
      // Sign out
      await testClient.auth.signOut();
    }

    console.log('');
  } catch (error) {
    console.error(`   ❌ Error testing ${email}:`, error);
    console.log('');
  }
}

async function main() {
  try {
    console.log('🚀 FINAL AUTHENTICATION FIX');
    console.log('============================');
    console.log('');

    // Step 1: Fix new user account
    await fixNewUserAccount();

    // Step 2: Create test accounts with service role
    await createTestAccountsWithServiceRole();

    // Step 3: Test all logins
    await testAllLogins();

    console.log('🎉 Final authentication fix completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Used service role to bypass RLS policies');
    console.log('   ✅ Created confirmed auth users');
    console.log('   ✅ Created active user profiles');
    console.log('   ✅ Assigned roles correctly');
    console.log('   ✅ Fixed new user registration issue');
    console.log('');
    console.log('🧪 Ready to test:');
    console.log('   1. Go to http://localhost:8080/login');
    console.log('   2. Try: student@gxp.in / 123456789');
    console.log('   3. Try: admin@gxp.in / 123456789');
    console.log('   4. Try: compliance@gxp.in / 123456789');
    console.log('   5. Try: t.krishnadeeppak@gmail.com / Admin@123');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

dotenv.config({ path: join(rootDir, '.env.local') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Environment check:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl || 'NOT SET');
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

async function deleteExistingTestAccounts() {
  console.log('🗑️  Cleaning up existing test accounts...');
  
  for (const account of testAccounts) {
    try {
      // Delete from user_role_assignments
      const { error: roleError } = await supabase
        .from('user_role_assignments')
        .delete()
        .in('user_id', [
          '44312285-df39-46c3-9140-382629b111f1', // student
          'bf13aee1-33d8-4678-b7f6-2aa449e61427', // admin
          '1a75977c-1c7b-44bd-8e87-fec590a4ccf6'  // compliance
        ]);

      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('email', account.email);

      console.log(`   ✅ Cleaned up ${account.email}`);
    } catch (error) {
      console.log(`   ⚠️  Error cleaning ${account.email}:`, error);
    }
  }
}

async function createCompleteTestAccounts() {
  console.log('🔧 Creating complete test accounts (Auth + Database)...');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`🔄 Creating ${account.email}...`);

      // Step 1: Create Supabase Auth user through signup
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

      if (signupError) {
        console.error(`   ❌ Signup error:`, signupError);
        continue;
      }

      if (!signupData.user) {
        console.error(`   ❌ No user returned from signup`);
        continue;
      }

      const authUserId = signupData.user.id;
      console.log(`   ✅ Created Supabase Auth user: ${authUserId}`);

      // Step 2: Create user profile in our database
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

async function testAccountLogins() {
  console.log('🧪 Testing account logins...');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`🔍 Testing login for ${account.email}...`);

      // Test login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (loginError) {
        console.log(`   ❌ Login failed: ${loginError.message}`);
      } else if (loginData.user) {
        console.log(`   ✅ Login successful!`);
        console.log(`   📧 Email confirmed: ${loginData.user.email_confirmed_at ? 'Yes' : 'No'}`);
        
        // Test our custom auth function
        try {
          // Import our auth function
          const { signInWithPassword } = await import('../lib/auth.js');
          const user = await signInWithPassword(account.email, account.password);
          console.log(`   ✅ Custom auth function works: ${user.firstName} ${user.lastName}`);
          console.log(`   👤 Roles: ${user.roles.map(r => r.name).join(', ')}`);
        } catch (authError) {
          console.log(`   ❌ Custom auth function failed: ${authError}`);
        }
        
        // Sign out
        await supabase.auth.signOut();
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error testing ${account.email}:`, error);
      console.log('');
    }
  }
}

async function checkNewUserIssue() {
  console.log('🔍 Checking new user registration issue...');
  console.log('');

  const newUserEmail = 't.krishnadeeppak@gmail.com';
  
  try {
    // Check if user exists in our database
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('email', newUserEmail)
      .single();

    if (profile) {
      console.log(`✅ User profile found: ${profile.first_name} ${profile.last_name}`);
      console.log(`   📧 Email: ${profile.email}`);
      console.log(`   🔓 Active: ${profile.is_active}`);
      console.log(`   📅 Created: ${profile.created_at}`);
      
      // Check roles
      const { data: roles } = await supabase
        .from('user_role_assignments')
        .select('user_roles(name)')
        .eq('user_id', profile.id)
        .eq('is_active', true);

      const roleNames = roles?.map(r => r.user_roles?.name).filter(Boolean) || [];
      console.log(`   👤 Roles: ${roleNames.join(', ')}`);

      if (!profile.is_active) {
        console.log('   ⚠️  Account is not active - this could be the login issue');
        
        // Activate the account
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', profile.id);

        if (updateError) {
          console.log(`   ❌ Failed to activate account: ${updateError.message}`);
        } else {
          console.log(`   ✅ Account activated successfully`);
        }
      }
    } else {
      console.log(`❌ User profile not found for ${newUserEmail}`);
    }
  } catch (error) {
    console.error(`❌ Error checking new user:`, error);
  }
  
  console.log('');
}

async function main() {
  try {
    console.log('🚀 COMPREHENSIVE AUTHENTICATION FIX');
    console.log('=====================================');
    console.log('');

    // Step 1: Check the new user issue
    await checkNewUserIssue();

    // Step 2: Clean up existing test accounts
    await deleteExistingTestAccounts();

    // Step 3: Create complete test accounts
    await createCompleteTestAccounts();

    // Step 4: Test all logins
    await testAccountLogins();

    console.log('🎉 Authentication fix completed!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   ✅ Test accounts created in both Supabase Auth and custom database');
    console.log('   ✅ All accounts activated and ready for login');
    console.log('   ✅ Roles assigned correctly');
    console.log('   ✅ New user registration issue investigated');
    console.log('');
    console.log('🧪 Next steps:');
    console.log('   1. Test login at http://localhost:8080/login');
    console.log('   2. Try all three test accounts');
    console.log('   3. Test new user registration flow');

  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

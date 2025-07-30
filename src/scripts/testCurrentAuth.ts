import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..');

dotenv.config({ path: join(rootDir, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const testAccounts = [
  { email: 'student@gxp.in', password: '123456789', name: 'Student Account' },
  { email: 'admin@gxp.in', password: '123456789', name: 'Admin Account' },
  { email: 'compliance@gxp.in', password: '123456789', name: 'Compliance Account' },
  { email: 't.krishnadeeppak@gmail.com', password: 'Admin@123', name: 'New User Account' }
];

async function testAuthentication() {
  console.log('🧪 TESTING CURRENT AUTHENTICATION STATE');
  console.log('=======================================');
  console.log('');

  for (const account of testAccounts) {
    console.log(`🔍 Testing ${account.name} (${account.email})...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        console.log(`   ❌ Login failed: ${error.message}`);
        
        if (error.message === 'Email not confirmed') {
          console.log('   💡 Solution: Confirm email in Supabase Dashboard');
          console.log('      → Go to Authentication → Users → Find user → Confirm Email');
        } else if (error.message === 'Invalid login credentials') {
          console.log('   💡 Solution: User may not exist or need profile creation');
          console.log('      → Check if user exists in Supabase Auth');
          console.log('      → Create user profile in users table if missing');
        }
      } else if (data.user) {
        console.log(`   ✅ Login successful!`);
        console.log(`   📧 Email confirmed: ${data.user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`   🆔 User ID: ${data.user.id}`);
        
        // Check if user profile exists
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('first_name, last_name, is_active, department')
          .eq('email', account.email)
          .single();

        if (profileError) {
          console.log(`   ❌ Profile not found: ${profileError.message}`);
          console.log('   💡 Solution: Create user profile in users table');
        } else if (profile) {
          console.log(`   👤 Profile: ${profile.first_name} ${profile.last_name}`);
          console.log(`   🏢 Department: ${profile.department || 'Not set'}`);
          console.log(`   🔓 Active: ${profile.is_active}`);
          
          // Check roles
          const { data: roles } = await supabase
            .from('user_role_assignments')
            .select('user_roles(name)')
            .eq('user_id', data.user.id)
            .eq('is_active', true);

          const roleNames = roles?.map(r => r.user_roles?.name).filter(Boolean) || [];
          console.log(`   👥 Roles: ${roleNames.join(', ') || 'None assigned'}`);
        }
        
        // Sign out
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error}`);
    }
    
    console.log('');
  }
}

async function checkDatabaseTables() {
  console.log('🗄️  CHECKING DATABASE TABLES');
  console.log('============================');
  console.log('');

  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, first_name, last_name, is_active')
      .limit(10);

    if (usersError) {
      console.log(`❌ Users table error: ${usersError.message}`);
    } else {
      console.log(`✅ Users table accessible, ${users?.length || 0} users found`);
      users?.forEach(user => {
        console.log(`   - ${user.email}: ${user.first_name} ${user.last_name} (Active: ${user.is_active})`);
      });
    }
    console.log('');

    // Check user_roles table
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('name, description');

    if (rolesError) {
      console.log(`❌ User roles table error: ${rolesError.message}`);
    } else {
      console.log(`✅ User roles table accessible, ${roles?.length || 0} roles found`);
      roles?.forEach(role => {
        console.log(`   - ${role.name}: ${role.description || 'No description'}`);
      });
    }
    console.log('');

    // Check user_role_assignments table
    const { data: assignments, error: assignmentsError } = await supabase
      .from('user_role_assignments')
      .select('user_id, user_roles(name)')
      .eq('is_active', true)
      .limit(10);

    if (assignmentsError) {
      console.log(`❌ Role assignments table error: ${assignmentsError.message}`);
    } else {
      console.log(`✅ Role assignments table accessible, ${assignments?.length || 0} assignments found`);
    }

  } catch (error) {
    console.log(`❌ Database check error: ${error}`);
  }
}

async function provideSolutions() {
  console.log('💡 SOLUTIONS SUMMARY');
  console.log('===================');
  console.log('');
  console.log('Based on the test results above, here are the required actions:');
  console.log('');
  console.log('🔧 FOR "EMAIL NOT CONFIRMED" ERRORS:');
  console.log('   1. Go to Supabase Dashboard → Authentication → Users');
  console.log('   2. Find the user with the failing email');
  console.log('   3. Click on the user');
  console.log('   4. Click "Confirm Email" button');
  console.log('   5. Verify "Email Confirmed At" shows a timestamp');
  console.log('');
  console.log('🔧 FOR "INVALID LOGIN CREDENTIALS" ERRORS:');
  console.log('   1. Check if user exists in Supabase Auth (Dashboard → Authentication → Users)');
  console.log('   2. If user exists but login fails, they may need a profile in users table');
  console.log('   3. If user doesn\'t exist, they need to complete signup process');
  console.log('');
  console.log('🔧 FOR MISSING USER PROFILES:');
  console.log('   1. Go to Supabase Dashboard → Table Editor → users');
  console.log('   2. Insert new row with user data');
  console.log('   3. Ensure is_active = true');
  console.log('   4. Assign appropriate roles in user_role_assignments table');
  console.log('');
  console.log('📞 NEED HELP?');
  console.log('   - Check AUTHENTICATION_RESOLUTION.md for detailed steps');
  console.log('   - Verify environment variables are correct');
  console.log('   - Ensure Supabase project is active and accessible');
}

async function main() {
  try {
    await testAuthentication();
    await checkDatabaseTables();
    await provideSolutions();
  } catch (error) {
    console.error('❌ Script failed:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

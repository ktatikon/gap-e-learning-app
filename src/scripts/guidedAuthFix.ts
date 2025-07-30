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

async function checkAuthUsers() {
  console.log('🔍 STEP 1: CHECKING SUPABASE AUTH USERS');
  console.log('=====================================');
  console.log('');
  console.log('⚠️  MANUAL ACTION REQUIRED:');
  console.log('   Go to https://app.supabase.com/ → Your Project → Authentication → Users');
  console.log('');
  
  const testEmails = ['student@gxp.in', 'admin@gxp.in', 'compliance@gxp.in', 't.krishnadeeppak@gmail.com'];
  
  console.log('📋 For each of these accounts, check if they exist and confirm their emails:');
  testEmails.forEach(email => {
    console.log(`   □ ${email}`);
    console.log(`     - Find user in dashboard`);
    console.log(`     - Click on user`);
    console.log(`     - Click "Confirm Email" button`);
    console.log(`     - Verify "Email Confirmed At" has timestamp`);
    console.log('');
  });
  
  console.log('✅ After confirming emails, press Enter to continue...');
  // In a real interactive script, you'd wait for user input here
  console.log('');
}

async function checkDatabaseSetup() {
  console.log('🗄️  STEP 2: CHECKING DATABASE SETUP');
  console.log('==================================');
  console.log('');
  
  try {
    // Check user_roles
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('name, description');

    if (rolesError || !roles || roles.length === 0) {
      console.log('❌ User roles table is empty or inaccessible');
      console.log('');
      console.log('⚠️  MANUAL ACTION REQUIRED:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy and paste the contents of database_setup.sql');
      console.log('   3. Run the SQL script to create roles and helper functions');
      console.log('');
      return false;
    } else {
      console.log('✅ User roles found:');
      roles.forEach(role => {
        console.log(`   - ${role.name}: ${role.description}`);
      });
      console.log('');
    }

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, first_name, last_name, is_active');

    if (usersError) {
      console.log(`❌ Users table error: ${usersError.message}`);
      return false;
    } else if (!users || users.length === 0) {
      console.log('❌ Users table is empty - need to create user profiles');
      console.log('');
      console.log('⚠️  MANUAL ACTION REQUIRED:');
      console.log('   After running database_setup.sql, you need to:');
      console.log('   1. Get user IDs from auth.users table');
      console.log('   2. Create user profiles using the helper functions');
      console.log('   3. Assign roles to users');
      console.log('');
      return false;
    } else {
      console.log('✅ User profiles found:');
      users.forEach(user => {
        console.log(`   - ${user.email}: ${user.first_name} ${user.last_name} (Active: ${user.is_active})`);
      });
      console.log('');
    }

    return true;
  } catch (error) {
    console.log(`❌ Database check failed: ${error}`);
    return false;
  }
}

async function testAuthentication() {
  console.log('🧪 STEP 3: TESTING AUTHENTICATION');
  console.log('=================================');
  console.log('');

  const testAccounts = [
    { email: 'student@gxp.in', password: '123456789', name: 'Student' },
    { email: 'admin@gxp.in', password: '123456789', name: 'Admin' },
    { email: 'compliance@gxp.in', password: '123456789', name: 'Compliance' },
    { email: 't.krishnadeeppak@gmail.com', password: 'Admin@123', name: 'New User' }
  ];

  let allWorking = true;

  for (const account of testAccounts) {
    console.log(`🔍 Testing ${account.name} (${account.email})...`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password
      });

      if (error) {
        console.log(`   ❌ Login failed: ${error.message}`);
        allWorking = false;
        
        if (error.message === 'Email not confirmed') {
          console.log('   💡 Action: Confirm email in Supabase Dashboard');
        } else if (error.message === 'Invalid login credentials') {
          console.log('   💡 Action: Check if user exists or create user profile');
        }
      } else if (data.user) {
        console.log(`   ✅ Login successful!`);
        
        // Check profile
        const { data: profile } = await supabase
          .from('users')
          .select('first_name, last_name, is_active')
          .eq('email', account.email)
          .single();

        if (profile) {
          console.log(`   👤 Profile: ${profile.first_name} ${profile.last_name}`);
          console.log(`   🔓 Active: ${profile.is_active}`);
        } else {
          console.log(`   ❌ No user profile found`);
          allWorking = false;
        }
        
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
      allWorking = false;
    }
    
    console.log('');
  }

  return allWorking;
}

async function provideSQLCommands() {
  console.log('📝 STEP 4: SQL COMMANDS FOR USER CREATION');
  console.log('=========================================');
  console.log('');
  console.log('After confirming emails, run these commands in Supabase SQL Editor:');
  console.log('');
  console.log('-- First, get the user IDs:');
  console.log(`SELECT id, email FROM auth.users WHERE email IN ('student@gxp.in', 'admin@gxp.in', 'compliance@gxp.in');`);
  console.log('');
  console.log('-- Then create profiles (replace USER_ID_HERE with actual IDs):');
  console.log('');
  console.log('-- Student account:');
  console.log(`SELECT create_user_profile('USER_ID_HERE'::UUID, 'EMP001', 'student@gxp.in', 'John', 'Student', 'Quality Assurance', 'QA Analyst');`);
  console.log(`SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');`);
  console.log('');
  console.log('-- Admin account:');
  console.log(`SELECT create_user_profile('USER_ID_HERE'::UUID, 'EMP002', 'admin@gxp.in', 'Jane', 'Admin', 'Information Technology', 'System Administrator');`);
  console.log(`SELECT assign_user_role('USER_ID_HERE'::UUID, 'admin');`);
  console.log(`SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');`);
  console.log('');
  console.log('-- Compliance account:');
  console.log(`SELECT create_user_profile('USER_ID_HERE'::UUID, 'EMP003', 'compliance@gxp.in', 'Mike', 'Compliance', 'Regulatory Affairs', 'Compliance Officer');`);
  console.log(`SELECT assign_user_role('USER_ID_HERE'::UUID, 'compliance');`);
  console.log(`SELECT assign_user_role('USER_ID_HERE'::UUID, 'student');`);
  console.log('');
}

async function main() {
  console.log('🚀 GxP LEARNING HUB - GUIDED AUTHENTICATION FIX');
  console.log('================================================');
  console.log('');
  console.log('This script will guide you through fixing the authentication issues.');
  console.log('Some steps require manual actions in the Supabase Dashboard.');
  console.log('');

  // Step 1: Check auth users (manual)
  await checkAuthUsers();

  // Step 2: Check database setup
  const dbSetup = await checkDatabaseSetup();
  
  if (!dbSetup) {
    console.log('⚠️  Database setup incomplete. Please:');
    console.log('   1. Run the database_setup.sql script in Supabase SQL Editor');
    console.log('   2. Create user profiles using the helper functions');
    console.log('   3. Run this script again to verify');
    console.log('');
    await provideSQLCommands();
    return;
  }

  // Step 3: Test authentication
  const authWorking = await testAuthentication();

  if (authWorking) {
    console.log('🎉 SUCCESS! All authentication issues have been resolved!');
    console.log('');
    console.log('✅ Next steps:');
    console.log('   1. Test login at http://localhost:8080/login');
    console.log('   2. Try all test accounts');
    console.log('   3. Test new user registration flow');
    console.log('   4. Verify role-based access control');
  } else {
    console.log('❌ Some issues remain. Please:');
    console.log('   1. Complete the manual steps above');
    console.log('   2. Run this script again to verify');
    console.log('');
    await provideSQLCommands();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

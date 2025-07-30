import { supabase } from './supabase-node';

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

// ⚠️ DEVELOPMENT ONLY: These test accounts bypass email verification
// DO NOT USE IN PRODUCTION ENVIRONMENTS

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

export async function setupTestAccounts() {
  console.log('🚨 DEVELOPMENT ONLY: Setting up test accounts...');
  console.log('⚠️  These accounts bypass email verification and should NEVER be used in production!');
  console.log('');

  for (const account of testAccounts) {
    try {
      console.log(`Setting up account for ${account.email}...`);

      // First, check if user already exists in our database
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', account.email)
        .single();

      let authUserId: string;

      if (existingProfile) {
        console.log(`User profile already exists for ${account.email}`);
        authUserId = existingProfile.id;

        // Update existing profile
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
            updated_at: new Date().toISOString(),
          })
          .eq('id', authUserId);

        if (updateError) {
          console.error(`Error updating profile for ${account.email}:`, updateError);
        } else {
          console.log(`Updated profile for ${account.email}`);
        }
      } else {
        // Create new user using signUp (this will create both auth user and profile)
        console.log(`Creating new account for ${account.email}...`);

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: account.email,
          password: account.password,
          options: {
            data: {
              first_name: account.firstName,
              last_name: account.lastName,
              employee_id: account.employeeId,
            }
          }
        });

        if (signUpError) {
          console.error(`Error creating account for ${account.email}:`, signUpError);
          continue;
        }

        if (!signUpData.user) {
          console.error(`Failed to create account for ${account.email}`);
          continue;
        }

        authUserId = signUpData.user.id;
        console.log(`Created auth user for ${account.email}`);

        // Create user profile in our database
        const username = account.email.split('@')[0];

        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authUserId,
            employee_id: account.employeeId,
            username,
            email: account.email,
            first_name: account.firstName,
            last_name: account.lastName,
            department: account.department,
            job_title: account.jobTitle,
            is_active: true,
            failed_login_attempts: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error(`Error creating profile for ${account.email}:`, profileError);
          continue;
        }

        console.log(`Created profile for ${account.email}`);
      }



      // Set up roles
      for (const roleName of account.roles) {
        // Get role ID
        const { data: role } = await supabase
          .from('user_roles')
          .select('id')
          .eq('name', roleName)
          .single();

        if (!role) {
          console.error(`Role '${roleName}' not found`);
          continue;
        }

        // Check if role assignment already exists
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
              assigned_by: authUserId, // Self-assigned for test accounts
              assigned_at: new Date().toISOString(),
              is_active: true
            });

          if (roleError) {
            console.error(`Error assigning role '${roleName}' to ${account.email}:`, roleError);
          } else {
            console.log(`Assigned role '${roleName}' to ${account.email}`);
          }
        } else {
          console.log(`Role '${roleName}' already assigned to ${account.email}`);
        }
      }

      console.log(`✅ Successfully set up account for ${account.email}`);
    } catch (error) {
      console.error(`❌ Error setting up account for ${account.email}:`, error);
    }
  }

  console.log('Test account setup completed!');
}

// Function to verify test accounts
export async function verifyTestAccounts() {
  console.log('Verifying test accounts...');

  for (const account of testAccounts) {
    try {
      // Check profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('email', account.email)
        .single();

      if (!profile) {
        console.log(`❌ Profile not found for ${account.email}`);
        continue;
      }

      console.log(`✅ Profile found for ${account.email}`);
      console.log(`   - Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   - Employee ID: ${profile.employee_id}`);
      console.log(`   - Department: ${profile.department}`);
      console.log(`   - Active: ${profile.is_active}`);

      // Check roles
      const { data: roles } = await supabase
        .from('user_role_assignments')
        .select(`
          user_roles (name)
        `)
        .eq('user_id', profile.id)
        .eq('is_active', true);

      const assignedRoles = roles?.map(r => r.user_roles?.name) || [];
      console.log(`   - Roles: ${assignedRoles.join(', ') || 'None'}`);

      const missingRoles = account.roles.filter(role => !assignedRoles.includes(role));

      if (missingRoles.length > 0) {
        console.log(`❌ Missing roles for ${account.email}: ${missingRoles.join(', ')}`);
      } else {
        console.log(`✅ ${account.email} - All roles assigned correctly`);
      }

    } catch (error) {
      console.error(`❌ Error verifying ${account.email}:`, error);
    }
  }

  console.log('Test account verification completed!');
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  const isVerifyOnly = args.includes('--verify');

  // Environment safety check
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  if (supabaseUrl && supabaseUrl.includes('production')) {
    console.error('🚨 SECURITY ERROR: Test account setup detected in production environment!');
    console.error('❌ This script should NEVER be run in production.');
    console.error('💡 Use the regular signup flow for production users.');
    process.exit(1);
  }

  console.log('🔒 Environment check passed - proceeding with test account setup');
  console.log('📍 Environment:', process.env.NODE_ENV || 'development');
  console.log('');

  try {
    if (isVerifyOnly) {
      console.log('🔍 Verifying test accounts only...\n');
      await verifyTestAccounts();
    } else {
      console.log('🚀 Setting up test accounts...\n');
      await setupTestAccounts();
      console.log('\n🔍 Verifying setup...\n');
      await verifyTestAccounts();
    }

    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

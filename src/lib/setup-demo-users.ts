import { supabase } from './supabase';

// Demo user credentials
export const DEMO_USERS = [
  {
    email: 'admin@gxp.in',
    password: '123456789',
    employee_id: 'ADMIN001',
    username: 'admin',
    first_name: 'System',
    last_name: 'Administrator',
    department: 'IT',
    job_title: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'student@gxp.in',
    password: '123456789',
    employee_id: 'STU001',
    username: 'student',
    first_name: 'John',
    last_name: 'Student',
    department: 'Quality Assurance',
    job_title: 'QA Analyst',
    role: 'student'
  },
  {
    email: 'compliance@gxp.in',
    password: '123456789',
    employee_id: 'COMP001',
    username: 'compliance',
    first_name: 'Mike',
    last_name: 'Compliance',
    department: 'Compliance',
    job_title: 'Compliance Officer',
    role: 'compliance'
  }
];

// Function to create demo users (for development only)
export const createDemoUsers = async () => {
  console.log('Setting up demo users...');
  
  for (const user of DEMO_USERS) {
    try {
      // Check if user already exists in auth
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(user.email);
      
      if (!existingUser.user) {
        // Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        });

        if (authError) {
          console.error(`Error creating auth user ${user.email}:`, authError);
          continue;
        }

        console.log(`Created auth user: ${user.email}`);
      }

      // Check if user exists in our users table
      const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      if (!dbUser) {
        // Create user in our users table
        const { error: dbError } = await supabase
          .from('users')
          .insert({
            employee_id: user.employee_id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            department: user.department,
            job_title: user.job_title,
            is_active: true
          });

        if (dbError) {
          console.error(`Error creating database user ${user.email}:`, dbError);
          continue;
        }

        console.log(`Created database user: ${user.email}`);
      }

      // Assign role to user
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single();

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('id')
        .eq('name', user.role)
        .single();

      if (userData && roleData) {
        // Check if role assignment exists
        const { data: existingAssignment } = await supabase
          .from('user_role_assignments')
          .select('id')
          .eq('user_id', userData.id)
          .eq('role_id', roleData.id)
          .single();

        if (!existingAssignment) {
          const { error: roleError } = await supabase
            .from('user_role_assignments')
            .insert({
              user_id: userData.id,
              role_id: roleData.id,
              assigned_by: userData.id,
              is_active: true
            });

          if (roleError) {
            console.error(`Error assigning role to ${user.email}:`, roleError);
          } else {
            console.log(`Assigned ${user.role} role to ${user.email}`);
          }
        }
      }

    } catch (error) {
      console.error(`Error setting up user ${user.email}:`, error);
    }
  }

  console.log('Demo user setup complete!');
};

// Function to validate demo user credentials (for development)
export const validateDemoCredentials = (email: string, password: string) => {
  return DEMO_USERS.find(user => user.email === email && user.password === password);
};

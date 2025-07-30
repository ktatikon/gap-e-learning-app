import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { DatabaseUser } from './supabase';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  employee_id: string;
  username: string;
  department?: string;
  job_title?: string;
  roles: string[];
  is_active: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginAttempts: number;
  isLocked: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  department?: string;
  jobTitle?: string;
}

export interface SignupResult {
  user: any;
  session: any;
  needsEmailVerification: boolean;
}

export interface EmailVerificationResult {
  success: boolean;
  user?: User;
  error?: string;
}

// Convert Supabase user to our User interface
const mapSupabaseUserToUser = async (supabaseUser: SupabaseUser, dbUser: DatabaseUser): Promise<User> => {
  // Get user roles
  const { data: roleAssignments } = await supabase
    .from('user_role_assignments')
    .select(`
      user_roles (
        name
      )
    `)
    .eq('user_id', dbUser.id)
    .eq('is_active', true);

  const roles = roleAssignments?.map(ra => ra.user_roles?.name).filter(Boolean) || [];

  return {
    id: dbUser.id,
    email: dbUser.email,
    first_name: dbUser.first_name,
    last_name: dbUser.last_name,
    employee_id: dbUser.employee_id,
    username: dbUser.username,
    department: dbUser.department,
    job_title: dbUser.job_title,
    roles,
    is_active: dbUser.is_active
  };
};

// Sign in with email and password
export const signInWithPassword = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('No user returned from authentication');
  }

  // Get user details from our users table
  const { data: dbUser, error: dbError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (dbError || !dbUser) {
    throw new Error('User not found in database');
  }

  if (!dbUser.is_active) {
    throw new Error('User account is inactive');
  }

  // Update last login
  await supabase
    .from('users')
    .update({
      last_login: new Date().toISOString(),
      failed_login_attempts: 0
    })
    .eq('id', dbUser.id);

  return mapSupabaseUserToUser(data.user, dbUser);
};

// Password strength validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate username from email
const generateUsername = (email: string, firstName: string, lastName: string): string => {
  const emailPrefix = email.split('@')[0];
  const baseUsername = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;

  // Use email prefix if it's reasonable, otherwise use name-based username
  if (emailPrefix.length >= 3 && emailPrefix.length <= 20) {
    return emailPrefix;
  }

  return baseUsername;
};

// Sign up with email and password
export const signUpWithPassword = async (signupData: SignupData): Promise<SignupResult> => {
  const { email, password, firstName, lastName, employeeId, department, jobTitle } = signupData;

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    throw new Error(`Password requirements not met: ${passwordValidation.errors.join(', ')}`);
  }

  // Check if user already exists in our database
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    throw new Error('An account with this email already exists');
  }

  // Sign up with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        employee_id: employeeId,
        department: department || null,
        job_title: jobTitle || null,
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error('Failed to create user account');
  }

  // Create user profile in our database (will be activated after email verification)
  const username = generateUsername(email, firstName, lastName);

  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      employee_id: employeeId,
      username,
      email,
      first_name: firstName,
      last_name: lastName,
      department: department || null,
      job_title: jobTitle || null,
      is_active: false, // Will be activated after email verification
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (dbError) {
    console.error('Error creating user profile:', dbError);
    // Note: We don't throw here as the Supabase auth user was created successfully
    // The user can still verify their email and we can handle the profile creation later
  }

  // Assign default student role
  if (!dbError) {
    const { data: studentRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('name', 'student')
      .single();

    if (studentRole) {
      await supabase
        .from('user_role_assignments')
        .insert({
          user_id: data.user.id,
          role_id: studentRole.id,
          assigned_by: data.user.id, // Self-assigned during signup
          assigned_at: new Date().toISOString(),
          is_active: true
        });
    }
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailVerification: !data.session // If no session, email verification is required
  };
};

// Verify email confirmation
export const verifyEmailConfirmation = async (token: string, email: string): Promise<EmailVerificationResult> => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'email'
    });

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Email verification failed'
      };
    }

    // Activate user account in our database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', email);

    if (updateError) {
      console.error('Error activating user account:', updateError);
    }

    // Get the updated user profile
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (dbError || !dbUser) {
      return {
        success: false,
        error: 'Failed to retrieve user profile after verification'
      };
    }

    const user = await mapSupabaseUserToUser(data.user, dbUser);

    return {
      success: true,
      user
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email verification failed'
    };
  }
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email
  });

  if (error) {
    throw new Error(error.message);
  }
};

// Sign out
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();

  if (!supabaseUser) {
    return null;
  }

  // Get user details from our users table
  const { data: dbUser, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', supabaseUser.email)
    .single();

  if (error || !dbUser) {
    return null;
  }

  return mapSupabaseUserToUser(supabaseUser, dbUser);
};

// Get role-based route
export const getRoleBasedRoute = (roles: string[]): string => {
  if (roles.includes('admin')) {
    return '/dashboard/admin';
  } else if (roles.includes('compliance')) {
    return '/dashboard/compliance';
  } else if (roles.includes('student')) {
    return '/dashboard/student';
  }
  return '/login';
};

// Check if user has specific role
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.roles.includes(role) || false;
};

// Check if user has any of the specified roles
export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  return user?.roles.some(userRole => roles.includes(userRole)) || false;
};
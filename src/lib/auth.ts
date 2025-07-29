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
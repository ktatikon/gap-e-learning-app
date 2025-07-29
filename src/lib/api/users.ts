import { supabase } from '../supabase';
import type { DatabaseUser, Tables, Inserts, Updates } from '../supabase';

// User API operations
export const userApi = {
  // Get current user profile
  async getCurrentProfile(): Promise<DatabaseUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  },

  // Get user by ID
  async getById(id: string): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return data;
  },

  // Get all users (admin only)
  async getAll(): Promise<DatabaseUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all users:', error);
      return [];
    }

    return data || [];
  },

  // Get users by department
  async getByDepartment(department: string): Promise<DatabaseUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department', department)
      .eq('is_active', true)
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching users by department:', error);
      return [];
    }

    return data || [];
  },

  // Create new user
  async create(userData: Inserts<'users'>): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Update user
  async update(id: string, updates: Updates<'users'>): Promise<DatabaseUser | null> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new Error(error.message);
    }

    return data;
  },

  // Deactivate user (soft delete)
  async deactivate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error deactivating user:', error);
      return false;
    }

    return true;
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_role_assignments')
      .select(`
        user_roles (
          name
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }

    return data?.map(item => item.user_roles?.name).filter(Boolean) || [];
  },

  // Assign role to user
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_role_assignments')
      .insert({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        is_active: true
      });

    if (error) {
      console.error('Error assigning role:', error);
      return false;
    }

    return true;
  },

  // Remove role from user
  async removeRole(userId: string, roleId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_role_assignments')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('role_id', roleId);

    if (error) {
      console.error('Error removing role:', error);
      return false;
    }

    return true;
  },

  // Update last login
  async updateLastLogin(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        failed_login_attempts: 0
      })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      return false;
    }

    return true;
  },

  // Increment failed login attempts
  async incrementFailedAttempts(userId: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_failed_attempts', {
      user_id: userId
    });

    if (error) {
      console.error('Error incrementing failed attempts:', error);
      return false;
    }

    return true;
  },

  // Lock user account
  async lockAccount(userId: string, lockUntil: Date): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ 
        account_locked_until: lockUntil.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error locking account:', error);
      return false;
    }

    return true;
  },

  // Unlock user account
  async unlockAccount(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ 
        account_locked_until: null,
        failed_login_attempts: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      console.error('Error unlocking account:', error);
      return false;
    }

    return true;
  }
};

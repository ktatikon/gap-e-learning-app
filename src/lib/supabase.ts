import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://rrmidxxrcwfwjxuhbwtv.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  throw new Error('Missing Supabase anon key environment variable');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'gxp-learning-hub@1.0.0'
    }
  }
});

// Database Types (based on the GxP schema)
export interface DatabaseUser {
  id: string;
  employee_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  job_title?: string;
  manager_id?: string;
  is_active: boolean;
  last_login?: string;
  password_expires_at?: string;
  failed_login_attempts: number;
  account_locked_until?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  created_by?: string;
}

export interface TrainingCourse {
  id: string;
  course_code: string;
  title: string;
  description?: string;
  version: string;
  category?: string;
  difficulty_level?: string;
  estimated_duration?: number;
  is_mandatory: boolean;
  is_active: boolean;
  effective_date?: string;
  expiry_date?: string;
  refresh_interval?: number;
  passing_score: number;
  max_attempts: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TrainingModule {
  id: string;
  course_id: string;
  module_code: string;
  title: string;
  description?: string;
  sequence_order: number;
  content_type: string;
  content_url?: string;
  content_metadata?: Record<string, any>;
  estimated_duration?: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface TrainingEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  assignment_id?: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  started_at?: string;
  completed_at?: string;
  score?: number;
  attempts: number;
  time_spent: number;
  last_accessed?: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgress {
  id: string;
  enrollment_id: string;
  module_id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  progress_percentage: number;
  time_spent: number;
  last_position?: Record<string, any>;
  attempts: number;
  score?: number;
  created_at: string;
  updated_at: string;
}

export interface ElectronicSignature {
  id: string;
  enrollment_id: string;
  user_id: string;
  signature_type: string;
  signature_meaning: string;
  signed_at: string;
  signer_name: string;
  signer_title?: string;
  signature_hash: string;
  certificate_id?: string;
  ip_address?: string;
  device_fingerprint?: string;
  geolocation?: Record<string, any>;
  signature_data?: Record<string, any>;
  is_valid: boolean;
  invalidated_at?: string;
  invalidated_by?: string;
  invalidation_reason?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  session_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  request_id?: string;
  success: boolean;
  error_message?: string;
  additional_data?: Record<string, any>;
}

export interface TrainingRecord {
  id: string;
  user_id: string;
  course_id: string;
  enrollment_id: string;
  signature_id?: string;
  record_type: string;
  completion_date?: string;
  expiry_date?: string;
  score?: number;
  certificate_number?: string;
  certificate_url?: string;
  is_current: boolean;
  superseded_by?: string;
  created_at: string;
  record_hash: string;
}

// Database schema type
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at'>>;
      };
      user_roles: {
        Row: UserRole;
        Insert: Omit<UserRole, 'id' | 'created_at'>;
        Update: Partial<Omit<UserRole, 'id' | 'created_at'>>;
      };
      training_courses: {
        Row: TrainingCourse;
        Insert: Omit<TrainingCourse, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrainingCourse, 'id' | 'created_at'>>;
      };
      training_modules: {
        Row: TrainingModule;
        Insert: Omit<TrainingModule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrainingModule, 'id' | 'created_at'>>;
      };
      training_enrollments: {
        Row: TrainingEnrollment;
        Insert: Omit<TrainingEnrollment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<TrainingEnrollment, 'id' | 'created_at'>>;
      };
      module_progress: {
        Row: ModuleProgress;
        Insert: Omit<ModuleProgress, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ModuleProgress, 'id' | 'created_at'>>;
      };
      electronic_signatures: {
        Row: ElectronicSignature;
        Insert: Omit<ElectronicSignature, 'id'>;
        Update: Partial<Omit<ElectronicSignature, 'id'>>;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: Omit<AuditLog, 'id'>;
        Update: never; // Audit logs are immutable
      };
      training_records: {
        Row: TrainingRecord;
        Insert: Omit<TrainingRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<TrainingRecord, 'id' | 'created_at'>>;
      };
    };
  };
}

// Typed Supabase client
export type SupabaseClient = typeof supabase;
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Export default client
export default supabase;

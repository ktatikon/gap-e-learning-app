// Consolidated type definitions for the GxP Learning Management System
// This file re-exports and extends types from supabase.ts for easier consumption

export type {
  DatabaseUser,
  UserRole,
  TrainingCourse,
  TrainingModule,
  TrainingEnrollment,
  ModuleProgress,
  ElectronicSignature,
  AuditLog,
  TrainingRecord,
  Tables,
  Inserts,
  Updates,
  Database
} from './supabase';

// Re-export auth types
export type { User } from './auth';

// Legacy types for backward compatibility (deprecated)
export type ModuleStatus = 'not-started' | 'in-progress' | 'completed';
export type ModuleType = 'video' | 'pdf' | 'scorm';

// Legacy Module interface (deprecated - use TrainingModule instead)
export interface Module {
  id: string;
  title: string;
  description: string;
  type: ModuleType;
  category: string;
  prerequisites: string[];
  hasQuiz: boolean;
  requiresSignature: boolean;
  content?: string;
}

// Legacy UserProgress interface (deprecated - use ModuleProgress instead)
export interface UserProgress {
  userId: string;
  moduleId: string;
  status: ModuleStatus;
  progress: number;
  attempts: number;
  score?: number;
  completedAt?: Date;
  signatureData?: string;
}

// Extended types for UI components
export interface CourseWithProgress extends TrainingCourse {
  enrollment?: TrainingEnrollment;
  progress?: {
    totalModules: number;
    completedModules: number;
    progressPercentage: number;
    lastAccessed?: string;
  };
}

export interface ModuleWithProgress extends TrainingModule {
  progress?: ModuleProgress;
  isLocked?: boolean;
  isNext?: boolean;
}

// Module progress with joined training module data
export interface ModuleProgressWithModule extends ModuleProgress {
  training_modules?: {
    id: string;
    title: string;
    description?: string;
    content_type: string;
    sequence_order: number;
    estimated_duration?: number;
  };
}

export interface UserWithRoles extends DatabaseUser {
  roles: string[];
  roleNames?: string[];
}

// Dashboard data types
export interface DashboardStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalTimeSpent: number; // in minutes
  averageScore: number;
  certificatesEarned: number;
  upcomingDeadlines: number;
}

export interface ComplianceStats {
  totalUsers: number;
  activeUsers: number;
  totalEnrollments: number;
  completionRate: number;
  averageCompletionTime: number; // in days
  overdueTrainings: number;
  recentSignatures: number;
}

// Form data types
export interface CreateCourseData {
  course_code: string;
  title: string;
  description?: string;
  version: string;
  category?: string;
  difficulty_level?: string;
  estimated_duration?: number;
  is_mandatory: boolean;
  effective_date?: string;
  expiry_date?: string;
  refresh_interval?: number;
  passing_score: number;
  max_attempts: number;
}

export interface CreateModuleData {
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
}

export interface CreateUserData {
  employee_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  department?: string;
  job_title?: string;
  manager_id?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and search types
export interface CourseFilters {
  category?: string;
  mandatory?: boolean;
  search?: string;
  difficulty?: string;
  status?: 'active' | 'inactive';
}

export interface UserFilters {
  department?: string;
  role?: string;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
}

// Quiz and assessment types
export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  points: number;
}

export interface QuizAttempt {
  id: string;
  moduleId: string;
  userId: string;
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  score: number;
  passed: boolean;
  answers: Record<string, any>;
  timeSpent: number; // in seconds
}

// Certificate types
export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  certificateNumber: string;
  issuedAt: Date;
  expiresAt?: Date;
  certificateUrl: string;
  isValid: boolean;
}

// Report types
export interface TrainingReport {
  id: string;
  title: string;
  type: 'completion' | 'progress' | 'compliance' | 'audit';
  generatedAt: Date;
  generatedBy: string;
  parameters: Record<string, any>;
  data: any[];
  fileUrl?: string;
}

// System configuration types
export interface SystemConfig {
  maxLoginAttempts: number;
  sessionTimeout: number; // in minutes
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
  };
  auditRetentionDays: number;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
}

// Theme and UI types
export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

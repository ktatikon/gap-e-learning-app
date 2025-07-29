// API Service Layer - Centralized exports
export { userApi } from './users';
export { coursesApi } from './courses';
export { progressApi } from './progress';
export { auditApi } from './audit';
export { signaturesApi } from './signatures';

// Re-export types for convenience
export type {
  DatabaseUser,
  TrainingCourse,
  TrainingModule,
  TrainingEnrollment,
  ModuleProgress,
  ElectronicSignature,
  AuditLog,
  Tables,
  Inserts,
  Updates
} from '../supabase';

// Common API utilities
export const apiUtils = {
  // Format date for API calls
  formatDate(date: Date): string {
    return date.toISOString();
  },

  // Parse API date response
  parseDate(dateString: string): Date {
    return new Date(dateString);
  },

  // Handle API errors consistently
  handleError(error: any, context: string): never {
    console.error(`API Error in ${context}:`, error);
    throw new Error(error.message || `An error occurred in ${context}`);
  },

  // Validate UUID format
  isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },

  // Sanitize user input
  sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  },

  // Calculate completion percentage
  calculateCompletionPercentage(completed: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Format duration in minutes to human readable
  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    return `${hours} hr ${remainingMinutes} min`;
  },

  // Generate unique identifier for client-side operations
  generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

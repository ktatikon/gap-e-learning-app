import { supabase } from '../supabase';
import type { AuditLog, Tables, Inserts } from '../supabase';

// Audit Logs API operations
export const auditApi = {
  // Create audit log entry
  async createLog(logData: Omit<Inserts<'audit_logs'>, 'id'>): Promise<boolean> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        ...logData,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error creating audit log:', error);
      return false;
    }

    return true;
  },

  // Get audit logs with pagination
  async getLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resourceType?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ logs: AuditLog[]; total: number }> {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.resourceType) {
      query = query.eq('resource_type', filters.resourceType);
    }
    if (filters?.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('timestamp', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching audit logs:', error);
      return { logs: [], total: 0 };
    }

    return {
      logs: data || [],
      total: count || 0
    };
  },

  // Get logs for specific user
  async getUserLogs(userId: string, limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user logs:', error);
      return [];
    }

    return data || [];
  },

  // Get logs for specific resource
  async getResourceLogs(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('resource_id', resourceId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching resource logs:', error);
      return [];
    }

    return data || [];
  },

  // Get security events (failed logins, account locks, etc.)
  async getSecurityEvents(limit: number = 100): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('action', ['login_failed', 'account_locked', 'password_reset', 'unauthorized_access'])
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching security events:', error);
      return [];
    }

    return data || [];
  },

  // Get training-related events
  async getTrainingEvents(userId?: string, limit: number = 100): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .in('action', [
        'course_started',
        'course_completed',
        'module_started',
        'module_completed',
        'quiz_attempted',
        'signature_captured'
      ]);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching training events:', error);
      return [];
    }

    return data || [];
  },

  // Log user login
  async logLogin(userId: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'login',
      resource_type: 'user',
      resource_id: userId,
      success: true,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_data: { event: 'user_login' }
    });
  },

  // Log user logout
  async logLogout(userId: string): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'logout',
      resource_type: 'user',
      resource_id: userId,
      success: true,
      additional_data: { event: 'user_logout' }
    });
  },

  // Log failed login attempt
  async logFailedLogin(email: string, ipAddress?: string, userAgent?: string): Promise<boolean> {
    return this.createLog({
      action: 'login_failed',
      resource_type: 'user',
      success: false,
      ip_address: ipAddress,
      user_agent: userAgent,
      additional_data: { email, event: 'failed_login' }
    });
  },

  // Log course enrollment
  async logCourseEnrollment(userId: string, courseId: string): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'course_enrolled',
      resource_type: 'training_course',
      resource_id: courseId,
      success: true,
      additional_data: { event: 'course_enrollment' }
    });
  },

  // Log course start
  async logCourseStart(userId: string, courseId: string): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'course_started',
      resource_type: 'training_course',
      resource_id: courseId,
      success: true,
      additional_data: { event: 'course_start' }
    });
  },

  // Log course completion
  async logCourseCompletion(userId: string, courseId: string, score?: number): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'course_completed',
      resource_type: 'training_course',
      resource_id: courseId,
      success: true,
      additional_data: { event: 'course_completion', score }
    });
  },

  // Log module progress
  async logModuleProgress(userId: string, moduleId: string, progress: number): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'module_progress',
      resource_type: 'training_module',
      resource_id: moduleId,
      success: true,
      additional_data: { event: 'module_progress', progress_percentage: progress }
    });
  },

  // Log quiz attempt
  async logQuizAttempt(userId: string, moduleId: string, score: number, passed: boolean): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'quiz_attempted',
      resource_type: 'training_module',
      resource_id: moduleId,
      success: passed,
      additional_data: { event: 'quiz_attempt', score, passed }
    });
  },

  // Log electronic signature
  async logElectronicSignature(userId: string, enrollmentId: string, signatureType: string): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action: 'signature_captured',
      resource_type: 'training_enrollment',
      resource_id: enrollmentId,
      success: true,
      additional_data: { event: 'electronic_signature', signature_type: signatureType }
    });
  },

  // Log data modification
  async logDataModification(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ): Promise<boolean> {
    return this.createLog({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      success: true,
      additional_data: { event: 'data_modification' }
    });
  }
};

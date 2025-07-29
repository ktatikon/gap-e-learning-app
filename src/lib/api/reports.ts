import { supabase } from '../supabase';

export interface TrainingRecord {
  user_id: string;
  user_name: string;
  user_email: string;
  course_id: string;
  course_title: string;
  enrollment_date: string;
  completion_date?: string;
  status: string;
  score?: number;
  signature_id?: string;
  signature_date?: string;
  is_mandatory: boolean;
  due_date?: string;
  department?: string;
  job_title?: string;
}

export interface ComplianceReport {
  report_id: string;
  report_type: string;
  generated_at: string;
  generated_by: string;
  parameters: Record<string, any>;
  data: any[];
  summary: Record<string, any>;
}

export interface AuditReport {
  total_actions: number;
  date_range: {
    start: string;
    end: string;
  };
  actions_by_type: Record<string, number>;
  actions_by_user: Record<string, number>;
  failed_actions: number;
  security_events: number;
  data_modifications: number;
}

export const reportsApi = {
  // Get training records for compliance reporting
  async getTrainingRecords(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    courseId?: string;
    department?: string;
    status?: string;
    mandatory?: boolean;
  } = {}): Promise<TrainingRecord[]> {
    let query = supabase
      .from('training_enrollments')
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        completed_at,
        status,
        score,
        due_date,
        users!inner (
          id,
          first_name,
          last_name,
          email,
          department,
          job_title
        ),
        training_courses!inner (
          id,
          title,
          is_mandatory
        ),
        electronic_signatures (
          id,
          signed_at
        )
      `);

    // Apply filters
    if (filters.startDate) {
      query = query.gte('enrolled_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('enrolled_at', filters.endDate);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.courseId) {
      query = query.eq('course_id', filters.courseId);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.mandatory !== undefined) {
      query = query.eq('training_courses.is_mandatory', filters.mandatory);
    }
    if (filters.department) {
      query = query.eq('users.department', filters.department);
    }

    const { data, error } = await query.order('enrolled_at', { ascending: false });

    if (error) {
      console.error('Error fetching training records:', error);
      throw new Error(error.message);
    }

    // Transform data to match TrainingRecord interface
    return (data || []).map(record => ({
      user_id: record.user_id,
      user_name: `${record.users.first_name} ${record.users.last_name}`,
      user_email: record.users.email,
      course_id: record.course_id,
      course_title: record.training_courses.title,
      enrollment_date: record.enrolled_at,
      completion_date: record.completed_at,
      status: record.status,
      score: record.score,
      signature_id: record.electronic_signatures?.[0]?.id,
      signature_date: record.electronic_signatures?.[0]?.signed_at,
      is_mandatory: record.training_courses.is_mandatory,
      due_date: record.due_date,
      department: record.users.department,
      job_title: record.users.job_title,
    }));
  },

  // Get completion certificates data
  async getCompletionCertificates(filters: {
    startDate?: string;
    endDate?: string;
    userId?: string;
    courseId?: string;
  } = {}): Promise<TrainingRecord[]> {
    const records = await this.getTrainingRecords({
      ...filters,
      status: 'completed',
    });

    // Only return records with signatures (completed certificates)
    return records.filter(record => record.signature_id);
  },

  // Generate audit report
  async generateAuditReport(filters: {
    startDate: string;
    endDate: string;
    userId?: string;
    actionType?: string;
  }): Promise<AuditReport> {
    let query = supabase
      .from('audit_logs')
      .select('*');

    // Apply filters
    query = query.gte('created_at', filters.startDate);
    query = query.lte('created_at', filters.endDate);
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.actionType) {
      query = query.eq('action', filters.actionType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching audit logs:', error);
      throw new Error(error.message);
    }

    const logs = data || [];

    // Analyze audit data
    const actionsByType: Record<string, number> = {};
    const actionsByUser: Record<string, number> = {};
    let failedActions = 0;
    let securityEvents = 0;
    let dataModifications = 0;

    logs.forEach(log => {
      // Count by action type
      actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

      // Count by user
      if (log.user_id) {
        actionsByUser[log.user_id] = (actionsByUser[log.user_id] || 0) + 1;
      }

      // Count failed actions
      if (!log.success) {
        failedActions++;
      }

      // Count security events
      if (log.resource_type === 'security' || log.action.includes('login') || log.action.includes('access')) {
        securityEvents++;
      }

      // Count data modifications
      if (log.old_values || log.new_values) {
        dataModifications++;
      }
    });

    return {
      total_actions: logs.length,
      date_range: {
        start: filters.startDate,
        end: filters.endDate,
      },
      actions_by_type: actionsByType,
      actions_by_user: actionsByUser,
      failed_actions: failedActions,
      security_events: securityEvents,
      data_modifications: dataModifications,
    };
  },

  // Get overdue training report
  async getOverdueTrainingReport(): Promise<TrainingRecord[]> {
    const currentDate = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('training_enrollments')
      .select(`
        id,
        user_id,
        course_id,
        enrolled_at,
        due_date,
        status,
        users!inner (
          id,
          first_name,
          last_name,
          email,
          department,
          job_title
        ),
        training_courses!inner (
          id,
          title,
          is_mandatory
        )
      `)
      .lt('due_date', currentDate)
      .neq('status', 'completed')
      .eq('training_courses.is_mandatory', true);

    if (error) {
      console.error('Error fetching overdue training:', error);
      throw new Error(error.message);
    }

    return (data || []).map(record => ({
      user_id: record.user_id,
      user_name: `${record.users.first_name} ${record.users.last_name}`,
      user_email: record.users.email,
      course_id: record.course_id,
      course_title: record.training_courses.title,
      enrollment_date: record.enrolled_at,
      completion_date: undefined,
      status: record.status,
      score: undefined,
      signature_id: undefined,
      signature_date: undefined,
      is_mandatory: record.training_courses.is_mandatory,
      due_date: record.due_date,
      department: record.users.department,
      job_title: record.users.job_title,
    }));
  },

  // Get compliance summary statistics
  async getComplianceSummary(filters: {
    startDate?: string;
    endDate?: string;
    department?: string;
  } = {}): Promise<{
    total_users: number;
    total_courses: number;
    mandatory_courses: number;
    completed_trainings: number;
    overdue_trainings: number;
    completion_rate: number;
    signature_compliance: number;
  }> {
    // Get basic counts
    const [usersResult, coursesResult, mandatoryCoursesResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('training_courses').select('id', { count: 'exact', head: true }),
      supabase.from('training_courses').select('id', { count: 'exact', head: true }).eq('is_mandatory', true),
    ]);

    // Get training statistics
    let enrollmentsQuery = supabase.from('training_enrollments').select('*');
    if (filters.startDate) {
      enrollmentsQuery = enrollmentsQuery.gte('enrolled_at', filters.startDate);
    }
    if (filters.endDate) {
      enrollmentsQuery = enrollmentsQuery.lte('enrolled_at', filters.endDate);
    }

    const { data: enrollments } = await enrollmentsQuery;
    const totalEnrollments = enrollments?.length || 0;
    const completedTrainings = enrollments?.filter(e => e.status === 'completed').length || 0;
    const overdueTrainings = enrollments?.filter(e => 
      e.due_date && new Date(e.due_date) < new Date() && e.status !== 'completed'
    ).length || 0;

    // Get signature compliance
    const { data: signaturesData } = await supabase
      .from('electronic_signatures')
      .select('enrollment_id')
      .eq('signature_type', 'training_completion')
      .eq('is_valid', true);

    const signedCompletions = signaturesData?.length || 0;

    return {
      total_users: usersResult.count || 0,
      total_courses: coursesResult.count || 0,
      mandatory_courses: mandatoryCoursesResult.count || 0,
      completed_trainings: completedTrainings,
      overdue_trainings: overdueTrainings,
      completion_rate: totalEnrollments > 0 ? Math.round((completedTrainings / totalEnrollments) * 100) : 0,
      signature_compliance: completedTrainings > 0 ? Math.round((signedCompletions / completedTrainings) * 100) : 0,
    };
  },

  // Export data to CSV format
  exportToCSV(data: any[], filename: string): void {
    if (!data.length) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

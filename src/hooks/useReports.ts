import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsApi, type TrainingRecord, type AuditReport } from '@/lib/api/reports';
import { useAuth } from '@/lib/auth-context';

// Query keys for React Query
export const reportKeys = {
  all: ['reports'] as const,
  trainingRecords: (filters: any) => [...reportKeys.all, 'training-records', filters] as const,
  certificates: (filters: any) => [...reportKeys.all, 'certificates', filters] as const,
  auditReport: (filters: any) => [...reportKeys.all, 'audit-report', filters] as const,
  overdueTraining: () => [...reportKeys.all, 'overdue-training'] as const,
  complianceSummary: (filters: any) => [...reportKeys.all, 'compliance-summary', filters] as const,
};

// Get training records
export const useTrainingRecords = (filters: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  courseId?: string;
  department?: string;
  status?: string;
  mandatory?: boolean;
} = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reportKeys.trainingRecords(filters),
    queryFn: () => reportsApi.getTrainingRecords(filters),
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get completion certificates
export const useCompletionCertificates = (filters: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  courseId?: string;
} = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reportKeys.certificates(filters),
    queryFn: () => reportsApi.getCompletionCertificates(filters),
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Generate audit report
export const useAuditReport = (filters: {
  startDate: string;
  endDate: string;
  userId?: string;
  actionType?: string;
}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reportKeys.auditReport(filters),
    queryFn: () => reportsApi.generateAuditReport(filters),
    enabled: (user?.roles.includes('admin') || user?.roles.includes('compliance')) && 
             !!filters.startDate && !!filters.endDate,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get overdue training report
export const useOverdueTrainingReport = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reportKeys.overdueTraining(),
    queryFn: reportsApi.getOverdueTrainingReport,
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });
};

// Get compliance summary
export const useComplianceSummary = (filters: {
  startDate?: string;
  endDate?: string;
  department?: string;
} = {}) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: reportKeys.complianceSummary(filters),
    queryFn: () => reportsApi.getComplianceSummary(filters),
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Export data mutation
export const useExportData = () => {
  return useMutation({
    mutationFn: ({ data, filename }: { data: any[]; filename: string }) => {
      reportsApi.exportToCSV(data, filename);
      return Promise.resolve();
    },
  });
};

// Custom hook for comprehensive reporting dashboard
export const useReportingDashboard = (dateRange: {
  startDate?: string;
  endDate?: string;
} = {}) => {
  const { user } = useAuth();
  
  const trainingRecords = useTrainingRecords(dateRange);
  const certificates = useCompletionCertificates(dateRange);
  const overdueTraining = useOverdueTrainingReport();
  const complianceSummary = useComplianceSummary(dateRange);
  
  const isLoading = trainingRecords.isLoading || 
                   certificates.isLoading || 
                   overdueTraining.isLoading || 
                   complianceSummary.isLoading;
  
  const hasError = trainingRecords.error || 
                   certificates.error || 
                   overdueTraining.error || 
                   complianceSummary.error;

  return {
    // Data
    trainingRecords: trainingRecords.data || [],
    certificates: certificates.data || [],
    overdueTraining: overdueTraining.data || [],
    summary: complianceSummary.data,
    
    // States
    isLoading,
    hasError,
    
    // Permissions
    canViewReports: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    
    // Refetch functions
    refetchAll: () => {
      trainingRecords.refetch();
      certificates.refetch();
      overdueTraining.refetch();
      complianceSummary.refetch();
    },
  };
};

// Custom hook for user-specific training records
export const useUserTrainingRecords = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: reportKeys.trainingRecords({ userId: targetUserId }),
    queryFn: () => reportsApi.getTrainingRecords({ userId: targetUserId }),
    enabled: !!targetUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom hook for department reports
export const useDepartmentReport = (department: string) => {
  const { user } = useAuth();
  
  const trainingRecords = useTrainingRecords({ department });
  const certificates = useCompletionCertificates({ department });
  const complianceSummary = useComplianceSummary({ department });
  
  return {
    trainingRecords: trainingRecords.data || [],
    certificates: certificates.data || [],
    summary: complianceSummary.data,
    isLoading: trainingRecords.isLoading || certificates.isLoading || complianceSummary.isLoading,
    hasError: trainingRecords.error || certificates.error || complianceSummary.error,
    canView: user?.roles.includes('admin') || user?.roles.includes('compliance'),
  };
};

// Custom hook for course-specific reports
export const useCourseReport = (courseId: string) => {
  const { user } = useAuth();
  
  const trainingRecords = useTrainingRecords({ courseId });
  const certificates = useCompletionCertificates({ courseId });
  
  return {
    enrollments: trainingRecords.data || [],
    completions: certificates.data || [],
    isLoading: trainingRecords.isLoading || certificates.isLoading,
    hasError: trainingRecords.error || certificates.error,
    canView: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    
    // Calculated metrics
    totalEnrollments: trainingRecords.data?.length || 0,
    totalCompletions: certificates.data?.length || 0,
    completionRate: trainingRecords.data?.length 
      ? Math.round((certificates.data?.length || 0) / trainingRecords.data.length * 100)
      : 0,
  };
};

// Custom hook for generating and downloading reports
export const useReportGenerator = () => {
  const exportMutation = useExportData();
  
  const generateTrainingReport = async (filters: any = {}) => {
    const data = await reportsApi.getTrainingRecords(filters);
    const filename = `training-records-${new Date().toISOString().split('T')[0]}`;
    exportMutation.mutate({ data, filename });
  };
  
  const generateCertificateReport = async (filters: any = {}) => {
    const data = await reportsApi.getCompletionCertificates(filters);
    const filename = `completion-certificates-${new Date().toISOString().split('T')[0]}`;
    exportMutation.mutate({ data, filename });
  };
  
  const generateOverdueReport = async () => {
    const data = await reportsApi.getOverdueTrainingReport();
    const filename = `overdue-training-${new Date().toISOString().split('T')[0]}`;
    exportMutation.mutate({ data, filename });
  };
  
  const generateAuditReport = async (filters: {
    startDate: string;
    endDate: string;
    userId?: string;
    actionType?: string;
  }) => {
    const data = await reportsApi.generateAuditReport(filters);
    const filename = `audit-report-${filters.startDate}-to-${filters.endDate}`;
    exportMutation.mutate({ 
      data: [data], // Wrap in array for CSV export
      filename 
    });
  };
  
  return {
    generateTrainingReport,
    generateCertificateReport,
    generateOverdueReport,
    generateAuditReport,
    isGenerating: exportMutation.isPending,
  };
};

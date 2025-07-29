import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { progressApi, auditApi, type TrainingEnrollment, type ModuleProgress } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// Query keys for React Query
export const progressKeys = {
  all: ['progress'] as const,
  enrollments: () => [...progressKeys.all, 'enrollments'] as const,
  userEnrollments: (userId: string) => [...progressKeys.enrollments(), userId] as const,
  enrollment: (id: string) => [...progressKeys.all, 'enrollment', id] as const,
  moduleProgress: (enrollmentId: string) => [...progressKeys.enrollment(enrollmentId), 'modules'] as const,
  completed: (userId: string) => [...progressKeys.all, 'completed', userId] as const,
  inProgress: (userId: string) => [...progressKeys.all, 'inProgress', userId] as const,
};

// Get user enrollments
export const useUserEnrollments = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: progressKeys.userEnrollments(targetUserId || ''),
    queryFn: () => progressApi.getUserEnrollments(targetUserId!),
    enabled: !!targetUserId,
  });
};

// Get enrollment by ID
export const useEnrollment = (enrollmentId: string) => {
  return useQuery({
    queryKey: progressKeys.enrollment(enrollmentId),
    queryFn: () => progressApi.getEnrollmentById(enrollmentId),
    enabled: !!enrollmentId,
  });
};

// Get module progress for enrollment
export const useModuleProgress = (enrollmentId: string) => {
  return useQuery({
    queryKey: progressKeys.moduleProgress(enrollmentId),
    queryFn: () => progressApi.getModuleProgress(enrollmentId),
    enabled: !!enrollmentId,
  });
};

// Get user's completed courses
export const useCompletedCourses = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: progressKeys.completed(targetUserId || ''),
    queryFn: () => progressApi.getCompletedCourses(targetUserId!),
    enabled: !!targetUserId,
  });
};

// Get user's in-progress courses
export const useInProgressCourses = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: progressKeys.inProgress(targetUserId || ''),
    queryFn: () => progressApi.getInProgressCourses(targetUserId!),
    enabled: !!targetUserId,
  });
};

// Start course mutation
export const useStartCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ courseId }: { courseId: string }) =>
      progressApi.startCourse(user!.id, courseId),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: progressKeys.userEnrollments(user!.id) });
      queryClient.invalidateQueries({ queryKey: progressKeys.inProgress(user!.id) });
      
      // Log the course start
      if (data) {
        auditApi.logCourseStart(user!.id, variables.courseId);
      }
    },
  });
};

// Complete course mutation
export const useCompleteCourse = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ enrollmentId, score }: { enrollmentId: string; score?: number }) =>
      progressApi.completeCourse(enrollmentId, score),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: progressKeys.enrollment(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.userEnrollments(user!.id) });
      queryClient.invalidateQueries({ queryKey: progressKeys.completed(user!.id) });
      queryClient.invalidateQueries({ queryKey: progressKeys.inProgress(user!.id) });
    },
  });
};

// Update module progress mutation
export const useUpdateModuleProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      enrollmentId, 
      moduleId, 
      userId, 
      progressData 
    }: { 
      enrollmentId: string; 
      moduleId: string; 
      userId: string; 
      progressData: Partial<ModuleProgress>;
    }) => progressApi.updateModuleProgress(enrollmentId, moduleId, userId, progressData),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: progressKeys.moduleProgress(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.enrollment(variables.enrollmentId) });
      
      // Log progress update
      if (variables.progressData.progress_percentage !== undefined) {
        auditApi.logModuleProgress(
          variables.userId, 
          variables.moduleId, 
          variables.progressData.progress_percentage
        );
      }
    },
  });
};

// Complete module mutation
export const useCompleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      enrollmentId, 
      moduleId, 
      userId, 
      score 
    }: { 
      enrollmentId: string; 
      moduleId: string; 
      userId: string; 
      score?: number;
    }) => progressApi.completeModule(enrollmentId, moduleId, userId, score),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: progressKeys.moduleProgress(variables.enrollmentId) });
      queryClient.invalidateQueries({ queryKey: progressKeys.enrollment(variables.enrollmentId) });
    },
  });
};

// Update last accessed mutation
export const useUpdateLastAccessed = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: progressApi.updateLastAccessed,
    onSuccess: (_, enrollmentId) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.enrollment(enrollmentId) });
    },
  });
};

// Add time spent mutation
export const useAddTimeSpent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ enrollmentId, minutes }: { enrollmentId: string; minutes: number }) =>
      progressApi.addTimeSpent(enrollmentId, minutes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.enrollment(variables.enrollmentId) });
    },
  });
};

// Custom hook for user dashboard data
export const useUserDashboard = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const enrollments = useUserEnrollments(targetUserId);
  const completed = useCompletedCourses(targetUserId);
  const inProgress = useInProgressCourses(targetUserId);

  return {
    enrollments,
    completed,
    inProgress,
    isLoading: enrollments.isLoading || completed.isLoading || inProgress.isLoading,
    error: enrollments.error || completed.error || inProgress.error,
  };
};

// Custom hook for course progress tracking
export const useCourseProgress = (enrollmentId: string) => {
  const enrollment = useEnrollment(enrollmentId);
  const moduleProgress = useModuleProgress(enrollmentId);

  const progressSummary = React.useMemo(() => {
    if (!moduleProgress.data || moduleProgress.data.length === 0) {
      return {
        totalModules: 0,
        completedModules: 0,
        progressPercentage: 0,
        currentModule: null,
      };
    }

    const totalModules = moduleProgress.data.length;
    const completedModules = moduleProgress.data.filter(m => m.status === 'completed').length;
    const progressPercentage = Math.round((completedModules / totalModules) * 100);
    const currentModule = moduleProgress.data.find(m => m.status === 'in_progress') || 
                         moduleProgress.data.find(m => m.status === 'not_started');

    return {
      totalModules,
      completedModules,
      progressPercentage,
      currentModule,
    };
  }, [moduleProgress.data]);

  return {
    enrollment,
    moduleProgress,
    progressSummary,
    isLoading: enrollment.isLoading || moduleProgress.isLoading,
    error: enrollment.error || moduleProgress.error,
  };
};

import React from 'react';

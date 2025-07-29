import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi, type TrainingCourse, type TrainingModule } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// Query keys for React Query
export const courseKeys = {
  all: ['courses'] as const,
  lists: () => [...courseKeys.all, 'list'] as const,
  list: (filters: string) => [...courseKeys.lists(), { filters }] as const,
  details: () => [...courseKeys.all, 'detail'] as const,
  detail: (id: string) => [...courseKeys.details(), id] as const,
  modules: (id: string) => [...courseKeys.detail(id), 'modules'] as const,
  statistics: (id: string) => [...courseKeys.detail(id), 'statistics'] as const,
  search: (query: string) => [...courseKeys.all, 'search', query] as const,
};

// Get all courses
export const useCourses = () => {
  return useQuery({
    queryKey: courseKeys.lists(),
    queryFn: coursesApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get course by ID
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: courseKeys.detail(id),
    queryFn: () => coursesApi.getById(id),
    enabled: !!id,
  });
};

// Get courses by category
export const useCoursesByCategory = (category: string) => {
  return useQuery({
    queryKey: courseKeys.list(category),
    queryFn: () => coursesApi.getByCategory(category),
    enabled: !!category,
  });
};

// Get mandatory courses
export const useMandatoryCourses = () => {
  return useQuery({
    queryKey: courseKeys.list('mandatory'),
    queryFn: coursesApi.getMandatory,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Get course modules
export const useCourseModules = (courseId: string) => {
  return useQuery({
    queryKey: courseKeys.modules(courseId),
    queryFn: () => coursesApi.getModules(courseId),
    enabled: !!courseId,
  });
};

// Get course statistics
export const useCourseStatistics = (courseId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: courseKeys.statistics(courseId),
    queryFn: () => coursesApi.getStatistics(courseId),
    enabled: !!courseId && (user?.roles.includes('admin') || user?.roles.includes('compliance')),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Search courses
export const useSearchCourses = (query: string) => {
  return useQuery({
    queryKey: courseKeys.search(query),
    queryFn: () => coursesApi.search(query),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Create course mutation
export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Update course mutation
export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      coursesApi.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Deactivate course mutation
export const useDeactivateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.deactivate,
    onSuccess: (_, courseId) => {
      queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() });
    },
  });
};

// Create module mutation
export const useCreateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.createModule,
    onSuccess: (data) => {
      if (data?.course_id) {
        queryClient.invalidateQueries({ queryKey: courseKeys.modules(data.course_id) });
      }
    },
  });
};

// Update module mutation
export const useUpdateModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      coursesApi.updateModule(id, updates),
    onSuccess: (data) => {
      if (data?.course_id) {
        queryClient.invalidateQueries({ queryKey: courseKeys.modules(data.course_id) });
      }
    },
  });
};

// Delete module mutation
export const useDeleteModule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: coursesApi.deleteModule,
    onSuccess: (_, moduleId) => {
      // Invalidate all course modules queries since we don't know which course this module belongs to
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === 'courses' && query.queryKey.includes('modules')
      });
    },
  });
};

// Custom hook for course catalog with filtering and sorting
export const useCoursesCatalog = (filters?: {
  category?: string;
  mandatory?: boolean;
  search?: string;
}) => {
  const { data: allCourses, ...queryResult } = useCourses();
  
  const filteredCourses = React.useMemo(() => {
    if (!allCourses) return [];
    
    let filtered = [...allCourses];
    
    if (filters?.category) {
      filtered = filtered.filter(course => course.category === filters.category);
    }
    
    if (filters?.mandatory !== undefined) {
      filtered = filtered.filter(course => course.is_mandatory === filters.mandatory);
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(course => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.category?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered.sort((a, b) => a.title.localeCompare(b.title));
  }, [allCourses, filters]);
  
  return {
    ...queryResult,
    data: filteredCourses,
  };
};



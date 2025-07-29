import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi, type DatabaseUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// Query keys for React Query
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  roles: (id: string) => [...userKeys.detail(id), 'roles'] as const,
};

// Get current user profile
export const useCurrentProfile = () => {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: userApi.getCurrentProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user by ID
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
};

// Get all users (admin only)
export const useUsers = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: userApi.getAll,
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
  });
};

// Get users by department
export const useUsersByDepartment = (department: string) => {
  return useQuery({
    queryKey: userKeys.list(department),
    queryFn: () => userApi.getByDepartment(department),
    enabled: !!department,
  });
};

// Get user roles
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: userKeys.roles(userId),
    queryFn: () => userApi.getUserRoles(userId),
    enabled: !!userId,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      userApi.update(id, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};

// Deactivate user mutation
export const useDeactivateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.deactivate,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Assign role mutation
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId, assignedBy }: { 
      userId: string; 
      roleId: string; 
      assignedBy: string; 
    }) => userApi.assignRole(userId, roleId, assignedBy),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
    },
  });
};

// Remove role mutation
export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
      userApi.removeRole(userId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.roles(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
    },
  });
};

// Lock account mutation
export const useLockAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, lockUntil }: { userId: string; lockUntil: Date }) =>
      userApi.lockAccount(userId, lockUntil),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Unlock account mutation
export const useUnlockAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.unlockAccount,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { signaturesApi, type ElectronicSignature } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// Query keys for React Query
export const signatureKeys = {
  all: ['signatures'] as const,
  lists: () => [...signatureKeys.all, 'list'] as const,
  list: (filters: string) => [...signatureKeys.lists(), { filters }] as const,
  details: () => [...signatureKeys.all, 'detail'] as const,
  detail: (id: string) => [...signatureKeys.details(), id] as const,
  enrollment: (enrollmentId: string) => [...signatureKeys.all, 'enrollment', enrollmentId] as const,
  user: (userId: string) => [...signatureKeys.all, 'user', userId] as const,
  verification: (id: string) => [...signatureKeys.detail(id), 'verification'] as const,
  statistics: () => [...signatureKeys.all, 'statistics'] as const,
};

// Get signatures for enrollment
export const useEnrollmentSignatures = (enrollmentId: string) => {
  return useQuery({
    queryKey: signatureKeys.enrollment(enrollmentId),
    queryFn: () => signaturesApi.getEnrollmentSignatures(enrollmentId),
    enabled: !!enrollmentId,
  });
};

// Get signatures for user
export const useUserSignatures = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: signatureKeys.user(targetUserId || ''),
    queryFn: () => signaturesApi.getUserSignatures(targetUserId!),
    enabled: !!targetUserId,
  });
};

// Verify signature integrity
export const useVerifySignature = (signatureId: string) => {
  return useQuery({
    queryKey: signatureKeys.verification(signatureId),
    queryFn: () => signaturesApi.verifySignature(signatureId),
    enabled: !!signatureId,
    staleTime: 0, // Always fresh verification
  });
};

// Get signature statistics (admin/compliance only)
export const useSignatureStatistics = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: signatureKeys.statistics(),
    queryFn: signaturesApi.getSignatureStatistics,
    enabled: user?.roles.includes('admin') || user?.roles.includes('compliance'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create signature mutation
export const useCreateSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signaturesApi.createSignature,
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.enrollment(variables.enrollmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.user(variables.userId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.statistics() 
      });
    },
  });
};

// Create completion signature mutation
export const useCreateCompletionSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      enrollmentId, 
      userId, 
      signerName, 
      signerTitle, 
      additionalData 
    }: {
      enrollmentId: string;
      userId: string;
      signerName: string;
      signerTitle?: string;
      additionalData?: Record<string, any>;
    }) => signaturesApi.createCompletionSignature(
      enrollmentId, 
      userId, 
      signerName, 
      signerTitle, 
      additionalData
    ),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.enrollment(variables.enrollmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.user(variables.userId) 
      });
    },
  });
};

// Create acknowledgment signature mutation
export const useCreateAcknowledgmentSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      enrollmentId, 
      userId, 
      signerName, 
      acknowledgmentText, 
      signerTitle 
    }: {
      enrollmentId: string;
      userId: string;
      signerName: string;
      acknowledgmentText: string;
      signerTitle?: string;
    }) => signaturesApi.createAcknowledgmentSignature(
      enrollmentId, 
      userId, 
      signerName, 
      acknowledgmentText, 
      signerTitle
    ),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.enrollment(variables.enrollmentId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: signatureKeys.user(variables.userId) 
      });
    },
  });
};

// Invalidate signature mutation
export const useInvalidateSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      signatureId, 
      invalidatedBy, 
      reason 
    }: {
      signatureId: string;
      invalidatedBy: string;
      reason: string;
    }) => signaturesApi.invalidateSignature(signatureId, invalidatedBy, reason),
    onSuccess: (success, variables) => {
      if (success) {
        // Invalidate signature verification
        queryClient.invalidateQueries({ 
          queryKey: signatureKeys.verification(variables.signatureId) 
        });
        queryClient.invalidateQueries({ 
          queryKey: signatureKeys.statistics() 
        });
        // Invalidate all signature lists to reflect the change
        queryClient.invalidateQueries({ 
          queryKey: signatureKeys.lists() 
        });
      }
    },
  });
};

// Custom hook for signature workflow
export const useSignatureWorkflow = (enrollmentId: string) => {
  const { user } = useAuth();
  const enrollmentSignatures = useEnrollmentSignatures(enrollmentId);
  const createSignature = useCreateSignature();
  const createCompletionSignature = useCreateCompletionSignature();
  const createAcknowledgmentSignature = useCreateAcknowledgmentSignature();

  const hasCompletionSignature = enrollmentSignatures.data?.some(
    sig => sig.signature_type === 'training_completion' && sig.is_valid
  ) || false;

  const hasAcknowledgmentSignature = enrollmentSignatures.data?.some(
    sig => sig.signature_type === 'acknowledgment' && sig.is_valid
  ) || false;

  const isSignatureRequired = !hasCompletionSignature;
  const isAcknowledgmentRequired = !hasAcknowledgmentSignature;

  const createTrainingCompletionSignature = async (
    signerName: string,
    signerTitle?: string,
    additionalData?: Record<string, any>
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    return createCompletionSignature.mutateAsync({
      enrollmentId,
      userId: user.id,
      signerName,
      signerTitle,
      additionalData,
    });
  };

  const createTrainingAcknowledgment = async (
    signerName: string,
    acknowledgmentText: string,
    signerTitle?: string
  ) => {
    if (!user) throw new Error('User not authenticated');
    
    return createAcknowledgmentSignature.mutateAsync({
      enrollmentId,
      userId: user.id,
      signerName,
      acknowledgmentText,
      signerTitle,
    });
  };

  return {
    // Data
    signatures: enrollmentSignatures.data || [],
    isLoading: enrollmentSignatures.isLoading,
    error: enrollmentSignatures.error,
    
    // Status
    hasCompletionSignature,
    hasAcknowledgmentSignature,
    isSignatureRequired,
    isAcknowledgmentRequired,
    
    // Actions
    createTrainingCompletionSignature,
    createTrainingAcknowledgment,
    
    // Mutation states
    isCreatingSignature: createSignature.isPending || 
                        createCompletionSignature.isPending || 
                        createAcknowledgmentSignature.isPending,
  };
};

// Custom hook for signature verification display
export const useSignatureVerification = (signatures: ElectronicSignature[]) => {
  const verificationQueries = signatures.map(sig => 
    useVerifySignature(sig.id)
  );

  const verificationResults = verificationQueries.map((query, index) => ({
    signatureId: signatures[index]?.id,
    isLoading: query.isLoading,
    isValid: query.data?.isValid || false,
    reason: query.data?.reason,
    error: query.error,
  }));

  const allVerified = verificationResults.every(result => 
    !result.isLoading && result.isValid
  );

  const hasInvalidSignatures = verificationResults.some(result => 
    !result.isLoading && !result.isValid
  );

  return {
    verificationResults,
    allVerified,
    hasInvalidSignatures,
    isVerifying: verificationResults.some(result => result.isLoading),
  };
};

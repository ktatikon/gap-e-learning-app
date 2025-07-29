import { useCallback } from 'react';
import { auditApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

// Custom hook for audit logging
export const useAuditLog = () => {
  const { user } = useAuth();

  // Get client information for audit logs
  const getClientInfo = useCallback(() => {
    return {
      ipAddress: 'client-ip', // In production, get real IP
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
  }, []);

  // Generic audit log function
  const logAction = useCallback(async (
    action: string,
    resourceType: string,
    resourceId?: string,
    details?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ) => {
    if (!user) return;

    const clientInfo = getClientInfo();
    
    try {
      await auditApi.createLog({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        old_values: oldValues,
        new_values: newValues,
        success,
        error_message: errorMessage,
        ip_address: clientInfo.ipAddress,
        user_agent: clientInfo.userAgent,
        additional_data: details ? { details } : undefined,
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }, [user, getClientInfo]);

  // Specific audit logging functions
  const logLogin = useCallback(async () => {
    if (!user) return;
    await auditApi.logLogin(user.id, getClientInfo().ipAddress, getClientInfo().userAgent);
  }, [user, getClientInfo]);

  const logLogout = useCallback(async () => {
    if (!user) return;
    await auditApi.logLogout(user.id);
  }, [user]);

  const logFailedLogin = useCallback(async (email: string) => {
    const clientInfo = getClientInfo();
    await auditApi.logFailedLogin(email, clientInfo.ipAddress, clientInfo.userAgent);
  }, [getClientInfo]);

  const logCourseStart = useCallback(async (courseId: string) => {
    if (!user) return;
    await auditApi.logCourseStart(user.id, courseId);
  }, [user]);

  const logCourseCompletion = useCallback(async (courseId: string, score?: number) => {
    if (!user) return;
    await auditApi.logCourseCompletion(user.id, courseId, score);
  }, [user]);

  const logModuleProgress = useCallback(async (moduleId: string, progress: number) => {
    if (!user) return;
    await auditApi.logModuleProgress(user.id, moduleId, progress);
  }, [user]);

  const logQuizAttempt = useCallback(async (moduleId: string, score: number, passed: boolean) => {
    if (!user) return;
    await auditApi.logQuizAttempt(user.id, moduleId, score, passed);
  }, [user]);

  const logElectronicSignature = useCallback(async (enrollmentId: string, signatureType: string) => {
    if (!user) return;
    await auditApi.logElectronicSignature(user.id, enrollmentId, signatureType);
  }, [user]);

  const logDataModification = useCallback(async (
    action: string,
    resourceType: string,
    resourceId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    if (!user) return;
    await auditApi.logDataModification(user.id, action, resourceType, resourceId, oldValues, newValues);
  }, [user]);

  // Security-related logging
  const logSecurityEvent = useCallback(async (
    eventType: string,
    details: string,
    success: boolean = true
  ) => {
    await logAction(
      eventType,
      'security',
      undefined,
      details,
      undefined,
      undefined,
      success
    );
  }, [logAction]);

  // System event logging
  const logSystemEvent = useCallback(async (
    eventType: string,
    details: string,
    resourceId?: string
  ) => {
    await logAction(
      eventType,
      'system',
      resourceId,
      details
    );
  }, [logAction]);

  // User management logging
  const logUserAction = useCallback(async (
    action: string,
    targetUserId: string,
    details?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    await logAction(
      action,
      'user',
      targetUserId,
      details,
      oldValues,
      newValues
    );
  }, [logAction]);

  // Course management logging
  const logCourseAction = useCallback(async (
    action: string,
    courseId: string,
    details?: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) => {
    await logAction(
      action,
      'training_course',
      courseId,
      details,
      oldValues,
      newValues
    );
  }, [logAction]);

  // Access control logging
  const logAccessAttempt = useCallback(async (
    resource: string,
    allowed: boolean,
    reason?: string
  ) => {
    await logAction(
      allowed ? 'access_granted' : 'access_denied',
      'access_control',
      resource,
      reason,
      undefined,
      undefined,
      allowed
    );
  }, [logAction]);

  // File operation logging
  const logFileOperation = useCallback(async (
    operation: string,
    fileName: string,
    success: boolean = true,
    errorMessage?: string
  ) => {
    await logAction(
      operation,
      'file',
      fileName,
      undefined,
      undefined,
      undefined,
      success,
      errorMessage
    );
  }, [logAction]);

  return {
    // Generic logging
    logAction,
    
    // Authentication logging
    logLogin,
    logLogout,
    logFailedLogin,
    
    // Training logging
    logCourseStart,
    logCourseCompletion,
    logModuleProgress,
    logQuizAttempt,
    logElectronicSignature,
    
    // Data management logging
    logDataModification,
    
    // Specific domain logging
    logSecurityEvent,
    logSystemEvent,
    logUserAction,
    logCourseAction,
    logAccessAttempt,
    logFileOperation,
  };
};

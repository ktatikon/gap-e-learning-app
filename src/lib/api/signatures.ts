import { supabase } from '../supabase';
import type { ElectronicSignature, Tables, Inserts } from '../supabase';
import { auditApi } from './audit';

// Electronic Signatures API operations
export const signaturesApi = {
  // Create electronic signature
  async createSignature(signatureData: {
    enrollmentId: string;
    userId: string;
    signatureType: string;
    signatureMeaning: string;
    signerName: string;
    signerTitle?: string;
    signatureData: Record<string, any>;
    ipAddress?: string;
    deviceFingerprint?: string;
    geolocation?: Record<string, any>;
  }): Promise<ElectronicSignature | null> {
    // Generate cryptographic hash of signature data
    const signatureHash = await this.generateSignatureHash(signatureData.signatureData);

    const { data, error } = await supabase
      .from('electronic_signatures')
      .insert({
        enrollment_id: signatureData.enrollmentId,
        user_id: signatureData.userId,
        signature_type: signatureData.signatureType,
        signature_meaning: signatureData.signatureMeaning,
        signer_name: signatureData.signerName,
        signer_title: signatureData.signerTitle,
        signature_hash: signatureHash,
        ip_address: signatureData.ipAddress,
        device_fingerprint: signatureData.deviceFingerprint,
        geolocation: signatureData.geolocation,
        signature_data: signatureData.signatureData,
        is_valid: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating electronic signature:', error);
      throw new Error(error.message);
    }

    // Log the signature creation
    await auditApi.logElectronicSignature(
      signatureData.userId,
      signatureData.enrollmentId,
      signatureData.signatureType
    );

    return data;
  },

  // Get signatures for enrollment
  async getEnrollmentSignatures(enrollmentId: string): Promise<ElectronicSignature[]> {
    const { data, error } = await supabase
      .from('electronic_signatures')
      .select('*')
      .eq('enrollment_id', enrollmentId)
      .eq('is_valid', true)
      .order('signed_at', { ascending: false });

    if (error) {
      console.error('Error fetching enrollment signatures:', error);
      return [];
    }

    return data || [];
  },

  // Get signatures for user
  async getUserSignatures(userId: string): Promise<ElectronicSignature[]> {
    const { data, error } = await supabase
      .from('electronic_signatures')
      .select(`
        *,
        training_enrollments (
          id,
          training_courses (
            title,
            course_code
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_valid', true)
      .order('signed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user signatures:', error);
      return [];
    }

    return data || [];
  },

  // Verify signature integrity
  async verifySignature(signatureId: string): Promise<{
    isValid: boolean;
    reason?: string;
  }> {
    const { data: signature, error } = await supabase
      .from('electronic_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (error || !signature) {
      return { isValid: false, reason: 'Signature not found' };
    }

    if (!signature.is_valid) {
      return { isValid: false, reason: signature.invalidation_reason || 'Signature invalidated' };
    }

    // Verify hash integrity
    const expectedHash = await this.generateSignatureHash(signature.signature_data);
    if (expectedHash !== signature.signature_hash) {
      return { isValid: false, reason: 'Signature data integrity compromised' };
    }

    return { isValid: true };
  },

  // Invalidate signature
  async invalidateSignature(
    signatureId: string,
    invalidatedBy: string,
    reason: string
  ): Promise<boolean> {
    const { error } = await supabase
      .from('electronic_signatures')
      .update({
        is_valid: false,
        invalidated_at: new Date().toISOString(),
        invalidated_by: invalidatedBy,
        invalidation_reason: reason
      })
      .eq('id', signatureId);

    if (error) {
      console.error('Error invalidating signature:', error);
      return false;
    }

    // Log the invalidation
    await auditApi.createLog({
      user_id: invalidatedBy,
      action: 'signature_invalidated',
      resource_type: 'electronic_signature',
      resource_id: signatureId,
      success: true,
      additional_data: { reason }
    });

    return true;
  },

  // Generate signature hash (simplified version - in production use proper cryptographic library)
  async generateSignatureHash(signatureData: Record<string, any>): Promise<string> {
    const dataString = JSON.stringify(signatureData, Object.keys(signatureData).sort());
    const encoder = new TextEncoder();
    const data = encoder.encode(dataString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Create training completion signature
  async createCompletionSignature(
    enrollmentId: string,
    userId: string,
    signerName: string,
    signerTitle?: string,
    additionalData?: Record<string, any>
  ): Promise<ElectronicSignature | null> {
    const signatureData = {
      type: 'training_completion',
      timestamp: new Date().toISOString(),
      enrollment_id: enrollmentId,
      user_id: userId,
      signer_name: signerName,
      signer_title: signerTitle,
      ...additionalData
    };

    return this.createSignature({
      enrollmentId,
      userId,
      signatureType: 'training_completion',
      signatureMeaning: 'I acknowledge that I have completed this training and understand the content presented.',
      signerName,
      signerTitle,
      signatureData,
      ipAddress: await this.getClientIP(),
      deviceFingerprint: await this.generateDeviceFingerprint()
    });
  },

  // Create acknowledgment signature
  async createAcknowledgmentSignature(
    enrollmentId: string,
    userId: string,
    signerName: string,
    acknowledgmentText: string,
    signerTitle?: string
  ): Promise<ElectronicSignature | null> {
    const signatureData = {
      type: 'acknowledgment',
      timestamp: new Date().toISOString(),
      enrollment_id: enrollmentId,
      user_id: userId,
      signer_name: signerName,
      signer_title: signerTitle,
      acknowledgment_text: acknowledgmentText
    };

    return this.createSignature({
      enrollmentId,
      userId,
      signatureType: 'acknowledgment',
      signatureMeaning: acknowledgmentText,
      signerName,
      signerTitle,
      signatureData,
      ipAddress: await this.getClientIP(),
      deviceFingerprint: await this.generateDeviceFingerprint()
    });
  },

  // Get client IP address (simplified - in production use proper method)
  async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  },

  // Generate device fingerprint (simplified - in production use proper library)
  async generateDeviceFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvas.toDataURL()
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(fingerprint));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Get signature statistics
  async getSignatureStatistics(): Promise<{
    totalSignatures: number;
    validSignatures: number;
    invalidSignatures: number;
    signaturesByType: Record<string, number>;
  }> {
    const { data: signatures, error } = await supabase
      .from('electronic_signatures')
      .select('signature_type, is_valid');

    if (error) {
      console.error('Error fetching signature statistics:', error);
      return {
        totalSignatures: 0,
        validSignatures: 0,
        invalidSignatures: 0,
        signaturesByType: {}
      };
    }

    const totalSignatures = signatures?.length || 0;
    const validSignatures = signatures?.filter(s => s.is_valid).length || 0;
    const invalidSignatures = totalSignatures - validSignatures;

    const signaturesByType: Record<string, number> = {};
    signatures?.forEach(sig => {
      signaturesByType[sig.signature_type] = (signaturesByType[sig.signature_type] || 0) + 1;
    });

    return {
      totalSignatures,
      validSignatures,
      invalidSignatures,
      signaturesByType
    };
  }
};

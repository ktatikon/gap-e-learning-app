import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth-context';
import { signaturesApi } from '@/lib/api';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useToast } from '@/hooks/use-toast';
import { PenTool, RotateCcw, Save, Shield, AlertCircle } from 'lucide-react';

interface ElectronicSignatureProps {
  enrollmentId: string;
  courseTitle: string;
  onSignatureComplete: (signatureId: string) => void;
  onCancel: () => void;
  signatureType?: 'training_completion' | 'acknowledgment';
  customMeaning?: string;
}

export const ElectronicSignature: React.FC<ElectronicSignatureProps> = ({
  enrollmentId,
  courseTitle,
  onSignatureComplete,
  onCancel,
  signatureType = 'training_completion',
  customMeaning,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [signatureTitle, setSignatureTitle] = useState('');
  const [acknowledgmentText, setAcknowledgmentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const { logElectronicSignature } = useAuditLog();

  useEffect(() => {
    if (user) {
      setSignatureName(`${user.first_name} ${user.last_name}`);
      setSignatureTitle(user.job_title || '');
    }
  }, [user]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = '#B1420A'; // Primary color
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureMeaning = () => {
    if (customMeaning) return customMeaning;
    
    switch (signatureType) {
      case 'training_completion':
        return `I acknowledge that I have completed the training course "${courseTitle}" and understand the content presented. I certify that this training was completed by me personally and that I understand my responsibilities as outlined in the training materials.`;
      case 'acknowledgment':
        return acknowledgmentText || `I acknowledge receipt and understanding of the training materials for "${courseTitle}".`;
      default:
        return `I provide my electronic signature for "${courseTitle}".`;
    }
  };

  const handleSubmit = async () => {
    if (!user || !hasSignature || !signatureName.trim()) {
      toast({
        title: 'Incomplete Signature',
        description: 'Please provide your signature and full name.',
        variant: 'destructive',
      });
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsSubmitting(true);

    try {
      // Convert canvas to data URL
      const signatureDataURL = canvas.toDataURL('image/png');
      
      // Create signature data object
      const signatureData = {
        signature_image: signatureDataURL,
        canvas_width: canvas.width,
        canvas_height: canvas.height,
        timestamp: new Date().toISOString(),
        browser_info: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
        },
      };

      // Create electronic signature
      const signature = await signaturesApi.createSignature({
        enrollmentId,
        userId: user.id,
        signatureType,
        signatureMeaning: getSignatureMeaning(),
        signerName: signatureName,
        signerTitle: signatureTitle,
        signatureData,
      });

      if (signature) {
        // Log the signature creation
        await logElectronicSignature(enrollmentId, signatureType);

        toast({
          title: 'Signature Captured',
          description: 'Your electronic signature has been successfully recorded.',
        });

        onSignatureComplete(signature.id);
      }
    } catch (error) {
      console.error('Error creating signature:', error);
      toast({
        title: 'Signature Error',
        description: 'Failed to capture signature. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Electronic Signature Required
          </CardTitle>
          <CardDescription>
            Please provide your electronic signature to complete the training certification process.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Course Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Training Course</h3>
            <p className="text-sm text-muted-foreground">{courseTitle}</p>
          </div>

          {/* Signature Meaning */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              Signature Meaning
            </h3>
            <p className="text-sm text-blue-800">{getSignatureMeaning()}</p>
          </div>

          {/* Custom Acknowledgment Text for acknowledgment type */}
          {signatureType === 'acknowledgment' && !customMeaning && (
            <div className="space-y-2">
              <Label htmlFor="acknowledgment">Acknowledgment Statement</Label>
              <Textarea
                id="acknowledgment"
                value={acknowledgmentText}
                onChange={(e) => setAcknowledmentText(e.target.value)}
                placeholder="Enter specific acknowledgment text..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {/* Signer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signerName">Full Name *</Label>
              <Input
                id="signerName"
                value={signatureName}
                onChange={(e) => setSignatureName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerTitle">Job Title</Label>
              <Input
                id="signerTitle"
                value={signatureTitle}
                onChange={(e) => setSignatureTitle(e.target.value)}
                placeholder="Enter your job title"
              />
            </div>
          </div>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <Label>Electronic Signature *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <canvas
                ref={canvasRef}
                className="w-full h-32 border border-muted-foreground/25 rounded cursor-crosshair bg-white"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Sign above using your mouse or touch device
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Legal Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Legal Notice:</strong> By providing your electronic signature, you agree that it has the same legal force and effect as a handwritten signature. This signature will be permanently recorded and associated with your training record for compliance purposes.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!hasSignature || !signatureName.trim() || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Complete Signature
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

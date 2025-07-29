import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ElectronicSignature } from '@/components/ElectronicSignature';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useUserDashboard } from '@/hooks/useProgress';
import { useCourse } from '@/hooks/useCourses';
import { useSignatureWorkflow } from '@/hooks/useSignatures';
import { useToast } from '@/hooks/use-toast';
import { Shield, CheckCircle2, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function Signature() {
  const { id } = useParams<{ id: string }>(); // This could be courseId or enrollmentId
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [showSignatureCapture, setShowSignatureCapture] = useState(false);
  const [enrollmentId, setEnrollmentId] = useState<string>('');
  const [courseTitle, setCourseTitle] = useState<string>('');

  // Get signature type from URL params
  const signatureType = searchParams.get('type') as 'training_completion' | 'acknowledgment' || 'training_completion';
  const customMeaning = searchParams.get('meaning') || undefined;

  // Get user's enrollments to find the enrollment
  const { enrollments } = useUserDashboard();
  const { data: course } = useCourse(id || '');

  // Find enrollment for this course
  useEffect(() => {
    if (id && enrollments.data) {
      // Check if id is already an enrollmentId or if it's a courseId
      const enrollment = enrollments.data.find(e =>
        e.id === id || e.course_id === id
      );

      if (enrollment) {
        setEnrollmentId(enrollment.id);
        setCourseTitle(enrollment.training_courses?.title || course?.title || 'Training Course');
      }
    }
  }, [id, enrollments.data, course]);

  // Get signature workflow data
  const {
    signatures,
    hasCompletionSignature,
    hasAcknowledgmentSignature,
    isSignatureRequired,
    isLoading: signaturesLoading,
    error: signaturesError
  } = useSignatureWorkflow(enrollmentId);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Please log in to access signatures</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (enrollments.isLoading || signaturesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading signature requirements...</p>
        </div>
      </div>
    );
  }

  if (!enrollmentId || signaturesError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">
            {!enrollmentId ? 'Course enrollment not found' : 'Error loading signature data'}
          </p>
          <Button onClick={() => navigate('/catalog')} className="mt-4">
            Back to Catalog
          </Button>
        </div>
      </div>
    );
  }

  // Check if signature is already completed
  const isSignatureCompleted = signatureType === 'training_completion'
    ? hasCompletionSignature
    : hasAcknowledgmentSignature;

  const handleSignatureComplete = (signatureId: string) => {
    toast({
      title: 'Signature Completed',
      description: 'Your electronic signature has been successfully recorded.',
    });

    // Navigate back to course or dashboard
    const returnUrl = searchParams.get('return') || '/dashboard/student';
    navigate(returnUrl);
  };

  const handleCancel = () => {
    const returnUrl = searchParams.get('return') || '/dashboard/student';
    navigate(returnUrl);
  };

  if (showSignatureCapture) {
    return (
      <ElectronicSignature
        enrollmentId={enrollmentId}
        courseTitle={courseTitle}
        signatureType={signatureType}
        customMeaning={customMeaning}
        onSignatureComplete={handleSignatureComplete}
        onCancel={() => setShowSignatureCapture(false)}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Electronic Signature</h1>
          <p className="text-muted-foreground">{courseTitle}</p>
        </div>
      </div>

      {isSignatureCompleted ? (
        /* Signature Already Completed */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Signature Completed
            </CardTitle>
            <CardDescription>
              Your electronic signature for this training has already been recorded.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Signature Details</h3>
              {signatures
                .filter(sig => sig.signature_type === signatureType && sig.is_valid)
                .map(signature => (
                  <div key={signature.id} className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Signed by:</span>
                        <p>{signature.signer_name}</p>
                      </div>
                      <div>
                        <span className="font-medium">Date:</span>
                        <p>{new Date(signature.signed_at).toLocaleString()}</p>
                      </div>
                      {signature.signer_title && (
                        <div>
                          <span className="font-medium">Title:</span>
                          <p>{signature.signer_title}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Type:</span>
                        <p className="capitalize">{signature.signature_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="font-medium">Signature Meaning:</span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {signature.signature_meaning}
                      </p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleCancel} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Signature Required */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Electronic Signature Required
            </CardTitle>
            <CardDescription>
              {signatureType === 'training_completion'
                ? 'Please provide your electronic signature to certify completion of this training course.'
                : 'Please provide your electronic signature to acknowledge receipt of this training material.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Why is a signature required?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Ensures regulatory compliance and audit trail</li>
                <li>• Confirms personal completion of training</li>
                <li>• Provides legal documentation of understanding</li>
                <li>• Maintains GxP (Good Practice) standards</li>
              </ul>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Course Information</h3>
              <p className="text-sm text-muted-foreground">{courseTitle}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Signature Type: {signatureType.replace('_', ' ').toUpperCase()}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setShowSignatureCapture(true)}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                Provide Electronic Signature
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

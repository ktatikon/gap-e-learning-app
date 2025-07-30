import { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { emailVerificationRateLimiter, getClientIP, formatRemainingTime } from '@/lib/rateLimiter';
import { Shield, Mail, CheckCircle2, AlertCircle, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';

export default function EmailVerification() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [resendCooldown, setResendCooldown] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail, resendVerification } = useAuth();
  const { toast } = useToast();

  // Get email from location state or URL params
  const email = location.state?.email || searchParams.get('email') || '';
  const message = location.state?.message || 'Please check your email and click the verification link.';

  // Check for verification token in URL (when user clicks email link)
  const token = searchParams.get('token');
  const type = searchParams.get('type');

  useEffect(() => {
    // If we have a token in the URL, automatically verify
    if (token && type === 'email' && email) {
      handleEmailVerification(token, email);
    }
  }, [token, type, email]);

  const handleEmailVerification = async (verificationToken: string, userEmail: string) => {
    setIsVerifying(true);
    setVerificationStatus('pending');

    try {
      const result = await verifyEmail(verificationToken, userEmail);
      
      if (result.success) {
        setVerificationStatus('success');
        toast({
          title: 'Email Verified Successfully!',
          description: 'Your account has been activated. Welcome to GxP Learning Hub!',
        });
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard/student');
        }, 2000);
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Email verification failed');
        toast({
          title: 'Verification Failed',
          description: result.error || 'Email verification failed. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setVerificationStatus('error');
      const errorMsg = error instanceof Error ? error.message : 'Email verification failed';
      setErrorMessage(errorMsg);
      toast({
        title: 'Verification Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email || !canResend) return;

    // Check rate limiting
    const clientIP = getClientIP();
    if (emailVerificationRateLimiter.isBlocked(clientIP, 'resend-verification')) {
      const remainingTime = emailVerificationRateLimiter.getRemainingTime(clientIP, 'resend-verification');
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatRemainingTime(remainingTime)} before requesting another verification email.`,
        variant: 'destructive',
      });
      return;
    }

    setIsResending(true);
    
    try {
      await resendVerification(email);
      toast({
        title: 'Verification Email Sent',
        description: 'Please check your email for the new verification link.',
      });
      
      // Start cooldown
      setCanResend(false);
      setResendCooldown(60);
      
      const countdown = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      // Record failed attempt for rate limiting
      const clientIP = getClientIP();
      emailVerificationRateLimiter.recordAttempt(clientIP, 'resend-verification');

      toast({
        title: 'Failed to Resend Email',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsResending(false);
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />;
      case 'error':
        return <AlertCircle className="h-16 w-16 text-destructive mx-auto" />;
      default:
        return isVerifying ? (
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
        ) : (
          <Mail className="h-16 w-16 text-primary mx-auto" />
        );
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Email Verified Successfully!';
      case 'error':
        return 'Verification Failed';
      default:
        return isVerifying ? 'Verifying Your Email...' : 'Check Your Email';
    }
  };

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'success':
        return 'Your account has been activated. You will be redirected to your dashboard shortly.';
      case 'error':
        return errorMessage || 'There was an issue verifying your email. Please try again.';
      default:
        return isVerifying 
          ? 'Please wait while we verify your email address...'
          : message;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-white">GxP Learning Hub</h1>
          </div>
        </div>

        <Card className="gxp-card">
          <CardHeader className="text-center">
            <div className="mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-2xl">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription className="text-center">
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {email && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Verification email sent to:
                </p>
                <p className="font-medium text-foreground">{email}</p>
              </div>
            )}

            {verificationStatus === 'pending' && !isVerifying && (
              <div className="space-y-4">
                <div className="text-center text-sm text-muted-foreground">
                  <p>Didn't receive the email? Check your spam folder or</p>
                </div>
                
                <Button
                  onClick={handleResendVerification}
                  disabled={!canResend || isResending}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {canResend ? 'Resend Verification Email' : `Resend in ${resendCooldown}s`}
                    </>
                  )}
                </Button>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <Button
                  onClick={handleResendVerification}
                  disabled={!canResend || isResending}
                  className="w-full gxp-button-primary"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {canResend ? 'Resend Verification Email' : `Resend in ${resendCooldown}s`}
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => navigate('/signup')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Signup
                </Button>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center">
                <Button
                  onClick={() => navigate('/dashboard/student')}
                  className="w-full gxp-button-primary"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}

            {verificationStatus === 'pending' && !isVerifying && (
              <div className="text-center">
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>© 2024 GxP Learning Hub. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

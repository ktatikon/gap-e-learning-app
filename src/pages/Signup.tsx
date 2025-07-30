import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { validatePassword, type SignupData } from '@/lib/auth';
import { signupRateLimiter, getClientIP, formatRemainingTime, initializeCSRF } from '@/lib/rateLimiter';
import { Shield, UserPlus, Mail, Lock, User, Building, Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    employeeId: '',
    department: '',
    jobTitle: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [csrfToken] = useState(() => initializeCSRF());

  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Department options for GxP industries
  const departments = [
    'Quality Assurance',
    'Quality Control',
    'Manufacturing',
    'Research & Development',
    'Regulatory Affairs',
    'Clinical Operations',
    'Validation',
    'Engineering',
    'Information Technology',
    'Human Resources',
    'Training & Development',
    'Other'
  ];

  const handleInputChange = (field: keyof SignupData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate password in real-time
    if (field === 'password') {
      const validation = validatePassword(value);
      setPasswordErrors(validation.errors);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;

    // Check rate limiting
    const clientIP = getClientIP();
    if (signupRateLimiter.isBlocked(clientIP, 'signup')) {
      const remainingTime = signupRateLimiter.getRemainingTime(clientIP, 'signup');
      toast({
        title: 'Too Many Attempts',
        description: `Please wait ${formatRemainingTime(remainingTime)} before trying again.`,
        variant: 'destructive',
      });
      return;
    }

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.employeeId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      toast({
        title: 'Password Requirements Not Met',
        description: passwordValidation.errors.join(', '),
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(formData);
      
      if (result.needsEmailVerification) {
        toast({
          title: 'Account Created Successfully!',
          description: 'Please check your email and click the verification link to activate your account.',
        });
        
        // Navigate to email verification page
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            message: 'Please check your email and click the verification link to activate your account.'
          }
        });
      } else {
        // Unlikely in production, but handle immediate confirmation
        toast({
          title: 'Account Created and Verified!',
          description: 'Welcome to GxP Learning Hub. You can now start your training.',
        });
        navigate('/dashboard/student');
      }
    } catch (error) {
      console.error('Signup error:', error);

      // Record failed attempt for rate limiting
      const clientIP = getClientIP();
      const rateLimitResult = signupRateLimiter.recordAttempt(clientIP, 'signup');

      let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';

      if (rateLimitResult.blocked) {
        errorMessage += ` You have ${rateLimitResult.attemptsRemaining} attempts remaining.`;
      }

      toast({
        title: 'Signup Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-white">GxP Learning Hub</h1>
          </div>
          <p className="text-slate-300 text-lg">
            Create your account to access GxP compliance training
          </p>
        </div>

        <Card className="gxp-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <UserPlus className="h-6 w-6" />
              Create Account
            </CardTitle>
            <CardDescription>
              Join thousands of professionals in GxP compliance training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    <User className="h-4 w-4 inline mr-2" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    <User className="h-4 w-4 inline mr-2" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your work email address"
                  required
                />
              </div>

              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId">
                  <Shield className="h-4 w-4 inline mr-2" />
                  Employee ID *
                </Label>
                <Input
                  id="employeeId"
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  placeholder="Enter your employee ID"
                  required
                />
              </div>

              {/* Department and Job Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">
                    <Building className="h-4 w-4 inline mr-2" />
                    Department
                  </Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    <Briefcase className="h-4 w-4 inline mr-2" />
                    Job Title
                  </Label>
                  <Input
                    id="jobTitle"
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                    placeholder="Enter your job title"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Password *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Create a strong password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {passwordErrors.length > 0 && (
                  <div className="text-sm text-destructive space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index}>• {error}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirm Password *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {confirmPassword && formData.password !== confirmPassword && (
                  <p className="text-sm text-destructive">Passwords do not match</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full gxp-button-primary"
                disabled={isLoading || passwordErrors.length > 0 || formData.password !== confirmPassword}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>© 2024 GxP Learning Hub. All rights reserved.</p>
          <p>Secure • Compliant • Professional</p>
        </div>
      </div>
    </div>
  );
}

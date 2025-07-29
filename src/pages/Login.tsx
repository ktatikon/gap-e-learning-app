import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { validateCredentials, getRoleBasedRoute } from '@/lib/auth';
import { Shield } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    login, 
    incrementLoginAttempts, 
    resetLoginAttempts, 
    lockAccount, 
    loginAttempts, 
    isLocked 
  } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      toast({
        title: "Account Locked",
        description: "Account locked. Admin has been notified.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = validateCredentials(email, password);

    if (user) {
      resetLoginAttempts();
      login(user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      navigate(getRoleBasedRoute(user.role));
    } else {
      incrementLoginAttempts();
      const newAttempts = loginAttempts + 1;
      
      if (newAttempts >= 3) {
        lockAccount();
        toast({
          title: "Account Locked",
          description: "Account locked. Admin has been notified.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Invalid Credentials",
          description: `Invalid email or password. ${3 - newAttempts} attempts remaining.`,
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">GxP Learning Management</CardTitle>
          <CardDescription>
            Sign in to access your training portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLocked}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLocked}
              />
            </div>
            
            {loginAttempts > 0 && !isLocked && (
              <div className="text-sm text-destructive">
                {3 - loginAttempts} attempts remaining
              </div>
            )}
            
            {isLocked && (
              <div className="text-sm text-destructive font-medium">
                Account locked. Admin has been notified.
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full gxp-button-primary" 
              disabled={isLoading || isLocked}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium text-foreground mb-2">Demo Credentials:</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Student:</strong> student@gxp.in / 123456789</p>
              <p><strong>Admin:</strong> admin@gxp.in / 123456789</p>
              <p><strong>Compliance:</strong> compliance@gxp.in / 123456789</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signIn, signUp, signInWithOrcid, resetPassword } from '@/lib/auth';
import { sendWelcomeEmail, sendAuthorWelcomeEmail } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'author' | 'reviewer' | 'editor'>('author');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password reset email sent',
            description: 'Please check your email for instructions to reset your password.',
          });
          setMode('signin');
        }
      } else if (mode === 'signup') {
        const roleConfig = {
          is_editor: role === 'editor',
          is_reviewer: role === 'reviewer' || role === 'editor'
        };
        const { data, error } = await signUp(email, password, fullName, roleConfig);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          // Send welcome email based on role
          if (data.user) {
            try {
              if (role === 'author') {
                await sendAuthorWelcomeEmail(data.user.id, fullName, email);
              } else {
                await sendWelcomeEmail(data.user.id, fullName, email);
              }
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
              // Don't block signup if email fails
            }
          }
          toast({
            title: 'Account created successfully',
            description: 'Please check your email to verify your account and welcome information.',
          });
          setMode('signin');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Signed in successfully',
          });
          navigate('/');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrcidLogin = async () => {
    setLoading(true);
    try {
      // const { error } = await signInWithOrcid();
      const client_id = "APP-GKE87FTH6QV1ZK9D"
      // const redirect = encodeURIComponent("https://ijsdsbackend.onrender.com/auth/orcid")
      const redirect = encodeURIComponent("https://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/auth/orcid")
      // const redirect = encodeURIComponent("https://orcidtest.loca.lt/auth/orcid")
      window.location.href = `https://orcid.org/oauth/authorize?client_id=${client_id}&response_type=code&scope=/authenticate&redirect_uri=${redirect}`
    
      
    } catch (error) {
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
      toast({
        title: 'Error',
        description: 'Failed to sign in with ORCID',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Reset Password'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Enter your credentials to access your account' 
              : mode === 'signup'
              ? 'Create an account to submit articles and access the journal platform'
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mode !== 'forgot-password' && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={handleOrcidLogin}
                disabled={loading}
              >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.947-.422-.947-.947 0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-1.016 5.016-5.344 5.016h-3.9V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.9-1.303 3.9-3.722 0-2.297-1.303-3.722-3.9-3.722h-2.297z"/>
              </svg>
                Sign in with ORCID
              </Button>
            )}
            
            {mode !== 'forgot-password' && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value: 'author' | 'reviewer' | 'editor') => setRole(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="author">Author</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : (
                  mode === 'signin' ? 'Sign In' : 
                  mode === 'signup' ? 'Sign Up' : 
                  'Send Reset Link'
                )}
              </Button>
              
              {mode === 'signin' && (
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode('forgot-password')}
                    className="text-sm"
                  >
                    Forgot your password?
                  </Button>
                </div>
              )}
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                >
                  {mode === 'signin' 
                    ? "Don't have an account? Sign up" 
                    : mode === 'signup'
                    ? 'Already have an account? Sign in'
                    : 'Back to sign in'
                  }
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
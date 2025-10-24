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
import { Eye, EyeOff } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const isConfirmed = searchParams.get('confirmed') === 'true';
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'author' | 'reviewer' | 'editor'>('author');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [signupfields,setSignupField] = useState({
    email:false,
    password: false,
    fullName:false
  })
  const [signinfields,setSigninField] = useState({
    email:false,
    password: false
  })
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
    
    if (isConfirmed) {
      toast({
        title: 'Email confirmed successfully',
        description: 'Your account has been verified. You can now sign in.',
      });
    }
  }, [user, navigate, isConfirmed]);

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
            description: 'Please check your email to confirm your account before signing in.',
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
          const { error } = await signIn(email, password);
          if (error) {
            if (error.message.includes('Email not confirmed')) {
              toast({
                title: 'Email not confirmed',
                description: 'Please check your email and click the confirmation link before signing in.',
                variant: 'destructive',
              });
            } else {
              toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
              });
            }
          } else {
            toast({
              title: 'Signed in successfully',
            });
            navigate('/');
          }
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

  const checkField = (mode) : boolean => {
    if(mode == 'signup'){
    const {email, password,fullName} = signupfields
   if(!email) return true  
   if(!password) return true  
   if(!fullName) return true  
   return false
    }

    if(mode == 'signin'){
      const {email,password} = signinfields
        if(!email) return true  
        if(!password) return true  
        return false
    }
  }

  const validatePassword = (pwd: string, name: string = '') => {
    const errors: string[] = [];
    
    // Check if all numeric
    if (/^\d+$/.test(pwd)) {
      errors.push('Password must include letters and symbols');
    }
    
    // Check if contains full name
    if (name && pwd.toLowerCase().includes(name.toLowerCase())) {
      errors.push('Password cannot contain personal information');
    }
    
    // Check length
    if (pwd.length < 9) {
      errors.push('Password must be at least 9 characters');
    }
    
    // Check for letters and symbols
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    if (!hasLetters || !hasSymbols) {
      errors.push('Password must include letters and symbols');
    }
    
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const authNameField = (e : React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    const regex = /^[a-zA-Z\s]+$/;
    if(regex.test(value) && value.trim().length > 0){
      setSignupField({
        ...signupfields,
        fullName:true
      })
    }else{
      setSignupField({
        ...signupfields,
        fullName:false
      })
    }
    
    // Re-validate password if it exists
    if (password) {
      validatePassword(password, value);
    }
  }
    const authEmailField = (e : React.ChangeEvent<HTMLInputElement>,mode) => {
    setEmail(e.target.value)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(emailRegex.test(email)){
      if(mode == "signup"){
        setSignupField({
        ...signupfields,
        email:true
      })
      }else{
        setSigninField({
        ...signinfields,
        email:true
      })
      }
    }else{
      if(mode == "signup"){
        setSignupField({
        ...signupfields,
        email:false
      })
      }else{
        setSigninField({
        ...signinfields,
        email:false
      })
      }
    }
  }
  const authPasswordField = (e : React.ChangeEvent<HTMLInputElement>,mode) => {
    const pwd = e.target.value;
    setPassword(pwd);
    
    if(mode == "signup"){
      const isValid = validatePassword(pwd, fullName);
      setSignupField({
        ...signupfields,
        password: isValid
      })
    } else {
      // For signin, just check length
      const isValid = pwd.length >= 9;
      setSigninField({
        ...signinfields,
        password: isValid
      })
    }
  }
  

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
                      onChange={(e) => authNameField(e)}
                      required
                    />
                    {!signupfields.fullName ? <p className='text-red-500 text-[10px]'>name should contain only alphabets {signupfields.fullName}</p> : null}
                    
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
                  onChange={(e) => authEmailField(e,mode)}
                  required
                />
                { mode == "signup" ? !signupfields.email ? <p className='text-red-500 text-[10px]'>Please input a correct Email</p> : null : !signinfields.email?<p className='text-red-500 text-[10px]'>Please input a correct Email</p>: null }

              </div>
              
              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => authPasswordField(e,mode)}
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {mode === "signup" && passwordErrors.length > 0 && (
                    <div className="space-y-1">
                      {passwordErrors.map((error, index) => (
                        <p key={index} className='text-red-500 text-[10px]'>{error}</p>
                      ))}
                    </div>
                  )}
                  {mode === "signin" && !signinfields.password && (
                    <p className='text-red-500 text-[10px]'>Password should be at least 9 characters</p>
                  )}
                </div>
              )}
              
              <Button type="submit" className="w-full" disabled={loading || checkField(mode)}>
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
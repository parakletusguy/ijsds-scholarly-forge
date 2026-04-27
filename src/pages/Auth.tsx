import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, signUp, resetPassword } from '@/lib/auth';
import { sendWelcomeEmail, sendAuthorWelcomeEmail } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const isConfirmed = searchParams.get('confirmed') === 'true';
  const reason = searchParams.get('reason');
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, _setRole] = useState<'author' | 'reviewer' | 'editor'>('author');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
    if (isConfirmed) {
      toast({ title: 'Verified', description: 'Account confirmed. You may now sign in.' });
    }
    
    // Immediate scroll to form
    const timer = setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    return () => clearTimeout(timer);
  }, [user, navigate, isConfirmed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Email Sent', description: 'Check your inbox for reset instructions.' });
          setMode('signin');
        }
      } else if (mode === 'signup') {
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          toast({ title: 'Signup Failed', description: error.message, variant: 'destructive' });
        } else {
          refreshAuth(data.profile);
          try {
            if (role === 'author') await sendAuthorWelcomeEmail(data.profile.id, fullName, email);
            else await sendWelcomeEmail(data.profile.id, fullName, email);
          } catch (err) { console.error('Email error:', err); }
          toast({ title: 'Success', description: 'Account created. Welcome to IJSDS.' });
          navigate('/');
        }
      } else {
        const { data, error } = await signIn(email, password);
        if (error) {
          toast({ title: 'Failed', description: error.message, variant: 'destructive' });
        } else {
          refreshAuth(data.profile);
          toast({ title: 'Signed in successfully' });
          navigate('/');
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: 'An unexpected error occurred.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleOrcidLogin = () => {
    setLoading(true);
    const client_id = "APP-GKE87FTH6QV1ZK9D"
    const redirect = encodeURIComponent("https://ijsdsbackend-agewf0h8g5hfawax.switzerlandnorth-01.azurewebsites.net/auth/orcid")
    window.location.href = `https://orcid.org/oauth/authorize?client_id=${client_id}&response_type=code&scope=/authenticate&redirect_uri=${redirect}`
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface antialiased textile-pattern flex flex-col pt-16 md:pt-24">
      <Helmet>
        <title>Social Work and Development Studies - Institutional Access</title>
        <meta name="description" content="Secure entry portal for authors, reviewers, and editors of the International Journal of Social Work and Development Studies." />
      </Helmet>

      <main className="flex-grow flex items-center justify-center px-6 py-8">
        <div className="max-w-xl w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Login Container */}
          <div
            ref={formRef}
            className="bg-surface-container-lowest p-10 md:p-14 shadow-[0px_12px_24px_-4px_rgba(28,28,25,0.06)] border-[0.5px] border-outline-variant/15"
          >
            {reason === 'submit' && (
              <div className="mb-8 p-4 bg-primary/5 border-l-4 border-primary animate-in fade-in slide-in-from-left-4 duration-500">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Submission Requirement</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  To properly track and manage your submitted articles through the peer-review process, please sign in or create an account.
                </p>
              </div>
            )}

            <div className="mb-10">
              <h2 className="font-headline text-2xl font-semibold mb-2">
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
              </h2>
              <p className="text-on-surface-variant text-sm">
                {mode === 'signin' 
                  ? 'Sign in to your account to continue.' 
                  : mode === 'signup' 
                    ? 'Create an account to start submitting and reviewing.' 
                    : 'Enter your email to receive password reset instructions.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="fullName">Full Name</label>
                  <input 
                    className="w-full bg-surface-container-high border-0 border-b border-outline-variant py-4 px-0 transition-all focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/40" 
                    id="fullName" 
                    name="fullName" 
                    placeholder="e.g. Scholar Surname" 
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Field: Institutional Email */}
              <div className="space-y-2">
                <label className="block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="email">Email Address</label>
                <input 
                  className="w-full bg-surface-container-high border-0 border-b border-outline-variant py-4 px-0 transition-all focus:ring-0 focus:border-primary text-on-surface placeholder:text-on-surface-variant/40" 
                  id="email" 
                  name="email" 
                  placeholder="e.g. scholar@academy.edu" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {/* Field: Password */}
              {mode !== 'forgot-password' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="block font-label text-xs font-semibold uppercase tracking-widest text-on-surface-variant" htmlFor="password">Password</label>
                  </div>
                  <div className="relative">
                    <input 
                      className="w-full bg-surface-container-high border-0 border-b border-outline-variant py-4 px-0 transition-all focus:ring-0 focus:border-primary text-on-surface" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••••••" 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button 
                      type="button" 
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 space-y-6">
                <button 
                  className="w-full bg-primary-container hover:bg-primary text-on-primary font-label font-bold py-5 px-8 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed" 
                  type="submit"
                  disabled={loading}
                >
                  <span className="tracking-widest uppercase text-sm">
                    {loading ? 'Authorizing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </span>
                  {!loading && <Lock className="text-lg w-5 h-5" />}
                </button>
                
                <div className="flex flex-col gap-4 text-center">
                  {mode === 'signin' && (
                    <button 
                      type="button"
                      onClick={() => setMode('forgot-password')}
                      className="text-primary text-xs font-semibold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    >
                      Forgotten Credentials?
                    </button>
                  )}
                  
                  <button 
                    type="button"
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest hover:text-primary transition-colors"
                  >
                    {mode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </div>

              {/* SSO Option */}
              {mode !== 'forgot-password' && (
                <div className="pt-8 border-t border-outline-variant/10">
                  <button 
                    type="button" 
                    onClick={handleOrcidLogin}
                    className="w-full border border-outline-variant/30 hover:border-primary transition-all py-4 px-6 flex items-center justify-center gap-3 group"
                  >
                    <svg className="h-5 w-5 text-secondary group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.947-.422-.947-.947 0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-1.016 5.016-5.344 5.016h-3.9V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.9-1.303 3.9-3.722 0-2.297-1.303-3.722-3.9-3.722h-2.297z"/>
                    </svg>
                    <span className="font-label text-xs font-bold uppercase tracking-widest">Connect with ORCID</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 group"
            >
              <span className="font-label text-sm font-bold uppercase tracking-widest border-b border-on-surface pb-1 group-hover:text-primary group-hover:border-primary transition-all">Back to Home</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Auth;
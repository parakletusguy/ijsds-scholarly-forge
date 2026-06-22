import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signIn, signUp, resetPassword } from '@/lib/auth';
import { sendWelcomeEmail, sendAuthorWelcomeEmail } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';

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
    const apiBase = import.meta.env.VITE_API_URL || "https://ijsdsbackend-429660256945.europe-southwest1.run.app";
    const normalizedBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    const redirect = encodeURIComponent(`${normalizedBase}/auth/orcid`);
    window.location.href = `https://orcid.org/oauth/authorize?client_id=${client_id}&response_type=code&scope=/authenticate&redirect_uri=${redirect}`;
  };

  const inputClass = "w-full bg-stone-100 border-0 px-4 py-4 text-stone-900 placeholder:text-stone-400 focus:ring-0 focus:bg-stone-200 transition-colors text-sm font-body outline-none";
  const labelClass = "block text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400 mb-2";
  const modeLabel = mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password';

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#fdf9f5] font-body antialiased">
      <Helmet>
        <title>Institutional Access — IJSDS</title>
        <meta name="description" content="Secure entry portal for authors, reviewers, and editors of the International Journal of Social Work and Development Studies." />
      </Helmet>

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-start">

          {/* Left: masthead column */}
          <div className="md:col-span-4 md:pt-4">
            <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-primary mb-5">
              {mode === 'signin' ? 'Institutional Access' : mode === 'signup' ? 'New Registration' : 'Password Recovery'}
            </p>
            <h2 className="font-headline text-4xl sm:text-5xl font-black text-stone-900 leading-[0.95] tracking-tight mb-6">
              {modeLabel}
            </h2>
            <div className="w-10 h-0.5 bg-primary mb-6" />
            <p className="text-stone-400 text-sm leading-relaxed">
              {mode === 'signin'
                ? 'Access your author dashboard, review assignments, and editorial tools.'
                : mode === 'signup'
                ? 'Join IJSDS to submit research and participate in peer review.'
                : 'We will send recovery instructions to your registered email.'}
            </p>

            <div className="mt-12 pt-8 border-t border-stone-100 space-y-2 hidden md:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-stone-300">Secure access for</p>
              {['Authors', 'Peer Reviewers', 'Editorial Board'].map(r => (
                <div key={r} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  <span className="text-xs text-stone-400">{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form column */}
          <div ref={formRef} className="md:col-span-7 md:col-start-6">
            {reason === 'submit' && (
              <div className="mb-8 p-4 bg-primary/5 border border-primary/20">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Submission Requirement</p>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Sign in or create an account to submit and track manuscripts through peer review.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="fullName">Full Name</label>
                  <input
                    className={inputClass}
                    id="fullName"
                    name="fullName"
                    placeholder="Dr. Scholar Surname"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className={labelClass} htmlFor="email">Email Address</label>
                <input
                  className={inputClass}
                  id="email"
                  name="email"
                  placeholder="scholar@institution.edu"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {mode !== 'forgot-password' && (
                <div className="space-y-1.5">
                  <label className={labelClass} htmlFor="password">Password</label>
                  <div className="relative">
                    <input
                      className={inputClass + " pr-12"}
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
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-primary transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Primary CTA */}
              <div className="pt-3">
                <button
                  className="w-full bg-stone-900 hover:bg-primary text-white font-label font-black py-5 transition-colors duration-300 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed text-xs uppercase tracking-[0.25em]"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Authorizing...' : modeLabel}
                  {!loading && <ArrowRight size={14} />}
                </button>
              </div>

              {/* Secondary links */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'signup' ? 'signin' : mode === 'forgot-password' ? 'signin' : 'signup')}
                  className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                >
                  {mode === 'signup' ? 'Already registered?' : mode === 'forgot-password' ? 'Back to sign in' : 'Create account'}
                </button>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setMode('forgot-password')}
                    className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>

              {/* ORCID */}
              {mode !== 'forgot-password' && (
                <div className="pt-6 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={handleOrcidLogin}
                    className="w-full bg-stone-100 hover:bg-stone-200 transition-colors py-4 px-6 flex items-center justify-center gap-3 group"
                  >
                    <svg className="h-4 w-4 text-stone-500 group-hover:text-stone-700 transition-colors shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.947-.422-.947-.947 0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-1.016 5.016-5.344 5.016h-3.9V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.9-1.303 3.9-3.722 0-2.297-1.303-3.722-3.9-3.722h-2.297z"/>
                    </svg>
                    <span className="font-label text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 group-hover:text-stone-700 transition-colors">Continue with ORCID iD</span>
                  </button>
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Auth;
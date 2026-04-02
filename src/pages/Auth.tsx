import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { signIn, signUp, resetPassword } from '@/lib/auth';
import { sendWelcomeEmail, sendAuthorWelcomeEmail } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, ShieldCheck, GraduationCap, ArrowLeft, ArrowRight, UserPlus, LogIn, KeyRound, Zap, Globe, BookOpen, Layers } from 'lucide-react';

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
  
  const [signupfields, setSignupField] = useState({
    email: null as boolean | null,
    password: null as boolean | null,
    fullName: null as boolean | null
  })
  const [signinfields, setSigninField] = useState({
    email: null as boolean | null,
    password: null as boolean | null
  })
  const [forgotPasswordFields, setForgotPasswordFields] = useState({
    email: null as boolean | null
  })
  
  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/');
    if (isConfirmed) {
      toast({ title: 'Verified', description: 'Account confirmed. You may now sign in.' });
    }
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

  const validatePassword = (pwd: string, name: string = '') => {
    const errors: string[] = [];
    if (/^\d+$/.test(pwd)) errors.push('Include letters and symbols');
    if (name && pwd.toLowerCase().includes(name.toLowerCase())) errors.push('Avoid personal info');
    if (pwd.length < 9) errors.push('Min 9 characters');
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    if (!hasLetters || !hasSymbols) errors.push('Include letters and symbols');
    setPasswordErrors(errors);
    return errors.length === 0;
  };

  const checkField = (m: string) => {
    if (m === 'signup') return !signupfields.email || !signupfields.password || !signupfields.fullName;
    if (m === 'signin') return !signinfields.email || !signinfields.password;
    if (m === 'forgot-password') return !forgotPasswordFields.email;
    return true;
  }

  const inputClasses = "bg-white border-border/20 rounded-none focus:border-primary transition-all font-body h-14 text-lg lg:text-xl";
  const labelClasses = "font-headline font-black text-[11px] uppercase tracking-[0.4em] text-foreground/30 mb-3 block italic";

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/5 relative overflow-hidden px-4 font-body">
      <Helmet>
        <title>Auth IJSDS — Scholarly Registry Access</title>
        <meta name="description" content="Secure entry portal for authors, reviewers, and editors of the International Journal of Social Work and Development Studies." />
      </Helmet>

      {/* Dramatic Background Architecture */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[120px] opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-secondary/5 rounded-full -ml-32 -mb-32 blur-[100px] opacity-30"></div>
      
      {/* Structural Accents */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 opacity-10" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 opacity-5" style={{ clipPath: 'circle(50% at 100% 100%)' }}></div>
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-border/10 overflow-hidden min-h-[850px] relative z-10 animate-fade-in">
        
        {/* Phase-A Visual Identity Side (lg: 5 cols) */}
        <div className="lg:col-span-5 bg-foreground text-white p-12 md:p-20 lg:p-24 flex flex-col justify-between relative group overflow-hidden">
          {/* Abstract Texture Overlay */}
          <div className="absolute inset-0 bg-white opacity-5 -z-0 group-hover:scale-110 transition-transform duration-1000" style={{ clipPath: 'polygon(70% 0, 100% 0, 100% 30%)' }}></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary/20 to-transparent -z-0"></div>
          
          <div className="relative z-10">
             <div className="mb-20">
                <div className="flex items-center gap-4 mb-10">
                   <div className="h-0.5 w-12 bg-secondary group-hover:w-20 transition-all duration-700"></div>
                   <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-white/40">Secure Identity Portal</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black font-headline uppercase tracking-tighter leading-[0.8] mb-12">
                  Initiative <br/><span className="text-secondary italic">Afrique</span> <br/>Registry.
                </h2>
                <p className="text-2xl font-body italic text-white/40 leading-relaxed max-w-sm border-l-4 border-primary/40 pl-8">
                  "Advancing the next generation of African multicisciplinary research excellence."
                </p>
             </div>

             <div className="space-y-16">
                <div className="flex gap-8 group/stat">
                   <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-primary border border-white/10 group-hover/stat:bg-primary group-hover/stat:text-white transition-all shadow-inner">
                      <ShieldCheck size={28} />
                   </div>
                   <div className="flex flex-col justify-center">
                      <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.3em] mb-2 text-white/60">Peer Integrity Layer</h4>
                      <p className="text-sm text-white/20 font-body italic">Double-blind protocol verification for all manuscripts.</p>
                   </div>
                </div>
                <div className="flex gap-8 group/stat">
                   <div className="w-14 h-14 bg-white/5 flex items-center justify-center text-secondary border border-white/10 group-hover/stat:bg-secondary group-hover/stat:text-white transition-all shadow-inner">
                      <GraduationCap size={28} />
                   </div>
                   <div className="flex flex-col justify-center">
                      <h4 className="font-headline font-black text-[11px] uppercase tracking-[0.3em] mb-2 text-white/60">Global Impact Node</h4>
                      <p className="text-sm text-white/20 font-body italic">Open-access dissemination to maximize scholar visibility.</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="relative z-10 pt-12 border-t border-white/5 flex items-center justify-between">
              <span className="font-headline font-black text-[10px] uppercase tracking-[0.5em] text-white/20">IJSDS — V.04 ARCHIVE</span>
              <Globe size={16} className="text-white/10 group-hover:text-secondary transition-colors" />
          </div>
        </div>

        {/* Phase-B Content Intake Side (lg: 7 cols) */}
        <div className="lg:col-span-7 p-12 md:p-20 lg:p-32 flex flex-col justify-center bg-white relative overflow-hidden">
           {/* Form Corner Motif */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 -z-0" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }}></div>
           
           <div className="max-w-[100%] mx-auto relative z-10">
              <div className="mb-20 text-center md:text-left">
                 <div className="flex items-center gap-4 mb-4 justify-center md:justify-start">
                    <div className="h-0.5 w-10 bg-primary"></div>
                    <span className="font-headline font-black text-[9px] uppercase tracking-[0.5em] text-foreground/20">Registry Entry Protocols</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-headline font-black uppercase tracking-tighter mb-4 leading-none">
                    {mode === 'signin' ? 'Authorized' : mode === 'signup' ? 'Initiate' : 'Recall'}<br/>
                    <span className="text-primary italic">{mode === 'signin' ? 'Access' : mode === 'signup' ? 'Profile' : 'Registry'}</span>
                 </h1>
                 <p className="text-2xl font-body italic text-foreground/30 leading-snug">
                   {mode === 'signin' ? 'Sign in to access your scholar dashboard.' : mode === 'signup' ? 'Create your institutional profile today.' : 'Authorize registry recovery via institutional email.'}
                 </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                 {mode === 'signup' && (
                   <div className="space-y-10 animate-fade-in">
                     <div className="space-y-2">
                       <Label htmlFor="fullName" className={labelClasses}>Scholarly Full Name *</Label>
                       <Input id="fullName" value={fullName} placeholder="Format: Surname Firstname" className={inputClasses} onChange={(e) => {
                         const val = e.target.value; setFullName(val);
                         setSignupField(prev => ({...prev, fullName: /^[a-zA-Z\s]+$/.test(val) && val.trim().length > 0}));
                       }} required />
                       {signupfields.fullName === false && <p className='text-primary text-[10px] font-bold uppercase tracking-tight mt-2 italic'>Alphabetic characters only</p>}
                     </div>
                     
                     <div className="space-y-2">
                       <Label htmlFor="role" className={labelClasses}>Registry Mandate</Label>
                       <Select value={role} onValueChange={(value: 'author') => setRole(value)}>
                         <SelectTrigger className={inputClasses + " text-foreground/70"}>
                           <SelectValue placeholder="Select Designation" />
                         </SelectTrigger>
                         <SelectContent className="rounded-none border-border/10 font-headline font-black uppercase text-xs tracking-widest">
                           <SelectItem value="author">Author / Fellow</SelectItem>
                           <SelectItem value="reviewer" disabled>Reviewer (Invite Only)</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                 )}
                 
                 <div className="space-y-2">
                   <Label htmlFor="email" className={labelClasses}>Institutional Email Architecture *</Label>
                   <Input id="email" type="email" value={email} placeholder="fellow@institution.org" className={inputClasses} onChange={(e) => {
                     const val = e.target.value; setEmail(val);
                     const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
                     if (mode === 'signup') setSignupField(p => ({...p, email: valid}));
                     else if (mode === 'signin') setSigninField(p => ({...p, email: valid}));
                     else setForgotPasswordFields({email: valid});
                   }} required />
                 </div>
                 
                 {mode !== 'forgot-password' && (
                   <div className="space-y-4">
                     <div className="flex justify-between items-center">
                       <Label htmlFor="password" className={labelClasses}>Secure Registry Keyword *</Label>
                       {mode === 'signin' && (
                          <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-headline font-black uppercase tracking-[0.3em] text-primary hover:text-secondary transition-colors underline decoration-primary/20 hover:decoration-secondary/50 underline-offset-4">
                             Recall Access?
                          </button>
                       )}
                     </div>
                     <div className="relative">
                       <Input id="password" type={showPassword ? "text" : "password"} value={password} placeholder="••••••••••••" className={inputClasses + " pr-16"} onChange={(e) => {
                         const val = e.target.value; setPassword(val);
                         if (mode === 'signup') {
                           const valid = validatePassword(val, fullName);
                           setSignupField(p => ({...p, password: valid}));
                         } else {
                           setSigninField(p => ({...p, password: val.length >= 9}));
                         }
                       }} required />
                       <button type="button" className="absolute right-6 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-primary transition-colors h-10 w-10 flex items-center justify-center p-0" onClick={() => setShowPassword(!showPassword)}>
                         {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                       </button>
                     </div>
                     {mode === 'signup' && passwordErrors.length > 0 && (
                       <div className="pt-4 space-y-1">
                          {passwordErrors.map((err, i) => <p key={i} className='text-primary text-[10px] font-black uppercase tracking-tight italic border-l-2 border-primary/20 pl-4 py-1'>• {err}</p>)}
                       </div>
                     )}
                   </div>
                 )}
                 
                 <div className="pt-10 space-y-10">
                    <button 
                      type="submit" 
                      disabled={loading || checkField(mode)} 
                      className="w-full bg-foreground text-white py-10 px-12 group relative overflow-hidden font-headline font-black text-xs uppercase tracking-[0.5em] transition-all disabled:opacity-50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-primary"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-6">
                         {loading ? 'Authorizing Registry...' : (mode === 'signin' ? 'Verify Entry' : mode === 'signup' ? 'Initiate Profile' : 'Dispatch Recall')}
                         <ArrowRight size={20} className="group-hover:translate-x-3 transition-transform" />
                      </span>
                      <div className="absolute inset-0 bg-white translate-x-full group-hover:translate-x-0 transition-transform duration-700 opacity-10"></div>
                    </button>

                    {mode !== 'forgot-password' && (
                      <div className="space-y-10">
                        <div className="relative py-4 flex items-center gap-6">
                           <div className="h-px flex-grow bg-border/20"></div>
                           <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] text-foreground/10 italic">Institutional SSO</span>
                           <div className="h-px flex-grow bg-border/20"></div>
                        </div>

                        <button 
                          type="button" 
                          onClick={handleOrcidLogin} 
                          disabled={loading}
                          className="w-full border-2 border-border/10 hover:border-secondary transition-all py-10 px-12 font-headline font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-6 group/idp bg-secondary/5"
                        >
                           <div className="w-10 h-10 bg-white shadow-xl flex items-center justify-center group-hover/idp:scale-110 transition-transform">
                              <svg className="h-6 w-6 text-secondary" viewBox="0 0 24 24" fill="currentColor">
                                 <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947 0 .525-.422.947-.947.947-.525 0-.947-.422-.947-.947 0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-1.016 5.016-5.344 5.016h-3.9V7.416zm1.444 1.303v7.444h2.297c2.359 0 3.9-1.303 3.9-3.722 0-2.297-1.303-3.722-3.9-3.722h-2.297z"/>
                              </svg>
                           </div>
                           ORCID Registry Direct
                        </button>
                      </div>
                    )}
                 </div>

                 <div className="pt-12 text-center border-t border-border/10">
                    <button 
                      type="button" 
                      onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')} 
                      className="font-headline font-black text-xs uppercase tracking-[0.4em] text-foreground hover:text-primary transition-all flex items-center gap-6 mx-auto group/toggle"
                    >
                       {mode === 'signin' ? (
                         <>Unregistered? <span className="text-secondary italic underline decoration-secondary/30 group-hover:decoration-secondary">Initiate Legacy</span></>
                       ) : (
                         <><ArrowLeft size={16} className="group-hover/toggle:-translate-x-2 transition-transform" /> Back to Entry</>
                       )}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
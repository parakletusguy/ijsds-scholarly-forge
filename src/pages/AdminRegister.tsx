import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { signUp } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/emailService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export const AdminRegister = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  const navigate = useNavigate();
  const { user, refreshAuth } = useAuth();

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) + ' GMT'
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signUpError } = await signUp(email, password, fullName);
      if (signUpError) {
        setError(signUpError.message || 'Registration failed. Please try again.');
      } else {
        refreshAuth(data.profile);
        try {
          await sendWelcomeEmail(data.profile.id, fullName, email);
        } catch (err) {
          console.error('Welcome email error:', err);
        }
        toast({ title: 'Account Created', description: 'Welcome to IJSDS administration.' });
        navigate('/admin');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-body">
      <Helmet>
        <title>Admin Registration — IJSDS</title>
        <meta name="description" content="Create an administrative account for the International Journal of Social Work and Development Studies." />
      </Helmet>

      <main className="flex h-screen w-full overflow-hidden bg-[#0d1117]">

        {/* ── LEFT PANEL — Journal Identity ───────────────────────────────────── */}
        <section className="hidden lg:flex w-[52%] relative flex-col justify-between overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop')`,
              filter: 'grayscale(30%)',
            }}
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0d1117]/85 via-[#0d1117]/60 to-[#1a2332]/80" />

          {/* Top-left: Journal monogram */}
          <div className="relative z-10 p-12">
            <div className="w-12 h-12 border border-[#c9a96e]/50 flex items-center justify-center mb-8">
              <span className="text-[#c9a96e] text-sm font-bold tracking-tight">IJ</span>
            </div>
            <span className="block text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase">
              International Journal
            </span>
            <span className="block text-white/30 text-[10px] tracking-widest mt-1 uppercase">
              Admin Setup
            </span>
          </div>

          {/* Center: Quote / descriptor */}
          <div className="relative z-10 px-12 pb-8">
            <blockquote className="border-l-2 border-[#c9a96e]/60 pl-6">
              <p className="text-white/70 text-sm leading-relaxed italic font-light max-w-xs">
                "Advancing scholarly discourse in social work and development studies across Africa and beyond."
              </p>
            </blockquote>
          </div>

          {/* Bottom: Timestamp */}
          <div className="relative z-10 px-12 pb-10 flex items-baseline justify-between">
            <span className="text-white/30 text-[10px] font-medium tracking-widest uppercase">
              IJSDS · Scholarly Portal
            </span>
            <div className="flex items-baseline gap-4 text-white/25 text-[10px] font-medium tracking-widest uppercase">
              <span>{currentDate}</span>
              <span className="w-px h-3 bg-white/20" />
              <span>{currentTime}</span>
            </div>
          </div>
        </section>

        {/* ── RIGHT PANEL — Registration Form ─────────────────────────────────── */}
        <section className="w-full lg:w-[48%] bg-[#0d1117] flex flex-col items-center justify-center px-8 relative overflow-hidden">

          {/* Subtle background watermark (mobile only) */}
          <div className="absolute lg:hidden opacity-[0.03] select-none pointer-events-none z-0">
            <span className="text-[200px] font-black tracking-tighter text-white">IJ</span>
          </div>

          {/* Subtle noise texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')" }}
          />

          <div className="w-full max-w-[340px] z-10">

            {/* Monogram */}
            <div className="mb-10 w-10 h-10 border border-[#c9a96e]/40 flex items-center justify-center">
              <span className="text-[#c9a96e] text-xs font-bold tracking-tight">IJ</span>
            </div>

            {/* Header */}
            <header className="mb-10 space-y-2">
              <h1 className="text-white text-2xl font-medium tracking-tight">
                Administrator Setup
              </h1>
              <p className="text-white/40 text-[12px] font-medium leading-relaxed">
                Create your administrative account for the IJSDS portal.
              </p>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Error banner */}
              {error && (
                <div
                  className="bg-red-500/10 border border-red-500/30 rounded-[3px] px-4 py-3"
                  role="alert"
                >
                  <p className="text-red-400 text-[12px] font-medium">{error}</p>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <label
                  className="block text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  placeholder="e.g. Dr. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={loading}
                  className="w-full bg-transparent border-b border-white/10 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c9a96e]/60 transition-colors duration-200"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label
                  className="block text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@ijsds.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  className="w-full bg-transparent border-b border-white/10 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c9a96e]/60 transition-colors duration-200"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label
                  className="block text-white/40 text-[10px] font-bold uppercase tracking-[0.18em]"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full bg-transparent border-b border-white/10 py-3 pr-10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#c9a96e]/60 transition-colors duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#c9a96e] hover:bg-[#b8955a] disabled:opacity-50 disabled:cursor-not-allowed text-[#0d1117] font-bold py-4 px-6 text-[12px] tracking-[0.1em] uppercase transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-[#0d1117]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creating Account…</span>
                    </>
                  ) : (
                    <span>Create Admin Account</span>
                  )}
                </button>
              </div>

              {/* Switch to login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="text-white/30 text-[11px] font-medium hover:text-[#c9a96e] transition-colors tracking-wider"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>

            {/* Footer */}
            <footer className="mt-16 text-center">
              <p className="text-white/15 text-[11px] font-medium tracking-wide">
                IJSDS Admin Portal · Authorized Personnel Only
              </p>
            </footer>
          </div>
        </section>

      </main>
    </div>
  );
};

export default AdminRegister;

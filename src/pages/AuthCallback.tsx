import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '@/lib/apiClient';
import { getCurrentUser } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      setToken(token);
      
      getCurrentUser().then(profile => {
        if (profile) {
          refreshAuth(profile);
          toast({
            title: "Signed in",
            description: "You're signed in with ORCID.",
          });
          navigate('/dashboard');
        } else {
          setError("Failed to retrieve profile data.");
          toast({
            title: "Sign-in failed",
            description: "We couldn't load your profile. Please try again.",
            variant: "destructive"
          });
          navigate('/auth');
        }
      }).catch(err => {
        console.error("Auth callback error:", err);
        setError("Something went wrong while signing you in.");
        navigate('/auth');
      });
    } else {
      setError("No authentication token provided.");
      navigate('/auth');
    }
  }, [searchParams, navigate, refreshAuth]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffdfa] font-body">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
      <h2 className="font-headline text-2xl font-bold text-stone-900 tracking-tight mb-2">
        {error ? "Sign-in failed" : "Signing you in"}
      </h2>
      <p className="text-stone-400 text-xs font-bold uppercase tracking-[0.2em]">
        {error ? error : "Just a moment..."}
      </p>
    </div>
  );
};

export default AuthCallback;

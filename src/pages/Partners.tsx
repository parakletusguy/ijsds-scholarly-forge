import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Globe, ShieldCheck, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

export const Partners = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<{ is_admin: boolean }>({ is_admin: false });

  useEffect(() => {
    fetchUserRole();
    fetchPartners();
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;
    try {
      const { data: profile, error } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
      if (error) throw error;
      if (profile) setUserRole(profile);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('partners').select('*').eq('is_active', true).order('display_order', { ascending: true });
      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface selection:bg-primary-fixed selection:text-on-primary-fixed">
      <Helmet>
        <title>Scholarly Partners | IJSDS</title>
        <meta name="description" content="IJSDS collaborates with leading academic institutions, NGOs, and professional bodies to bridge the gap between social research and African development." />
      </Helmet>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <header className="max-w-screen-2xl mx-auto px-8 md:px-12 mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <div className="lg:col-span-7">
              <p className="font-label text-primary font-semibold tracking-[0.2em] uppercase mb-4">Global Collaboration</p>
              <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-on-surface mb-8">
                Scholarly <br/><span className="italic text-primary-container">Partners</span>
              </h1>
              <div className="max-w-xl">
                <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
                  IJSDS collaborates with leading academic institutions, NGOs, and professional bodies to bridge the gap between social research and African development. Our partnerships foster multidisciplinary synergy and archival excellence.
                </p>
              </div>
              {userRole.is_admin && (
                <div className="mt-12">
                  <Button onClick={() => navigate('/partners/admin')} className="bg-foreground hover:bg-primary text-white font-headline font-black uppercase text-[10px] tracking-widest px-10 py-8 h-auto shadow-2xl rounded-none transition-all group">
                    <ShieldCheck className="mr-3 group-hover:rotate-12 transition-transform" size={16} /> Manage Institutional Network
                  </Button>
                </div>
              )}
            </div>
            <div className="lg:col-span-5 relative group">
              <div className="absolute -top-12 -left-12 scholar-bg-pattern w-full h-full z-0 opacity-20"></div>
              <div className="relative z-10 w-full aspect-[4/5] bg-surface-container-high border border-outline-variant/20 overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1523240715181-e2049e39268f?auto=format&fit=crop&q=80&w=1200" 
                  alt="Academic Collaboration" 
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply opacity-30"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Institutional Partner Section */}
        <section className="bg-surface-container-low py-32 overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-8 md:px-12">
            <div className="flex flex-col md:flex-row items-start gap-16">
              <div className="md:w-1/3">
                <h2 className="font-headline text-3xl font-bold mb-6">Institutional <br/>Network</h2>
                <div className="h-px w-24 bg-primary mb-6"></div>
                <p className="font-label text-sm uppercase tracking-widest text-on-surface-variant">Active Collaborations {new Date().getFullYear()}</p>
              </div>
              
              <div className="md:w-2/3 grid grid-cols-1 gap-12">
                {loading ? (
                  <div className="h-80 bg-surface animate-pulse border-t-4 border-primary"></div>
                ) : partners.length > 0 ? (
                  partners.map((partner) => (
                    <div 
                      key={partner.id} 
                      className="bg-surface p-12 md:p-20 shadow-[0px_12px_24px_-4px_rgba(28,28,25,0.06)] relative border-t-4 border-primary group cursor-pointer"
                      onClick={() => partner.website_url && window.open(partner.website_url, '_blank')}
                    >
                      <Building2 className="absolute top-8 right-8 text-6xl text-primary-fixed-dim opacity-20 group-hover:opacity-40 transition-opacity" size={64} />
                      <h3 className="font-headline text-4xl mb-2 text-primary">{partner.name}</h3>
                      <p className="font-body text-xl text-on-surface-variant italic mb-12">
                        {partner.description || "Partner dedicated to the advancement of social research and regional development."}
                      </p>
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-surface-container-highest flex items-center justify-center">
                          {partner.logo_url ? (
                            <img src={partner.logo_url} alt={partner.name} className="max-w-[70%] max-h-[70%] object-contain" />
                          ) : (
                            <Globe className="text-primary text-3xl" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface uppercase tracking-widest text-xs">Scholarly Node</p>
                          <p className="text-on-surface-variant text-sm uppercase tracking-wider">Active Partner</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-surface p-12 md:p-20 shadow-[0px_12px_24px_-4px_rgba(28,28,25,0.06)] relative border-t-4 border-primary">
                    <Building2 className="absolute top-8 right-8 text-6xl text-primary-fixed-dim opacity-20" size={64} />
                    <h3 className="font-headline text-4xl mb-2 text-primary">Establishing Networks</h3>
                    <p className="font-body text-xl text-on-surface-variant italic mb-12">We are currently formalizing our global institutional partnerships to enhance academic exchange and regional impact.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Partnership Pillars */}
        <section className="py-32">
          <div className="max-w-screen-2xl mx-auto px-8 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-outline-variant/30">
              <div className="py-16 md:pr-12 md:border-r border-outline-variant/30 group">
                <Users className="text-primary mb-6 text-4xl w-10 h-10" />
                <h4 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Institutional Synergy</h4>
                <p className="text-on-surface-variant leading-relaxed">Co-host high-impact conferences and collaborative research symposiums that set the agenda for social development.</p>
              </div>
              <div className="py-16 md:px-12 md:border-r border-outline-variant/30 group">
                <Globe className="text-primary mb-6 text-4xl w-10 h-10" />
                <h4 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Knowledge Exchange</h4>
                <p className="text-on-surface-variant leading-relaxed">Share specialized academic resources and maintain prestigious scholarly digital archives for future generations.</p>
              </div>
              <div className="py-16 md:pl-12 group">
                <ShieldCheck className="text-primary mb-6 text-4xl w-10 h-10" />
                <h4 className="font-headline text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Development Impact</h4>
                <p className="text-on-surface-variant leading-relaxed">Bridge academic excellence with field-level societal implementation to create measurable sustainable change.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-screen-xl mx-auto px-8 mb-24">
          <div className="relative bg-on-surface p-12 md:p-24 text-surface overflow-hidden group">
            <div className="absolute inset-0 scholar-bg-pattern opacity-10"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="font-label text-primary-fixed-dim font-bold tracking-[0.3em] uppercase mb-6">Collaborative Advancement</p>
                <h2 className="font-headline text-5xl md:text-6xl font-bold tracking-tight mb-8">Become a Scholarly Partner</h2>
                <p className="text-xl text-surface-container-highest opacity-90 leading-relaxed mb-12">
                  Join a network of excellence dedicated to the scientific advancement of social work and sustainable development globally.
                </p>
                <button 
                  onClick={() => navigate('/contact')}
                  className="bg-primary-container px-10 py-5 text-on-primary font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all"
                >
                  Initiate Collaboration Protocol
                </button>
              </div>
              <div className="hidden lg:block">
                <div className="w-full aspect-square bg-surface-container-highest/20 border border-white/10 flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 scholar-bg-pattern opacity-10"></div>
                   <Globe className="w-40 h-40 text-white/5" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pull-Quote Scholarly Accent */}
        <section className="max-w-screen-md mx-auto px-8 py-24 text-center">
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="h-px bg-primary w-1/5"></div>
            <div className="h-px bg-primary w-1/5 opacity-30"></div>
          </div>
          <p className="font-headline text-3xl font-semibold italic text-on-surface leading-snug">
            "Partnership is the vessel through which academic theory transforms into sustainable social development."
          </p>
          <div className="flex justify-center items-center gap-4 mt-8">
            <div className="h-px bg-primary w-1/5 opacity-30"></div>
            <div className="h-px bg-primary w-1/5"></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Partners;
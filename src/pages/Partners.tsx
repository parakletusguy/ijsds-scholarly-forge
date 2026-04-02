import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Mail, Users, HandHeart, Share2, Globe, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader, ContentSection } from '@/components/layout/PageElements';

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
    <div className="pb-32 bg-secondary/5 min-h-screen font-body">
      <PageHeader 
        title="Scholarly" 
        subtitle="Partners" 
        accent="Global Collaboration"
        description="IJSDS collaborates with leading academic institutions, NGOs, and professional bodies to bridge the gap between social research and African development. Our partnerships foster multidisciplinary synergy and archival excellence."
      />

      <ContentSection>
        {userRole.is_admin && (
          <div className="flex justify-end mb-16">
            <Button onClick={() => navigate('/partners/admin')} className="bg-foreground hover:bg-primary text-white font-headline font-black uppercase text-[10px] tracking-widest px-10 py-8 h-auto shadow-2xl rounded-none transition-all group">
               <ShieldCheck className="mr-3 group-hover:rotate-12 transition-transform" size={16} /> Manage Institutional Network
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-80 bg-muted/20 animate-pulse border border-border/10"></div>
            ))}
          </div>
        ) : partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {partners.map((partner) => (
              <div 
                key={partner.id} 
                className="group relative bg-white p-12 border border-border/20 hover:border-primary/40 transition-all hover:shadow-2xl overflow-hidden cursor-pointer flex flex-col h-full"
                onClick={() => partner.website_url && window.open(partner.website_url, '_blank')}
              >
                {/* Afrocentric Corner Accent */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 transition-transform group-hover:scale-110 group-hover:bg-primary/10" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}></div>
                
                <div className="mb-10 flex items-center justify-center h-40 relative">
                   <div className="absolute inset-0 bg-secondary/5 rounded-full scale-75 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="max-w-[70%] max-h-full object-contain relative z-10 filter group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Building2 className="h-16 w-16 text-foreground/10 group-hover:text-primary/30 transition-colors" />
                  )}
                </div>

                <div className="mt-auto">
                    <div className="h-0.5 w-12 bg-secondary mb-8 transition-all group-hover:w-full duration-700"></div>
                    <span className="font-headline font-black text-[9px] uppercase tracking-widest text-primary mb-2 block">Institutional Partner</span>
                    <h3 className="font-headline font-black text-2xl uppercase tracking-tighter mb-4 leading-tight group-hover:text-primary transition-colors">{partner.name}</h3>
                    <p className="font-body text-foreground/40 text-sm italic mb-8 leading-relaxed line-clamp-3">
                      {partner.description || "Partner dedicated to the advancement of social research and regional development in the African context."}
                    </p>
                    
                    {partner.website_url && (
                      <div className="flex items-center gap-3 font-headline font-black text-[10px] uppercase tracking-widest text-foreground group-hover:text-secondary transition-colors">
                        Visit Institution Portal <ArrowRight className="h-3 w-3 group-hover:translate-x-2 transition-transform" />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border border-dashed border-border/20 max-w-4xl mx-auto bg-white/50">
            <Users className="h-20 w-20 mx-auto text-foreground/5 mb-8" />
            <h3 className="font-headline font-black text-3xl uppercase tracking-tighter mb-4">Establishing Scholarly Networks</h3>
            <p className="font-body text-foreground/30 italic max-w-md mx-auto">We are currently formalizing our global institutional partnerships to enhance academic exchange and regional impact.</p>
          </div>
        )}
      </ContentSection>

      {/* Become a Partner CTA — High Fidelity Afrocentric Motif */}
      <ContentSection dark>
        <div className="bg-foreground text-white p-16 md:p-32 relative overflow-hidden group shadow-2xl border border-white/5">
          {/* Complex Geometric Accents */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-[0.02] -rotate-12 translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 opacity-20 pointer-events-none" style={{ clipPath: 'circle(50% at 0 100%)' }}></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 border-4 border-primary/20 rounded-full opacity-10 pointer-events-none"></div>

          <div className="max-w-6xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-24">
               <div className="w-full lg:w-3/5 text-center lg:text-left">
                  <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/10 border border-white/10 mb-8">
                     <Share2 size={14} className="text-secondary" />
                     <span className="font-headline font-black text-[10px] uppercase tracking-widest text-white/60">Collaborative Advancement</span>
                  </div>
                  <h2 className="text-5xl md:text-8xl font-black font-headline uppercase tracking-tighter leading-[0.85] mb-10">
                    Become a <br/><span className="text-secondary italic">Scholarly Partner</span>
                  </h2>
                  <p className="text-xl md:text-2xl font-body italic text-white/50 leading-relaxed mb-16 max-w-2xl">
                    Join a network of excellence dedicated to the scientific advancement of social work and sustainable development across the African continent.
                  </p>
                  <Button onClick={() => navigate('/contact')} size="lg" className="bg-primary hover:bg-secondary text-white font-headline font-black uppercase text-xs tracking-[0.3em] px-16 py-10 h-auto rounded-none shadow-2xl transition-all group overflow-hidden relative">
                    <span className="relative z-10">Initiate Collaboration Protocol</span>
                    <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10"></div>
                  </Button>
               </div>

               <div className="w-full lg:w-2/5 grid grid-cols-1 gap-12">
                  {[
                    { icon: <Users className="text-primary" />, title: "Institutional Synergy", desc: "Co-host high-impact conferences and collaborative research symposiums." },
                    { icon: <Share2 className="text-secondary" />, title: "Knowledge Exchange", desc: "Share specialized academic resources and scholarly digital archives." },
                    { icon: <HandHeart className="text-primary" />, title: "Development Impact", desc: "Bridge academic excellence with field-level societal implementation." }
                  ].map((feat, idx) => (
                    <div key={idx} className="flex gap-8 items-start p-8 bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/feat shadow-lg">
                       <div className="w-16 h-16 bg-white/10 flex items-center justify-center shrink-0 rounded-none border border-white/20 group-hover/feat:bg-foreground group-hover/feat:border-primary transition-all shadow-inner">
                          {feat.icon}
                       </div>
                       <div>
                          <h4 className="font-headline font-black text-lg uppercase tracking-tight mb-2 group-hover/feat:text-secondary transition-colors">{feat.title}</h4>
                          <p className="font-body text-white/30 text-sm italic leading-relaxed">{feat.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* Digital Heritage Branding */}
      <ContentSection>
        <div className="max-w-4xl mx-auto py-24 text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
               <div className="h-px w-12 bg-border"></div>
               <Globe className="text-foreground/20" size={20} />
               <div className="h-px w-12 bg-border"></div>
            </div>
           <p className="font-headline text-[10px] font-bold uppercase tracking-[0.5em] text-foreground/20 leading-loose">
             IJSDS — Partnering for a Resilient and Scholarly Africa. <br/>
             Established 2024 — Continental Research Network.
           </p>
        </div>
      </ContentSection>
    </div>
  );
};
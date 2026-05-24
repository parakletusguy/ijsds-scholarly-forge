import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Globe, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import * as partnersService from '@/lib/partnersService';

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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchPartners();
    if (user) fetchUserRole();
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data } = await supabase.from('profiles').select('is_admin').eq('id', user!.id).single();
      if (data) setIsAdmin(data.is_admin);
    } catch {}
  };

  const fetchPartners = async () => {
    try {
      const data = await partnersService.getPartners();
      setPartners(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 bg-stone-50 min-h-screen font-body text-stone-900">
      <Helmet>
        <title>Partners — IJSDS</title>
        <meta name="description" content="IJSDS collaborates with academic institutions, NGOs, and professional bodies to support social research and development." />
      </Helmet>

      <header className="pt-20 pb-12 px-8 border-b border-stone-100 bg-white">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors mb-4 inline-block">
            ← Home
          </Link>
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div>
              <h1 className="text-3xl font-headline font-light tracking-tight text-stone-900">
                Our <span className="italic text-primary">Partners</span>
              </h1>
              <p className="mt-3 text-stone-500 text-sm leading-relaxed max-w-xl">
                IJSDS works with institutions, NGOs, and professional bodies dedicated to advancing social research and sustainable development.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => navigate('/partners/admin')}
                className="text-[10px] font-bold uppercase tracking-widest border border-stone-200 px-4 py-2 text-stone-600 hover:border-primary hover:text-primary transition-colors"
              >
                Manage Partners
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-16 space-y-16">

        {/* Partners grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 bg-white border border-stone-100 animate-pulse" />
              ))}
            </div>
          ) : partners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className={`bg-white border border-stone-100 p-7 flex flex-col hover:border-stone-300 hover:shadow-sm transition-all group ${partner.website_url ? 'cursor-pointer' : ''}`}
                  onClick={() => partner.website_url && window.open(partner.website_url, '_blank')}
                >
                  {/* Logo */}
                  <div className="h-14 flex items-center mb-5">
                    {partner.logo_url ? (
                      <img src={partner.logo_url} alt={partner.name} className="max-h-full max-w-[160px] object-contain" />
                    ) : (
                      <div className="w-12 h-12 bg-stone-100 flex items-center justify-center">
                        <Globe size={20} className="text-stone-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-stone-900 mb-2 group-hover:text-primary transition-colors">
                    {partner.name}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed flex-1">
                    {partner.description || 'A valued partner in advancing social research and development.'}
                  </p>
                  {partner.website_url && (
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-primary transition-colors">
                      <ExternalLink size={10} />
                      Visit
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-stone-100 py-20 text-center">
              <Globe size={28} className="text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-400">We are currently establishing our partner network.</p>
            </div>
          )}
        </section>

        {/* Become a partner CTA */}
        <section className="bg-white border border-stone-100 p-10 md:p-12 text-center space-y-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Collaborate</p>
          <h2 className="text-xl font-headline font-light italic tracking-tight text-stone-800">
            "Interested in partnering with us?"
          </h2>
          <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
            We welcome collaborations with universities, NGOs, professional associations, and research bodies committed to social work and sustainable development.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-block bg-stone-900 text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-primary transition-colors active:scale-[0.98]"
            >
              Get in Touch
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
};

export default Partners;

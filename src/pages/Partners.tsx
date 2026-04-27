import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
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
    <div className="min-h-screen bg-surface font-body text-on-surface">
      <Helmet>
        <title>Partners | IJSDS</title>
        <meta name="description" content="IJSDS collaborates with academic institutions, NGOs, and professional bodies to support social research and development." />
      </Helmet>

      <main className="pt-32 pb-16">
        {/* Hero Section */}
        <header className="max-w-screen-xl mx-auto px-8 md:px-12 mb-20 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface mb-6">
            Our Partners
          </h1>
          <p className="text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto leading-relaxed mb-8">
            IJSDS collaborates with leading academic institutions, NGOs, and professional bodies to bridge the gap between social research and African development.
          </p>
          {userRole.is_admin && (
            <Button onClick={() => navigate('/partners/admin')} className="bg-primary hover:bg-primary/90 text-white font-medium px-6 py-2">
              Manage Partners
            </Button>
          )}
        </header>

        {/* Partners Grid */}
        <section className="bg-surface-container-low py-20">
          <div className="max-w-screen-xl mx-auto px-8 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-48 bg-surface animate-pulse rounded-lg border border-outline-variant/20"></div>
                ))
              ) : partners.length > 0 ? (
                partners.map((partner) => (
                  <div 
                    key={partner.id} 
                    className="bg-surface p-8 rounded-lg shadow-sm border border-outline-variant/20 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                    onClick={() => partner.website_url && window.open(partner.website_url, '_blank')}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-md p-2 shrink-0">
                        {partner.logo_url ? (
                          <img src={partner.logo_url} alt={partner.name} className="max-w-full max-h-full object-contain" />
                        ) : (
                          <Globe className="text-primary/50 w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-headline text-xl font-semibold text-primary">{partner.name}</h3>
                    </div>
                    <p className="text-on-surface-variant leading-relaxed flex-grow">
                      {partner.description || "A valued partner dedicated to the advancement of social research and development."}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-surface p-12 text-center rounded-lg border border-outline-variant/20">
                  <p className="text-on-surface-variant text-lg">We are currently establishing our network of partners.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="max-w-screen-md mx-auto px-8 py-24 text-center">
          <h2 className="font-headline text-3xl font-bold mb-6">Become a Partner</h2>
          <p className="text-lg text-on-surface-variant mb-8">
            Join us in advancing social work and sustainable development globally. We welcome collaborations with institutions worldwide.
          </p>
          <Button 
            onClick={() => navigate('/contact')}
            className="bg-primary text-white hover:bg-primary/90 px-8 py-6 text-lg rounded-md"
          >
            Contact Us
          </Button>
        </section>
      </main>
    </div>
  );
};

export default Partners;
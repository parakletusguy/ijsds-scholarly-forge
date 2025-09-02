import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Users, HandHeart } from 'lucide-react';
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
  }, []);

  const fetchUserRole = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      if (profile) {
        setUserRole(profile);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      setPartners(data || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnerClick = (websiteUrl: string | null) => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Our Partners</h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Collaborating with leading organizations and institutions to advance social work and development studies
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Admin Button */}
        {userRole.is_admin && (
          <div className="flex justify-end mb-8">
            <Button onClick={() => navigate('/partners/admin')}>
              Manage Partners
            </Button>
          </div>
        )}

        {/* Partners Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <Card key={i}>
                <CardHeader>
                  <div className="w-full h-32 bg-muted animate-pulse rounded" />
                  <div className="h-6 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : partners.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {partners.map((partner) => (
              <Card 
                key={partner.id} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  partner.website_url ? 'cursor-pointer hover:scale-105' : ''
                }`}
                onClick={() => handlePartnerClick(partner.website_url)}
              >
                <CardHeader className="text-center">
                  <div className="flex items-center justify-center h-32 mb-4 p-4">
                    {partner.logo_url ? (
                      <img 
                        src={partner.logo_url} 
                        alt={`${partner.name} logo`}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted rounded flex items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-lg">{partner.name}</CardTitle>
                  {partner.website_url && (
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <ExternalLink className="h-3 w-3" />
                      Visit Website
                    </div>
                  )}
                </CardHeader>
                {partner.description && (
                  <CardContent>
                    <CardDescription className="text-center">
                      {partner.description}
                    </CardDescription>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 mb-16">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No partners yet</h3>
            <p className="text-muted-foreground">
              We're actively building partnerships with leading organizations in our field.
            </p>
          </div>
        )}

        {/* Call to Action Section */}
        <section className="bg-muted/50 rounded-lg p-8 text-center">
          <HandHeart className="h-16 w-16 mx-auto text-primary mb-6" />
          <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join our network of institutions, organizations, and professionals committed to advancing social work and development studies through research, practice, and collaboration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Research Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Partner with us on groundbreaking research initiatives
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <ExternalLink className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Resource Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share knowledge, expertise, and resources
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <HandHeart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Global Impact</h3>
              <p className="text-sm text-muted-foreground">
                Make a difference in communities worldwide
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              <Mail className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
              Learn More
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
};
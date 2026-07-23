import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

const SITE_ORIGIN = 'https://ijsds.org';

interface PublicLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  /**
   * Set true only on routes that render their own, more specific canonical
   * tag (e.g. a page reachable via two different URL patterns that must
   * both resolve to one canonical form). Every other public page gets a
   * correct self-canonical for free from this default.
   */
  noCanonical?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, hideHeader, hideFooter, noCanonical }) => {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {!noCanonical && (
        <Helmet>
          <link rel="canonical" href={`${SITE_ORIGIN}${location.pathname}`} />
        </Helmet>
      )}
      {!hideHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

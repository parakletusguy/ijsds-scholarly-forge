import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, hideHeader, hideFooter }) => {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {!hideHeader && <Header />}
      <main className="flex-1">
        {children}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

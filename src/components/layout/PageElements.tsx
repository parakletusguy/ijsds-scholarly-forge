import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  accent?: string;
  showBack?: boolean;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  description, 
  accent = "Knowledge Hub", 
  showBack = true 
}: PageHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <section className="bg-secondary/5 pt-12 md:pt-20 pb-16 px-4 md:px-8 border-b border-border/40 relative overflow-hidden">
      {/* Subtle Geometric Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {showBack && (
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-8 font-headline font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-secondary/10 px-0 h-auto py-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        )}
        
        <div className="max-w-3xl">
          <span className="font-headline text-primary font-bold tracking-[0.2em] text-[10px] uppercase mb-3 block">
            {accent}
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-foreground leading-[0.95] tracking-tighter font-headline uppercase mb-6">
            {title} {subtitle && <><br/><span className="text-secondary">{subtitle}</span></>}
          </h1>
          {description && (
            <p className="text-xl text-foreground/60 font-body italic leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

interface ContentSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export const ContentSection = ({ title, children, className = "", dark = false }: ContentSectionProps) => {
  return (
    <section className={`py-16 md:py-24 px-4 md:px-8 ${dark ? 'bg-muted/30' : 'bg-background'} ${className}`}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-foreground uppercase tracking-tight font-headline">
              {title}
            </h2>
            <div className="h-1.5 w-20 bg-primary mt-4"></div>
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

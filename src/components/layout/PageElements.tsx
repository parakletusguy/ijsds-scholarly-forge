import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  accent,
  showBack = true,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <section className="bg-white border-b border-stone-100 pt-10 pb-10 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            {accent && (
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary block mb-3">
                {accent}
              </span>
            )}
            <h1 className="font-headline text-4xl md:text-5xl text-stone-900 leading-tight tracking-tight">
              {title}
              {subtitle && (
                <span className="text-on-surface-variant"> {subtitle}</span>
              )}
            </h1>
            {description && (
              <p className="mt-3 text-sm md:text-base text-on-surface-variant leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>
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
  id?: string;
}

export const ContentSection = ({
  title,
  children,
  className = '',
  dark = false,
  id,
}: ContentSectionProps) => {
  return (
    <section
      id={id}
      className={`py-10 md:py-14 px-6 md:px-10 ${dark ? 'bg-surface-container-low' : 'bg-surface'} ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <div className="mb-8 md:mb-12">
            <h2 className="font-headline text-2xl md:text-3xl text-stone-900 tracking-tight">
              {title}
            </h2>
            <div className="h-0.5 w-12 bg-primary mt-3" />
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', text, className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex flex-col items-center gap-2">
        <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
};

export const PageLoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export const InlineLoadingSpinner = ({ text }: { text?: string }) => (
  <div className="flex items-center gap-2">
    <LoadingSpinner size="sm" />
    {text && <span className="text-sm text-muted-foreground">{text}</span>}
  </div>
);
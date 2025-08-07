import { Suspense, lazy } from 'react';
import { PageLoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

interface LazyRouteProps {
  component: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
}

export const LazyRoute = ({ 
  component, 
  fallback = <PageLoadingSpinner text="Loading page..." /> 
}: LazyRouteProps) => {
  const LazyComponent = lazy(component);

  return (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
};

// Pre-configured lazy route components
export const LazyDashboard = () => (
  <LazyRoute component={() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard }))} />
);

export const LazyAnalytics = () => (
  <LazyRoute component={() => import('@/pages/Analytics').then(m => ({ default: m.Analytics }))} />
);

export const LazyProduction = () => (
  <LazyRoute component={() => import('@/pages/Production').then(m => ({ default: m.Production }))} />
);

export const LazyReports = () => (
  <LazyRoute component={() => import('@/pages/Reports').then(m => ({ default: m.Reports }))} />
);

export const LazyDataManagement = () => (
  <LazyRoute component={() => import('@/pages/DataManagement').then(m => ({ default: m.DataManagement }))} />
);
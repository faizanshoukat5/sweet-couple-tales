import { Suspense, lazy } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const LazySection = ({ children, fallback, className }: LazySectionProps) => {
  const defaultFallback = (
    <div className={`animate-pulse py-20 ${className || ''}`}>
      <div className="container mx-auto px-4">
        <div className="space-y-4">
          <div className="h-8 bg-primary/10 rounded-lg w-1/3 mx-auto"></div>
          <div className="h-4 bg-primary/5 rounded w-2/3 mx-auto"></div>
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-primary/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LazySection;
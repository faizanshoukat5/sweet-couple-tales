import React from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'romantic';
  duration?: 'fast' | 'normal' | 'slow';
  className?: string;
}

export const PageTransition = ({ 
  children, 
  variant = 'romantic',
  duration = 'normal',
  className 
}: PageTransitionProps) => {
  const durationClasses = {
    fast: 'duration-300',
    normal: 'duration-500',
    slow: 'duration-700'
  };

  const getTransitionClasses = () => {
    switch (variant) {
      case 'fade':
        return `animate-fade-in ${durationClasses[duration]}`;
      case 'slide':
        return `animate-fade-slide-up ${durationClasses[duration]}`;
      case 'scale':
        return `animate-romantic-scale ${durationClasses[duration]}`;
      case 'romantic':
        return `animate-romantic-scale ${durationClasses[duration]}`;
      default:
        return `animate-fade-in ${durationClasses[duration]}`;
    }
  };

  return (
    <div className={cn(getTransitionClasses(), className)}>
      {children}
    </div>
  );
};

interface LoadingSkeletonProps {
  variant?: 'card' | 'text' | 'image' | 'button';
  count?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  variant = 'card', 
  count = 1,
  className 
}: LoadingSkeletonProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className="bg-card rounded-lg p-6 shadow-soft animate-shimmer">
            <div className="w-full h-4 bg-primary/20 rounded mb-4" style={{ backgroundSize: '200% 100%' }} />
            <div className="w-3/4 h-4 bg-primary/20 rounded mb-2" style={{ backgroundSize: '200% 100%' }} />
            <div className="w-1/2 h-4 bg-primary/20 rounded" style={{ backgroundSize: '200% 100%' }} />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <div className="w-full h-4 bg-primary/20 rounded animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <div className="w-4/5 h-4 bg-primary/20 rounded animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <div className="w-3/5 h-4 bg-primary/20 rounded animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        );
      case 'image':
        return (
          <div className="w-full h-48 bg-primary/20 rounded-lg animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        );
      case 'button':
        return (
          <div className="w-24 h-10 bg-primary/20 rounded-md animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }, (_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};
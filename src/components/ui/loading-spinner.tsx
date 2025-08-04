import React from 'react';
import { Heart, Flower, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  variant?: 'heart' | 'flower' | 'sparkles' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ 
  variant = 'heart', 
  size = 'md', 
  className 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSize = {
    sm: 16,
    md: 24,
    lg: 32
  };

  if (variant === 'heart') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Heart 
          className={cn(
            sizeClasses[size], 
            'text-primary animate-heart-beat fill-current'
          )} 
          size={iconSize[size]}
        />
      </div>
    );
  }

  if (variant === 'flower') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Flower 
          className={cn(
            sizeClasses[size], 
            'text-primary animate-flower-bloom'
          )} 
          size={iconSize[size]}
        />
      </div>
    );
  }

  if (variant === 'sparkles') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <Sparkles 
          className={cn(
            sizeClasses[size], 
            'text-primary animate-romantic-glow'
          )} 
          size={iconSize[size]}
        />
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex space-x-1 items-center justify-center', className)}>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={cn(
              'rounded-full bg-primary',
              size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4',
              'animate-love-bounce'
            )}
            style={{
              animationDelay: `${index * 0.2}s`
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn(
          'rounded-full bg-primary animate-love-pulse',
          sizeClasses[size]
        )} />
      </div>
    );
  }

  return null;
};
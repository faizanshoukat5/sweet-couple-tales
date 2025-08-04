import React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RomanticLoaderProps {
  message?: string;
  variant?: 'hearts' | 'spinner' | 'shimmer';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RomanticLoader = ({ 
  message = "Loading with love...", 
  variant = 'hearts',
  size = 'md',
  className 
}: RomanticLoaderProps) => {
  if (variant === 'hearts') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <Heart
              key={index}
              className={cn(
                'text-primary fill-current animate-heart-float',
                size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
              )}
              style={{
                animationDelay: `${index * 0.5}s`
              }}
            />
          ))}
        </div>
        {message && (
          <p className={cn(
            'text-muted-foreground animate-romantic-glow font-serif',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          )}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className="relative">
          <div className={cn(
            'rounded-full border-4 border-primary/20 animate-romantic-spinner',
            size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
          )}>
            <div className={cn(
              'absolute top-0 left-0 rounded-full border-4 border-transparent border-t-primary animate-romantic-spinner',
              size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-12 h-12' : 'w-16 h-16'
            )} />
          </div>
          <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-primary fill-current animate-heart-beat" />
        </div>
        {message && (
          <p className={cn(
            'text-muted-foreground font-serif',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          )}>
            {message}
          </p>
        )}
      </div>
    );
  }

  if (variant === 'shimmer') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
        <div className={cn(
          'bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 rounded-lg animate-shimmer',
          size === 'sm' ? 'w-24 h-3' : size === 'md' ? 'w-32 h-4' : 'w-40 h-6'
        )}
        style={{
          backgroundSize: '200% 100%'
        }} />
        {message && (
          <p className={cn(
            'text-muted-foreground font-serif',
            size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'
          )}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return null;
};
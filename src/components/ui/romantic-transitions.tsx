import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingHeartsProps {
  count?: number;
  className?: string;
}

export const FloatingHearts = ({ count = 5, className }: FloatingHeartsProps) => {
  const [hearts, setHearts] = useState<Array<{ id: number; delay: number; x: number }>>([]);

  useEffect(() => {
    const newHearts = Array.from({ length: count }, (_, index) => ({
      id: index,
      delay: Math.random() * 2,
      x: Math.random() * 100
    }));
    setHearts(newHearts);
  }, [count]);

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-10', className)}>
      {hearts.map((heart) => (
        <Heart
          key={heart.id}
          className="absolute bottom-0 text-primary/30 fill-current animate-heart-float w-6 h-6"
          style={{
            left: `${heart.x}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: '4s'
          }}
        />
      ))}
    </div>
  );
};

interface LoveConfettiProps {
  isActive?: boolean;
  duration?: number;
  className?: string;
}

export const LoveConfetti = ({ isActive = false, duration = 3000, className }: LoveConfettiProps) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; icon: React.ReactNode; delay: number; x: number; rotation: number }>>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isActive) {
      const icons = [Heart, Sparkles, Star];
      const newConfetti = Array.from({ length: 15 }, (_, index) => {
        const IconComponent = icons[Math.floor(Math.random() * icons.length)];
        return {
          id: index,
          icon: <IconComponent className="w-4 h-4" />,
          delay: Math.random() * 1,
          x: Math.random() * 100,
          rotation: Math.random() * 360
        };
      });
      
      setConfetti(newConfetti);
      setShow(true);

      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  if (!show) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-50', className)}>
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute text-primary animate-love-bounce"
          style={{
            left: `${item.x}%`,
            top: '0%',
            animationDelay: `${item.delay}s`,
            transform: `rotate(${item.rotation}deg)`
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
};

interface GlowingBorderProps {
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

export const GlowingBorder = ({ children, isActive = true, className }: GlowingBorderProps) => {
  return (
    <div className={cn(
      'relative rounded-lg overflow-hidden',
      isActive && 'animate-love-pulse',
      className
    )}>
      <div className="absolute inset-0 bg-gradient-romantic opacity-20 rounded-lg" />
      <div className="relative bg-card/80 backdrop-blur-sm rounded-lg border border-primary/20">
        {children}
      </div>
    </div>
  );
};

interface StaggeredFadeProps {
  children: React.ReactNode[];
  delay?: number;
  className?: string;
}

export const StaggeredFade = ({ children, delay = 100, className }: StaggeredFadeProps) => {
  return (
    <div className={cn(className)}>
      {children.map((child, index) => (
        <div
          key={index}
          className="animate-fade-slide-up"
          style={{
            animationDelay: `${index * delay}ms`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

interface PulsingHeartProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulsingHeart = ({ size = 'md', className }: PulsingHeartProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Heart 
      className={cn(
        sizeClasses[size],
        'text-primary fill-current animate-heart-beat',
        className
      )}
    />
  );
};
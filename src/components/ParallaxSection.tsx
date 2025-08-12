import React from 'react';
import ParallaxContainer from './ParallaxContainer';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import '../styles/parallax.css';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  backgroundElements?: React.ReactNode;
  id?: string;
}

const ParallaxSection = ({ children, className = '', backgroundElements, id }: ParallaxSectionProps) => {
  const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

  return (
    <section 
      ref={ref}
      id={id}
      className={`relative overflow-hidden parallax-section ${className}`}
    >
      {/* Background elements with parallax */}
      {backgroundElements && (
        <div className="absolute inset-0 parallax-bg">
          {backgroundElements}
        </div>
      )}
      
      {/* Content with scroll reveal */}
      <div className={`relative z-10 parallax-content scroll-reveal ${isVisible ? 'revealed' : ''}`}>
        {children}
      </div>
    </section>
  );
};

// Pre-made background elements for common sections
export const FeaturesBackground = () => (
  <>
    <ParallaxContainer speed={0.1} direction="down" className="absolute top-0 left-0">
      <div className="w-64 h-64 bg-gradient-radial from-rose-100/20 to-transparent rounded-full blur-3xl" />
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.15} direction="up" className="absolute bottom-0 right-0">
      <div className="w-80 h-80 bg-gradient-radial from-pink-100/20 to-transparent rounded-full blur-3xl" />
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.2} direction="down" className="absolute top-1/2 left-1/4">
      <div className="text-6xl opacity-5 animate-float">✨</div>
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.25} direction="up" className="absolute top-1/3 right-1/3">
      <div className="text-4xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>💫</div>
    </ParallaxContainer>
  </>
);

export const TimelineBackground = () => (
  <>
    <ParallaxContainer speed={0.1} direction="up" className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/30 via-transparent to-rose-50/30" />
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.2} direction="down" className="absolute top-10 left-10">
      <div className="w-48 h-48 bg-gradient-radial from-purple-100/15 to-transparent rounded-full blur-2xl" />
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.15} direction="up" className="absolute bottom-10 right-10">
      <div className="w-56 h-56 bg-gradient-radial from-rose-100/15 to-transparent rounded-full blur-2xl" />
    </ParallaxContainer>
    
    {/* Floating timeline elements */}
    <ParallaxContainer speed={0.3} direction="down" className="absolute top-1/4 right-1/5">
      <div className="text-5xl opacity-8 animate-float">📅</div>
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.25} direction="up" className="absolute bottom-1/4 left-1/6">
      <div className="text-4xl opacity-8 animate-float" style={{ animationDelay: '1.5s' }}>📸</div>
    </ParallaxContainer>
  </>
);

export const CallToActionBackground = () => (
  <>
    <ParallaxContainer speed={0.1} direction="down" className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-t from-rose-50/40 via-transparent to-pink-50/40" />
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.2} direction="up" className="absolute top-0 left-0 right-0">
      <div className="flex justify-center">
        <div className="w-96 h-32 bg-gradient-radial from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
    </ParallaxContainer>
    
    {/* Celebration elements */}
    <ParallaxContainer speed={0.35} direction="down" className="absolute top-1/4 left-1/6">
      <div className="text-3xl opacity-10 animate-float">🎉</div>
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.4} direction="up" className="absolute top-1/3 right-1/6">
      <div className="text-3xl opacity-10 animate-float" style={{ animationDelay: '0.8s' }}>🎊</div>
    </ParallaxContainer>
    
    <ParallaxContainer speed={0.3} direction="down" className="absolute bottom-1/4 left-1/3">
      <div className="text-4xl opacity-10 animate-float" style={{ animationDelay: '1.2s' }}>🌟</div>
    </ParallaxContainer>
  </>
);

export default ParallaxSection;

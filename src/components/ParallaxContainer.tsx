import { useEffect, useRef, useState } from 'react';

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  offset?: number;
}

const ParallaxContainer = ({ 
  children, 
  speed = 0.5, 
  direction = 'up', 
  className = '', 
  offset = 0 
}: ParallaxContainerProps) => {
  const [scrollY, setScrollY] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        // Only apply parallax when element is in viewport
        if (rect.bottom >= 0 && rect.top <= windowHeight) {
          const scrolled = window.pageYOffset;
          const parallax = (scrolled - elementTop + offset) * speed;
          setScrollY(parallax);
        }
      }
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [speed, offset]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${-scrollY}px)`;
      case 'down':
        return `translateY(${scrollY}px)`;
      case 'left':
        return `translateX(${-scrollY}px)`;
      case 'right':
        return `translateX(${scrollY}px)`;
      default:
        return `translateY(${-scrollY}px)`;
    }
  };

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          transform: getTransform(),
          transition: 'none',
          willChange: 'transform'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ParallaxContainer;

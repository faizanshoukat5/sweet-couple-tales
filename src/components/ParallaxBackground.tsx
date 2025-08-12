import ParallaxContainer from './ParallaxContainer';

interface FloatingElement {
  id: string;
  emoji: string;
  size: number;
  x: number;
  y: number;
  speed: number;
  direction: 'up' | 'down' | 'left' | 'right';
  delay: number;
}

const ParallaxBackground = () => {
  const floatingElements: FloatingElement[] = [
    // Hearts
    { id: 'heart1', emoji: '💕', size: 24, x: 10, y: 20, speed: 0.3, direction: 'up', delay: 0 },
    { id: 'heart2', emoji: '💖', size: 18, x: 85, y: 15, speed: 0.4, direction: 'down', delay: 1000 },
    { id: 'heart3', emoji: '💗', size: 20, x: 70, y: 60, speed: 0.2, direction: 'up', delay: 2000 },
    { id: 'heart4', emoji: '💝', size: 16, x: 15, y: 80, speed: 0.5, direction: 'down', delay: 3000 },
    
    // Romantic elements
    { id: 'rose1', emoji: '🌹', size: 22, x: 5, y: 45, speed: 0.25, direction: 'up', delay: 500 },
    { id: 'rose2', emoji: '🌺', size: 20, x: 90, y: 35, speed: 0.35, direction: 'down', delay: 1500 },
    { id: 'star1', emoji: '⭐', size: 14, x: 25, y: 10, speed: 0.6, direction: 'up', delay: 2500 },
    { id: 'star2', emoji: '✨', size: 16, x: 80, y: 75, speed: 0.3, direction: 'down', delay: 4000 },
    
    // Wedding/couple elements
    { id: 'ring1', emoji: '💍', size: 18, x: 40, y: 25, speed: 0.4, direction: 'up', delay: 1000 },
    { id: 'couple1', emoji: '👫', size: 20, x: 60, y: 85, speed: 0.2, direction: 'down', delay: 3500 },
    { id: 'gift1', emoji: '🎁', size: 16, x: 95, y: 50, speed: 0.45, direction: 'up', delay: 2000 },
    { id: 'balloon1', emoji: '🎈', size: 14, x: 8, y: 65, speed: 0.55, direction: 'down', delay: 4500 },
    
    // Additional romantic elements
    { id: 'kiss1', emoji: '💋', size: 15, x: 35, y: 70, speed: 0.35, direction: 'up', delay: 1200 },
    { id: 'letter1', emoji: '💌', size: 17, x: 75, y: 20, speed: 0.25, direction: 'down', delay: 3200 },
    { id: 'cupid1', emoji: '💘', size: 19, x: 50, y: 40, speed: 0.4, direction: 'up', delay: 800 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            fontSize: `${element.size}px`,
            opacity: 0.1,
            animation: `float 6s ease-in-out infinite`,
            animationDelay: `${element.delay}ms`,
          }}
        >
          <ParallaxContainer
            speed={element.speed}
            direction={element.direction}
          >
            <div className="animate-pulse">
              {element.emoji}
            </div>
          </ParallaxContainer>
        </div>
      ))}
      
      {/* Additional gradient overlays with parallax */}
      <ParallaxContainer speed={0.1} direction="down" className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50/20 via-transparent to-pink-50/20" />
      </ParallaxContainer>
      
      <ParallaxContainer speed={0.15} direction="up" className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-radial from-purple-100/10 to-transparent rounded-full blur-3xl" />
      </ParallaxContainer>
      
      <ParallaxContainer speed={0.2} direction="down" className="absolute inset-0">
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gradient-radial from-rose-100/10 to-transparent rounded-full blur-3xl" />
      </ParallaxContainer>
    </div>
  );
};

export default ParallaxBackground;

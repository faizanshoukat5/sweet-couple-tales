import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import ParallaxContainer from "./ParallaxContainer";
import heroImage from "@/assets/hero-romantic.jpg";
import heartFlowers from '/heart-flowerss.png';
import '../styles/parallax.css';

const ParallaxHero = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();
  const { ref: subtitleRef, isVisible: subtitleVisible } = useScrollReveal();
  const { ref: buttonsRef, isVisible: buttonsVisible } = useScrollReveal();
  const { ref: imageRef, isVisible: imageVisible } = useScrollReveal();

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-section">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0 parallax-bg">
        <ParallaxContainer speed={0.1} direction="down" className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 opacity-80"></div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.2} direction="up" className="absolute inset-0">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-romantic-glow"></div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.15} direction="down" className="absolute inset-0">
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-romantic-glow"></div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.25} direction="up" className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-24 h-24 bg-rose-200/30 rounded-full blur-2xl"></div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.3} direction="down" className="absolute inset-0">
          <div className="absolute bottom-1/3 left-1/4 w-28 h-28 bg-pink-200/30 rounded-full blur-2xl"></div>
        </ParallaxContainer>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <ParallaxContainer speed={0.4} direction="up" className="absolute top-20 left-1/4">
          <div className="text-4xl opacity-5 animate-float">💕</div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.35} direction="down" className="absolute top-1/3 right-1/5">
          <div className="text-3xl opacity-5 animate-float" style={{ animationDelay: '1s' }}>💖</div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.45} direction="up" className="absolute bottom-1/4 left-1/6">
          <div className="text-5xl opacity-5 animate-float" style={{ animationDelay: '2s' }}>✨</div>
        </ParallaxContainer>
        
        <ParallaxContainer speed={0.3} direction="down" className="absolute bottom-1/3 right-1/3">
          <div className="text-2xl opacity-5 animate-float" style={{ animationDelay: '0.5s' }}>🌹</div>
        </ParallaxContainer>
      </div>
      
      <div className="container mx-auto px-4 relative z-20 parallax-content py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left space-y-6">
            <div 
              ref={titleRef}
              className={`flex items-center justify-center lg:justify-start gap-3 scroll-reveal ${titleVisible ? 'revealed' : ''}`}
            >
              <ParallaxContainer speed={0.2} direction="up">
                 <img 
                   src={heartFlowers} 
                   alt="CoupleConnect logo" 
                   className="w-12 h-12 animate-heart-float"
                 />
              </ParallaxContainer>
              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-foreground">
                Couple
                <span className="block text-primary">Connect</span>
              </h1>
            </div>
            
            <div 
              ref={subtitleRef}
              className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light scroll-reveal ${subtitleVisible ? 'revealed' : ''}`}
              style={{ animationDelay: '0.2s' }}
            >
              Connect deeper with your partner through shared memories and moments. 
              Create, share, and cherish your love story together in one beautiful space.
            </div>
            
            <div 
              ref={buttonsRef}
              className={`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start scroll-reveal ${buttonsVisible ? 'revealed' : ''} mt-8`}
              style={{ animationDelay: '0.4s' }}
            >
              {user ? (
                <>
                  <Button 
                    variant="romantic" 
                    size="lg" 
                    className="text-lg px-8 py-6 font-serif transform hover:scale-105 transition-all duration-300 relative z-10"
                    onClick={handleGetStarted}
                  >
                    View My Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300 relative z-10"
                    onClick={signOut}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="romantic" 
                    size="lg" 
                    className="text-lg px-8 py-6 font-serif transform hover:scale-105 transition-all duration-300 relative z-10"
                    onClick={handleGetStarted}
                  >
                    Start Your Journey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white transform hover:scale-105 transition-all duration-300 relative z-10"
                    onClick={handleGetStarted}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - Hero image */}
          <div 
            ref={imageRef}
            className={`relative scroll-reveal-right ${imageVisible ? 'revealed' : ''}`}
            style={{ animationDelay: '0.6s' }}
          >
            <ParallaxContainer speed={0.2} direction="up" className="relative">
              <Card className="overflow-hidden shadow-romantic border-0 bg-gradient-to-br from-primary/5 to-secondary/5 transform hover:scale-105 transition-all duration-500">
                <CardContent className="p-0">
                  <img 
                    src={heroImage}
                    alt="Couple creating beautiful memories together"
                    className="w-full h-[500px] object-cover"
                    fetchPriority="high"
                    loading="eager"
                    decoding="async"
                  />
                </CardContent>
              </Card>
            </ParallaxContainer>
            
            {/* Floating elements with parallax */}
            <ParallaxContainer speed={0.4} direction="down" className="absolute -top-4 -right-4">
              <div className="w-20 h-20 bg-primary rounded-full opacity-20 animate-heart-float"></div>
            </ParallaxContainer>
            
            <ParallaxContainer speed={0.35} direction="up" className="absolute -bottom-4 -left-4">
              <div className="w-16 h-16 bg-secondary rounded-full opacity-20 animate-heart-float"></div>
            </ParallaxContainer>
            
            {/* Additional floating decorative elements */}
            <ParallaxContainer speed={0.6} direction="up" className="absolute top-1/4 -left-8">
              <div className="text-2xl opacity-30 animate-float">💝</div>
            </ParallaxContainer>
            
            <ParallaxContainer speed={0.5} direction="down" className="absolute bottom-1/4 -right-8">
              <div className="text-3xl opacity-30 animate-float" style={{ animationDelay: '1.5s' }}>🎉</div>
            </ParallaxContainer>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator with parallax */}
      <ParallaxContainer speed={0.3} direction="up" className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex flex-col items-center text-muted-foreground animate-bounce">
          <div className="text-2xl mb-2 animate-pulse">💖</div>
          <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
            <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </ParallaxContainer>
    </section>
  );
};

export default ParallaxHero;

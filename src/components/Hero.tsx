import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-romantic.jpg";
import heartFlowers from '/heart-flowerss.png';

const Hero = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, go to dashboard
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-soft opacity-60"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-romantic-glow"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-romantic-glow delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left space-y-8 animate-fade-in">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
              <img 
                src={heartFlowers} 
                alt="Heart" 
                className="w-12 h-12 animate-heart-float"
              />
              <h1 className="font-serif text-5xl lg:text-7xl font-bold text-foreground">
                Couple
                <span className="block text-primary">Connect</span>
              </h1>
            </div>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light">
              Connect deeper with your partner through shared memories and moments. 
              Create, share, and cherish your love story together in one beautiful space.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <>
                  <Button 
                    variant="romantic" 
                    size="lg" 
                    className="text-lg px-8 py-6 font-serif"
                    onClick={handleGetStarted}
                  >
                    View My Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white"
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
                    className="text-lg px-8 py-6 font-serif"
                    onClick={handleGetStarted}
                  >
                    Start Your Journey
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-white"
                    onClick={handleGetStarted}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Right side - Hero image */}
          <div className="relative animate-fade-in delay-300">
            <Card className="overflow-hidden shadow-romantic border-0 bg-gradient-to-br from-primary/5 to-secondary/5">
              <CardContent className="p-0">
                <img 
                  src={heroImage}
                  alt="Couple creating beautiful memories together"
                  className="w-full h-[500px] object-cover"
                />
              </CardContent>
            </Card>
            
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary rounded-full opacity-20 animate-heart-float"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary rounded-full opacity-20 animate-heart-float delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CallToAction = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate(user ? '/' : '/auth');
  };

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-border/50 shadow-romantic">
          <CardContent className="p-12 text-center">
            <div className="animate-fade-in">
              <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ready to Start Your
                <span className="text-primary block">Love Story Journal?</span>
              </h2>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
                Join thousands of couples who are already preserving their beautiful memories. 
                Your love story deserves to be remembered forever.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="romantic" 
                  size="lg" 
                  className="text-lg px-10 py-6 font-serif"
                  onClick={handleGetStarted}
                >
                  {user ? "Create Your First Memory" : "Create Account - It's Free"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-10 py-6 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={handleGetStarted}
                >
                  {user ? "View My Memories" : "Sign In"}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mt-6">
                No credit card required • Free forever • Privacy guaranteed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CallToAction;
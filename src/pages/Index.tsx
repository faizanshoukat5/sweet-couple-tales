import { useAuth } from "@/hooks/useAuth";
import ParallaxHero from "@/components/ParallaxHero";
import ParallaxBackground from "@/components/ParallaxBackground";
import ParallaxSection, { FeaturesBackground, TimelineBackground, CallToActionBackground } from "@/components/ParallaxSection";
import AnimatedFeatures from "@/components/AnimatedFeatures";
import InteractiveMemoryDemo from "@/components/InteractiveMemoryDemo";
import Timeline from "@/components/Timeline";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";
import CallToAction from "@/components/CallToAction";
// Add FAQ link to homepage for easy access
import { Link } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-background relative">
      {/* Parallax Background */}
      <ParallaxBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <ParallaxHero />
        
        <ParallaxSection backgroundElements={<FeaturesBackground />}>
          <AnimatedFeatures isAuthenticated={!!user} />
        </ParallaxSection>
        
        <ParallaxSection>
          <InteractiveMemoryDemo />
        </ParallaxSection>
        
        <ParallaxSection backgroundElements={<TimelineBackground />}>
          <Timeline />
        </ParallaxSection>
        
        <ParallaxSection>
          {/* Albums preview mirrors dashboard albums section */}
          <HomeAlbumsPreview />
        </ParallaxSection>
        
        <ParallaxSection backgroundElements={<CallToActionBackground />}>
          <CallToAction />
        </ParallaxSection>
      </div>
      <div className="relative flex justify-center mt-20 mb-12">
        <div className="w-full max-w-3xl">
          <div className="relative overflow-visible">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white shadow-xl rounded-full p-4 border-4 border-primary/30 animate-bounce">
                <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8zm-9 4h.01" />
                </svg>
              </div>
            </div>
            <div className="rounded-3xl bg-gradient-to-br from-pink-200 via-purple-100 to-blue-100 border border-primary/30 shadow-2xl px-10 py-16 flex flex-col items-center gap-4 relative">
              <h3 className="text-3xl font-extrabold text-primary mb-2 font-serif tracking-tight drop-shadow">Questions? Answers Await!</h3>
              <p className="text-lg text-muted-foreground mb-6 text-center max-w-xl">Discover tips, hidden features, and troubleshooting in our beautifully organized FAQ. Your couple journey just got easier!</p>
              <Link to="/faq">
                <button className="px-10 py-4 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-xl shadow-xl hover:scale-105 hover:from-pink-500 hover:to-primary transition-all duration-200">Explore FAQ</button>
              </Link>
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-primary/10 rounded-b-3xl blur-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

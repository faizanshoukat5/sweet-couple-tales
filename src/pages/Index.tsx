import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import ParallaxHero from "@/components/ParallaxHero";
import ParallaxBackground from "@/components/ParallaxBackground";
import ParallaxSection, { FeaturesBackground, TimelineBackground, CallToActionBackground } from "@/components/ParallaxSection";
import AnimatedFeatures from "@/components/AnimatedFeatures";
import InteractiveMemoryDemo from "@/components/InteractiveMemoryDemo";
import Timeline from "@/components/Timeline";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";
import CallToAction from "@/components/CallToAction";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import StructuredData from "@/components/StructuredData";

const Index = () => {
  const { user, loading } = useAuth();

  // Enhanced SEO setup
  useEffect(() => {
    document.title = "CoupleConnect - Your Love Story Journal | Create Beautiful Memories Together";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create, share and cherish your love story with CoupleConnect. A private journal for couples with timeline views, secure chat, mood tracking and more. Start preserving your beautiful memories today!');
    }

    // Add canonical URL
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = window.location.origin + window.location.pathname;
    document.head.appendChild(canonical);

    return () => {
      // Cleanup canonical link on unmount
      const canonicalToRemove = document.querySelector('link[rel="canonical"]');
      if (canonicalToRemove) {
        canonicalToRemove.remove();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full animate-bounce"></div>
          <div className="text-primary font-serif text-lg animate-fade-in">Loading your love story...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <StructuredData />
      
      {/* Parallax Background */}
      <ParallaxBackground />
      
  {/* Main Content */}
  <main className="relative z-10 home-zoom">
        <ParallaxHero />
        
        <ParallaxSection backgroundElements={<FeaturesBackground />}>
          <AnimatedFeatures isAuthenticated={!!user} />
        </ParallaxSection>
        
        <ParallaxSection>
          <InteractiveMemoryDemo />
        </ParallaxSection>
        
        <TestimonialsSection />
        
        <ParallaxSection backgroundElements={<TimelineBackground />}>
          <Timeline />
        </ParallaxSection>
        
        <ParallaxSection>
          <HomeAlbumsPreview />
        </ParallaxSection>
        
        <ParallaxSection backgroundElements={<CallToActionBackground />}>
          <CallToAction />
        </ParallaxSection>
        
        <FAQSection />
      </main>
    </div>
  );
};

export default Index;

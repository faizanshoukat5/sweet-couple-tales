import { useAuth } from "@/hooks/useAuth";
import { useEffect, lazy } from "react";
import ParallaxHero from "@/components/ParallaxHero";
import ParallaxBackground from "@/components/ParallaxBackground";
import ParallaxSection, { FeaturesBackground, TimelineBackground, CallToActionBackground } from "@/components/ParallaxSection";
import AnimatedFeatures from "@/components/AnimatedFeatures";
import CallToAction from "@/components/CallToAction";
import StructuredData from "@/components/StructuredData";
import LazySection from "@/components/LazySection";

// Lazy load below-the-fold components
const InteractiveMemoryDemo = lazy(() => import("@/components/InteractiveMemoryDemo"));
const Timeline = lazy(() => import("@/components/Timeline"));
const HomeAlbumsPreview = lazy(() => import("@/components/HomeAlbumsPreview"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));

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
          <LazySection>
            <InteractiveMemoryDemo />
          </LazySection>
        </ParallaxSection>
        
        <LazySection>
          <TestimonialsSection />
        </LazySection>
        
        <ParallaxSection backgroundElements={<TimelineBackground />}>
          <LazySection>
            <Timeline />
          </LazySection>
        </ParallaxSection>
        
        <ParallaxSection>
          <LazySection>
            <HomeAlbumsPreview />
          </LazySection>
        </ParallaxSection>
        
        <ParallaxSection backgroundElements={<CallToActionBackground />}>
          <CallToAction />
        </ParallaxSection>
        
        <LazySection>
          <FAQSection />
        </LazySection>
      </main>
    </div>
  );
};

export default Index;

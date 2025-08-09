import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import CallToAction from "@/components/CallToAction";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";
import HomeDashboardPreview from "@/components/HomeDashboardPreview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <Timeline />
      {/* Albums preview mirrors dashboard albums section */}
      <HomeAlbumsPreview />
      <HomeDashboardPreview />
      <CallToAction />
    </div>
  );
};

export default Index;

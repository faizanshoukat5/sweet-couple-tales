import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import CallToAction from "@/components/CallToAction";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <Timeline />
      {/* Albums preview mirrors dashboard albums section */}
      <HomeAlbumsPreview />
      <CallToAction />
    </div>
  );
};

export default Index;

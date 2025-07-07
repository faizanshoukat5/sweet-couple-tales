import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features />
      <Timeline />
      <CallToAction />
    </div>
  );
};

export default Index;

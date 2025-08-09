
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import CallToAction from "@/components/CallToAction";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features isAuthenticated={!!user} />
      <Timeline />
      {/* Albums preview mirrors dashboard albums section */}
      <HomeAlbumsPreview />
      <CallToAction />
    </div>
  );
};

export default Index;

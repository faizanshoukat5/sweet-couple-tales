import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Timeline from "@/components/Timeline";
import CallToAction from "@/components/CallToAction";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  // Only used for passing to Features
  const { user, loading } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Features isAuthenticated={!!user} />
      <Timeline />
      <CallToAction />
    </div>
  );
};

export default Index;

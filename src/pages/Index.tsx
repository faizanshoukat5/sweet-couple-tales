import { useEffect } from "react";
import Hero from "@/components/Hero";
import FeatureHighlights from "@/components/FeatureHighlights";
import HomeAlbumsPreview from "@/components/HomeAlbumsPreview";
import CallToAction from "@/components/CallToAction";

const Index = () => {
  useEffect(() => {
    document.title = 'Sweet Couple Tales — Private memories & albums';
    const desc = 'Minimal features: memories, albums, chat, calendar—private and secure.';
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.appendChild(meta);
    }
    meta.content = desc;

    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.origin + '/';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <FeatureHighlights />
      <HomeAlbumsPreview />
      <CallToAction />
    </div>
  );
};

export default Index;

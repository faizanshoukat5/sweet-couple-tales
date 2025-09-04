import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MessageCircle, HelpCircle, BookOpen, Search, ShieldCheck } from "lucide-react";

const FAQSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="relative py-20">
      {/* Top gradient divider */}
      <div className="pointer-events-none absolute inset-x-0 -top-6 h-12 bg-gradient-to-r from-transparent via-primary/15 to-transparent blur-xl" />

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`relative overflow-hidden scroll-reveal ${isVisible ? 'revealed' : ''}`}>
            {/* Floating Chat Icon */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white shadow-xl rounded-full p-4 border-4 border-primary/30 animate-soft-float" aria-hidden>
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
            </div>

            {/* Main Card */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border border-primary/30 shadow-2xl px-8 md:px-12 py-16 flex flex-col items-center gap-8 relative overflow-hidden">
              {/* Soft ring highlight */}
              <div className="absolute inset-0 rounded-[inherit] ring-1 ring-primary/10" aria-hidden />

              {/* Background Decorations */}
              <div className="absolute top-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse" aria-hidden />
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} aria-hidden />

              {/* Content */}
              <div className="text-center space-y-4 relative z-10">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20">
                  <HelpCircle className="w-4 h-4" /> Need Help?
                </span>
                <h3 className="text-3xl md:text-4xl font-extrabold text-foreground font-serif tracking-tight">
                  Questions? Answers Await!
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Discover helpful tips, hidden features, and troubleshooting guides in our beautifully organized FAQ.
                  <span className="text-primary font-medium"> Your couple journey just got easier!</span>
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/faq" className="group">
                  <button className="px-8 md:px-10 py-4 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-[1.03] hover:from-pink-500 hover:to-primary transition-all duration-300">
                    Explore FAQ
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1" aria-hidden>→</span>
                  </button>
                </Link>
                <Link to="/faq" className="group">
                  <button className="px-8 md:px-10 py-4 rounded-full border border-primary/30 bg-white/70 backdrop-blur text-primary font-semibold hover:bg-white hover:shadow-xl transition-all duration-300">
                    View Quick Tips
                  </button>
                </Link>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full mt-2">
                <Link to="/faq#what-is" className="group">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-border hover:border-primary/40 hover:shadow-md transition-colors">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Getting Started</span>
                  </div>
                </Link>
                <Link to="/faq#create-memory" className="group">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-border hover:border-primary/40 hover:shadow-md transition-colors">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Create Memories</span>
                  </div>
                </Link>
                <Link to="/faq#search-filter" className="group">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-border hover:border-primary/40 hover:shadow-md transition-colors">
                    <Search className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Search & Filter</span>
                  </div>
                </Link>
                <Link to="/faq#privacy" className="group">
                  <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/70 backdrop-blur border border-border hover:border-primary/40 hover:shadow-md transition-colors">
                    <ShieldCheck className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Privacy</span>
                  </div>
                </Link>
              </div>

              {/* Bottom Shadow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-primary/20 rounded-b-3xl blur-md" aria-hidden />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
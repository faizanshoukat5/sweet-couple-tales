import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { MessageCircle } from "lucide-react";

const FAQSection = () => {
  const { ref, isVisible } = useScrollReveal();

  return (
    <section ref={ref} className="relative py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`relative overflow-hidden scroll-reveal ${isVisible ? 'revealed' : ''}`}>
            {/* Floating Chat Icon */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-white shadow-xl rounded-full p-4 border-4 border-primary/30 animate-bounce">
                <MessageCircle className="w-12 h-12 text-primary" />
              </div>
            </div>
            
            {/* Main Card */}
            <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 border border-primary/30 shadow-2xl px-8 md:px-12 py-16 flex flex-col items-center gap-6 relative overflow-hidden">
              
              {/* Background Decorations */}
              <div className="absolute top-4 left-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-24 h-24 bg-secondary/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              {/* Content */}
              <div className="text-center space-y-4 relative z-10">
                <h3 className="text-3xl md:text-4xl font-extrabold text-primary font-serif tracking-tight">
                  Questions? Answers Await!
                </h3>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Discover helpful tips, hidden features, and troubleshooting guides in our beautifully organized FAQ. 
                  <span className="text-primary font-medium"> Your couple journey just got easier!</span>
                </p>
              </div>
              
              <Link to="/faq" className="group">
                <button className="px-8 md:px-12 py-4 rounded-full bg-gradient-to-r from-primary to-pink-500 text-white font-bold text-lg md:text-xl shadow-xl hover:shadow-2xl hover:scale-105 hover:from-pink-500 hover:to-primary transition-all duration-300 transform group-hover:animate-pulse">
                  Explore FAQ
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </button>
              </Link>
              
              {/* Bottom Shadow */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-2/3 h-6 bg-primary/20 rounded-b-3xl blur-md"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
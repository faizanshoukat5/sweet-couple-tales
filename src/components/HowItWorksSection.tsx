import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Heart, MessageCircle, Camera, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Heart,
    step: "01",
    title: "Connect with Your Partner",
    description: "Sign up and link your accounts to create a private shared space just for the two of you.",
  },
  {
    icon: Camera,
    step: "02",
    title: "Capture Your Moments",
    description: "Upload photos, write memories, and build a beautiful timeline of your journey together.",
  },
  {
    icon: MessageCircle,
    step: "03",
    title: "Stay Close Every Day",
    description: "Chat in real-time, share your mood, and send love notes — no matter the distance.",
  },
  {
    icon: Calendar,
    step: "04",
    title: "Never Forget What Matters",
    description: "Track milestones, set shared goals, and get reminders for the dates that mean the most.",
  },
];

const HowItWorksSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();
  const { ref: stepsRef, isVisible: stepsVisible } = useScrollReveal();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Title */}
        <div
          ref={titleRef}
          className={`text-center mb-20 scroll-reveal ${titleVisible ? "revealed" : ""}`}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-6">
            Simple & Beautiful
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Your love story deserves a home. Get started in minutes.
          </p>
        </div>

        {/* Steps */}
        <div
          ref={stepsRef}
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto scroll-reveal ${stepsVisible ? "revealed" : ""}`}
        >
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.step}
                className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {/* Step number */}
                <span className="absolute top-4 right-4 text-5xl font-bold text-primary/10 font-serif select-none">
                  {step.step}
                </span>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>

                {/* Connector arrow (hidden on last item and mobile) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight className="w-5 h-5 text-primary/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <Button
            variant="romantic"
            size="lg"
            className="font-semibold px-8 hover:scale-105 transition-transform"
            onClick={() => navigate(user ? "/dashboard" : "/auth")}
          >
            {user ? "Go to Dashboard" : "Start Your Love Story"}
            <Heart className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;

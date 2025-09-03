import { Card, CardContent } from "@/components/ui/card";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Star, Heart, Users } from "lucide-react";

const testimonials = [
  {
    name: "Sarah & Mike",
    relationship: "Together 3 years",
    content: "Sweet Couple Tales has become our digital scrapbook. We love looking back at our memories and seeing how far we've come together!",
    rating: 5,
    avatar: "💑"
  },
  {
    name: "Emma & James",
    relationship: "Married 1 year", 
    content: "The timeline feature is amazing! It's like having our entire love story beautifully organized. We use it to remember special dates and moments.",
    rating: 5,
    avatar: "👫"
  },
  {
    name: "Lisa & David",
    relationship: "Together 2 years",
    content: "We especially love the private chat and mood tracker. It keeps us connected even when we're apart. Highly recommend!",
    rating: 5,
    avatar: "💏"
  }
];

const TestimonialsSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal();

  return (
    <section className="py-20 bg-gradient-to-br from-background via-rose-50/30 to-pink-50/30">
      <div className="container mx-auto px-4">
        {/* Title */}
        <div 
          ref={titleRef}
          className={`text-center mb-16 scroll-reveal ${titleVisible ? 'revealed' : ''}`}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground">
              Loved by Couples
            </h2>
            <Heart className="w-8 h-8 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of happy couples who are already preserving their love stories
          </p>
        </div>

        {/* Testimonials Grid */}
        <div 
          ref={cardsRef}
          className={`grid md:grid-cols-3 gap-8 max-w-6xl mx-auto scroll-reveal ${cardsVisible ? 'revealed' : ''}`}
        >
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-border/50 overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <CardContent className="p-6">
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <blockquote className="text-muted-foreground leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {testimonial.relationship}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-16 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Memories Created</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Happy Couples</div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '1s' }}>
              <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
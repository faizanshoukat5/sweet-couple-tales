import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { Star, Heart, Users, Quote, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Sarah & Mike",
    relationship: "Together 3 years",
    location: "San Francisco, CA",
    content: "CoupleConnect has become our digital scrapbook. We love looking back at our memories and seeing how far we've come together! The timeline feature especially helps us remember all our special moments.",
    rating: 5,
    avatar: "💑",
    feature: "Timeline & Memories",
    bgGradient: "from-pink-100 to-rose-100"
  },
  {
    name: "Emma & James",
    relationship: "Married 1 year", 
    location: "Austin, TX",
    content: "The private chat feature keeps us connected throughout the day, and the mood tracker helps us understand each other better. It's like having a relationship coach in our pocket!",
    rating: 5,
    avatar: "👫",
    feature: "Chat & Mood Tracking",
    bgGradient: "from-purple-100 to-pink-100"
  },
  {
    name: "Lisa & David",
    relationship: "Together 2 years",
    location: "New York, NY",
    content: "We especially love the shared calendar and goal tracking. It keeps us aligned on our dreams and helps us plan our future together. Highly recommend to all couples!",
    rating: 5,
    avatar: "💏",
    feature: "Goals & Planning",
    bgGradient: "from-rose-100 to-orange-100"
  },
  {
    name: "Alex & Jordan",
    relationship: "Engaged",
    location: "Seattle, WA",
    content: "Planning our wedding became so much easier with CoupleConnect. The shared albums and milestone tracking helped us document our engagement journey beautifully.",
    rating: 5,
    avatar: "💍",
    feature: "Wedding Planning",
    bgGradient: "from-blue-100 to-purple-100"
  },
  {
    name: "Maria & Carlos",
    relationship: "Married 5 years",
    location: "Miami, FL",
    content: "After years together, CoupleConnect helped us rediscover the magic in our relationship. The daily check-ins and memory reminders keep our love fresh and exciting.",
    rating: 5,
    avatar: "🌹",
    feature: "Relationship Renewal",
    bgGradient: "from-green-100 to-teal-100"
  },
  {
    name: "Taylor & Sam",
    relationship: "Long Distance",
    location: "LA & Chicago",
    content: "Being in a long-distance relationship is tough, but CoupleConnect bridges the gap. The real-time chat and shared experiences make us feel closer than ever.",
    rating: 5,
    avatar: "✈️",
    feature: "Long Distance Love",
    bgGradient: "from-yellow-100 to-amber-100"
  }
];

const TestimonialsSection = () => {
  const { ref: titleRef, isVisible: titleVisible } = useScrollReveal();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollReveal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const nextTestimonials = () => {
    setCurrentIndex((prev) => 
      prev + visibleCount >= testimonials.length ? 0 : prev + visibleCount
    );
  };

  const prevTestimonials = () => {
    setCurrentIndex((prev) => 
      prev === 0 ? Math.max(0, testimonials.length - visibleCount) : Math.max(0, prev - visibleCount)
    );
  };

  const currentTestimonials = testimonials.slice(currentIndex, currentIndex + visibleCount);

  return (
    <section className="py-24 bg-gradient-to-br from-background via-rose-50/20 to-pink-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-rose-200/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced Title */}
        <div 
          ref={titleRef}
          className={`text-center mb-20 scroll-reveal ${titleVisible ? 'revealed' : ''}`}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Heart className="w-10 h-10 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-secondary rounded-full animate-ping"></div>
            </div>
            <h2 className="font-serif text-5xl lg:text-6xl font-bold text-foreground">
              Loved by
              <span className="block text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Happy Couples
              </span>
            </h2>
            <div className="relative">
              <Heart className="w-10 h-10 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute -top-1 -left-1 w-4 h-4 bg-secondary rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of couples who have transformed their relationships with CoupleConnect. 
            <span className="block mt-2 text-primary font-semibold">Real stories, real love, real results.</span>
          </p>
        </div>

        {/* Enhanced Testimonials Carousel */}
        <div 
          ref={cardsRef}
          className={`relative max-w-7xl mx-auto scroll-reveal ${cardsVisible ? 'revealed' : ''}`}
        >
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={prevTestimonials}
              className="rounded-full w-12 h-12 p-0 hover:scale-110 transition-transform"
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: Math.ceil(testimonials.length / visibleCount) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index * visibleCount)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    Math.floor(currentIndex / visibleCount) === index 
                      ? 'bg-primary scale-125' 
                      : 'bg-primary/30 hover:bg-primary/50'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={nextTestimonials}
              className="rounded-full w-12 h-12 p-0 hover:scale-110 transition-transform"
              disabled={currentIndex + visibleCount >= testimonials.length}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">
            {currentTestimonials.map((testimonial, index) => (
              <Card
                key={`${currentIndex}-${index}`}
                className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:rotate-1 bg-gradient-to-br ${testimonial.bgGradient} backdrop-blur-sm animate-fade-in hover-scale`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12 text-primary" />
                </div>

                <CardContent className="p-8 relative z-10">
                  {/* Feature Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-primary mb-4">
                    <Heart className="w-3 h-3" />
                    {testimonial.feature}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-5 h-5 fill-yellow-400 text-yellow-400 animate-pulse" 
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-gray-700 leading-relaxed mb-6 text-sm lg:text-base font-medium relative">
                    <span className="text-primary text-2xl font-serif absolute -top-2 -left-1">"</span>
                    <span className="ml-4">{testimonial.content}</span>
                    <span className="text-primary text-2xl font-serif">"</span>
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="text-4xl transform group-hover:scale-110 transition-transform">
                        {testimonial.avatar}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-800 text-lg">{testimonial.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3" />
                        {testimonial.relationship}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </CardContent>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="font-serif text-3xl font-bold text-foreground mb-4">
              The Numbers Speak for Themselves
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a growing community of couples who trust CoupleConnect with their love stories
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center group animate-fade-in hover-scale" style={{ animationDelay: '0.2s' }}>
              <div className="relative inline-block mb-3">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  25K+
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
              </div>
              <div className="text-muted-foreground font-medium">Memories Created</div>
            </div>
            
            <div className="text-center group animate-fade-in hover-scale" style={{ animationDelay: '0.4s' }}>
              <div className="relative inline-block mb-3">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  12K+
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              </div>
              <div className="text-muted-foreground font-medium">Happy Couples</div>
            </div>
            
            <div className="text-center group animate-fade-in hover-scale" style={{ animationDelay: '0.6s' }}>
              <div className="relative inline-block mb-3">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  4.9★
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
              <div className="text-muted-foreground font-medium">Average Rating</div>
            </div>
            
            <div className="text-center group animate-fade-in hover-scale" style={{ animationDelay: '0.8s' }}>
              <div className="relative inline-block mb-3">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  98%
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1.5s' }}></div>
              </div>
              <div className="text-muted-foreground font-medium">Would Recommend</div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '1s' }}>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 max-w-2xl mx-auto border border-primary/20">
            <h4 className="font-serif text-2xl font-bold text-foreground mb-4">
              Ready to Create Your Love Story?
            </h4>
            <p className="text-muted-foreground mb-6">
              Join thousands of couples who have already started their journey with CoupleConnect
            </p>
            <Button 
              variant="romantic" 
              size="lg" 
              className="font-semibold px-8 py-3 hover:scale-105 transition-transform"
            >
              Start Your Journey Today
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
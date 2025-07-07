import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Create Beautiful Memories",
    description: "Write your love story with rich text, photos, and special dates that matter to you both.",
    icon: "✨"
  },
  {
    title: "Timeline View",
    description: "Browse through your relationship journey with a beautiful chronological timeline.",
    icon: "📅"
  },
  {
    title: "Mark Favorites",
    description: "Highlight your most cherished moments and easily find them whenever you want.",
    icon: "💖"
  },
  {
    title: "Search & Filter",
    description: "Find specific memories by date, keywords, or emotions. Never lose a precious moment.",
    icon: "🔍"
  },
  {
    title: "Private & Secure",
    description: "Your love story is yours alone. All memories are private and encrypted for your peace of mind.",
    icon: "🔒"
  },
  {
    title: "Mobile Optimized",
    description: "Capture memories on the go with our beautiful mobile experience, perfect for any device.",
    icon: "📱"
  }
];

const Features = () => {
  return (
    <section className="py-20 bg-gradient-soft">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Everything You Need for Your
            <span className="text-primary block">Love Story</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Sweet Couple Tales provides all the tools you need to document, organize, 
            and treasure your relationship's most beautiful moments.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-2 bg-card border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-4xl mb-4 group-hover:animate-heart-float">
                  {feature.icon}
                </div>
                <CardTitle className="font-serif text-xl text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed text-center">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMemories } from "@/hooks/useMemories";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

interface Memory {
  id: string;
  title: string;
  content?: string;
  memory_date: string;
  photos?: string[];
  is_favorite?: boolean;
}

const PreviewMemoryCard = ({ memory }: { memory: Memory }) => {
  return (
    <Card className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-1 bg-card border-border/50 overflow-hidden">
      {memory.photos && memory.photos.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={memory.photos[0]} 
            alt={memory.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {memory.is_favorite && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-heart-float">
              <span className="text-white text-sm">💖</span>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
            {memory.title}
          </CardTitle>
          {(!memory.photos || memory.photos.length === 0) && memory.is_favorite && (
            <span className="text-primary animate-heart-float">💖</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {format(parseISO(memory.memory_date), 'MMMM d, yyyy')}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {memory.content || "A beautiful memory without words..."}
        </p>
      </CardContent>
    </Card>
  );
};

const Timeline = () => {
  const { user } = useAuth();
  const { memories, loading } = useMemories();
  const navigate = useNavigate();

  // Show only first 6 memories for preview
  const previewMemories = memories.slice(0, 6);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {user ? "Your Beautiful" : "Your Future"}
            <span className="text-primary block">Memory Timeline</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {user 
              ? "Every moment tells a story. Here are some of your most recent memories."
              : "Every moment tells a story. Start creating your beautiful love journal today."
            }
          </p>
        </div>
        
        {user && previewMemories.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {previewMemories.map((memory, index) => (
                <div 
                  key={memory.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <PreviewMemoryCard memory={memory} />
                </div>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Button 
                variant="romantic" 
                size="lg" 
                className="font-serif text-lg px-8"
                onClick={() => navigate('/dashboard')}
              >
                View All Memories
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="max-w-md mx-auto mb-12 opacity-60">
              <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-dashed border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="text-6xl mb-4">💝</div>
                  <h3 className="font-serif text-xl font-semibold mb-2">Your Story Awaits</h3>
                  <p className="text-muted-foreground">
                    {user 
                      ? "Create your first memory to see it here!"
                      : "Sign up to start building your love story."
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Button 
              variant="romantic" 
              size="lg" 
              className="font-serif text-lg px-8"
              onClick={handleGetStarted}
            >
              {user ? "Create Your First Memory" : "Start Your Journey"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Timeline;
import MemoryCard from "./MemoryCard";
import { Button } from "@/components/ui/button";

// Sample data for demonstration
const sampleMemories = [
  {
    id: 1,
    title: "Our First Date",
    date: "2024-01-15",
    preview: "The nervous excitement, the perfect weather, and that moment when we both knew this was something special. Walking through the park, sharing stories and laughing until our cheeks hurt...",
    isFavorite: true,
    imageUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop"
  },
  {
    id: 2,
    title: "Weekend Getaway",
    date: "2024-02-20",
    preview: "Our spontaneous trip to the mountains. No plans, just us and the open road. The sunset from the cabin was breathtaking, but not as beautiful as seeing you smile...",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
  },
  {
    id: 3,
    title: "Cooking Disaster Success",
    date: "2024-03-10",
    preview: "Attempted to make a fancy dinner and nearly set off the smoke alarm. Ended up with takeout pizza and the best night of laughter. Sometimes the best memories come from the unplanned moments...",
    isFavorite: true
  },
  {
    id: 4,
    title: "Rainy Day Adventures",
    date: "2024-03-25",
    preview: "Got caught in the rain during our walk. Instead of running for cover, we danced in the puddles like kids. Soaked to the bone but couldn't stop giggling...",
    isFavorite: false,
    imageUrl: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=400&h=300&fit=crop"
  }
];

const Timeline = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your Beautiful
            <span className="text-primary block">Memory Timeline</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every moment tells a story. Browse through your journey together and relive 
            the magic of your relationship.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleMemories.map((memory, index) => (
            <div 
              key={memory.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <MemoryCard {...memory} />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="romantic" size="lg" className="font-serif text-lg px-8">
            Create Your First Memory
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Timeline;
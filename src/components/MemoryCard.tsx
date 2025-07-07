import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface MemoryCardProps {
  title: string;
  date: string;
  preview: string;
  isFavorite?: boolean;
  imageUrl?: string;
}

const MemoryCard = ({ title, date, preview, isFavorite = false, imageUrl }: MemoryCardProps) => {
  return (
    <Card className="group hover:shadow-romantic transition-all duration-300 hover:-translate-y-1 bg-card border-border/50 overflow-hidden">
      {imageUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {isFavorite && (
            <div className="absolute top-3 right-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-heart-float">
              <span className="text-white text-sm">💖</span>
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-serif text-lg text-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          {!imageUrl && isFavorite && (
            <span className="text-primary animate-heart-float">💖</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground font-medium">
          {new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
          {preview}
        </p>
        
        <div className="flex gap-2">
          <Button variant="soft" size="sm" className="flex-1">
            Read More
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemoryCard;
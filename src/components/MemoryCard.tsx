import { useState } from 'react';
import { Memory, useMemories } from '@/hooks/useMemories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Tag, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

export interface MemoryCardProps {
  memory: Memory;
  viewMode: 'grid' | 'list';
}

const MemoryCard = ({ memory, viewMode }: MemoryCardProps) => {
  const { toggleFavorite, deleteMemory } = useMemories();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggleFavorite = async () => {
    await toggleFavorite(memory.id, !memory.is_favorite);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this memory? This action cannot be undone.')) {
      setIsDeleting(true);
      try {
        await deleteMemory(memory.id);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const memoryDate = parseISO(memory.memory_date);

  if (viewMode === 'list') {
    return (
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Photo Preview */}
            {memory.photos.length > 0 && (
              <div className="flex-shrink-0">
                <img
                  src={memory.photos[0]}
                  alt={memory.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{memory.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(memoryDate, 'MMM d, yyyy')}
                    {memory.photos.length > 1 && (
                      <span className="text-xs">• {memory.photos.length} photos</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    className={cn(
                      "p-2",
                      memory.is_favorite && "text-red-500"
                    )}
                  >
                    <Heart className={cn("w-4 h-4", memory.is_favorite && "fill-current")} />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="p-2">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {memory.content && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {memory.content}
                </p>
              )}

              {memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {memory.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {memory.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{memory.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
      {/* Photo */}
      {memory.photos.length > 0 && (
        <div className="relative aspect-video overflow-hidden">
          <img
            src={memory.photos[0]}
            alt={memory.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {memory.photos.length > 1 && (
            <Badge className="absolute top-2 right-2 bg-black/50 text-white">
              +{memory.photos.length - 1}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className={cn(
              "absolute top-2 left-2 p-2 backdrop-blur-sm",
              memory.is_favorite 
                ? "bg-white/20 text-red-500" 
                : "bg-black/20 text-white hover:bg-white/30"
            )}
          >
            <Heart className={cn("w-4 h-4", memory.is_favorite && "fill-current")} />
          </Button>
        </div>
      )}

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-lg line-clamp-2 flex-1">{memory.title}</h3>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
          <Calendar className="w-3 h-3" />
          {format(memoryDate, 'MMM d, yyyy')}
        </div>

        {memory.content && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {memory.content}
          </p>
        )}

        {memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {memory.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {memory.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{memory.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Show favorite indicator if no photos */}
        {memory.photos.length === 0 && memory.is_favorite && (
          <div className="mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="text-red-500 p-2"
            >
              <Heart className="w-4 h-4 fill-current mr-2" />
              Favorite
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryCard;
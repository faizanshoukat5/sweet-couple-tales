import { useState } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { format } from 'date-fns';
import MemoryDatePicker from './MemoryDatePicker';
import MemoryTagsInput from './MemoryTagsInput';
import MemoryPhotoUpload from './MemoryPhotoUpload';

interface CreateMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMemoryModal = ({ open, onOpenChange }: CreateMemoryModalProps) => {
  const { createMemory } = useMemories();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    memory_date: new Date(),
    photos: [] as string[],
    tags: [] as string[],
    is_favorite: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      await createMemory({
        title: formData.title,
        content: formData.content,
        memory_date: format(formData.memory_date, 'yyyy-MM-dd'),
        photos: formData.photos,
        tags: formData.tags,
        is_favorite: formData.is_favorite,
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        memory_date: new Date(),
        photos: [],
        tags: [],
        is_favorite: false,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center">
            Create a New Memory ✨
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-base font-medium">
              Memory Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What's this beautiful memory about?"
              required
            />
          </div>

          {/* Date */}
          <MemoryDatePicker
            date={formData.memory_date}
            onDateChange={(date) => setFormData(prev => ({ ...prev, memory_date: date }))}
          />

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-base font-medium">
              Tell your story
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Share the details of this special moment..."
              rows={4}
            />
          </div>

          {/* Photos */}
          <MemoryPhotoUpload
            photos={formData.photos}
            onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
          />

          {/* Tags */}
          <MemoryTagsInput
            tags={formData.tags}
            onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
          />

          {/* Favorite Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant={formData.is_favorite ? "default" : "outline"}
              onClick={() => setFormData(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
              className="flex items-center gap-2"
            >
              <Heart className={cn("w-4 h-4", formData.is_favorite && "fill-current")} />
              Mark as Favorite
            </Button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-gradient-romantic text-white"
            >
              {loading ? 'Creating...' : 'Create Memory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemoryModal;
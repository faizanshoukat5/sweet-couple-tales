import { useState } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { CalendarIcon, Upload, X, Tag, Heart, Images } from 'lucide-react';
import { format } from 'date-fns';
import BulkPhotoUpload from './BulkPhotoUpload';

interface CreateMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateMemoryModal = ({ open, onOpenChange }: CreateMemoryModalProps) => {
  const { createMemory, uploadPhoto } = useMemories();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    memory_date: new Date(),
    photos: [] as string[],
    tags: [] as string[],
    is_favorite: false,
  });
  
  const [newTag, setNewTag] = useState('');

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
      setNewTag('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadPromises = Array.from(files).map(uploadPhoto);
      const photoUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...photoUrls]
      }));
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
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
          <div className="space-y-2">
            <Label className="text-base font-medium">When did this happen? *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.memory_date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.memory_date ? format(formData.memory_date, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.memory_date}
                  onSelect={(date) => date && setFormData(prev => ({ ...prev, memory_date: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

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
          <div className="space-y-3">
            <Label className="text-base font-medium">Photos</Label>
            
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">
                  <Upload className="w-4 h-4 mr-2" />
                  Single Upload
                </TabsTrigger>
                <TabsTrigger value="bulk">
                  <Images className="w-4 h-4 mr-2" />
                  Bulk Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="single" className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo-upload')?.click()}
                    disabled={uploadingPhoto}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
                  </Button>
                  <input
                    id="photo-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="bulk">
                <BulkPhotoUpload 
                  onPhotosUploaded={(photoUrls) => 
                    setFormData(prev => ({
                      ...prev,
                      photos: [...prev.photos, ...photoUrls]
                    }))
                  }
                />
              </TabsContent>
            </Tabs>

            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Memory photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Tags</Label>
            
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim()}
              >
                <Tag className="w-4 h-4" />
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X 
                      className="w-3 h-3 ml-1 hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

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
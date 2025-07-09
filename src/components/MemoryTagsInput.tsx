import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tag, X } from 'lucide-react';

interface MemoryTagsInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const MemoryTagsInput = ({ tags, onTagsChange }: MemoryTagsInputProps) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  return (
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

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
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
  );
};

export default MemoryTagsInput;
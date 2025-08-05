import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = [
  'Romantic', 'Adventurous', 'At Home', 'Outdoors', 'Food & Drink', 'Budget-Friendly', 'Seasonal', 'Double Date'
];

interface AddDateIdeaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDateIdeaModal: React.FC<AddDateIdeaModalProps> = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await (supabase as any).from('date_ideas').insert({
      title,
      description,
      category,
      is_public: true,
      created_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) {
      setError('Failed to add idea. Please try again.');
    } else {
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Date Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={60}
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            maxLength={300}
            rows={3}
          />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                type="button"
                variant={category === cat ? 'romantic' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat)}
                className="flex items-center gap-1"
              >
                <Tag className="w-4 h-4" /> {cat}
              </Button>
            ))}
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <Button type="submit" variant="romantic" disabled={loading} className="mt-2">
            {loading ? 'Adding...' : 'Add Idea'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

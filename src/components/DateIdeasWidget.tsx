import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Shuffle, Plus, Tag } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { supabase } from '@/integrations/supabase/client';
import { AddDateIdeaModal } from './AddDateIdeaModal';

const CATEGORIES = [
  'Romantic', 'Adventurous', 'At Home', 'Outdoors', 'Food & Drink', 'Budget-Friendly', 'Seasonal', 'Double Date'
];

export const DateIdeasWidget: React.FC = () => {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      setLoading(true);
      let query = (supabase as any).from('date_ideas').select('*').order('created_at', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data } = await query;
      setIdeas(data || []);
      setCurrentIdx(0);
      setLoading(false);
    };
    fetchIdeas();
  }, [category, supabase]);

  const shuffleIdea = () => {
    if (ideas.length > 1) {
      let idx;
      do {
        idx = Math.floor(Math.random() * ideas.length);
      } while (idx === currentIdx);
      setCurrentIdx(idx);
    }
  };

  const currentIdea = ideas[currentIdx];

  return (
    <Card className="bg-gradient-to-br from-rose-50 via-white to-pink-100 border-0 shadow-lg rounded-2xl mb-8">
      <CardContent className="flex flex-col items-center gap-4 py-6 px-4 text-center">
        <div className="flex flex-wrap gap-2 mb-2 justify-center">
          {CATEGORIES.map(cat => (
            <Button key={cat} variant={category === cat ? 'romantic' : 'outline'} size="sm" onClick={() => setCategory(cat === category ? null : cat)}>
              <Tag className="w-4 h-4 mr-1" />{cat}
            </Button>
          ))}
        </div>
        {loading ? (
          <div className="text-rose-400">Loading date ideas...</div>
        ) : ideas.length === 0 ? (
          <div className="text-rose-400">No date ideas found for this category.</div>
        ) : (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3">
            <div className="bg-white/80 rounded-xl shadow p-6 flex flex-col items-center gap-2">
              <h3 className="font-serif text-2xl font-bold text-rose-600 mb-1">{currentIdea.title}</h3>
              <div className="text-rose-500 text-sm font-medium mb-2">{currentIdea.category}</div>
              <p className="text-base text-rose-700 mb-2">{currentIdea.description}</p>
              {currentIdea.image_url && <img src={currentIdea.image_url} alt="Date idea" className="rounded-lg max-h-40 object-cover mb-2" />}
              <div className="flex gap-3 mt-2">
                <Button variant="ghost" size="icon" aria-label="Favorite"><Heart className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" aria-label="Shuffle" onClick={shuffleIdea}><Shuffle className="w-5 h-5" /></Button>
              </div>
            </div>
          </div>
        )}
        <Button variant="romantic" className="mt-4 px-6 py-2 rounded-full" onClick={() => setShowAddModal(true)}>
          <Plus className="w-5 h-5 mr-2" /> Add Your Own Date Idea
        </Button>
        <AddDateIdeaModal open={showAddModal} onOpenChange={setShowAddModal} />
      </CardContent>
    </Card>
  );
};

import { useCallback, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MoodEntry {
  id: string;
  user_id: string;
  date: string;
  mood: string;
  created_at: string;
  updated_at: string;
}

export const useMoods = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Get mood for a specific user and date
  const getMood = useCallback(async (userId: string, date: string): Promise<string | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from('moods')
        .select('mood')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching mood:', error);
        return null;
      }
      
      return data?.mood || null;
    } catch (error) {
      console.error('Error in getMood:', error);
      return null;
    }
  }, []);

  // Set mood for a specific user and date
  const setMood = useCallback(async (userId: string, date: string, mood: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from('moods')
        .upsert(
          { user_id: userId, date, mood, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,date' }
        );
      
      if (error) {
        console.error('Error setting mood:', error);
        toast({
          title: "Error saving mood",
          description: "Could not save your mood. Please try again.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Mood saved! 🎭",
        description: "Your daily mood has been recorded.",
      });
      
      return true;
    } catch (error) {
      console.error('Error in setMood:', error);
      toast({
        title: "Error saving mood",
        description: "Could not save your mood. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get mood history for a user
  const getMoodHistory = useCallback(async (userId: string, days: number = 7): Promise<MoodEntry[]> => {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await (supabase as any)
        .from('moods')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching mood history:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getMoodHistory:', error);
      return [];
    }
  }, []);

  return {
    getMood,
    setMood,
    getMoodHistory,
    loading
  };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error) setGoals(data || []);
    setLoading(false);
  };

  const addGoal = async (title: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('goals')
      .insert([{ user_id: user.id, title, completed: false }])
      .select();
    if (!error && data) setGoals((prev) => [...prev, ...data]);
  };

  const toggleGoal = async (id: string, completed: boolean) => {
    const { error } = await supabase
      .from('goals')
      .update({ completed })
      .eq('id', id);
    if (!error) setGoals((prev) => prev.map(g => g.id === id ? { ...g, completed } : g));
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);
    if (!error) setGoals((prev) => prev.filter(g => g.id !== id));
  };

  useEffect(() => { fetchGoals(); }, [user]);

  return { goals, loading, addGoal, toggleGoal, deleteGoal };
};

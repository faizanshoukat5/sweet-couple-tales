import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ImportantDate {
  id: string;
  user_id: string;
  title: string;
  date: string;
  type: string; // e.g. 'anniversary', 'birthday', 'custom'
  created_at: string;
}

export const useImportantDates = () => {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDates = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('important_dates')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (!error) setDates(data || []);
    setLoading(false);
  };

  const addDate = async (title: string, date: string, type: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('important_dates')
      .insert([{ user_id: user.id, title, date, type }])
      .select();
    if (!error && data) setDates((prev) => [...prev, ...data]);
  };

  const deleteDate = async (id: string) => {
    const { error } = await supabase
      .from('important_dates')
      .delete()
      .eq('id', id);
    if (!error) setDates((prev) => prev.filter(d => d.id !== id));
  };

  useEffect(() => { fetchDates(); }, [user]);

  return { dates, loading, addDate, deleteDate };
};

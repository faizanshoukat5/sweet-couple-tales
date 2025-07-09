import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export interface Memory {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  memory_date: string;
  photos: string[];
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMemoryData {
  title: string;
  content?: string;
  memory_date: string;
  photos?: string[];
  tags?: string[];
  is_favorite?: boolean;
}

export const useMemories = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchMemories = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('memories')
        .select('*')
        .order('memory_date', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error('Error fetching memories:', error);
      toast({
        title: "Error",
        description: "Failed to load memories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMemory = async (memoryData: CreateMemoryData) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('memories')
        .insert({
          user_id: user.id,
          ...memoryData,
        })
        .select()
        .single();

      if (error) throw error;

      setMemories(prev => [data, ...prev]);
      toast({
        title: "Memory Created",
        description: "Your beautiful memory has been saved!",
      });

      return data;
    } catch (error) {
      console.error('Error creating memory:', error);
      toast({
        title: "Error",
        description: "Failed to create memory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateMemory = async (id: string, updates: Partial<CreateMemoryData>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('memories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setMemories(prev => 
        prev.map(memory => memory.id === id ? data : memory)
      );

      toast({
        title: "Memory Updated",
        description: "Your memory has been updated successfully!",
      });

      return data;
    } catch (error) {
      console.error('Error updating memory:', error);
      toast({
        title: "Error",
        description: "Failed to update memory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteMemory = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMemories(prev => prev.filter(memory => memory.id !== id));
      toast({
        title: "Memory Deleted",
        description: "Your memory has been removed.",
      });
    } catch (error) {
      console.error('Error deleting memory:', error);
      toast({
        title: "Error",
        description: "Failed to delete memory",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleFavorite = async (id: string, isFavorite: boolean) => {
    await updateMemory(id, { is_favorite: isFavorite });
  };

  const uploadPhoto = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('memory-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('memory-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload photo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadMultiplePhotos = async (files: FileList): Promise<string[]> => {
    if (!user) throw new Error('User not authenticated');

    const uploadPromises = Array.from(files).map(file => uploadPhoto(file));
    
    try {
      const results = await Promise.allSettled(uploadPromises);
      const successfulUploads = results
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failedCount = results.length - successfulUploads.length;
      
      if (failedCount > 0) {
        toast({
          title: "Partial Upload Success",
          description: `${successfulUploads.length} photos uploaded, ${failedCount} failed`,
          variant: "destructive",
        });
      }
      
      return successfulUploads;
    } catch (error) {
      console.error('Error uploading multiple photos:', error);
      throw error;
    }
  };

  const exportMemories = async () => {
    try {
      const exportData = {
        exported_at: new Date().toISOString(),
        memories_count: memories.length,
        memories: memories.map(memory => ({
          ...memory,
          photos: memory.photos // Include photo URLs
        }))
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sweet-couple-tales-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Exported ${memories.length} memories successfully!`,
      });
    } catch (error) {
      console.error('Error exporting memories:', error);
      toast({
        title: "Export Error",
        description: "Failed to export memories",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [user]);

  return {
    memories,
    loading,
    createMemory,
    updateMemory,
    deleteMemory,
    toggleFavorite,
    uploadPhoto,
    uploadMultiplePhotos,
    exportMemories,
    refetch: fetchMemories,
  };
};
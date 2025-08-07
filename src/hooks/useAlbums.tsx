import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import jsPDF from 'jspdf';

export interface Album {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export const useAlbums = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAlbums = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from('albums')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (!error) setAlbums(data || []);
    setLoading(false);
  };

  const addAlbum = async (name: string, description?: string) => {
    if (!user) return undefined;
    const { data, error } = await supabase
      .from('albums')
      .insert([{ user_id: user.id, name, description }])
      .select();
    if (!error && data) {
      setAlbums((prev) => [...prev, ...data]);
      return data[0];
    }
    return undefined;
  };

  const deleteAlbum = async (id: string) => {
    const { error } = await supabase
      .from('albums')
      .delete()
      .eq('id', id);
    if (!error) setAlbums((prev) => prev.filter(a => a.id !== id));
  };

  useEffect(() => { fetchAlbums(); }, [user]);

  return { albums, loading, addAlbum, deleteAlbum };
};

export const useAlbumAsPDF = (album, albumMemories, albumPhotos, signedUrls, memories) => {
  const exportAlbumAsPDF = async () => {
    try {
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(18);
      doc.text(`Album: ${album.name}`, 10, y);
      y += 10;
      if (album.description) {
        doc.setFontSize(12);
        doc.text(album.description, 10, y);
        y += 8;
      }
      doc.setFontSize(14);
      doc.text('Direct Album Photos:', 10, y);
      y += 8;
      for (const photo of albumPhotos) {
        if (y > 230) { doc.addPage(); y = 10; }
        try {
          const img = await toDataUrl(signedUrls[photo.id] || photo.url);
          doc.addImage(img, 'JPEG', 10, y, 40, 30);
          y += 32;
        } catch {}
      }
      y += 8;
      doc.setFontSize(14);
      doc.text('Memories in Album:', 10, y);
      y += 8;
      for (const memoryId of albumMemories.memoryIds) {
        const memory = memories.find(m => m.id === memoryId);
        if (!memory) continue;
        if (y > 270) { doc.addPage(); y = 10; }
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.text(memory.title, 10, y);
        y += 7;
        doc.setFont(undefined, 'normal');
        doc.text(`Date: ${memory.memory_date}`, 10, y);
        y += 6;
        if (memory.content) {
          const splitContent = doc.splitTextToSize(memory.content, 180);
          doc.text(splitContent, 10, y);
          y += splitContent.length * 6;
        }
        if (memory.photos && memory.photos.length > 0) {
          for (const photo of memory.photos) {
            if (y > 230) { doc.addPage(); y = 10; }
            try {
              const img = await toDataUrl(photo);
              doc.addImage(img, 'JPEG', 10, y, 40, 30);
              y += 32;
            } catch {}
          }
        }
        y += 8;
      }
      doc.save(`album-${album.name.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      alert('Failed to export album as PDF');
    }
  };
  // Helper to convert image URL to base64 data URL
  const toDataUrl = (url: string) => new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject();
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg'));
    };
    img.onerror = reject;
    img.src = url;
  });
  return { exportAlbumAsPDF };
};

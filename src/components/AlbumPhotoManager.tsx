import { useAlbumPhotos } from '@/hooks/useAlbumPhotos';
import { useMemories } from '@/hooks/useMemories';
import { useState, useRef, useEffect } from 'react';
import { useSignedMemoryPhotoUrls } from '@/hooks/useSignedMemoryPhotoUrls';
import { Button } from '@/components/ui/button';
import { uploadAlbumPhotoFile } from '@/utils/uploadAlbumPhotoFile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, Plus, Image as ImageIcon, Trash2 } from 'lucide-react';

interface AlbumPhotoManagerProps {
  albumId: string;
}

const AlbumPhotoManager = ({ albumId }: AlbumPhotoManagerProps) => {
  const { photos, loading, addPhoto, deletePhoto, signedUrls } = useAlbumPhotos(albumId);
  const { user } = useAuth();
  const { memories, loading: loadingMemories } = useMemories();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Close lightbox with Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewUrl) {
        setPreviewUrl(null);
      }
    };

    if (previewUrl) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [previewUrl]);

  // Get all memory photo URLs (flattened)
  const memoryPhotos: { url: string; memoryId: string; memoryTitle: string }[] = [];
  memories.forEach(mem => {
    if (mem.photos && mem.photos.length > 0) {
      mem.photos.forEach(url => {
        memoryPhotos.push({ url, memoryId: mem.id, memoryTitle: mem.title });
      });
    }
  });

  // Prevent adding duplicate photos (by URL)
  const albumPhotoUrls = new Set(photos.map(p => p.url));

  // Get signed URLs for memory photos
  const signedMemoryPhotoUrls = useSignedMemoryPhotoUrls(memoryPhotos);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);
    const url = await uploadAlbumPhotoFile(user.id, albumId, file);
    setUploading(false);
    setFile(null);
    if (url) {
      await addPhoto(url);
      toast({
        title: 'Upload successful',
        description: 'Your photo has been added to the album!',
        variant: 'default',
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Could not upload photo. Please check your storage policy and try again.',
        variant: 'destructive',
      });
    }
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.7;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="my-6">
      {/* Memory Photos Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2 text-rose-600 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" /> Add Photos from Memories
        </h3>
        {loadingMemories ? (
          <div className="text-muted-foreground">Loading memory photos...</div>
        ) : memoryPhotos.length === 0 ? (
          <div className="text-muted-foreground">No memory photos found.</div>
        ) : (
          <div className="flex flex-wrap gap-4">
            {memoryPhotos.map((mp, idx) => (
              <div key={mp.url + mp.memoryId} className="flex flex-col items-center w-28">
                <img
                  src={signedMemoryPhotoUrls[mp.url] || mp.url}
                  alt={mp.memoryTitle}
                  className="w-24 h-20 object-cover rounded-lg border border-rose-200 mb-1 bg-gray-100"
                  onError={e => {
                    console.error('Failed to load memory photo:', mp.url, 'Signed URL:', signedMemoryPhotoUrls[mp.url]);
                    e.currentTarget.src = 'https://via.placeholder.com/100?text=Photo';
                  }}
                  onLoad={() => console.log('Successfully loaded memory photo:', mp.url)}
                />
                <span className="text-xs text-center truncate w-full" title={mp.memoryTitle}>{mp.memoryTitle}</span>
                <Button
                  size="sm"
                  variant={albumPhotoUrls.has(mp.url) ? 'secondary' : 'default'}
                  className="mt-1 w-full"
                  disabled={albumPhotoUrls.has(mp.url)}
                  onClick={async () => {
                    await addPhoto(mp.url);
                    toast({ title: 'Photo added!', description: 'Memory photo added to album.' });
                  }}
                >
                  {albumPhotoUrls.has(mp.url) ? 'Added' : 'Add'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <form onSubmit={handleFileUpload} className="flex flex-col md:flex-row gap-3 mb-8 items-center">
        <div
          className={`flex-1 flex items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer ${dragActive ? 'border-rose-400 bg-rose-50' : 'border-rose-200 bg-white'}`}
          onDragOver={e => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
          onDrop={handleDrop}
          onClick={() => document.getElementById('album-photo-input')?.click()}
        >
          <UploadCloud className="w-8 h-8 text-rose-300 mr-3" />
          <span className="text-rose-500 font-medium">Drag & drop or click to select a photo</span>
          <input
            id="album-photo-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <Button type="submit" disabled={uploading || !file} className="rounded-full px-6 py-2 text-lg font-semibold flex items-center gap-2">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
        {file && (
          <span className="text-xs text-muted-foreground">Selected: {file.name}</span>
        )}
      </form>
      {loading ? (
        <div className="flex items-center justify-center h-32 w-full text-muted-foreground">Loading photos...</div>
      ) : photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 w-full text-muted-foreground">
          <ImageIcon className="w-12 h-12 mb-2 text-rose-200" />
          No photos in this album yet.
        </div>
      ) : (
        <div className="relative">
          <Button
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-rose-100 shadow"
            size="icon"
            variant="ghost"
            onClick={() => scrollSlider('left')}
            style={{ display: photos.length > 0 ? 'block' : 'none' }}
          >
            ◀
          </Button>
          <div
            ref={sliderRef}
            className="flex overflow-x-auto gap-6 pb-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent"
            style={{ scrollBehavior: 'smooth' }}
          >
            {photos.map(photo => (
              <div key={photo.id} className="relative group min-w-[180px] max-w-[220px] flex-shrink-0">
                <img
                  src={signedUrls[photo.id] || 'https://via.placeholder.com/300x200?text=Loading'}
                  alt="Album Photo"
                  className="w-full h-44 object-cover rounded-xl shadow-lg cursor-pointer transition-all duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-rose-400 bg-gray-100 group-hover:brightness-110"
                  onClick={() => {
                    if (signedUrls[photo.id]) {
                      console.log('Opening photo in lightbox:', signedUrls[photo.id]);
                      setPreviewUrl(signedUrls[photo.id]);
                    } else {
                      console.warn('No signed URL available for photo:', photo.id);
                    }
                  }}
                  onError={e => {
                    console.error('Failed to load album photo:', photo.url, 'Signed URL:', signedUrls[photo.id]);
                    e.currentTarget.src = 'https://via.placeholder.com/150?text=Photo';
                  }}
                  onLoad={() => console.log('Successfully loaded album photo:', photo.url)}
                  tabIndex={0}
                  role="button"
                  aria-label="Click to view full size"
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (signedUrls[photo.id]) {
                        setPreviewUrl(signedUrls[photo.id]);
                      }
                    }
                  }}
                />
                {/* Overlay with view icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-xl">
                  <div className="bg-white/90 rounded-full p-2 shadow-lg">
                    <ImageIcon className="w-5 h-5 text-rose-600" />
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 bg-white/80 hover:bg-white/90"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo.id);
                  }}
                  aria-label="Delete photo"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          {/* Enhanced Lightbox preview with better styling and controls */}
          {previewUrl && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" 
              onClick={() => setPreviewUrl(null)}
            >
              <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center" onClick={e => e.stopPropagation()}>
                <img 
                  src={previewUrl} 
                  alt="Album Photo Preview" 
                  className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl border-4 border-white/20 animate-fade-in" 
                />
                <Button 
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white border-0" 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setPreviewUrl(null)}
                  aria-label="Close preview"
                >
                  ✕
                </Button>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/80 text-sm bg-black/50 px-3 py-1 rounded-full">
                  Click anywhere outside to close
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumPhotoManager;

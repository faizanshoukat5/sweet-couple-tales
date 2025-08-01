import { useAlbumPhotos } from '@/hooks/useAlbumPhotos';
import { useState, useRef } from 'react';
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

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
                  src={signedUrls[photo.id] || ''}
                  alt="Album Photo"
                  className="w-full h-44 object-cover rounded-xl shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-rose-400 bg-gray-100"
                  onClick={() => signedUrls[photo.id] && setPreviewUrl(signedUrls[photo.id])}
                  onError={e => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Photo')}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 bg-white/80"
                  onClick={() => deletePhoto(photo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
          {/* Lightbox preview */}
          {previewUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreviewUrl(null)}>
              <img src={previewUrl} alt="Preview" className="max-h-[80vh] max-w-[90vw] rounded-2xl shadow-2xl border-4 border-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumPhotoManager;

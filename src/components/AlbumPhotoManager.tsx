import { useAlbumPhotos } from '@/hooks/useAlbumPhotos';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadAlbumPhotoFile } from '@/utils/uploadAlbumPhotoFile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

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
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xl font-bold text-rose-600 flex items-center gap-2">
          Direct Album Photos
          <span className="inline-block bg-rose-100 text-rose-600 rounded-full px-2 py-0.5 text-xs font-semibold">
            {photos.length}
          </span>
        </h4>
      </div>
      <form onSubmit={handleFileUpload} className="flex gap-2 mb-6 items-center">
        <input type="file" accept="image/*" onChange={handleFileChange} className="border rounded px-2 py-1" />
        <Button type="submit" disabled={uploading || !file}>
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </form>
      {loading ? (
        <div>Loading...</div>
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
            className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent"
            style={{ scrollBehavior: 'smooth' }}
          >
            {photos.map(photo => (
              <div key={photo.id} className="relative group min-w-[140px] max-w-[180px] flex-shrink-0">
                <img
                  src={signedUrls[photo.id] || ''}
                  alt="Album Photo"
                  className="w-full h-32 object-cover rounded-lg shadow-md cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-rose-400 bg-gray-100"
                  onClick={() => signedUrls[photo.id] && setPreviewUrl(signedUrls[photo.id])}
                  onError={e => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Photo')}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-1 right-1 opacity-80 hover:opacity-100"
                  onClick={() => deletePhoto(photo.id)}
                  title="Delete photo"
                >
                  ✕
                </Button>
              </div>
            ))}
            {photos.length === 0 && <div className="text-center text-gray-400">No direct photos in this album yet.</div>}
          </div>
          <Button
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-rose-100 shadow"
            size="icon"
            variant="ghost"
            onClick={() => scrollSlider('right')}
            style={{ display: photos.length > 0 ? 'block' : 'none' }}
          >
            ▶
          </Button>
        </div>
      )}
      {/* Lightbox Modal for Preview */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-2xl w-full p-4" onClick={e => e.stopPropagation()}>
            <img src={previewUrl} alt="Preview" className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border-4 border-white" />
            <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setPreviewUrl(null)}>
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumPhotoManager;

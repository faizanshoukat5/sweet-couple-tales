import { useState, useEffect } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Images } from 'lucide-react';
import BulkPhotoUpload from './BulkPhotoUpload';
import { getSignedMemoryPhotoUrl } from '@/utils/getSignedMemoryPhotoUrl';

interface MemoryPhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  coverPhoto?: string | null;
  onCoverChange?: (path: string | null) => void;
}

const MemoryPhotoUpload = ({ photos, onPhotosChange, coverPhoto, onCoverChange }: MemoryPhotoUploadProps) => {
  const { uploadPhoto } = useMemories();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Fetch signed URLs for any photo path that isn't already a full signed URL.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!photos.length) { setSignedUrls({}); return; }
      const entries = await Promise.all(photos.map(async (p) => {
        // Determine if p is already a signed URL (contains token) or a public URL; if so keep as-is.
        if (p.startsWith('http') && !p.includes('/storage/v1/object/public/memory-photos/')) {
          return [p, p] as const;
        }
        // If it's a full public URL, extract storage path after bucket prefix.
        let path = p;
        const marker = '/storage/v1/object/public/memory-photos/';
        if (p.includes(marker)) {
          path = p.split(marker)[1];
        }
        if (!path) return [p, p] as const;
        const signed = await getSignedMemoryPhotoUrl(path);
        return [p, signed || p] as const;
      }));
      if (!cancelled) {
        const map: Record<string, string> = {};
        entries.forEach(([orig, url]) => { map[orig] = url; });
        setSignedUrls(map);
        // Clear any error states for photos that now have a signed URL
        setErrors(prev => {
          const next = { ...prev };
          Object.keys(map).forEach(k => { if (map[k] && next[k]) delete next[k]; });
          return next;
        });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [photos]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const uploadPromises = Array.from(files).map(uploadPhoto);
      const photoUrls = await Promise.all(uploadPromises);
      
      onPhotosChange([...photos, ...photoUrls]);
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const handleBulkPhotosUploaded = (photoUrls: string[]) => {
    onPhotosChange([...photos, ...photoUrls]);
  };

  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Photos</Label>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single">
            <Upload className="w-4 h-4 mr-2" />
            Single Upload
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Images className="w-4 h-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="single" className="space-y-3">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={uploadingPhoto}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
            </Button>
            <input
              id="photo-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkPhotoUpload onPhotosUploaded={handleBulkPhotosUploaded} />
        </TabsContent>
      </Tabs>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photos.map((photo, index) => {
            const isRawPath = !photo.startsWith('http');
            const signed = signedUrls[photo];
            const readyUrl = isRawPath ? signed : (signed || photo);
            const failed = errors[photo];
            return (
              <div key={index} className="relative group">
                {failed ? (
                  <div className="w-full h-24 flex items-center justify-center text-xs bg-muted rounded-lg text-muted-foreground">
                    Failed
                  </div>
                ) : !readyUrl && isRawPath ? (
                  <div className="w-full h-24 animate-pulse bg-muted/40 rounded-lg" />
                ) : (
                  <img
                    src={readyUrl}
                    alt={`Memory photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                    loading="lazy"
                    onError={() => setErrors(prev => ({ ...prev, [photo]: true }))}
                  />
                )}
                {onCoverChange && (
                  <Button
                    type="button"
                    size="sm"
                    variant={coverPhoto === photo ? 'default' : 'outline'}
                    className="absolute left-1 bottom-1 h-6 px-2 text-[10px]"
                    onClick={() => onCoverChange(coverPhoto === photo ? null : photo)}
                  >
                    {coverPhoto === photo ? 'Cover ✓' : 'Make Cover'}
                  </Button>
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removePhoto(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MemoryPhotoUpload;
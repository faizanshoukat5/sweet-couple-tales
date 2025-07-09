import { useState } from 'react';
import { useMemories } from '@/hooks/useMemories';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Images } from 'lucide-react';
import BulkPhotoUpload from './BulkPhotoUpload';

interface MemoryPhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

const MemoryPhotoUpload = ({ photos, onPhotosChange }: MemoryPhotoUploadProps) => {
  const { uploadPhoto } = useMemories();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={photo}
                alt={`Memory photo ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoryPhotoUpload;
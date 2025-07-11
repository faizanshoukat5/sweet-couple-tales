import { useAlbums } from '@/hooks/useAlbums';
import { useMemories } from '@/hooks/useMemories';
import { useAlbumMemories } from '@/hooks/useAlbumMemories';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import AlbumPhotoManager from '@/components/AlbumPhotoManager';
import { useAlbumPhotos } from '@/hooks/useAlbumPhotos';
import { useAlbumAsPDF } from '@/hooks/useAlbums';

const AlbumBrowser = () => {
  const { albums } = useAlbums();
  const { memories } = useMemories();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const albumMemories = useAlbumMemories(selectedAlbum || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { photos, signedUrls } = useAlbumPhotos(selectedAlbum || '');
  // Find selected album details
  const album = albums.find(a => a.id === selectedAlbum);
  const { exportAlbumAsPDF } = useAlbumAsPDF(
    album,
    albumMemories,
    photos,
    signedUrls,
    memories
  );
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.7;
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!selectedAlbum) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-rose-700">Photo Albums</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {albums.map(album => (
            <div
              key={album.id}
              className="group cursor-pointer rounded-xl shadow-md p-4 bg-gradient-to-br from-rose-100 to-pink-50 border border-rose-200 hover:border-rose-400 transition-all duration-200 hover:scale-105 flex flex-col justify-between"
              onClick={() => setSelectedAlbum(album.id)}
            >
              <div>
                <h3 className="text-xl font-bold text-rose-700 group-hover:underline mb-2 truncate">{album.name}</h3>
                {album.description && <p className="text-gray-500 mb-2 text-sm truncate">{album.description}</p>}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full font-semibold"
                onClick={e => { e.stopPropagation(); setSelectedAlbum(album.id); }}
              >
                View Album
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Sticky Album Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur rounded-t-2xl shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between border-b border-rose-100">
          <div>
            <h2 className="text-2xl font-bold text-rose-700 mb-1 truncate">{album?.name}</h2>
            {album?.description && <p className="text-gray-500 text-sm truncate">{album.description}</p>}
          </div>
          <Button variant="ghost" onClick={() => setSelectedAlbum(null)} className="self-end md:self-auto mt-2 md:mt-0">
            ✕
          </Button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Direct Album Photos Slider Card */}
          <div className="rounded-xl shadow bg-white p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-rose-600">Direct Album Photos</h3>
              <Button size="sm" variant="outline" onClick={exportAlbumAsPDF}>
                Export Album as PDF
              </Button>
            </div>
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
                className="flex overflow-x-auto gap-3 pb-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent"
                style={{ scrollBehavior: 'smooth', minHeight: '70px' }}
              >
                {photos.map(photo => (
                  <div key={photo.id} className="relative group min-w-[90px] max-w-[110px] flex-shrink-0">
                    <img
                      src={signedUrls[photo.id] || ''}
                      alt="Album Photo"
                      className="w-full h-16 object-cover rounded shadow cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-rose-400 bg-gray-100"
                      onClick={() => signedUrls[photo.id] && setPhotoPreview(signedUrls[photo.id])}
                      onError={e => (e.currentTarget.src = 'https://via.placeholder.com/90x90?text=Photo')}
                    />
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
            {/* Lightbox Modal for Preview */}
            {photoPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setPhotoPreview(null)}>
                <div className="relative max-w-md w-full p-1" onClick={e => e.stopPropagation()}>
                  <img src={photoPreview} alt="Preview" className="w-full max-h-[60vh] object-contain rounded-xl shadow-2xl border-4 border-white" />
                  <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setPhotoPreview(null)}>
                    ✕
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Photo Upload Manager Card */}
          <div className="rounded-xl shadow bg-white p-3">
            <AlbumPhotoManager albumId={selectedAlbum} />
          </div>

          {/* Memories in Album Card */}
          <div className="rounded-xl shadow bg-white p-3">
            <h3 className="text-lg font-semibold text-rose-700 mb-2">Memories in Album</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {albumMemories.memoryIds.length === 0 && <div className="col-span-full text-center text-gray-400">No memories in this album yet.</div>}
              {memories.filter(m => albumMemories.memoryIds.includes(m.id)).map(memory => (
                <div key={memory.id} className="border rounded-lg p-2 flex flex-col items-center bg-pink-50 shadow-sm hover:shadow-md transition">
                  {memory.photos && memory.photos.length > 0 && (
                    <div className="w-full flex flex-wrap gap-1 mb-1 justify-center">
                      {memory.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={memory.title}
                          className="w-10 h-10 object-cover rounded cursor-pointer hover:ring-2 hover:ring-rose-400 transition"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  <span className="font-semibold text-center text-xs mb-1">{memory.title}</span>
                  <span className="text-gray-500 text-xs mb-1">{memory.memory_date}</span>
                  <Button size="sm" variant="ghost" onClick={() => albumMemories.removeMemoryFromAlbum(memory.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Memories to Album Card */}
          <div className="rounded-xl shadow bg-white p-3">
            <h4 className="text-base font-semibold mb-2 text-rose-600">Add Memories to Album</h4>
            <ul className="space-y-2">
              {memories.filter(m => !albumMemories.memoryIds.includes(m.id)).map(memory => (
                <li key={memory.id} className="border rounded p-2 flex items-center gap-2 bg-white shadow-sm">
                  {memory.photos && memory.photos.length > 0 && (
                    <img
                      src={memory.photos[0]}
                      alt={memory.title}
                      className="w-8 h-8 object-cover rounded mr-1"
                    />
                  )}
                  <span className="font-semibold text-xs">{memory.title}</span>
                  <span className="ml-2 text-gray-500 text-xs">{memory.memory_date}</span>
                  <Button size="sm" variant="outline" onClick={() => albumMemories.addMemoryToAlbum(memory.id)}>
                    Add to Album
                  </Button>
                </li>
              ))}
              {memories.filter(m => !albumMemories.memoryIds.includes(m.id)).length === 0 && <li className="text-gray-400">All memories are already in this album.</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumBrowser;

import { useAlbums } from '@/hooks/useAlbums';
import { useMemories } from '@/hooks/useMemories';
import { useAlbumMemories } from '@/hooks/useAlbumMemories';
import { useState, useRef } from 'react';
import { useAllAlbumPhotoCounts } from '@/hooks/useAllAlbumPhotoCounts';
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

  const { albumPhotoCounts, loading: photoCountsLoading } = useAllAlbumPhotoCounts();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const { addAlbum } = useAlbums();
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      const newAlbum = await addAlbum(form.name, form.description);
      setForm({ name: '', description: '' });
      setShowAdd(false);
      // Automatically open the new album after creation
      if (newAlbum && typeof newAlbum.id === 'string') {
        setSelectedAlbum(newAlbum.id);
      }
    }
  };

  if (!selectedAlbum) {
    return (
      <div className="max-w-5xl mx-auto my-12 p-6 bg-gradient-to-br from-rose-50 via-white to-pink-100 rounded-2xl shadow-xl border-0">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-rose-700 font-serif tracking-tight">Photo Albums</h2>
        {albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-lg text-rose-500 mb-4">No albums yet. Create your first album!</p>
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-2 mb-6 items-center bg-rose-50 rounded-xl p-4 shadow-inner w-full max-w-xl">
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Album name (e.g. Paris Trip)"
                className="flex-1 border rounded px-3 py-2"
                required
              />
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                className="flex-1 border rounded px-3 py-2"
              />
              <Button type="submit" variant="romantic" className="rounded-full px-6">Create</Button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {albums.map(album => (
              <div
                key={album.id}
                className="group cursor-pointer rounded-2xl shadow-lg p-6 bg-gradient-to-br from-rose-100 to-pink-50 border border-rose-200 hover:border-rose-400 transition-all duration-200 hover:scale-105 flex flex-col justify-between relative"
                onClick={() => setSelectedAlbum(album.id)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedAlbum(album.id); }}
                role="button"
                aria-label={`View album ${album.name}`}
              >
                <div className="w-full h-32 bg-white rounded-xl flex items-center justify-center mb-4 overflow-hidden border border-rose-100">
                  {/* Album cover placeholder, replace with real cover if available */}
                  <span className="text-rose-200 text-6xl font-bold"><svg width="48" height="48" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fbb6ce"/><path d="M7 17l3-3.5 2.5 3L17 13l4 5H3l4-5z" fill="#fff"/></svg></span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-rose-700 group-hover:underline mb-1 truncate">{album.name}</h3>
                  {album.description && <p className="text-gray-500 mb-2 text-base truncate">{album.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold mb-2">
                    <span className="bg-rose-100 rounded-full px-3 py-0.5">{albumPhotoCounts[album.id] || 0} photos</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="romantic"
                  className="mt-4 w-full font-semibold rounded-full"
                  onClick={e => { e.stopPropagation(); setSelectedAlbum(album.id); }}
                >
                  View Album
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Sticky Album Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-br from-rose-50 via-white to-pink-100 backdrop-blur rounded-t-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between border-b border-rose-100">
          <div>
            <h2 className="text-3xl font-extrabold text-rose-700 mb-1 truncate font-serif">{album?.name}</h2>
            {album?.description && <p className="text-gray-500 text-base truncate">{album.description}</p>}
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button size="sm" variant="outline" onClick={exportAlbumAsPDF} className="rounded-full font-semibold">Export as PDF</Button>
            <Button variant="ghost" onClick={() => setSelectedAlbum(null)} className="rounded-full text-2xl px-3 py-1">✕</Button>
          </div>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-br from-white to-rose-50">
          {/* Direct Album Photos Slider Card */}
          <div className="rounded-2xl shadow bg-white p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-rose-600">Album Photos</h3>
            </div>
            <div className="relative">
              <Button
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-rose-100 shadow"
                size="icon"
                variant="ghost"
                onClick={() => scrollSlider('left')}
                style={{ display: photos.length > 0 ? 'block' : 'none' }}
                aria-label="Scroll left"
              >
                ◀
              </Button>
              <div
                ref={sliderRef}
                className="flex overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-rose-200 scrollbar-track-transparent"
                style={{ scrollBehavior: 'smooth', minHeight: '90px' }}
              >
                {photos.map(photo => (
                  <div key={photo.id} className="relative group min-w-[120px] max-w-[160px] flex-shrink-0">
                    <img
                      src={signedUrls[photo.id] || ''}
                      alt="Album Photo"
                      className="w-full h-28 object-cover rounded-xl shadow-lg cursor-pointer transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-rose-400 bg-gray-100"
                      onClick={() => signedUrls[photo.id] && setPhotoPreview(signedUrls[photo.id])}
                      onError={e => (e.currentTarget.src = 'https://via.placeholder.com/120x120?text=Photo')}
                      tabIndex={0}
                      role="button"
                      aria-label="View photo in lightbox"
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') signedUrls[photo.id] && setPhotoPreview(signedUrls[photo.id]); }}
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
                aria-label="Scroll right"
              >
                ▶
              </Button>
            </div>
            {/* Lightbox Modal for Preview */}
            {photoPreview && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setPhotoPreview(null)}>
                <div className="relative max-w-2xl w-full p-2" onClick={e => e.stopPropagation()}>
                  <img src={photoPreview} alt="Preview" className="w-full max-h-[70vh] object-contain rounded-2xl shadow-2xl border-4 border-white animate-fade-in" />
                  <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setPhotoPreview(null)} aria-label="Close preview">
                    ✕
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Direct Photo Upload Manager Card */}
          <div className="rounded-2xl shadow bg-white p-4">
            <AlbumPhotoManager albumId={selectedAlbum} />
          </div>

          {/* Memories in Album Card */}
          <div className="rounded-2xl shadow bg-white p-4">
            <h3 className="text-xl font-semibold text-rose-700 mb-3">Memories in Album</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {albumMemories.memoryIds.length === 0 && <div className="col-span-full text-center text-gray-400">No memories in this album yet.</div>}
              {memories.filter(m => albumMemories.memoryIds.includes(m.id)).map(memory => (
                <div key={memory.id} className="border rounded-xl p-3 flex flex-col items-center bg-pink-50 shadow-sm hover:shadow-md transition">
                  {memory.photos && memory.photos.length > 0 && (
                    <div className="w-full flex flex-wrap gap-1 mb-2 justify-center">
                      {memory.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={memory.title}
                          className="w-12 h-12 object-cover rounded cursor-pointer hover:ring-2 hover:ring-rose-400 transition"
                          onClick={() => window.open(photo, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                  <span className="font-semibold text-center text-base mb-1">{memory.title}</span>
                  <span className="text-gray-500 text-xs mb-2">{memory.memory_date}</span>
                  <Button size="sm" variant="ghost" className="rounded-full text-rose-500 hover:bg-rose-100" onClick={() => albumMemories.removeMemoryFromAlbum(memory.id)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Memories to Album Card */}
          <div className="rounded-2xl shadow bg-white p-4">
            <h4 className="text-lg font-semibold mb-3 text-rose-600">Add Memories to Album</h4>
            <ul className="space-y-3">
              {memories.filter(m => !albumMemories.memoryIds.includes(m.id)).map(memory => (
                <li key={memory.id} className="border rounded-xl p-3 flex items-center gap-3 bg-white shadow-sm">
                  {memory.photos && memory.photos.length > 0 && (
                    <img
                      src={memory.photos[0]}
                      alt={memory.title}
                      className="w-10 h-10 object-cover rounded mr-2"
                    />
                  )}
                  <span className="font-semibold text-base">{memory.title}</span>
                  <span className="ml-2 text-gray-500 text-xs">{memory.memory_date}</span>
                  <Button size="sm" variant="romantic" className="rounded-full ml-auto" onClick={() => albumMemories.addMemoryToAlbum(memory.id)}>
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

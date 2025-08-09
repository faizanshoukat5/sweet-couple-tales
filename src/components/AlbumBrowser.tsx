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
  const { albums, addAlbum, deleteAlbum, updateAlbum, updateAlbumOrder } = useAlbums();
  const { memories } = useMemories();
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const albumMemories = useAlbumMemories(selectedAlbum || '');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const { photos, signedUrls } = useAlbumPhotos(selectedAlbum || '');
  const album = albums.find(a => a.id === selectedAlbum);
  const { exportAlbumAsPDF } = useAlbumAsPDF(
    album,
    albumMemories,
    photos,
    signedUrls,
    memories
  );
  const sliderRef = useRef<HTMLDivElement>(null);
  const { albumPhotoCounts, loading: photoCountsLoading } = useAllAlbumPhotoCounts();
  const [form, setForm] = useState({ name: '', description: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [showDelete, setShowDelete] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date' | 'name' | 'count'>('date');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [dragged, setDragged] = useState<string | null>(null);

  // Filter and sort albums
  let filteredAlbums = albums.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  if (sort === 'name') filteredAlbums = [...filteredAlbums].sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'count') filteredAlbums = [...filteredAlbums].sort((a, b) => (albumPhotoCounts[b.id] || 0) - (albumPhotoCounts[a.id] || 0));
  if (sort === 'date') filteredAlbums = [...filteredAlbums].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Album cover: get latest photo for each album
  const getAlbumCover = (albumId: string): string | null => {
    // Use the latest photo as cover
    const albumPhotos = photos.filter(p => p.album_id === albumId);
    if (albumPhotos.length > 0) {
      const latest = albumPhotos[albumPhotos.length - 1];
      return signedUrls[latest.id] || null;
    }
    return null;
  };

  // Drag-and-drop handlers (persistent)
  const handleDragStart = (id: string) => setDragged(id);
  const handleDragOver = (e: React.DragEvent, id: string) => { e.preventDefault(); };
  const handleDrop = async (id: string) => {
    if (!dragged || dragged === id) return;
    const fromIdx = filteredAlbums.findIndex(a => a.id === dragged);
    const toIdx = filteredAlbums.findIndex(a => a.id === id);
    if (fromIdx === -1 || toIdx === -1) return;
    const arr = [...filteredAlbums];
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    // Persist new order
    await updateAlbumOrder(arr.map(a => a.id));
    setDragged(null);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      const newAlbum = await addAlbum(form.name, form.description);
      setForm({ name: '', description: '' });
      setShowAdd(false);
      if (newAlbum && typeof newAlbum.id === 'string') {
        setSelectedAlbum(newAlbum.id);
      }
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAlbum(id);
    setShowDelete(null);
  };

  if (!selectedAlbum) {
    return (
      <div className="max-w-5xl mx-auto my-16 p-8 bg-white/80 rounded-3xl shadow-2xl border-0 relative">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
            <h2 className="text-4xl font-extrabold text-rose-700 font-serif tracking-tight flex items-center gap-3">
              <svg width="36" height="36" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fbb6ce"/><path d="M7 17l3-3.5 2.5 3L17 13l4 5H3l4-5z" fill="#fff"/></svg>
              Photo Albums
            </h2>
            <input
              type="text"
              placeholder="Search albums..."
              className="ml-0 md:ml-8 border rounded-full px-4 py-2 text-lg focus:ring-2 focus:ring-rose-200 outline-none w-full md:w-64 bg-white shadow"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select
              className="border rounded-full px-4 py-2 text-lg focus:ring-2 focus:ring-rose-200 outline-none bg-white shadow"
              value={sort}
              onChange={e => setSort(e.target.value as any)}
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="count">Sort by Photo Count</option>
            </select>
          </div>
          <Button
            className="rounded-full px-6 py-2 text-lg font-semibold bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg hover:from-rose-500 hover:to-pink-500 transition-all"
            onClick={() => setShowAdd(true)}
          >
            + Add Album
          </Button>
        </div>
        {filteredAlbums.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[250px]">
            <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-4"><rect width="24" height="24" rx="6" fill="#fbb6ce"/><path d="M7 17l3-3.5 2.5 3L17 13l4 5H3l4-5z" fill="#fff"/></svg>
            <p className="text-xl text-rose-500 mb-4 font-semibold">No albums found. Start your story!</p>
            <Button
              className="rounded-full px-8 py-3 text-lg font-bold bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-lg hover:from-rose-500 hover:to-pink-500"
              onClick={() => setShowAdd(true)}
            >
              + Create Your First Album
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
            {filteredAlbums.map(album => (
              <div
                key={album.id}
                className={`group cursor-pointer rounded-3xl shadow-xl p-6 bg-gradient-to-br from-white via-rose-50 to-pink-50 border border-rose-100 hover:border-rose-400 transition-all duration-200 hover:scale-[1.03] flex flex-col justify-between relative overflow-hidden animate-fade-in ${dragged === album.id ? 'opacity-60' : ''}`}
                onClick={() => setSelectedAlbum(album.id)}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedAlbum(album.id); }}
                role="button"
                aria-label={`View album ${album.name}`}
                draggable
                onDragStart={() => handleDragStart(album.id)}
                onDragOver={e => handleDragOver(e, album.id)}
                onDrop={() => handleDrop(album.id)}
              >
                {/* Album cover preview */}
                <div className="w-full h-36 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center mb-5 overflow-hidden border border-rose-100 group-hover:shadow-lg transition-all relative">
                  {getAlbumCover(album.id) ? (
                    <img src={getAlbumCover(album.id)!} alt="Album Cover" className="w-full h-full object-cover rounded-2xl transition-all duration-200 group-hover:scale-105" />
                  ) : (
                    <svg width="56" height="56" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="6" fill="#fbb6ce"/><path d="M7 17l3-3.5 2.5 3L17 13l4 5H3l4-5z" fill="#fff"/></svg>
                  )}
                  {/* Favorite badge */}
                  {favorites.includes(album.id) && (
                    <span className="absolute top-2 right-2 bg-yellow-300 text-yellow-900 rounded-full px-2 py-1 text-xs font-bold shadow">★</span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-rose-700 group-hover:underline mb-1 truncate transition-all">{album.name}</h3>
                  {album.description && <p className="text-gray-500 mb-2 text-base truncate">{album.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-rose-500 font-semibold mb-2">
                    <span className="bg-rose-100 rounded-full px-3 py-0.5">{albumPhotoCounts[album.id] || 0} photos</span>
                  </div>
                </div>
                {/* Hover overlay with actions - now above the View Album button */}
                <div className="absolute left-0 right-0 bottom-20 flex justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-700 bg-white/80 shadow rounded-full" style={{boxShadow:'0 2px 8px 0 #fbb6ce33'}} onClick={e => { e.stopPropagation(); const albumToEdit = albums.find(a => a.id === album.id); setEditForm({ name: albumToEdit?.name || '', description: albumToEdit?.description || '' }); setShowEdit(album.id); }} aria-label="Edit album"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4 1a1 1 0 01-1.213-1.213l1-4a4 4 0 01.828-1.414z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
                  <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-700 bg-white/80 shadow rounded-full" style={{boxShadow:'0 2px 8px 0 #fbb6ce33'}} onClick={e => { e.stopPropagation(); setShowDelete(album.id); }} aria-label="Delete album"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
                  <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-700 bg-white/80 shadow rounded-full" style={{boxShadow:'0 2px 8px 0 #fbb6ce33'}} onClick={e => { e.stopPropagation(); setFavorites(favs => favs.includes(album.id) ? favs.filter(f => f !== album.id) : [...favs, album.id]); }} aria-label="Favorite album"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
                  <Button size="icon" variant="ghost" className="text-rose-500 hover:text-rose-700 bg-white/80 shadow rounded-full" style={{boxShadow:'0 2px 8px 0 #fbb6ce33'}} onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(window.location.origin + '/album/' + album.id); }} aria-label="Share album"><svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M4 12v7a2 2 0 002 2h12a2 2 0 002-2v-7M16 6l-4-4-4 4M12 2v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Button>
                </div>
                <Button
                  size="sm"
                  variant="romantic"
                  className="mt-4 w-full font-semibold rounded-full group-hover:bg-rose-100 group-hover:text-rose-700 transition-all"
                  onClick={e => { e.stopPropagation(); setSelectedAlbum(album.id); }}
                >
                  View Album
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add Album Modal */}
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
              <button
                className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 text-2xl font-bold"
                onClick={() => setShowAdd(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-rose-700 mb-6">Create New Album</h3>
              <form onSubmit={handleAdd} className="flex flex-col gap-4">
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Album name (e.g. Paris Trip)"
                  className="border rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-rose-200 outline-none"
                  required
                />
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="border rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-rose-200 outline-none"
                />
                <Button type="submit" variant="romantic" className="rounded-full px-6 py-2 text-lg font-semibold mt-2">Create Album</Button>
              </form>
            </div>
          </div>
        )}

        {/* Edit Album Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
              <button
                className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 text-2xl font-bold"
                onClick={() => { setShowEdit(null); setEditForm({ name: '', description: '' }); }}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-rose-700 mb-6">Edit Album</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSavingEdit(true);
                await updateAlbum(showEdit, { name: editForm.name, description: editForm.description });
                setSavingEdit(false);
                setShowEdit(null);
                setEditForm({ name: '', description: '' });
              }} className="flex flex-col gap-4">
                <input
                  value={editForm.name}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Album name"
                  className="border rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-rose-200 outline-none"
                  required
                />
                <input
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="border rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-rose-200 outline-none"
                />
                <Button type="submit" variant="romantic" className="rounded-full px-6 py-2 text-lg font-semibold mt-2" disabled={savingEdit}>{savingEdit ? 'Saving...' : 'Save Changes'}</Button>
              </form>
            </div>
          </div>
        )}

        {/* Delete Album Confirmation */}
        {showDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
              <button
                className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 text-2xl font-bold"
                onClick={() => setShowDelete(null)}
                aria-label="Close"
              >
                ×
              </button>
              <h3 className="text-2xl font-bold text-rose-700 mb-6">Delete Album</h3>
              <div className="mb-6 text-gray-700">Are you sure you want to delete this album? This action cannot be undone.</div>
              <div className="flex gap-4 justify-end">
                <Button variant="secondary" onClick={() => setShowDelete(null)}>Cancel</Button>
                <Button variant="destructive" onClick={() => handleDelete(showDelete!)}>Delete</Button>
              </div>
            </div>
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
                // ...removed scrollSlider left button (not needed)...
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
                      src={signedUrls[photo.id] || 'https://via.placeholder.com/200x150?text=Loading'}
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
                // ...removed scrollSlider right button (not needed)...
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

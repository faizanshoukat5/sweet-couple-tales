import { useAlbums } from '@/hooks/useAlbums';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const AlbumsList = () => {
  const { albums, loading, addAlbum, deleteAlbum } = useAlbums();
  const [form, setForm] = useState({ name: '', description: '' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name.trim()) {
      await addAlbum(form.name, form.description);
      setForm({ name: '', description: '' });
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Photo Albums</h2>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Album name (e.g. Paris Trip)"
        />
        <Input
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="Description (optional)"
        />
        <Button type="submit">Add Album</Button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {albums.map(album => (
            <li key={album.id} className="flex items-center gap-2">
              <span className="font-semibold">{album.name}</span>
              {album.description && <span className="text-gray-500">{album.description}</span>}
              <Button size="sm" variant="ghost" onClick={() => deleteAlbum(album.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AlbumsList;

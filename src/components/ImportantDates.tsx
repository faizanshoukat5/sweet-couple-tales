import { useImportantDates } from '@/hooks/useImportantDates';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ImportantDates = () => {
  const { dates, loading, addDate, deleteDate } = useImportantDates();
  const [form, setForm] = useState({ title: '', date: '', type: 'anniversary' });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.title.trim() && form.date) {
      await addDate(form.title, form.date, form.type);
      setForm({ title: '', date: '', type: 'anniversary' });
    }
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Important Dates & Anniversaries</h2>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 mb-4">
        <Input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="Title (e.g. Anniversary, Birthday)"
        />
        <Input
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
        />
        <select
          value={form.type}
          onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          className="border rounded px-2 py-1"
        >
          <option value="anniversary">Anniversary</option>
          <option value="birthday">Birthday</option>
          <option value="custom">Custom</option>
        </select>
        <Button type="submit">Add Date</Button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {dates.map(date => (
            <li key={date.id} className="flex items-center gap-2">
              <span className="font-semibold">{date.title}</span>
              <span className="text-gray-500">{date.date}</span>
              <span className="text-xs bg-gray-200 rounded px-2 py-1">{date.type}</span>
              <Button size="sm" variant="ghost" onClick={() => deleteDate(date.id)}>
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImportantDates;

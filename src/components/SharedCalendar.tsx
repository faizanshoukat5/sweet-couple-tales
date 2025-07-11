import { useImportantDates } from '@/hooks/useImportantDates';
import { Calendar } from '@/components/ui/calendar';
import { useMemo, useState } from 'react';

const SharedCalendar = () => {
  const { dates, loading } = useImportantDates();
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  // Mark recurring events (anniversary, birthday) for all years in view
  const getMarkedDays = () => {
    const years = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 2; y <= thisYear + 5; y++) years.push(y);
    const marked: Date[] = [];
    dates.forEach(d => {
      const dateObj = new Date(d.date);
      if (d.type === 'anniversary' || d.type === 'birthday') {
        years.forEach(y => {
          marked.push(new Date(y, dateObj.getMonth(), dateObj.getDate()));
        });
      } else {
        marked.push(dateObj);
      }
    });
    return marked;
  };
  const markedDays = useMemo(getMarkedDays, [dates]);

  // Map date to events for quick lookup (recurring for anniversary/birthday)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, { title: string; type: string }[]>();
    const years = [];
    const thisYear = new Date().getFullYear();
    for (let y = thisYear - 2; y <= thisYear + 5; y++) years.push(y);
    dates.forEach(d => {
      const dateObj = new Date(d.date);
      if (d.type === 'anniversary' || d.type === 'birthday') {
        years.forEach(y => {
          const key = new Date(y, dateObj.getMonth(), dateObj.getDate()).toDateString();
          if (!map.has(key)) map.set(key, []);
          map.get(key)!.push({ title: d.title, type: d.type });
        });
      } else {
        const key = dateObj.toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ title: d.title, type: d.type });
      }
    });
    return map;
  }, [dates]);

  // Upcoming events: show next instance of recurring events within 30 days
  const today = new Date();
  const upcoming = useMemo(() => {
    const list: { id: string; title: string; type: string; date: string }[] = [];
    dates.forEach(d => {
      const dateObj = new Date(d.date);
      let nextDate = new Date(dateObj);
      if (d.type === 'anniversary' || d.type === 'birthday') {
        nextDate.setFullYear(today.getFullYear());
        if (nextDate < today) nextDate.setFullYear(today.getFullYear() + 1);
      }
      const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (nextDate >= new Date(today.toDateString()) && diffDays <= 30) {
        list.push({ ...d, date: nextDate.toISOString().split('T')[0] });
      }
    });
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [dates]);

  const selectedEvents = selected ? eventsByDay.get(selected.toDateString()) : undefined;

  return (
    <div className="max-w-xl mx-auto my-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Shared Calendar</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ marked: markedDays }}
          modifiersClassNames={{ marked: 'bg-rose-200 text-rose-700 font-bold' }}
        />
      )}
      <div className="mt-4 text-sm text-gray-500">
        <b>Legend:</b> <span className="bg-rose-200 text-rose-700 px-2 py-1 rounded">Marked</span> = Important Date
      </div>
      {selected && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Events on {selected.toLocaleDateString()}:</h3>
          {selectedEvents ? (
            <ul className="list-disc ml-6">
              {selectedEvents.map((ev, i) => (
                <li key={i}><b>{ev.title}</b> <span className="text-xs text-gray-500">({ev.type})</span></li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No events.</div>
          )}
        </div>
      )}
      {/* Upcoming Events List */}
      <div className="mt-6">
        <h3 className="font-semibold mb-2">Upcoming Events</h3>
        {upcoming.length > 0 ? (
          <ul className="list-disc ml-6">
            {upcoming.map((ev, i) => (
              <li key={ev.id}>
                <b>{ev.title}</b> <span className="text-xs text-gray-500">({ev.type})</span> — <span className="text-xs">{new Date(ev.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No upcoming events.</div>
        )}
      </div>
    </div>
  );
};

export default SharedCalendar;

import { useMemo } from 'react';
import { format, isValid, parseISO, differenceInDays } from 'date-fns';
import { predictNextPeriod, fertileWindow } from '@/lib/periodCycles';
import { TrendingUp, Heart, CalendarDays } from 'lucide-react';

interface Props {
  lastPeriodStart: string;
  cycleLength: number;
}

export default function UpcomingEvents({ lastPeriodStart, cycleLength }: Props) {
  const date = lastPeriodStart ? parseISO(lastPeriodStart) : null;
  const validDate = date && isValid(date) ? date : null;

  const nextPeriod = useMemo(() => predictNextPeriod(validDate, cycleLength), [validDate, cycleLength]);
  const fertile = useMemo(() => fertileWindow(validDate, cycleLength), [validDate, cycleLength]);

  const today = new Date();

  const events = useMemo(() => {
    const items: { icon: React.ReactNode; label: string; dateStr: string; daysAway: string; color: string }[] = [];
    
    if (fertile) {
      const fertileStart = fertile.start;
      const fertileDays = differenceInDays(fertileStart, today);
      items.push({
        icon: <TrendingUp className="h-4 w-4" />,
        label: 'Fertile Window',
        dateStr: format(fertileStart, 'MMM d'),
        daysAway: fertileDays <= 0 ? 'Now' : `${fertileDays}d`,
        color: 'bg-emerald-500/10 text-emerald-600',
      });

      const ovDays = differenceInDays(fertile.ovulation, today);
      items.push({
        icon: <Heart className="h-4 w-4" />,
        label: 'Ovulation',
        dateStr: format(fertile.ovulation, 'MMM d'),
        daysAway: ovDays <= 0 ? 'Now' : `${ovDays}d`,
        color: 'bg-pink-500/10 text-pink-600',
      });
    }

    if (nextPeriod) {
      const periodDays = differenceInDays(nextPeriod, today);
      items.push({
        icon: <CalendarDays className="h-4 w-4" />,
        label: 'Next Period',
        dateStr: format(nextPeriod, 'MMM d'),
        daysAway: periodDays <= 0 ? 'Today' : `${periodDays}d`,
        color: 'bg-rose-500/10 text-rose-600',
      });
    }

    return items;
  }, [fertile, nextPeriod, today]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-semibold text-foreground text-sm">Upcoming</h3>
        <p className="text-xs text-muted-foreground">Predicted events based on your data</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {events.map((e) => (
          <div
            key={e.label}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-border/50 bg-card hover:bg-muted/30 transition-colors min-w-[140px]`}
          >
            <div className={`p-1.5 rounded-lg ${e.color}`}>{e.icon}</div>
            <div>
              <p className="font-medium text-foreground text-xs leading-tight">{e.label}</p>
              <p className="text-[11px] text-muted-foreground">{e.dateStr} • {e.daysAway}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { getPeriodCycle, upsertPeriodCycle, predictNextPeriod, fertileWindow } from '@/lib/periodCycles';
import CyclePhaseCard from '@/components/cycle/CyclePhaseCard';
import MoodFoodCard from '@/components/cycle/MoodFoodCard';
import SymptomFoodCard from '@/components/cycle/SymptomFoodCard';

export default function CycleTracker() {
  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    last_period_start: '',
    avg_cycle_length: 28,
    period_length: 5,
    notes: '',
    symptoms: [] as string[],
  });

  useEffect(() => {
    const run = async () => {
      if (!user?.id || !partnerId) return;
      const existing = await getPeriodCycle(user.id, partnerId);
      if (existing) {
        setForm({
          last_period_start: existing.last_period_start ?? existing.cycle_start_date ?? '',
          avg_cycle_length: existing.avg_cycle_length ?? existing.cycle_length ?? 28,
          period_length: existing.period_length ?? 5,
          notes: existing.notes ?? '',
          symptoms: existing.symptoms ?? [],
        });
      }
    };
    run();
  }, [user?.id, partnerId]);

  const lastStartDate = useMemo(() => form.last_period_start ? parseISO(form.last_period_start) : null, [form.last_period_start]);
  const nextPeriod = useMemo(() => predictNextPeriod(isValid(lastStartDate as any) ? (lastStartDate as Date) : null, form.avg_cycle_length), [lastStartDate, form.avg_cycle_length]);
  const fertile = useMemo(() => fertileWindow(isValid(lastStartDate as any) ? (lastStartDate as Date) : null, form.avg_cycle_length), [lastStartDate, form.avg_cycle_length]);

  const toggleSymptom = (key: string) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(key)
        ? f.symptoms.filter(s => s !== key)
        : [...f.symptoms, key],
    }));
  };

  const handleSave = async () => {
    if (!user?.id || !partnerId) return;
    setSaving(true);
    try {
      await upsertPeriodCycle({
        owner_id: user.id,
        partner_id: partnerId,
        last_period_start: form.last_period_start || null,
        avg_cycle_length: form.avg_cycle_length,
        period_length: form.period_length,
        notes: form.notes || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl space-y-6">
      {/* Main Tracker Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🌸</span> Cycle Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Last period start</Label>
              <Input type="date" value={form.last_period_start}
                onChange={(e) => setForm(f => ({ ...f, last_period_start: e.target.value }))} />
            </div>
            <div>
              <Label>Average cycle length (days)</Label>
              <Input type="number" min={20} max={60} value={form.avg_cycle_length}
                onChange={(e) => setForm(f => ({ ...f, avg_cycle_length: Number(e.target.value) }))} />
            </div>
            <div>
              <Label>Period length (days)</Label>
              <Input type="number" min={1} max={14} value={form.period_length}
                onChange={(e) => setForm(f => ({ ...f, period_length: Number(e.target.value) }))} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Input value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm space-y-1">
            <p className="font-medium text-foreground">📅 Predictions</p>
            <p className="text-muted-foreground">Next period: <span className="font-medium text-foreground">{nextPeriod ? format(nextPeriod, 'PPP') : '—'}</span></p>
            <p className="text-muted-foreground">Fertile window: <span className="font-medium text-foreground">{fertile ? `${format(fertile.start, 'PPP')} → ${format(fertile.end, 'PPP')}` : '—'}</span></p>
            <p className="text-muted-foreground">Ovulation (est.): <span className="font-medium text-foreground">{fertile ? format(fertile.ovulation, 'PPP') : '—'}</span></p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleSave} disabled={saving || !user || !partnerId}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Cycle Phase Meal Plan */}
      <CyclePhaseCard lastPeriodStart={form.last_period_start} cycleLength={form.avg_cycle_length} />

      {/* Mood-based Food Suggestions */}
      <MoodFoodCard />

      {/* Symptom Selector + Food Suggestions */}
      <SymptomFoodCard symptoms={form.symptoms} onToggleSymptom={toggleSymptom} />
    </div>
  );
}

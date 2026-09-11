import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { getPeriodCycle, upsertPeriodCycle, predictNextPeriod, fertileWindow } from '@/lib/periodCycles';

export default function CycleTracker() {
  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    last_period_start: '',
    avg_cycle_length: 28,
    period_length: 5,
    notes: '',
  });

  useEffect(() => {
    const run = async () => {
      if (!user?.id || !partnerId) return;
      const existing = await getPeriodCycle(user.id, partnerId);
      if (existing) {
        setForm({
          last_period_start: existing.last_period_start ?? '',
          avg_cycle_length: existing.avg_cycle_length,
          period_length: existing.period_length,
          notes: existing.notes ?? '',
        });
      }
    };
    run();
  }, [user?.id, partnerId]);

  const lastStartDate = useMemo(() => form.last_period_start ? parseISO(form.last_period_start) : null, [form.last_period_start]);
  const nextPeriod = useMemo(() => predictNextPeriod(isValid(lastStartDate as any) ? (lastStartDate as Date) : null, form.avg_cycle_length), [lastStartDate, form.avg_cycle_length]);
  const fertile = useMemo(() => fertileWindow(isValid(lastStartDate as any) ? (lastStartDate as Date) : null, form.avg_cycle_length), [lastStartDate, form.avg_cycle_length]);

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
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Cycle Tracker</CardTitle>
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

          <div className="rounded-md border p-3 text-sm">
            <p>Next period: {nextPeriod ? format(nextPeriod, 'PPP') : '—'}</p>
            <p>Fertile window: {fertile ? `${format(fertile.start, 'PPP')} → ${format(fertile.end, 'PPP')}` : '—'}</p>
            <p>Ovulation (estimated): {fertile ? format(fertile.ovulation, 'PPP') : '—'}</p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button onClick={handleSave} disabled={saving || !user || !partnerId}>{saving ? 'Saving…' : 'Save'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { getPeriodCycle, upsertPeriodCycle } from '@/lib/periodCycles';
import CycleDayRing from '@/components/cycle/CycleDayRing';
import UpcomingEvents from '@/components/cycle/UpcomingEvents';
import CyclePhaseCard from '@/components/cycle/CyclePhaseCard';
import MoodFoodCard from '@/components/cycle/MoodFoodCard';
import SymptomFoodCard from '@/components/cycle/SymptomFoodCard';
import { Settings2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CycleTracker() {
  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [saving, setSaving] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
      } else {
        // No data yet, show settings by default
        setShowSettings(true);
      }
    };
    run();
  }, [user?.id, partnerId]);

  const hasData = !!form.last_period_start;

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
      setShowSettings(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6 pb-24">
      {/* Header Card with Ring + Upcoming */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌸</span>
              <div>
                <CardTitle className="text-lg">Cycle Tracker</CardTitle>
                <p className="text-xs text-muted-foreground">Personalized insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(s => !s)}
                className="gap-1.5"
              >
                <Settings2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Visual: Ring + Upcoming side by side on desktop */}
          {hasData && (
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <CycleDayRing
                lastPeriodStart={form.last_period_start}
                cycleLength={form.avg_cycle_length}
                periodLength={form.period_length}
              />
              <div className="flex-1 w-full">
                <UpcomingEvents
                  lastPeriodStart={form.last_period_start}
                  cycleLength={form.avg_cycle_length}
                />
              </div>
            </div>
          )}

          {!hasData && !showSettings && (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">🌸</span>
              <p className="text-muted-foreground text-sm">Set your last period date to get started</p>
              <Button className="mt-3" onClick={() => setShowSettings(true)}>
                Set Up Tracker
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Panel (collapsible) */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings2 className="h-4 w-4" /> Cycle Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Last period start</Label>
                    <Input
                      type="date"
                      value={form.last_period_start}
                      onChange={(e) => setForm(f => ({ ...f, last_period_start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Average cycle length (days)</Label>
                    <Input
                      type="number"
                      min={20}
                      max={45}
                      value={form.avg_cycle_length}
                      onChange={(e) => setForm(f => ({ ...f, avg_cycle_length: Math.min(45, Math.max(20, Number(e.target.value))) }))}
                    />
                  </div>
                  <div>
                    <Label>Period length (days)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={14}
                      value={form.period_length}
                      onChange={(e) => setForm(f => ({ ...f, period_length: Math.min(14, Math.max(1, Number(e.target.value))) }))}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={form.notes}
                      placeholder="Any notes about your cycle..."
                      onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} disabled={saving || !user || !partnerId}>
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cycle Phase Meal Plan */}
      {hasData && (
        <CyclePhaseCard lastPeriodStart={form.last_period_start} cycleLength={form.avg_cycle_length} />
      )}

      {/* Mood-based Food Suggestions */}
      <MoodFoodCard />

      {/* Symptom Selector + Food Suggestions */}
      <SymptomFoodCard symptoms={form.symptoms} onToggleSymptom={toggleSymptom} />
    </div>
  );
}

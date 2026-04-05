import { useEffect, useMemo, useState } from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { usePartnerId } from '@/hooks/usePartnerId';
import { getPeriodCycle, upsertPeriodCycle, predictNextPeriod, fertileWindow } from '@/lib/periodCycles';
import { SYMPTOMS, ALL_SYMPTOM_KEYS, getFoodSuggestionsForSymptoms } from '@/lib/symptomFoodSuggestions';
import { motion, AnimatePresence } from 'framer-motion';
import { Apple, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

export default function CycleTracker() {
  const { user } = useAuth();
  const partnerId = usePartnerId();
  const [saving, setSaving] = useState(false);
  const [expandedSymptom, setExpandedSymptom] = useState<string | null>(null);

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

  const foodSuggestions = useMemo(() => getFoodSuggestionsForSymptoms(form.symptoms), [form.symptoms]);

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

      {/* Symptom Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span>🩺</span> How are you feeling?
          </CardTitle>
          <p className="text-sm text-muted-foreground">Select your symptoms to get personalized food suggestions</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ALL_SYMPTOM_KEYS.map((key) => {
              const s = SYMPTOMS[key];
              const isActive = form.symptoms.includes(key);
              return (
                <motion.button
                  key={key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSymptom(key)}
                  className={`
                    inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium
                    transition-all duration-200 border cursor-pointer
                    ${isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                    }
                  `}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Food Suggestions */}
      <AnimatePresence mode="wait">
        {foodSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Apple className="h-5 w-5 text-primary" />
                  <span>What to Eat Right Now</span>
                  <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Science-backed nutrition for your {form.symptoms.length} selected symptom{form.symptoms.length > 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {foodSuggestions.map(({ key, symptom }) => {
                  const isExpanded = expandedSymptom === key;
                  return (
                    <div key={key} className="rounded-xl border border-border/50 overflow-hidden">
                      <button
                        onClick={() => setExpandedSymptom(isExpanded ? null : key)}
                        className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{symptom.emoji}</span>
                          <span className="font-semibold text-foreground">{symptom.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {symptom.foods.length} foods
                          </Badge>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="px-3 pb-3 space-y-2">
                              {symptom.foods.map((food, i) => (
                                <motion.div
                                  key={food.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="flex gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                                >
                                  <span className="text-2xl flex-shrink-0 mt-0.5">{food.emoji}</span>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-foreground text-sm">{food.name}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{food.reason}</p>
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {food.nutrients.map((n) => (
                                        <span key={n} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                                          {n}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

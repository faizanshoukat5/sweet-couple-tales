import React, { useState, useEffect } from 'react';
import { getCycleDay } from '@/lib/cycleDay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar, Heart, Moon, Sun, Droplets, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface Cycle {
  id: string;
  cycle_start_date: string;
  cycle_length: number;
  period_length: number;
  mood?: string;
  symptoms: string[];
  notes?: string;
}

interface Prediction {
  phase: string;
  cycleDay: number;
  nextPeriodDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  ovulationDate: Date;
  avgCycleLength: number;
  avgPeriodLength: number;
  regularityScore: number;
  upcomingEvents: Array<{
    date: Date;
    event: string;
    description: string;
    type: 'period' | 'fertile' | 'ovulation';
  }>;
}

const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Mood changes', 'Acne', 'Breast tenderness',
  'Back pain', 'Fatigue', 'Food cravings', 'Nausea', 'Sleep changes'
];

export const CycleTrackerCard: React.FC = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    cycle_start_date: '',
    cycle_length: 28,
    period_length: 5,
    mood: '',
    notes: '',
    symptoms: [] as string[],
  });

  useEffect(() => {
    if (user) {
      fetchCycles();
    }
  }, [user]);

  const fetchCycles = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('period_cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('cycle_start_date', { ascending: false })
        .limit(6);

      if (error) throw error;

      setCycles(data || []);
      setPrediction(calculatePredictions(data || []));
    } catch (err) {
      console.error('Error fetching cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePredictions = (cycleData: Cycle[]): Prediction | null => {
    if (cycleData.length === 0) return null;

    const avgCycleLength = Math.max(1, cycleData.length > 1 
      ? Math.round(cycleData.reduce((sum, cycle) => sum + cycle.cycle_length, 0) / cycleData.length)
      : cycleData[0].cycle_length);
    
    const avgPeriodLength = Math.round(cycleData.reduce((sum, cycle) => sum + cycle.period_length, 0) / cycleData.length);
    
    const lastCycle = cycleData[0];
    const [startYear, startMonth, startDay] = lastCycle.cycle_start_date.split('-').map(Number);
    const lastCycleStart = new Date(startYear, startMonth - 1, startDay);
    const today = new Date();
    const daysSinceLastPeriod = Math.max(0, Math.floor((
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) -
      Date.UTC(startYear, startMonth - 1, startDay)
    ) / (1000 * 60 * 60 * 24)));
    const cycleDay = getCycleDay(daysSinceLastPeriod, avgCycleLength);

    let phase = 'follicular';
    if (cycleDay <= avgPeriodLength) {
      phase = 'menstrual';
    } else if (cycleDay >= avgCycleLength / 2 - 2 && cycleDay <= avgCycleLength / 2 + 2) {
      phase = 'ovulation';
    } else if (cycleDay > avgCycleLength / 2 + 2) {
      phase = 'luteal';
    }

    const cyclesElapsed = Math.floor(daysSinceLastPeriod / avgCycleLength);
    const currentCycleStart = new Date(lastCycleStart);
    currentCycleStart.setDate(currentCycleStart.getDate() + cyclesElapsed * avgCycleLength);

    const nextPeriodDate = new Date(currentCycleStart);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

    const ovulationDate = new Date(nextPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 1);

    const regularityScore = cycleData.length > 2 
      ? Math.max(0, 100 - (Math.abs(Math.max(...cycleData.map(c => c.cycle_length)) - Math.min(...cycleData.map(c => c.cycle_length))) * 10))
      : 85;

    const upcomingEvents = [
      {
        date: nextPeriodDate,
        event: 'Next Period',
        description: 'Your next period is expected',
        type: 'period' as const
      },
      {
        date: fertileWindowStart,
        event: 'Fertile Window',
        description: 'Your fertile window begins',
        type: 'fertile' as const
      },
      {
        date: ovulationDate,
        event: 'Ovulation',
        description: 'Peak fertility day',
        type: 'ovulation' as const
      }
    ].filter(event => event.date > today).sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      phase,
      cycleDay,
      nextPeriodDate,
      fertileWindowStart,
      fertileWindowEnd,
      ovulationDate,
      avgCycleLength,
      avgPeriodLength,
      regularityScore,
      upcomingEvents
    };
  };

  const handleSubmitCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('period_cycles')
        .insert([
          {
            user_id: user.id,
            cycle_start_date: formData.cycle_start_date,
            cycle_length: formData.cycle_length,
            period_length: formData.period_length,
            mood: formData.mood || null,
            symptoms: formData.symptoms,
            notes: formData.notes || null,
          },
        ]);

      if (error) throw error;

      toast({ title: 'Success!', description: 'Cycle data added successfully' });

      setFormData({
        cycle_start_date: '',
        cycle_length: 28,
        period_length: 5,
        mood: '',
        notes: '',
        symptoms: [],
      });
      setShowAddModal(false);

      const { data: refreshed } = await supabase
        .from('period_cycles')
        .select('*')
        .eq('user_id', user.id)
        .order('cycle_start_date', { ascending: false })
        .limit(6);
      setCycles(refreshed || []);
      setPrediction(calculatePredictions(refreshed || []));
    } catch (err) {
      console.error('Error adding cycle:', err);
      toast({ title: 'Error', description: 'Failed to add cycle data', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return <Droplets className="w-4 h-4 text-red-500" />;
      case 'follicular':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'ovulation':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'luteal':
        return <Moon className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'follicular':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'ovulation':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'luteal':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const toggleSymptom = (symptom: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-0 shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse inline-block rounded-full p-4 bg-rose-100 mx-auto mb-4">
            <Calendar className="w-8 h-8 text-rose-600" />
          </div>
          <p className="text-muted-foreground">Loading cycle data...</p>
        </CardContent>
      </Card>
    );
  }

  // Redesigned layout: left summary + right details
  return (
    <TooltipProvider>
      <Card className="bg-white dark:bg-slate-900 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Left panel - big summary */}
          <div className="md:col-span-1 bg-gradient-to-b from-rose-50 to-white p-4 flex flex-col items-center justify-center gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-rose-200 p-3">
                <Calendar className="w-6 h-6 text-rose-700" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-rose-700">Cycle Tracker</h3>
                <p className="text-sm text-rose-500">Personalized insights</p>
              </div>
            </div>

            {prediction ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <svg viewBox="0 0 36 36" className="w-28 h-28">
                    <path className="text-gray-200" d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="3.5" />
                    <path className="text-rose-500" d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={`${(prediction.cycleDay / prediction.avgCycleLength) * 100}, 100`} />
                    <text x="18" y="20.5" textAnchor="middle" className="text-rose-700 font-semibold" style={{ fontSize: '6px' }}>{`Day ${prediction.cycleDay}`}</text>
                  </svg>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {getPhaseIcon(prediction.phase)}
                    <span className="font-medium text-gray-800 capitalize">{prediction.phase}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Avg {prediction.avgCycleLength}d • Period {prediction.avgPeriodLength}d</div>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getPhaseColor(prediction.phase)} text-[10px]`}>Phase</Badge>
                  <Badge variant="outline" className="text-[10px]">Regularity {prediction.regularityScore}%</Badge>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">No cycles logged yet.</p>
                <Button variant="romantic" className="mt-3" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Add First Cycle
                </Button>
              </div>
            )}
          </div>

          {/* Right panel - details */}
          <div className="md:col-span-2 p-4 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-base font-semibold text-slate-800">Upcoming</h4>
                <p className="text-xs text-muted-foreground">Predicted events based on your data</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => fetchCycles()}>Refresh</Button>
                <Button variant="outline" onClick={() => setShowAddModal(true)}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="-mx-4 md:mx-0">
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible px-4 md:px-0">
                {prediction ? (
                  prediction.upcomingEvents.slice(0, 3).map((ev, i) => (
                    <div key={i} className="min-w-[170px] md:min-w-0 p-3 rounded-xl border bg-white/70">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-md bg-rose-50">
                          {ev.type === 'period' && <Droplets className="w-5 h-5 text-red-500" />}
                          {ev.type === 'fertile' && <TrendingUp className="w-5 h-5 text-green-500" />}
                          {ev.type === 'ovulation' && <Heart className="w-5 h-5 text-pink-500" />}
                        </div>
                        <div>
                          <div className="font-medium text-slate-800 text-sm">{ev.event}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(ev.date)} • {daysUntil(ev.date)}d</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl border bg-white/60 text-center w-full">No predictions yet — add a cycle to get started.</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-semibold text-slate-800">Recent Cycles</h5>
                <span className="text-xs text-muted-foreground">Showing up to 4</span>
              </div>
              <div className="-mx-4 md:mx-0">
                <div className="flex gap-3 overflow-x-auto pb-2 px-4 md:px-0 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible">
                  {cycles.length > 0 ? cycles.slice(0, 4).map((c) => (
                    <div key={c.id} className="min-w-[200px] md:min-w-0 p-3 rounded-lg border bg-white/60 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{new Date(c.cycle_start_date).toLocaleDateString()}</div>
                        <div className="text-xs text-muted-foreground">{c.cycle_length}d cycle • {c.period_length}d period</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.mood && <Badge variant="outline" className="text-xs">{c.mood}</Badge>}
                        {Array.isArray(c.symptoms) && c.symptoms.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className="text-xs">{c.symptoms.length} symptoms</Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-[220px] text-xs">{c.symptoms.join(', ')}</div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="p-4 rounded-lg border bg-white/60 w-full">No cycles logged yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add / Log Cycle Modal (revamped) */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-800">Log a new cycle</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCycle} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="cycle_start_date">Period start date</Label>
                <Input id="cycle_start_date" type="date" value={formData.cycle_start_date} onChange={(e) => setFormData({ ...formData, cycle_start_date: e.target.value })} required max={new Date().toISOString().split('T')[0]} />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cycle_length">Cycle length (days)</Label>
                    <Input id="cycle_length" type="number" min={20} max={60} value={formData.cycle_length} onChange={(e) => setFormData({ ...formData, cycle_length: parseInt(e.target.value) || 0 })} required />
                  </div>
                  <div>
                    <Label htmlFor="period_length">Period length (days)</Label>
                    <Input id="period_length" type="number" min={1} max={14} value={formData.period_length} onChange={(e) => setFormData({ ...formData, period_length: parseInt(e.target.value) || 0 })} required />
                  </div>
                </div>

                <Separator />

                <Label>Mood (optional)</Label>
                <RadioGroup className="grid grid-cols-3 gap-2" value={formData.mood} onValueChange={(val) => setFormData({ ...formData, mood: val })}>
                  {['Happy', 'Calm', 'Irritable', 'Tired', 'Crampy', 'Energetic'].map((m) => (
                    <div key={m} className="flex items-center gap-2 rounded-lg border p-2">
                      <RadioGroupItem id={`mood-${m}`} value={m} />
                      <Label htmlFor={`mood-${m}`} className="text-sm">{m}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Symptoms (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {COMMON_SYMPTOMS.map((s) => {
                    const active = formData.symptoms.includes(s);
                    return (
                      <button key={s} type="button" onClick={() => toggleSymptom(s)} className={`text-xs rounded-md px-3 py-1 text-left transition ${active ? 'bg-rose-100 text-rose-700' : 'bg-white/60 text-slate-800 border'} `}>
                        {s}
                      </button>
                    );
                  })}
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" rows={4} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>

                <div className="flex justify-end gap-2 mt-2 md:col-span-2">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>Cancel</Button>
                  <Button type="submit" variant="romantic" disabled={submitting}>{submitting ? 'Adding...' : 'Save cycle'}</Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
};

export default CycleTrackerCard;

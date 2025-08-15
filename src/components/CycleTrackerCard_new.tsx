import React, { useState, useEffect } from 'react';
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

    const avgCycleLength = cycleData.length > 1 
      ? Math.round(cycleData.reduce((sum, cycle) => sum + cycle.cycle_length, 0) / cycleData.length)
      : cycleData[0].cycle_length;
    
    const avgPeriodLength = Math.round(cycleData.reduce((sum, cycle) => sum + cycle.period_length, 0) / cycleData.length);
    
    const lastCycle = cycleData[0];
    const lastCycleStart = new Date(lastCycle.cycle_start_date);
    const today = new Date();
    const daysSinceLastPeriod = Math.floor((today.getTime() - lastCycleStart.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = daysSinceLastPeriod + 1;

    let phase = 'follicular';
    if (cycleDay <= avgPeriodLength) {
      phase = 'menstrual';
    } else if (cycleDay >= avgCycleLength / 2 - 2 && cycleDay <= avgCycleLength / 2 + 2) {
      phase = 'ovulation';
    } else if (cycleDay > avgCycleLength / 2 + 2) {
      phase = 'luteal';
    }

    const nextPeriodDate = new Date(lastCycleStart);
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
      <Card className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-0 shadow-xl rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-400 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading cycle data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-rose-50 via-white to-pink-50 border-0 shadow-xl rounded-2xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-100 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="bg-rose-200 text-rose-700 rounded-full p-3 shadow-sm">
                <Calendar className="w-6 h-6" />
              </span>
              <div>
                <CardTitle className="font-serif text-2xl font-bold text-rose-700">Cycle Tracker</CardTitle>
                <p className="text-rose-600 text-sm font-medium mt-1">Track your natural rhythm</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} className="rounded-full bg-white/80 border-rose-200 hover:bg-rose-50">
              <Plus className="w-4 h-4 mr-2" /> Log Cycle
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {cycles.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-rose-200 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-rose-600 mb-2">Start Tracking</h3>
              <p className="text-muted-foreground mb-4">Begin tracking your cycle to get personalized insights and predictions.</p>
              <Button variant="romantic" onClick={() => setShowAddModal(true)} className="rounded-full px-6">
                <Plus className="w-4 h-4 mr-2" /> Add First Cycle
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {prediction && (
                <div className="bg-white/70 rounded-xl p-4 border border-rose-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      {getPhaseIcon(prediction.phase)}
                      <span className="font-semibold text-gray-800 capitalize">{prediction.phase} phase</span>
                      <Badge className={`${getPhaseColor(prediction.phase)} text-xs`}>Day {prediction.cycleDay} / {prediction.avgCycleLength}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg cycle {prediction.avgCycleLength}d • Avg period {prediction.avgPeriodLength}d • Regularity {prediction.regularityScore}%
                    </div>
                  </div>
                  <Progress value={(prediction.cycleDay / prediction.avgCycleLength) * 100} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Start</span>
                    <span>End</span>
                  </div>
                </div>
              )}

              {prediction && prediction.upcomingEvents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {prediction.upcomingEvents.slice(0, 3).map((event, idx) => (
                    <div key={idx} className="bg-white/70 rounded-xl p-4 border border-rose-100">
                      <div className="flex items-center gap-2 mb-3">
                        {event.type === 'period' && <Droplets className="w-4 h-4 text-red-500" />}
                        {event.type === 'fertile' && <TrendingUp className="w-4 h-4 text-green-500" />}
                        {event.type === 'ovulation' && <Heart className="w-4 h-4 text-pink-500" />}
                        <span className="font-semibold text-gray-800">{event.event}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{formatDate(event.date)}</span>
                        <Badge variant="outline">{daysUntil(event.date)} days</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Recent Cycles
                  </h4>
                  <Button variant="outline" size="sm" className="rounded-full" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-1" /> Log new cycle
                  </Button>
                </div>
                <div className="space-y-2">
                  {cycles.slice(0, 4).map((cycle) => (
                    <div key={cycle.id} className="bg-white/70 rounded-lg p-3 border border-rose-100 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{new Date(cycle.cycle_start_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{cycle.cycle_length} day cycle • {cycle.period_length} day period</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {cycle.mood && <Badge variant="outline" className="text-xs">{cycle.mood}</Badge>}
                        {Array.isArray(cycle.symptoms) && cycle.symptoms.length > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-xs">{cycle.symptoms.length} symptoms</Badge>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-[220px] text-xs text-gray-700">{cycle.symptoms.join(', ')}</div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-700">Add Cycle Data</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitCycle} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cycle_start_date">Period Start Date</Label>
                <Input 
                  id="cycle_start_date" 
                  type="date" 
                  value={formData.cycle_start_date} 
                  onChange={(e) => setFormData({ ...formData, cycle_start_date: e.target.value })} 
                  required 
                  max={new Date().toISOString().split('T')[0]} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycle_length">Cycle Length (days)</Label>
                  <Input 
                    id="cycle_length" 
                    type="number" 
                    min={20} 
                    max={60} 
                    value={formData.cycle_length} 
                    onChange={(e) => setFormData({ ...formData, cycle_length: parseInt(e.target.value) || 0 })} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="period_length">Period Length (days)</Label>
                  <Input 
                    id="period_length" 
                    type="number" 
                    min={1} 
                    max={14} 
                    value={formData.period_length} 
                    onChange={(e) => setFormData({ ...formData, period_length: parseInt(e.target.value) || 0 })} 
                    required 
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Mood (optional)</Label>
                <RadioGroup 
                  className="grid grid-cols-2 gap-2" 
                  value={formData.mood} 
                  onValueChange={(val) => setFormData({ ...formData, mood: val })}
                >
                  {['Happy', 'Calm', 'Irritable', 'Tired', 'Crampy', 'Energetic'].map((m) => (
                    <div key={m} className="flex items-center gap-2 rounded-lg border border-rose-100 bg-white/60 p-2">
                      <RadioGroupItem id={`mood-${m}`} value={m} />
                      <Label htmlFor={`mood-${m}`} className="text-sm text-gray-700">{m}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label>Symptoms (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_SYMPTOMS.map((s) => {
                    const active = formData.symptoms.includes(s);
                    return (
                      <button 
                        key={s} 
                        type="button" 
                        onClick={() => toggleSymptom(s)} 
                        className={`text-xs rounded-full border px-3 py-1 transition ${
                          active 
                            ? 'bg-rose-100 text-rose-700 border-rose-200' 
                            : 'bg-white/60 text-gray-700 border-rose-100 hover:bg-rose-50'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional notes about this cycle..." 
                  value={formData.notes} 
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
                  rows={3} 
                />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="romantic" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Cycle'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>
    </TooltipProvider>
  );
};

export default CycleTrackerCard;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGoals } from '@/hooks/useGoals';
import { useImportantDates } from '@/hooks/useImportantDates';
import { useAuth } from '@/hooks/useAuth';
import { useMoods, MoodEntry } from '@/hooks/useMoods';
import { Calendar, CheckCircle2, Smile } from 'lucide-react';
import { LoveNotesWidget } from '@/components/LoveNotesWidget';
import { DateIdeasWidget } from '@/components/DateIdeasWidget';

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  // Normalize to next occurrence (handles birthdays/anniversaries annually)
  const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
  const next = thisYear < new Date(now.toDateString())
    ? new Date(now.getFullYear() + 1, date.getMonth(), date.getDate())
    : thisYear;
  const diff = Math.ceil((next.getTime() - new Date(now.toDateString()).getTime()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function HomeDashboardPreview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dates, loading: datesLoading } = useImportantDates();
  const { goals, loading: goalsLoading } = useGoals();
  const { getMoodHistory } = useMoods();

  const [moods, setMoods] = useState<MoodEntry[]>([]);

  useEffect(() => {
    async function loadMoods() {
      if (!user) return;
      const history = await getMoodHistory(user.id, 7);
      setMoods(history);
    }
    loadMoods();
  }, [user, getMoodHistory]);

  const upcoming = useMemo(() => {
    return [...dates]
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
      .slice(0, 2);
  }, [dates]);

  const goalsSummary = useMemo(() => {
    const total = goals.length;
    const done = goals.filter(g => g.completed).length;
    return { total, done };
  }, [goals]);

  const todayMood = useMemo(() => {
    const todayIso = new Date().toISOString().split('T')[0];
    return moods.find(m => m.date === todayIso)?.mood || null;
  }, [moods]);

  return (
    <section aria-labelledby="home-preview-heading" className="py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-baseline justify-between mb-6">
          <h2 id="home-preview-heading" className="text-2xl font-bold text-foreground">At a glance</h2>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Open dashboard</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Dates */}
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Upcoming dates</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {datesLoading ? (
                <p>Loading...</p>
              ) : upcoming.length === 0 ? (
                <p>No dates yet. Add anniversaries and birthdays.</p>
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((d) => (
                    <li key={d.id} className="flex items-center justify-between">
                      <span className="truncate mr-3">{d.title}</span>
                      <span className="shrink-0 text-foreground/80">{formatDateLabel(d.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4">
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard#dates')}>Manage dates</Button>
              </div>
            </CardContent>
          </Card>

          {/* Goals */}
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {goalsLoading ? (
                <p>Loading...</p>
              ) : goalsSummary.total === 0 ? (
                <p>No goals yet. Set something fun to do together.</p>
              ) : (
                <p>
                  {goalsSummary.done} of {goalsSummary.total} completed
                </p>
              )}
              <div className="mt-4">
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard#goals')}>View goals</Button>
              </div>
            </CardContent>
          </Card>

          {/* Mood */}
          <Card className="border border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-primary" />
                <CardTitle className="text-base">Mood snapshot</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {user ? (
                todayMood ? (
                  <p>Today: <span className="text-foreground font-medium">{todayMood}</span></p>
                ) : (
                  <p>Share your mood for today on the dashboard.</p>
                )
              ) : (
                <p>Sign in to track your daily moods.</p>
              )}
              <div className="mt-4">
                <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard#memories')}>Go to dashboard</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Widgets */}
        <div className="mt-10 space-y-10">
          <LoveNotesWidget />
          <DateIdeasWidget />
        </div>
      </div>
    </section>
  );
}

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CYCLE_PHASES, getCurrentCyclePhase, type CyclePhaseKey } from '@/lib/symptomFoodSuggestions';
import { motion } from 'framer-motion';
import { Calendar, AlertTriangle } from 'lucide-react';
import { isValid, parseISO } from 'date-fns';

interface Props {
  lastPeriodStart: string;
  cycleLength: number;
}

const phaseColors: Record<string, string> = {
  menstrual: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
  follicular: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
  ovulation: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
  luteal: 'bg-violet-500/10 text-violet-600 border-violet-500/30',
};

const phaseBgColors: Record<string, string> = {
  menstrual: 'border-rose-500/20',
  follicular: 'border-emerald-500/20',
  ovulation: 'border-amber-500/20',
  luteal: 'border-violet-500/20',
};

export default function CyclePhaseCard({ lastPeriodStart, cycleLength }: Props) {
  const date = lastPeriodStart ? parseISO(lastPeriodStart) : null;
  const phaseKey = useMemo(
    () => getCurrentCyclePhase(isValid(date) ? date : null, cycleLength),
    [date, cycleLength]
  );

  if (!phaseKey) return null;

  const phase = CYCLE_PHASES[phaseKey];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`shadow-lg ${phaseBgColors[phaseKey]}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Your Cycle Phase</span>
            </CardTitle>
            <Badge className={`${phaseColors[phaseKey]} border font-semibold`}>
              {phase.emoji} {phase.name}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{phase.dayRange} of your cycle</p>
          <p className="text-sm text-muted-foreground mt-1">{phase.description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Phase Foods */}
          <div>
            <p className="font-semibold text-foreground text-sm mb-2">🍽️ Best foods for this phase</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {phase.foods.map((food, i) => (
                <motion.div
                  key={food.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-2.5 p-2.5 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <span className="text-xl flex-shrink-0">{food.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-xs">{food.name}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{food.reason}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {food.nutrients.map((n) => (
                        <span key={n} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{n}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Foods to Avoid */}
          {phase.avoid.length > 0 && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="font-semibold text-sm flex items-center gap-1.5 text-destructive mb-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Avoid during this phase
              </p>
              <ul className="space-y-1">
                {phase.avoid.map((item) => (
                  <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <span className="text-destructive/60 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

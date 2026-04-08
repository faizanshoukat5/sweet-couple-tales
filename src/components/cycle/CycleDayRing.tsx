import { useMemo } from 'react';
import { getCurrentCyclePhase, CYCLE_PHASES } from '@/lib/symptomFoodSuggestions';
import { isValid, parseISO } from 'date-fns';

interface Props {
  lastPeriodStart: string;
  cycleLength: number;
  periodLength: number;
}

const phaseRingColors: Record<string, string> = {
  menstrual: '#e11d48',
  follicular: '#10b981',
  ovulation: '#f59e0b',
  luteal: '#8b5cf6',
};

const phaseBgLight: Record<string, string> = {
  menstrual: 'rgba(225, 29, 72, 0.1)',
  follicular: 'rgba(16, 185, 129, 0.1)',
  ovulation: 'rgba(245, 158, 11, 0.1)',
  luteal: 'rgba(139, 92, 246, 0.1)',
};

export default function CycleDayRing({ lastPeriodStart, cycleLength, periodLength }: Props) {
  const date = lastPeriodStart ? parseISO(lastPeriodStart) : null;
  
  const { dayInCycle, phaseKey, phaseName } = useMemo(() => {
    if (!date || !isValid(date) || !cycleLength) {
      return { dayInCycle: 0, phaseKey: null, phaseName: '—' };
    }
    const today = new Date();
    const diffMs = today.getTime() - date.getTime();
    const rawDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    // Wrap around cycle length so it resets after each cycle
    const day = ((rawDay % cycleLength) + cycleLength) % cycleLength;
    const pk = getCurrentCyclePhase(date, cycleLength);
    const name = pk ? CYCLE_PHASES[pk].name.replace(' Phase', '') : '—';
    return { dayInCycle: day + 1, phaseKey: pk, phaseName: name };
  }, [date, cycleLength]);

  const progress = cycleLength > 0 ? dayInCycle / cycleLength : 0;
  const ringColor = phaseKey ? phaseRingColors[phaseKey] : '#d1d5db';
  const bgColor = phaseKey ? phaseBgLight[phaseKey] : 'rgba(0,0,0,0.03)';
  const phaseEmoji = phaseKey ? CYCLE_PHASES[phaseKey].emoji : '🌸';

  // SVG circle math
  const size = 160;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular ring */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-muted/30"
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground leading-none">Day {dayInCycle}</span>
          <span className="text-xs text-muted-foreground mt-1">of {cycleLength}</span>
        </div>
      </div>

      {/* Phase label */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-lg">{phaseEmoji}</span>
          <span className="font-semibold text-foreground">{phaseName}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Avg {cycleLength}d • Period {periodLength}d
        </p>
      </div>
    </div>
  );
}

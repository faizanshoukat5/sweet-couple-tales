import React, { useEffect, useState } from 'react';

interface LoveLanguageResultsChartProps {
  scores: Record<string, number>;
  labels: Record<string, string>;
  primary?: string;
  secondary?: string;
}

// Simple color map (can be adjusted to match theme)
const COLOR_MAP: Record<string, string> = {
  words: 'bg-rose-400',
  acts: 'bg-rose-500',
  gifts: 'bg-rose-300',
  time: 'bg-rose-600',
  touch: 'bg-rose-700'
};

export const LoveLanguageResultsChart: React.FC<LoveLanguageResultsChartProps> = ({ scores, labels, primary, secondary }) => {
  const entries = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(e => e[1]), 1);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => setMounted(true)); return () => cancelAnimationFrame(t); }, []);

  return (
    <div className="w-full mt-2" aria-label="Love language score breakdown" role="group">
      <div className="flex flex-col gap-2">
        {entries.map(([lang, value]) => {
          const pct = (value / max) * 100;
          const isPrimary = lang === primary;
            const isSecondary = lang === secondary;
          return (
            <div key={lang} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs font-medium text-rose-600">
                <span>
                  {labels[lang as keyof typeof labels]}
                  {isPrimary && <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-rose-500 text-white">Primary</span>}
                  {!isPrimary && isSecondary && <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-rose-400 text-white">Secondary</span>}
                </span>
                <span className="tabular-nums text-rose-500">{value}</span>
              </div>
              <div className="h-3 rounded-full bg-rose-100 overflow-hidden">
                <div
                  className={`h-full ${COLOR_MAP[lang] || 'bg-rose-400'} transition-all duration-700 ease-out rounded-full shadow-inner`}
                  style={{ width: mounted ? pct + '%' : '0%' }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={max}
                  aria-label={labels[lang as keyof typeof labels] + ' score'}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LoveLanguageResultsChart;

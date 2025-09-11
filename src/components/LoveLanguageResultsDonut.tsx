import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DonutProps {
  scores: Record<string, number>;
  labels: Record<string, string>;
  primary?: string;
  secondary?: string;
}

// Provide color palette aligned with tailwind rose shades
const COLOR_MAP: Record<string, string> = {
  words: '#fb7185', // rose-400
  acts: '#f43f5e',  // rose-500
  gifts: '#fecdd3', // rose-200
  time: '#e11d48',  // rose-600
  touch: '#be123c', // rose-700
};

const LoveLanguageResultsDonut: React.FC<DonutProps> = ({ scores, labels, primary, secondary }) => {
  const data = Object.entries(scores).map(([lang, value]) => ({
    name: labels[lang as keyof typeof labels],
    value,
    fill: COLOR_MAP[lang] || '#f43f5e',
    key: lang,
  }));
  if (!data.length) return null;
  const max = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="w-full h-64" aria-label="Love language donut chart">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="30%"
          outerRadius="90%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, max]} dataKey="value" tick={false} />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
          <Tooltip
            formatter={(val: any, _name: any, props: any) => {
              const k = props?.payload?.key;
              const tag = k === primary ? ' (Primary)' : k === secondary ? ' (Secondary)' : '';
              return [val, (props?.payload?.name || '') + tag];
            }}
          />
          <Legend
            verticalAlign="middle"
            align="center"
            layout="vertical"
            iconSize={12}
            formatter={(value: any, entry: any) => {
              const k = (entry as any)?.payload?.key;
              if (k === primary) return value + ' ★';
              if (k === secondary) return value + ' ☆';
              return value;
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LoveLanguageResultsDonut;

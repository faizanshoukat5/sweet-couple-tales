import { Heart } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps { label: string; value: ReactNode; meta?: ReactNode; gradient?: string; icon?: ReactNode; className?: string; }

const base = 'relative overflow-hidden rounded-2xl p-5 text-white shadow-lg flex flex-col justify-between';

export const StatCard = ({ label, value, meta, gradient, icon, className }: StatCardProps) => (
  <div className={cn(base, gradient || 'bg-gradient-to-br from-rose-500 to-pink-400', className)}>
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-semibold text-sm opacity-90 mb-1">{label}</div>
        <div className="text-3xl font-extrabold tracking-tight leading-none">{value}</div>
      </div>
      {icon && <div className="text-white/70">{icon}</div>}
    </div>
    {meta && <div className="mt-2 text-xs opacity-80 flex items-center gap-1">{meta}</div>}
    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
  </div>
);

interface StatsBarProps { children: ReactNode; className?: string; }
export const StatsBar = ({ children, className }: StatsBarProps) => (
  <div className={cn('grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5', className)}>{children}</div>
);

export default StatsBar;

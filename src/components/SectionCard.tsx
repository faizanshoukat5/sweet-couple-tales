import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  id?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  headerClassName?: string;
  padded?: boolean;
}

export const SectionCard = ({
  title,
  subtitle,
  icon,
  id,
  children,
  actions,
  className,
  headerClassName,
  padded = true,
}: SectionCardProps) => {
  return (
    <section id={id} className={cn('relative rounded-2xl bg-white/90 border border-rose-100 shadow-sm backdrop-blur-sm overflow-hidden', className)}>
      {(title || actions) && (
        <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-rose-100/60 bg-gradient-to-r from-rose-50 to-pink-50', headerClassName)}>
          <div className="flex items-start gap-3 min-w-0">
            {icon && <div className="shrink-0 text-rose-500">{icon}</div>}
            <div className="space-y-1 min-w-0">
              {title && <h2 className="font-serif text-2xl font-bold tracking-tight text-rose-700 truncate">{title}</h2>}
              {subtitle && <p className="text-sm text-rose-500 font-medium leading-snug line-clamp-2">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
        </div>
      )}
      <div className={cn(padded && 'p-6')}>{children}</div>
    </section>
  );
};

export default SectionCard;

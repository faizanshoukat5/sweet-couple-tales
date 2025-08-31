import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

type StatsBarProps = {
	className?: string;
	children: React.ReactNode;
};

/**
 * StatsBar
 * Simple responsive container for stat cards.
 */
const StatsBar: React.FC<StatsBarProps> = ({ className, children }) => {
	return (
		<div
			className={cn(
				'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4',
				className
			)}
		>
			{children}
		</div>
	);
};

type StatCardProps = {
	label: string;
	value: React.ReactNode;
	meta?: React.ReactNode;
	gradient?: string; // tailwind bg classes for accent
	className?: string;
};

/**
 * StatCard
 * Compact summary card with optional gradient accent and meta content.
 */
export const StatCard: React.FC<StatCardProps> = ({
	label,
	value,
	meta,
	gradient,
	className,
}) => {
	return (
		<Card
			className={cn(
				'border-0 shadow-sm hover:shadow-md transition-shadow duration-200',
				'bg-white/90 backdrop-blur',
				className
			)}
		>
			<CardContent className="p-4">
				<div className="flex items-center justify-between">
					<div>
						<div className="text-xs font-medium text-muted-foreground">{label}</div>
						<div className="mt-1 text-2xl font-bold tracking-tight">{value}</div>
						{meta && (
							<div className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
								{meta}
							</div>
						)}
					</div>
					<div
						className={cn(
							'h-10 w-10 rounded-full opacity-90 shadow-inner',
							gradient ?? 'bg-gradient-to-br from-rose-200 to-pink-200'
						)}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

export default StatsBar;


import { supabase } from '@/integrations/supabase/client';

export interface PeriodCycleRow {
  id: string;
  owner_id: string;
  partner_id: string;
  last_period_start: string | null; // ISO date string
  avg_cycle_length: number;
  period_length: number;
  notes: string | null;
  updated_at: string;
}

export async function getPeriodCycle(ownerId: string, partnerId: string) {
  const builder: any = (supabase as any).from('period_cycles');
  const { data, error } = await builder
    .select('*')
    .eq('owner_id', ownerId)
    .eq('partner_id', partnerId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

export async function upsertPeriodCycle(input: Omit<PeriodCycleRow, 'id' | 'updated_at'>) {
  const builder: any = (supabase as any).from('period_cycles');
  const { data, error } = await builder
    .upsert([input], { onConflict: 'owner_id,partner_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export function predictNextPeriod(lastStart: Date | null, cycleLength: number) {
  if (!lastStart || !cycleLength) return null;
  const next = new Date(lastStart);
  next.setDate(next.getDate() + cycleLength);
  return next;
}

export function fertileWindow(lastStart: Date | null, cycleLength: number) {
  if (!lastStart || !cycleLength) return null;
  const ovulation = new Date(lastStart);
  ovulation.setDate(ovulation.getDate() + cycleLength - 14);
  const start = new Date(ovulation);
  start.setDate(start.getDate() - 5);
  const end = new Date(ovulation);
  end.setDate(end.getDate() + 1);
  return { start, end, ovulation };
}

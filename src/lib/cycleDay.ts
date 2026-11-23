export function getCycleDay(daysSinceStart: number, cycleLength: number): number {
  const length = Number.isFinite(cycleLength) && cycleLength > 0
    ? Math.floor(cycleLength)
    : 1;
  const elapsed = Number.isFinite(daysSinceStart)
    ? Math.max(0, Math.floor(daysSinceStart))
    : 0;

  return (elapsed % length) + 1;
}
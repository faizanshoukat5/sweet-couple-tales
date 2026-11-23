import { describe, expect, it } from 'bun:test';
import { getCycleDay } from './cycleDay';

describe('getCycleDay', () => {
  it('wraps the day counter at the configured cycle length', () => {
    expect(getCycleDay(29, 30)).toBe(30);
    expect(getCycleDay(30, 30)).toBe(1);
    expect(getCycleDay(81, 28)).toBe(26);
  });
});
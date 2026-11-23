import assert from 'node:assert/strict';
import { getCycleDay } from './cycleDay';

assert.equal(getCycleDay(29, 30), 30);
assert.equal(getCycleDay(30, 30), 1);
assert.equal(getCycleDay(81, 28), 26);
console.log('Cycle day rollover checks passed.');
import { afterEach, describe, expect, it } from 'vitest';
import { daysBetween, initialOrder, isValidOrder, localDateKey, nextLocalMidnight, seededShuffle } from '../../src/lib/puzzle';
import { correctOrder } from '../../src/lib/scoring';
import { PUZZLE } from './fixtures';

const originalTZ = process.env.TZ;
afterEach(() => {
  process.env.TZ = originalTZ;
});

/** Local wall-clock date in the current process TZ. */
const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);

describe('localDateKey', () => {
  it('formats the local calendar date with zero padding', () => {
    expect(localDateKey(local(2026, 3, 7, 23, 59))).toBe('2026-03-07');
    expect(localDateKey(local(2026, 10, 26))).toBe('2026-10-26');
  });

  for (const tz of ['America/New_York', 'Europe/London', 'Australia/Sydney', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Asia/Kolkata']) {
    it(`advances by exactly one day per local day across DST in ${tz}`, () => {
      process.env.TZ = tz;
      let prev = localDateKey(local(2026, 10, 26, 0, 30));
      // Walk two years of days at 00:30 and 23:30 local, covering every DST switch.
      for (let i = 1; i < 730; i++) {
        const key = localDateKey(local(2026, 10, 26 + i, 0, 30));
        expect(daysBetween(prev, key)).toBe(1);
        expect(localDateKey(local(2026, 10, 26 + i, 23, 30))).toBe(key);
        prev = key;
      }
    });
  }

  it('uses the local date, so the same instant can be different days in different zones', () => {
    const instant = Date.UTC(2026, 11, 1, 3, 0); // 1 Dec 03:00 UTC
    process.env.TZ = 'America/Los_Angeles';
    expect(localDateKey(new Date(instant))).toBe('2026-11-30');
    process.env.TZ = 'Europe/Paris';
    expect(localDateKey(new Date(instant))).toBe('2026-12-01');
  });
});

describe('daysBetween', () => {
  it('counts calendar days, including backwards and across years', () => {
    expect(daysBetween('2026-10-26', '2026-10-26')).toBe(0);
    expect(daysBetween('2026-10-26', '2027-03-15')).toBe(140);
    expect(daysBetween('2027-01-01', '2026-12-31')).toBe(-1);
  });
});

describe('nextLocalMidnight', () => {
  it('returns the start of the next local day, even across DST', () => {
    process.env.TZ = 'America/New_York';
    const m = nextLocalMidnight(local(2027, 3, 13, 22, 0)); // DST starts 14 Mar 2027
    expect([m.getFullYear(), m.getMonth() + 1, m.getDate(), m.getHours(), m.getMinutes()]).toEqual([2027, 3, 14, 0, 0]);
    expect(localDateKey(m)).toBe('2027-03-14');
  });
});

describe('seeded shuffle', () => {
  it('is deterministic for a seed and varies across seeds', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    expect(seededShuffle(items, 'x')).toEqual(seededShuffle(items, 'x'));
    const distinct = new Set(Array.from({ length: 50 }, (_, i) => seededShuffle(items, `s${i}`).join('')));
    expect(distinct.size).toBeGreaterThan(20);
  });

  it('is a permutation and never starts already solved', () => {
    const correct = correctOrder(PUZZLE.events);
    for (let n = 1; n <= 2000; n++) {
      const order = initialOrder(PUZZLE, n);
      expect(isValidOrder(order, PUZZLE.events)).toBe(true);
      expect(order).not.toEqual(correct);
    }
  });

  it('gives every player the same start for the same puzzle number', () => {
    expect(initialOrder(PUZZLE, 142)).toEqual(initialOrder(structuredClone(PUZZLE), 142));
  });
});

describe('isValidOrder', () => {
  it('rejects wrong lengths, duplicates, and unknown ids', () => {
    expect(isValidOrder(['e1', 'e2', 'e3', 'e4', 'e5'], PUZZLE.events)).toBe(true);
    expect(isValidOrder(['e1', 'e2', 'e3', 'e4'], PUZZLE.events)).toBe(false);
    expect(isValidOrder(['e1', 'e1', 'e3', 'e4', 'e5'], PUZZLE.events)).toBe(false);
    expect(isValidOrder(['e1', 'e2', 'e3', 'e4', 'x'], PUZZLE.events)).toBe(false);
    expect(isValidOrder('nope', PUZZLE.events)).toBe(false);
  });
});

import { afterEach, describe, expect, it } from 'vitest';
import { LAUNCH_DATE, getPuzzle, initialOrder, isValidOrder, nextLocalMidnight, puzzleNumberForDate, seededShuffle } from '../../src/lib/puzzle';
import { correctOrder } from '../../src/lib/scoring';
import { PUZZLE } from './fixtures';

const originalTZ = process.env.TZ;
afterEach(() => {
  process.env.TZ = originalTZ;
});

/** Local wall-clock date in the current process TZ. */
const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min);
const launch = () => local(LAUNCH_DATE.year, LAUNCH_DATE.month, LAUNCH_DATE.day);

describe('puzzleNumberForDate', () => {
  it('is #1 on launch day and counts calendar days after', () => {
    expect(puzzleNumberForDate(launch())).toBe(1);
    const nextDay = launch();
    nextDay.setDate(nextDay.getDate() + 1);
    expect(puzzleNumberForDate(nextDay)).toBe(2);
    const later = launch();
    later.setDate(later.getDate() + 141);
    expect(puzzleNumberForDate(later)).toBe(142);
  });

  it('never goes below #1 before launch', () => {
    expect(puzzleNumberForDate(local(2020, 1, 1))).toBe(1);
  });

  it('rolls over at local midnight, not before', () => {
    const d = launch();
    d.setDate(d.getDate() + 9);
    const n = puzzleNumberForDate(d);
    expect(puzzleNumberForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999))).toBe(n);
    expect(puzzleNumberForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0))).toBe(n + 1);
  });

  for (const tz of ['America/New_York', 'Europe/London', 'Australia/Sydney', 'Pacific/Kiritimati', 'Pacific/Pago_Pago', 'Asia/Kolkata']) {
    it(`increments by exactly one per day across DST in ${tz}`, () => {
      process.env.TZ = tz;
      let prev = puzzleNumberForDate(local(2026, 10, 26, 0, 30));
      // Walk two years of days at 00:30 and 23:30 local, covering every DST switch.
      for (let i = 1; i < 730; i++) {
        const early = local(2026, 10, 26 + i, 0, 30);
        const late = local(2026, 10, 26 + i, 23, 30);
        const n = puzzleNumberForDate(early);
        expect(n).toBe(prev + 1);
        expect(puzzleNumberForDate(late)).toBe(n);
        prev = n;
      }
    });
  }

  it('uses the local date, so the same instant can be different puzzles in different zones', () => {
    const instant = Date.UTC(2026, 11, 1, 3, 0); // 1 Dec 03:00 UTC
    process.env.TZ = 'America/Los_Angeles'; // still 30 Nov
    const la = puzzleNumberForDate(new Date(instant));
    process.env.TZ = 'Europe/Paris'; // 1 Dec
    const paris = puzzleNumberForDate(new Date(instant));
    expect(paris).toBe(la + 1);
  });
});

describe('nextLocalMidnight', () => {
  it('returns the start of the next local day, even across DST', () => {
    process.env.TZ = 'America/New_York';
    const m = nextLocalMidnight(local(2027, 3, 13, 22, 0)); // DST starts 14 Mar 2027
    expect([m.getFullYear(), m.getMonth() + 1, m.getDate(), m.getHours(), m.getMinutes()]).toEqual([2027, 3, 14, 0, 0]);
    expect(puzzleNumberForDate(m)).toBe(puzzleNumberForDate(local(2027, 3, 13)) + 1);
  });
});

describe('getPuzzle', () => {
  const list = [1, 2, 3].map((id) => ({ ...PUZZLE, id }));
  it('looks up by number and loops when the list runs out', () => {
    expect(getPuzzle(list, 1).id).toBe(1);
    expect(getPuzzle(list, 3).id).toBe(3);
    expect(getPuzzle(list, 4).id).toBe(1);
    expect(getPuzzle(list, 8).id).toBe(2);
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

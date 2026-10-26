import { describe, expect, it } from 'vitest';
import { STORAGE_KEY, averageScore, defaultState, effectiveStreak, loadState, recordResult, saveState } from '../../src/lib/storage';

const order = ['e1', 'e2', 'e3', 'e4', 'e5'];

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, v),
  };
}

describe('recordResult', () => {
  it('records the result, clears progress, and updates stats', () => {
    const start = { ...defaultState(), inProgress: { puzzle: 10, order } };
    const s = recordResult(start, 10, order, 4);
    expect(s.results[10]).toEqual({ order, score: 4 });
    expect(s.inProgress).toBeNull();
    expect(s.lastPlayedPuzzle).toBe(10);
    expect(s.stats).toEqual({ played: 1, currentStreak: 1, maxStreak: 1, distribution: [0, 0, 0, 0, 1, 0] });
  });

  it('increments the streak on consecutive days and resets after a gap', () => {
    let s = defaultState();
    s = recordResult(s, 1, order, 5);
    s = recordResult(s, 2, order, 2);
    s = recordResult(s, 3, order, 0);
    expect(s.stats.currentStreak).toBe(3);
    s = recordResult(s, 5, order, 1);
    expect(s.stats.currentStreak).toBe(1);
    expect(s.stats.maxStreak).toBe(3);
    expect(s.stats.played).toBe(4);
    expect(s.stats.distribution).toEqual([1, 1, 1, 0, 0, 1]);
  });

  it('cannot record the same puzzle twice', () => {
    const once = recordResult(defaultState(), 7, order, 5);
    const twice = recordResult(once, 7, order, 0);
    expect(twice).toBe(once);
    expect(twice.stats.played).toBe(1);
  });
});

describe('effectiveStreak', () => {
  it('shows 0 once a day has been missed', () => {
    const s = recordResult(recordResult(defaultState(), 1, order, 5), 2, order, 5);
    expect(effectiveStreak(s, 2)).toBe(2);
    expect(effectiveStreak(s, 3)).toBe(2);
    expect(effectiveStreak(s, 4)).toBe(0);
    expect(effectiveStreak(defaultState(), 4)).toBe(0);
  });
});

describe('averageScore', () => {
  it('averages over games played', () => {
    expect(averageScore({ played: 4, currentStreak: 0, maxStreak: 0, distribution: [1, 0, 0, 1, 0, 2] })).toBe(3.25);
    expect(averageScore(defaultState().stats)).toBe(0);
  });
});

describe('load and save', () => {
  it('round-trips state under the versioned key', () => {
    const storage = memoryStorage();
    const s = recordResult(defaultState(), 3, order, 3);
    saveState(s, storage);
    expect(storage.getItem(STORAGE_KEY)).toContain('"lastPlayedPuzzle":3');
    expect(loadState(storage)).toEqual(s);
  });

  it('falls back to defaults on corrupt or missing data', () => {
    expect(loadState(memoryStorage({ [STORAGE_KEY]: '{not json' }))).toEqual(defaultState());
    expect(loadState(memoryStorage())).toEqual(defaultState());
    expect(loadState(undefined)).toEqual(defaultState());
  });

  it('fills in fields missing from older saves', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify({ lastPlayedPuzzle: 2, stats: { played: 1, currentStreak: 1, maxStreak: 1, distribution: [0, 0, 0, 0, 0, 1] } }) });
    const s = loadState(storage);
    expect(s.settings).toEqual({ theme: 'system', highContrast: false });
    expect(s.results).toEqual({});
    expect(s.stats.played).toBe(1);
  });

  it('survives storage that throws', () => {
    const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('full'); } } as unknown as Storage;
    expect(loadState(throwing)).toEqual(defaultState());
    expect(() => saveState(defaultState(), throwing)).not.toThrow();
  });
});

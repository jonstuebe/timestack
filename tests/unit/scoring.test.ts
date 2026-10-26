import { describe, expect, it } from 'vitest';
import { correctOrder, headline, scoreOrder, slotResults } from '../../src/lib/scoring';
import type { PuzzleEvent } from '../../src/lib/types';
import { PUZZLE } from './fixtures';

const correct = ['e1', 'e2', 'e3', 'e4', 'e5'];

describe('correctOrder', () => {
  it('sorts by year, then month, then day, with BCE as negative years', () => {
    const ev = (id: string, year: number, month?: number, day?: number): PuzzleEvent => ({ id, title: id, year, month, day, display: '' });
    const events = [ev('moon', 1969), ev('cleo', -30), ev('pyramid', -2560), ev('monroe', 1926, 6, 1), ev('queen', 1926, 4, 21)];
    expect(correctOrder(events)).toEqual(['pyramid', 'cleo', 'queen', 'monroe', 'moon']);
  });

  it('matches the stored order of the fixture', () => {
    expect(correctOrder([...PUZZLE.events].reverse())).toEqual(correct);
  });
});

describe('slotResults and scoreOrder', () => {
  it('scores a perfect order', () => {
    expect(slotResults(correct, correct)).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
    expect(scoreOrder(correct, correct)).toBe(5);
  });

  it('marks one slot off as close and further as far', () => {
    const submitted = ['e1', 'e3', 'e2', 'e5', 'e4'];
    expect(slotResults(submitted, correct)).toEqual(['correct', 'close', 'close', 'close', 'close']);
    expect(scoreOrder(submitted, correct)).toBe(1);

    const reversed = [...correct].reverse();
    expect(slotResults(reversed, correct)).toEqual(['far', 'far', 'correct', 'far', 'far']);
    expect(scoreOrder(reversed, correct)).toBe(1);
  });

  it('only counts exact positions as points', () => {
    expect(scoreOrder(['e2', 'e1', 'e3', 'e4', 'e5'], correct)).toBe(3);
  });
});

describe('headline', () => {
  it.each([
    [5, 'Perfect timeline!'],
    [4, 'So close'],
    [3, 'Solid'],
    [2, 'Time is weird'],
    [1, 'History got you today'],
    [0, 'History got you today'],
  ])('%i → %s', (score, text) => expect(headline(score)).toBe(text));
});

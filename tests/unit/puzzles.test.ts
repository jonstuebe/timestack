import { describe, expect, it } from 'vitest';
import puzzles from '../../worker/puzzles.json';
import { compareEvents } from '../../src/lib/scoring';
import { categoryIcon } from '../../src/lib/icons';
import type { Puzzle } from '../../src/lib/types';

const ERA_WORDS = /\b(medieval|victorian|ancient|renaissance|bronze age|iron age|stone age|colonial|prehistoric|edwardian|georgian|elizabethan|century|decade|BC|BCE|AD)\b/i;

describe('puzzles.json', () => {
  const list = puzzles as Puzzle[];

  it('has sequential ids starting at 1', () => {
    expect(list.length).toBeGreaterThan(0);
    list.forEach((p, i) => expect(p.id).toBe(i + 1));
  });

  describe.each(list.map((p) => [p.id, p] as const))('puzzle %i', (_, p) => {
    it('has a fact and five well-formed events', () => {
      expect(p.fact.trim().length).toBeGreaterThan(10);
      expect(p.events).toHaveLength(5);
      expect(new Set(p.events.map((e) => e.id)).size).toBe(5);
      for (const e of p.events) {
        expect(Number.isInteger(e.year) && e.year !== 0, `${e.id} year`).toBe(true);
        if (e.month !== undefined) expect(e.month).toBeGreaterThanOrEqual(1), expect(e.month).toBeLessThanOrEqual(12);
        if (e.day !== undefined) {
          expect(e.month, `${e.id} has day without month`).toBeDefined();
          expect(e.day).toBeGreaterThanOrEqual(1);
          expect(e.day).toBeLessThanOrEqual(31);
        }
        expect(e.display.trim()).not.toBe('');
        expect(e.title.length, e.title).toBeLessThanOrEqual(60);
        expect(e.title, 'titles must not give away the date').not.toMatch(/\d{3,4}/);
        expect(e.title, 'titles must not use era words').not.toMatch(ERA_WORDS);
        if (e.category) expect(categoryIcon(e.category), `unknown category ${e.category}`).toBeDefined();
      }
    });

    it('stores events in strictly ascending order with no ties', () => {
      for (let i = 1; i < p.events.length; i++) {
        expect(compareEvents(p.events[i - 1], p.events[i]), `${p.events[i - 1].id} vs ${p.events[i].id}`).toBeLessThan(0);
      }
    });
  });
});

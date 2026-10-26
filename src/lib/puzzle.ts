import type { Puzzle, PuzzleEvent } from './types';
import { correctOrder } from './scoring';

/** Puzzle #1 is played on this local date. */
export const LAUNCH_DATE = { year: 2026, month: 10, day: 26 } as const;

const DAY_MS = 86_400_000;

/**
 * Days since launch (puzzle #1 on launch day), using the player's local
 * calendar date. Calendar parts are compared as UTC midnights so DST
 * transitions (23- or 25-hour days) never skew the count.
 */
export function puzzleNumberForDate(date: Date): number {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const launch = Date.UTC(LAUNCH_DATE.year, LAUNCH_DATE.month - 1, LAUNCH_DATE.day);
  return Math.max(1, Math.round((local - launch) / DAY_MS) + 1);
}

/** Looks up a puzzle by number, looping back to #1 when the list runs out. */
export function getPuzzle(puzzles: Puzzle[], number: number): Puzzle {
  const index = (((number - 1) % puzzles.length) + puzzles.length) % puzzles.length;
  if (import.meta.env?.DEV && number > puzzles.length) {
    console.warn(`[timestack] Puzzle #${number} exceeds the ${puzzles.length} bundled puzzles; looping to #${index + 1}.`);
  }
  return puzzles[index];
}

/** The next local midnight after `now`. */
export function nextLocalMidnight(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/** mulberry32: small, fast, deterministic PRNG. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const rand = mulberry32(hashString(seed));
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * The starting card order for a puzzle number: identical for every player,
 * and never already solved.
 */
export function initialOrder(puzzle: Puzzle, number: number): string[] {
  const correct = correctOrder(puzzle.events);
  for (let attempt = 0; attempt < 20; attempt++) {
    const order = seededShuffle(correct, `timestack:${number}:${puzzle.id}:${attempt}`);
    if (order.some((id, i) => id !== correct[i])) return order;
  }
  // Practically unreachable; reversing always differs for 2+ distinct items.
  return correct.slice().reverse();
}

export function isValidOrder(order: unknown, events: PuzzleEvent[]): order is string[] {
  if (!Array.isArray(order) || order.length !== events.length) return false;
  const ids = new Set(events.map((e) => e.id));
  return new Set(order).size === order.length && order.every((id) => ids.has(id));
}

export function formatPuzzleDate(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

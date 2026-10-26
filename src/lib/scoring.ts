import type { PuzzleEvent, SlotResult } from './types';

export function compareEvents(a: PuzzleEvent, b: PuzzleEvent): number {
  return a.year - b.year || (a.month ?? 0) - (b.month ?? 0) || (a.day ?? 0) - (b.day ?? 0);
}

/** Event ids sorted earliest to latest. */
export function correctOrder(events: PuzzleEvent[]): string[] {
  return events.slice().sort(compareEvents).map((e) => e.id);
}

/** Result for each slot of the submitted order: exact, one slot off, or further. */
export function slotResults(submitted: string[], correct: string[]): SlotResult[] {
  return submitted.map((id, i) => {
    const distance = Math.abs(correct.indexOf(id) - i);
    return distance === 0 ? 'correct' : distance === 1 ? 'close' : 'far';
  });
}

export function scoreOrder(submitted: string[], correct: string[]): number {
  return submitted.filter((id, i) => id === correct[i]).length;
}

export function headline(score: number): string {
  if (score >= 5) return 'Perfect timeline!';
  if (score === 4) return 'So close';
  if (score === 3) return 'Solid';
  if (score === 2) return 'Time is weird';
  return 'History got you today';
}

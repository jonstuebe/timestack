export interface PuzzleEvent {
  id: string;
  title: string;
  /** Negative for BCE (-30 = 30 BC). */
  year: number;
  month?: number;
  day?: number;
  /** Text shown on reveal, e.g. "c. 2560 BC" or "Apr 1926". */
  display: string;
  category?: string;
  note?: string;
}

export interface Puzzle {
  id: number;
  fact: string;
  /** Stored in correct chronological order. */
  events: PuzzleEvent[];
}

export type SlotResult = 'correct' | 'close' | 'far';

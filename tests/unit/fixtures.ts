import type { Puzzle } from '../../src/lib/types';

export const PUZZLE: Puzzle = {
  id: 1,
  fact: 'Queen Elizabeth II and Marilyn Monroe were born less than six weeks apart, in 1926.',
  events: [
    { id: 'e1', title: 'Jack the Ripper murders begin in London', year: 1888, month: 8, day: 31, display: '1888' },
    { id: 'e2', title: 'Nintendo is founded', year: 1889, month: 9, day: 23, display: '1889' },
    { id: 'e3', title: 'Queen Elizabeth II is born', year: 1926, month: 4, day: 21, display: 'Apr 1926' },
    { id: 'e4', title: 'Marilyn Monroe is born', year: 1926, month: 6, day: 1, display: 'Jun 1926' },
    { id: 'e5', title: 'Sliced bread is first sold', year: 1928, month: 7, day: 7, display: '1928' },
  ],
};

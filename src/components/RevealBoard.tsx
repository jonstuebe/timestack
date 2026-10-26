import { useEffect, useState } from 'react';
import type { PuzzleEvent, SlotResult } from '../lib/types';
import { categoryIcon } from '../lib/icons';

export const FLIP_STAGGER_MS = 300;
const FLIP_DURATION_MS = 500;

interface RevealBoardProps {
  events: Record<string, PuzzleEvent>;
  order: string[];
  results: SlotResult[];
  /** Flip cards one by one; otherwise show them already revealed. */
  animate: boolean;
  onComplete?: () => void;
}

const RESULT_LABEL: Record<SlotResult, string> = {
  correct: 'correct position',
  close: 'one slot off',
  far: 'two or more slots off',
};

export function RevealBoard({ events, order, results, animate, onComplete }: RevealBoardProps) {
  const [revealed, setRevealed] = useState(animate ? 0 : order.length);

  useEffect(() => {
    if (!animate) {
      onComplete?.();
      return;
    }
    const timers = order.map((_, i) => window.setTimeout(() => setRevealed(i + 1), FLIP_STAGGER_MS * (i + 1)));
    timers.push(window.setTimeout(() => onComplete?.(), FLIP_STAGGER_MS * order.length + FLIP_DURATION_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // Runs once per mount: the reveal is a one-shot sequence.
  }, []);

  return (
    <div className="board">
      <p className="axis-label" aria-hidden="true">Earlier ↑</p>
      <ol className="stack" aria-label="Your order">
        {order.map((id, i) => {
          const event = events[id];
          const icon = categoryIcon(event.category);
          const isRevealed = i < revealed;
          return (
            <li key={id} className={`card-slot${isRevealed ? ' flipped' : ''}`} data-id={id} data-result={isRevealed ? results[i] : undefined}>
              <div className="flip">
                <div className="face front card" aria-hidden={isRevealed}>
                  {icon && <span className="card-icon" aria-hidden="true">{icon}</span>}
                  <span className="card-title">{event.title}</span>
                </div>
                <div className={`face back card result-${results[i]}`} aria-hidden={!isRevealed}>
                  {icon && <span className="card-icon" aria-hidden="true">{icon}</span>}
                  <span className="card-title">{event.title}</span>
                  <span className="card-year">{event.display}</span>
                  <span className="visually-hidden">, {RESULT_LABEL[results[i]]}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="axis-label" aria-hidden="true">Later ↓</p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import type { PuzzleEvent, SlotResult } from '../lib/types';
import { categoryIcon } from '../lib/icons';

export const STAMP_STAGGER_MS = 300;
const STAMP_DURATION_MS = 450;

interface RevealBoardProps {
  events: Record<string, PuzzleEvent>;
  order: string[];
  results: SlotResult[];
  /** Stamp cards one by one; otherwise show them already revealed. */
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
    const timers = order.map((_, i) => window.setTimeout(() => setRevealed(i + 1), STAMP_STAGGER_MS * (i + 1)));
    timers.push(window.setTimeout(() => onComplete?.(), STAMP_STAGGER_MS * order.length + STAMP_DURATION_MS));
    return () => timers.forEach((t) => window.clearTimeout(t));
    // Runs once per mount: the reveal is a one-shot sequence.
  }, []);

  return (
    <div className="board">
      <p className="axis-label" aria-hidden="true">Earliest</p>
      <ol className="stack" aria-label="Your order">
        {order.map((id, i) => {
          const event = events[id];
          const icon = categoryIcon(event.category);
          const isRevealed = i < revealed;
          return (
            <li
              key={id}
              className={`card reveal-card${isRevealed ? ` revealed result-${results[i]}` : ''}`}
              data-id={id}
              data-result={isRevealed ? results[i] : undefined}
            >
              <span className="card-hole" aria-hidden="true" />
              {icon && <span className="card-icon" aria-hidden="true">{icon}</span>}
              <span className="card-title">{event.title}</span>
              {isRevealed && (
                <>
                  <span className="card-year">{event.display}</span>
                  <span className="visually-hidden">, {RESULT_LABEL[results[i]]}</span>
                </>
              )}
            </li>
          );
        })}
      </ol>
      <p className="axis-label" aria-hidden="true">Latest</p>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import type { Puzzle, SlotResult } from '../lib/types';
import { headline } from '../lib/scoring';
import { buildShareText, shareResults } from '../lib/share';
import { Countdown } from './Countdown';
import { ShareIcon } from './Icons';

interface ResultsProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  correct: string[];
  submitted: string[];
  results: SlotResult[];
  score: number;
  highContrast: boolean;
  focusOnMount: boolean;
  onToast: (message: string) => void;
  onNextPuzzle: () => void;
}

export function Results({ puzzle, puzzleNumber, correct, submitted, results, score, highContrast, focusOnMount, onToast, onNextPuzzle }: ResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [manualText, setManualText] = useState<string | null>(null);
  const byId = Object.fromEntries(puzzle.events.map((e) => [e.id, e]));

  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus();
  }, [focusOnMount]);

  const onShare = async () => {
    const text = buildShareText(puzzleNumber, score, results, highContrast);
    const outcome = await shareResults(text);
    if (outcome === 'copied') onToast('Copied results to clipboard');
    if (outcome === 'failed') setManualText(text);
  };

  return (
    <section className="results" aria-labelledby="results-heading">
      <h2 id="results-heading" ref={headingRef} tabIndex={-1} className="results-headline">
        {headline(score)}
      </h2>
      <p className="results-score">
        <span className="visually-hidden">Score: </span>
        {score}/5
      </p>

      <h3 className="section-label">Correct order</h3>
      <ol className="answer-list">
        {correct.map((id, i) => {
          const event = byId[id];
          const gotIt = submitted[i] === id;
          return (
            <li key={id} className="answer">
              <span className={`answer-year${gotIt ? ' answer-year-correct' : ''}`}>{event.display}</span>
              <span className="answer-text">
                <span className="answer-title">
                  {event.title}
                  {gotIt && <span className="visually-hidden"> (you placed this correctly)</span>}
                </span>
                {event.note && <span className="answer-note">{event.note}</span>}
              </span>
            </li>
          );
        })}
      </ol>

      <aside className="fact-card" aria-label="Did you know?">
        <p className="fact-label">🤯 Did you know?</p>
        <p className="fact-text">{puzzle.fact}</p>
      </aside>

      <button type="button" className="share-button" onClick={onShare}>
        Share <ShareIcon />
      </button>
      {manualText && (
        <div className="manual-share">
          <label htmlFor="manual-share-text">Copy your result:</label>
          <textarea id="manual-share-text" readOnly value={manualText} rows={5} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}

      <Countdown onExpire={onNextPuzzle} />
    </section>
  );
}

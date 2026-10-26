import { useCallback, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Puzzle } from '../lib/types';
import { initialOrder, isValidOrder } from '../lib/puzzle';
import { correctOrder, scoreOrder, slotResults } from '../lib/scoring';
import { recordResult, type GameState } from '../lib/storage';
import { Board } from './Board';
import { RevealBoard } from './RevealBoard';
import { Results } from './Results';
import { ConfirmModal } from './ConfirmModal';

type Phase = 'playing' | 'revealing' | 'done';

interface GameProps {
  puzzle: Puzzle;
  puzzleNumber: number;
  state: GameState;
  setState: Dispatch<SetStateAction<GameState>>;
  reducedMotion: boolean;
  announce: (message: string) => void;
  onToast: (message: string) => void;
  onNextPuzzle: () => void;
}

/** One Puzzle's board, reveal and results. Keyed by Puzzle number so a new day starts fresh. */
export function Game({ puzzle, puzzleNumber, state, setState, reducedMotion, announce, onToast, onNextPuzzle }: GameProps) {
  const eventsById = useMemo(() => Object.fromEntries(puzzle.events.map((e) => [e.id, e])), [puzzle]);
  const correct = useMemo(() => correctOrder(puzzle.events), [puzzle]);

  const result = state.results[puzzleNumber];
  const [order, setOrder] = useState<string[]>(() => startingOrder(state, puzzleNumber, puzzle));
  const [phase, setPhase] = useState<Phase>(result ? 'done' : 'playing');
  const [confirming, setConfirming] = useState(false);
  // Only animate and steal focus for a reveal that happens in this session.
  const playedThisSession = useRef(false);

  const handleReorder = (next: string[]) => {
    setOrder(next);
    setState((s) => ({ ...s, inProgress: { puzzle: puzzleNumber, order: next } }));
  };

  const submit = () => {
    setConfirming(false);
    if (state.results[puzzleNumber]) return;
    const score = scoreOrder(order, correct);
    playedThisSession.current = true;
    setState((s) => recordResult(s, puzzleNumber, order, score));
    setPhase('revealing');
    announce('Revealing the dates.');
  };

  const finishReveal = useCallback(() => {
    setPhase((p) => (p === 'revealing' ? 'done' : p));
  }, []);

  const submitted = result?.order ?? order;
  const results = slotResults(submitted, correct);

  return (
    <>
      {phase === 'playing' ? (
        <>
          <Board events={eventsById} order={order} onChange={handleReorder} announce={announce} />
          <button type="button" className="primary-button lock-button" onClick={() => setConfirming(true)}>
            Lock it in
          </button>
        </>
      ) : (
        <RevealBoard
          events={eventsById}
          order={submitted}
          results={results}
          animate={playedThisSession.current && !reducedMotion}
          onComplete={finishReveal}
        />
      )}

      {phase === 'done' && result && (
        <Results
          puzzle={puzzle}
          puzzleNumber={puzzleNumber}
          correct={correct}
          submitted={submitted}
          results={results}
          score={result.score}
          focusOnMount={playedThisSession.current}
          onToast={onToast}
          onNextPuzzle={onNextPuzzle}
        />
      )}

      <ConfirmModal open={confirming} onCancel={() => setConfirming(false)} onConfirm={submit} />
    </>
  );
}

function startingOrder(state: GameState, puzzleNumber: number, puzzle: Puzzle): string[] {
  const saved = state.inProgress;
  if (saved && saved.puzzle === puzzleNumber && isValidOrder(saved.order, puzzle.events)) return saved.order;
  return initialOrder(puzzle, puzzleNumber);
}

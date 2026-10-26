import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import puzzlesData from './data/puzzles.json';
import type { Puzzle } from './lib/types';
import { formatPuzzleDate, getPuzzle, initialOrder, isValidOrder, puzzleNumberForDate } from './lib/puzzle';
import { correctOrder, scoreOrder, slotResults } from './lib/scoring';
import { effectiveStreak, loadState, recordResult, saveState, type GameState, type Settings } from './lib/storage';
import { applyUpdate, onUpdateAvailable } from './lib/pwa';
import { usePrefersReducedMotion } from './lib/usePrefersReducedMotion';
import { Header } from './components/Header';
import { Board } from './components/Board';
import { RevealBoard } from './components/RevealBoard';
import { Results } from './components/Results';
import { HelpModal } from './components/HelpModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { ToastList, type ToastMessage } from './components/Toast';

const PUZZLES = puzzlesData as Puzzle[];

type ModalName = 'help' | 'stats' | 'settings' | 'confirm' | null;
type Phase = 'playing' | 'revealing' | 'done';

export function App() {
  const [now, setNow] = useState(() => new Date());
  const puzzleNumber = puzzleNumberForDate(now);
  const puzzle = useMemo(() => getPuzzle(PUZZLES, puzzleNumber), [puzzleNumber]);
  const eventsById = useMemo(() => Object.fromEntries(puzzle.events.map((e) => [e.id, e])), [puzzle]);
  const correct = useMemo(() => correctOrder(puzzle.events), [puzzle]);

  const [state, setState] = useState<GameState>(loadState);
  const [modal, setModal] = useState<ModalName>(() => (state.seenHelp ? null : 'help'));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [liveMessage, setLiveMessage] = useState('');
  const reducedMotion = usePrefersReducedMotion();

  const result = state.results[puzzleNumber];
  const [order, setOrder] = useState<string[]>(() => startingOrder(state, puzzleNumber, puzzle));
  const [phase, setPhase] = useState<Phase>(result ? 'done' : 'playing');
  // Only animate and steal focus for a reveal that happens in this session.
  const playedThisSession = useRef(false);

  // Persist every state change.
  useEffect(() => saveState(state), [state]);

  // Theme and contrast live on <html> so CSS tokens can switch.
  useEffect(() => {
    const root = document.documentElement;
    if (state.settings.theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = state.settings.theme;
    if (state.settings.highContrast) root.dataset.contrast = 'high';
    else delete root.dataset.contrast;
  }, [state.settings]);

  // Roll over to a new puzzle at local midnight, or when the app returns from the background on a new day.
  const refreshDate = useCallback(() => setNow(new Date()), []);
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refreshDate();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refreshDate);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refreshDate);
    };
  }, [refreshDate]);

  const lastPuzzle = useRef(puzzleNumber);
  useEffect(() => {
    if (lastPuzzle.current === puzzleNumber) return;
    lastPuzzle.current = puzzleNumber;
    playedThisSession.current = false;
    setOrder(startingOrder(state, puzzleNumber, puzzle));
    setPhase(state.results[puzzleNumber] ? 'done' : 'playing');
    setModal((m) => (m === 'confirm' ? null : m));
  }, [puzzleNumber, puzzle, state]);

  const showToast = useCallback((content: ToastMessage['content'], persistent = false) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, content, persistent }]);
    if (!persistent) window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2500);
  }, []);

  useEffect(
    () =>
      onUpdateAvailable(() =>
        showToast(
          <>
            New version available{' '}
            <button type="button" className="toast-action" onClick={applyUpdate}>
              Refresh
            </button>
          </>,
          true,
        ),
      ),
    [showToast],
  );

  const announce = useCallback((message: string) => {
    // Clear first so repeating the same message is still announced.
    setLiveMessage('');
    window.requestAnimationFrame(() => setLiveMessage(message));
  }, []);

  const handleReorder = (next: string[]) => {
    setOrder(next);
    setState((s) => ({ ...s, inProgress: { puzzle: puzzleNumber, order: next } }));
  };

  const submit = () => {
    setModal(null);
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

  const closeHelp = () => {
    setModal(null);
    if (!state.seenHelp) setState((s) => ({ ...s, seenHelp: true }));
  };

  const updateSettings = (settings: Settings) => setState((s) => ({ ...s, settings }));

  const submitted = result?.order ?? order;
  const results = slotResults(submitted, correct);
  const latestScore = state.lastPlayedPuzzle !== null ? (state.results[state.lastPlayedPuzzle]?.score ?? null) : null;

  return (
    <div className="app">
      <Header onHelp={() => setModal('help')} onStats={() => setModal('stats')} onSettings={() => setModal('settings')} />
      <main className="main">
        <p className="puzzle-meta">
          <span className="puzzle-number">#{puzzleNumber}</span> · {formatPuzzleDate(now)}
        </p>

        {phase === 'playing' ? (
          <>
            <Board events={eventsById} order={order} onChange={handleReorder} announce={announce} />
            <button type="button" className="primary-button lock-button" onClick={() => setModal('confirm')}>
              Lock it in
            </button>
          </>
        ) : (
          <RevealBoard
            key={puzzleNumber}
            events={eventsById}
            order={submitted}
            results={results}
            animate={playedThisSession.current && !reducedMotion}
            onComplete={finishReveal}
          />
        )}

        {phase === 'done' && result && (
          <Results
            key={puzzleNumber}
            puzzle={puzzle}
            puzzleNumber={puzzleNumber}
            correct={correct}
            submitted={submitted}
            results={results}
            score={result.score}
            highContrast={state.settings.highContrast}
            focusOnMount={playedThisSession.current}
            onToast={showToast}
            onNextPuzzle={refreshDate}
          />
        )}
      </main>

      <HelpModal open={modal === 'help'} onClose={closeHelp} />
      <StatsModal
        open={modal === 'stats'}
        onClose={() => setModal(null)}
        stats={state.stats}
        currentStreak={effectiveStreak(state, puzzleNumber)}
        latestScore={latestScore}
      />
      <SettingsModal open={modal === 'settings'} onClose={() => setModal(null)} settings={state.settings} onChange={updateSettings} />
      <ConfirmModal open={modal === 'confirm'} onCancel={() => setModal(null)} onConfirm={submit} />

      <ToastList toasts={toasts} />
      <div id="announcer" className="visually-hidden" aria-live="assertive" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

function startingOrder(state: GameState, puzzleNumber: number, puzzle: Puzzle): string[] {
  const saved = state.inProgress;
  if (saved && saved.puzzle === puzzleNumber && isValidOrder(saved.order, puzzle.events)) return saved.order;
  return initialOrder(puzzle, puzzleNumber);
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatPuzzleDate, localDateKey } from './lib/puzzle';
import { cachedDaily, estimatedPuzzleNumber, loadDaily, type Daily } from './lib/daily';
import { effectiveStreak, loadState, saveState, type GameState, type Settings } from './lib/storage';
import { applyUpdate, onUpdateAvailable } from './lib/pwa';
import { usePrefersReducedMotion } from './lib/usePrefersReducedMotion';
import { Header } from './components/Header';
import { Game } from './components/Game';
import { Countdown } from './components/Countdown';
import { HelpModal } from './components/HelpModal';
import { StatsModal } from './components/StatsModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastList, type ToastMessage } from './components/Toast';

type ModalName = 'help' | 'stats' | 'settings' | null;

export function App() {
  const [now, setNow] = useState(() => new Date());
  const date = localDateKey(now);
  const [daily, setDaily] = useState<Daily>(() => cachedDaily(date) ?? { status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  const [state, setState] = useState<GameState>(loadState);
  const [modal, setModal] = useState<ModalName>(() => (state.seenHelp ? null : 'help'));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [liveMessage, setLiveMessage] = useState('');
  const reducedMotion = usePrefersReducedMotion();

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

  // Roll over to a new Puzzle at local midnight, or when the app returns from the background on a new day.
  const refreshDate = useCallback(() => setNow(new Date()), []);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refreshDate();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', refreshDate);
    window.addEventListener('online', retry);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', refreshDate);
      window.removeEventListener('online', retry);
    };
  }, [refreshDate, retry]);

  // Fetch the Puzzle for the local date, unless it's already loaded. Retries when asked or back online.
  const dailyRef = useRef(daily);
  dailyRef.current = daily;
  useEffect(() => {
    const current = dailyRef.current;
    if (current.status === 'ready' && current.date === date) return;
    let cancelled = false;
    setDaily({ status: 'loading' });
    void loadDaily(date).then((d) => {
      if (!cancelled) setDaily(d);
    });
    return () => {
      cancelled = true;
    };
  }, [date, attempt]);

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

  const closeHelp = () => {
    setModal(null);
    if (!state.seenHelp) setState((s) => ({ ...s, seenHelp: true }));
  };

  const updateSettings = (settings: Settings) => setState((s) => ({ ...s, settings }));

  const latestScore = state.lastPlayedPuzzle !== null ? (state.results[state.lastPlayedPuzzle]?.score ?? null) : null;
  const todayNumber = daily.status === 'ready' ? daily.number : (estimatedPuzzleNumber(date) ?? state.lastPlayedPuzzle ?? 0);

  return (
    <div className="app">
      <Header onHelp={() => setModal('help')} onStats={() => setModal('stats')} onSettings={() => setModal('settings')} />
      <main className="main">
        <p className="puzzle-meta">
          {daily.status === 'ready' && (
            <>
              <span className="puzzle-number">#{daily.number}</span> ·{' '}
            </>
          )}
          {formatPuzzleDate(now)}
        </p>

        {daily.status === 'ready' && (
          <Game
            key={daily.number}
            puzzle={daily.puzzle}
            puzzleNumber={daily.number}
            state={state}
            setState={setState}
            reducedMotion={reducedMotion}
            announce={announce}
            onToast={showToast}
            onNextPuzzle={refreshDate}
          />
        )}

        {daily.status === 'loading' && (
          <p className="status-text" role="status">
            Loading today's Puzzle…
          </p>
        )}

        {daily.status === 'offline' && (
          <section className="status" aria-labelledby="status-heading">
            <h2 id="status-heading" className="results-headline">
              Connect to get today's Puzzle
            </h2>
            <p className="status-text">Timestack fetches each new Puzzle once a day. Your stats and streak are saved on this device.</p>
            <button type="button" className="primary-button" onClick={retry}>
              Retry
            </button>
          </section>
        )}

        {daily.status === 'none' && (
          <section className="status" aria-labelledby="status-heading">
            <h2 id="status-heading" className="results-headline">
              Back tomorrow
            </h2>
            <p className="status-text">There's no Puzzle today. Check back for the next one.</p>
            <Countdown onExpire={refreshDate} />
          </section>
        )}
      </main>

      <HelpModal open={modal === 'help'} onClose={closeHelp} />
      <StatsModal
        open={modal === 'stats'}
        onClose={() => setModal(null)}
        stats={state.stats}
        currentStreak={effectiveStreak(state, todayNumber)}
        latestScore={latestScore}
      />
      <SettingsModal open={modal === 'settings'} onClose={() => setModal(null)} settings={state.settings} onChange={updateSettings} />

      <ToastList toasts={toasts} />
      <div id="announcer" className="visually-hidden" aria-live="assertive" aria-atomic="true">
        {liveMessage}
      </div>
    </div>
  );
}

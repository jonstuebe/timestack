export const STORAGE_KEY = 'timestack:v1';

export type ThemeSetting = 'system' | 'light' | 'dark';

export interface PuzzleResult {
  order: string[];
  score: number;
}

export interface Stats {
  played: number;
  currentStreak: number;
  maxStreak: number;
  /** Games at each score, index 0..5. */
  distribution: number[];
}

export interface Settings {
  theme: ThemeSetting;
  highContrast: boolean;
}

export interface GameState {
  lastPlayedPuzzle: number | null;
  inProgress: { puzzle: number; order: string[] } | null;
  results: Record<string, PuzzleResult>;
  stats: Stats;
  settings: Settings;
  seenHelp: boolean;
}

export function defaultState(): GameState {
  return {
    lastPlayedPuzzle: null,
    inProgress: null,
    results: {},
    stats: { played: 0, currentStreak: 0, maxStreak: 0, distribution: [0, 0, 0, 0, 0, 0] },
    settings: { theme: 'system', highContrast: false },
    seenHelp: false,
  };
}

/** Reads state, tolerating missing, corrupt, or partial data and blocked storage. */
export function loadState(storage: Storage | undefined = safeStorage()): GameState {
  const base = defaultState();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (!parsed || typeof parsed !== 'object') return base;
    const distribution = Array.isArray(parsed.stats?.distribution) && parsed.stats.distribution.length === 6
      ? parsed.stats.distribution.map((n) => Number(n) || 0)
      : base.stats.distribution;
    return {
      lastPlayedPuzzle: typeof parsed.lastPlayedPuzzle === 'number' ? parsed.lastPlayedPuzzle : null,
      inProgress: parsed.inProgress && typeof parsed.inProgress.puzzle === 'number' && Array.isArray(parsed.inProgress.order)
        ? parsed.inProgress
        : null,
      results: parsed.results && typeof parsed.results === 'object' ? parsed.results : {},
      stats: { ...base.stats, ...parsed.stats, distribution },
      settings: { ...base.settings, ...parsed.settings },
      seenHelp: parsed.seenHelp === true,
    };
  } catch {
    return base;
  }
}

export function saveState(state: GameState, storage: Storage | undefined = safeStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or quota exceeded: the game still works for this session.
  }
}

function safeStorage(): Storage | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * Records a finished puzzle. A no-op if that puzzle already has a result, so
 * a puzzle can never be submitted twice.
 */
export function recordResult(state: GameState, puzzle: number, order: string[], score: number): GameState {
  if (state.results[puzzle]) return state;
  const continues = state.lastPlayedPuzzle === puzzle - 1;
  const currentStreak = continues ? state.stats.currentStreak + 1 : 1;
  const distribution = state.stats.distribution.slice();
  distribution[score] = (distribution[score] ?? 0) + 1;
  return {
    ...state,
    lastPlayedPuzzle: puzzle,
    inProgress: null,
    results: { ...state.results, [puzzle]: { order, score } },
    stats: {
      played: state.stats.played + 1,
      currentStreak,
      maxStreak: Math.max(state.stats.maxStreak, currentStreak),
      distribution,
    },
  };
}

/** The streak as of today: a missed day shows as 0 even before the next game. */
export function effectiveStreak(state: GameState, today: number): number {
  if (state.lastPlayedPuzzle === null) return 0;
  return today - state.lastPlayedPuzzle <= 1 ? state.stats.currentStreak : 0;
}

export function averageScore(stats: Stats): number {
  if (!stats.played) return 0;
  const total = stats.distribution.reduce((sum, count, score) => sum + count * score, 0);
  return total / stats.played;
}

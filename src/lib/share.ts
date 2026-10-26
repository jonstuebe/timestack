import type { SlotResult } from './types';

export const GAME_URL = 'timestack.app';

const EMOJI: Record<'normal' | 'high', Record<SlotResult, string>> = {
  normal: { correct: '🟩', close: '🟨', far: '⬜' },
  high: { correct: '🟧', close: '🟦', far: '⬜' },
};

export function buildShareText(puzzleNumber: number, score: number, results: SlotResult[], highContrast = false): string {
  const palette = EMOJI[highContrast ? 'high' : 'normal'];
  const squares = results.map((r) => palette[r]).join('');
  return `Timestack #${puzzleNumber} ${score}/${results.length}\n\n${squares}\n\n${GAME_URL}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'aborted' | 'failed';

/**
 * Wordle-style sharing: native share sheet where available (phones),
 * clipboard otherwise. 'failed' means the caller should show the text for
 * manual copying.
 */
export async function shareResults(text: string, nav: Navigator = navigator): Promise<ShareOutcome> {
  if (typeof nav.share === 'function' && typeof nav.canShare === 'function' && nav.canShare({ text })) {
    try {
      await nav.share({ text });
      return 'shared';
    } catch (err) {
      if ((err as { name?: string } | null)?.name === 'AbortError') return 'aborted';
      // Otherwise fall through to the clipboard.
    }
  }
  try {
    if (!nav.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await nav.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

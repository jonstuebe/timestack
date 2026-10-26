import type { SlotResult } from './types';

export const GAME_URL = 'timestack.app';

/** Filled, half and hollow, like the card holes on reveal: readable without colour, in any font. */
export const MARKS: Record<SlotResult, string> = { correct: '●', close: '◐', far: '○' };

/** The result as cards threaded on a timeline, e.g. ●─◐─◐─○─●. */
export function resultLine(results: SlotResult[]): string {
  return results.map((r) => MARKS[r]).join('─');
}

export function buildShareText(puzzleNumber: number, score: number, results: SlotResult[]): string {
  return `Timestack No. ${puzzleNumber} · ${score}/${results.length}\n\n${resultLine(results)}\n\n${GAME_URL}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'aborted' | 'failed';

/**
 * Native share sheet where available (phones),
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

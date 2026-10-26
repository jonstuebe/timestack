import { describe, expect, it, vi } from 'vitest';
import { buildShareText, shareResults } from '../../src/lib/share';
import type { SlotResult } from '../../src/lib/types';
import { PUZZLE } from './fixtures';

const results: SlotResult[] = ['correct', 'close', 'close', 'far', 'correct'];

describe('buildShareText', () => {
  it('matches the exact format', () => {
    expect(buildShareText(142, 3, results)).toBe('Timestack No. 142 · 3/5\n\n●─◐─◐─○─●\n\ntimestack.app');
  });

  it('never contains event names or years', () => {
    const text = buildShareText(1, 5, ['correct', 'correct', 'correct', 'correct', 'correct']);
    for (const e of PUZZLE.events) {
      expect(text).not.toContain(e.title);
      expect(text).not.toContain(String(e.year));
      expect(text).not.toContain(e.display);
    }
  });
});

describe('shareResults', () => {
  const text = 'Timestack No. 1 · 5/5';
  const fakeNav = (overrides: Partial<Navigator>) => overrides as Navigator;

  it('uses the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    const nav = fakeNav({ share, canShare: () => true, clipboard: { writeText } as unknown as Clipboard });
    expect(await shareResults(text, nav)).toBe('shared');
    expect(share).toHaveBeenCalledWith({ text });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('does nothing when the share sheet is dismissed', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('dismissed', 'AbortError'));
    const writeText = vi.fn();
    const nav = fakeNav({ share, canShare: () => true, clipboard: { writeText } as unknown as Clipboard });
    expect(await shareResults(text, nav)).toBe('aborted');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('copies to the clipboard when share is unavailable', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await shareResults(text, fakeNav({ clipboard: { writeText } as unknown as Clipboard }))).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(text);
  });

  it('copies when canShare rejects the payload', async () => {
    const share = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const nav = fakeNav({ share, canShare: () => false, clipboard: { writeText } as unknown as Clipboard });
    expect(await shareResults(text, nav)).toBe('copied');
    expect(share).not.toHaveBeenCalled();
  });

  it('falls back to the clipboard if share fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('nope', 'NotAllowedError'));
    const writeText = vi.fn().mockResolvedValue(undefined);
    const nav = fakeNav({ share, canShare: () => true, clipboard: { writeText } as unknown as Clipboard });
    expect(await shareResults(text, nav)).toBe('copied');
  });

  it('reports failure when both methods fail', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    expect(await shareResults(text, fakeNav({ clipboard: { writeText } as unknown as Clipboard }))).toBe('failed');
    expect(await shareResults(text, fakeNav({}))).toBe('failed');
  });
});

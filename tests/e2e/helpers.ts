import { expect, type Page } from '@playwright/test';
import puzzles from '../../src/data/puzzles.json' with { type: 'json' };
import { getPuzzle, puzzleNumberForDate } from '../../src/lib/puzzle';
import { correctOrder } from '../../src/lib/scoring';
import type { Puzzle } from '../../src/lib/types';

/** A fixed local time used by tests: 10:00 on the 5th day after launch. */
export const TEST_NOW = new Date(2026, 9, 30, 10, 0, 0);

export function todaysPuzzle(now = TEST_NOW) {
  const number = puzzleNumberForDate(now);
  const puzzle = getPuzzle(puzzles as Puzzle[], number);
  return { number, puzzle, correct: correctOrder(puzzle.events) };
}

export async function openGame(page: Page, { now = TEST_NOW, seenHelp = true } = {}) {
  await page.clock.install({ time: now });
  if (seenHelp) {
    await page.addInitScript(() => {
      if (!localStorage.getItem('timestack:v1')) localStorage.setItem('timestack:v1', JSON.stringify({ seenHelp: true }));
    });
  }
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Timestack' })).toBeVisible();
}

export function cards(page: Page) {
  return page.locator('.stack > li');
}

export async function currentOrder(page: Page): Promise<string[]> {
  return cards(page).evaluateAll((els) => els.map((el) => el.getAttribute('data-id') ?? ''));
}

/** Rearranges the board with the keyboard only, into `target` order. */
export async function arrangeWithKeyboard(page: Page, target: string[]) {
  for (let i = 0; i < target.length; i++) {
    const card = page.locator(`.stack > li[data-id="${target[i]}"]`);
    await card.focus();
    let from = (await currentOrder(page)).indexOf(target[i]);
    while (from > i) {
      await page.keyboard.press('ArrowUp');
      from--;
    }
    await expect.poll(() => currentOrder(page).then((o) => o.indexOf(target[i]))).toBe(i);
  }
}

export async function lockIn(page: Page) {
  await page.getByRole('button', { name: 'Lock it in' }).click();
  await page.getByRole('dialog', { name: 'Lock it in?' }).getByRole('button', { name: 'Lock it in' }).click();
}

export async function finishReveal(page: Page) {
  await page.clock.runFor(3000);
  await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
}

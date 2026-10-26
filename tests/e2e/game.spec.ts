import { expect, test } from '@playwright/test';
import { arrangeWithKeyboard, cards, currentOrder, finishReveal, lockIn, openGame, todaysPuzzle, TEST_NOW } from './helpers';
import { initialOrder } from '../../src/lib/puzzle';

test('first visit shows How to Play once', async ({ page }) => {
  await openGame(page, { seenHelp: false });
  const help = page.getByRole('dialog', { name: 'How to play' });
  await expect(help).toBeVisible();
  await help.getByRole('button', { name: "Let's play" }).click();
  await expect(help).toBeHidden();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Timestack' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'How to play' })).toBeHidden();
});

test('shows the puzzle number, date, and the seeded starting order without years', async ({ page }) => {
  const { number, puzzle } = todaysPuzzle();
  await openGame(page);
  await expect(page.locator('.puzzle-meta')).toContainText(`No. ${number}`);
  await expect(cards(page)).toHaveCount(5);
  expect(await currentOrder(page)).toEqual(initialOrder(puzzle, number));
  for (const e of puzzle.events) {
    await expect(page.locator('.stack')).not.toContainText(e.display);
  }
});

test('play with keyboard only, submit, and see results', async ({ page }) => {
  const { number, puzzle, correct } = todaysPuzzle();
  await openGame(page);
  await arrangeWithKeyboard(page, correct);
  await expect(page.locator('#announcer')).toContainText('Moved');

  // Keyboard-only confirm: Enter on the button, Enter on the dialog's focused default.
  await page.getByRole('button', { name: 'Lock it in' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'Lock it in?' })).toBeVisible();
  await page.keyboard.press('Enter');

  await finishReveal(page);
  await expect(page.getByRole('heading', { name: 'Perfect timeline!' })).toBeVisible();
  await expect(page.locator('.results-score')).toContainText('5/5');
  await expect(page.locator('.fact-card')).toContainText(puzzle.fact);
  for (const e of puzzle.events) await expect(page.locator('.answer-list')).toContainText(e.display);
  await expect(page.locator('.countdown')).toHaveText(/Next Timestack in 1[34]:\d\d:\d\d/);
  await expect(page.locator('.reveal-card.revealed')).toHaveCount(5);
  await expect(page.locator('.result-correct').first()).toBeVisible();
  expect(number).toBeGreaterThan(0);
});

test('the board can be reordered by dragging', async ({ page }) => {
  await openGame(page);
  const before = await currentOrder(page);
  const first = cards(page).nth(0);
  const last = cards(page).nth(4);
  const a = (await first.boundingBox())!;
  const b = (await last.boundingBox())!;
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2 + ((b.y - a.y + 10) * i) / 10);
  await page.mouse.up();
  await expect.poll(() => currentOrder(page)).toEqual([...before.slice(1), before[0]]);
});

test('refreshing mid-game keeps the card order', async ({ page }) => {
  await openGame(page);
  const start = await currentOrder(page);
  await page.getByRole('button', { name: /later$/ }).first().click();
  const moved = [start[1], start[0], ...start.slice(2)];
  expect(await currentOrder(page)).toEqual(moved);
  await page.reload();
  await expect(cards(page)).toHaveCount(5);
  expect(await currentOrder(page)).toEqual(moved);
});

test('returning after finishing skips to results and cannot submit again', async ({ page }) => {
  await openGame(page);
  await lockIn(page);
  await finishReveal(page);
  const score = await page.locator('.results-score').textContent();
  await page.reload();
  await expect(page.locator('.results-score')).toHaveText(score!);
  await expect(page.getByRole('button', { name: 'Lock it in' })).toHaveCount(0);
  await expect(page.locator('.reveal-card.revealed')).toHaveCount(5);

  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('timestack:v1')!));
  expect(stored.stats.played).toBe(1);
});

test('share on desktop copies the exact text and shows a toast', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const { number, puzzle, correct } = todaysPuzzle();
  await openGame(page);
  await arrangeWithKeyboard(page, correct);
  await lockIn(page);
  await finishReveal(page);
  await page.evaluate(() => {
    // Desktop Chrome may expose navigator.share; force the clipboard path.
    Object.defineProperty(navigator, 'share', { value: undefined });
  });
  await page.getByRole('button', { name: 'Share' }).click();
  await expect(page.getByRole('status')).toContainText('Copied results to clipboard');
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toBe(`Timestack No. ${number} · 5/5\n\n●─●─●─●─●\n\ntimestack.app`);
  for (const e of puzzle.events) {
    expect(text).not.toContain(e.title);
    expect(text).not.toContain(String(Math.abs(e.year)));
  }
});

test('share on mobile opens the native share sheet @mobile', async ({ page }) => {
  const { number } = todaysPuzzle();
  await openGame(page);
  await page.evaluate(() => {
    const w = window as unknown as { shared: unknown[] };
    w.shared = [];
    Object.defineProperty(navigator, 'canShare', { value: () => true });
    Object.defineProperty(navigator, 'share', { value: async (data: unknown) => void w.shared.push(data) });
  });
  await lockIn(page);
  await finishReveal(page);
  await page.getByRole('button', { name: 'Share' }).click();
  const shared = await page.evaluate(() => (window as unknown as { shared: { text: string }[] }).shared);
  expect(shared).toHaveLength(1);
  expect(shared[0].text).toMatch(new RegExp(`^Timestack No\\. ${number} · [0-5]/5\\n\\n[●◐○](─[●◐○]){4}\\n\\ntimestack\\.app$`, 'u'));
});

test('the puzzle rolls over at local midnight', async ({ page }) => {
  const late = new Date(TEST_NOW.getFullYear(), TEST_NOW.getMonth(), TEST_NOW.getDate(), 23, 59, 50);
  const today = todaysPuzzle(late);
  await openGame(page, { now: late });
  await lockIn(page);
  await finishReveal(page);
  await expect(page.locator('.countdown-time')).toHaveText(/^00:00:0\d$/);
  await page.clock.runFor(10_000);
  await expect(page.locator('.puzzle-meta')).toContainText(`No. ${today.number + 1}`);
  await expect(page.getByRole('button', { name: 'Lock it in' })).toBeVisible();
});

test('streak increments on consecutive days and resets after a missed day', async ({ page }) => {
  const day = (offset: number) => new Date(TEST_NOW.getFullYear(), TEST_NOW.getMonth(), TEST_NOW.getDate() + offset, 10);
  const streakFor = async () => {
    await page.getByRole('button', { name: 'Statistics' }).click();
    const value = await page.locator('.stat-tile', { hasText: 'Current streak' }).locator('dd').textContent();
    await page.getByRole('dialog', { name: 'Statistics' }).getByRole('button', { name: 'Close' }).click();
    return Number(value);
  };

  await openGame(page, { now: day(0) });
  await lockIn(page);
  await finishReveal(page);
  expect(await streakFor()).toBe(1);

  await page.clock.setSystemTime(day(1));
  await page.reload();
  await lockIn(page);
  await finishReveal(page);
  expect(await streakFor()).toBe(2);

  await page.clock.setSystemTime(day(3));
  await page.reload();
  expect(await streakFor()).toBe(0);
  await lockIn(page);
  await finishReveal(page);
  expect(await streakFor()).toBe(1);
});

test('settings toggle dark theme and high contrast', async ({ page }) => {
  await openGame(page);
  await page.getByRole('button', { name: 'Settings' }).click();
  const dialog = page.getByRole('dialog', { name: 'Settings' });
  await dialog.getByRole('radio', { name: 'Dark' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await dialog.getByRole('switch', { name: /High contrast/ }).check();
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'high');
});

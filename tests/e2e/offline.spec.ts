import { expect, test, type Route } from '@playwright/test';
import { cards, lockIn, openGame, servePuzzles, TEST_NOW } from './helpers';

test("today's Puzzle stays playable offline after the first visit", async ({ page, context }) => {
  await page.clock.install({ time: TEST_NOW });
  await servePuzzles(page);
  await page.addInitScript(() => localStorage.setItem('timestack:v1', localStorage.getItem('timestack:v1') ?? JSON.stringify({ seenHelp: true })));
  await page.goto('/');
  await expect(cards(page)).toHaveCount(5);
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.active?.state;
  });
  // Ensure the service worker controls the page and has precached everything.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Timestack' })).toBeVisible();
  await expect(cards(page)).toHaveCount(5);
  await lockIn(page);
  await page.waitForTimeout(2500);
  await expect(page.locator('.results-score')).toBeVisible();
  await expect(page.locator('.fact-card')).toBeVisible();
});

test('offline with nothing cached asks to connect, then loads on retry', async ({ page, context }) => {
  await openGame(page);
  await page.evaluate(() => localStorage.removeItem('timestack:puzzle'));
  // Routes still answer while the context is offline, so fail the API explicitly.
  const disconnected = (route: Route) => route.abort('internetdisconnected');
  await context.route('**/api/puzzle/*', disconnected);
  await context.setOffline(true);
  // A new local day with no cached Puzzle, while still offline.
  await page.clock.setSystemTime(new Date(TEST_NOW.getTime() + 86_400_000));
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(page.getByRole('heading', { name: "Connect to get today's Puzzle" })).toBeVisible();
  await expect(cards(page)).toHaveCount(0);

  // Stats still open while offline.
  await page.getByRole('button', { name: 'Statistics' }).click();
  await expect(page.getByRole('dialog', { name: 'Statistics' })).toBeVisible();
  await page.keyboard.press('Escape');

  // Reachable again (without the browser's online event, which would retry by itself).
  await context.unroute('**/api/puzzle/*', disconnected);
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(cards(page)).toHaveCount(5);
});

test('after the last Puzzle, players are told to come back tomorrow', async ({ page }) => {
  await openGame(page, { now: new Date(2031, 0, 1, 10, 0, 0), expectPuzzle: false });
  await expect(page.getByRole('heading', { name: 'Back tomorrow' })).toBeVisible();
  await expect(page.locator('.countdown')).toBeVisible();
  await expect(cards(page)).toHaveCount(0);
});

test('the API is served by the Worker and refuses future dates', async ({ request }) => {
  const res = await request.get('/api/puzzle/2099-01-01');
  expect(res.status()).toBe(404);
  expect(res.headers()['content-type']).toContain('application/json');
  expect((await request.get('/api/puzzle/not-a-date')).status()).toBe(400);
});

test('manifest is valid for installation', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest).toMatchObject({ name: 'Timestack', short_name: 'Timestack', display: 'standalone', start_url: '/' });
  const sizes = manifest.icons.map((i: { sizes: string; purpose?: string }) => `${i.sizes}${i.purpose ? ':' + i.purpose : ''}`);
  expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512', '512x512:maskable']));
  for (const icon of manifest.icons) expect((await request.get('/' + icon.src)).ok()).toBe(true);
  expect((await request.get('/icons/apple-touch-icon.png')).ok()).toBe(true);
});

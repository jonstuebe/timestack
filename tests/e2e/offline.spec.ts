import { expect, test } from '@playwright/test';
import { cards, lockIn } from './helpers';

test('the game loads and is fully playable offline after the first visit', async ({ page, context }) => {
  await page.addInitScript(() => localStorage.setItem('timestack:v1', localStorage.getItem('timestack:v1') ?? JSON.stringify({ seenHelp: true })));
  await page.goto('/');
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

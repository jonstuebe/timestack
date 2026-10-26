import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { finishReveal, lockIn, openGame } from './helpers';

async function expectNoViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
}

for (const colorScheme of ['light', 'dark'] as const) {
  for (const highContrast of [false, true]) {
    test(`no axe violations while playing and on results (${colorScheme}${highContrast ? ', high contrast' : ''})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      await page.addInitScript((hc) => {
        localStorage.setItem('timestack:v1', JSON.stringify({ seenHelp: true, settings: { theme: 'system', highContrast: hc } }));
      }, highContrast);
      await openGame(page);
      await expectNoViolations(page);
      await lockIn(page);
      await finishReveal(page);
      await expectNoViolations(page);
      await page.getByRole('button', { name: 'Statistics' }).click();
      await expectNoViolations(page);
    });
  }
}

test('no axe violations in the help and settings dialogs', async ({ page }) => {
  await openGame(page, { seenHelp: false });
  await expectNoViolations(page);
  await page.getByRole('button', { name: "Let's play" }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await expectNoViolations(page);
});

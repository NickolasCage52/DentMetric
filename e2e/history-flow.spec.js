/**
 * E2E: History save -> auto navigate -> history contains item
 */
import { test, expect } from '@playwright/test';

async function fillQuickDentAndConditions(page) {
  const lengthInput = page.getByTestId('dent-size-length');
  await lengthInput.waitFor({ state: 'visible', timeout: 5000 });
  await lengthInput.fill('90');
  await page.getByTestId('dent-size-width').fill('90');

  await page.locator('select').filter({ has: page.locator('option[value="R1"]') }).first().selectOption('R1');
  await page.locator('select').filter({ has: page.locator('option[value="RK2"]') }).first().selectOption('RK2');
  await page.locator('select').filter({ has: page.locator('option[value="M1"]') }).first().selectOption('M1');
  await page.locator('select').filter({ has: page.locator('option[value="CLASS_STD"]') }).first().selectOption('CLASS_STD');
  await page.locator('select').filter({ has: page.locator('option[value="Z0"]') }).first().selectOption('Z0');
}

test.describe('History flow', () => {
  test('save to history -> navigate -> history contains item', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-metric').click();
    await page.getByTestId('metric-standard').click();

    const nextBtn = page.getByTestId('btn-go-next');
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
    if (await nextBtn.isEnabled()) await nextBtn.click();

    await page.getByTestId('btn-add-dent').waitFor({ state: 'visible', timeout: 5000 });
    await fillQuickDentAndConditions(page);
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click({ force: true });

    await expect(page.getByTestId('total-price')).toBeVisible({ timeout: 5000 });

    await page.getByTestId('btn-save-estimate').click();

    // saveCurrentEstimate auto-navigates to history section after 400ms
    const historyItems = page.locator('[data-testid^="history-item-"]');
    await expect(historyItems.first()).toBeVisible({ timeout: 8000 });
  });
});

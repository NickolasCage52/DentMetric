/**
 * E2E: Launch app -> Standard mode -> fill minimal fields -> see total
 */
import { test, expect } from '@playwright/test';

async function fillQuickDentAndConditions(page) {
  const lengthInput = page.getByTestId('dent-size-length');
  await lengthInput.waitFor({ state: 'visible', timeout: 5000 });
  await lengthInput.fill('120');
  await page.getByTestId('dent-size-width').fill('300');

  await page.locator('select').filter({ has: page.locator('option[value="R1"]') }).first().selectOption('R1');
  await page.locator('select').filter({ has: page.locator('option[value="RK2"]') }).first().selectOption('RK2');
  await page.locator('select').filter({ has: page.locator('option[value="M1"]') }).first().selectOption('M1');
  await page.locator('select').filter({ has: page.locator('option[value="CLASS_STD"]') }).first().selectOption('CLASS_STD');
  await page.locator('select').filter({ has: page.locator('option[value="Z0"]') }).first().selectOption('Z0');
}

test.describe('Standard flow', () => {
  test('Launch -> switch to Standard -> fill minimal -> see total', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-metric').click();
    await page.getByTestId('metric-standard').click();

    await expect(page.getByTestId('step-dots')).toBeVisible();

    const nextBtn = page.getByTestId('btn-go-next');
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
    }

    await page.getByTestId('btn-add-dent').waitFor({ state: 'visible', timeout: 5000 });
    await fillQuickDentAndConditions(page);
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click({ force: true });

    const totalEl = page.getByTestId('total-price');
    await expect(totalEl).toBeVisible({ timeout: 5000 });
    const totalText = await totalEl.textContent();
    expect(totalText).toMatch(/\d[\d\s]*/);
  });
});

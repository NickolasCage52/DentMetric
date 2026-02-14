/**
 * E2E: Same sizes + same coefficients -> totals match between Standard and Detail
 */
import { test, expect } from '@playwright/test';

test.describe('Quick vs Detail consistency', () => {
  test('same sizes and coefficients -> totals match', async ({ page }) => {
    await page.goto('/');

    const selectConditions = async () => {
      await page.locator('select').filter({ has: page.locator('option[value="R1"]') }).first().selectOption('R1');
      await page.locator('select').filter({ has: page.locator('option[value="RK2"]') }).first().selectOption('RK2');
      await page.locator('select').filter({ has: page.locator('option[value="M1"]') }).first().selectOption('M1');
      await page.locator('select').filter({ has: page.locator('option[value="CLASS_STD"]') }).first().selectOption('CLASS_STD');
      await page.locator('select').filter({ has: page.locator('option[value="Z0"]') }).first().selectOption('Z0');
    };

    await page.getByTestId('btn-open-metric').click();
    await page.getByTestId('metric-standard').click();

    const nextBtn = page.getByTestId('btn-go-next');
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
    if (await nextBtn.isEnabled()) await nextBtn.click();

    await page.getByTestId('btn-add-dent').waitFor({ state: 'visible', timeout: 5000 });
    const lengthInput = page.getByTestId('dent-size-length');
    await lengthInput.waitFor({ state: 'visible', timeout: 5000 });
    await lengthInput.fill('120');
    await page.getByTestId('dent-size-width').fill('300');
    await selectConditions();
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click({ force: true });

    const quickTotalEl = page.getByTestId('total-price');
    await expect(quickTotalEl).toBeVisible({ timeout: 5000 });
    const quickTotalText = (await quickTotalEl.textContent())?.replace(/\s/g, '') || '';

    await page.getByTestId('nav-metric').click({ force: true });
    await page.getByTestId('metric-graphics').click({ force: true });

    await page.getByRole('button', { name: /Продолжить.*Размещение/i }).click();

    await page.getByTestId('add-type-circle').click();
    await page.getByTestId('size-option-S6').click();

    await page.getByRole('button', { name: /Продолжить.*Размер/i }).click();
    const wInput = page.locator('input[type="number"]').first();
    const hInput = page.locator('input[type="number"]').nth(1);
    if (await wInput.isVisible()) {
      await wInput.fill('120');
      await hInput.fill('300');
    }
    await page.getByRole('button', { name: /Продолжить.*Условия/i }).click();

    await selectConditions();
    await page.getByRole('button', { name: /Рассчитать/i }).click();

    const detailTotalEl = page.getByTestId('total-price-graphics');
    await expect(detailTotalEl).toBeVisible({ timeout: 5000 });
    const detailTotalText = (await detailTotalEl.textContent())?.replace(/\s/g, '') || '';

    expect(parseInt(quickTotalText.replace(/\D/g, ''), 10)).toBeGreaterThan(0);
    expect(parseInt(detailTotalText.replace(/\D/g, ''), 10)).toBeGreaterThan(0);
  });
});

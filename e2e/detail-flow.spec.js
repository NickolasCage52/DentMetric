/**
 * E2E: Launch -> Detail mode -> add oval dent -> set sizes -> choose coefficients -> see total
 */
import { test, expect } from '@playwright/test';

test.describe('Detail flow', () => {
  test('Launch -> go Detail -> add oval dent -> set sizes -> choose coefficients -> see total', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-metric').click();
    await page.getByTestId('metric-graphics').click();

    await page.getByRole('button', { name: /Продолжить.*Размещение/i }).click();

    await page.getByTestId('add-type-circle').click();
    await page.getByTestId('size-option-S6').click();

    await page.getByRole('button', { name: /Продолжить.*Размер/i }).click();

    await page.getByRole('button', { name: /Продолжить.*Условия/i }).click();

    await page.locator('select').filter({ has: page.locator('option[value="R1"]') }).first().selectOption('R1');
    await page.locator('select').filter({ has: page.locator('option[value="RK2"]') }).first().selectOption('RK2');
    await page.locator('select').filter({ has: page.locator('option[value="M1"]') }).first().selectOption('M1');
    await page.locator('select').filter({ has: page.locator('option[value="CLASS_STD"]') }).first().selectOption('CLASS_STD');
    await page.locator('select').filter({ has: page.locator('option[value="Z0"]') }).first().selectOption('Z0');

    await page.getByRole('button', { name: /Рассчитать/i }).click();

    const totalEl = page.getByTestId('total-price-graphics');
    await expect(totalEl).toBeVisible({ timeout: 5000 });
    const totalText = await totalEl.textContent();
    expect(totalText).toMatch(/\d[\d\s]*/);
  });
});

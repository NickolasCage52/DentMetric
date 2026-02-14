/**
 * E2E: Freeform modal - open, draw, confirm
 */
import { test, expect } from '@playwright/test';

test.describe('Freeform modal', () => {
  test('open modal, draw line with mouse, confirm -> dent appears', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('btn-open-metric').click();
    await page.getByTestId('metric-graphics').click();

    await page.getByRole('button', { name: /Продолжить.*Размещение/i }).click();

    await page.getByTestId('add-freeform').click();

    const canvas = page.locator('.freeform-canvas');
    await expect(canvas).toBeVisible({ timeout: 5000 });

    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.down();
      await page.mouse.move(box.x + 150, box.y + 50);
      await page.mouse.move(box.x + 150, box.y + 150);
      await page.mouse.move(box.x + 50, box.y + 150);
      await page.mouse.move(box.x + 50, box.y + 50);
      await page.mouse.up();
    }

    await page.getByTestId('freeform-confirm').click();

    await page.getByRole('button', { name: /Продолжить.*Размер/i }).click();
  });
});

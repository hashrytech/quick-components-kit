import { test, expect } from '@playwright/test';

test.describe('Modal', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('is not visible on page load', async ({ page }) => {
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();
	});

	test('opens when trigger is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
	});

	test('has correct ARIA attributes when open', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		const dialog = page.getByRole('dialog', { name: 'Modal' });
		await expect(dialog).toHaveAttribute('aria-modal', 'true');
		await expect(dialog).toHaveAttribute('role', 'dialog');
	});

	test('closes when the close button is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
		await page.getByRole('button', { name: 'Close Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();
	});

	test('closes when the Escape key is pressed', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();
	});

	test('closes when the overlay is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
		await page.mouse.click(5, 5);
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();
	});

	test('focus moves inside the modal when it opens', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('button', { name: 'Close Modal' })).toBeFocused();
	});

	test('Tab key stays within the modal', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		const close = page.getByRole('button', { name: 'Close Modal' });
		const test = page.getByRole('button', { name: 'Test Modal' });
		const done = page.getByRole('button', { name: 'Done' }).last();
		await expect(close).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(test).toBeFocused();
		await page.keyboard.press('Tab');
		await expect(done).toBeFocused();
	});

	test('restores the page position and trigger focus when it closes', async ({ page }) => {
		const trigger = page.getByRole('button', { name: 'Show Modal' });
		await trigger.scrollIntoViewIfNeeded();
		const before = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));

		await trigger.click();
		const close = page.getByRole('button', { name: 'Close Modal' });
		await expect(close).toBeFocused();
		await close.click();

		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();
		await expect(trigger).toBeFocused();
		await expect
			.poll(() => page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })))
			.toEqual(before);
	});

	test('reopens after being closed', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();

		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
	});
});

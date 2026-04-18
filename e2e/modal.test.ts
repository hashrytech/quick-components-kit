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
		const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
		const focusedInModal = await page.evaluate(() =>
			document.querySelector('[role="dialog"]')?.contains(document.activeElement)
		);
		expect(focusedInModal).toBe(true);
		expect(focusedTag).toBe('button');
	});

	test('Tab key stays within the modal', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		const focusedInModal = await page.evaluate(() =>
			document.querySelector('[role="dialog"]')?.contains(document.activeElement)
		);
		expect(focusedInModal).toBe(true);
	});

	test('reopens after being closed', async ({ page }) => {
		await page.getByRole('button', { name: 'Show Modal' }).click();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('dialog', { name: 'Modal' })).not.toBeVisible();

		await page.getByRole('button', { name: 'Show Modal' }).click();
		await expect(page.getByRole('dialog', { name: 'Modal' })).toBeVisible();
	});
});

import { test, expect } from '@playwright/test';

test.describe('Drawer — left position', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('is not visible on page load', async ({ page }) => {
		await expect(page.getByRole('dialog', { name: 'Drawer' })).not.toBeVisible();
	});

	test('opens when hamburger is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		await expect(page.getByRole('dialog', { name: 'Drawer' }).first()).toBeVisible();
	});

	test('has correct ARIA attributes when open', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		await expect(dialog).toHaveAttribute('aria-modal', 'true');
		await expect(dialog).toHaveAttribute('role', 'dialog');
	});

	test('closes when the close button is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		await expect(dialog).toBeVisible();
		await page.getByRole('button', { name: 'Close Drawer' }).click();
		await expect(dialog).not.toBeVisible();
	});

	test('closes when the Escape key is pressed', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		await expect(dialog).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();
	});

	test('closes when the overlay is clicked', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		await expect(dialog).toBeVisible();
		const viewport = page.viewportSize()!;
		await page.mouse.click(viewport.width - 10, viewport.height / 2);
		await expect(dialog).not.toBeVisible();
	});

	test('focus moves inside the drawer when it opens', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const focusedInDrawer = await page.evaluate(() => {
			const dialogs = document.querySelectorAll('[role="dialog"]');
			return Array.from(dialogs).some((d) => d.contains(document.activeElement));
		});
		expect(focusedInDrawer).toBe(true);
	});

	test('Tab key stays within the drawer', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		await page.keyboard.press('Tab');
		await page.keyboard.press('Tab');
		const focusedInDrawer = await page.evaluate(() => {
			const dialogs = document.querySelectorAll('[role="dialog"]');
			return Array.from(dialogs).some((d) => d.contains(document.activeElement));
		});
		expect(focusedInDrawer).toBe(true);
	});

	test('left drawer is positioned on the left edge', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		const box = await dialog.boundingBox();
		expect(box?.x).toBe(0);
	});

	test('reopens after being closed', async ({ page }) => {
		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		const dialog = page.getByRole('dialog', { name: 'Drawer' }).first();
		await page.keyboard.press('Escape');
		await expect(dialog).not.toBeVisible();

		await page.getByRole('button', { name: 'Toggle Horizontal Menu' }).click();
		await expect(page.getByRole('dialog', { name: 'Drawer' }).first()).toBeVisible();
	});
});

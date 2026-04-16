import { test, expect } from '@playwright/test';

test.describe('drag-drop zone — pointer drag golden path', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/drag-drop-demo');
    });

    test('page loads with four items in order', async ({ page }) => {
        const items = page.locator('[data-testid="item"]');
        await expect(items).toHaveCount(4);
        await expect(items.nth(0)).toContainText('Item One');
        await expect(items.nth(3)).toContainText('Item Four');
    });

    test('drags first item below second item', async ({ page }) => {
        const items = page.locator('[data-testid="item"]');

        const source = items.nth(0);
        const target = items.nth(1);

        const sourceBox = await source.boundingBox();
        const targetBox = await target.boundingBox();
        expect(sourceBox).not.toBeNull();
        expect(targetBox).not.toBeNull();

        const handle = source.locator('[data-dnd-handle]');
        const handleBox = await handle.boundingBox();
        expect(handleBox).not.toBeNull();

        // Drag the handle from first item to below second item
        await page.mouse.move(handleBox!.x + handleBox!.width / 2, handleBox!.y + handleBox!.height / 2);
        await page.mouse.down();
        // Move slowly to cross the drag threshold
        await page.mouse.move(handleBox!.x + handleBox!.width / 2, targetBox!.y + targetBox!.height * 0.75, { steps: 10 });
        await page.mouse.up();

        // After drop: Item Two should now be first, Item One second
        await expect(items.nth(0)).toContainText('Item Two');
        await expect(items.nth(1)).toContainText('Item One');
    });

    test('cancels drag when Escape is pressed during keyboard drag', async ({ page }) => {
        const items = page.locator('[data-testid="item"]');

        // Focus the first item and start keyboard drag
        await items.nth(0).focus();
        await page.keyboard.press('Space');

        // Move down once
        await page.keyboard.press('ArrowDown');

        // Cancel
        await page.keyboard.press('Escape');

        // Order should be restored
        await expect(items.nth(0)).toContainText('Item One');
        await expect(items.nth(1)).toContainText('Item Two');
    });

    test('reorders via keyboard drag — Space to pick up, ArrowDown, Space to drop', async ({ page }) => {
        const items = page.locator('[data-testid="item"]');

        await items.nth(0).focus();
        await page.keyboard.press('Space'); // pick up Item One
        await page.keyboard.press('ArrowDown'); // move to index 1
        await page.keyboard.press('Space'); // drop

        await expect(items.nth(0)).toContainText('Item Two');
        await expect(items.nth(1)).toContainText('Item One');
    });

    test('data-dnd-active is set on zone during drag and cleared after drop', async ({ page }) => {
        const zone = page.locator('[data-testid="zone"]');
        const items = page.locator('[data-testid="item"]');

        const handle = items.nth(0).locator('[data-dnd-handle]');
        const handleBox = await handle.boundingBox();
        const zoneBox = await zone.boundingBox();
        expect(handleBox).not.toBeNull();
        expect(zoneBox).not.toBeNull();

        await page.mouse.move(handleBox!.x + 5, handleBox!.y + 5);
        await page.mouse.down();
        await page.mouse.move(handleBox!.x + 5, handleBox!.y + 20, { steps: 5 });

        // During drag the zone should have data-dnd-active
        await expect(zone).toHaveAttribute('data-dnd-active', 'true');

        await page.mouse.up();

        // After drop it should be cleared
        await expect(zone).not.toHaveAttribute('data-dnd-active');
    });
});

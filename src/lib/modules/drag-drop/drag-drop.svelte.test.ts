import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { dragDropZone, itemId } from './index.js';

// ─── jsdom stubs ──────────────────────────────────────────────────────────────

// jsdom doesn't implement ResizeObserver or requestAnimationFrame animation loop
global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
};

// ─── helpers ──────────────────────────────────────────────────────────────────

type Item = { id: string; label: string };

function makeItem(id: string): Item {
    return { id, label: `Item ${id}` };
}

function makeZone(items: Item[], extraOptions: Partial<Parameters<typeof dragDropZone<Item>>[1]> = {}) {
    const node = document.createElement('ul');
    document.body.appendChild(node);

    for (const item of items) {
        const li = document.createElement('li');
        const handle = document.createElement('button');
        handle.dataset.dndHandle = 'true';
        li.appendChild(handle);
        node.appendChild(li);
    }

    const options = { items, getItemId: itemId<Item>('id'), ...extraOptions };
    const action = dragDropZone<Item>(node, options);
    return { node, action, options };
}

function pointerDown(target: Element, x = 50, y = 50, pointerId = 1) {
    const handle = target.querySelector('[data-dnd-handle]') ?? target;
    handle.dispatchEvent(
        new PointerEvent('pointerdown', {
            bubbles: true,
            isPrimary: true,
            button: 0,
            clientX: x,
            clientY: y,
            pointerId,
            pointerType: 'mouse'
        })
    );
}

function pointerMove(x: number, y: number, pointerId = 1) {
    document.dispatchEvent(
        new PointerEvent('pointermove', {
            bubbles: true,
            isPrimary: true,
            clientX: x,
            clientY: y,
            pointerId,
            pointerType: 'mouse',
            cancelable: true
        })
    );
}

function pointerUp(x: number, y: number, pointerId = 1) {
    document.dispatchEvent(
        new PointerEvent('pointerup', {
            bubbles: true,
            isPrimary: true,
            clientX: x,
            clientY: y,
            pointerId,
            pointerType: 'mouse'
        })
    );
}

function collectEvents(node: HTMLElement) {
    const events: Array<{ name: string; detail: unknown }> = [];
    node.addEventListener('consider', (e) => events.push({ name: 'consider', detail: (e as CustomEvent).detail }));
    node.addEventListener('finalize', (e) => events.push({ name: 'finalize', detail: (e as CustomEvent).detail }));
    return events;
}

// ─── syncChildren ─────────────────────────────────────────────────────────────

describe('syncChildren', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('sets data-dnd-item and data-dnd-index on each child', () => {
        const items = [makeItem('a'), makeItem('b'), makeItem('c')];
        const { node, action } = makeZone(items);

        const children = Array.from(node.children) as HTMLElement[];
        expect(children[0]!.dataset.dndItem).toBe('true');
        expect(children[0]!.dataset.dndIndex).toBe('0');
        expect(children[1]!.dataset.dndIndex).toBe('1');
        expect(children[2]!.dataset.dndIndex).toBe('2');

        action.destroy();
    });

    it('applies role=list to zone and role=listitem to each child', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);

        expect(node.getAttribute('role')).toBe('list');
        const children = Array.from(node.children) as HTMLElement[];
        for (const child of children) {
            expect(child.getAttribute('role')).toBe('listitem');
        }

        action.destroy();
    });

    it('skips ARIA roles when disableAria is true', () => {
        const items = [makeItem('a')];
        const { node, action } = makeZone(items, { disableAria: true });

        expect(node.getAttribute('role')).toBeNull();
        const child = node.firstElementChild as HTMLElement;
        expect(child.getAttribute('role')).toBeNull();

        action.destroy();
    });

    it('filters children by itemSelector', () => {
        const node = document.createElement('ul');
        document.body.appendChild(node);

        // header + two items
        const header = document.createElement('li');
        header.className = 'header';
        const item1 = document.createElement('li');
        item1.className = 'item';
        const handle1 = document.createElement('button');
        handle1.dataset.dndHandle = 'true';
        item1.appendChild(handle1);
        const item2 = document.createElement('li');
        item2.className = 'item';
        const handle2 = document.createElement('button');
        handle2.dataset.dndHandle = 'true';
        item2.appendChild(handle2);
        node.append(header, item1, item2);

        const items = [makeItem('x'), makeItem('y')];
        const action = dragDropZone<Item>(node, { items, getItemId: itemId('id'), itemSelector: '.item' });

        expect(header.dataset.dndItem).toBeUndefined();
        expect(item1.dataset.dndIndex).toBe('0');
        expect(item2.dataset.dndIndex).toBe('1');

        action.destroy();
        document.body.innerHTML = '';
    });

    it('marks canDrag=false items with data-dnd-disabled', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items, {
            canDrag: (_item, index) => index !== 0
        });

        const children = Array.from(node.children) as HTMLElement[];
        expect(children[0]!.dataset.dndDisabled).toBe('true');
        expect(children[1]!.dataset.dndDisabled).toBe('');

        action.destroy();
    });
});

// ─── itemId helper ────────────────────────────────────────────────────────────

describe('itemId', () => {
    it('returns a function that extracts the key as a string', () => {
        const fn = itemId<Item>('id');
        expect(fn({ id: 'abc', label: 'x' })).toBe('abc');
    });

    it('coerces non-string values to string', () => {
        const fn = itemId<{ n: number }>('n');
        expect(fn({ n: 42 })).toBe('42');
    });
});

// ─── update() during active drag (freeze-and-ignore) ─────────────────────────

describe('update() freeze-and-ignore', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('does not apply new items during an active drag', () => {
        const items = [makeItem('a'), makeItem('b'), makeItem('c')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        // Start a drag (threshold=0 to skip movement)
        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 20); // exceeds default threshold of 4px

        // Send update with completely different items mid-drag
        const newItems = [makeItem('x'), makeItem('y')];
        action.update!({ items: newItems, getItemId: itemId('id') });

        // The consider event should still contain original items, not newItems
        const considerEvents = events.filter((e) => e.name === 'consider');
        const lastItems = (considerEvents.at(-1)?.detail as { items: Item[] })?.items ?? [];
        expect(lastItems.some((i) => i.id === 'a' || i.id === 'b' || i.id === 'c')).toBe(true);
        expect(lastItems.some((i) => i.id === 'x')).toBe(false);

        pointerUp(50, 20);
        action.destroy();
    });

    it('applies pending options after drag ends', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 20);

        const newItems = [makeItem('x'), makeItem('y'), makeItem('z')];
        action.update!({ items: newItems, getItemId: itemId('id') });

        // Still in drag — children count reflects original
        expect(node.children.length).toBe(2);

        pointerUp(50, 20);

        // After drop, pending options applied — but DOM is controlled by consumer
        // The action's internal items should now be newItems; verify via next update event
        action.update!({ items: newItems, getItemId: itemId('id') });
        const children = Array.from(node.children) as HTMLElement[];
        expect(children.length).toBe(2); // DOM children don't auto-add; indices updated
        expect(children[0]!.dataset.dndIndex).toBe('0');

        action.destroy();
    });
});

// ─── drop outside — restore ───────────────────────────────────────────────────

describe('drop outside (restore)', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('fires consider/droppedOutsideOfAny with original items', () => {
        const items = [makeItem('a'), makeItem('b'), makeItem('c')];
        const { node, action } = makeZone(items, { dropOutsideBehavior: 'restore' });
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30); // start drag

        // Drop far outside the zone bounds
        pointerUp(9999, 9999);

        const outside = events.find(
            (e) => e.name === 'consider' && (e.detail as { info: { trigger: string } }).info.trigger === 'droppedOutsideOfAny'
        );
        expect(outside).toBeDefined();
        const detail = outside!.detail as { items: Item[] };
        expect(detail.items.map((i) => i.id)).toEqual(['a', 'b', 'c']);

        action.destroy();
    });
});

// ─── drop outside — remove ────────────────────────────────────────────────────

describe('drop outside (remove)', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('fires finalize/droppedOutsideOfAny with item removed', () => {
        const items = [makeItem('a'), makeItem('b'), makeItem('c')];
        const { node, action } = makeZone(items, { dropOutsideBehavior: 'remove' });
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(9999, 9999);

        const finalize = events.find(
            (e) => e.name === 'finalize' && (e.detail as { info: { trigger: string } }).info.trigger === 'droppedOutsideOfAny'
        );
        expect(finalize).toBeDefined();
        const detail = finalize!.detail as { items: Item[] };
        expect(detail.items.map((i) => i.id)).not.toContain('a');
        expect(detail.items.map((i) => i.id)).toEqual(['b', 'c']);

        action.destroy();
    });
});

// ─── drag start fires consider/dragStarted ────────────────────────────────────

describe('drag start event', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('fires consider/dragStarted once drag threshold is crossed', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 20); // 10px > default threshold of 4

        const started = events.find(
            (e) => e.name === 'consider' && (e.detail as { info: { trigger: string } }).info.trigger === 'dragStarted'
        );
        expect(started).toBeDefined();

        pointerUp(50, 20);
        action.destroy();
    });

    it('does not fire if movement is below threshold', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 12); // 2px < threshold of 4

        const started = events.find((e) => (e.detail as { info: { trigger: string } }).info?.trigger === 'dragStarted');
        expect(started).toBeUndefined();

        pointerUp(50, 12);
        action.destroy();
    });
});

// ─── canDrag prevents pickup ──────────────────────────────────────────────────

describe('canDrag', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('prevents drag start when canDrag returns false', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items, { canDrag: () => false });
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);

        expect(events.length).toBe(0);

        pointerUp(50, 30);
        action.destroy();
    });

    it('allows drag for items where canDrag returns true', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items, { canDrag: (_item, i) => i === 1 });
        const events = collectEvents(node);

        // Try dragging index 1 (allowed)
        pointerDown(node.children[1]!, 50, 60);
        pointerMove(50, 80);

        const started = events.find((e) => (e.detail as { info: { trigger: string } }).info?.trigger === 'dragStarted');
        expect(started).toBeDefined();

        pointerUp(50, 80);
        action.destroy();
    });
});

// ─── finalize on drop inside zone ────────────────────────────────────────────

describe('finalize on drop inside zone', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('fires finalize/droppedIntoZone when released inside zone', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        // Mock getBoundingClientRect so the zone appears to cover the drop point
        vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
            top: 0, bottom: 200, left: 0, right: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => ({})
        } as DOMRect);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(50, 100); // inside mocked zone rect

        const fin = events.find(
            (e) => e.name === 'finalize' && (e.detail as { info: { trigger: string } }).info.trigger === 'droppedIntoZone'
        );
        expect(fin).toBeDefined();

        action.destroy();
        vi.restoreAllMocks();
    });
});

// ─── lifecycle hooks ──────────────────────────────────────────────────────────

describe('lifecycle hooks', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('calls onDragStart when drag begins', () => {
        const items = [makeItem('a'), makeItem('b')];
        const onDragStart = vi.fn();
        const { node, action } = makeZone(items, { onDragStart });

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);

        expect(onDragStart).toHaveBeenCalledOnce();
        expect(onDragStart).toHaveBeenCalledWith({ item: items[0], index: 0 });

        pointerUp(50, 30);
        action.destroy();
    });

    it('calls onCancel when drop outside with restore behavior', () => {
        const items = [makeItem('a'), makeItem('b')];
        const onCancel = vi.fn();
        const { node, action } = makeZone(items, { onCancel, dropOutsideBehavior: 'restore' });

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(9999, 9999);

        expect(onCancel).toHaveBeenCalledOnce();

        action.destroy();
    });

    it('calls onDrop when dropped inside zone', () => {
        const items = [makeItem('a'), makeItem('b')];
        const onDrop = vi.fn();
        const { node, action } = makeZone(items, { onDrop });

        vi.spyOn(node, 'getBoundingClientRect').mockReturnValue({
            top: 0, bottom: 200, left: 0, right: 200, width: 200, height: 200, x: 0, y: 0, toJSON: () => ({})
        } as DOMRect);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(50, 100);

        expect(onDrop).toHaveBeenCalledOnce();
        expect(onDrop.mock.calls[0]![0].trigger).toBe('droppedIntoZone');

        action.destroy();
        vi.restoreAllMocks();
    });
});

// ─── destroy cleans up ────────────────────────────────────────────────────────

describe('destroy', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('removes event listener so no events fire after destroy', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        action.destroy();

        // Attempt drag after destroy
        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(50, 30);

        expect(events.length).toBe(0);
    });

    it('removes injected cursor style when last zone is destroyed', () => {
        const items = [makeItem('a')];
        const { action: a1 } = makeZone(items);
        const { action: a2 } = makeZone(items);

        a1.destroy();
        expect(document.getElementById('dnd-cursor-style')).not.toBeNull();

        a2.destroy();
        expect(document.getElementById('dnd-cursor-style')).toBeNull();
    });
});

// ─── keyboard drag ────────────────────────────────────────────────────────────

describe('keyboard drag', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    function keyDown(target: Element, key: string) {
        target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key, cancelable: true }));
    }

    it('starts drag on Space and fires dragStarted', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        const firstItem = node.children[0] as HTMLElement;
        firstItem.focus();
        keyDown(firstItem, ' ');

        const started = events.find((e) => (e.detail as { info: { trigger: string } }).info?.trigger === 'dragStarted');
        expect(started).toBeDefined();
        expect((started!.detail as { info: { source: string } }).info.source).toBe('keyboard');

        // Cancel to clean up
        keyDown(firstItem, 'Escape');
        action.destroy();
    });

    it('fires droppedOutsideOfAny on Escape', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        const firstItem = node.children[0] as HTMLElement;
        firstItem.focus();
        keyDown(firstItem, ' ');
        keyDown(firstItem, 'Escape');

        const cancelled = events.find(
            (e) => e.name === 'consider' && (e.detail as { info: { trigger: string } }).info.trigger === 'droppedOutsideOfAny'
        );
        expect(cancelled).toBeDefined();

        action.destroy();
    });

    it('moves item down on ArrowDown and fires consider/draggedOverIndex', () => {
        const items = [makeItem('a'), makeItem('b'), makeItem('c')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        const firstItem = node.children[0] as HTMLElement;
        firstItem.focus();
        keyDown(firstItem, ' ');
        keyDown(firstItem, 'ArrowDown');

        const moved = events.find(
            (e) => e.name === 'consider' && (e.detail as { info: { trigger: string } }).info.trigger === 'draggedOverIndex'
        );
        expect(moved).toBeDefined();

        keyDown(firstItem, 'Escape');
        action.destroy();
    });

    it('drops on Space and fires finalize/droppedIntoZone', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items);
        const events = collectEvents(node);

        const firstItem = node.children[0] as HTMLElement;
        firstItem.focus();
        keyDown(firstItem, ' '); // pick up
        keyDown(firstItem, ' '); // drop

        const fin = events.find(
            (e) => e.name === 'finalize' && (e.detail as { info: { trigger: string } }).info.trigger === 'droppedIntoZone'
        );
        expect(fin).toBeDefined();

        action.destroy();
    });

    it('does not start keyboard drag when canDrag returns false', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items, { canDrag: () => false });
        const events = collectEvents(node);

        const firstItem = node.children[0] as HTMLElement;
        firstItem.focus();
        keyDown(firstItem, ' ');

        expect(events.length).toBe(0);

        action.destroy();
    });
});

// ─── DragDropEvent info shape ─────────────────────────────────────────────────

describe('DragDropEvent info', () => {
    afterEach(() => { document.body.innerHTML = ''; });

    it('includes zoneId, source, trigger, and id in every event', () => {
        const items = [makeItem('a'), makeItem('b')];
        const { node, action } = makeZone(items, { zoneId: 'test-zone' });
        const events = collectEvents(node);

        pointerDown(node.children[0]!, 50, 10);
        pointerMove(50, 30);
        pointerUp(9999, 9999);

        for (const ev of events) {
            const info = (ev.detail as { info: Record<string, unknown> }).info;
            expect(info).toHaveProperty('zoneId');
            expect(info).toHaveProperty('source');
            expect(info).toHaveProperty('trigger');
            expect(info).toHaveProperty('id');
        }

        const startEvent = events.find((e) => (e.detail as { info: { trigger: string } }).info.trigger === 'dragStarted');
        expect((startEvent!.detail as { info: { zoneId: string } }).info.zoneId).toBe('test-zone');

        action.destroy();
    });
});

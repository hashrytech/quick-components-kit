import { describe, it, expect } from 'vitest';
import { reorder, getInsertionIndex, computeNormalizedIndex } from './reorder.js';

// ─── reorder ─────────────────────────────────────────────────────────────────

describe('reorder', () => {
    it('moves an item downward', () => {
        expect(reorder(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
    });

    it('moves an item upward', () => {
        expect(reorder(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
    });

    it('is a no-op when from === to', () => {
        const arr = ['a', 'b', 'c'];
        expect(reorder(arr, 1, 1)).toEqual(['a', 'b', 'c']);
    });

    it('does not mutate the input array', () => {
        const arr = ['a', 'b', 'c'];
        reorder(arr, 0, 2);
        expect(arr).toEqual(['a', 'b', 'c']);
    });

    it('handles single-element array', () => {
        expect(reorder(['a'], 0, 0)).toEqual(['a']);
    });

    it('handles out-of-bounds from gracefully', () => {
        // splice with out-of-range from returns empty removed; array stays intact
        const result = reorder(['a', 'b', 'c'], 5, 0);
        expect(result).toEqual(['a', 'b', 'c']);
    });

    it('moves last item to front', () => {
        expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
    });

    it('moves first item to last', () => {
        expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a']);
    });
});

// ─── computeNormalizedIndex ───────────────────────────────────────────────────

describe('computeNormalizedIndex', () => {
    it('subtracts 1 when insertion is after dragged item', () => {
        // draggedIndex=1, insertionIndex=3 → target slot 2
        expect(computeNormalizedIndex(3, 1)).toBe(2);
    });

    it('returns as-is when insertion is before dragged item', () => {
        // draggedIndex=3, insertionIndex=1 → target slot 1
        expect(computeNormalizedIndex(1, 3)).toBe(1);
    });

    it('returns as-is when insertion equals dragged index (no move)', () => {
        expect(computeNormalizedIndex(2, 2)).toBe(2);
    });
});

// ─── getInsertionIndex ────────────────────────────────────────────────────────

function makeRect(top: number, height: number): DOMRect {
    return {
        top,
        bottom: top + height,
        left: 0,
        right: 100,
        height,
        width: 100,
        x: 0,
        y: top,
        toJSON: () => ({})
    } as DOMRect;
}

function makeChildren(rects: DOMRect[]): { children: HTMLElement[]; rectMap: Map<HTMLElement, DOMRect> } {
    // Use plain objects as map keys — avoids needing a DOM environment in node tests
    const children = rects.map(() => ({} as HTMLElement));
    const rectMap = new Map(children.map((el, i) => [el, rects[i]!]));
    return { children, rectMap };
}

describe('getInsertionIndex (axis: y)', () => {
    // Items at y=0..50, 50..100, 100..150
    const rects = [makeRect(0, 50), makeRect(50, 50), makeRect(100, 50)];

    it('inserts before first item when comparison is above its midpoint', () => {
        const { children, rectMap } = makeChildren(rects);
        // midpoint of first = 25; comparison at 10 → before index 0
        expect(getInsertionIndex(children, rectMap, -1, 0, 10, 'y', 0.5)).toBe(0);
    });

    it('inserts between items when comparison is above second midpoint', () => {
        const { children, rectMap } = makeChildren(rects);
        // midpoint of second = 75; comparison at 60 → before index 1
        expect(getInsertionIndex(children, rectMap, -1, 0, 60, 'y', 0.5)).toBe(1);
    });

    it('inserts at end when comparison is below all midpoints', () => {
        const { children, rectMap } = makeChildren(rects);
        expect(getInsertionIndex(children, rectMap, -1, 0, 140, 'y', 0.5)).toBe(3);
    });

    it('skips the dragged index', () => {
        const { children, rectMap } = makeChildren(rects);
        // draggedIndex=0; comparison at 10 would normally return 0 but it's skipped → next is 1 (midpoint 75), not hit at y=10 → continues → returns 1
        expect(getInsertionIndex(children, rectMap, 0, 0, 10, 'y', 0.5)).toBe(1);
    });

    it('respects custom swapThreshold', () => {
        const { children, rectMap } = makeChildren(rects);
        // threshold 0.25 → first item swaps at y < 12.5; comparison at 20 → past threshold → not before index 0
        expect(getInsertionIndex(children, rectMap, -1, 0, 20, 'y', 0.25)).toBe(1);
    });
});

describe('getInsertionIndex (axis: x)', () => {
    function makeXRect(left: number, width: number): DOMRect {
        return { top: 0, bottom: 50, left, right: left + width, height: 50, width, x: left, y: 0, toJSON: () => ({}) } as DOMRect;
    }

    const rects = [makeXRect(0, 100), makeXRect(100, 100), makeXRect(200, 100)];

    it('inserts before first when comparison is left of midpoint', () => {
        const { children, rectMap } = makeChildren(rects);
        expect(getInsertionIndex(children, rectMap, -1, 30, 0, 'x', 0.5)).toBe(0);
    });

    it('inserts at end when comparison is right of all midpoints', () => {
        const { children, rectMap } = makeChildren(rects);
        expect(getInsertionIndex(children, rectMap, -1, 280, 0, 'x', 0.5)).toBe(3);
    });
});

describe('getInsertionIndex (axis: both)', () => {
    // 2×2 grid
    const rects = [
        makeRect(0, 100),   // center (50, 50)
        makeRect(100, 100), // center (50, 150)
    ];

    it('returns index of nearest item by 2D distance', () => {
        const { children, rectMap } = makeChildren(rects);
        // Comparison at (50, 40) — closer to item 0 centre (50,50) than item 1 (50,150)
        expect(getInsertionIndex(children, rectMap, -1, 50, 40, 'both', 0.5)).toBe(0);
    });

    it('returns index of nearest item when closer to second', () => {
        const { children, rectMap } = makeChildren(rects);
        expect(getInsertionIndex(children, rectMap, -1, 50, 140, 'both', 0.5)).toBe(1);
    });

    it('skips dragged index in 2D search', () => {
        const { children, rectMap } = makeChildren(rects);
        // draggedIndex=0 is skipped; only item 1 is a candidate
        expect(getInsertionIndex(children, rectMap, 0, 50, 40, 'both', 0.5)).toBe(1);
    });
});

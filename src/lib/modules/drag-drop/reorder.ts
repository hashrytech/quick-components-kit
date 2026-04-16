export function reorder<T>(items: T[], from: number, to: number): T[] {
    const result = [...items];
    const [moved] = result.splice(from, 1);
    if (moved === undefined) return result;
    result.splice(to, 0, moved);
    return result;
}

export function getInsertionIndex(
    children: HTMLElement[],
    rects: Map<HTMLElement, DOMRect>,
    draggedIndex: number,
    comparisonX: number,
    comparisonY: number,
    axis: 'x' | 'y' | 'both',
    swapThreshold: number
): number {
    if (axis === 'both') {
        let closestIndex = children.length;
        let closestDist = Infinity;
        for (const [i, child] of children.entries()) {
            if (i === draggedIndex) continue;
            const rect = rects.get(child);
            if (!rect) continue;
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.hypot(comparisonX - cx, comparisonY - cy);
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = i;
            }
        }
        return closestIndex;
    }

    for (const [i, child] of children.entries()) {
        if (i === draggedIndex) continue;
        const rect = rects.get(child);
        if (!rect) continue;
        if (axis === 'y' && comparisonY < rect.top + rect.height * swapThreshold) return i;
        if (axis === 'x' && comparisonX < rect.left + rect.width * swapThreshold) return i;
    }
    return children.length;
}

export function computeNormalizedIndex(insertionIndex: number, draggedIndex: number): number {
    return insertionIndex > draggedIndex ? insertionIndex - 1 : insertionIndex;
}

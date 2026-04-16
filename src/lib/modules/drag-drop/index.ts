import type { ActionReturn } from 'svelte/action';
import {
    reorder,
    getInsertionIndex,
    computeNormalizedIndex
} from './reorder.js';
import {
    generateZoneId,
    resolveContextFromElement,
    isValidTarget,
    findZoneContainingPointer,
    type InternalDragDropContext,
    type Zone
} from './context.js';
import {
    refLiveRegion,
    unrefLiveRegion,
    announce,
    defaultAnnouncement,
    applyZoneRoles,
    applyItemRole,
    setAriaGrabbed,
    setAriaDropEffect,
    setAriaDisabled,
    type GetAnnouncementDetail
} from './aria.js';
import {
    createDragPreview,
    positionPreview,
    destroyPreview,
    hideDragSource,
    restoreDragSource,
    acquireCursorStyle,
    releaseCursorStyle,
    setDraggingCursor,
    getScrollableAncestor,
    tryAutoScroll,
    type PreviewOffset
} from './preview.js';

export type { Zone };
export type { DragDropContext } from './context.js';
export { createDragDropContext } from './context.js';

// ─── Public types ────────────────────────────────────────────────────────────

export type DragDropTrigger =
    | 'dragStarted'
    | 'draggedOverIndex'
    | 'droppedIntoZone'
    | 'droppedOutsideOfAny'
    | 'removedFromZone';

export type DragDropEvent<T> = {
    items: T[];
    info: {
        id: string;
        source: 'pointer' | 'keyboard' | 'touch';
        trigger: DragDropTrigger;
        zoneId: string;
    };
};

export type DragDropZoneAttributes<T> = {
    onconsider?: (e: CustomEvent<DragDropEvent<T>>) => void;
    onfinalize?: (e: CustomEvent<DragDropEvent<T>>) => void;
};

export type DragDropZoneOptions<T extends object> = {
    items: T[];
    getItemId: (item: T) => string;
    zoneId?: string;
    group?: string;
    dragThreshold?: number;
    handleSelector?: string;
    axis?: 'x' | 'y' | 'both';
    swapThreshold?: number;
    lockToContainer?: boolean;
    dropOutsideBehavior?: 'restore' | 'remove';
    itemSelector?: string;
    canDrag?: (item: T, index: number) => boolean;
    canDrop?: (item: T, targetZoneId: string) => boolean;
    dragClass?: string;
    previewClass?: string;
    draggingClass?: string;
    previewSelector?: string;
    renderPreview?: (item: T, sourceElement: HTMLElement) => HTMLElement | null | undefined;
    disableAria?: boolean;
    getAnnouncement?: (detail: GetAnnouncementDetail<T>) => string | null | undefined;
    onDragStart?: (detail: { item: T; index: number }) => void;
    onDragMove?: (detail: { item: T; index: number; clientX: number; clientY: number }) => void;
    onDrop?: (detail: { item: T; index: number; trigger: DragDropTrigger }) => void;
    onCancel?: (detail: { item: T; originalIndex: number }) => void;
    onActiveItemChange?: (detail: { item: T | undefined; index: number | undefined; trigger: DragDropTrigger | undefined }) => void;
};

// ─── itemId helper ───────────────────────────────────────────────────────────

export function itemId<T extends object>(key: keyof T): (item: T) => string {
    return (item: T) => String(item[key]);
}

// ─── dragDropZone action ──────────────────────────────────────────────────────

export function dragDropZone<T extends object>(
    node: HTMLElement,
    initialOptions: DragDropZoneOptions<T>
): ActionReturn<DragDropZoneOptions<T>, DragDropZoneAttributes<T>> {
    if (typeof document === 'undefined') {
        return { update() {}, destroy() {} };
    }

    const ownerDocument = node.ownerDocument;
    const resolvedZoneId = initialOptions.zoneId ?? generateZoneId();

    // Context resolved by walking the DOM (parent provider registers via WeakMap)
    const ctx = resolveContextFromElement<T>(node);

    // Save initial cursor/select styles for restoration
    const rootEl = ownerDocument.documentElement;
    const savedRoot = {
        cursor: rootEl.style.getPropertyValue('cursor'),
        userSelect: rootEl.style.getPropertyValue('user-select')
    };
    const savedBody = {
        cursor: ownerDocument.body?.style.getPropertyValue('cursor') ?? '',
        userSelect: ownerDocument.body?.style.getPropertyValue('user-select') ?? ''
    };

    acquireCursorStyle(ownerDocument);
    refLiveRegion();

    let options = initialOptions;
    let pendingOptions: DragDropZoneOptions<T> | null = null;

    // Pointer drag state
    let activePointerId: number | null = null;
    let isDragging = false;
    let sourceIndex: number | null = null;
    let sourceElement: HTMLElement | null = null;
    let pointerStart = { x: 0, y: 0 };
    let draggedIndex: number | null = null;
    let previewItems: T[] = [...options.items];
    let originalItems: T[] = [...options.items];
    let previewEl: HTMLElement | null = null;
    let previewOffset: PreviewOffset = { x: 0, y: 0 };
    let savedSourceStyle: { visibility: string; pointerEvents: string } | null = null;
    let sourceEl: HTMLElement | null = null;
    let lastClientX = 0;
    let lastClientY = 0;
    let lastDragClientY: number | null = null;
    let dragDirection: -1 | 0 | 1 = 0;
    let pointerSource: 'pointer' | 'touch' = 'pointer';

    // Rect cache
    let rectCache = new Map<HTMLElement, DOMRect>();
    let rectsDirty = true;
    let autoScrollFrame: number | null = null;
    const resizeObserver = new ResizeObserver(() => { rectsDirty = true; });

    // Cross-zone state
    let currentZoneId = resolvedZoneId;
    let ghostTargetZoneOriginalItems: T[] = [];

    // Keyboard drag state
    let isKeyboardDragging = false;
    let keyboardDraggedIndex: number | null = null;
    let focusedItemIndex: number | null = null;

    // ── Children helpers ──────────────────────────────────────────────────────

    function getChildren(): HTMLElement[] {
        const all = Array.from(node.children) as HTMLElement[];
        const sel = options.itemSelector;
        return sel ? all.filter((c) => c.matches(sel)) : all;
    }

    function syncChildren(): void {
        const children = getChildren();
        const disableAria = options.disableAria ?? false;
        applyZoneRoles(node, disableAria);
        for (const [i, child] of children.entries()) {
            child.dataset.dndItem = 'true';
            child.dataset.dndIndex = String(i);
            child.draggable = false;
            if (!child.hasAttribute('tabindex')) child.tabIndex = 0;
            applyItemRole(child, disableAria);

            const item = options.items[i];
            const disabled = item !== undefined && options.canDrag
                ? !options.canDrag(item, i)
                : false;
            child.dataset.dndDisabled = disabled ? 'true' : '';

            const handle = child.querySelector<HTMLElement>(
                options.handleSelector ?? '[data-dnd-handle]'
            );
            if (handle) {
                setAriaDisabled(handle, disabled, disableAria);
                handle.style.touchAction = 'none';
            }
        }
    }

    function syncDndIndices(): void {
        const children = getChildren();
        for (const [i, child] of children.entries()) {
            child.dataset.dndIndex = String(i);
        }
    }

    function getItemRects(): Map<HTMLElement, DOMRect> {
        if (rectsDirty) {
            rectCache.clear();
            for (const child of getChildren()) {
                rectCache.set(child, child.getBoundingClientRect());
            }
            rectsDirty = false;
        }
        return rectCache;
    }

    function getZoneItem(target: EventTarget | null): HTMLElement | null {
        if (!(target instanceof Element)) return null;
        const item = target.closest<HTMLElement>('[data-dnd-item="true"]');
        return item?.parentElement === node ? item : null;
    }

    function getZoneIndex(target: EventTarget | null): number | null {
        const item = getZoneItem(target);
        if (!item) return null;
        const idx = Number(item.dataset.dndIndex);
        return Number.isNaN(idx) ? null : idx;
    }

    // ── Item identity ─────────────────────────────────────────────────────────

    function getItemIdStr(index: number): string {
        return options.getItemId(previewItems[index] ?? ({} as T));
    }

    function findOriginalIndex(currentIndex: number): number {
        const item = previewItems[currentIndex];
        if (!item) return 0;
        const id = options.getItemId(item);
        const idx = originalItems.findIndex((o) => options.getItemId(o) === id);
        return Math.max(0, idx);
    }

    // ── Event dispatching ─────────────────────────────────────────────────────

    function dispatchEvent(
        eventName: 'consider' | 'finalize',
        items: T[],
        index: number,
        trigger: DragDropTrigger,
        source: 'pointer' | 'keyboard' | 'touch',
        targetEl: HTMLElement = node
    ): void {
        const zoneId = targetEl === node ? resolvedZoneId : (
            ctx?.getRegisteredZones().find((z) => z.element === targetEl)?.zoneId ?? resolvedZoneId
        );
        targetEl.dispatchEvent(
            new CustomEvent<DragDropEvent<T>>(eventName, {
                detail: {
                    items,
                    info: {
                        id: getItemIdStr(index),
                        source,
                        trigger,
                        zoneId
                    }
                }
            })
        );
    }

    function emitAnnouncement(
        items: T[],
        index: number,
        trigger: DragDropTrigger,
        source: 'pointer' | 'keyboard' | 'touch',
        targetZoneId?: string
    ): void {
        const detail: GetAnnouncementDetail<T> = {
            item: items[index] ?? ({} as T),
            index,
            total: items.length,
            trigger,
            zoneId: resolvedZoneId,
            targetZoneId,
            source
        };
        const msg = options.getAnnouncement
            ? options.getAnnouncement(detail)
            : defaultAnnouncement(detail);
        announce(ownerDocument, msg);
    }

    // ── Preview direction / comparison ────────────────────────────────────────

    function updateDragDirection(clientY: number): void {
        if (lastDragClientY !== null && clientY !== lastDragClientY) {
            dragDirection = clientY < lastDragClientY ? -1 : 1;
        }
        lastDragClientY = clientY;
    }

    function getDragComparisonPoint(clientX: number, clientY: number): { x: number; y: number } {
        if (previewEl) {
            const r = previewEl.getBoundingClientRect();
            if (dragDirection < 0) return { x: clientX, y: r.top };
            if (dragDirection > 0) return { x: clientX, y: r.bottom };
            return { x: clientX, y: r.top + r.height / 2 };
        }
        return { x: clientX, y: clientY };
    }

    function isPointerInsideNode(el: HTMLElement, clientX: number, clientY: number): boolean {
        const r = el.getBoundingClientRect();
        return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    }

    // ── Auto-scroll ───────────────────────────────────────────────────────────

    function runAutoScroll(clientX: number, clientY: number): void {
        if (autoScrollFrame !== null) cancelAnimationFrame(autoScrollFrame);
        autoScrollFrame = requestAnimationFrame(() => {
            autoScrollFrame = null;
            if (!isDragging) return;
            const scrolled = tryAutoScroll(node, clientX, clientY);
            if (!scrolled) {
                const ancestor = getScrollableAncestor(node.parentElement ?? node);
                if (ancestor) tryAutoScroll(ancestor, clientX, clientY);
            }
            if (isDragging) runAutoScroll(lastClientX, lastClientY);
        });
    }

    function stopAutoScroll(): void {
        if (autoScrollFrame !== null) {
            cancelAnimationFrame(autoScrollFrame);
            autoScrollFrame = null;
        }
    }

    // ── Drag lifecycle ────────────────────────────────────────────────────────

    function startPointerDrag(event: PointerEvent): void {
        if (sourceIndex === null || !sourceElement) return;

        draggedIndex = sourceIndex;
        originalItems = [...options.items];
        previewItems = [...options.items];
        lastDragClientY = event.clientY;
        dragDirection = 0;
        isDragging = true;
        currentZoneId = resolvedZoneId;
        rectsDirty = true;

        const { element, offset } = createDragPreview(sourceElement, event.clientX, event.clientY, previewItems[sourceIndex], {
            previewSelector: options.previewSelector,
            renderPreview: options.renderPreview as ((item: unknown, el: HTMLElement) => HTMLElement | null | undefined) | undefined,
            previewClass: options.previewClass
        });
        previewEl = element;
        previewOffset = offset;

        savedSourceStyle = hideDragSource(sourceElement);
        sourceEl = sourceElement;

        if (options.dragClass) sourceElement.classList.add(options.dragClass);
        sourceElement.dataset.dndPlaceholder = 'true';
        node.dataset.dndActive = 'true';
        if (options.draggingClass) node.classList.add(options.draggingClass);

        setDraggingCursor(ownerDocument, true, savedRoot, savedBody);
        setAriaGrabbed(sourceElement, true, options.disableAria ?? false);

        resizeObserver.observe(node);
        node.addEventListener('scroll', onScroll, { passive: true });
        runAutoScroll(event.clientX, event.clientY);

        options.onDragStart?.({ item: previewItems[sourceIndex], index: sourceIndex });

        if (ctx) {
            ctx.setActiveDrag({
                item: previewItems[sourceIndex],
                sourceZoneId: resolvedZoneId,
                currentZoneId: resolvedZoneId,
                draggedIndex: sourceIndex
            });
        }

        dispatchEvent('consider', previewItems, sourceIndex, 'dragStarted', pointerSource);
        emitAnnouncement(previewItems, sourceIndex, 'dragStarted', pointerSource);
        syncDndIndices();
    }

    function onScroll(): void {
        rectsDirty = true;
    }

    function resetDragState(): void {
        isDragging = false;
        stopAutoScroll();

        if (sourceEl) {
            if (savedSourceStyle) restoreDragSource(sourceEl, savedSourceStyle);
            if (options.dragClass) sourceEl.classList.remove(options.dragClass);
            delete sourceEl.dataset.dndPlaceholder;
            setAriaGrabbed(sourceEl, false, options.disableAria ?? false);
        }

        delete node.dataset.dndActive;
        if (options.draggingClass) node.classList.remove(options.draggingClass);

        destroyPreview(previewEl);
        previewEl = null;
        savedSourceStyle = null;
        sourceEl = null;

        setDraggingCursor(ownerDocument, false, savedRoot, savedBody);

        // Clear aria-dropeffect on all context zones
        if (ctx) {
            for (const zone of ctx.getRegisteredZones()) {
                setAriaDropEffect(zone.element, 'none', options.disableAria ?? false);
            }
            ctx.setActiveDrag(null);
        }

        resizeObserver.unobserve(node);
        node.removeEventListener('scroll', onScroll);
        rectsDirty = true;

        activePointerId = null;
        sourceIndex = null;
        sourceElement = null;
        draggedIndex = null;
        currentZoneId = resolvedZoneId;
        ghostTargetZoneOriginalItems = [];
        lastDragClientY = null;
        dragDirection = 0;

        ownerDocument.removeEventListener('pointermove', handlePointerMove, true);
        ownerDocument.removeEventListener('pointerup', handlePointerUp, true);
        ownerDocument.removeEventListener('pointercancel', handlePointerCancel, true);

        options.onActiveItemChange?.({ item: undefined, index: undefined, trigger: undefined });

        if (pendingOptions) {
            options = pendingOptions;
            pendingOptions = null;
            previewItems = [...options.items];
            originalItems = [...options.items];
            syncChildren();
        } else {
            previewItems = [...options.items];
            originalItems = [...options.items];
        }
    }

    // ── Cross-zone helpers ────────────────────────────────────────────────────

    function getValidTargetZones(): Zone<T>[] {
        if (!ctx || options.lockToContainer) return [];
        return ctx.getRegisteredZones().filter((z) =>
            isValidTarget(ctx, options.group, z, resolvedZoneId)
        );
    }

    function handleCrossZoneMove(clientX: number, clientY: number, source: 'pointer' | 'keyboard' | 'touch'): void {
        if (draggedIndex === null) return;
        const targets = getValidTargetZones();
        const pointerInSource = isPointerInsideNode(node, clientX, clientY);

        if (pointerInSource && currentZoneId !== resolvedZoneId) {
            // Returning to source zone
            const prevTargetZone = targets.find((z) => z.zoneId === currentZoneId);
            if (prevTargetZone) {
                prevTargetZone.element.dispatchEvent(
                    new CustomEvent<DragDropEvent<T>>('consider', {
                        detail: {
                            items: ghostTargetZoneOriginalItems,
                            info: { id: getItemIdStr(draggedIndex), source, trigger: 'removedFromZone', zoneId: prevTargetZone.zoneId }
                        }
                    })
                );
                setAriaDropEffect(prevTargetZone.element, 'none', options.disableAria ?? false);
            }
            currentZoneId = resolvedZoneId;
            ghostTargetZoneOriginalItems = [];

            const cp = getDragComparisonPoint(clientX, clientY);
            const rects = getItemRects();
            const insertionIdx = getInsertionIndex(
                getChildren(), rects, draggedIndex, cp.x, cp.y,
                options.axis ?? 'y', options.swapThreshold ?? 0.5
            );
            const nextIdx = computeNormalizedIndex(insertionIdx, draggedIndex);
            if (nextIdx !== draggedIndex) {
                previewItems = reorder(previewItems, draggedIndex, nextIdx);
                draggedIndex = nextIdx;
            }
            dispatchEvent('consider', previewItems, draggedIndex, 'draggedOverIndex', source);
            return;
        }

        if (!pointerInSource) {
            const targetZone = findZoneContainingPointer(targets, clientX, clientY);
            if (!targetZone) return;

            const canDropFn = options.canDrop;
            const draggedItem = previewItems[draggedIndex] ?? originalItems[findOriginalIndex(draggedIndex)];
            if (canDropFn && !canDropFn(draggedItem, targetZone.zoneId)) return;

            if (currentZoneId !== resolvedZoneId && currentZoneId !== targetZone.zoneId) {
                // Moving between two target zones
                const prevZone = targets.find((z) => z.zoneId === currentZoneId);
                if (prevZone) {
                    prevZone.element.dispatchEvent(
                        new CustomEvent<DragDropEvent<T>>('consider', {
                            detail: {
                                items: ghostTargetZoneOriginalItems,
                                info: { id: getItemIdStr(draggedIndex), source, trigger: 'removedFromZone', zoneId: prevZone.zoneId }
                            }
                        })
                    );
                    setAriaDropEffect(prevZone.element, 'none', options.disableAria ?? false);
                }
            }

            if (currentZoneId === resolvedZoneId) {
                // Leaving source for the first time
                ghostTargetZoneOriginalItems = targetZone.getItems();
                // Source fires removedFromZone
                const itemsWithoutGhost = previewItems.filter((_, i) => i !== draggedIndex);
                dispatchEvent('consider', itemsWithoutGhost, draggedIndex, 'removedFromZone', source);
                emitAnnouncement(itemsWithoutGhost, draggedIndex, 'removedFromZone', source, targetZone.zoneId);
            } else if (currentZoneId !== targetZone.zoneId) {
                ghostTargetZoneOriginalItems = targetZone.getItems();
            }

            currentZoneId = targetZone.zoneId;
            setAriaDropEffect(targetZone.element, 'move', options.disableAria ?? false);

            // Compute insertion in target zone
            const targetChildren = Array.from(targetZone.element.children).filter(
                (c): c is HTMLElement => c instanceof HTMLElement && c.dataset.dndItem === 'true'
            );
            const targetRects = new Map(targetChildren.map((c) => [c, c.getBoundingClientRect()]));
            const targetInsertIdx = getInsertionIndex(
                targetChildren, targetRects, -1, clientX, clientY,
                options.axis ?? 'y', options.swapThreshold ?? 0.5
            );
            const draggedItem2 = previewItems[draggedIndex] ?? ({} as T);
            const targetItems = [...ghostTargetZoneOriginalItems];
            const clampedIdx = Math.min(targetInsertIdx, targetItems.length);
            targetItems.splice(clampedIdx, 0, draggedItem2);

            targetZone.element.dispatchEvent(
                new CustomEvent<DragDropEvent<T>>('consider', {
                    detail: {
                        items: targetItems,
                        info: { id: options.getItemId(draggedItem2), source, trigger: 'draggedOverIndex', zoneId: targetZone.zoneId }
                    }
                })
            );
        }
    }

    // ── Pointer handlers ──────────────────────────────────────────────────────

    function handlePointerDown(event: PointerEvent): void {
        if (!event.isPrimary || event.button !== 0) return;
        if (options.canDrag) {
            const idx = getZoneIndex(event.target);
            if (idx !== null && options.items[idx] !== undefined && !options.canDrag(options.items[idx]!, idx)) return;
        }

        const handleSel = options.handleSelector ?? '[data-dnd-handle]';
        const handle = event.target instanceof Element ? event.target.closest(handleSel) : null;
        if (!handle) return;

        const nextIndex = getZoneIndex(event.target);
        const nextElement = getZoneItem(event.target);
        if (nextIndex === null || !nextElement) return;

        pointerSource = event.pointerType === 'touch' ? 'touch' : 'pointer';
        activePointerId = event.pointerId;
        sourceIndex = nextIndex;
        sourceElement = nextElement;
        pointerStart = { x: event.clientX, y: event.clientY };
        lastClientX = event.clientX;
        lastClientY = event.clientY;
        dragDirection = 0;

        try { node.setPointerCapture(event.pointerId); } catch { /* non-critical */ }

        ownerDocument.addEventListener('pointermove', handlePointerMove, true);
        ownerDocument.addEventListener('pointerup', handlePointerUp, true);
        ownerDocument.addEventListener('pointercancel', handlePointerCancel, true);
        event.preventDefault();
    }

    function handlePointerMove(event: PointerEvent): void {
        if (event.pointerId !== activePointerId) return;
        event.preventDefault();

        lastClientX = event.clientX;
        lastClientY = event.clientY;

        if (!isDragging) {
            const threshold = (options.dragThreshold ?? 4) * (pointerSource === 'touch' ? 2 : 1);
            const dist = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
            if (dist < threshold) return;
            startPointerDrag(event);
        }

        if (draggedIndex === null) return;

        updateDragDirection(event.clientY);
        positionPreview(previewEl!, event.clientX, event.clientY, previewOffset);

        // Cross-zone check
        const hasTargets = getValidTargetZones().length > 0;
        if (hasTargets) {
            handleCrossZoneMove(event.clientX, event.clientY, pointerSource);
        }

        // Same-zone reorder (only if ghost is still in source zone)
        if (currentZoneId === resolvedZoneId) {
            const cp = getDragComparisonPoint(event.clientX, event.clientY);
            const rects = getItemRects();
            const insertionIdx = getInsertionIndex(
                getChildren(), rects, draggedIndex, cp.x, cp.y,
                options.axis ?? 'y', options.swapThreshold ?? 0.5
            );
            const nextIdx = computeNormalizedIndex(insertionIdx, draggedIndex);
            if (nextIdx !== draggedIndex) {
                previewItems = reorder(previewItems, draggedIndex, nextIdx);
                draggedIndex = nextIdx;
                syncDndIndices();
                options.onActiveItemChange?.({ item: previewItems[nextIdx], index: nextIdx, trigger: 'draggedOverIndex' });
                options.onDragMove?.({ item: previewItems[nextIdx]!, index: nextIdx, clientX: event.clientX, clientY: event.clientY });
                dispatchEvent('consider', previewItems, nextIdx, 'draggedOverIndex', pointerSource);
                emitAnnouncement(previewItems, nextIdx, 'draggedOverIndex', pointerSource);
            }
        }
    }

    function handlePointerUp(event: PointerEvent): void {
        if (event.pointerId !== activePointerId) return;

        if (isDragging && draggedIndex !== null) {
            if (currentZoneId !== resolvedZoneId) {
                // Drop into a target zone
                const targetZone = ctx?.getRegisteredZones().find((z) => z.zoneId === currentZoneId);
                if (targetZone) {
                    const draggedItem = previewItems[draggedIndex] ?? ({} as T);
                    const targetChildren = Array.from(targetZone.element.children).filter(
                        (c): c is HTMLElement => c instanceof HTMLElement && c.dataset.dndItem === 'true'
                    );
                    const targetRects = new Map(targetChildren.map((c) => [c, c.getBoundingClientRect()]));
                    const insertIdx = getInsertionIndex(
                        targetChildren, targetRects, -1, event.clientX, event.clientY,
                        options.axis ?? 'y', options.swapThreshold ?? 0.5
                    );
                    const finalTargetItems = [...ghostTargetZoneOriginalItems];
                    finalTargetItems.splice(Math.min(insertIdx, finalTargetItems.length), 0, draggedItem);

                    targetZone.element.dispatchEvent(
                        new CustomEvent<DragDropEvent<T>>('finalize', {
                            detail: { items: finalTargetItems, info: { id: options.getItemId(draggedItem), source: pointerSource, trigger: 'droppedIntoZone', zoneId: targetZone.zoneId } }
                        })
                    );
                    emitAnnouncement(finalTargetItems, insertIdx, 'droppedIntoZone', pointerSource);

                    // Source finalizes as removedFromZone
                    const sourceItems = previewItems.filter((_, i) => i !== draggedIndex);
                    dispatchEvent('finalize', sourceItems, draggedIndex, 'removedFromZone', pointerSource);
                    options.onDrop?.({ item: draggedItem, index: draggedIndex, trigger: 'removedFromZone' });
                }
            } else if (isPointerInsideNode(node, event.clientX, event.clientY)) {
                dispatchEvent('finalize', previewItems, draggedIndex, 'droppedIntoZone', pointerSource);
                emitAnnouncement(previewItems, draggedIndex, 'droppedIntoZone', pointerSource);
                options.onDrop?.({ item: previewItems[draggedIndex]!, index: draggedIndex, trigger: 'droppedIntoZone' });
            } else {
                // Drop outside
                if (options.dropOutsideBehavior === 'remove') {
                    const di = draggedIndex;
                    const draggedId = options.getItemId(previewItems[di] ?? ({} as T));
                    const itemsWithoutGhost = originalItems.filter((item) => options.getItemId(item) !== draggedId);
                    dispatchEvent('finalize', itemsWithoutGhost, di, 'droppedOutsideOfAny', pointerSource);
                    options.onDrop?.({ item: previewItems[di]!, index: di, trigger: 'droppedOutsideOfAny' });
                } else {
                    const originalIdx = findOriginalIndex(draggedIndex);
                    dispatchEvent('consider', [...originalItems], originalIdx, 'droppedOutsideOfAny', pointerSource);
                    options.onCancel?.({ item: originalItems[originalIdx]!, originalIndex: originalIdx });
                }
                emitAnnouncement(originalItems, findOriginalIndex(draggedIndex), 'droppedOutsideOfAny', pointerSource);
            }
        }

        resetDragState();
    }

    function handlePointerCancel(event: PointerEvent): void {
        if (event.pointerId !== activePointerId) return;

        if (isDragging && draggedIndex !== null) {
            // Clean up ghost in target zone if needed
            if (currentZoneId !== resolvedZoneId) {
                const targetZone = ctx?.getRegisteredZones().find((z) => z.zoneId === currentZoneId);
                if (targetZone) {
                    targetZone.element.dispatchEvent(
                        new CustomEvent<DragDropEvent<T>>('consider', {
                            detail: { items: ghostTargetZoneOriginalItems, info: { id: getItemIdStr(draggedIndex), source: pointerSource, trigger: 'removedFromZone', zoneId: targetZone.zoneId } }
                        })
                    );
                }
            }
            const originalIdx = findOriginalIndex(draggedIndex);
            dispatchEvent('consider', [...originalItems], originalIdx, 'droppedOutsideOfAny', pointerSource);
            options.onCancel?.({ item: originalItems[originalIdx]!, originalIndex: originalIdx });
            emitAnnouncement(originalItems, originalIdx, 'droppedOutsideOfAny', pointerSource);
        }

        resetDragState();
    }

    // ── Keyboard drag ─────────────────────────────────────────────────────────

    function startKeyboardDrag(index: number, element: HTMLElement): void {
        if (isKeyboardDragging) return;
        const item = options.items[index];
        if (!item) return;
        if (options.canDrag && !options.canDrag(item, index)) return;

        isKeyboardDragging = true;
        keyboardDraggedIndex = index;
        originalItems = [...options.items];
        previewItems = [...options.items];
        isDragging = true;
        currentZoneId = resolvedZoneId;

        if (options.dragClass) element.classList.add(options.dragClass);
        element.dataset.dndActive = 'true';
        node.dataset.dndActive = 'true';
        if (options.draggingClass) node.classList.add(options.draggingClass);
        setAriaGrabbed(element, true, options.disableAria ?? false);

        if (ctx) {
            ctx.setActiveDrag({ item, sourceZoneId: resolvedZoneId, currentZoneId: resolvedZoneId, draggedIndex: index });
        }

        options.onDragStart?.({ item, index });
        dispatchEvent('consider', previewItems, index, 'dragStarted', 'keyboard');
        emitAnnouncement(previewItems, index, 'dragStarted', 'keyboard');
    }

    function moveKeyboard(delta: number): void {
        if (keyboardDraggedIndex === null) return;
        const children = getChildren();
        const nextIdx = Math.max(0, Math.min(children.length - 1, keyboardDraggedIndex + delta));
        if (nextIdx === keyboardDraggedIndex) return;

        previewItems = reorder(previewItems, keyboardDraggedIndex, nextIdx);
        keyboardDraggedIndex = nextIdx;
        syncDndIndices();

        // Apply dragClass to new position element
        const newElement = children[nextIdx];
        if (newElement) {
            // Remove from old positions, apply to new
            for (const child of children) {
                if (options.dragClass) child.classList.remove(options.dragClass);
                delete child.dataset.dndActive;
            }
            if (options.dragClass) newElement.classList.add(options.dragClass);
            newElement.dataset.dndActive = 'true';
            newElement.scrollIntoView({ block: 'nearest' });
        }

        options.onActiveItemChange?.({ item: previewItems[nextIdx], index: nextIdx, trigger: 'draggedOverIndex' });
        dispatchEvent('consider', previewItems, nextIdx, 'draggedOverIndex', 'keyboard');
        emitAnnouncement(previewItems, nextIdx, 'draggedOverIndex', 'keyboard');
    }

    function dropKeyboard(): void {
        if (keyboardDraggedIndex === null) return;
        const idx = keyboardDraggedIndex;
        const item = previewItems[idx]!;

        dispatchEvent('finalize', previewItems, idx, 'droppedIntoZone', 'keyboard');
        emitAnnouncement(previewItems, idx, 'droppedIntoZone', 'keyboard');
        options.onDrop?.({ item, index: idx, trigger: 'droppedIntoZone' });

        resetKeyboardDrag();
    }

    function cancelKeyboard(): void {
        if (keyboardDraggedIndex === null) return;
        const originalIdx = findOriginalIndex(keyboardDraggedIndex);
        const item = originalItems[originalIdx]!;

        dispatchEvent('consider', [...originalItems], originalIdx, 'droppedOutsideOfAny', 'keyboard');
        emitAnnouncement(originalItems, originalIdx, 'droppedOutsideOfAny', 'keyboard');
        options.onCancel?.({ item, originalIndex: originalIdx });

        resetKeyboardDrag();
    }

    function resetKeyboardDrag(): void {
        isKeyboardDragging = false;
        isDragging = false;
        const children = getChildren();
        for (const child of children) {
            if (options.dragClass) child.classList.remove(options.dragClass);
            delete child.dataset.dndActive;
            setAriaGrabbed(child, false, options.disableAria ?? false);
        }
        delete node.dataset.dndActive;
        if (options.draggingClass) node.classList.remove(options.draggingClass);

        if (ctx) ctx.setActiveDrag(null);

        keyboardDraggedIndex = null;
        currentZoneId = resolvedZoneId;
        options.onActiveItemChange?.({ item: undefined, index: undefined, trigger: undefined });

        if (pendingOptions) {
            options = pendingOptions;
            pendingOptions = null;
        }
        previewItems = [...options.items];
        originalItems = [...options.items];
        syncChildren();
    }

    function handleKeyDown(event: KeyboardEvent): void {
        if (!(event.target instanceof Element)) return;
        const itemEl = event.target.closest<HTMLElement>('[data-dnd-item="true"]');
        if (!itemEl || itemEl.parentElement !== node) return;

        const { axis = 'y' } = options;
        const upKey = axis === 'x' ? 'ArrowLeft' : 'ArrowUp';
        const downKey = axis === 'x' ? 'ArrowRight' : 'ArrowDown';

        if (!isKeyboardDragging) {
            if (event.key === ' ' || event.key === 'Enter') {
                const idx = getZoneIndex(event.target);
                if (idx !== null) {
                    event.preventDefault();
                    startKeyboardDrag(idx, itemEl);
                }
            }
            return;
        }

        switch (event.key) {
            case upKey:
                event.preventDefault();
                moveKeyboard(-1);
                break;
            case downKey:
                event.preventDefault();
                moveKeyboard(1);
                break;
            case ' ':
            case 'Enter':
                event.preventDefault();
                dropKeyboard();
                break;
            case 'Escape':
                event.preventDefault();
                cancelKeyboard();
                break;
            case 'Tab':
                if (!options.lockToContainer && ctx) {
                    const targets = getValidTargetZones();
                    if (targets.length > 0) {
                        event.preventDefault();
                        // Tab cross-zone: find next zone
                        const currentIdx = targets.findIndex((z) => z.zoneId === currentZoneId);
                        const nextZone = targets[(currentIdx + 1) % targets.length];
                        if (nextZone) {
                            // Transfer keyboard drag to next zone — Tab is a no-op if only one target
                            if (targets.length > 1 || currentZoneId !== resolvedZoneId) {
                                // Focus first item of target zone and let that zone take over
                                const firstItem = nextZone.element.querySelector<HTMLElement>('[data-dnd-item="true"]');
                                firstItem?.focus();
                            }
                        }
                    }
                }
                break;
        }
    }

    function handleFocusIn(event: FocusEvent): void {
        const idx = getZoneIndex(event.target);
        focusedItemIndex = idx;
    }

    // ── Setup ─────────────────────────────────────────────────────────────────

    if (ctx) {
        ctx.registerZone({
            zoneId: resolvedZoneId,
            group: options.group,
            element: node,
            getItems: () => previewItems,
            isActive: () => isDragging
        });
    }

    syncChildren();
    node.addEventListener('pointerdown', handlePointerDown, true);
    node.addEventListener('keydown', handleKeyDown);
    node.addEventListener('focusin', handleFocusIn);

    return {
        update(newOptions: DragDropZoneOptions<T>) {
            if (isDragging || isKeyboardDragging) {
                pendingOptions = newOptions;
                return;
            }
            options = newOptions;
            previewItems = [...newOptions.items];
            originalItems = [...newOptions.items];
            syncChildren();
        },
        destroy() {
            if (ctx) ctx.deregisterZone(resolvedZoneId);
            node.removeEventListener('pointerdown', handlePointerDown, true);
            node.removeEventListener('keydown', handleKeyDown);
            node.removeEventListener('focusin', handleFocusIn);
            ownerDocument.removeEventListener('pointermove', handlePointerMove, true);
            ownerDocument.removeEventListener('pointerup', handlePointerUp, true);
            ownerDocument.removeEventListener('pointercancel', handlePointerCancel, true);
            node.removeEventListener('scroll', onScroll);
            resizeObserver.disconnect();
            stopAutoScroll();
            destroyPreview(previewEl);
            setDraggingCursor(ownerDocument, false, savedRoot, savedBody);
            releaseCursorStyle(ownerDocument);
            unrefLiveRegion();
        }
    };
}

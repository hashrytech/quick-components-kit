import type { ActionReturn } from "svelte/action";

export type DragDropTrigger = "dragStarted" | "draggedOverIndex" | "droppedIntoZone" | "droppedOutsideOfAny";

export type DragDropEvent<T> = {
    items: T[];
    info: {
        id: string;
        source: "pointer";
        trigger: DragDropTrigger;
    };
};

export type DragDropZoneAttributes<T> = {
    "on:consider"?: (e: CustomEvent<DragDropEvent<T>>) => void;
    "on:finalize"?: (e: CustomEvent<DragDropEvent<T>>) => void;
    onconsider?: (e: CustomEvent<DragDropEvent<T>>) => void;
    onfinalize?: (e: CustomEvent<DragDropEvent<T>>) => void;
};

export type DragDropZoneOptions<T extends Record<string, any>> = {
    items: T[];
    dragDisabled?: boolean;
    handleSelector?: string;
    dragStartThreshold?: number;
    getItemId?: (item: T | undefined, index: number) => string;
    onActiveItemChange?: (item: T | undefined) => void;
};

export function dragDropZone<T extends Record<string, any>>(
    node: HTMLElement,
    initialOptions: DragDropZoneOptions<T>
): ActionReturn<DragDropZoneOptions<T>, DragDropZoneAttributes<T>> {
    const ownerDocument = node.ownerDocument;
    const rootElement = ownerDocument.documentElement;
    const bodyElement = ownerDocument.body;
    const styleElementId = "drag-drop-cursor-style";
    let cursorStyleElement = ownerDocument.getElementById(styleElementId) as HTMLStyleElement | null;
    if (!cursorStyleElement) {
        cursorStyleElement = ownerDocument.createElement("style");
        cursorStyleElement.id = styleElementId;
        cursorStyleElement.textContent = ".drag-drop-dragging, .drag-drop-dragging * { cursor: grabbing !important; }";
        ownerDocument.head.appendChild(cursorStyleElement);
    }

    const rootCursorStyle = {
        value: rootElement.style.getPropertyValue("cursor"),
        priority: rootElement.style.getPropertyPriority("cursor")
    };
    const bodyCursorStyle = {
        value: bodyElement?.style.getPropertyValue("cursor") ?? "",
        priority: bodyElement?.style.getPropertyPriority("cursor") ?? ""
    };
    const rootUserSelectStyle = {
        value: rootElement.style.getPropertyValue("user-select"),
        priority: rootElement.style.getPropertyPriority("user-select")
    };
    const bodyUserSelectStyle = {
        value: bodyElement?.style.getPropertyValue("user-select") ?? "",
        priority: bodyElement?.style.getPropertyPriority("user-select") ?? ""
    };

    let options = initialOptions;
    let activePointerId: number | null = null;
    let sourceIndex: number | null = null;
    let sourceElement: HTMLElement | null = null;
    let pointerStartPosition = {x: 0, y: 0};
    let draggedIndex: number | null = null;
    let previewItems = [...options.items];
    let originalItems = [...options.items];
    let draggedElement: HTMLElement | null = null;
    let draggedElementInlineStyle: {visibility: string; pointerEvents: string} | null = null;
    let dragPreviewElement: HTMLElement | null = null;
    let dragPointerOffset = {x: 0, y: 0};
    let lastPointerPosition = {x: 0, y: 0};
    let lastDragClientY: number | null = null;
    let dragDirection: -1 | 0 | 1 = 0;

    function getChildren() {
        return Array.from(node.children).filter((child): child is HTMLElement => child instanceof HTMLElement);
    }

    function syncChildren() {
        for (const [index, child] of getChildren().entries()) {
            child.dataset.dragDropItem = "true";
            child.dataset.dragDropIndex = String(index);
            child.draggable = false;
        }
    }

    function getZoneItem(target: EventTarget | null) {
        if (!(target instanceof Element)) {
            return null;
        }

        const item = target.closest<HTMLElement>('[data-drag-drop-item="true"]');
        return item?.parentElement === node ? item : null;
    }

    function getZoneIndex(target: EventTarget | null) {
        const item = getZoneItem(target);
        if (!item) {
            return null;
        }

        const index = Number(item.dataset.dragDropIndex);
        return Number.isNaN(index) ? null : index;
    }

    function getItemId(index: number) {
        const item = previewItems[index];
        if (options.getItemId) {
            return options.getItemId(item, index);
        }

        return String(item?.uid ?? index);
    }

    function isSameItem(leftItem: T | undefined, leftIndex: number, rightItem: T | undefined, rightIndex: number) {
        if (options.getItemId) {
            return options.getItemId(leftItem, leftIndex) === options.getItemId(rightItem, rightIndex);
        }

        const leftUid = leftItem?.uid;
        const rightUid = rightItem?.uid;
        if (leftUid !== undefined || rightUid !== undefined) {
            return leftUid === rightUid;
        }

        return leftItem === rightItem;
    }

    function getOriginalIndexForDraggedItem(currentDraggedIndex: number) {
        const draggedItem = previewItems[currentDraggedIndex];
        return Math.max(0, originalItems.findIndex((item, index) => isSameItem(item, index, draggedItem, currentDraggedIndex)));
    }

    function setActiveItem(item: T | undefined) {
        options.onActiveItemChange?.(item);
    }

    function updateDragPreviewPosition(clientX: number, clientY: number) {
        if (lastDragClientY !== null && clientY !== lastDragClientY) {
            dragDirection = clientY < lastDragClientY ? -1 : 1;
        }

        lastDragClientY = clientY;
        lastPointerPosition = {x: clientX, y: clientY};

        if (!dragPreviewElement) {
            return;
        }

        const nextX = Math.round(clientX - dragPointerOffset.x);
        const nextY = Math.round(clientY - dragPointerOffset.y);
        dragPreviewElement.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
    }

    function createDragPreview(currentSourceElement: HTMLElement, clientX: number, clientY: number) {
        const rect = currentSourceElement.getBoundingClientRect();
        const previewElement = currentSourceElement.cloneNode(true) as HTMLElement;

        previewElement.querySelectorAll("[id]").forEach((element) => element.removeAttribute("id"));
        previewElement.setAttribute("aria-hidden", "true");
        previewElement.style.position = "fixed";
        previewElement.style.top = "0";
        previewElement.style.left = "0";
        previewElement.style.margin = "0";
        previewElement.style.width = `${rect.width}px`;
        previewElement.style.height = `${rect.height}px`;
        previewElement.style.pointerEvents = "none";
        previewElement.style.zIndex = "2147483647";
        previewElement.style.opacity = "1";
        previewElement.style.willChange = "transform";
        previewElement.style.boxSizing = "border-box";
        previewElement.style.cursor = "grabbing";

        const pointerX = clientX || lastPointerPosition.x || rect.left + rect.width / 2;
        const pointerY = clientY || lastPointerPosition.y || rect.top + rect.height / 2;
        dragPointerOffset = {
            x: Math.min(rect.width, Math.max(0, pointerX - rect.left)),
            y: Math.min(rect.height, Math.max(0, pointerY - rect.top))
        };

        ownerDocument.body.appendChild(previewElement);
        dragPreviewElement = previewElement;
        updateDragPreviewPosition(pointerX, pointerY);
    }

    function destroyDragPreview() {
        dragPreviewElement?.remove();
        dragPreviewElement = null;
    }

    function setDraggingCursor(active: boolean) {
        rootElement.classList.toggle("drag-drop-dragging", active);
        bodyElement?.classList.toggle("drag-drop-dragging", active);

        if (active) {
            rootElement.style.setProperty("cursor", "grabbing", "important");
            bodyElement?.style.setProperty("cursor", "grabbing", "important");
            rootElement.style.setProperty("user-select", "none", "important");
            bodyElement?.style.setProperty("user-select", "none", "important");
            return;
        }

        if (rootCursorStyle.value) {
            rootElement.style.setProperty("cursor", rootCursorStyle.value, rootCursorStyle.priority);
        }
        else {
            rootElement.style.removeProperty("cursor");
        }

        if (bodyElement) {
            if (bodyCursorStyle.value) {
                bodyElement.style.setProperty("cursor", bodyCursorStyle.value, bodyCursorStyle.priority);
            }
            else {
                bodyElement.style.removeProperty("cursor");
            }

            if (bodyUserSelectStyle.value) {
                bodyElement.style.setProperty("user-select", bodyUserSelectStyle.value, bodyUserSelectStyle.priority);
            }
            else {
                bodyElement.style.removeProperty("user-select");
            }
        }

        if (rootUserSelectStyle.value) {
            rootElement.style.setProperty("user-select", rootUserSelectStyle.value, rootUserSelectStyle.priority);
        }
        else {
            rootElement.style.removeProperty("user-select");
        }
    }

    function hideDraggedElement(element: HTMLElement) {
        draggedElement = element;
        draggedElementInlineStyle = {
            visibility: element.style.visibility,
            pointerEvents: element.style.pointerEvents
        };
        element.style.visibility = "hidden";
        element.style.pointerEvents = "none";
    }

    function restoreDraggedElement() {
        if (!draggedElement) {
            return;
        }

        draggedElement.style.visibility = draggedElementInlineStyle?.visibility ?? "";
        draggedElement.style.pointerEvents = draggedElementInlineStyle?.pointerEvents ?? "";
        draggedElement = null;
        draggedElementInlineStyle = null;
    }

    function getDragComparisonY(clientY: number) {
        if (dragPreviewElement) {
            const previewRect = dragPreviewElement.getBoundingClientRect();
            if (dragDirection < 0) {
                return previewRect.top;
            }

            if (dragDirection > 0) {
                return previewRect.bottom;
            }

            return previewRect.top + previewRect.height / 2;
        }

        return clientY;
    }

    function isPointerInsideZone(clientX: number, clientY: number) {
        const rect = node.getBoundingClientRect();
        return clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom;
    }

    function getInsertionIndex(comparisonY: number) {
        const children = getChildren();

        for (const [index, child] of children.entries()) {
            if (index === draggedIndex) {
                continue;
            }

            const rect = child.getBoundingClientRect();
            if (comparisonY < rect.top + rect.height / 2) {
                return index;
            }
        }

        return children.length;
    }

    function reorder(items: T[], from: number, to: number) {
        const reordered = [...items];
        const [movedItem] = reordered.splice(from, 1);
        if (movedItem === undefined) {
            return reordered;
        }
        reordered.splice(to, 0, movedItem);
        return reordered;
    }

    function dispatchZoneEvent(
        eventName: "consider" | "finalize",
        items: T[],
        index: number,
        trigger: DragDropTrigger
    ) {
        node.dispatchEvent(
            new CustomEvent<DragDropEvent<T>>(eventName, {
                detail: {
                    items,
                    info: {
                        id: String(getItemId(index)),
                        source: "pointer",
                        trigger
                    }
                }
            })
        );
    }

    function detachPointerListeners() {
        ownerDocument.removeEventListener("pointermove", handlePointerMove, true);
        ownerDocument.removeEventListener("pointerup", handlePointerUp, true);
        ownerDocument.removeEventListener("pointercancel", handlePointerCancel, true);
    }

    function resetDragState() {
        activePointerId = null;
        sourceIndex = null;
        sourceElement = null;
        draggedIndex = null;
        previewItems = [...options.items];
        originalItems = [...options.items];
        lastDragClientY = null;
        dragDirection = 0;
        detachPointerListeners();
        destroyDragPreview();
        restoreDraggedElement();
        setDraggingCursor(false);
        setActiveItem(undefined);
    }

    function handlePointerDown(event: PointerEvent) {
        if (options.dragDisabled || !event.isPrimary || event.button !== 0) {
            return;
        }

        const handleSelector = options.handleSelector ?? '[aria-label^="drag-handle"]';
        const handle = event.target instanceof Element ? event.target.closest(handleSelector) : null;
        if (!handle) {
            return;
        }

        const nextIndex = getZoneIndex(event.target);
        const nextElement = getZoneItem(event.target);
        if (nextIndex === null || !nextElement) {
            return;
        }

        activePointerId = event.pointerId;
        sourceIndex = nextIndex;
        sourceElement = nextElement;
        pointerStartPosition = {x: event.clientX, y: event.clientY};
        lastPointerPosition = {x: event.clientX, y: event.clientY};
        lastDragClientY = event.clientY;
        dragDirection = 0;

        ownerDocument.addEventListener("pointermove", handlePointerMove, true);
        ownerDocument.addEventListener("pointerup", handlePointerUp, true);
        ownerDocument.addEventListener("pointercancel", handlePointerCancel, true);
        event.preventDefault();
    }

    function startPointerDrag(event: PointerEvent) {
        if (sourceIndex === null || !sourceElement) {
            return;
        }

        draggedIndex = sourceIndex;
        originalItems = [...options.items];
        previewItems = [...options.items];
        lastDragClientY = event.clientY;
        dragDirection = 0;

        createDragPreview(sourceElement, event.clientX, event.clientY);
        hideDraggedElement(sourceElement);
        setDraggingCursor(true);
        setActiveItem(previewItems[sourceIndex]);
        dispatchZoneEvent("consider", previewItems, sourceIndex, "dragStarted");
    }

    function handlePointerMove(event: PointerEvent) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        event.preventDefault();

        if (draggedIndex === null) {
            const threshold = options.dragStartThreshold ?? 4;
            const distance = Math.hypot(event.clientX - pointerStartPosition.x, event.clientY - pointerStartPosition.y);
            if (distance < threshold) {
                return;
            }
            startPointerDrag(event);
        }

        if (draggedIndex === null) {
            return;
        }

        updateDragPreviewPosition(event.clientX, event.clientY);
        const comparisonY = getDragComparisonY(event.clientY);
        const insertionIndex = getInsertionIndex(comparisonY);
        const nextIndex = insertionIndex > draggedIndex ? insertionIndex - 1 : insertionIndex;

        if (nextIndex === draggedIndex) {
            return;
        }

        previewItems = reorder(previewItems, draggedIndex, nextIndex);
        draggedIndex = nextIndex;
        setActiveItem(previewItems[nextIndex]);
        dispatchZoneEvent("consider", previewItems, nextIndex, "draggedOverIndex");
    }

    function handlePointerUp(event: PointerEvent) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        if (draggedIndex !== null) {
            if (isPointerInsideZone(event.clientX, event.clientY)) {
                dispatchZoneEvent("finalize", previewItems, draggedIndex, "droppedIntoZone");
            }
            else {
                const currentDraggedIndex = draggedIndex;
                const originalIndex = getOriginalIndexForDraggedItem(currentDraggedIndex);
                dispatchZoneEvent("consider", [...originalItems], originalIndex, "droppedOutsideOfAny");
            }
        }

        resetDragState();
    }

    function handlePointerCancel(event: PointerEvent) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        if (draggedIndex !== null) {
            const currentDraggedIndex = draggedIndex;
            const originalIndex = getOriginalIndexForDraggedItem(currentDraggedIndex);
            dispatchZoneEvent("consider", [...originalItems], originalIndex, "droppedOutsideOfAny");
        }

        resetDragState();
    }

    syncChildren();
    node.addEventListener("pointerdown", handlePointerDown, true);

    return {
        update(newOptions) {
            options = newOptions;
            previewItems = [...newOptions.items];
            originalItems = [...newOptions.items];
            syncChildren();
        },
        destroy() {
            node.removeEventListener("pointerdown", handlePointerDown, true);
            detachPointerListeners();
            setDraggingCursor(false);
            destroyDragPreview();
            restoreDraggedElement();
            setActiveItem(undefined);
        }
    };
}

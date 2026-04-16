import { setContext, getContext } from 'svelte';

const DRAG_DROP_KEY = Symbol('drag-drop-context');

// WeakMap so actions can resolve context by walking the DOM — avoids calling
// getContext() inside actions (only valid during component init in Svelte 5).
const elementContextMap = new WeakMap<Element, InternalDragDropContext<any>>();

export type Zone<T> = {
    zoneId: string;
    group?: string;
    element: HTMLElement;
    getItems(): T[];
    isActive(): boolean;
};

export type ActiveDrag<T> = {
    item: T;
    sourceZoneId: string;
    currentZoneId: string;
    draggedIndex: number;
};

export type InternalDragDropContext<T> = {
    registerZone(zone: Zone<T>): void;
    deregisterZone(zoneId: string): void;
    getRegisteredZones(): Zone<T>[];
    getActiveDrag(): ActiveDrag<T> | null;
    setActiveDrag(drag: ActiveDrag<T> | null): void;
};

export type DragDropContext<T> = {
    getRegisteredZones(): Zone<T>[];
};

let idCounter = 0;
export function generateZoneId(): string {
    return `dnd-zone-${++idCounter}`;
}

export function createDragDropContext<T>(isolated = false): InternalDragDropContext<T> {
    const existing = isolated ? null : (getContext<InternalDragDropContext<T>>(DRAG_DROP_KEY) ?? null);
    if (existing) return existing;

    const zones = new Map<string, Zone<T>>();
    let activeDrag: ActiveDrag<T> | null = null;

    const ctx: InternalDragDropContext<T> = {
        registerZone(zone) { zones.set(zone.zoneId, zone); },
        deregisterZone(zoneId) { zones.delete(zoneId); },
        getRegisteredZones() { return [...zones.values()]; },
        getActiveDrag() { return activeDrag; },
        setActiveDrag(drag) { activeDrag = drag; }
    };

    setContext(DRAG_DROP_KEY, ctx);
    return ctx;
}

export function getExistingDragDropContext<T>(): InternalDragDropContext<T> | null {
    return getContext<InternalDragDropContext<T>>(DRAG_DROP_KEY) ?? null;
}

export function registerContextOnElement<T>(element: Element, ctx: InternalDragDropContext<T>): void {
    elementContextMap.set(element, ctx);
}

export function unregisterContextFromElement(element: Element): void {
    elementContextMap.delete(element);
}

export function resolveContextFromElement<T>(element: Element): InternalDragDropContext<T> | null {
    let el: Element | null = element.parentElement;
    while (el) {
        const ctx = elementContextMap.get(el);
        if (ctx) return ctx as InternalDragDropContext<T>;
        el = el.parentElement;
    }
    return null;
}

export function isValidTarget<T>(
    ctx: InternalDragDropContext<T>,
    sourceGroup: string | undefined,
    targetZone: Zone<T>,
    sourceZoneId: string
): boolean {
    if (targetZone.zoneId === sourceZoneId) return false;
    const targetGroup = targetZone.group;
    if (sourceGroup === undefined && targetGroup === undefined) return true;
    return sourceGroup === targetGroup;
}

export function findZoneContainingPointer<T>(
    zones: Zone<T>[],
    clientX: number,
    clientY: number
): Zone<T> | null {
    for (const zone of zones) {
        const rect = zone.element.getBoundingClientRect();
        if (
            clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top && clientY <= rect.bottom
        ) {
            return zone;
        }
    }
    return null;
}

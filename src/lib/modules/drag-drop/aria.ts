import type { DragDropTrigger } from './index.js';

const LIVE_REGION_ID = 'dnd-live-region';
let liveRegionRefCount = 0;
let liveRegionEl: HTMLElement | null = null;
let pendingAnnouncement: string | null = null;
let announceMicrotask = false;

function getOrCreateLiveRegion(doc: Document): HTMLElement {
    if (liveRegionEl) return liveRegionEl;
    const existing = doc.getElementById(LIVE_REGION_ID);
    if (existing) {
        liveRegionEl = existing as HTMLElement;
        return liveRegionEl;
    }
    const el = doc.createElement('div');
    el.id = LIVE_REGION_ID;
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-atomic', 'true');
    el.setAttribute('aria-relevant', 'additions text');
    el.style.cssText =
        'position:fixed;top:0;left:0;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap;border:0;';
    doc.body.appendChild(el);
    liveRegionEl = el;
    return el;
}

export function refLiveRegion(): void {
    liveRegionRefCount++;
}

export function unrefLiveRegion(): void {
    liveRegionRefCount = Math.max(0, liveRegionRefCount - 1);
    if (liveRegionRefCount === 0 && liveRegionEl) {
        liveRegionEl.remove();
        liveRegionEl = null;
    }
}

export function announce(doc: Document, message: string | null | undefined): void {
    if (!message) return;
    pendingAnnouncement = message;
    if (!announceMicrotask) {
        announceMicrotask = true;
        Promise.resolve().then(() => {
            announceMicrotask = false;
            if (pendingAnnouncement) {
                const el = getOrCreateLiveRegion(doc);
                el.textContent = '';
                // Force a reflow so the change is detected as an addition
                void el.offsetHeight;
                el.textContent = pendingAnnouncement;
                pendingAnnouncement = null;
            }
        });
    }
}

export type GetAnnouncementDetail<T> = {
    item: T;
    index: number;
    total: number;
    trigger: DragDropTrigger;
    zoneId: string;
    targetZoneId?: string;
    source: 'pointer' | 'keyboard' | 'touch';
};

export function defaultAnnouncement<T>(detail: GetAnnouncementDetail<T>): string {
    const n = detail.index + 1;
    const total = detail.total;
    switch (detail.trigger) {
        case 'dragStarted':
            if (detail.source === 'keyboard') {
                return `Picked up item at position ${n} of ${total}. Use arrow keys to move, Space to drop, Escape to cancel.`;
            }
            return `Picked up item at position ${n} of ${total}.`;
        case 'draggedOverIndex':
            return `Moved to position ${n} of ${total}.`;
        case 'droppedIntoZone':
            return `Dropped at position ${n} of ${total}.`;
        case 'droppedOutsideOfAny':
            return 'Drag cancelled. Item returned to its original position.';
        case 'removedFromZone':
            return 'Item moved to another list.';
    }
}

export function applyZoneRoles(node: HTMLElement, disableAria: boolean): void {
    if (!disableAria) {
        node.setAttribute('role', 'list');
    }
}

export function applyItemRole(item: HTMLElement, disableAria: boolean): void {
    if (!disableAria) {
        item.setAttribute('role', 'listitem');
    }
}

export function setAriaGrabbed(item: HTMLElement, grabbed: boolean, disableAria: boolean): void {
    if (disableAria) return;
    item.setAttribute('aria-grabbed', String(grabbed));
}

export function setAriaDropEffect(
    zone: HTMLElement,
    effect: 'move' | 'none',
    disableAria: boolean
): void {
    if (disableAria) return;
    zone.setAttribute('aria-dropeffect', effect);
}

export function setAriaDisabled(handle: HTMLElement, disabled: boolean, disableAria: boolean): void {
    if (disableAria) return;
    if (disabled) {
        handle.setAttribute('aria-disabled', 'true');
    } else {
        handle.removeAttribute('aria-disabled');
    }
}

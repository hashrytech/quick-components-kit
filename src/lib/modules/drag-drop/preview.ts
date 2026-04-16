export type PreviewOffset = { x: number; y: number };

export type PreviewOptions = {
    previewSelector?: string;
    renderPreview?: (item: unknown, sourceElement: HTMLElement) => HTMLElement | null | undefined;
    previewClass?: string;
};

export function createDragPreview(
    sourceElement: HTMLElement,
    clientX: number,
    clientY: number,
    item: unknown,
    options: PreviewOptions
): { element: HTMLElement; offset: PreviewOffset } {
    const rect = sourceElement.getBoundingClientRect();

    let previewEl: HTMLElement;

    if (options.renderPreview) {
        const custom = options.renderPreview(item, sourceElement);
        previewEl = custom ?? cloneElement(sourceElement, options.previewSelector);
    } else if (options.previewSelector) {
        const sub = sourceElement.querySelector<HTMLElement>(options.previewSelector);
        previewEl = sub ? (sub.cloneNode(true) as HTMLElement) : cloneElement(sourceElement, undefined);
    } else {
        previewEl = cloneElement(sourceElement, undefined);
    }

    previewEl.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    previewEl.setAttribute('aria-hidden', 'true');
    previewEl.style.position = 'fixed';
    previewEl.style.top = '0';
    previewEl.style.left = '0';
    previewEl.style.margin = '0';
    previewEl.style.width = `${rect.width}px`;
    previewEl.style.height = `${rect.height}px`;
    previewEl.style.pointerEvents = 'none';
    previewEl.style.zIndex = '2147483647';
    previewEl.style.opacity = '1';
    previewEl.style.willChange = 'transform';
    previewEl.style.boxSizing = 'border-box';
    previewEl.style.cursor = 'grabbing';

    if (options.previewClass) {
        previewEl.classList.add(options.previewClass);
    }

    const pointerX = clientX || rect.left + rect.width / 2;
    const pointerY = clientY || rect.top + rect.height / 2;
    const offset: PreviewOffset = {
        x: Math.min(rect.width, Math.max(0, pointerX - rect.left)),
        y: Math.min(rect.height, Math.max(0, pointerY - rect.top))
    };

    sourceElement.ownerDocument.body.appendChild(previewEl);
    positionPreview(previewEl, pointerX, pointerY, offset);

    return { element: previewEl, offset };
}

function cloneElement(source: HTMLElement, selector?: string): HTMLElement {
    if (selector) {
        const sub = source.querySelector<HTMLElement>(selector);
        if (sub) return sub.cloneNode(true) as HTMLElement;
    }
    return source.cloneNode(true) as HTMLElement;
}

export function positionPreview(
    previewEl: HTMLElement,
    clientX: number,
    clientY: number,
    offset: PreviewOffset
): void {
    const x = Math.round(clientX - offset.x);
    const y = Math.round(clientY - offset.y);
    previewEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

export function destroyPreview(previewEl: HTMLElement | null): void {
    previewEl?.remove();
}

export function hideDragSource(element: HTMLElement): { visibility: string; pointerEvents: string } {
    const saved = {
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents
    };
    element.style.visibility = 'hidden';
    element.style.pointerEvents = 'none';
    return saved;
}

export function restoreDragSource(
    element: HTMLElement,
    saved: { visibility: string; pointerEvents: string }
): void {
    element.style.visibility = saved.visibility;
    element.style.pointerEvents = saved.pointerEvents;
}

const CURSOR_STYLE_ID = 'dnd-cursor-style';
let cursorRefCount = 0;

export function acquireCursorStyle(doc: Document): void {
    cursorRefCount++;
    if (cursorRefCount > 1) return;
    let el = doc.getElementById(CURSOR_STYLE_ID) as HTMLStyleElement | null;
    if (!el) {
        el = doc.createElement('style');
        el.id = CURSOR_STYLE_ID;
        el.textContent = '.dnd-dragging,.dnd-dragging *{cursor:grabbing!important;}';
        doc.head.appendChild(el);
    }
}

export function releaseCursorStyle(doc: Document): void {
    cursorRefCount = Math.max(0, cursorRefCount - 1);
    if (cursorRefCount === 0) {
        doc.getElementById(CURSOR_STYLE_ID)?.remove();
    }
}

export function setDraggingCursor(
    doc: Document,
    active: boolean,
    savedRoot: { cursor: string; userSelect: string },
    savedBody: { cursor: string; userSelect: string }
): void {
    const root = doc.documentElement;
    const body = doc.body;

    root.classList.toggle('dnd-dragging', active);
    body?.classList.toggle('dnd-dragging', active);

    if (active) {
        root.style.setProperty('cursor', 'grabbing', 'important');
        body?.style.setProperty('cursor', 'grabbing', 'important');
        root.style.setProperty('user-select', 'none', 'important');
        body?.style.setProperty('user-select', 'none', 'important');
        return;
    }

    if (savedRoot.cursor) root.style.setProperty('cursor', savedRoot.cursor);
    else root.style.removeProperty('cursor');
    if (savedRoot.userSelect) root.style.setProperty('user-select', savedRoot.userSelect);
    else root.style.removeProperty('user-select');

    if (body) {
        if (savedBody.cursor) body.style.setProperty('cursor', savedBody.cursor);
        else body.style.removeProperty('cursor');
        if (savedBody.userSelect) body.style.setProperty('user-select', savedBody.userSelect);
        else body.style.removeProperty('user-select');
    }
}

export function getScrollableAncestor(el: Element): Element | null {
    let cur: Element | null = el;
    while (cur) {
        const { overflow, overflowY, overflowX } = getComputedStyle(cur);
        if (/auto|scroll/.test(overflow + overflowY + overflowX)) return cur;
        cur = cur.parentElement;
    }
    return null;
}

export function tryAutoScroll(container: Element, clientX: number, clientY: number): boolean {
    const rect = container.getBoundingClientRect();
    const EDGE = 50;
    const SPEED = 8;
    let dx = 0;
    let dy = 0;
    if (clientY < rect.top + EDGE) dy = -SPEED;
    else if (clientY > rect.bottom - EDGE) dy = SPEED;
    if (clientX < rect.left + EDGE) dx = -SPEED;
    else if (clientX > rect.right - EDGE) dx = SPEED;
    if (dx !== 0 || dy !== 0) {
        container.scrollBy(dx, dy);
        return true;
    }
    return false;
}

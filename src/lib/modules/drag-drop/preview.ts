/** The pixel offset of the pointer from the top-left corner of the drag preview. */
export type PreviewOffset = { x: number; y: number };

/** The dimensions of the drag preview element. */
export type PreviewSize = { width: number; height: number };

/**
 * Options that control how the drag preview element is created.
 *
 * Priority order when multiple options are provided:
 * 1. `renderPreview` — fully custom element (highest priority)
 * 2. `previewSelector` — clone a child matching the selector
 * 3. Clone the entire source element (default fallback)
 */
export type PreviewOptions = {
  /**
   * CSS selector used to find a child element inside the drag source to clone as
   * the preview. Ignored if `renderPreview` is provided.
   *
   * @example '.drag-handle'
   */
  previewSelector?: string;
  /**
   * Factory that returns a fully custom preview element. Return `null` or `undefined`
   * to fall back to the `previewSelector` / clone behaviour.
   *
   * @param item - The data item being dragged.
   * @param sourceElement - The DOM element the drag started on.
   */
  renderPreview?: (item: unknown, sourceElement: HTMLElement) => HTMLElement | null | undefined;
  /**
   * One or more CSS class names to add to the preview element after it is created.
   * Useful for applying a custom visual style to the ghost.
   */
  previewClass?: string;
};

/**
 * Create a drag-preview element and attach it to `document.body`.
 *
 * The preview is a styled, fixed-position clone of the source element (or a custom
 * element returned by `renderPreview`). All `id` attributes are stripped to avoid
 * duplicate IDs in the document and `aria-hidden="true"` is set so screen readers
 * ignore the ghost.
 *
 * @param sourceElement - The element the drag started on.
 * @param clientX - Pointer X position at drag start. `undefined` / `null` falls back
 *   to the horizontal centre of the source element.
 * @param clientY - Pointer Y position at drag start. `undefined` / `null` falls back
 *   to the vertical centre of the source element.
 * @param item - The data item associated with the dragged element.
 * @param options - Preview customisation options.
 * @returns The created preview element, its pointer offset, and its dimensions.
 */
export function createDragPreview(
  sourceElement: HTMLElement,
  clientX: number | null | undefined,
  clientY: number | null | undefined,
  item: unknown,
  options: PreviewOptions
): { element: HTMLElement; offset: PreviewOffset; size: PreviewSize } {
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

  // Use ?? instead of || so that a legitimate clientX/Y of 0 (pointer at the very
  // left or top edge of the viewport) is not treated as "no position provided".
  const pointerX = clientX ?? rect.left + rect.width / 2;
  const pointerY = clientY ?? rect.top + rect.height / 2;
  const offset: PreviewOffset = {
    x: Math.min(rect.width, Math.max(0, pointerX - rect.left)),
    y: Math.min(rect.height, Math.max(0, pointerY - rect.top)),
  };
  const size: PreviewSize = { width: rect.width, height: rect.height };

  sourceElement.ownerDocument.body.appendChild(previewEl);
  positionPreview(previewEl, pointerX, pointerY, offset);

  return { element: previewEl, offset, size };
}

function cloneElement(source: HTMLElement, selector?: string): HTMLElement {
  if (selector) {
    const sub = source.querySelector<HTMLElement>(selector);
    if (sub) return sub.cloneNode(true) as HTMLElement;
  }
  return source.cloneNode(true) as HTMLElement;
}

/**
 * Move the preview element to follow the pointer using `transform: translate3d`.
 *
 * @param previewEl - The preview element to reposition.
 * @param clientX - Current pointer X (viewport coordinates).
 * @param clientY - Current pointer Y (viewport coordinates).
 * @param offset - The pointer offset returned by `createDragPreview`.
 */
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

function clampToRange(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Clamp the pointer position so the preview element stays fully within `bounds`.
 *
 * @param clientX - Raw pointer X.
 * @param clientY - Raw pointer Y.
 * @param offset - Pointer offset within the preview (from `createDragPreview`).
 * @param size - Preview dimensions (from `createDragPreview`).
 * @param bounds - The bounding rect to constrain within (e.g. a drop zone's rect).
 * @returns Adjusted `clientX` / `clientY` that keep the preview inside `bounds`.
 */
export function constrainPreviewPointer(
  clientX: number,
  clientY: number,
  offset: PreviewOffset,
  size: PreviewSize,
  bounds: DOMRect
): { clientX: number; clientY: number } {
  const previewX = clampToRange(clientX - offset.x, bounds.left, bounds.right - size.width);
  const previewY = clampToRange(clientY - offset.y, bounds.top, bounds.bottom - size.height);
  return { clientX: previewX + offset.x, clientY: previewY + offset.y };
}

/**
 * Remove the preview element from the DOM.
 * Safe to call with `null` — does nothing in that case.
 */
export function destroyPreview(previewEl: HTMLElement | null): void {
  previewEl?.remove();
}

/**
 * Hide the source element during a drag so only the preview is visible.
 * @returns The original `visibility` and `pointerEvents` values for later restoration.
 */
export function hideDragSource(element: HTMLElement): { visibility: string; pointerEvents: string } {
  const saved = {
    visibility: element.style.visibility,
    pointerEvents: element.style.pointerEvents,
  };
  element.style.visibility = 'hidden';
  element.style.pointerEvents = 'none';
  return saved;
}

/**
 * Restore a source element's visibility and pointer-events after a drag ends.
 *
 * @param element - The element that was hidden by `hideDragSource`.
 * @param saved - The saved styles returned by `hideDragSource`.
 */
export function restoreDragSource(
  element: HTMLElement,
  saved: { visibility: string; pointerEvents: string }
): void {
  element.style.visibility = saved.visibility;
  element.style.pointerEvents = saved.pointerEvents;
}

const CURSOR_STYLE_ID = 'dnd-cursor-style';
let cursorRefCount = 0;

/**
 * Inject a `<style>` element that forces `cursor: grabbing` on all elements
 * while dragging. Reference-counted — safe to call from multiple concurrent drags.
 *
 * @param doc - The `Document` to inject the style into.
 */
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

/**
 * Decrement the cursor-style reference count and remove the injected `<style>`
 * element when no drags remain active.
 *
 * @param doc - The `Document` the style was injected into.
 */
export function releaseCursorStyle(doc: Document): void {
  cursorRefCount = Math.max(0, cursorRefCount - 1);
  if (cursorRefCount === 0) {
    doc.getElementById(CURSOR_STYLE_ID)?.remove();
  }
}

/**
 * Toggle the `dnd-dragging` CSS class and `cursor: grabbing` / `user-select: none`
 * on `<html>` and `<body>` to lock the cursor appearance during a drag.
 *
 * @param doc - The target document.
 * @param active - `true` to apply the dragging state, `false` to restore.
 * @param savedRoot - Saved `cursor` and `userSelect` for `<html>`, from a prior call with `active: true`.
 * @param savedBody - Saved `cursor` and `userSelect` for `<body>`, from a prior call with `active: true`.
 */
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

/**
 * Walk up the DOM from `el` and return the first ancestor (inclusive) that has
 * `overflow: auto` or `overflow: scroll` on any axis. Returns `null` if none found.
 *
 * @param el - The element to start searching from.
 */
export function getScrollableAncestor(el: Element): Element | null {
  let cur: Element | null = el;
  while (cur) {
    const { overflow, overflowY, overflowX } = getComputedStyle(cur);
    if (/auto|scroll/.test(overflow + overflowY + overflowX)) return cur;
    cur = cur.parentElement;
  }
  return null;
}

/**
 * Attempt to auto-scroll `container` when the pointer is within `EDGE` pixels of
 * any edge. Returns `true` if scrolling was applied (useful for scheduling the next
 * animation frame).
 *
 * @param container - The scrollable element to scroll.
 * @param clientX - Current pointer X (viewport coordinates).
 * @param clientY - Current pointer Y (viewport coordinates).
 */
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

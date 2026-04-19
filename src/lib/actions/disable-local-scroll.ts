/**
 * @action disableLocalScroll
 *
 * Svelte action that disables scrolling on a specific element without affecting the
 * rest of the page layout. Applies `overflow-y: hidden` and `overscroll-behavior: contain`
 * directly to the element's inline style, restoring the original values on destroy.
 *
 * Pair with `scrollbar-gutter: stable` (or Tailwind's `[scrollbar-gutter:stable]`) on
 * the element so the layout does not shift when the scrollbar thumb disappears.
 *
 * Reactive: update the boolean parameter to toggle without remounting.
 *
 * @param node - The scroll container to lock.
 * @param enabled - Whether to disable scroll immediately. Default: `true`.
 *
 * @example
 * ```svelte
 * <!-- Lock a panel's scroll while a drag is in progress -->
 * <div
 *   class="overflow-y-auto [scrollbar-gutter:stable]"
 *   use:disableLocalScroll={isDragging}
 * >
 *   ...
 * </div>
 *
 * <!-- Always locked (e.g. drawer content area that manages its own scroll child) -->
 * <div use:disableLocalScroll>
 *   <div class="overflow-y-auto">scrollable child</div>
 * </div>
 * ```
 */
export function disableLocalScroll(node: HTMLElement, enabled = true) {
  const originalOverflowY = node.style.overflowY;
  const originalOverscrollBehavior = node.style.overscrollBehavior;

  function applyLock() {
    node.style.overflowY = 'hidden';
    node.style.overscrollBehavior = 'contain';
  }

  function removeLock() {
    node.style.overflowY = originalOverflowY;
    node.style.overscrollBehavior = originalOverscrollBehavior;
  }

  if (enabled) applyLock();

  return {
    update(newValue: boolean) {
      if (newValue === enabled) return;
      enabled = newValue;
      if (enabled) applyLock();
      else removeLock();
    },
    destroy() {
      if (enabled) removeLock();
    }
  };
}

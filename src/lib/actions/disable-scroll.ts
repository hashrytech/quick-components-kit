/**
 * @action disableScroll
 *
 * Svelte action that disables page scrolling by applying `position: fixed` to `<body>`
 * and preserving the current scroll offset so the page does not jump when the lock
 * is applied or removed.
 *
 * Prefer this over `lockScroll` when you need to prevent the layout shift caused by a
 * disappearing scrollbar (e.g. modals, full-screen drawers). The scroll position is
 * captured at the moment the lock is applied, not at mount time, so it is safe to mount
 * the action with `enabled = false` and toggle it later.
 *
 * Reactive: update the boolean parameter to toggle the lock without remounting.
 *
 * @param node - The element the action is bound to (required by Svelte, otherwise unused).
 * @param enabled - Whether to apply the lock immediately. Default: `true`.
 *
 * @example
 * ```svelte
 * <!-- Always locked while mounted -->
 * <div use:disableScroll />
 *
 * <!-- Reactively toggle — safe to start disabled -->
 * <script>
 *   let modalOpen = $state(false);
 * </script>
 * <div use:disableScroll={modalOpen} />
 * ```
 */
export function disableScroll(node: HTMLElement, enabled = true) {
  const originalBodyPosition = document.body.style.position;
  const originalBodyWidth = document.body.style.width;
  const originalTop = document.body.style.top;
  const originalOverflow = document.documentElement.style.overflowY;

  const hasVerticalScrollbar =
    document.documentElement.scrollHeight > document.documentElement.clientHeight;

  // Captured at lock time inside applyLock, not at mount — avoids locking to a
  // stale position when enabled starts false and toggles true after user has scrolled.
  let scrollTop = 0;

  function applyLock() {
    scrollTop = window.scrollY;
    document.body.style.top = `-${scrollTop}px`;
    if (hasVerticalScrollbar) {
      document.documentElement.style.overflowY = 'scroll';
    }
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  function removeLock() {
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.body.style.position = originalBodyPosition;
    document.body.style.width = originalBodyWidth;
    document.body.style.top = originalTop;
    document.documentElement.style.overflowY = originalOverflow;
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollTop);

    // Restore scroll behavior after the frame so scrollTo doesn't animate
    requestAnimationFrame(() => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    });
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

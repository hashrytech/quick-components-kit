import { browser } from '$app/environment';

/**
 * @action lockScroll
 *
 * Svelte action that locks all page scrolling by intercepting scroll events and
 * scroll-related keys. Prevents mouse wheel, touch, arrow key, and spacebar scrolling,
 * and pins the window at its current scroll position.
 *
 * Unlike `disableScroll`, this does **not** alter `document.body` layout — it works
 * purely through event interception. Prefer `disableScroll` when you need to prevent
 * the layout-shift caused by a disappearing scrollbar. Use `lockScroll` when you need
 * a lightweight, layout-neutral lock (e.g. mobile menus, non-modal overlays).
 *
 * Reactive: pass a boolean parameter and update it to toggle the lock without remounting.
 *
 * @param node - The element the action is bound to (required by Svelte, otherwise unused).
 * @param enabled - Whether to apply the lock immediately. Default: `true`.
 *
 * @example
 * ```svelte
 * <!-- Always locked while mounted -->
 * <div use:lockScroll />
 *
 * <!-- Reactively toggle -->
 * <script>
 *   let menuOpen = $state(false);
 * </script>
 * <div use:lockScroll={menuOpen} />
 * ```
 */
export function lockScroll(node: HTMLElement, enabled = true) {
  let scrollTop = 0;
  let scrollLeft = 0;

  function preventDefault(e: Event) {
    e.preventDefault();
  }

  function preventDefaultForScrollKeys(e: KeyboardEvent) {
    const keys = [' ', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
    if (keys.includes(e.key)) e.preventDefault();
  }

  function handleScroll() {
    window.scrollTo(scrollLeft, scrollTop);
  }

  function applyLock() {
    if (!browser) return;
    // Capture position at lock time, not at mount time
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    window.addEventListener('keydown', preventDefaultForScrollKeys);
    // Use addEventListener instead of window.onscroll to avoid clobbering other handlers
    window.addEventListener('scroll', handleScroll);
  }

  function removeLock() {
    if (!browser) return;
    window.removeEventListener('wheel', preventDefault);
    window.removeEventListener('touchmove', preventDefault);
    window.removeEventListener('keydown', preventDefaultForScrollKeys);
    window.removeEventListener('scroll', handleScroll);
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

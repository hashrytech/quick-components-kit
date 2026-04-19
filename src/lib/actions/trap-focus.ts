export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
];

/**
 * @action trapFocus
 *
 * Svelte action that traps keyboard focus within a DOM node. Intended for modals,
 * dialogs, and drawers to ensure keyboard users cannot Tab out of the overlay.
 *
 * Behaviour:
 * - Focuses the first focusable element inside the node on mount.
 * - Wraps Tab and Shift+Tab at the boundaries of the focusable set.
 * - Skips elements that are disabled, hidden, have `aria-hidden`, or are not
 *   visible via CSS (`display: none`, `visibility: hidden`, `opacity: 0`).
 * - `aria-hidden` traversal stops at the node boundary — ancestors outside the
 *   node do not affect the focusable set inside it.
 * - Caches the focusable set and updates it automatically via `MutationObserver`
 *   when the DOM inside the node changes, avoiding a full DOM query on every Tab.
 * - Restores focus to the previously focused element when destroyed.
 *
 * @param node - The HTMLElement to trap focus within.
 *
 * @example
 * ```svelte
 * <!-- Basic modal focus trap -->
 * <div role="dialog" aria-modal="true" use:trapFocus>
 *   <button>First</button>
 *   <input type="text" />
 *   <button>Last</button>
 * </div>
 *
 * <!-- Combined with onKeydown for Escape-to-close -->
 * <div
 *   role="dialog"
 *   aria-modal="true"
 *   use:trapFocus
 *   use:onKeydown={{ key: 'Escape', callback: close }}
 * >
 *   ...
 * </div>
 * ```
 */
export function trapFocus(node: HTMLElement) {
  const previous = document.activeElement as HTMLElement | null;

  let cachedFocusable: HTMLElement[] = [];

  function computeFocusable(): HTMLElement[] {
    return Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS.join(','))
    ).filter((el) => {
      if (el.hasAttribute('disabled')) return false;
      if (el.hidden) return false;

      // Only walk up to node — ancestors above the dialog are irrelevant
      let current: HTMLElement | null = el;
      while (current && current !== node) {
        if (current.getAttribute('aria-hidden') === 'true') return false;
        current = current.parentElement;
      }

      const style = getComputedStyle(el);
      if (
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        style.opacity === '0'
      )
        return false;

      return true;
    });
  }

  // Rebuild the cache whenever the node's subtree changes so handleKeydown
  // never has to re-query the DOM on every Tab press
  const observer = new MutationObserver(() => {
    cachedFocusable = computeFocusable();
  });

  observer.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled', 'aria-hidden', 'hidden', 'tabindex'],
  });

  cachedFocusable = computeFocusable();

  function handleKeydown(event: KeyboardEvent) {
    if (event.key !== 'Tab') return;

    const elements = cachedFocusable;
    if (elements.length === 0) return;

    const first = elements[0];
    const last = elements[elements.length - 1];
    const active = document.activeElement as HTMLElement;

    if (event.shiftKey) {
      if (active === first || !elements.includes(active)) {
        last.focus();
        event.preventDefault();
      }
    } else {
      if (active === last || !elements.includes(active)) {
        first.focus();
        event.preventDefault();
      }
    }
  }

  cachedFocusable[0]?.focus();
  node.addEventListener('keydown', handleKeydown);

  return {
    destroy() {
      observer.disconnect();
      node.removeEventListener('keydown', handleKeydown);
      previous?.focus();
    }
  };
}

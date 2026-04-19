/**
 * @action scrollTo
 *
 * Svelte action that smoothly scrolls to a target when the node is clicked.
 * Calls `event.preventDefault()` so it is safe to use on anchor elements.
 *
 * The target can be updated reactively without remounting — the next click will
 * use the latest value.
 *
 * @param node - The clickable element (button, anchor, div, etc.).
 * @param target - Where to scroll on click:
 *   - `undefined` — scrolls to the top of the page.
 *   - `number` — scrolls to that Y pixel position.
 *   - `string` — treated as a DOM element ID; calls `scrollIntoView` on the found element.
 *   - `HTMLElement` — calls `scrollIntoView` directly on that element.
 *
 * @example
 * ```svelte
 * <!-- Scroll to top -->
 * <button use:scrollTo>Back to top</button>
 *
 * <!-- Scroll to a Y position -->
 * <button use:scrollTo={500}>Jump to 500px</button>
 *
 * <!-- Scroll to an element by ID -->
 * <button use:scrollTo="section-2">Go to Section 2</button>
 *
 * <!-- Scroll to a bound element reference -->
 * <script>
 *   let section: HTMLElement;
 * </script>
 * <button use:scrollTo={section}>Go to section</button>
 * <section bind:this={section}>...</section>
 *
 * <!-- Reactive target -->
 * <button use:scrollTo={activeSection}>Jump to active</button>
 * ```
 */
export function scrollTo(node: HTMLElement, target?: number | string | HTMLElement) {
  function handleClick(e: MouseEvent) {
    e.preventDefault();

    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (typeof target === 'string') {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  node.addEventListener('click', handleClick);

  return {
    update(newTarget?: number | string | HTMLElement) {
      target = newTarget;
    },
    destroy() {
      node.removeEventListener('click', handleClick);
    }
  };
}

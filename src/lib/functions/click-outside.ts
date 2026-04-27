export type ClickOutsideEvent = MouseEvent | TouchEvent | PointerEvent;

/**
 * Options for the `clickOutside` Svelte action.
 */
export interface ClickOutsideOptions {
  /**
   * Called when a click (or equivalent pointer/touch event) is detected outside the
   * node and outside every element listed in `ignoreIds`.
   */
  callback: (event: ClickOutsideEvent) => void;
  /**
   * Array of element IDs to treat as part of the node. Clicks on these elements (or
   * any of their descendants) will not trigger `callback`.
   *
   * Useful for trigger buttons that open a panel — without this the button click that
   * opens the panel would immediately close it again.
   *
   * @example ['menu-trigger', 'dropdown-button']
   */
  ignoreIds?: string[];
  /**
   * Whether the action is active. Set to `false` to temporarily disable without
   * destroying and recreating the action. Default: `true`.
   */
  enabled?: boolean;
}

/**
 * @action clickOutside
 *
 * Svelte action (also usable as a plain function) that calls `callback` whenever a
 * click, touch, or pointer event is detected outside the target `node`.
 *
 * Uses the capture phase so the listener fires before inner handlers, making it
 * reliable even when inner elements call `stopPropagation`.
 *
 * Reactive: call `update()` to swap options without re-mounting.
 *
 * @param node - The element to treat as the "inside" boundary.
 * @param options - See `ClickOutsideOptions`.
 * @returns A Svelte action object with `update` and `destroy` methods.
 *
 * @example
 * ```svelte
 * <script>
 *   import { clickOutside } from '$lib/functions/click-outside';
 *   let open = $state(false);
 * </script>
 *
 * <!-- Basic usage -->
 * <div use:clickOutside={{ callback: () => (open = false) }}>
 *   ...
 * </div>
 *
 * <!-- Ignore a trigger button so clicking it doesn't immediately close the panel -->
 * <button id="panel-trigger" onclick={() => (open = true)}>Open</button>
 * <div use:clickOutside={{ callback: () => (open = false), ignoreIds: ['panel-trigger'] }}>
 *   ...
 * </div>
 *
 * <!-- Conditionally active -->
 * <div use:clickOutside={{ callback: close, enabled: open }}>
 *   ...
 * </div>
 * ```
 */
export function clickOutside(
  node: HTMLElement,
  options: ClickOutsideOptions
): { update(options: ClickOutsideOptions): void; destroy(): void } {
  let { callback, ignoreIds = [], enabled = true } = options;

  // Track whether the pointer went down inside the node. If so, a subsequent
  // click event that lands outside (due to a drag) should not close the panel.
  let mousedownInsideNode = false;

  const handleMousedown = (event: MouseEvent) => {
    mousedownInsideNode = event.target instanceof HTMLElement && node.contains(event.target);
  };

  const handleClick = (event: ClickOutsideEvent) => {
    if (!enabled) return;

    // Drag started inside the node — not a genuine outside click.
    if (mousedownInsideNode) return;

    // Guard against non-HTMLElement targets (SVG elements, text nodes, ShadowRoot)
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    // Click inside the node → ignore
    if (node.contains(target)) return;

    // Click on an ignored element or one of its ancestors → ignore
    if (ignoreIds.length > 0) {
      let el: HTMLElement | null = target;
      while (el) {
        if (el.id && ignoreIds.includes(el.id)) return;
        el = el.parentElement;
      }
    }

    callback(event);
  };

  document.addEventListener('mousedown', handleMousedown, true);
  document.addEventListener('click', handleClick, true);

  return {
    update(newOptions: ClickOutsideOptions) {
      ({ callback, ignoreIds = [], enabled = true } = newOptions);
    },
    destroy() {
      document.removeEventListener('mousedown', handleMousedown, true);
      document.removeEventListener('click', handleClick, true);
    },
  };
}

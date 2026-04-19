import { browser } from '$app/environment';

/**
 * Options for the `portalAction` action.
 */
export type PortalOptions = {
  /** The DOM node to portal into. Defaults to `document.body`. */
  target?: HTMLElement;
  /**
   * If `true` (default), the node is appended to the **end** of the target.
   * If `false`, the node is prepended to the **beginning** of the target.
   */
  append?: boolean;
};

/**
 * @action portalAction
 *
 * Svelte action that moves an element into a different part of the DOM at runtime.
 * Useful for rendering modals, tooltips, and dropdowns outside their natural DOM
 * position so they are not clipped by `overflow: hidden` ancestors or stacking
 * context issues.
 *
 * The node is moved on mount and removed from the target on destroy. The action
 * is SSR-safe — it is a no-op when `browser` is `false`.
 *
 * @param node - The HTML element to portal.
 * @param options - Optional configuration (see `PortalOptions`).
 *
 * @example
 * ```svelte
 * <!-- Portal to document.body (default) -->
 * <div use:portalAction>Modal content</div>
 *
 * <!-- Portal to a specific container -->
 * <div use:portalAction={{ target: document.getElementById('overlay-root') }}>
 *   Tooltip content
 * </div>
 *
 * <!-- Prepend instead of append -->
 * <div use:portalAction={{ append: false }}>
 *   Inserted at the top of body
 * </div>
 * ```
 */
export function portalAction(
  node: HTMLElement,
  { target = browser ? document.body : undefined, append = true }: PortalOptions = {}
) {
  if (append) {
    target?.appendChild(node);
  } else {
    target?.prepend(node);
  }

  return {
    destroy() {
      if (target?.contains(node)) {
        target.removeChild(node);
      }
    }
  };
}

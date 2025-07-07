/**
 * Svelte action to "portal" an element into a different part of the DOM.
 *
 * Useful for rendering components (e.g. modals, tooltips, dropdowns) outside of their natural DOM position,
 * such as appending them to `document.body` or a dedicated overlay container.
 *
 * Supports optional `prepend` behavior to insert at the top of the target.
 *
 * @example
 * ```svelte
 * <div use:portal>Portaled content</div>
 * ```
 *
 * @example With options:
 * ```svelte
 * <div use:portal={{ target: document.getElementById('modal-root'), prepend: true }}>
 *   Portaled to #modal-root at the top
 * </div>
 * ```
 *
 * @param node - The HTML element to be portaled.
 * @param options - Optional config:
 *   - `target`: The DOM node to portal into (defaults to `document.body`)
 *   - `prepend`: Whether to insert at the beginning instead of appending (default: true)
 */
import { browser } from '$app/environment';

export type PortalOptions = {
	target?: HTMLElement;
	prepend?: boolean;
};

export function portalAction(node: HTMLElement, { target = browser ? document.body : undefined, prepend = true }: PortalOptions = {}) {
	if (prepend) {
		target?.prepend(node);
	} else {
		target?.appendChild(node);
	}

	return {
		destroy() {
			if (target?.contains(node)) {
				target?.removeChild(node);
			}
		}
	};
}

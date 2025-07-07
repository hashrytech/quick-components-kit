/**
 * @action stopInteraction
 *
 * A flexible Svelte action that prevents event propagation and/or default browser behavior
 * for specified events using the capture phase. Useful for modals, drawers, popups, or any
 * element where you want to intercept user interaction early in the event flow.
 *
 * @param node - The target HTML element to attach event listeners to.
 * @param options - An optional object to configure the behavior.
 *   - `stop` (default: `true`) — Calls `event.stopPropagation()` to prevent bubbling.
 *   - `prevent` (default: `false`) — Calls `event.preventDefault()` to cancel default behavior.
 *   - `events` (default: `['click', 'mousedown', 'mouseup', 'touchstart']`) — DOM event types to intercept.
 *
 * @example
 * ```svelte
 * <div use:stopInteraction />
 * ```
 *
 * @example
 * ```svelte
 * <div use:stopInteraction={{ prevent: true }} />
 * ```
 *
 * @example
 * ```svelte
 * <div use:stopInteraction={{ stop: true, prevent: true, events: ['click', 'touchstart'] }} />
 * ```
 */

export type StopInteractionOptions = {
	stop?: boolean;
	prevent?: boolean;
	events?: string[];
};

export function stopInteraction(node: HTMLElement, options: StopInteractionOptions = { stop: true, prevent: false }) {
	const { stop = true, prevent = false, events = ['click'] } = options;

	const cleanups = events.map((event) => {
		const handler = (e: Event) => {
			if (stop) e.stopPropagation();
			if (prevent) e.preventDefault();
		};
		node.addEventListener(event, handler, true); // capture
		return () => node.removeEventListener(event, handler, true);
	});

	return {
		destroy() {
			cleanups.forEach((fn) => fn());
		}
	};
}

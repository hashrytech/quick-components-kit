/**
 * Svelte action to scroll smoothly to the top, a specific Y position, or a DOM element on click.
 * 
 * @param node - The element the action is applied to
 * @param target - Can be:
 *   - `undefined` → scroll to top
 *   - `number` → scroll to Y position
 *   - `string` → interpreted as element ID to scroll to
 *   - `HTMLElement` → scroll directly to that element
 */
export function scrollTo(node: HTMLElement,	target?: number | string | HTMLElement) {
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
			// Default: scroll to top
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

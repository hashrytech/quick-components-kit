/**
 * Svelte action to lock all page scrolling by intercepting scroll events and keys.
 * It prevents:
 *   - Mouse wheel scrolling
 *   - Touch-based scrolling
 *   - Arrow key and spacebar scrolling
 *   - Scroll position changes via `window.onscroll`
 * 
 * This is useful for modals or mobile menus where background scrolling should be disabled.
 *
 * @param node - The element the action is applied to (typically unused, but required by Svelte).
 * @param enabled - Whether scroll locking should be applied immediately (default: true).
 */
export function lockScroll(node: HTMLElement, enabled = true) {
	const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

	// Prevent all scrolling interaction
	function preventDefault(e: Event) {
		e.preventDefault();
	}

	function preventDefaultForScrollKeys(e: KeyboardEvent) {
		const keys = [' ', 'ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'];
		if (keys.includes(e.key)) {
			e.preventDefault();
		}
	}

	// Attach scroll-lock event listeners if enabled
	if (node && enabled) {
		window.addEventListener('wheel', preventDefault, { passive: false });
		window.addEventListener('touchmove', preventDefault, { passive: false });
		window.addEventListener('keydown', preventDefaultForScrollKeys);
		window.onscroll = () => window.scrollTo(scrollLeft, scrollTop);
	}

	return {
		// Svelte action cleanup
		destroy() {
			if (enabled) {
				window.removeEventListener('wheel', preventDefault);
				window.removeEventListener('touchmove', preventDefault);
				window.removeEventListener('keydown', preventDefaultForScrollKeys);
				window.onscroll = null;
			}
		}
	};
}

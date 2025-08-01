/**
 * Svelte action to disable page scroll (commonly used for modals, drawers, or mobile menus).
 *
 * It locks the scroll position by applying `position: fixed` to the `<body>` and
 * preserving the current scroll offset. This approach prevents visual jumps and maintains scroll state.
 *
 * @param node - The element the action is bound to (required for Svelte actions, though unused here).
 * @param enabled - Whether disable scroll should be enabled immediately (default: true).
 */
export function disableScroll(node: HTMLElement, enabled = true) {
	const scrollTop = window.scrollY;
	const originalBodyPosition = document.body.style.position;
	const originalBodyWidth = document.body.style.width;
	const originalTop = document.body.style.top;
	const originalOverflow = document.documentElement.style.overflowY;

	const hasVerticalScrollbar = document.documentElement.scrollHeight > document.documentElement.clientHeight;

	function applyLock() {
		document.body.style.top = `-${scrollTop}px`;
		if (hasVerticalScrollbar) {
			document.documentElement.style.overflowY = 'scroll'; // ensure layout doesn't shift
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

		// Restore scroll behavior without causing a jump
		requestAnimationFrame(() => {
			document.documentElement.style.scrollBehavior = originalScrollBehavior;
		});
	}

	if (node && enabled) applyLock();

	return {
		update(newValue: boolean) {
			if (enabled) {
				if (newValue) applyLock();
				else removeLock();
			}
		},
		destroy() {
			if (enabled) {
				removeLock();
			}
		}
	};
}

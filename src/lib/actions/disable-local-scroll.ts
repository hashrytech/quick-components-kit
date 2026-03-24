/**
 * Svelte action to disable scrolling on a specific element without changing its layout.
 *
 * Pair this with `scrollbar-gutter: stable` on the element so the scrollbar gutter
 * remains reserved when the thumb disappears.
 *
 * @param node - Scroll container to lock.
 * @param enabled - Whether local scroll should be disabled immediately.
 */
export function disableLocalScroll(node: HTMLElement, enabled = true) {
	const originalOverflowY = node.style.overflowY;
	const originalOverscrollBehavior = node.style.overscrollBehavior;

	function applyLock() {
		node.style.overflowY = 'hidden';
		node.style.overscrollBehavior = 'contain';
	}

	function removeLock() {
		node.style.overflowY = originalOverflowY;
		node.style.overscrollBehavior = originalOverscrollBehavior;
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
			if (enabled) {
				removeLock();
			}
		}
	};
}

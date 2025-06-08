/**
 * Svelte action to disable page scroll while preserving scrollbar to avoid layout shift.
 * Now supports toggling scroll lock on update.
 */
export function disableScroll(node: HTMLElement, disableBodyScroll = true) {
	const scrollTop = window.scrollY;
	const originalBodyPosition = document.body.style.position;
	const originalBodyWidth = document.body.style.width;
	const originalTop = document.body.style.top;
	const originalOverflow = document.documentElement.style.overflowY;

	function applyLock() {
		document.body.style.top = `-${scrollTop}px`;
		document.documentElement.style.overflowY = 'scroll';
		document.body.style.position = 'fixed';
		document.body.style.width = '100%';
	}

	function removeLock() {
		document.body.style.position = originalBodyPosition;
		document.body.style.width = originalBodyWidth;
		document.body.style.top = originalTop;
		document.documentElement.style.overflowY = originalOverflow;
		window.scrollTo(0, scrollTop);
	}

	if (node &&disableBodyScroll) applyLock();

	return {
		update(newValue: boolean) {
			if (newValue) applyLock();
			else removeLock();
		},
		destroy() {
			removeLock();
		}
	};
}

export type KeyHandler = {
	key: string;
	callback: (event: KeyboardEvent) => void;
};

/**
 * Action to call a function callback when a specific key is pressed.
 */
export function onKeydown(node: HTMLElement, { key, callback }: KeyHandler) {
    
	if (typeof window === 'undefined' || !node) return;

	const handle = (event: KeyboardEvent) => {
		if (event.key === key) {
			callback(event);
		}
	};

	window.addEventListener('keydown', handle);

	return {
		update(newParams: KeyHandler) {
			window.removeEventListener('keydown', handle);
			key = newParams.key;
			callback = newParams.callback;
			window.addEventListener('keydown', handle);
		},
		destroy() {
			window.removeEventListener('keydown', handle);
		}
	};
}

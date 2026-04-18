export type KeyHandler = {
	key: string;
	callback: (event: KeyboardEvent) => void;
};

/**
 * Action to call a function callback when a specific key is pressed.
 */
export function onKeydown(node: HTMLElement, { key, callback }: KeyHandler) {

	if (!node) return;

	const handle = (event: KeyboardEvent) => {
		if (event.key === key && !event.defaultPrevented) {
			callback(event);
		}
	};

	node.addEventListener('keydown', handle);

	return {
		update(newParams: KeyHandler) {
			node.removeEventListener('keydown', handle);
			key = newParams.key;
			callback = newParams.callback;
			node.addEventListener('keydown', handle);
		},
		destroy() {
			node.removeEventListener('keydown', handle);
		}
	};
}

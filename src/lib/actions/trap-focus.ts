export const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
  'select:not([disabled]):not([aria-hidden])',
  'textarea:not([disabled]):not([aria-hidden])',
  'button:not([disabled]):not([aria-hidden])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex^="-"])',
];

/**
 * @action trapFocus
 * 
 * A Svelte action to trap keyboard focus within a DOM node.
 * Useful for modals, dialogs, and overlays to ensure accessibility and usability.
 * 
 * Automatically focuses the first focusable element inside the node when mounted.
 * Prevents `Tab` and `Shift+Tab` from leaving the focusable area.
 * Restores focus to the previously focused element when destroyed.
 * 
 * @example
 * ```svelte
 * <div use:trapFocus>
 *   <button>First</button>
 *   <button>Second</button>
 * </div>
 * ```
 * 
 * @param node HTMLElement to trap focus within
 * @returns An object with a `destroy` method to clean up listeners and restore previous focus
 */
export function trapFocus(node: HTMLElement) {
	const previous = document.activeElement as HTMLElement | null;

	function focusable(): HTMLElement[] {        
		return Array.from(
			node.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])'
			)
        
		).filter(el => {
            // Skip if disabled
            if (el.hasAttribute('disabled')) return false;

            // Skip if hidden attribute is present
            if (el.hidden) return false;

            // Skip if any parent is aria-hidden
            let current: HTMLElement | null = el;
            while (current) {
                if (current.getAttribute('aria-hidden') === 'true') return false;
                current = current.parentElement;
            }

            // Skip if not visible via CSS
            const style = getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;

            return true;
        });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		const elements = focusable();
		if (elements.length === 0) return;

		const first = elements[0];
		const last = elements[elements.length - 1];
		const active = document.activeElement as HTMLElement;

		if (event.shiftKey) {
			if (active === first || !elements.includes(active)) {
				last.focus();
				event.preventDefault();
			}
		} else {
			if (active === last || !elements.includes(active)) {
				first.focus();
				event.preventDefault();
			}
		}
	}

	// Focus the first element and add keydown listener
	const elements = focusable();
	elements[0]?.focus();
	node.addEventListener('keydown', handleKeydown);

	return {
		destroy() {
			node.removeEventListener('keydown', handleKeydown);
			previous?.focus();
		}
	};
}

import { afterEach, describe, expect, it, vi } from 'vitest';
import { stopInteraction } from './stop-interaction.js';

function makeNode(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.appendChild(node);
	return node;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('stopInteraction', () => {
	it('stops propagation of click events by default', () => {
		const node = makeNode();
		stopInteraction(node);

		const parentHandler = vi.fn();
		document.body.addEventListener('click', parentHandler);

		node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(parentHandler).not.toHaveBeenCalled();

		document.body.removeEventListener('click', parentHandler);
	});

	it('does not prevent default by default', () => {
		const node = makeNode();
		stopInteraction(node);

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		node.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});

	it('calls preventDefault when prevent: true', () => {
		const node = makeNode();
		stopInteraction(node, { prevent: true });

		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		node.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});

	it('does not stop propagation when stop: false', () => {
		const node = makeNode();
		stopInteraction(node, { stop: false });

		const parentHandler = vi.fn();
		document.body.addEventListener('click', parentHandler);

		node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(parentHandler).toHaveBeenCalled();

		document.body.removeEventListener('click', parentHandler);
	});

	it('removes listeners on destroy', () => {
		const node = makeNode();
		const action = stopInteraction(node);

		const parentHandler = vi.fn();
		document.body.addEventListener('click', parentHandler);

		action.destroy();
		node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		expect(parentHandler).toHaveBeenCalled();

		document.body.removeEventListener('click', parentHandler);
	});

	it('handles custom events list', () => {
		const node = makeNode();
		stopInteraction(node, { events: ['mousedown'] });

		const clickHandler = vi.fn();
		const mousedownHandler = vi.fn();
		document.body.addEventListener('click', clickHandler);
		document.body.addEventListener('mousedown', mousedownHandler);

		node.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

		expect(clickHandler).toHaveBeenCalled();
		expect(mousedownHandler).not.toHaveBeenCalled();

		document.body.removeEventListener('click', clickHandler);
		document.body.removeEventListener('mousedown', mousedownHandler);
	});
});

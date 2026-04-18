import { afterEach, describe, expect, it, vi } from 'vitest';
import { onKeydown } from './on-keydown.js';

function makeNode(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.appendChild(node);
	return node;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('onKeydown', () => {
	it('calls callback when the matching key is pressed', () => {
		const callback = vi.fn();
		const node = makeNode();
		onKeydown(node, { key: 'Escape', callback });

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(callback).toHaveBeenCalledOnce();
	});

	it('does not call callback for a different key', () => {
		const callback = vi.fn();
		const node = makeNode();
		onKeydown(node, { key: 'Escape', callback });

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(callback).not.toHaveBeenCalled();
	});

	it('does not call callback when event.defaultPrevented is true', () => {
		const callback = vi.fn();
		const node = makeNode();
		onKeydown(node, { key: 'Escape', callback });

		const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
		event.preventDefault();
		node.dispatchEvent(event);
		expect(callback).not.toHaveBeenCalled();
	});

	it('removes listener on destroy', () => {
		const callback = vi.fn();
		const node = makeNode();
		const action = onKeydown(node, { key: 'Escape', callback });

		action?.destroy();
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(callback).not.toHaveBeenCalled();
	});

	it('responds to updated key after update()', () => {
		const callback = vi.fn();
		const node = makeNode();
		const action = onKeydown(node, { key: 'Escape', callback });

		action?.update({ key: 'Enter', callback });
		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expect(callback).not.toHaveBeenCalled();

		node.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
		expect(callback).toHaveBeenCalledOnce();
	});
});

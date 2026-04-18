import { afterEach, describe, expect, it } from 'vitest';
import { disableLocalScroll } from './disable-local-scroll.js';

function makeNode(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.appendChild(node);
	return node;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('disableLocalScroll', () => {
	it('sets overflowY to hidden when enabled', () => {
		const node = makeNode();
		disableLocalScroll(node, true);
		expect(node.style.overflowY).toBe('hidden');
	});

	it('does not lock scroll when enabled is false', () => {
		const node = makeNode();
		disableLocalScroll(node, false);
		expect(node.style.overflowY).toBe('');
	});

	it('restores original overflowY on destroy', () => {
		const node = makeNode();
		node.style.overflowY = 'scroll';
		const action = disableLocalScroll(node, true);
		expect(node.style.overflowY).toBe('hidden');
		action.destroy();
		expect(node.style.overflowY).toBe('scroll');
	});

	it('applies lock when update changes enabled from false to true', () => {
		const node = makeNode();
		const action = disableLocalScroll(node, false);
		expect(node.style.overflowY).toBe('');
		action.update(true);
		expect(node.style.overflowY).toBe('hidden');
	});

	it('removes lock when update changes enabled from true to false', () => {
		const node = makeNode();
		const action = disableLocalScroll(node, true);
		expect(node.style.overflowY).toBe('hidden');
		action.update(false);
		expect(node.style.overflowY).toBe('');
	});

	it('restores lock on destroy only when enabled', () => {
		const node = makeNode();
		const action = disableLocalScroll(node, false);
		action.destroy();
		expect(node.style.overflowY).toBe('');
	});
});

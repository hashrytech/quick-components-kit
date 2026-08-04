import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disableScroll } from './disable-scroll.js';

function makeNode(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.appendChild(node);
	return node;
}

function setWindowScroll(x: number, y: number) {
	Object.defineProperty(window, 'scrollX', { configurable: true, value: x });
	Object.defineProperty(window, 'scrollY', { configurable: true, value: y });
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
	setWindowScroll(0, 0);
});

afterEach(() => {
	vi.runOnlyPendingTimers();
	vi.useRealTimers();
	vi.restoreAllMocks();
	document.body.innerHTML = '';
	document.body.removeAttribute('style');
	document.documentElement.removeAttribute('style');
	setWindowScroll(0, 0);
});

describe('disableScroll', () => {
	it('restores the original page position and inline styles', () => {
		document.body.style.position = 'relative';
		document.body.style.width = '75%';
		document.body.style.top = '3px';
		document.body.style.left = '4px';
		document.documentElement.style.overflowY = 'auto';
		document.documentElement.style.scrollBehavior = 'smooth';
		setWindowScroll(12, 345);

		const action = disableScroll(makeNode());

		expect(document.body.style.position).toBe('fixed');
		expect(document.body.style.width).toBe('100%');
		expect(document.body.style.top).toBe('-345px');
		expect(document.body.style.left).toBe('-12px');

		action.destroy();

		expect(document.body.style.position).toBe('relative');
		expect(document.body.style.width).toBe('75%');
		expect(document.body.style.top).toBe('3px');
		expect(document.body.style.left).toBe('4px');
		expect(document.documentElement.style.overflowY).toBe('auto');
		expect(window.scrollTo).toHaveBeenCalledOnce();
		expect(window.scrollTo).toHaveBeenCalledWith(12, 345);

		vi.runOnlyPendingTimers();
		expect(document.documentElement.style.scrollBehavior).toBe('smooth');
	});

	it('keeps the original snapshot until the final nested lock closes', () => {
		setWindowScroll(0, 420);
		const outer = disableScroll(makeNode());

		// A fixed body may report a different window.scrollY. The nested drawer
		// must not replace the modal's original page snapshot with that value.
		setWindowScroll(0, 0);
		const inner = disableScroll(makeNode());

		outer.destroy();
		expect(document.body.style.position).toBe('fixed');
		expect(window.scrollTo).not.toHaveBeenCalled();

		inner.destroy();
		expect(document.body.style.position).toBe('');
		expect(window.scrollTo).toHaveBeenCalledOnce();
		expect(window.scrollTo).toHaveBeenCalledWith(0, 420);
	});

	it('does not unlock the page when the inner lock closes first', () => {
		setWindowScroll(0, 275);
		const outer = disableScroll(makeNode());
		const inner = disableScroll(makeNode());

		inner.destroy();
		expect(document.body.style.position).toBe('fixed');
		expect(window.scrollTo).not.toHaveBeenCalled();

		outer.destroy();
		expect(document.body.style.position).toBe('');
		expect(window.scrollTo).toHaveBeenCalledOnce();
		expect(window.scrollTo).toHaveBeenCalledWith(0, 275);
	});

	it('acquires and releases only when the reactive value changes', () => {
		setWindowScroll(0, 180);
		const action = disableScroll(makeNode(), false);
		expect(document.body.style.position).toBe('');

		action.update(true);
		action.update(true);
		expect(document.body.style.position).toBe('fixed');

		action.update(false);
		action.update(false);
		expect(document.body.style.position).toBe('');
		expect(window.scrollTo).toHaveBeenCalledOnce();

		action.destroy();
		expect(window.scrollTo).toHaveBeenCalledOnce();
	});

	it('cancels a pending style restoration before a new lock snapshot', () => {
		document.documentElement.style.scrollBehavior = 'smooth';
		setWindowScroll(0, 100);
		const first = disableScroll(makeNode());
		first.destroy();
		expect(document.documentElement.style.scrollBehavior).toBe('auto');

		setWindowScroll(0, 200);
		const second = disableScroll(makeNode());
		second.destroy();

		vi.runOnlyPendingTimers();
		expect(document.documentElement.style.scrollBehavior).toBe('smooth');
		expect(window.scrollTo).toHaveBeenNthCalledWith(1, 0, 100);
		expect(window.scrollTo).toHaveBeenNthCalledWith(2, 0, 200);
	});
});

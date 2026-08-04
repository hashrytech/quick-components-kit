import { afterEach, describe, expect, it, vi } from 'vitest';
import { trapFocus } from './trap-focus.js';

function mount(...elements: HTMLElement[]): HTMLDivElement {
	const node = document.createElement('div');
	elements.forEach((el) => node.appendChild(el));
	document.body.appendChild(node);
	return node;
}

function btn(label = 'btn', attrs: Record<string, string> = {}): HTMLButtonElement {
	const el = document.createElement('button');
	el.textContent = label;
	Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
	return el;
}

async function activate(node: HTMLElement) {
	const action = trapFocus(node);
	await Promise.resolve();
	return action;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('trapFocus', () => {
	it('focuses the first focusable element after mounting settles', async () => {
		const first = btn('First');
		const second = btn('Second');
		const node = mount(first, second);
		const focus = vi.spyOn(first, 'focus');
		await activate(node);
		expect(document.activeElement).toBe(first);
		expect(focus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it('skips disabled elements', async () => {
		const disabled = btn('Disabled', { disabled: '' });
		const enabled = btn('Enabled');
		const node = mount(disabled, enabled);
		await activate(node);
		expect(document.activeElement).toBe(enabled);
	});

	it('skips elements with hidden attribute', async () => {
		const hidden = btn('Hidden');
		hidden.hidden = true;
		const visible = btn('Visible');
		const node = mount(hidden, visible);
		await activate(node);
		expect(document.activeElement).toBe(visible);
	});

	it('skips elements inside aria-hidden parents', async () => {
		const wrapper = document.createElement('div');
		wrapper.setAttribute('aria-hidden', 'true');
		const hiddenBtn = btn('Hidden');
		wrapper.appendChild(hiddenBtn);
		const visible = btn('Visible');
		const node = mount(wrapper, visible);
		await activate(node);
		expect(document.activeElement).toBe(visible);
	});

	it('restores focus to previously focused element on destroy', async () => {
		const outside = btn('Outside');
		document.body.appendChild(outside);
		outside.focus();
		expect(document.activeElement).toBe(outside);

		const inside = btn('Inside');
		const node = mount(inside);
		const action = await activate(node);
		expect(document.activeElement).toBe(inside);

		const restoreFocus = vi.spyOn(outside, 'focus');
		action?.destroy();
		expect(document.activeElement).toBe(outside);
		expect(restoreFocus).toHaveBeenCalledWith({ preventScroll: true });
	});

	it('wraps Tab from last to first element', async () => {
		const first = btn('First');
		const last = btn('Last');
		const node = mount(first, last);
		await activate(node);

		last.focus();
		const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
		node.dispatchEvent(event);
		expect(document.activeElement).toBe(first);
	});

	it('wraps Shift+Tab from first to last element', async () => {
		const first = btn('First');
		const last = btn('Last');
		const node = mount(first, last);
		await activate(node);

		first.focus();
		const event = new KeyboardEvent('keydown', {
			key: 'Tab',
			shiftKey: true,
			bubbles: true,
			cancelable: true
		});
		node.dispatchEvent(event);
		expect(document.activeElement).toBe(last);
	});
});

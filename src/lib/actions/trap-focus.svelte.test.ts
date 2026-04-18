import { afterEach, describe, expect, it } from 'vitest';
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

afterEach(() => {
	document.body.innerHTML = '';
});

describe('trapFocus', () => {
	it('focuses the first focusable element on mount', () => {
		const first = btn('First');
		const second = btn('Second');
		const node = mount(first, second);
		trapFocus(node);
		expect(document.activeElement).toBe(first);
	});

	it('skips disabled elements', () => {
		const disabled = btn('Disabled', { disabled: '' });
		const enabled = btn('Enabled');
		const node = mount(disabled, enabled);
		trapFocus(node);
		expect(document.activeElement).toBe(enabled);
	});

	it('skips elements with hidden attribute', () => {
		const hidden = btn('Hidden');
		hidden.hidden = true;
		const visible = btn('Visible');
		const node = mount(hidden, visible);
		trapFocus(node);
		expect(document.activeElement).toBe(visible);
	});

	it('skips elements inside aria-hidden parents', () => {
		const wrapper = document.createElement('div');
		wrapper.setAttribute('aria-hidden', 'true');
		const hiddenBtn = btn('Hidden');
		wrapper.appendChild(hiddenBtn);
		const visible = btn('Visible');
		const node = mount(wrapper, visible);
		trapFocus(node);
		expect(document.activeElement).toBe(visible);
	});

	it('restores focus to previously focused element on destroy', () => {
		const outside = btn('Outside');
		document.body.appendChild(outside);
		outside.focus();
		expect(document.activeElement).toBe(outside);

		const inside = btn('Inside');
		const node = mount(inside);
		const action = trapFocus(node);
		expect(document.activeElement).toBe(inside);

		action?.destroy();
		expect(document.activeElement).toBe(outside);
	});

	it('wraps Tab from last to first element', () => {
		const first = btn('First');
		const last = btn('Last');
		const node = mount(first, last);
		trapFocus(node);

		last.focus();
		const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
		node.dispatchEvent(event);
		expect(document.activeElement).toBe(first);
	});

	it('wraps Shift+Tab from first to last element', () => {
		const first = btn('First');
		const last = btn('Last');
		const node = mount(first, last);
		trapFocus(node);

		first.focus();
		const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
		node.dispatchEvent(event);
		expect(document.activeElement).toBe(last);
	});
});

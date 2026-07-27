import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import TextAreaHarness from './TextAreaHarness.test.svelte';

function getBoundValue(): string {
	return screen.getByTestId('bound-value').textContent ?? '';
}

function getTextarea(): HTMLTextAreaElement {
	return document.querySelector('textarea') as HTMLTextAreaElement;
}

describe('TextArea', () => {
	// Regression: the <textarea> markup once contained literal indentation
	// whitespace, which became the element's initial DOM value. Svelte's
	// bind:value writes the DOM value back when the bound value is nullish,
	// so a null-bound model was silently mutated to "\t\t" on mount —
	// phantom-dirtying every consumer form that deep-compares its model.
	it('renders an empty textarea when the bound value is null', () => {
		render(TextAreaHarness, { value: null, inputProps: { id: 'field' } });

		expect(getTextarea().value).toBe('');
	});

	it('does not write into a null bound value on mount', () => {
		render(TextAreaHarness, { value: null, inputProps: { id: 'field' } });

		expect(getBoundValue()).toBe('<null>');
	});

	it('renders the bound value when set', () => {
		render(TextAreaHarness, { value: 'hello', inputProps: { id: 'field' } });

		expect(getTextarea().value).toBe('hello');
	});
});

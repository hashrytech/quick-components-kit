import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import TextInput from './TextInput.svelte';
import TextInputHarness from './TextInputHarness.test.svelte';

function getBoundValue(): string {
	return screen.getByTestId('bound-value').textContent ?? '';
}

function getLastCommittedInput(): string {
	return screen.getByTestId('last-input').textContent ?? '';
}

function getInput(): HTMLInputElement {
	return screen.getByTestId('field') as HTMLInputElement;
}

async function setInputValue(input: HTMLInputElement, value: string): Promise<void> {
	await fireEvent.input(input, { target: { value } });
}

async function setRawInputValue(input: HTMLInputElement, value: string): Promise<void> {
	Object.defineProperty(input, 'value', {
		configurable: true,
		writable: true,
		value
	});

	await fireEvent.input(input);
}

describe('TextInput', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.runOnlyPendingTimers();
		vi.useRealTimers();
	});

	it('debounces bind:value updates until the delay elapses', async () => {
		const onCommittedInput = vi.fn();

		render(TextInputHarness, {
			value: '',
			inputProps: { id: 'field', 'data-testid': 'field', debounceDelay: 300 },
			onCommittedInput
		});

		const input = getInput();
		await setInputValue(input, 'hello');

		expect(input.value).toBe('hello');
		expect(getBoundValue()).toBe('');
		expect(onCommittedInput).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(299);

		expect(getBoundValue()).toBe('');
		expect(onCommittedInput).not.toHaveBeenCalled();

		await vi.advanceTimersByTimeAsync(1);

		expect(getBoundValue()).toBe('hello');
		expect(getLastCommittedInput()).toBe('hello');
		expect(onCommittedInput).toHaveBeenCalledTimes(1);
		expect(onCommittedInput).toHaveBeenCalledWith('hello');
	});

	it('flushes a pending debounced value on blur', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: { id: 'field', 'data-testid': 'field', debounceDelay: 300 }
		});

		const input = getInput();
		await setInputValue(input, 'flush-me');

		expect(getBoundValue()).toBe('');

		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('flush-me');
		expect(getLastCommittedInput()).toBe('flush-me');
	});

	it('resyncs the displayed input when the external value changes', async () => {
		const view = render(TextInputHarness, {
			value: 'alpha',
			inputProps: { id: 'field', 'data-testid': 'field' }
		});

		expect(getInput().value).toBe('alpha');

		await view.rerender({
			value: 'bravo',
			inputProps: { id: 'field', 'data-testid': 'field' }
		});

		expect(getInput().value).toBe('bravo');
		expect(getBoundValue()).toBe('bravo');
	});

	it('forwards onchange and flushes pending input on change', async () => {
		const handleChange = vi.fn();

		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				debounceDelay: 300,
				onchange: handleChange
			}
		});

		const input = getInput();
		await setInputValue(input, 'committed-on-change');

		expect(getBoundValue()).toBe('');

		await fireEvent.change(input);

		expect(getBoundValue()).toBe('committed-on-change');
		expect(handleChange).toHaveBeenCalledTimes(1);
	});

	it('forwards native input attributes through rest props', () => {
		render(TextInput, {
			id: 'field',
			readonly: true,
			maxlength: 5,
			'aria-label': 'Name',
			'data-track': 'customer-name'
		});

		const input = screen.getByLabelText('Name');
		expect(input).toHaveAttribute('readonly');
		expect(input).toHaveAttribute('maxlength', '5');
		expect(input).toHaveAttribute('data-track', 'customer-name');
	});

	it('clamps min and max values including zero only on commit', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number',
				min: 0,
				max: 5
			}
		});

		const input = getInput();

		await setInputValue(input, '-1');
		expect(input.value).toBe('-1');
		expect(getBoundValue()).toBe('');

		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('0');

		await setInputValue(input, '10');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('5');
	});

	it('supports negative numeric ranges on commit', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number',
				min: -10,
				max: -1
			}
		});

		const input = getInput();

		await setInputValue(input, '-20');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('-10');

		await setInputValue(input, '0');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('-1');
	});

	it('preserves decimal formatting and enforces maxDecimalPlaces on commit', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number',
				maxDecimalPlaces: 2
			}
		});

		const input = getInput();

		await setInputValue(input, '1.20');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('1.20');

		await setInputValue(input, '1.234');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('1.23');
	});

	it('applies forcePositiveNumber only to number inputs', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'text',
				forcePositiveNumber: true
			}
		});

		const input = getInput();
		await setInputValue(input, '-2.5');
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('-2.5');
	});

	it('allows positive decimals and empty commits with forcePositiveNumber', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number',
				forcePositiveNumber: true
			}
		});

		const input = getInput();

		await setInputValue(input, '0.5');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('0.5');

		await setInputValue(input, '');
		await fireEvent.blur(input);
		expect(getBoundValue()).toBe('');
	});

	it('clamps to a positive minimum when forcePositiveNumber is combined with min', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number',
				forcePositiveNumber: true,
				min: 2
			}
		});

		const input = getInput();
		await setInputValue(input, '1.5');
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('2');
	});

	it('reverts invalid numeric commits to the last valid value', async () => {
		render(TextInputHarness, {
			value: '1.5',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number'
			}
		});

		const input = getInput();
		expect(getBoundValue()).toBe('1.5');

		await setRawInputValue(input, '-');
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('1.5');
		expect(input.value).toBe('1.5');
	});

	it('clears invalid numeric commits when there is no previous valid value', async () => {
		render(TextInputHarness, {
			value: '',
			inputProps: {
				id: 'field',
				'data-testid': 'field',
				type: 'number'
			}
		});

		const input = getInput();

		await setRawInputValue(input, '.');
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('');
		expect(input.value).toBe('');
	});

	it('exposes hidden errors to assistive technology', () => {
		render(TextInput, {
			id: 'field',
			error: 'A value is required.',
			showErrorText: false,
			'aria-describedby': 'external-hint'
		});

		const input = screen.getByRole('textbox');
		const error = screen.getByText('A value is required.');

		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'external-hint field-error');
		expect(error).toHaveAttribute('id', 'field-error');
		expect(error).toHaveClass('sr-only');
	});
});

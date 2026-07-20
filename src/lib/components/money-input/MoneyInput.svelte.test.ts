import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import MoneyInputHarness from './MoneyInputHarness.test.svelte';

function getBoundValue(): string {
	return screen.getByTestId('bound-value').textContent ?? '';
}

function getInput(): HTMLInputElement {
	return screen.getByTestId('field') as HTMLInputElement;
}

const baseProps = { id: 'field', 'data-testid': 'field', debounceDelay: 0 } as const;

describe('MoneyInput', () => {
	it('displays a loaded 4dp value as 2dp without any interaction', () => {
		render(MoneyInputHarness, { value: '1250.0000', inputProps: { ...baseProps } });

		expect(getInput().value).toBe('1250.00');
	});

	it('displays a 4dp value pushed in after a save refresh as 2dp', async () => {
		const { rerender } = render(MoneyInputHarness, { value: '10.00', inputProps: { ...baseProps } });

		await rerender({ value: '25.0000' });

		expect(getInput().value).toBe('25.00');
	});

	it('does not rewrite the bound model on load — only the display', () => {
		render(MoneyInputHarness, { value: '1250.0000', inputProps: { ...baseProps } });

		expect(getBoundValue()).toBe('1250.0000');
	});

	it('normalizes a loaded 4dp value to 2dp on blur', async () => {
		render(MoneyInputHarness, { value: '1250.0000', inputProps: { ...baseProps } });

		await fireEvent.blur(getInput());

		expect(getBoundValue()).toBe('1250.00');
	});

	it('rounds half-up sub-cent values on blur', async () => {
		render(MoneyInputHarness, { value: '3.0050', inputProps: { ...baseProps } });

		await fireEvent.blur(getInput());

		expect(getBoundValue()).toBe('3.01');
	});

	it('pads a typed short value to 2dp on blur', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps } });

		const input = getInput();
		await fireEvent.input(input, { target: { value: '12.5' } });
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('12.50');
	});

	it('leaves an empty value empty on blur', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps } });

		await fireEvent.blur(getInput());

		expect(getBoundValue()).toBe('');
	});

	it('keeps an entered zero (free items are legitimate)', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps } });

		const input = getInput();
		await fireEvent.input(input, { target: { value: '0' } });
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('0.00');
	});

	it('clamps typed negatives to the zero floor by default', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps } });

		const input = getInput();
		await fireEvent.input(input, { target: { value: '-5' } });
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('0.00');
	});

	it('clamps a loaded negative value when the field is blurred', async () => {
		render(MoneyInputHarness, { value: '-5.0000', inputProps: { ...baseProps } });

		await fireEvent.blur(getInput());

		expect(getBoundValue()).toBe('0.00');
	});

	it('does not let a negative min bypass the default non-negative policy', async () => {
		render(MoneyInputHarness, { value: '-5.0000', inputProps: { ...baseProps, min: -10 } });

		await fireEvent.blur(getInput());

		expect(getBoundValue()).toBe('0.00');
	});

	it('accepts negatives when allowNegative is set', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps, allowNegative: true } });

		const input = getInput();
		await fireEvent.input(input, { target: { value: '-5' } });
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('-5.00');
	});

	it('truncates typing past 2dp via the decimal limit', async () => {
		render(MoneyInputHarness, { value: '', inputProps: { ...baseProps } });

		const input = getInput();
		await fireEvent.input(input, { target: { value: '9.999' } });
		await fireEvent.blur(input);

		expect(getBoundValue()).toBe('9.99');
	});
});

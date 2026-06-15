import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { createRawSnippet, type Component } from 'svelte';
import ColumnPicker, { type ColumnPickerProps } from './ColumnPicker.svelte';
import type { ColumnDef, ColumnState } from './column.js';

type Row = { id: string };

// Cast the generic component to a concrete instantiation for typed props.
const ColumnPickerTyped = ColumnPicker as unknown as Component<ColumnPickerProps<Row>>;

const dummyCell = createRawSnippet<[Row]>(() => ({ render: () => `<span></span>` }));

const COLUMNS: ColumnDef<Row>[] = [
	{ id: 'order', label: 'Order', locked: true, sticky: true, cell: dummyCell },
	{ id: 'date', label: 'Date', cell: dummyCell },
	{ id: 'customer', label: 'Customer', cell: dummyCell }
];

describe('ColumnPicker', () => {
	it('renders a checkbox per column with the locked one disabled and checked', () => {
		render(ColumnPickerTyped, { props: { open: true, columns: COLUMNS } });
		const locked = screen.getByLabelText('Order') as HTMLInputElement;
		expect(locked).toBeDisabled();
		expect(locked).toBeChecked();
		expect(screen.getByLabelText('Date')).toBeEnabled();
		expect(screen.getByLabelText('Customer')).toBeEnabled();
	});

	it('toggling a column emits an updated state with that column hidden', async () => {
		const onchange = vi.fn();
		render(ColumnPickerTyped, { props: { open: true, columns: COLUMNS, onchange } });

		await fireEvent.click(screen.getByLabelText('Date'));

		expect(onchange).toHaveBeenCalled();
		const next = onchange.mock.lastCall?.[0] as ColumnState[];
		expect(next.find((c) => c.id === 'date')?.visible).toBe(false);
		// The locked column stays visible.
		expect(next.find((c) => c.id === 'order')?.visible).toBe(true);
	});

	it('reset emits the default column state and calls onreset', async () => {
		const onchange = vi.fn();
		const onreset = vi.fn();
		const columnState: ColumnState[] = [
			{ id: 'order', visible: true },
			{ id: 'customer', visible: true },
			{ id: 'date', visible: false }
		];
		render(ColumnPickerTyped, { props: { open: true, columns: COLUMNS, columnState, onchange, onreset } });

		await fireEvent.click(screen.getByText('Reset to default'));

		expect(onreset).toHaveBeenCalled();
		const next = onchange.mock.lastCall?.[0] as ColumnState[];
		// Default = registry order, all visible.
		expect(next.map((c) => c.id)).toEqual(['order', 'date', 'customer']);
		expect(next.every((c) => c.visible)).toBe(true);
	});
});

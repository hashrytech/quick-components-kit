import { describe, expect, it } from 'vitest';
import {
	defaultColumnState,
	resolveColumns,
	fullColumnState,
	type ColumnDef,
	type ColumnState
} from './column.js';

type Row = { id: string };

// The resolver only reads metadata (id/label/locked/defaultVisible), never the
// `cell` snippet, so a placeholder cell keeps the registry type-correct.
const dummyCell = (() => undefined) as unknown as ColumnDef<Row>['cell'];
function col(def: Partial<ColumnDef<Row>> & { id: string; label: string }): ColumnDef<Row> {
	return { cell: dummyCell, ...def };
}

const REGISTRY: ColumnDef<Row>[] = [
	col({ id: 'order', label: 'Order', locked: true, sticky: true }),
	col({ id: 'date', label: 'Date' }),
	col({ id: 'customer', label: 'Customer' }),
	col({ id: 'channel', label: 'Channel', defaultVisible: false })
];

describe('defaultColumnState', () => {
	it('is registry order; visible unless defaultVisible=false; locked always visible', () => {
		expect(defaultColumnState(REGISTRY)).toEqual([
			{ id: 'order', visible: true },
			{ id: 'date', visible: true },
			{ id: 'customer', visible: true },
			{ id: 'channel', visible: false }
		]);
	});
});

describe('resolveColumns', () => {
	it('returns default-visible columns in registry order when no state is given', () => {
		expect(resolveColumns(REGISTRY).map((c) => c.id)).toEqual(['order', 'date', 'customer']);
	});

	it('applies order and visibility from state (locked forced first)', () => {
		const state: ColumnState[] = [
			{ id: 'customer', visible: true },
			{ id: 'date', visible: false },
			{ id: 'order', visible: true },
			{ id: 'channel', visible: true }
		];
		expect(resolveColumns(REGISTRY, state).map((c) => c.id)).toEqual([
			'order',
			'customer',
			'channel'
		]);
	});

	it('keeps a locked column visible and first even if state hides/moves it', () => {
		const state: ColumnState[] = [
			{ id: 'date', visible: true },
			{ id: 'order', visible: false }
		];
		const ids = resolveColumns(REGISTRY, state).map((c) => c.id);
		expect(ids[0]).toBe('order');
	});

	it('ignores unknown ids in state', () => {
		const state: ColumnState[] = [
			{ id: 'ghost', visible: true },
			{ id: 'order', visible: true },
			{ id: 'date', visible: true },
			{ id: 'customer', visible: true },
			{ id: 'channel', visible: false }
		];
		expect(resolveColumns(REGISTRY, state).map((c) => c.id)).toEqual(['order', 'date', 'customer']);
	});

	it('appends registry columns missing from state using their own defaults', () => {
		const state: ColumnState[] = [
			{ id: 'order', visible: true },
			{ id: 'date', visible: true }
		];
		// customer (defaultVisible) appended; channel (defaultVisible=false) stays hidden.
		expect(resolveColumns(REGISTRY, state).map((c) => c.id)).toEqual(['order', 'date', 'customer']);
	});
});

describe('fullColumnState', () => {
	it('includes hidden columns, normalised, with locked first', () => {
		const state: ColumnState[] = [
			{ id: 'date', visible: false },
			{ id: 'channel', visible: true },
			{ id: 'order', visible: false }
		];
		const full = fullColumnState(REGISTRY, state);
		// order(locked) first; then state order date, channel; then missing customer appended.
		expect(full.map((c) => c.id)).toEqual(['order', 'date', 'channel', 'customer']);
		expect(full.find((c) => c.id === 'order')?.visible).toBe(true); // locked forced visible
		expect(full.find((c) => c.id === 'date')?.visible).toBe(false); // hidden preserved
		expect(full.find((c) => c.id === 'channel')?.visible).toBe(true);
		expect(full.find((c) => c.id === 'customer')?.visible).toBe(true); // appended default
	});

	it('falls back to defaultColumnState when no state is given', () => {
		expect(fullColumnState(REGISTRY)).toEqual(defaultColumnState(REGISTRY));
	});
});

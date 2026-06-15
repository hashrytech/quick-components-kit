import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { createRawSnippet, type Component } from 'svelte';
import Table, { type TableProps } from './Table.svelte';
import type { ColumnDef, ColumnState } from './column.js';

type Row = { id: string; name: string; email: string };

// Generic Svelte components resolve their type parameter to `unknown` through
// testing-library's `render`, so cast to the concrete instantiation for typed props.
const TableTyped = Table as unknown as Component<TableProps<Row>>;

function escapeHtml(s: string): string {
	return s.replace(
		/[&<>"]/g,
		(c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string
	);
}

function textCell(get: (r: Row) => string): ColumnDef<Row>['cell'] {
	return createRawSnippet<[Row]>((row) => ({
		render: () => `<span>${escapeHtml(get(row()))}</span>`
	}));
}

const COLUMNS: ColumnDef<Row>[] = [
	{ id: 'id', label: 'ID', locked: true, sticky: true, cell: textCell((r) => r.id) },
	{ id: 'name', label: 'Name', cell: textCell((r) => r.name) },
	{ id: 'email', label: 'Email', cell: textCell((r) => r.email) }
];

const ROWS: Row[] = [
	{ id: '1', name: 'Ann', email: 'ann@x.com' },
	{ id: '2', name: 'Bob', email: 'bob@x.com' }
];

const getKey = (r: Row) => r.id;

describe('Table (column-driven render)', () => {
	it('renders headers and cells from the column registry', () => {
		render(TableTyped, { props: { rows: ROWS, getKey, columns: COLUMNS } });
		expect(screen.getByText('ID')).toBeInTheDocument();
		expect(screen.getByText('Name')).toBeInTheDocument();
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Ann')).toBeInTheDocument();
		expect(screen.getByText('bob@x.com')).toBeInTheDocument();
	});

	it('hides a column whose state visibility is false', () => {
		const columnState: ColumnState[] = [
			{ id: 'id', visible: true },
			{ id: 'name', visible: true },
			{ id: 'email', visible: false }
		];
		render(TableTyped, { props: { rows: ROWS, getKey, columns: COLUMNS, columnState } });
		expect(screen.queryByText('Email')).not.toBeInTheDocument();
		expect(screen.queryByText('bob@x.com')).not.toBeInTheDocument();
		expect(screen.getByText('Name')).toBeInTheDocument();
	});

	it('reorders columns to match state order (locked stays first)', () => {
		const columnState: ColumnState[] = [
			{ id: 'email', visible: true },
			{ id: 'name', visible: true },
			{ id: 'id', visible: true }
		];
		render(TableTyped, { props: { rows: ROWS, getKey, columns: COLUMNS, columnState } });
		const headers = Array.from(document.querySelectorAll('thead th')).map((th) =>
			th.textContent?.trim()
		);
		// 'ID' is locked -> first; then the state order of the rest: Email, Name.
		expect(headers).toEqual(['ID', 'Email', 'Name']);
	});

	it('marks the locked column sticky at left-0 without multi-select', () => {
		render(TableTyped, { props: { rows: ROWS, getKey, columns: COLUMNS } });
		const idHeader = screen.getByText('ID').closest('th') as HTMLElement;
		expect(idHeader.className).toContain('sticky');
		expect(idHeader.className).toContain('left-0');
	});

	it('shifts the sticky locked column to left-12 when multi-select is enabled', () => {
		render(TableTyped, { props: { rows: ROWS, getKey, columns: COLUMNS, showMultiSelect: true } });
		const idHeader = screen.getByText('ID').closest('th') as HTMLElement;
		expect(idHeader.className).toContain('left-12');
	});
});

describe('Table (legacy snippet path, unchanged)', () => {
	it('still renders headings/tableRow snippets when no columns are provided', () => {
		const headings = createRawSnippet(() => ({ render: () => `<th>Legacy Head</th>` }));
		const tableRow = createRawSnippet<[Row]>((row) => ({
			render: () => `<td>${escapeHtml(row().name)}</td>`
		}));
		render(TableTyped, { props: { rows: ROWS, getKey, headings, tableRow } });
		expect(screen.getByText('Legacy Head')).toBeInTheDocument();
		expect(screen.getByText('Ann')).toBeInTheDocument();
	});
});

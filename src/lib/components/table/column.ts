import type { Snippet } from 'svelte';
import type { ClassNameValue } from 'tailwind-merge';

/**
 * Declarative definition of a single table column for the column-driven render
 * path of {@link Table}. A registry of these (`ColumnDef<T>[]`) is passed to
 * `<Table columns={...}>`; the table then builds its own `<thead>`/`<tbody>`
 * cells from the registry instead of consumer-authored `headings`/`tableRow`
 * snippets.
 *
 * @template T - Type of each row object.
 */
export interface ColumnDef<T> {
	/** Stable key. Persisted in saved-view config; used for ordering/visibility. */
	id: string;
	/** Header text (used when `headerCell` is not provided). */
	label: string;
	/** Tailwind width class, e.g. `"w-44"`. */
	width?: ClassNameValue;
	/** Horizontal alignment of the header and cells. Default `'left'`. */
	align?: 'left' | 'right' | 'center';
	/** Always visible and pinned first; cannot be hidden or reordered out of first. */
	locked?: boolean;
	/** Whether the column is part of the default view. Default `true`. */
	defaultVisible?: boolean;
	/** Render the column as a sticky (horizontally pinned) column. */
	sticky?: boolean;
	/** Extra classes for this column's `<th>`. */
	headerClass?: ClassNameValue;
	/** Extra classes for this column's `<td>`. */
	cellClass?: ClassNameValue;
	/** Rich cell renderer. Receives the row. */
	cell: Snippet<[T]>;
	/** Optional custom header content (overrides `label`). */
	headerCell?: Snippet;
}

/** Per-column visibility in display order. Persisted as part of a saved view. */
export interface ColumnState {
	id: string;
	visible: boolean;
}

/**
 * The default {@link ColumnState} for a registry: registry order, with each
 * column visible unless `defaultVisible === false`. Locked columns are always
 * visible.
 */
export function defaultColumnState<T>(columns: ColumnDef<T>[]): ColumnState[] {
	return columns.map((c) => ({
		id: c.id,
		visible: c.locked ? true : c.defaultVisible ?? true
	}));
}

/**
 * Resolve the ordered list of *visible* columns to render, given a registry and
 * an optional {@link ColumnState} array (order + visibility).
 *
 * Rules (so a view never breaks across registry changes):
 * - Unknown ids in `state` are ignored.
 * - Locked columns are always visible and forced to the front (in registry
 *   order), regardless of `state`.
 * - Registry columns absent from `state` are appended using their own
 *   `defaultVisible`/`locked` defaults.
 */
export function resolveColumns<T>(columns: ColumnDef<T>[], state?: ColumnState[]): ColumnDef<T>[] {
	const byId = new Map(columns.map((c) => [c.id, c]));
	const effective = state && state.length ? state : defaultColumnState(columns);

	const ordered: ColumnDef<T>[] = [];
	const seen = new Set<string>();

	for (const s of effective) {
		const col = byId.get(s.id);
		if (!col || seen.has(s.id)) continue; // unknown / duplicate ids ignored
		seen.add(s.id);
		const visible = col.locked ? true : s.visible;
		if (visible) ordered.push(col);
	}

	// Append registry columns missing from `state` using their own defaults.
	for (const col of columns) {
		if (seen.has(col.id)) continue;
		const visible = col.locked ? true : col.defaultVisible ?? true;
		if (visible) ordered.push(col);
	}

	// Locked columns are always first, in registry order.
	const locked = ordered.filter((c) => c.locked);
	const rest = ordered.filter((c) => !c.locked);
	return [...locked, ...rest];
}

/**
 * Like {@link resolveColumns} but returns *every* registry column (including
 * hidden ones) as a complete, normalised {@link ColumnState} list in display
 * order. This is what the column picker edits: it needs hidden columns present
 * so they can be toggled back on, and it persists as the saved view's column
 * config.
 *
 * Same normalisation rules as {@link resolveColumns}: unknown ids dropped,
 * locked columns forced visible and first (registry order), missing columns
 * appended with their defaults.
 */
export function fullColumnState<T>(columns: ColumnDef<T>[], state?: ColumnState[]): ColumnState[] {
	const byId = new Map(columns.map((c) => [c.id, c]));
	const effective = state && state.length ? state : defaultColumnState(columns);

	const out: ColumnState[] = [];
	const seen = new Set<string>();

	for (const s of effective) {
		const col = byId.get(s.id);
		if (!col || seen.has(s.id)) continue;
		seen.add(s.id);
		out.push({ id: s.id, visible: col.locked ? true : s.visible });
	}
	for (const col of columns) {
		if (seen.has(col.id)) continue;
		out.push({ id: col.id, visible: col.locked ? true : col.defaultVisible ?? true });
	}

	// Locked columns first, in registry order; the rest keep their resolved order.
	const lockedOrdered = columns
		.filter((c) => c.locked)
		.map((c) => out.find((s) => s.id === c.id))
		.filter((s): s is ColumnState => Boolean(s));
	const rest = out.filter((s) => !byId.get(s.id)?.locked);
	return [...lockedOrdered, ...rest];
}

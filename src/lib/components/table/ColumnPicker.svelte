<!--
@component ColumnPicker

A drawer-based picker for toggling and reordering the columns of a column-driven
`Table`. Visibility is edited with checkboxes; order is edited by dragging the
non-locked rows (built on the kit's `dragDropZone` action). Locked columns are
pinned at the top, always visible, and cannot be dragged. A footer action resets
to the registry default.

Bind `columnState` to the same array you pass to `<Table columnState={...}>` so
edits apply live.

## Props
- `columns: ColumnDef<T>[]` — the same registry passed to `Table`.
- `columnState?: ColumnState[]` — bindable order + visibility (edited in place).
- `open?: boolean` — bindable drawer visibility.
- `title?: string` — drawer heading. Default `"Columns"`.
- `position?`, `size?` — forwarded to `Drawer`. Default `"right"` / `"sm"`.
- `resetLabel?: string` — footer reset label.
- `onreset?: () => void` — called after a reset (in addition to resetting columns).
- `onchange?: (state: ColumnState[]) => void` — called on every edit.

## Example
```svelte
<ColumnPicker {columns} bind:columnState bind:open={showColumns} />
```
-->

<script lang="ts" module>
	import type { ColumnDef, ColumnState } from './column.js';

	export type ColumnPickerProps<T> = {
		columns: ColumnDef<T>[];
		columnState?: ColumnState[];
		open?: boolean;
		title?: string;
		position?: 'left' | 'right' | 'top' | 'bottom';
		size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		resetLabel?: string;
		onreset?: () => void;
		onchange?: (state: ColumnState[]) => void;
	};
</script>

<script lang="ts" generics="T">
	import { flip } from 'svelte/animate';
	import { Drawer } from '$lib/components/drawer/index.js';
	import { Checkbox } from '$lib/components/checkbox/index.js';
	import { dragDropZone, itemId, type DragDropEvent } from '$lib/modules/drag-drop/index.js';
	import { fullColumnState, defaultColumnState } from './column.js';

	let {
		columns,
		columnState = $bindable(),
		open = $bindable(false),
		title = 'Columns',
		position = 'right',
		size = 'sm',
		resetLabel = 'Reset to default',
		onreset,
		onchange
	}: ColumnPickerProps<T> = $props();

	const colById = $derived(new Map(columns.map((c) => [c.id, c])));
	const items = $derived(fullColumnState(columns, columnState));
	const lockedItems = $derived(items.filter((i) => colById.get(i.id)?.locked));
	const draggableItems = $derived(items.filter((i) => !colById.get(i.id)?.locked));

	// Local working copy that the drag-drop action owns DURING a drag. It must not
	// be a $derived that round-trips through `columnState`, or each `consider`
	// event would re-derive the list and reorder the DOM out from under the
	// action's pointer math (jumpy/incorrect drops). It re-syncs from props
	// whenever `columnState` changes outside a drag.
	let draggable = $state<ColumnState[]>([]);
	$effect(() => {
		draggable = draggableItems;
	});

	function label(id: string): string {
		return colById.get(id)?.label ?? id;
	}

	function emit(next: ColumnState[]) {
		columnState = next;
		onchange?.(next);
	}

	function toggle(id: string) {
		emit(items.map((i) => (i.id === id ? { ...i, visible: !i.visible } : i)));
	}

	// During the drag, only update the local preview list. Commit to
	// `columnState` once, on finalize. Locked columns always stay pinned first.
	function onConsiderDrag(e: CustomEvent<DragDropEvent<ColumnState>>) {
		draggable = e.detail.items;
	}
	function onFinalizeDrag(e: CustomEvent<DragDropEvent<ColumnState>>) {
		draggable = e.detail.items;
		emit([...lockedItems, ...e.detail.items]);
	}

	function reset() {
		emit(defaultColumnState(columns));
		onreset?.();
	}
</script>

<Drawer bind:open {position} {size} ariaLabel={title}>
	{#snippet header()}
		<div class="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
			<h3 class="text-sm font-semibold text-neutral-800">{title}</h3>
			<button
				type="button"
				aria-label="Close"
				class="text-neutral-500 hover:text-neutral-800"
				onclick={() => (open = false)}>✕</button
			>
		</div>
	{/snippet}

	<div class="flex flex-col gap-1 p-3">
		{#each lockedItems as item (item.id)}
			<div class="flex items-center gap-2 rounded px-2 py-1.5 text-neutral-500">
				<span class="w-3 text-center text-xs" aria-hidden="true" title="Always shown">🔒</span>
				<Checkbox id={`col-${item.id}`} checked={true} disabled labelText={label(item.id)} />
			</div>
		{/each}

		<ul
			class="flex flex-col gap-1"
			use:dragDropZone={{ items: draggable, getItemId: itemId('id'), axis: 'y' }}
			onconsider={onConsiderDrag}
			onfinalize={onFinalizeDrag}
		>
			{#each draggable as item (item.id)}
				<li
					animate:flip={{ duration: 160 }}
					class="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-neutral-100"
				>
					<span
						data-dnd-handle
						aria-label="Reorder column"
						class="cursor-grab touch-none select-none text-neutral-400"
					>
						<svg width="12" height="16" viewBox="0 0 12 16" fill="currentColor" aria-hidden="true">
							<circle cx="3" cy="3" r="1.4" /><circle cx="9" cy="3" r="1.4" />
							<circle cx="3" cy="8" r="1.4" /><circle cx="9" cy="8" r="1.4" />
							<circle cx="3" cy="13" r="1.4" /><circle cx="9" cy="13" r="1.4" />
						</svg>
					</span>
					<Checkbox
						id={`col-${item.id}`}
						checked={item.visible}
						onchange={() => toggle(item.id)}
						labelText={label(item.id)}
					/>
				</li>
			{/each}
		</ul>
	</div>

	{#snippet footer()}
		<div class="flex justify-end border-t border-neutral-200 px-4 py-3">
			<button
				type="button"
				class="text-sm font-medium text-primary-input-accent hover:underline"
				onclick={reset}>{resetLabel}</button
			>
		</div>
	{/snippet}
</Drawer>

<!--
@component MasterChecklist

A multi-select checklist with a master "select all" header row and a live count badge. The
master row checks/clears every (enabled) option at once and shows an indeterminate state when
only some are selected. Behaves like a group of checkboxes — `value` reflects the selected
values as an array.

The rows stack full-width, so the control is mobile responsive by default. The wrapper is
`role="group"` wired to the label via `aria-labelledby`; the master row and each option row are
`role="checkbox"` buttons (the master uses `aria-checked="mixed"` for the indeterminate state;
native Space / Enter toggles them). When `name` is set, a hidden input is emitted per selected value.

## Props

- `id?: string` — Links the label and generates the error/hidden-field ids. Defaults to `name`; one of the two must be provided.
- `name?: string` — Form field name; defaults to `id`. When provided, one hidden input per selected value is emitted.
- `labelText?: string` — Label text rendered above the list in a `<p>`.
- `label?: Snippet` — Custom label snippet (overrides `labelText`).
- `value?: (string | number)[]` — Bindable array of selected values. Default: `[]`.
- `options: MasterChecklistOption[]` — Rows to render (see type below).
- `size?: 'sm' | 'md' | 'lg'` — Padding, icon, and text size. Default: `'md'`.
- `masterLabel?: string` — Text for the master header row. Default: `'Select all'`.
- `showCount?: boolean` — Show the count badge in the master row. Default: `true`.
- `selectedIcon?: string` — Iconify class for the checkbox tick. Default: `'icon-[ion--checkmark]'`.
- `indeterminateIcon?: string` — Iconify class for the master's indeterminate mark. Default: `'icon-[ion--remove]'`.
- `disabled?: boolean` — Disables the whole group.
- `error?: string` — Error message shown below; also sets `aria-invalid`/`aria-describedby`.
- `onchange?: (value: (string | number)[]) => void` — Called with the new selected-values array.
- `rootClass?: ClassNameValue` — Extra classes on the outer wrapper.
- `labelClass?: ClassNameValue` — Extra classes on the `<p>` label.
- `containerClass?: ClassNameValue` — Extra classes on the bordered list (`role="group"`).
- `masterRowClass?: ClassNameValue` — Extra classes on the master header row.
- `rowClass?: ClassNameValue` — Extra classes on **every** option row (both states).
- `selectedClass?: ClassNameValue` — Extra classes on selected option rows only.
- `checkboxClass?: ClassNameValue` — Extra classes on the checkbox box of every row.
- `iconWrapperClass?: ClassNameValue` — Extra classes on the row icon badge.
- `iconClass?: ClassNameValue` — Extra classes on every row icon (merged before each option's `iconClass`).
- `titleClass?: ClassNameValue` — Extra classes on the row title.
- `descriptionClass?: ClassNameValue` — Extra classes on the row description.
- `countBadgeClass?: ClassNameValue` — Extra classes on the count badge.
- `errorClass?: ClassNameValue` — Extra classes on the error message.

## MasterChecklistOption type

```ts
type MasterChecklistOption = {
  value: string | number;     // selected value
  title: string;              // row heading
  description?: string;       // one-line explanation
  icon?: string;              // Iconify class string, e.g. 'icon-[ion--bag-handle]'
  iconClass?: ClassNameValue; // extra classes for this row's icon
  disabled?: boolean;         // disables this individual row
};
```

## Example

```svelte
<script>
  import { MasterChecklist } from '$lib/components/master-checklist';
  let orderTypes = $state([]);
</script>

<MasterChecklist
  id="order-types"
  labelText="Order types"
  masterLabel="All order types"
  bind:value={orderTypes}
  options={[
    { value: 'pickup', title: 'Pickup', icon: 'icon-[ion--bag-handle-outline]' },
    { value: 'delivery', title: 'Delivery', icon: 'icon-[ion--bicycle-outline]' },
    { value: 'dining', title: 'Dining', icon: 'icon-[ion--restaurant-outline]' },
  ]}
/>
```
-->

<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { ClassNameValue } from 'tailwind-merge';

	export type MasterChecklistSize = 'sm' | 'md' | 'lg';

	export type MasterChecklistOption = {
		value: string | number;
		title: string;
		description?: string;
		icon?: string;
		iconClass?: ClassNameValue;
		disabled?: boolean;
	};

	export type MasterChecklistProps = {
		id?: string;
		name?: string;
		labelText?: string;
		label?: Snippet;
		value?: (string | number)[];
		options: MasterChecklistOption[];
		size?: MasterChecklistSize;
		masterLabel?: string;
		showCount?: boolean;
		selectedIcon?: string;
		indeterminateIcon?: string;
		disabled?: boolean;
		error?: string;
		onchange?: (value: (string | number)[]) => void;
		rootClass?: ClassNameValue;
		labelClass?: ClassNameValue;
		containerClass?: ClassNameValue;
		masterRowClass?: ClassNameValue;
		rowClass?: ClassNameValue;
		selectedClass?: ClassNameValue;
		checkboxClass?: ClassNameValue;
		iconWrapperClass?: ClassNameValue;
		iconClass?: ClassNameValue;
		titleClass?: ClassNameValue;
		descriptionClass?: ClassNameValue;
		countBadgeClass?: ClassNameValue;
		errorClass?: ClassNameValue;
		'aria-label'?: string;
	};

	type SizeTokens = {
		row: string;
		badge: string;
		icon: string;
		title: string;
		description: string;
		box: string;
		boxIcon: string;
	};

	const sizeMap: Record<MasterChecklistSize, SizeTokens> = {
		sm: {
			row: 'gap-2.5 px-3 py-2',
			badge: 'size-8',
			icon: 'size-4',
			title: 'text-sm',
			description: 'text-xs',
			box: 'size-4',
			boxIcon: 'size-3'
		},
		md: {
			row: 'gap-3 px-4 py-2.5',
			badge: 'size-9',
			icon: 'size-5',
			title: 'text-sm',
			description: 'text-xs',
			box: 'size-5',
			boxIcon: 'size-3.5'
		},
		lg: {
			row: 'gap-3 px-5 py-3',
			badge: 'size-10',
			icon: 'size-6',
			title: 'text-base',
			description: 'text-sm',
			box: 'size-6',
			boxIcon: 'size-4'
		}
	};
</script>

<script lang="ts">
	import { twMerge } from 'tailwind-merge';
	import { Icon } from '$lib/components/icon/index.js';

	let {
		id,
		name,
		labelText = '',
		label,
		value = $bindable([]),
		options,
		size = 'md',
		masterLabel = 'Select all',
		showCount = true,
		selectedIcon = 'icon-[ion--checkmark]',
		indeterminateIcon = 'icon-[ion--remove]',
		disabled = false,
		error,
		onchange,
		rootClass,
		labelClass,
		containerClass,
		masterRowClass,
		rowClass,
		selectedClass,
		checkboxClass,
		iconWrapperClass,
		iconClass,
		titleClass,
		descriptionClass,
		countBadgeClass,
		errorClass,
		'aria-label': ariaLabel
	}: MasterChecklistProps = $props();

	const effectiveId = id ?? name;

	if (import.meta.env.DEV && !effectiveId) {
		console.error('[MasterChecklist] Either `id` or `name` must be provided.');
	}

	const tokens = $derived(sizeMap[size]);

	const enabledValues = $derived(options.filter((o) => !o.disabled).map((o) => o.value));
	const selectedCount = $derived((value ?? []).length);
	const allSelected = $derived(
		enabledValues.length > 0 && enabledValues.every((v) => (value ?? []).includes(v))
	);
	const noneSelected = $derived(selectedCount === 0);
	// 'mixed' drives the master checkbox's indeterminate visual + aria state.
	const masterState = $derived(allSelected ? true : noneSelected ? false : 'mixed');
	const countText = $derived(
		allSelected ? 'All' : noneSelected ? 'None' : `${selectedCount} selected`
	);

	function isSelected(option: MasterChecklistOption): boolean {
		return (value ?? []).includes(option.value);
	}

	function commit(set: Set<string | number>) {
		value = options.filter((o) => set.has(o.value)).map((o) => o.value);
		onchange?.(value);
	}

	function toggle(option: MasterChecklistOption) {
		if (disabled || option.disabled) return;
		const set = new Set(value ?? []);
		set.has(option.value) ? set.delete(option.value) : set.add(option.value);
		commit(set);
	}

	function toggleMaster() {
		if (disabled) return;
		// All selected → clear everything; otherwise select every enabled option.
		commit(allSelected ? new Set() : new Set(enabledValues));
	}
</script>

<div class={twMerge('flex flex-col gap-1', rootClass)}>
	{#if label}
		{@render label()}
	{:else if labelText}
		<p
			id={effectiveId ? `${effectiveId}-label` : undefined}
			class={twMerge('text-primary-label-text ml-1 w-fit text-sm font-medium', labelClass)}
		>
			{labelText}
		</p>
	{/if}

	<div
		role="group"
		aria-label={ariaLabel}
		aria-labelledby={!ariaLabel && labelText && effectiveId ? `${effectiveId}-label` : undefined}
		aria-describedby={error && effectiveId ? `${effectiveId}-error` : undefined}
		class={twMerge(
			'rounded-primary border-primary-input-border overflow-hidden border',
			containerClass
		)}
	>
		<!-- Master "select all" row -->
		<button
			type="button"
			role="checkbox"
			aria-checked={masterState}
			disabled={disabled || enabledValues.length === 0 || undefined}
			onclick={toggleMaster}
			class={twMerge(
				'focus-visible:ring-primary-focus border-primary-input-border flex w-full items-center border-b bg-neutral-50 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
				tokens.row,
				disabled ? 'cursor-default opacity-60' : 'cursor-pointer',
				masterRowClass
			)}
		>
			<span
				class={twMerge(
					'flex shrink-0 items-center justify-center rounded border transition-colors',
					tokens.box,
					allSelected || masterState === 'mixed'
						? 'border-primary-input-accent bg-primary-input-accent text-white'
						: 'border-primary-input-border bg-white',
					checkboxClass
				)}
			>
				{#if allSelected}
					<Icon icon={selectedIcon} class={tokens.boxIcon} />
				{:else if masterState === 'mixed'}
					<Icon icon={indeterminateIcon} class={tokens.boxIcon} />
				{/if}
			</span>
			<span class={twMerge('flex-1 font-semibold text-neutral-800', tokens.title)}>
				{masterLabel}
			</span>
			{#if showCount}
				<span
					class={twMerge(
						'shrink-0 rounded-full bg-neutral-200 px-2.5 py-0.5 text-xs font-medium text-neutral-600',
						countBadgeClass
					)}
				>
					{countText}
				</span>
			{/if}
		</button>

		<!-- Option rows -->
		<div class="divide-primary-table-border divide-y">
			{#each options as option (option.value)}
				{@const selected = isSelected(option)}
				{@const isDisabled = disabled || option.disabled}
				<button
					type="button"
					role="checkbox"
					aria-checked={selected}
					disabled={isDisabled || undefined}
					onclick={() => toggle(option)}
					class={twMerge(
						'focus-visible:ring-primary-focus flex w-full items-center text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset',
						tokens.row,
						selected ? 'bg-primary-50/40' : 'bg-white hover:bg-neutral-50',
						isDisabled ? 'cursor-default opacity-60' : 'cursor-pointer',
						rowClass,
						selected ? selectedClass : undefined
					)}
				>
					<span
						class={twMerge(
							'flex shrink-0 items-center justify-center rounded border transition-colors',
							tokens.box,
							selected
								? 'border-primary-input-accent bg-primary-input-accent text-white'
								: 'border-primary-input-border bg-white',
							checkboxClass
						)}
					>
						{#if selected}
							<Icon icon={selectedIcon} class={tokens.boxIcon} />
						{/if}
					</span>

					{#if option.icon}
						<span
							class={twMerge(
								'flex shrink-0 items-center justify-center rounded-lg',
								tokens.badge,
								selected
									? 'bg-primary-100 text-primary-input-accent'
									: 'bg-neutral-100 text-neutral-500',
								iconWrapperClass
							)}
						>
							<Icon icon={option.icon} class={twMerge(tokens.icon, iconClass, option.iconClass)} />
						</span>
					{/if}

					<span class="flex min-w-0 flex-1 flex-col">
						<span
							class={twMerge(
								'font-medium',
								tokens.title,
								selected ? 'text-neutral-900' : 'text-neutral-700',
								titleClass
							)}
						>
							{option.title}
						</span>
						{#if option.description}
							<span class={twMerge('text-neutral-500', tokens.description, descriptionClass)}>
								{option.description}
							</span>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	</div>

	{#if name}
		{#each value ?? [] as v (v)}
			<input type="hidden" {name} value={v} />
		{/each}
	{/if}

	{#if error}
		<p
			id={effectiveId ? `${effectiveId}-error` : undefined}
			class={twMerge('rounded-primary mt-0.5 bg-red-100/30 px-2 text-sm text-red-500', errorClass)}
		>
			{error}
		</p>
	{/if}
</div>
